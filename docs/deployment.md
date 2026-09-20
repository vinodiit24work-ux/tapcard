# Deploying TapCard

The database is already live on Supabase. Two things still need hosting:

| Part | Host | What it serves |
|---|---|---|
| Website | Vercel | The React app, including `/review/:slug` |
| API | Render (or Railway) | `/api/*`, QR generation, review submissions |

## Why the URL matters

Every printed QR code encodes `PUBLIC_ORIGIN + /review/{slug}`. Once cards are printed that
URL can never change, so set the final domain **before** anyone prints anything.

## 1. Deploy the API

```bash
npm i -g @render/cli    # or use the Render dashboard: New → Blueprint
```

`render.yaml` is already in the repo. In the dashboard, point Render at this repository and it
will pick the blueprint up. Set these in **Environment** (the three secrets are generated for
you by the blueprint):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase pooled connection, port 6543 |
| `DIRECT_URL` | Supabase session connection, port 5432 |
| `APP_URL` | your Vercel URL, e.g. `https://tapcard.vercel.app` |
| `API_URL` | your Render URL, e.g. `https://tapcard-api.onrender.com` |
| `PUBLIC_ORIGIN` | the URL customers see, normally the same as `APP_URL` |

Check it came up: `curl https://<your-api>/api/health` → `{"ok":true,...}`.

> Render's free tier sleeps after inactivity, so the first request can take ~30 seconds.
> A review page that takes 30 seconds to open is a review you did not get — use a paid
> instance, or Railway, before promoting real QR codes.

## 2. Deploy the website

```bash
npx vercel            # first run links the project
npx vercel --prod
```

Set in **Vercel → Settings → Environment Variables**, then redeploy:

| Variable | Value |
|---|---|
| `VITE_API_URL` | your Render API URL |
| `VITE_PUBLIC_ORIGIN` | your Vercel URL (or custom domain) |

Both are baked in at build time, so they must be set *before* the build that goes live.

## 3. Point them at each other

Set `APP_URL` and `PUBLIC_ORIGIN` on Render to the Vercel URL, then redeploy the API so CORS
accepts the browser origin. Cookies are `SameSite=None; Secure` in production, so both sides
must be HTTPS — which Vercel and Render provide by default.

## 4. Custom domain

Add the domain in Vercel, point the DNS records it shows, then update `VITE_PUBLIC_ORIGIN`
(website) and `PUBLIC_ORIGIN` + `APP_URL` (API), and redeploy both. Do this before printing.

## 5. Check it end to end

```bash
curl https://<api>/api/health
curl https://<api>/api/public/review/royal-spice
open  https://<website>/review/royal-spice
```

Then scan a QR from `/dashboard/qr` with a real phone on mobile data — not Wi-Fi — so you are
testing the public URL rather than your network.

## Local network testing (no deploy)

To open the site on your phone over Wi-Fi:

```bash
IP=$(ipconfig getifaddr en0)
# .env
PUBLIC_ORIGIN="http://$IP:5173"
VITE_API_URL="http://$IP:4000"
VITE_PUBLIC_ORIGIN="http://$IP:5173"
EXTRA_ORIGINS="http://$IP:5173"

npm run dev:api
npx vite --host 0.0.0.0
```

Your phone must be on the same Wi-Fi, and your Mac must stay awake.

## Before real customers

- [ ] Rotate `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ANALYTICS_SALT` for production
- [ ] Set the final domain and verify a printed QR resolves
- [ ] Razorpay live keys and webhook URL (Phase 3)
- [ ] An email provider, so verification and resets actually send (Phase 8)
- [ ] Confirm `tapcard_app` is the database role in use — not the project owner
