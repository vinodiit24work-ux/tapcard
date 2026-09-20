import { Router } from 'express'
import QRCode from 'qrcode'
import { prisma } from '../lib/prisma.js'
import { env } from '../lib/env.js'
import { ApiError, handler } from '../utils/http.js'
import { validate } from '../middleware/validate.js'
import { eventLimiter } from '../middleware/rateLimit.js'
import { cardInclude, serialiseCard } from '../services/card.service.js'
import { reviewCardInclude, serialiseReviewCard } from '../services/review.service.js'
import { deviceFrom, visitorKey } from '../services/analytics.service.js'
import { eventSchema } from '../validators/analytics.validators.js'
import { submitReviewSchema } from '../validators/review.validators.js'
import { createRequestSchema, customerApprovalSchema } from '../validators/request.validators.js'
import { cardLink, moveStatus, requestReference, reviewLink } from '../services/request.service.js'

export const publicRouter = Router()

/** The public card. No auth, cached briefly, and only ever a published card. */
publicRouter.get(
  '/cards/:slug',
  handler(async (req, res) => {
    const card = await prisma.digitalCard.findFirst({
      where: { slug: String(req.params.slug).toLowerCase(), status: 'PUBLISHED', deletedAt: null, business: { deletedAt: null } },
      include: cardInclude,
    })
    if (!card) throw ApiError.notFound('No published card exists at that link.')
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
    res.json({ card: serialiseCard(card) })
  }),
)

/** Records an event. Accepts only what the card itself can legitimately report. */
publicRouter.post(
  '/events',
  eventLimiter,
  validate(eventSchema),
  handler(async (req, res) => {
    const { slug, type, source, label } = req.body as { slug: string; type: string; source?: string; label?: string }
    const card = await prisma.digitalCard.findFirst({
      where: { slug: slug.toLowerCase(), status: 'PUBLISHED', deletedAt: null },
      select: { id: true },
    })
    // Never reveal whether an unknown slug exists.
    if (!card) return res.status(202).json({ ok: true })

    const ua = req.headers['user-agent']
    await prisma.analyticsEvent.create({
      data: {
        cardId: card.id,
        type: type as never,
        device: deviceFrom(ua),
        source: source ?? null,
        label: label ?? null,
        visitorKey: visitorKey(req.ip, ua, card.id),
      },
    })
    if (type === 'QR_SCAN') {
      await prisma.qRCode.updateMany({ where: { cardId: card.id }, data: { scanCount: { increment: 1 } } })
    }
    res.status(202).json({ ok: true })
  }),
)

/** QR image for a slug, generated from the URL — the card's data is never in the code. */
publicRouter.get(
  '/qr/:file',
  handler(async (req, res) => {
    // Express 5 has no inline route regex, so the extension is parsed here.
    const match = /^([a-z0-9-]{1,40})\.(png|svg)$/i.exec(String(req.params.file))
    if (!match) throw ApiError.notFound('Expected a path like /api/public/qr/royal-spice.png')
    const slug = match[1]
    const ext = match[2].toLowerCase() as 'png' | 'svg'
    const card = await prisma.digitalCard.findFirst({ where: { slug: slug.toLowerCase(), deletedAt: null }, select: { id: true } })
    if (!card) throw ApiError.notFound('No card at that link.')

    // QR and NFC both point at the permanent review URL, never at Google directly:
    // the owner can change suggestions, branding or destination without reprinting.
    const url = `${env.PUBLIC_ORIGIN.replace(/\/$/, '')}/review/${slug}`
    const dark = typeof req.query.fg === 'string' && /^#[0-9a-f]{6}$/i.test(req.query.fg) ? req.query.fg : '#0f1729'
    const light = typeof req.query.bg === 'string' && /^#[0-9a-f]{6}$/i.test(req.query.bg) ? req.query.bg : '#ffffff'
    const margin = Math.min(8, Math.max(0, Number(req.query.margin ?? 2)))
    const width = Math.min(2048, Math.max(128, Number(req.query.size ?? 1024)))

    res.set('Cache-Control', 'public, max-age=86400')
    if (ext === 'svg') {
      res.type('image/svg+xml').send(await QRCode.toString(url, { type: 'svg', margin, color: { dark, light } }))
      return
    }
    res.type('image/png').send(await QRCode.toBuffer(url, { width, margin, color: { dark, light } }))
  }),
)

/* ------------------------------------------------------------------ review --
 * The destination for every QR code and NFC tag. No account, no sign-in: a
 * customer scans and is one tap from leaving a review.
 * -------------------------------------------------------------------------- */

publicRouter.get(
  '/review/:slug',
  handler(async (req, res) => {
    const card = await prisma.digitalCard.findFirst({
      where: { slug: String(req.params.slug).toLowerCase(), status: 'PUBLISHED', deletedAt: null, business: { deletedAt: null } },
      include: reviewCardInclude,
    })
    if (!card) throw ApiError.notFound('No review card is published at that link.')
    // Deliberately uncached. An owner who edits a suggestion expects the very next scan
    // to show it, and a CDN stale window would silently serve the old copy for minutes.
    // This is one indexed query against a database in the same region as the function.
    res.set('Cache-Control', 'no-store')
    res.json({ card: serialiseReviewCard(card) })
  }),
)

publicRouter.post(
  '/reviews',
  eventLimiter,
  validate(submitReviewSchema),
  handler(async (req, res) => {
    const { slug, rating, text, customerName, suggestionId } = req.body as {
      slug: string; rating: number; text?: string; customerName?: string; suggestionId?: string
    }

    const card = await prisma.digitalCard.findFirst({
      where: { slug: slug.toLowerCase(), status: 'PUBLISHED', deletedAt: null },
      select: { id: true, businessId: true, business: { select: { reviewUrl: true } } },
    })
    if (!card) throw ApiError.notFound('No review card is published at that link.')

    // A suggestion must belong to this business, or it is ignored rather than trusted.
    let suggestion = null
    if (suggestionId) {
      suggestion = await prisma.suggestedReview.findFirst({
        where: { id: suggestionId, businessId: card.businessId },
        select: { id: true, text: true },
      })
    }

    const device = deviceFrom(req.headers['user-agent'])
    const review = await prisma.review.create({
      data: {
        businessId: card.businessId,
        cardId: card.id,
        rating,
        text: text ?? suggestion?.text ?? null,
        customerName: customerName || null,
        suggestionId: suggestion?.id ?? null,
        edited: Boolean(suggestion && text && text !== suggestion.text),
        device,
      },
      select: { id: true, rating: true, createdAt: true },
    })

    if (suggestion) {
      await prisma.suggestedReview.update({ where: { id: suggestion.id }, data: { useCount: { increment: 1 } } })
    }

    await prisma.analyticsEvent.create({
      data: {
        cardId: card.id,
        type: 'REVIEW_SUBMITTED',
        device,
        label: String(rating),
        visitorKey: visitorKey(req.ip, req.headers['user-agent'], card.id),
      },
    })

    res.status(201).json({
      review,
      // Returned so the thank-you screen can offer Google. It is never opened for the customer.
      googleReviewUrl: card.business.reviewUrl || '',
    })
  }),
)

/**
 * Records that a customer chose to continue to Google. This is a *click*, not a completed
 * Google review — we cannot verify what happens on Google, and never claim otherwise.
 */
publicRouter.post(
  '/reviews/:id/google-click',
  eventLimiter,
  handler(async (req, res) => {
    const review = await prisma.review.findUnique({
      where: { id: String(req.params.id) },
      select: { id: true, cardId: true, googleClickedAt: true },
    })
    if (!review) return res.status(202).json({ ok: true })
    if (!review.googleClickedAt) {
      await prisma.review.update({ where: { id: review.id }, data: { googleClickedAt: new Date() } })
    }
    if (review.cardId) {
      await prisma.analyticsEvent.create({
        data: {
          cardId: review.cardId,
          type: 'GOOGLE_REVIEW_CLICK',
          device: deviceFrom(req.headers['user-agent']),
          visitorKey: visitorKey(req.ip, req.headers['user-agent'], review.cardId),
        },
      })
    }
    res.status(202).json({ ok: true })
  }),
)

/* ----------------------------------------------------------------- intake --
 * "Get My TapCard": a short public form. The team builds the card and comes back
 * to the customer, so this asks only for what is needed to make that call.
 * -------------------------------------------------------------------------- */

publicRouter.post(
  '/requests',
  eventLimiter,
  validate(createRequestSchema),
  handler(async (req, res) => {
    const body = req.body as {
      businessName: string; contactName: string; phone: string; whatsapp: string; email: string
      category: string; city: string; address: string; wantsPhysical: boolean; wantsDigital: boolean; notes?: string
    }
    const request = await prisma.cardRequest.create({
      data: { ...body, reference: requestReference() },
      select: { id: true, reference: true, businessName: true, createdAt: true },
    })
    await prisma.cardRequestEvent.create({
      data: { requestId: request.id, status: 'NEW_REQUEST', note: 'Submitted from the website' },
    })
    res.status(201).json({ request: { reference: request.reference, businessName: request.businessName } })
  }),
)

/* --------------------------------------------------------------- approval --
 * The customer never signs in. The token in their link grants exactly one
 * thing: seeing this card and approving it or asking for changes.
 * -------------------------------------------------------------------------- */

publicRouter.get(
  '/approve/:token',
  handler(async (req, res) => {
    const card = await prisma.digitalCard.findUnique({
      where: { approvalToken: String(req.params.token) },
      include: reviewCardInclude,
    })
    if (!card) throw ApiError.notFound('That approval link is not valid. Please ask for a new one.')
    res.set('Cache-Control', 'no-store')
    res.json({
      card: serialiseReviewCard(card),
      approval: { status: card.approvalStatus, sentAt: card.approvalSentAt, approvedAt: card.approvedAt, note: card.revisionNote },
      links: { review: reviewLink(card.slug), card: cardLink(card.slug) },
    })
  }),
)

publicRouter.post(
  '/approve',
  eventLimiter,
  validate(customerApprovalSchema),
  handler(async (req, res) => {
    const { token, decision, note } = req.body as { token: string; decision: 'approve' | 'changes'; note?: string }
    const card = await prisma.digitalCard.findUnique({
      where: { approvalToken: token },
      select: { id: true, businessId: true, approvalStatus: true },
    })
    if (!card) throw ApiError.notFound('That approval link is not valid.')
    if (card.approvalStatus === 'APPROVED') return res.json({ ok: true, status: 'APPROVED' })

    const approved = decision === 'approve'
    await prisma.digitalCard.update({
      where: { id: card.id },
      data: {
        approvalStatus: approved ? 'APPROVED' : 'CHANGES_REQUESTED',
        approvedAt: approved ? new Date() : null,
        revisionNote: approved ? null : (note ?? 'The customer asked for changes.'),
      },
    })

    const request = await prisma.cardRequest.findUnique({ where: { businessId: card.businessId }, select: { id: true } })
    if (request) {
      await moveStatus(request.id, approved ? 'APPROVED' : 'REVISION_REQUESTED', undefined, note ?? (approved ? 'Customer approved the card' : undefined))
    }

    res.json({ ok: true, status: approved ? 'APPROVED' : 'CHANGES_REQUESTED' })
  }),
)

publicRouter.get(
  '/templates',
  handler(async (_req, res) => {
    const templates = await prisma.template.findMany({ where: { published: true }, orderBy: [{ popular: 'desc' }, { useCount: 'desc' }] })
    res.set('Cache-Control', 'public, max-age=300')
    res.json({ templates })
  }),
)

publicRouter.get(
  '/plans',
  handler(async (_req, res) => {
    const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { monthlyPaise: 'asc' } })
    res.set('Cache-Control', 'public, max-age=300')
    res.json({ plans })
  }),
)

publicRouter.get(
  '/products',
  handler(async (_req, res) => {
    const products = await prisma.product.findMany({ where: { active: true }, orderBy: { position: 'asc' } })
    res.set('Cache-Control', 'public, max-age=300')
    res.json({ products })
  }),
)

publicRouter.get(
  '/settings',
  handler(async (_req, res) => {
    const rows = await prisma.setting.findMany({ where: { key: { in: ['commerce'] } } })
    res.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) })
  }),
)
