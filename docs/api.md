# TapCard API

Base URL: `http://localhost:4000` (dev) · all routes are prefixed `/api`.

## Conventions

- **Auth** uses two httpOnly cookies: `tc_access` (JWT, 15 min) and `tc_refresh` (opaque, 30 days).
  Only the SHA-256 hash of a refresh token is stored. Refresh tokens are single-use: exchanging
  one revokes it and issues a replacement.
- **Errors** always return `{ "error": { "code", "message", "fields?" } }`. Validation failures
  return `400` with a `fields` map keyed by form field.
- **Money** is integer paise everywhere. Never floats.
- **Public identifiers** are slugs and references (`royal-spice`, `TC-20488`). Database UUIDs are
  never exposed in a public URL.
- **Rate limits**: 300 req/min general, 10 per 15 min on auth endpoints (successful requests are
  not counted), 60/min on public analytics events.

## Auth — `/api/auth`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | – | Create account, start a session, send verification |
| POST | `/login` | – | Sign in |
| POST | `/refresh` | cookie | Rotate the session |
| POST | `/logout` | – | Revoke the current session |
| GET | `/me` | ✓ | Current user + whether a business exists |
| POST | `/verify-email` | – | Consume a verification token |
| POST | `/resend-verification` | ✓ | Issue a fresh verification token |
| POST | `/forgot-password` | – | Always `{ok:true}` so accounts cannot be probed |
| POST | `/reset-password` | – | Consume a reset token; revokes all sessions |
| PATCH | `/account` | ✓ | Update name/email (email change clears verification) |
| POST | `/change-password` | ✓ | Requires the current password; revokes all sessions |

## Card — `/api/cards` (all require auth)

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | The signed-in user's card, fully populated |
| POST | `/` | Create business + card together, optionally from a template |
| PATCH | `/business` | Update business fields |
| PATCH | `/` | Update appearance, booking, menu URL, branding |
| GET | `/slug-available?slug=` | Check a link before saving |
| PATCH | `/slug` | Change the public link |
| PUT | `/sections` | Reorder and show/hide in one call |
| POST | `/publish` · `/unpublish` | Publishing requires a phone or WhatsApp number |
| PUT | `/social` `/links` `/services` `/menu` `/hours` | Replace a whole collection |

## Public — `/api/public` (no auth)

| Method | Path | Purpose |
|---|---|---|
| GET | `/cards/:slug` | A published card. `Cache-Control: max-age=30, stale-while-revalidate=300` |
| POST | `/events` | Record an analytics event. Unknown slugs return `202` so they cannot be probed |
| GET | `/qr/:slug.png` · `.svg` | QR generated from the URL. `?fg=&bg=&margin=&size=`, cached 24h |
| GET | `/templates` · `/plans` · `/products` · `/settings` | Catalogue, cached 5 min |

## Analytics — `/api/analytics` (auth)

`GET /summary?range=1|7|30|90` returns `metrics`, `deltas` (vs the preceding period),
`series.scans`, `series.clicks`, `devices`, `sources` and `topActions`, shaped for the
dashboard charts.

### What analytics stores

Event type, coarse device class, optional source and label, and a **daily-rotating salted hash**
of IP + user-agent used only to approximate unique visitors. No IP, no raw user-agent, no
cross-site identifier, and nothing that survives the day it was created.

## Still to come

Phase 3 adds `/api/orders`, `/api/payments/{create-order,verify}`, `/api/webhooks/razorpay`,
`/api/subscriptions` and `/api/coupons/validate`. Phase 4 adds `/api/admin/*`.
