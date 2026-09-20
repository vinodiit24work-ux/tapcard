import { z } from 'zod'

const optionalUrl = z.string().trim().max(500).refine((v) => v === '' || /^https?:\/\//i.test(v), 'Enter a full URL starting with http:// or https://')

export const appearanceSchema = z.object({
  themeId: z.string().max(40).default('indigo'),
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #5B4BFF'),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  mode: z.enum(['light', 'dark']),
  buttonStyle: z.enum(['solid', 'outline', 'soft']),
  radius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
  font: z.enum(['inter', 'jakarta', 'serif', 'grotesk']),
  cardStyle: z.enum(['flat', 'elevated', 'bordered']),
  avatarShape: z.enum(['circle', 'rounded', 'square']),
  cover: z.enum(['aurora', 'sunset', 'ocean', 'forest', 'mono', 'grid', 'blush', 'midnight']),
  coverImage: z.string().max(500).optional(),
  gallery: z.array(z.string().max(40)).max(12).default([]),
})

export const createBusinessSchema = z.object({
  name: z.string().trim().min(2, 'Enter your business name.').max(120),
  category: z.string().trim().min(2).max(60),
  slug: z.string().trim().min(3).max(40),
  tagline: z.string().trim().max(120).default(''),
  description: z.string().trim().max(400).default(''),
  templateKey: z.string().max(40).optional(),
})

export const updateBusinessSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  category: z.string().trim().min(2).max(60).optional(),
  tagline: z.string().trim().max(120).optional(),
  description: z.string().trim().max(400).optional(),
  phone: z.string().trim().max(30).optional(),
  whatsapp: z.string().trim().max(20).optional(),
  email: z.string().trim().max(200).optional(),
  website: optionalUrl.optional(),
  address: z.string().trim().max(300).optional(),
  mapsUrl: optionalUrl.optional(),
  reviewUrl: optionalUrl.optional(),
  logoUrl: z.string().max(500000).nullish(),
  coverUrl: z.string().max(500000).nullish(),
  gstin: z.string().trim().max(20).nullish(),
})

export const updateCardSchema = z.object({
  appearance: appearanceSchema.partial().optional(),
  bookingUrl: z.string().trim().max(500).optional(),
  bookingLabel: z.string().trim().max(60).optional(),
  menuUrl: z.string().trim().max(500).optional(),
  showBranding: z.boolean().optional(),
})

export const slugSchema = z.object({ slug: z.string().trim().toLowerCase().min(3).max(40) })

export const sectionsSchema = z.object({
  sections: z
    .array(z.object({ id: z.enum(['profile', 'contact', 'social', 'menu', 'services', 'booking', 'reviews', 'gallery', 'links']), enabled: z.boolean() }))
    .min(1)
    .max(9),
})

export const socialSchema = z.object({
  instagram: z.string().trim().max(120).default(''),
  facebook: z.string().trim().max(120).default(''),
  linkedin: z.string().trim().max(120).default(''),
  youtube: z.string().trim().max(120).default(''),
})

export const customLinksSchema = z.object({
  links: z.array(z.object({ label: z.string().trim().min(1, 'Give the button a label.').max(60), url: z.string().trim().min(1).max(500) })).max(20),
})

export const servicesSchema = z.object({
  services: z.array(z.object({ name: z.string().trim().min(1).max(120), description: z.string().trim().max(240).optional(), price: z.string().trim().max(40).optional() })).max(60),
})

export const menuSchema = z.object({
  items: z.array(z.object({ name: z.string().trim().min(1).max(120), category: z.string().trim().min(1).max(60), price: z.string().trim().max(40), description: z.string().trim().max(240).optional(), veg: z.boolean().default(true) })).max(200),
})

export const hoursSchema = z.object({
  hours: z.array(z.object({ dayOfWeek: z.number().int().min(0).max(6), opensAt: z.string().max(5), closesAt: z.string().max(5), closed: z.boolean().default(false) })).max(7),
})
