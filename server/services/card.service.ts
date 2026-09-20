import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/http.js'
import { isValidSlug } from '../utils/slug.js'
import type { SectionKind } from '../generated/prisma/enums.js'

export const SECTION_ORDER: SectionKind[] = ['PROFILE', 'CONTACT', 'SOCIAL', 'MENU', 'SERVICES', 'BOOKING', 'REVIEWS', 'GALLERY', 'LINKS']

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Everything the card UI needs, in one query. */
export const cardInclude = {
  sections: { orderBy: { position: 'asc' } },
  business: {
    include: {
      socialLinks: { orderBy: { position: 'asc' } },
      customLinks: { orderBy: { position: 'asc' } },
      services: { orderBy: { position: 'asc' } },
      menuItems: { orderBy: { position: 'asc' } },
      hours: { orderBy: { dayOfWeek: 'asc' } },
    },
  },
} as const

type CardWithRelations = Awaited<ReturnType<typeof prisma.digitalCard.findFirstOrThrow<{ include: typeof cardInclude }>>>

/**
 * Maps the relational card onto the shape the React `DigitalCardPreview` already expects,
 * so Phase 1 components keep working untouched.
 */
export function serialiseCard(card: CardWithRelations) {
  const b = card.business
  const social = Object.fromEntries(b.socialLinks.map((s) => [s.platform, s.handle]))
  return {
    slug: card.slug,
    status: card.status,
    publishedAt: card.publishedAt,
    category: b.category,
    businessName: b.name,
    tagline: b.tagline,
    description: b.description,
    logo: b.logoUrl ?? undefined,
    phone: b.phone,
    whatsapp: b.whatsapp,
    email: b.email,
    website: b.website,
    address: b.address,
    mapsUrl: b.mapsUrl,
    reviewUrl: b.reviewUrl,
    instagram: social.instagram ?? '',
    facebook: social.facebook ?? '',
    linkedin: social.linkedin ?? '',
    youtube: social.youtube ?? '',
    menuUrl: card.menuUrl,
    bookingUrl: card.bookingUrl,
    bookingLabel: card.bookingLabel,
    services: b.services.map((s) => ({ id: s.id, name: s.name, description: s.description ?? undefined, price: s.price ?? undefined })),
    menu: b.menuItems.map((m) => ({ id: m.id, name: m.name, category: m.category, price: m.price, description: m.description ?? undefined, veg: m.veg })),
    customLinks: b.customLinks.map((l) => ({ id: l.id, label: l.label, url: l.url })),
    gallery: (card.appearance as { gallery?: string[] })?.gallery ?? [],
    hours: b.hours.map((h) => ({ day: DAYS[h.dayOfWeek], open: h.opensAt, close: h.closesAt, closed: h.closed })),
    sections: card.sections.map((s) => ({ id: s.kind.toLowerCase(), enabled: s.enabled })),
    appearance: { ...(card.appearance as Record<string, unknown>), showBranding: card.showBranding },
  }
}

export async function assertSlugAvailable(slug: string, exceptCardId?: string) {
  if (!isValidSlug(slug)) {
    throw ApiError.badRequest('Links must be 3–40 characters, letters, numbers and hyphens only, and cannot be a reserved word.')
  }
  const existing = await prisma.digitalCard.findUnique({ where: { slug }, select: { id: true } })
  if (existing && existing.id !== exceptCardId) throw ApiError.conflict('That link is already taken. Try another.', 'slug_taken')
}

/** Loads a card the caller is allowed to edit, or throws. */
export async function ownedCard(userId: string, cardId?: string) {
  const card = await prisma.digitalCard.findFirst({
    where: {
      deletedAt: null,
      business: { ownerId: userId, deletedAt: null },
      ...(cardId ? { id: cardId } : {}),
    },
    include: cardInclude,
    orderBy: { createdAt: 'asc' },
  })
  if (!card) throw ApiError.notFound('You do not have a card yet.')
  return card
}

export const defaultSections = (enabled: SectionKind[]) =>
  SECTION_ORDER.map((kind, position) => ({ kind, position, enabled: kind === 'PROFILE' || enabled.includes(kind) }))
