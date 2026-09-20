import { z } from 'zod'

export const addressSchema = z.object({
  name: z.string().trim().min(2, 'Enter the full name.').max(100),
  phone: z.string().trim().min(10, 'Enter a 10-digit mobile number.').max(20),
  line1: z.string().trim().min(6, 'Enter the street address.').max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, 'Enter the city.').max(80),
  state: z.string().trim().min(2, 'Choose a state.').max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a 6-digit PIN code.'),
  country: z.string().trim().max(60).default('India'),
})

/**
 * The client sends what was chosen, never what it costs. Quantities and options only —
 * every price, tax and total is recomputed from the database.
 */
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        sku: z.string().trim().min(1).max(60),
        quantity: z.number().int().min(1, 'Quantity must be at least 1.').max(500),
        businessName: z.string().trim().max(120).default(''),
        finish: z.enum(['matte', 'gloss']).default('matte'),
        colour: z.enum(['white', 'black', 'brand']).default('white'),
        notes: z.string().trim().max(300).optional(),
      }),
    )
    .min(1, 'Your cart is empty.')
    .max(20),
  address: addressSchema,
  email: z.string().trim().email('Enter a valid email address.').max(200),
  gstin: z.string().trim().max(20).optional(),
  couponCode: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(500).optional(),
})

export const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'DESIGN_REVIEW', 'PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  trackingNumber: z.string().trim().max(80).nullish(),
  shippingProvider: z.string().trim().max(80).nullish(),
})
