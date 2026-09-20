# TapCard

**One QR. Your Entire Business.**

A digital business card platform for Indian businesses — a mobile-first card at your own
URL, opened by QR or NFC, with analytics and printed card ordering.

## Status

**Phase 1 complete:** the full product UI runs on mock data. Backend (Phase 2) and Razorpay
payments (Phase 3) are next. See [docs/architecture.md](docs/architecture.md).

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run typecheck
```

## Try these routes

| Route | What it is |
|---|---|
| `/` | Marketing homepage |
| `/demo` | Interactive card demo — switch business types |
| `/templates` | 10 templates with live previews |
| `/royal-spice` | A published public card (also `/glow-studio`, `/ironforge-fitness`) |
| `/register` | Sign up, then `/onboarding` for the 9-step wizard |
| `/dashboard` | Dashboard home |
| `/dashboard/card-builder` | The card builder — edit, reorder, restyle |
| `/dashboard/qr` | QR customization and download |
| `/admin` | Admin panel |

**Mock login:** any email and password works. Use an email starting with `admin@` to reach
the admin panel. Sign-in state lives in `localStorage`.

**Previewing UI states:** append `?state=loading`, `?state=empty` or `?state=error` to any
dashboard or admin route.

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · React Router 7 · Recharts ·
dnd-kit · qrcode · Zod + React Hook Form

Planned: Express + Prisma + PostgreSQL (Phase 2), Razorpay (Phase 3).
