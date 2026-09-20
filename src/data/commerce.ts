import type { Product } from '@/types'

/** All commercial values live here (Phase 1 mock). Phase 3 moves them into the database. */
export const commerceConfig = {
  gstRate: 0.18,
  shippingFlat: 79,
  freeShippingOver: 999,
  coupons: {
    TAP10: { kind: 'percent' as const, value: 10, min: 0, label: '10% off' },
    WELCOME100: { kind: 'fixed' as const, value: 100, min: 499, label: '₹100 off orders above ₹499' },
  },
}

export const products: Product[] = [
  { id: 'qr-card', name: 'QR Business Card', description: 'Classic 350gsm card with a durable printed QR that opens your digital profile.', price: 299, kind: 'card', tech: 'QR', material: '350gsm matte laminate', packSize: 1, features: ['Custom logo & colours', 'Printed QR', 'Ships in 4–6 days'] },
  { id: 'premium-qr-card', name: 'Premium QR Card', description: 'Soft-touch, spot-UV finish. Made to be kept.', price: 599, compareAt: 749, kind: 'card', tech: 'QR', material: '600gsm soft-touch + spot UV', badge: 'Popular', packSize: 1, features: ['Soft-touch finish', 'Spot-UV logo', 'Gift sleeve'] },
  { id: 'nfc-card', name: 'NFC Business Card', description: 'Tap on any modern phone — no app needed. QR printed as backup.', price: 899, kind: 'card', tech: 'NFC', material: 'PVC with NTAG215 chip', badge: 'Best seller', packSize: 1, features: ['Tap or scan', 'Works on iPhone & Android', 'Rewritable chip'] },
  { id: 'nfc-stand', name: 'NFC Table Stand', description: 'Acrylic table stand with NFC + QR for cafés, salons and reception desks.', price: 1299, kind: 'stand', tech: 'NFC', material: '5mm acrylic, NFC sticker', packSize: 1, features: ['Tap or scan', 'Anti-scratch acrylic', 'Fits A6 inserts'] },
  { id: 'qr-stand', name: 'QR Table Stand', description: 'Compact tabletop stand printed with your QR and call-to-action.', price: 499, kind: 'stand', tech: 'QR', material: '3mm acrylic', packSize: 1, features: ['Double-sided', 'Water-resistant', 'Custom CTA text'] },
  { id: 'pack-5', name: 'QR Card 5-Pack', description: 'Five matching QR cards for your team. Save 15%.', price: 1249, compareAt: 1495, kind: 'pack', tech: 'QR', material: '350gsm matte laminate', packSize: 5, features: ['Per-person names', 'Shared brand style', 'Save 15%'] },
  { id: 'pack-10', name: 'NFC Card 10-Pack', description: 'Ten NFC cards with individual profiles for a growing team. Save 20%.', price: 7199, compareAt: 8990, kind: 'pack', tech: 'NFC', material: 'PVC with NTAG215 chip', badge: 'Save 20%', packSize: 10, features: ['10 tap-ready cards', 'Bulk pricing', 'Priority production'] },
]

export const productById = (id: string) => products.find((p) => p.id === id)

export const plans = [
  { id: 'FREE', name: 'Free', price: 0, tagline: 'Launch your first card', features: ['1 digital card', 'TapCard subdomain URL', 'QR code (PNG)', 'Basic analytics (7 days)', 'TapCard branding'], cta: 'Start free' },
  { id: 'PRO', name: 'Pro', price: 299, tagline: 'For growing businesses', popular: true, features: ['Everything in Free', 'Remove TapCard branding', 'QR in SVG + custom colours', 'Advanced analytics (90 days)', 'Lead capture & export', 'Menu, services & booking'], cta: 'Go Pro' },
  { id: 'BUSINESS', name: 'Business', price: 799, tagline: 'Teams and multi-location', features: ['Everything in Pro', 'Up to 10 cards', 'Custom domain', 'Team members', 'Priority support', '10% off physical cards'], cta: 'Choose Business' },
]
