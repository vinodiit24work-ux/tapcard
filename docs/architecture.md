# TapCard — Architecture

> One QR. Your Entire Business.

## Phase 0 findings

- `~/tapcard` did not exist; no repository, backend or database was present. `~/job-finder` is an unrelated project and is untouched.
- Environment: Node 20, npm 10. No local PostgreSQL or Docker (needed from Phase 2; use Supabase/Neon or install Postgres).
- Decision: greenfield build with the preferred stack.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS v4, React Router 7, Lucide |
| Forms / validation | React Hook Form, Zod |
| Charts / QR / DnD | Recharts, `qrcode`, `@dnd-kit` |
| Backend (Phase 2) | Node, Express, TypeScript |
| DB (Phase 2) | PostgreSQL + Prisma |
| Auth (Phase 2) | httpOnly cookie sessions/JWT, Argon2/bcrypt |
| Payments (Phase 3) | Razorpay (server-created orders, server-verified signatures + webhooks) |
| Storage | Supabase Storage / S3-compatible |

## Folder structure

```
src/
  components/ui/      design-system primitives (Button, Input, Modal, Toast, ...)
  components/card/    DigitalCardPreview, PhoneFrame, QR helpers
  components/charts/  chart wrappers
  layouts/            Marketing, Auth, Dashboard, Admin shells
  pages/              route components (marketing, auth, dashboard, admin, store, public)
  features/           card-builder, onboarding (feature-scoped components)
  hooks/              usePersistentState, useMockQuery, ...
  lib/                cn, format, theme helpers
  services/           data-access layer (mock in Phase 1 -> HTTP client in Phase 3)
  data/               mock data (Phase 1 only)
  types/              shared domain types
  utils/
server/               (Phase 2) controllers, routes, middleware, services, validators, utils
prisma/               (Phase 2) schema.prisma, seed.ts
docs/                 architecture.md, api.md, deployment.md
```

`src/services/*` is the seam between UI and data. Phase 1 implements it over mock data + localStorage; Phase 3 swaps the implementations for HTTP calls without touching pages.

## Routes (frontend)

**Marketing:** `/`, `/features`, `/pricing`, `/templates`, `/demo`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/refund-policy`
**Auth:** `/login`, `/register`, `/forgot-password`, `/verify-email`, `/onboarding`
**Dashboard:** `/dashboard`, `/dashboard/card-builder`, `/dashboard/qr`, `/dashboard/analytics`, `/dashboard/leads`, `/dashboard/orders`, `/dashboard/store`, `/dashboard/billing`, `/dashboard/settings`, `/dashboard/support`
**Commerce:** `/cart`, `/checkout`
**Admin:** `/admin`, `/admin/{users,businesses,orders,products,templates,plans,coupons,payments,support,settings}`
**Public card:** `/:slug` (e.g. `/royal-spice`) — QR and NFC both resolve to this URL.

Mock UI states: append `?state=loading|empty|error` to any dashboard/admin page to preview that state.

## Database plan (Phase 2)

UUID primary keys, FKs, indexes on lookup columns, `createdAt/updatedAt`, soft delete (`deletedAt`) on User/Business/DigitalCard. Public URLs use the unique `slug`, never DB IDs.

Models: User, Business, DigitalCard, CardSection, Template, QRCode, AnalyticsEvent, Product, Order, OrderItem, Payment, Subscription, Plan, Coupon, Address, SocialLink, CustomLink, Notification, SupportTicket, AuditLog.

Key indexes: `DigitalCard.slug` (unique), `AnalyticsEvent(cardId, type, createdAt)`, `Order(userId, status)`, `Payment.razorpayPaymentId` (unique, idempotency), `Coupon.code` (unique).

## API plan (Phase 2/3)

`/api/auth/*` · `/api/business` · `/api/cards` · `/api/public/cards/:slug` · `/api/qr/:slug` · `/api/analytics/events` (public, rate-limited) & `/api/analytics/summary` · `/api/templates` · `/api/products` · `/api/cart`/`/api/orders` · `/api/payments/{create-order,verify}` · `/api/webhooks/razorpay` (raw body, signature-verified) · `/api/subscriptions` · `/api/coupons/validate` · `/api/admin/*` (ADMIN role, audit-logged).

Prices, plans and shipping/tax rates are database-driven; never hardcoded.

## Phase plan

| Phase | Scope | Gate |
|---|---|---|
| 1 | Full UI on mock data | `npm run build`, visual QA at 360–1440px |
| 2 | Express + Prisma + auth + cards + QR + analytics; connect frontend | typecheck, tests, migration, seed, e2e journey |
| 3 | Razorpay orders, subscriptions, coupons, shipping | test-mode: success/fail/cancel/duplicate/invalid webhook |
| 4 | Real admin + audit log | admin permissions tests |
| 5–10 | Security, performance, SEO, email, tests, deployment | per spec |

---

## Phase 1 — completed (UI/UX on mock data)

All screens are built and interactive against mock data in `src/data/*`, with state in
`src/store/*` (auth, card, cart) persisted to `localStorage`. No backend, no payments.

### Quality gate results

| Check | Result |
|---|---|
| `npx tsc --noEmit` (strict) | clean |
| `npm run build` | passes |
| Responsive sweep — 42 routes × 360/390/768/1024/1440px | 0 horizontal overflow |
| Interaction journey — 34 assertions | 34/34 pass |
| Console / runtime errors | none |

### Bundle (gzipped)

Public card and marketing pages load `index` (116 kB) + `format` (19 kB) only.
Recharts (119 kB), the card builder, admin and store are lazy chunks behind auth.

### Defects found and fixed during QA

1. **Production-only React crash** — `useEffect(() => setOpen(false), [deps])`; the minifier
   turned the concise body into a non-function cleanup (`destroy_ is not a function`).
   All effects now use explicit block bodies.
2. **Layout overflow** — `Button` carried `shrink-0`, so three `full` buttons in a flex row
   each claimed 100% width. Removed from the base class.
3. **Invalid markup** — template cards wrapped `DigitalCardPreview` (which contains its own
   links and buttons) in a `<button>`. Replaced with an absolutely positioned overlay trigger.
4. **Template thumbnails** — `origin-top` instead of `origin-top-left` on the scaled preview.
5. **Tables in grids** — missing `min-w-0` let `min-w-[520px]` tables stretch their parent.
6. **Card visual hierarchy** — every action rendered in the primary colour. Secondary actions
   now use a surface treatment with a tinted icon so one action leads.
7. **`QRImage`** was fixed-size; now fluid (`size` acts as a max) so it fits narrow screens.
8. **Section order** — `profile` could sort below other sections; it is now always first.

### Phase 1 conventions that Phase 3 depends on

- `src/services/` is the seam for data access. Pages never read mock data directly except
  through `src/data/*` imports that will be swapped for HTTP calls.
- `useMockQuery` models `loading | error | empty | success` and honours `?state=` for QA.
  It is replaced by real query hooks, keeping the same state contract so UI is untouched.
- All prices, tax and shipping live in `src/data/commerce.ts` (`commerceConfig`), never
  inline — Phase 3 moves this to the database with the same shape.

### Known Phase 1 limitations (intentional)

- Auth, payments and analytics events are mocked; analytics clicks log to the console.
- Image uploads are data URLs held in `localStorage`, not object storage.
- Gallery tiles are styled placeholders pending storage in Phase 2.

## Environment note for Phase 2

This machine has Node 20 and npm 10 but **no local PostgreSQL and no Docker**. Phase 2 needs
a database before the API can run: either install Postgres locally, or use a hosted instance
(Supabase / Neon) and set `DATABASE_URL`.

---

## Phase 2 — backend + database (API complete, frontend not yet connected)

### Database

Supabase project `tapcard`, region `ap-south-1` (Mumbai), PostgreSQL 17.
27 tables, 50 indexes, full foreign keys, UUID primary keys, soft deletes on
User/Business/DigitalCard, `createdAt`/`updatedAt` everywhere.

**Row Level Security is enabled with no policies on all 27 tables.** This is deliberate.
Supabase exposes an auto-generated REST API to the `anon` role; deny-all RLS closes it.
The API reaches Postgres as a dedicated role and enforces access control itself.

### Database access

The API connects as **`tapcard_app`**, a purpose-made role — not the project owner:

- `LOGIN`, `BYPASSRLS`, **not** superuser, **no** `CREATEROLE`, **no** `CREATEDB`
- `SELECT/INSERT/UPDATE/DELETE` on `public` only, plus matching default privileges
- Cannot create, drop or alter tables; schema changes go through migrations as `postgres`
- Its password was generated locally and installed as a pre-computed SCRAM-SHA-256
  verifier, so the plaintext never travelled over any API

Connections use the Supavisor pooler at `aws-0-ap-south-1.pooler.supabase.com`
(6543 transaction pooling for the app, 5432 session mode for migrations).

### Security decisions

| Concern | Decision |
|---|---|
| Passwords | Argon2id, 19 MiB memory cost |
| Sessions | httpOnly cookies; access JWT 15 min, refresh opaque 30 days |
| Refresh tokens | Only the SHA-256 hash is stored; **single-use** — exchanging one revokes it |
| Account enumeration | Login returns one message for both causes; forgot-password always returns `{ok:true}` |
| Password change / reset | Revokes every existing session |
| Rate limiting | 300/min general, 10 per 15 min on auth (successes not counted), 60/min on public events |
| Input validation | Zod on every body, query and param; failures return a per-field map |
| Public URLs | Slugs and references only — UUIDs are never exposed |
| Slug safety | Reserved words blocked, format enforced, uniqueness at the database level |
| Analytics privacy | Event type, coarse device class, optional source. A **daily-rotating salted hash** approximates unique visitors; no IP, no user-agent, nothing that outlives the day |
| Event endpoint | Unknown slugs return `202`, so the endpoint cannot be used to discover cards |
| Errors | One handler; internals never reach the client in production |

### Verification

| Check | Result |
|---|---|
| Prisma schema validate + migrate | applied to Supabase |
| `prisma/seed.ts` | runs clean, idempotent |
| Server typecheck (strict) | clean |
| API integration suite (47 assertions) | 47/47 |
| End-to-end user journey (27 assertions) | 27/27 |

The journey suite covers: register → duplicate rejected → verify email → create business from a
template → publish blocked without a contact → add details → publish → public card live → QR
generated → events recorded → analytics reflect them → another account cannot see or take the
first account's card → refresh rotates → the old refresh token is rejected.

### Defects found and fixed in Phase 2

1. `DigitalCard.templateId` was `TEXT` referencing a `UUID` primary key — Postgres would have
   rejected the foreign key. Caught by reading the generated SQL before applying it.
2. Prisma 7 moved connection URLs out of `schema.prisma` into `prisma.config.ts` and requires a
   driver adapter; the datasource block and client were reworked.
3. `prisma/seed.ts` did not load `.env`, so it silently tried `localhost`.
4. Express 5 removed inline route regex, so `/qr/:slug.:ext(png|svg)` crashed the server at
   boot. The extension is now parsed in the handler.

### Next

Item 31 of the brief — replace the frontend mock data with these endpoints through
`src/services/`, keeping the Phase 1 UI untouched. Then Phase 3 (Razorpay).

---

## Product correction — QR/NFC opens the review experience

The product is a **customizable digital + physical review card**. A QR scan or NFC tap opens
the business's review page directly, never a general business profile.

Nothing was rebuilt. Auth, the dashboard shell, the UI system, QR generation, the store,
payments scaffolding, admin, routing and the database all carried over.

### The journey

```
owner: create -> customize -> add suggestions -> publish
                                   |
                    permanent URL  /review/{slug}
                                   |
                        QR code  ·  NFC tag
                                   |
customer: scan/tap -> rate -> pick a suggestion or write their own -> submit
                                   |
                       thank you -> continue to Google
```

### What changed

| Area | Change |
|---|---|
| Database | `Review`, `SuggestedReview`; review copy on `DigitalCard`; 5 new event types; rating check constraint |
| QR / NFC | Both now encode `/review/{slug}` instead of the contact-card URL |
| New route | `/review/:slug` — the QR destination |
| New component | `ReviewExperience` — rating, suggestions, own review, thank-you, Google CTA |
| Dashboard | **Suggested Reviews** (add/edit/delete/reorder/enable) and **Reviews**; navigation reordered around the review flow |
| Builder | "Review Page" is now the first pane; the live preview shows the real customer component |
| Analytics | Review funnel: page views, reviews submitted, Google clicks, conversion rate |
| Marketing | "One Tap. One Scan. One Easy Review."; the demo runs the real review experience |
| Auth | Connected to the API — real sessions, real errors, guards wait for the session check |

The contact card (`/:slug`) is kept as a secondary page for businesses that link to it.

### Deliberate product decisions

**No review gating.** The Google call to action is shown to every customer regardless of
rating. Routing only happy customers to Google, and diverting unhappy ones to a private form,
violates Google's policies and misleads the people reading those reviews. If gating is ever
wanted it should be a conscious decision, not a default buried in a component.

**A Google click is a click.** We record `googleClickedAt` and a `GOOGLE_REVIEW_CLICK` event.
We cannot see what happens on Google, so a click is never counted as a completed Google review,
and the dashboard says so in plain words.

**The customer keeps control of their words.** Suggestions load into an editable box; the
customer can change or clear the text. Editing keeps the link to the suggestion it started
from (`edited: true`) so the owner sees the provenance honestly. Nothing is ever submitted
without an explicit tap, and no rating is preselected.

**Tenant isolation.** No handler accepts a `businessId` from the client. Every owner route
resolves the business from the authenticated session, and writes are scoped by both id and
`businessId`, so guessing another business's UUID achieves nothing.

### Verification

| Suite | Result |
|---|---|
| Final scenario from the brief (owner -> customer -> owner, incl. isolation) | **19/19** |
| Customer review flow in a browser | **12/12** |
| API integration suite | **47/47** |
| Typecheck (frontend + server, strict) | clean |
| Production build | passes |
| Responsive sweep, public routes at 360-1440px | no overflow |

The scenario proves the permanent URL is dynamic: the owner edits a suggestion, the same QR is
scanned again, and the edited text appears — with no reprint.

### Defects found and fixed during this change

1. **Editing a suggestion silently dropped its provenance.** Typing cleared the selection, so a
   customer who started from a suggestion and adjusted it was recorded as having written from
   scratch. The link is now kept and marked `edited`.
2. **Owner previews could show stale content** for up to the 15-second public cache window.
   Owner-side fetches now bypass the cache; customers still get the cached, faster response.
3. **React style warning** from mixing the `border` shorthand with `borderColor` across
   rerenders, which can drop styles. Replaced with longhand properties.
