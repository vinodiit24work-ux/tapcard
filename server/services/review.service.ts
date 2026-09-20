import { prisma } from '../lib/prisma'

/**
 * The review experience a customer sees. Deliberately small: a customer arriving from a
 * QR code should receive only what the review page needs, never the owner's admin data.
 */
export const reviewCardInclude = {
  business: {
    include: {
      suggestions: { where: { enabled: true }, orderBy: { position: 'asc' } },
      socialLinks: { orderBy: { position: 'asc' } },
    },
  },
} as const

type ReviewCard = Awaited<ReturnType<typeof prisma.digitalCard.findFirstOrThrow<{ include: typeof reviewCardInclude }>>>

export function serialiseReviewCard(card: ReviewCard) {
  const b = card.business
  const social = Object.fromEntries(b.socialLinks.map((s) => [s.platform, s.handle]))
  return {
    slug: card.slug,
    businessName: b.name,
    tagline: b.tagline,
    category: b.category,
    logo: b.logoUrl ?? undefined,
    appearance: card.appearance,
    copy: {
      headline: card.reviewHeadline,
      description: card.reviewDescription,
      suggestionsTitle: card.suggestionsTitle,
      ownReviewTitle: card.ownReviewTitle,
      submitLabel: card.submitLabel,
      thankYouTitle: card.thankYouTitle,
      thankYouMessage: card.thankYouMessage,
      googleCtaLabel: card.googleCtaLabel,
    },
    askForName: card.askForName,
    showBusinessInfo: card.showBusinessInfo,
    showBranding: card.showBranding,
    /// Present only so the page can offer it after submitting; never auto-opened.
    googleReviewUrl: b.reviewUrl || '',
    suggestions: b.suggestions.map((s) => ({ id: s.id, text: s.text })),
    // Secondary details. Available, but never in the way of leaving a review.
    business: card.showBusinessInfo
      ? {
          phone: b.phone,
          whatsapp: b.whatsapp,
          website: b.website,
          address: b.address,
          mapsUrl: b.mapsUrl,
          instagram: social.instagram ?? '',
          facebook: social.facebook ?? '',
        }
      : null,
  }
}

/** Rating distribution and averages for the owner's dashboard. */
export async function reviewStats(businessId: string) {
  const [agg, byRating, googleClicks] = await Promise.all([
    prisma.review.aggregate({ where: { businessId, status: 'PUBLISHED' }, _avg: { rating: true }, _count: { _all: true } }),
    prisma.review.groupBy({ by: ['rating'], where: { businessId, status: 'PUBLISHED' }, _count: { _all: true } }),
    prisma.review.count({ where: { businessId, googleClickedAt: { not: null } } }),
  ])
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: byRating.find((r) => r.rating === rating)?._count._all ?? 0,
  }))
  return {
    total: agg._count._all,
    average: agg._avg.rating ? Number(agg._avg.rating.toFixed(2)) : 0,
    distribution,
    googleClicks,
  }
}
