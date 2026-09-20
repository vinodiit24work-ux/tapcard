import type { Appearance } from './index'

export interface ReviewCopy {
  headline: string
  description: string
  suggestionsTitle: string
  ownReviewTitle: string
  submitLabel: string
  thankYouTitle: string
  thankYouMessage: string
  googleCtaLabel: string
}

export interface Suggestion {
  id: string
  text: string
  enabled?: boolean
  useCount?: number
}

export interface ReviewCardData {
  slug: string
  businessName: string
  tagline: string
  category: string
  logo?: string
  appearance: Appearance
  copy: ReviewCopy
  askForName: boolean
  showBusinessInfo: boolean
  showBranding: boolean
  googleReviewUrl: string
  suggestions: Suggestion[]
  business: {
    phone: string
    whatsapp: string
    website: string
    address: string
    mapsUrl: string
    instagram: string
    facebook: string
  } | null
}

export interface SubmittedReview {
  id: string
  rating: number
  text?: string
  customerName?: string
}

export type ReviewEvent =
  | 'REVIEW_PAGE_VIEW'
  | 'RATING_SELECTED'
  | 'SUGGESTION_SELECTED'
  | 'OWN_REVIEW_STARTED'
  | 'REVIEW_SUBMITTED'
  | 'GOOGLE_REVIEW_CLICK'
