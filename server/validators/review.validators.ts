import { z } from 'zod'

export const submitReviewSchema = z
  .object({
    slug: z.string().trim().min(1).max(40),
    rating: z.number().int().min(1, 'Please choose a rating.').max(5),
    text: z.string().trim().max(1500).optional(),
    customerName: z.string().trim().max(80).optional(),
    suggestionId: z.string().uuid().optional(),
  })
  // A review with neither a rating comment nor a suggestion is still valid — the rating
  // alone is meaningful — but empty text must not masquerade as a written review.
  .transform((v) => ({ ...v, text: v.text?.length ? v.text : undefined }))

export const suggestionSchema = z.object({
  text: z.string().trim().min(4, 'Write at least a few words.').max(300),
  enabled: z.boolean().optional(),
})

export const reorderSuggestionsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(20),
})

export const reviewCopySchema = z.object({
  reviewHeadline: z.string().trim().min(3).max(90).optional(),
  reviewDescription: z.string().trim().max(200).optional(),
  suggestionsTitle: z.string().trim().max(60).optional(),
  ownReviewTitle: z.string().trim().max(60).optional(),
  submitLabel: z.string().trim().min(2).max(40).optional(),
  thankYouTitle: z.string().trim().min(2).max(60).optional(),
  thankYouMessage: z.string().trim().max(240).optional(),
  googleCtaLabel: z.string().trim().min(2).max(40).optional(),
  askForName: z.boolean().optional(),
  showBusinessInfo: z.boolean().optional(),
})

export const reviewListSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  status: z.enum(['PUBLISHED', 'HIDDEN']).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
})
