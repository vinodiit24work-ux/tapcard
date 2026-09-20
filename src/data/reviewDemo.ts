import type { ReviewCardData } from '@/types/review'
import { royalSpice, glowStudio, ironForge, drMehta, freelancer, retail } from './templates'
import type { CardData } from '@/types'

const DEFAULT_SUGGESTIONS: Record<string, string[]> = {
  Restaurant: [
    'Amazing food and great service!',
    'Loved the food. Will definitely visit again!',
    'Great ambience and friendly staff.',
    'Excellent experience with quick service.',
  ],
  Salon: [
    'Loved my haircut — the stylist really listened.',
    'Relaxing place and lovely staff.',
    'Great service and spotless salon.',
    'Booked again already. Highly recommend!',
  ],
  Gym: [
    'Great equipment and a really motivating crowd.',
    'The trainers actually pay attention. Excellent.',
    'Clean, spacious and never too crowded.',
    'Best gym in the area, hands down.',
  ],
  Doctor: [
    'Doctor explained everything clearly and patiently.',
    'Short wait and very professional care.',
    'Felt genuinely looked after. Thank you!',
    'Clean clinic and helpful staff.',
  ],
  Freelancer: [
    'Delivered exactly what we needed, on time.',
    'Great communication throughout the project.',
    'Brilliant work — would hire again.',
    'Understood the brief immediately.',
  ],
  Retail: [
    'Beautiful collection and helpful staff.',
    'Found exactly what I was looking for.',
    'Great quality at a fair price.',
    'Lovely store, will be back!',
  ],
}

/** Turns a demo business into the shape the review experience renders. */
export function toReviewCard(card: CardData): ReviewCardData {
  return {
    slug: card.slug,
    businessName: card.businessName,
    tagline: card.tagline,
    category: card.category,
    logo: card.logo,
    appearance: card.appearance,
    copy: {
      headline: 'How was your experience?',
      description: 'Your feedback helps us serve you better.',
      suggestionsTitle: 'Share your experience',
      ownReviewTitle: 'Write your own review',
      submitLabel: 'Submit Review',
      thankYouTitle: 'Thank you!',
      thankYouMessage: 'Thank you for sharing your experience with us.',
      googleCtaLabel: 'Review on Google',
    },
    askForName: true,
    showBusinessInfo: true,
    showBranding: card.appearance.showBranding,
    googleReviewUrl: card.reviewUrl,
    suggestions: (DEFAULT_SUGGESTIONS[card.category] ?? DEFAULT_SUGGESTIONS.Restaurant).map((text, i) => ({ id: `${card.slug}-${i}`, text })),
    business: {
      phone: card.phone,
      whatsapp: card.whatsapp,
      website: card.website,
      address: card.address,
      mapsUrl: card.mapsUrl,
      instagram: card.instagram,
      facebook: card.facebook,
    },
  }
}

export const reviewDemos = [
  { id: 'restaurant', label: 'Restaurant', card: toReviewCard(royalSpice) },
  { id: 'salon', label: 'Salon', card: toReviewCard(glowStudio) },
  { id: 'gym', label: 'Gym', card: toReviewCard(ironForge) },
  { id: 'doctor', label: 'Doctor', card: toReviewCard(drMehta) },
  { id: 'freelancer', label: 'Freelancer', card: toReviewCard(freelancer) },
  { id: 'retail', label: 'Retail', card: toReviewCard(retail) },
]
