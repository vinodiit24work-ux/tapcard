export const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export const num = (n: number) => new Intl.NumberFormat('en-IN').format(n)

export const pct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`

export const digitsOnly = (s: string) => s.replace(/\D/g, '')

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

/**
 * Where published cards live. Set VITE_PUBLIC_ORIGIN per environment (local network,
 * staging, production) so QR codes always encode a URL that actually resolves.
 */
export const publicOrigin = (import.meta.env.VITE_PUBLIC_ORIGIN ?? 'https://tapcard.in').replace(/\/$/, '')
export const cardHost = publicOrigin.replace(/^https?:\/\//, '')

/** The permanent review URL behind every QR code and NFC tag. */
export const reviewUrl = (slug: string) => `${publicOrigin}/review/${slug}`
/** The secondary contact-card URL. */
export const cardUrl = (slug: string) => `${publicOrigin}/${slug}`
