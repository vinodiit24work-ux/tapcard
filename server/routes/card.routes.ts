import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { ApiError, handler } from '../utils/http'
import { validate } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'
import { assertSlugAvailable, cardInclude, defaultSections, ownedCard, serialiseCard } from '../services/card.service'
import {
  createBusinessSchema, customLinksSchema, hoursSchema, menuSchema, sectionsSchema, servicesSchema,
  slugSchema, socialSchema, updateBusinessSchema, updateCardSchema,
} from '../validators/card.validators'
import { isValidSlug, slugify } from '../utils/slug'
import type { SectionKind } from '../generated/prisma/enums'
import type { Prisma } from '../generated/prisma/client'

export const cardRouter = Router()
cardRouter.use(requireAuth)

const DEFAULT_APPEARANCE = {
  themeId: 'indigo', primary: '#5b4bff', background: '#f6f7fb', text: '#0f1729', mode: 'light',
  buttonStyle: 'solid', radius: 'md', font: 'jakarta', cardStyle: 'elevated', avatarShape: 'rounded',
  cover: 'aurora', gallery: [],
}

/** The signed-in user's card, with everything the builder needs. */
cardRouter.get(
  '/',
  handler(async (req, res) => {
    const card = await prisma.digitalCard.findFirst({
      where: { deletedAt: null, business: { ownerId: req.auth!.sub, deletedAt: null } },
      include: cardInclude,
      orderBy: { createdAt: 'asc' },
    })
    if (!card) return res.json({ card: null })
    res.json({ card: serialiseCard(card) })
  }),
)

/** Creates the business and its card together — a business without a card is not useful. */
cardRouter.post(
  '/',
  validate(createBusinessSchema),
  handler(async (req, res) => {
    const body = req.body as { name: string; category: string; slug: string; tagline: string; description: string; templateKey?: string }
    const slug = slugify(body.slug)
    await assertSlugAvailable(slug)

    const existing = await prisma.business.findFirst({ where: { ownerId: req.auth!.sub, deletedAt: null }, select: { id: true } })
    if (existing) throw ApiError.conflict('You already have a business. Edit it instead.', 'business_exists')

    const template = body.templateKey ? await prisma.template.findUnique({ where: { key: body.templateKey } }) : null
    const preset = (template?.preset ?? {}) as Record<string, unknown>
    const appearance = { ...DEFAULT_APPEARANCE, ...((preset.appearance as object) ?? {}) }
    const enabled = ((preset.sections as string[]) ?? ['contact', 'social']).map((s) => s.toUpperCase() as SectionKind)

    const card = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          ownerId: req.auth!.sub,
          name: body.name,
          category: body.category,
          tagline: body.tagline || String(preset.tagline ?? ''),
          description: body.description,
        },
      })
      const created = await tx.digitalCard.create({
        data: {
          businessId: business.id,
          slug,
          appearance,
          templateId: template?.id,
          bookingLabel: String(preset.bookingLabel ?? 'Book Appointment'),
          sections: { create: defaultSections(enabled) },
        },
      })
      await tx.qRCode.create({ data: { cardId: created.id } })
      if (template) await tx.template.update({ where: { id: template.id }, data: { useCount: { increment: 1 } } })
      return tx.digitalCard.findUniqueOrThrow({ where: { id: created.id }, include: cardInclude })
    })

    res.status(201).json({ card: serialiseCard(card) })
  }),
)

cardRouter.patch(
  '/business',
  validate(updateBusinessSchema),
  handler(async (req, res) => {
    const card = await ownedCard(req.auth!.sub)
    await prisma.business.update({ where: { id: card.businessId }, data: req.body as Record<string, unknown> })
    const updated = await prisma.digitalCard.findUniqueOrThrow({ where: { id: card.id }, include: cardInclude })
    res.json({ card: serialiseCard(updated) })
  }),
)

cardRouter.patch(
  '/',
  validate(updateCardSchema),
  handler(async (req, res) => {
    const body = req.body as { appearance?: Prisma.InputJsonObject; bookingUrl?: string; bookingLabel?: string; menuUrl?: string; showBranding?: boolean }
    const card = await ownedCard(req.auth!.sub)
    const updated = await prisma.digitalCard.update({
      where: { id: card.id },
      data: {
        ...(body.appearance ? { appearance: { ...(card.appearance as Prisma.InputJsonObject), ...body.appearance } as Prisma.InputJsonObject } : {}),
        ...(body.bookingUrl !== undefined ? { bookingUrl: body.bookingUrl } : {}),
        ...(body.bookingLabel !== undefined ? { bookingLabel: body.bookingLabel } : {}),
        ...(body.menuUrl !== undefined ? { menuUrl: body.menuUrl } : {}),
        ...(body.showBranding !== undefined ? { showBranding: body.showBranding } : {}),
      },
      include: cardInclude,
    })
    res.json({ card: serialiseCard(updated) })
  }),
)

cardRouter.get(
  '/slug-available',
  handler(async (req, res) => {
    const slug = slugify(String(req.query.slug ?? ''))
    if (!isValidSlug(slug)) return res.json({ slug, available: false, reason: 'invalid' })
    const taken = await prisma.digitalCard.findUnique({ where: { slug }, select: { id: true } })
    res.json({ slug, available: !taken, reason: taken ? 'taken' : null })
  }),
)

cardRouter.patch(
  '/slug',
  validate(slugSchema),
  handler(async (req, res) => {
    const card = await ownedCard(req.auth!.sub)
    const slug = slugify((req.body as { slug: string }).slug)
    await assertSlugAvailable(slug, card.id)
    const updated = await prisma.digitalCard.update({ where: { id: card.id }, data: { slug }, include: cardInclude })
    res.json({ card: serialiseCard(updated) })
  }),
)

/** Reorder and show/hide in one call — the builder always sends the whole list. */
cardRouter.put(
  '/sections',
  validate(sectionsSchema),
  handler(async (req, res) => {
    const { sections } = req.body as { sections: { id: string; enabled: boolean }[] }
    const card = await ownedCard(req.auth!.sub)
    await prisma.$transaction(
      sections.map((s, position) =>
        prisma.cardSection.update({
          where: { cardId_kind: { cardId: card.id, kind: s.id.toUpperCase() as SectionKind } },
          data: { position, enabled: s.id === 'profile' ? true : s.enabled },
        }),
      ),
    )
    const updated = await prisma.digitalCard.findUniqueOrThrow({ where: { id: card.id }, include: cardInclude })
    res.json({ card: serialiseCard(updated) })
  }),
)

cardRouter.post(
  '/publish',
  handler(async (req, res) => {
    const card = await ownedCard(req.auth!.sub)
    if (!card.business.phone && !card.business.whatsapp) {
      throw ApiError.badRequest('Add a phone or WhatsApp number before publishing so customers can reach you.')
    }
    const updated = await prisma.digitalCard.update({
      where: { id: card.id },
      data: { status: 'PUBLISHED', publishedAt: card.publishedAt ?? new Date() },
      include: cardInclude,
    })
    res.json({ card: serialiseCard(updated) })
  }),
)

cardRouter.post(
  '/unpublish',
  handler(async (req, res) => {
    const card = await ownedCard(req.auth!.sub)
    const updated = await prisma.digitalCard.update({ where: { id: card.id }, data: { status: 'DRAFT' }, include: cardInclude })
    res.json({ card: serialiseCard(updated) })
  }),
)

/* --- Collections. Each replaces the whole set, matching how the builder edits them. --- */

cardRouter.put(
  '/social',
  validate(socialSchema),
  handler(async (req, res) => {
    const handles = req.body as Record<string, string>
    const card = await ownedCard(req.auth!.sub)
    await prisma.$transaction([
      prisma.socialLink.deleteMany({ where: { businessId: card.businessId } }),
      prisma.socialLink.createMany({
        data: Object.entries(handles)
          .filter(([, handle]) => handle.trim())
          .map(([platform, handle], position) => ({ businessId: card.businessId, platform, handle: handle.trim(), position })),
      }),
    ])
    const updated = await prisma.digitalCard.findUniqueOrThrow({ where: { id: card.id }, include: cardInclude })
    res.json({ card: serialiseCard(updated) })
  }),
)

cardRouter.put(
  '/links',
  validate(customLinksSchema),
  handler(async (req, res) => {
    const { links } = req.body as { links: { label: string; url: string }[] }
    const card = await ownedCard(req.auth!.sub)
    await prisma.$transaction([
      prisma.customLink.deleteMany({ where: { businessId: card.businessId } }),
      prisma.customLink.createMany({ data: links.map((l, position) => ({ ...l, businessId: card.businessId, position })) }),
    ])
    const updated = await prisma.digitalCard.findUniqueOrThrow({ where: { id: card.id }, include: cardInclude })
    res.json({ card: serialiseCard(updated) })
  }),
)

cardRouter.put(
  '/services',
  validate(servicesSchema),
  handler(async (req, res) => {
    const { services } = req.body as { services: { name: string; description?: string; price?: string }[] }
    const card = await ownedCard(req.auth!.sub)
    await prisma.$transaction([
      prisma.service.deleteMany({ where: { businessId: card.businessId } }),
      prisma.service.createMany({ data: services.map((s, position) => ({ ...s, businessId: card.businessId, position })) }),
    ])
    const updated = await prisma.digitalCard.findUniqueOrThrow({ where: { id: card.id }, include: cardInclude })
    res.json({ card: serialiseCard(updated) })
  }),
)

cardRouter.put(
  '/menu',
  validate(menuSchema),
  handler(async (req, res) => {
    const { items } = req.body as { items: { name: string; category: string; price: string; description?: string; veg: boolean }[] }
    const card = await ownedCard(req.auth!.sub)
    await prisma.$transaction([
      prisma.menuItem.deleteMany({ where: { businessId: card.businessId } }),
      prisma.menuItem.createMany({ data: items.map((m, position) => ({ ...m, businessId: card.businessId, position })) }),
    ])
    const updated = await prisma.digitalCard.findUniqueOrThrow({ where: { id: card.id }, include: cardInclude })
    res.json({ card: serialiseCard(updated) })
  }),
)

cardRouter.put(
  '/hours',
  validate(hoursSchema),
  handler(async (req, res) => {
    const { hours } = req.body as { hours: { dayOfWeek: number; opensAt: string; closesAt: string; closed: boolean }[] }
    const card = await ownedCard(req.auth!.sub)
    await prisma.$transaction([
      prisma.openingHour.deleteMany({ where: { businessId: card.businessId } }),
      prisma.openingHour.createMany({ data: hours.map((h) => ({ ...h, businessId: card.businessId })) }),
    ])
    const updated = await prisma.digitalCard.findUniqueOrThrow({ where: { id: card.id }, include: cardInclude })
    res.json({ card: serialiseCard(updated) })
  }),
)
