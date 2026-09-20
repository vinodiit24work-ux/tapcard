#!/usr/bin/env bash
# Deploys TapCard (website + API) to Vercel and wires up its environment.
#
#   npx vercel login     # once, in your own terminal
#   ./scripts/deploy-vercel.sh
#
# Safe to re-run: existing variables are replaced, not duplicated.
set -euo pipefail
cd "$(dirname "$0")/.."

command -v npx >/dev/null || { echo "npx is required"; exit 1; }
[ -f .env ] || { echo "No .env found — copy .env.example and fill in DATABASE_URL first."; exit 1; }

# shellcheck disable=SC1091
set -a; source .env; set +a

: "${DATABASE_URL:?DATABASE_URL missing from .env}"
: "${DIRECT_URL:?DIRECT_URL missing from .env}"

if ! npx vercel whoami >/dev/null 2>&1; then
  echo "Not logged in. Run:  npx vercel login"
  exit 1
fi

say() { printf '\n\033[1m%s\033[0m\n' "$1"; }

say "1/4  Linking the project"
npx vercel link --yes >/dev/null

# Production secrets are generated here, never copied from the development .env.
JWT_ACCESS_PROD=$(node -e "console.log(require('crypto').randomBytes(36).toString('base64url'))")
JWT_REFRESH_PROD=$(node -e "console.log(require('crypto').randomBytes(36).toString('base64url'))")
SALT_PROD=$(node -e "console.log(require('crypto').randomBytes(36).toString('base64url'))")

put() { # name value
  npx vercel env rm "$1" production --yes >/dev/null 2>&1 || true
  printf '%s' "$2" | npx vercel env add "$1" production >/dev/null
  echo "   set $1"
}

say "2/4  First deploy (to discover the URL)"
URL=$(npx vercel deploy --prod --yes 2>/dev/null | tail -1)
HOST=${URL#https://}
echo "   $URL"

say "3/4  Setting environment variables"
put NODE_ENV production
put DATABASE_URL "$DATABASE_URL"
put DIRECT_URL "$DIRECT_URL"
put JWT_ACCESS_SECRET "$JWT_ACCESS_PROD"
put JWT_REFRESH_SECRET "$JWT_REFRESH_PROD"
put ANALYTICS_SALT "$SALT_PROD"
put APP_URL "$URL"
put API_URL "$URL"
put PUBLIC_ORIGIN "$URL"
# Same origin in production, so the client needs no absolute API URL.
put VITE_API_URL ""
put VITE_PUBLIC_ORIGIN "$URL"

say "4/4  Rebuilding so the frontend picks up those values"
FINAL=$(npx vercel deploy --prod --yes 2>/dev/null | tail -1)

say "Done"
echo "   Website      $FINAL"
echo "   Review page  $FINAL/review/royal-spice"
echo "   Health       $FINAL/api/health"
echo
echo "   QR codes now encode $FINAL/review/{slug}"
echo "   Set a custom domain before printing anything — the URL is permanent once printed."
