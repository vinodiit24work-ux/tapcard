import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ApiError, handler } from '../utils/http.js'
import { validate } from '../middleware/validate.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { slugify } from '../utils/slug.js'
import { assertSlugAvailable, cardInclude, defaultSections, serialiseCard } from '../services/card.service.js'
import {
  approvalLink, approvalToken, cardLink, handoverMessage, moveStatus, readiness,
  requestInclude, reviewLink,
} from '../services/request.service.js'
import {
  adminSuggestionsSchema, buildCardSchema, connectGoogleSchema, sendCardSchema,
  updateRequestSchema, updateStatusSchema,
} from '../validators/request.validators.js'
import { updateBusinessSchema, updateCardSchema } from '../validators/card.validators.js'
import type { Prisma } from '../generated/prisma/client.js'
import { emails, emailConfigured } from '../services/email.service.js'
import type { SectionKind } from '../generated/prisma/enums.js'

export const requestRouter = Router()
requestRouter.use(requireAuth, requireAdmin)

const DEFAULT_APPEARANCE = {
  themeId: 'indigo', primary: '#5b4bff', background: '#f6f7fb', text: '#0f1729', mode: 'light',
  buttonStyle: 'solid', radius: 'md', font: 'jakarta', cardStyle: 'elevated', avatarShape: 'rounded',
  cover: 'aurora', gallery: [],
}

const shape = (r: Awaited<ReturnType<typeof prisma.cardRequest.findFirstOrThrow<{ include: typeof requestInclude }>>>) => ({
  ...r,
  readiness: readiness(r),
  links: r.business?.card
    ? { review: reviewLink(r.business.card.slug), card: cardLink(r.business.card.slug) }
    : null,
})

requestRouter.get(
  '/',
  handler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const requests = await prisma.cardRequest.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status: status as never } : {}),
        ...(q
          ? { OR: [
              { businessName: { contains: q, mode: 'insensitive' as const } },
              { contactName: { contains: q, mode: 'insensitive' as const } },
              { phone: { contains: q } },
              { reference: { contains: q, mode: 'insensitive' as const } },
            ] }
          : {}),
      },
      include: requestInclude,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    const counts = await prisma.cardRequest.groupBy({ by: ['status'], _count: { _all: true } })
    res.json({
      requests: requests.map(shape),
      counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
    })
  }),
)

requestRouter.get(
  '/:id',
  handler(async (req, res) => {
    const r = await prisma.cardRequest.findUnique({ where: { id: String(req.params.id) }, include: requestInclude })
    if (!r) throw ApiError.notFound('That request does not exist.')
    const card = r.businessId
      ? await prisma.digitalCard.findFirst({ where: { businessId: r.businessId }, include: cardInclude })
      : null
    res.json({ request: shape(r), card: card ? serialiseCard(card) : null })
  }),
)

requestRouter.patch(
  '/:id',
  validate(updateRequestSchema),
  handler(async (req, res) => {
    const r = await prisma.cardRequest.update({
      where: { id: String(req.params.id) },
      data: req.body as Record<string, unknown>,
      include: requestInclude,
    })
    res.json({ request: shape(r) })
  }),
)

requestRouter.post(
  '/:id/status',
  validate(updateStatusSchema),
  handler(async (req, res) => {
    const { status, note } = req.body as { status: string; note?: string }
    await moveStatus(String(req.params.id), status as never, req.auth!.sub, note)
    const r = await prisma.cardRequest.findUniqueOrThrow({ where: { id: String(req.params.id) }, include: requestInclude })
    res.json({ request: shape(r) })
  }),
)

/** Creates the business and card the team will build on the customer's behalf. */
requestRouter.post(
  '/:id/build',
  validate(buildCardSchema),
  handler(async (req, res) => {
    const id = String(req.params.id)
    const { slug: raw, templateKey } = req.body as { slug: string; templateKey?: string }
    const slug = slugify(raw)
    await assertSlugAvailable(slug)

    const request = await prisma.cardRequest.findUnique({ where: { id } })
    if (!request) throw ApiError.notFound('That request does not exist.')
    if (request.businessId) throw ApiError.conflict('A card already exists for this request.', 'card_exists')

    const template = templateKey ? await prisma.template.findUnique({ where: { key: templateKey } }) : null
    const preset = (template?.preset ?? {}) as Record<string, unknown>
    const enabled = ((preset.sections as string[]) ?? ['contact', 'social']).map((x) => x.toUpperCase() as SectionKind)

    await prisma.$transaction(async (tx) => {
      // The card is owned by the admin account until the customer takes it over.
      const business = await tx.business.create({
        data: {
          ownerId: req.auth!.sub,
          name: request.businessName,
          category: request.category,
          tagline: String(preset.tagline ?? ''),
          phone: request.phone,
          whatsapp: request.whatsapp,
          email: request.email,
          address: [request.address, request.city].filter(Boolean).join(', '),
        },
      })
      const card = await tx.digitalCard.create({
        data: {
          businessId: business.id,
          slug,
          appearance: { ...DEFAULT_APPEARANCE, ...((preset.appearance as object) ?? {}) },
          templateId: template?.id,
          bookingLabel: String(preset.bookingLabel ?? 'Book Appointment'),
          sections: { create: defaultSections(enabled) },
        },
      })
      await tx.qRCode.create({ data: { cardId: card.id } })
      await tx.suggestedReview.createMany({
        data: [
          'Amazing service. Highly recommend!',
          'Great experience — friendly and quick.',
          'Excellent quality. Will visit again.',
        ].map((text, position) => ({ businessId: business.id, text, position })),
      })
      await tx.cardRequest.update({ where: { id }, data: { businessId: business.id, status: 'CREATING_CARD' } })
      await tx.cardRequestEvent.create({ data: { requestId: id, status: 'CREATING_CARD', actorId: req.auth!.sub, note: `Card created at /review/${slug}` } })
    })

    const r = await prisma.cardRequest.findUniqueOrThrow({ where: { id }, include: requestInclude })
    res.status(201).json({ request: shape(r) })
  }),
)

/**
 * Editing the customer's card. These are scoped to the request's own business, so an
 * admin who owns several built cards always edits the one they are looking at rather
 * than whichever happens to be theirs first.
 */
async function businessOf(requestId: string) {
  const r = await prisma.cardRequest.findUnique({ where: { id: requestId }, select: { businessId: true } })
  if (!r?.businessId) throw ApiError.badRequest('Create the card before editing it.')
  return r.businessId
}

requestRouter.patch(
  '/:id/business',
  validate(updateBusinessSchema),
  handler(async (req, res) => {
    const businessId = await businessOf(String(req.params.id))
    await prisma.business.update({ where: { id: businessId }, data: req.body as Record<string, unknown> })
    const r = await prisma.cardRequest.findUniqueOrThrow({ where: { id: String(req.params.id) }, include: requestInclude })
    res.json({ request: shape(r) })
  }),
)

requestRouter.patch(
  '/:id/card',
  validate(updateCardSchema),
  handler(async (req, res) => {
    const businessId = await businessOf(String(req.params.id))
    const body = req.body as { appearance?: Prisma.InputJsonObject; bookingUrl?: string; bookingLabel?: string; menuUrl?: string; showBranding?: boolean }
    const card = await prisma.digitalCard.findUniqueOrThrow({ where: { businessId } })
    await prisma.digitalCard.update({
      where: { businessId },
      data: {
        ...(body.appearance ? { appearance: { ...(card.appearance as Prisma.InputJsonObject), ...body.appearance } as Prisma.InputJsonObject } : {}),
        ...(body.bookingUrl !== undefined ? { bookingUrl: body.bookingUrl } : {}),
        ...(body.bookingLabel !== undefined ? { bookingLabel: body.bookingLabel } : {}),
        ...(body.menuUrl !== undefined ? { menuUrl: body.menuUrl } : {}),
        ...(body.showBranding !== undefined ? { showBranding: body.showBranding } : {}),
      },
    })
    const r = await prisma.cardRequest.findUniqueOrThrow({ where: { id: String(req.params.id) }, include: requestInclude })
    res.json({ request: shape(r) })
  }),
)

/** Replaces the whole phrase list, which is how the admin screen edits them. */
requestRouter.put(
  '/:id/suggestions',
  validate(adminSuggestionsSchema),
  handler(async (req, res) => {
    const businessId = await businessOf(String(req.params.id))
    const { suggestions } = req.body as { suggestions: { text: string; enabled: boolean }[] }
    await prisma.$transaction([
      prisma.suggestedReview.deleteMany({ where: { businessId } }),
      prisma.suggestedReview.createMany({
        data: suggestions.map((s, position) => ({ businessId, text: s.text, enabled: s.enabled, position })),
      }),
    ])
    const r = await prisma.cardRequest.findUniqueOrThrow({ where: { id: String(req.params.id) }, include: requestInclude })
    res.json({ request: shape(r) })
  }),
)

/**
 * Saves a Google review destination the admin has verified.
 * There is deliberately no endpoint that derives a review URL from a business name.
 */
requestRouter.post(
  '/:id/google',
  validate(connectGoogleSchema),
  handler(async (req, res) => {
    const id = String(req.params.id)
    const { reviewUrl, placeId, googleName, googleAddress } = req.body as {
      reviewUrl: string; placeId?: string; googleName?: string; googleAddress?: string
    }
    const request = await prisma.cardRequest.findUnique({ where: { id } })
    if (!request?.businessId) throw ApiError.badRequest('Create the card before connecting Google.')

    const admin = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.sub }, select: { email: true } })
    await prisma.business.update({
      where: { id: request.businessId },
      data: {
        reviewUrl,
        googlePlaceId: placeId ?? null,
        googleName: googleName ?? null,
        googleAddress: googleAddress ?? null,
        googleConnectedAt: new Date(),
        googleVerifiedBy: admin.email,
      },
    })
    await moveStatus(id, 'GOOGLE_CONNECTED', req.auth!.sub, `Google connected${googleName ? `: ${googleName}` : ''}`)

    const r = await prisma.cardRequest.findUniqueOrThrow({ where: { id }, include: requestInclude })
    res.json({ request: shape(r) })
  }),
)

/** Publishes the card once every readiness check passes. */
requestRouter.post(
  '/:id/generate',
  handler(async (req, res) => {
    const id = String(req.params.id)
    const r = await prisma.cardRequest.findUnique({ where: { id }, include: requestInclude })
    if (!r) throw ApiError.notFound('That request does not exist.')

    const { checks, ready } = readiness(r)
    if (!ready) {
      throw ApiError.badRequest('Finish the checklist before generating the final card.', {
        outstanding: checks.filter((c) => !c.done).map((c) => c.label),
      })
    }

    await prisma.digitalCard.update({
      where: { businessId: r.businessId! },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    })
    await moveStatus(id, 'FINAL_CARD_READY', req.auth!.sub, 'Final card generated and published')

    const updated = await prisma.cardRequest.findUniqueOrThrow({ where: { id }, include: requestInclude })
    res.json({ request: shape(updated) })
  }),
)

/** Issues the customer's approval link and returns a ready-to-send message. */
requestRouter.post(
  '/:id/send',
  validate(sendCardSchema),
  handler(async (req, res) => {
    const id = String(req.params.id)
    const { channel } = req.body as { channel: 'whatsapp' | 'email' | 'link' }
    const r = await prisma.cardRequest.findUnique({ where: { id }, include: requestInclude })
    if (!r?.businessId || !r.business?.card) throw ApiError.badRequest('Create and generate the card first.')

    const token = r.business.card.approvalStatus === 'AWAITING_CUSTOMER' ? null : approvalToken()
    const card = await prisma.digitalCard.update({
      where: { businessId: r.businessId },
      data: {
        approvalStatus: 'AWAITING_CUSTOMER',
        approvalSentAt: new Date(),
        revisionNote: null,
        ...(token ? { approvalToken: token } : {}),
      },
      select: { approvalToken: true, slug: true },
    })

    await moveStatus(id, 'DIGITAL_CARD_SENT', req.auth!.sub, `Sent via ${channel}`)

    const link = approvalLink(card.approvalToken!)
    const message = handoverMessage(r.businessName, link)
    const digits = (r.whatsapp || r.phone).replace(/\D/g, '')

    // Send it for real when we can; otherwise the admin still gets everything they
    // need to send it themselves, and the response says which happened.
    const delivery = channel === 'email' && r.email
      ? await emails.approval(r.email, r.businessName, link)
      : { sent: false, reason: channel === 'email' ? 'no_email_on_record' : 'not_requested' }

    res.json({
      delivery,
      link,
      message,
      // Prepared destinations the admin opens; nothing is sent on the customer's behalf.
      whatsapp: digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null,
      mailto: r.email ? `mailto:${r.email}?subject=${encodeURIComponent(`Your TapCard for ${r.businessName}`)}&body=${encodeURIComponent(message)}` : null,
      reviewLink: reviewLink(card.slug),
      cardLink: cardLink(card.slug),
      emailConfigured,
    })
  }),
)
