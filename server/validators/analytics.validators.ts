import { z } from 'zod'

export const eventSchema = z.object({
  slug: z.string().trim().min(1).max(40),
  type: z.enum([
    'PAGE_VIEW', 'REVIEW_PAGE_VIEW', 'RATING_SELECTED', 'SUGGESTION_SELECTED',
    'OWN_REVIEW_STARTED', 'REVIEW_SUBMITTED', 'QR_SCAN', 'WHATSAPP_CLICK', 'PHONE_CLICK', 'EMAIL_CLICK', 'WEBSITE_CLICK',
    'GOOGLE_REVIEW_CLICK', 'MAP_CLICK', 'MENU_CLICK', 'BOOKING_CLICK', 'SOCIAL_CLICK',
    'CUSTOM_LINK_CLICK', 'SAVE_CONTACT',
  ]),
  source: z.string().trim().max(40).optional(),
  label: z.string().trim().max(60).optional(),
})

export const rangeSchema = z.object({ range: z.enum(['1', '7', '30', '90']).default('30') })
