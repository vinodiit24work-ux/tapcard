import { z } from 'zod'

const phone = z.string().trim().min(6, 'Enter a contact number.').max(20)

/** The public "Get My TapCard" form. Deliberately short — the team calls to fill the rest. */
export const createRequestSchema = z.object({
  businessName: z.string().trim().min(2, 'Enter your business name.').max(120),
  contactName: z.string().trim().min(2, 'Enter your name.').max(100),
  phone,
  whatsapp: z.string().trim().max(20).default(''),
  email: z.string().trim().max(200).refine((v) => v === '' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'Enter a valid email address.').default(''),
  category: z.string().trim().min(2, 'Choose a category.').max(60),
  city: z.string().trim().max(80).default(''),
  address: z.string().trim().max(300).default(''),
  wantsPhysical: z.boolean().default(true),
  wantsDigital: z.boolean().default(true),
  notes: z.string().trim().max(600).optional(),
})

export const REQUEST_STATUSES = [
  'NEW_REQUEST', 'CONTACT_CUSTOMER', 'ORDER_CONFIRMED', 'CREATING_CARD', 'GOOGLE_CONNECTED',
  'PREVIEW_READY', 'CUSTOMER_APPROVAL', 'REVISION_REQUESTED', 'APPROVED', 'FINAL_CARD_READY',
  'DIGITAL_CARD_SENT', 'PHYSICAL_CARD_PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
] as const

export const updateStatusSchema = z.object({
  status: z.enum(REQUEST_STATUSES),
  note: z.string().trim().max(500).optional(),
})

export const updateRequestSchema = createRequestSchema.partial()

/** Building the customer's card from a request. */
export const buildCardSchema = z.object({
  slug: z.string().trim().min(3, 'Pick a link at least 3 characters long.').max(40),
  templateKey: z.string().max(40).optional(),
})

/**
 * A Google connection is either a verified selection or a URL an admin has confirmed.
 * There is no path that derives a review link from a business name.
 */
export const connectGoogleSchema = z.object({
  reviewUrl: z
    .string()
    .trim()
    .min(8, 'Paste the review link.')
    .max(500)
    .refine((v) => /^https?:\/\//i.test(v), 'Enter a full URL starting with https://')
    .refine(
      (v) => /(^https?:\/\/(g\.page|maps\.app\.goo\.gl|search\.google\.com|www\.google\.[a-z.]+|goo\.gl))/i.test(v),
      'That does not look like a Google review link. It should start with g.page, maps.app.goo.gl, search.google.com or google.com.',
    ),
  placeId: z.string().trim().max(200).optional(),
  googleName: z.string().trim().max(200).optional(),
  googleAddress: z.string().trim().max(300).optional(),
  /** The admin states they opened the link and saw the right business. */
  verified: z.literal(true, { message: 'Confirm you opened the link and it shows the correct business.' }),
})

export const sendCardSchema = z.object({
  channel: z.enum(['whatsapp', 'email', 'link']),
})

export const customerApprovalSchema = z.object({
  token: z.string().min(10),
  decision: z.enum(['approve', 'changes']),
  note: z.string().trim().max(800).optional(),
})

/** The admin phrase editor sends the whole list. */
export const adminSuggestionsSchema = z.object({
  suggestions: z
    .array(z.object({ text: z.string().trim().min(4, 'Write at least a few words.').max(300), enabled: z.boolean().default(true) }))
    .max(12),
})

export const validateCouponSchema = z.object({
  code: z.string().trim().min(2).max(40),
  subtotalPaise: z.number().int().min(0).max(100_000_000),
})
