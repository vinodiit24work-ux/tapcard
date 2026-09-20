/**
 * Seeds the catalogue (plans, products, coupons, templates, settings) and a demo
 * business so the app is usable immediately. Safe to re-run: everything upserts.
 */
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'
import { PrismaClient } from '../server/generated/prisma/client'
import type { SectionKind } from '../server/generated/prisma/enums'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

const rupees = (n: number) => n * 100

const PLANS = [
  { tier: 'FREE' as const, name: 'Free', tagline: 'Launch your first card', monthlyPaise: 0, yearlyPaise: 0, cardLimit: 1, popular: false,
    features: ['1 digital card', 'TapCard subdomain URL', 'QR code (PNG)', 'Basic analytics (7 days)', 'TapCard branding'] },
  { tier: 'PRO' as const, name: 'Pro', tagline: 'For growing businesses', monthlyPaise: rupees(299), yearlyPaise: rupees(2990), cardLimit: 1, popular: true,
    features: ['Everything in Free', 'Remove TapCard branding', 'QR in SVG + custom colours', 'Advanced analytics (90 days)', 'Lead capture & export', 'Menu, services & booking'] },
  { tier: 'BUSINESS' as const, name: 'Business', tagline: 'Teams and multi-location', monthlyPaise: rupees(799), yearlyPaise: rupees(7990), cardLimit: 10, popular: false,
    features: ['Everything in Pro', 'Up to 10 cards', 'Custom domain', 'Team members', 'Priority support', '10% off physical cards'] },
]

const PRODUCTS = [
  { sku: 'qr-card', name: 'QR Business Card', description: 'Classic 350gsm card with a durable printed QR that opens your digital profile.', pricePaise: rupees(299), kind: 'CARD' as const, tech: 'QR' as const, material: '350gsm matte laminate', packSize: 1, position: 0, features: ['Custom logo & colours', 'Printed QR', 'Ships in 4–6 days'] },
  { sku: 'premium-qr-card', name: 'Premium QR Card', description: 'Soft-touch, spot-UV finish. Made to be kept.', pricePaise: rupees(599), compareAtPaise: rupees(749), kind: 'CARD' as const, tech: 'QR' as const, material: '600gsm soft-touch + spot UV', badge: 'Popular', packSize: 1, position: 1, features: ['Soft-touch finish', 'Spot-UV logo', 'Gift sleeve'] },
  { sku: 'nfc-card', name: 'NFC Business Card', description: 'Tap on any modern phone — no app needed. QR printed as backup.', pricePaise: rupees(899), kind: 'CARD' as const, tech: 'NFC' as const, material: 'PVC with NTAG215 chip', badge: 'Best seller', packSize: 1, position: 2, features: ['Tap or scan', 'Works on iPhone & Android', 'Rewritable chip'] },
  { sku: 'nfc-stand', name: 'NFC Table Stand', description: 'Acrylic table stand with NFC + QR for cafés, salons and reception desks.', pricePaise: rupees(1299), kind: 'STAND' as const, tech: 'NFC' as const, material: '5mm acrylic, NFC sticker', packSize: 1, position: 3, features: ['Tap or scan', 'Anti-scratch acrylic', 'Fits A6 inserts'] },
  { sku: 'qr-stand', name: 'QR Table Stand', description: 'Compact tabletop stand printed with your QR and call-to-action.', pricePaise: rupees(499), kind: 'STAND' as const, tech: 'QR' as const, material: '3mm acrylic', packSize: 1, position: 4, features: ['Double-sided', 'Water-resistant', 'Custom CTA text'] },
  { sku: 'pack-5', name: 'QR Card 5-Pack', description: 'Five matching QR cards for your team. Save 15%.', pricePaise: rupees(1249), compareAtPaise: rupees(1495), kind: 'PACK' as const, tech: 'QR' as const, material: '350gsm matte laminate', packSize: 5, position: 5, features: ['Per-person names', 'Shared brand style', 'Save 15%'] },
  { sku: 'pack-10', name: 'NFC Card 10-Pack', description: 'Ten NFC cards with individual profiles for a growing team. Save 20%.', pricePaise: rupees(7199), compareAtPaise: rupees(8990), kind: 'PACK' as const, tech: 'NFC' as const, material: 'PVC with NTAG215 chip', badge: 'Save 20%', packSize: 10, position: 6, features: ['10 tap-ready cards', 'Bulk pricing', 'Priority production'] },
]

const TEMPLATES = [
  { key: 'restaurant', name: 'Royal Table', category: 'Restaurant', description: 'Menu, reviews and reservations in one tap.', popular: true, preset: { tagline: 'Restaurant & Cafe', bookingLabel: 'Reserve a Table', sections: ['contact', 'menu', 'reviews', 'gallery', 'social', 'links'], appearance: { themeId: 'saffron', primary: '#e8590c', background: '#fff8f1', text: '#2b1608', mode: 'light', cover: 'sunset', font: 'serif', radius: 'md', buttonStyle: 'solid' } } },
  { key: 'cafe', name: 'Morning Brew', category: 'Cafe', description: 'Cosy, warm and made for menus and Instagram.', popular: false, preset: { tagline: 'Specialty Coffee & Bakes', bookingLabel: 'Book a Table', sections: ['contact', 'menu', 'gallery', 'social', 'reviews'], appearance: { themeId: 'paper', primary: '#7c4a21', background: '#ffffff', text: '#111827', mode: 'light', cover: 'mono', font: 'serif', radius: 'none', buttonStyle: 'solid' } } },
  { key: 'salon', name: 'Glow', category: 'Salon', description: 'Services, prices and instant booking.', popular: true, preset: { tagline: 'Beauty & Wellness', bookingLabel: 'Book Appointment', sections: ['contact', 'booking', 'services', 'gallery', 'reviews', 'social'], appearance: { themeId: 'blush', primary: '#c2418a', background: '#fff5f9', text: '#3a0f27', mode: 'light', cover: 'blush', font: 'serif', radius: 'full', buttonStyle: 'outline' } } },
  { key: 'gym', name: 'Iron', category: 'Gym', description: 'Membership plans and free-trial booking.', popular: false, preset: { tagline: 'Strength · Conditioning · Community', bookingLabel: 'Book Free Trial', sections: ['contact', 'booking', 'services', 'gallery', 'social'], appearance: { themeId: 'graphite', primary: '#e2e8f0', background: '#111318', text: '#f5f6f8', mode: 'dark', cover: 'grid', font: 'inter', radius: 'sm', buttonStyle: 'outline' } } },
  { key: 'doctor', name: 'Clinical Calm', category: 'Doctor', description: 'Trust-first profile for consultants.', popular: false, preset: { tagline: 'Consultant · MD', bookingLabel: 'Book Consultation', sections: ['contact', 'booking', 'services', 'reviews', 'social'], appearance: { themeId: 'ocean', primary: '#0284c7', background: '#f2f9fd', text: '#0a2540', mode: 'light', cover: 'ocean', font: 'jakarta', radius: 'full', buttonStyle: 'solid' } } },
  { key: 'clinic', name: 'Care Clinic', category: 'Clinic', description: 'Multi-doctor clinics with timings and services.', popular: false, preset: { tagline: 'Family Health & Diagnostics', bookingLabel: 'Book Appointment', sections: ['contact', 'booking', 'services', 'reviews'], appearance: { themeId: 'emerald', primary: '#0f9d6b', background: '#f3faf6', text: '#0b2a1f', mode: 'light', cover: 'forest', font: 'inter', radius: 'lg', buttonStyle: 'solid' } } },
  { key: 'real-estate', name: 'Key & Co.', category: 'Real Estate', description: 'Listings and enquiries for property agents.', popular: false, preset: { tagline: 'Premium Homes', bookingLabel: 'Schedule Site Visit', sections: ['contact', 'booking', 'links', 'gallery', 'social'], appearance: { themeId: 'midnight', primary: '#d4a24c', background: '#0b1020', text: '#f3f4f8', mode: 'dark', cover: 'midnight', font: 'grotesk', radius: 'lg', buttonStyle: 'soft' } } },
  { key: 'freelancer', name: 'Solo', category: 'Freelancer', description: 'Portfolio links and a discovery-call button.', popular: true, preset: { tagline: 'Product & Brand Designer', bookingLabel: 'Book a Discovery Call', sections: ['contact', 'links', 'gallery', 'social', 'booking'], appearance: { themeId: 'midnight', primary: '#8b7bff', background: '#0b1020', text: '#f3f4f8', mode: 'dark', cover: 'midnight', font: 'grotesk', radius: 'lg', buttonStyle: 'soft' } } },
  { key: 'consultant', name: 'Advisor', category: 'Consultant', description: 'Authority-building profile for consultants.', popular: false, preset: { tagline: 'Growth Strategy', bookingLabel: 'Book Strategy Call', sections: ['contact', 'booking', 'services', 'social'], appearance: { themeId: 'paper', primary: '#111827', background: '#ffffff', text: '#111827', mode: 'light', cover: 'mono', font: 'serif', radius: 'none', buttonStyle: 'solid' } } },
  { key: 'retail', name: 'Storefront', category: 'Retail', description: 'Catalogue links, store hours and reviews.', popular: false, preset: { tagline: 'Ethnic wear for every occasion', bookingLabel: 'Book a Fitting', sections: ['contact', 'gallery', 'links', 'reviews', 'social'], appearance: { themeId: 'saffron', primary: '#e8590c', background: '#fff8f1', text: '#2b1608', mode: 'light', cover: 'sunset', font: 'serif', radius: 'md', buttonStyle: 'solid' } } },
]

const SECTION_ORDER: SectionKind[] = ['PROFILE', 'CONTACT', 'SOCIAL', 'MENU', 'SERVICES', 'BOOKING', 'REVIEWS', 'GALLERY', 'LINKS']

async function main() {
  console.info('Seeding TapCard…')

  await prisma.setting.upsert({
    where: { key: 'commerce' },
    update: {},
    create: { key: 'commerce', value: { gstRatePercent: 18, shippingFlatPaise: rupees(79), freeShippingOverPaise: rupees(999), productionSlaDays: 5 } },
  })

  for (const plan of PLANS) {
    const { tier, features, ...rest } = plan
    await prisma.plan.upsert({ where: { tier }, update: { ...rest, features }, create: { tier, ...rest, features } })
  }

  for (const product of PRODUCTS) {
    const { sku, features, ...rest } = product
    await prisma.product.upsert({ where: { sku }, update: { ...rest, features }, create: { sku, ...rest, features } })
  }

  for (const t of TEMPLATES) {
    const { key, preset, ...rest } = t
    await prisma.template.upsert({ where: { key }, update: { ...rest, preset }, create: { key, ...rest, preset } })
  }

  const year = new Date('2026-12-31T23:59:59Z')
  for (const c of [
    { code: 'TAP10', kind: 'PERCENT' as const, value: 10, minOrderPaise: 0, maxUses: 1000, endsAt: year },
    { code: 'WELCOME100', kind: 'FIXED' as const, value: rupees(100), minOrderPaise: rupees(499), maxUses: 5000, endsAt: year },
  ]) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: c, create: c })
  }

  // --- Demo accounts -------------------------------------------------------
  const password = await argon2.hash('TapCard@2026', { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 })

  await prisma.user.upsert({
    where: { email: 'admin@tapcard.in' },
    update: { role: 'ADMIN' },
    create: { email: 'admin@tapcard.in', name: 'Vinod Kumar', passwordHash: password, role: 'ADMIN', emailVerified: true },
  })

  const owner = await prisma.user.upsert({
    where: { email: 'rahul@royalspice.in' },
    update: {},
    create: { email: 'rahul@royalspice.in', name: 'Rahul Verma', passwordHash: password, emailVerified: true },
  })

  const existing = await prisma.business.findFirst({ where: { ownerId: owner.id } })
  if (!existing) {
    const template = await prisma.template.findUniqueOrThrow({ where: { key: 'restaurant' } })
    const business = await prisma.business.create({
      data: {
        ownerId: owner.id,
        name: 'Royal Spice',
        category: 'Restaurant',
        tagline: 'Restaurant & Cafe',
        description: 'Slow-cooked North Indian classics, tandoor specials and a warm rooftop to enjoy them in. Family-run since 2009.',
        phone: '+91 80 4123 4567',
        whatsapp: '918041234567',
        email: 'hello@royalspice.in',
        website: 'https://royalspice.in',
        address: '12, MG Road, Indiranagar, Bengaluru 560038',
        mapsUrl: 'https://maps.google.com',
        reviewUrl: 'https://g.page/r/review',
        socialLinks: { create: [{ platform: 'instagram', handle: 'royalspice.blr', position: 0 }, { platform: 'facebook', handle: 'royalspiceblr', position: 1 }] },
        customLinks: { create: [{ label: 'Order on Swiggy', url: 'https://swiggy.com', position: 0 }] },
        menuItems: {
          create: [
            { name: 'Butter Chicken', category: 'Mains', price: '₹420', description: 'Tandoori chicken in creamy tomato gravy', veg: false, position: 0 },
            { name: 'Paneer Lababdar', category: 'Mains', price: '₹360', description: 'Cottage cheese, cashew and tomato', veg: true, position: 1 },
            { name: 'Dal Makhani', category: 'Mains', price: '₹290', description: 'Overnight black lentils, slow simmered', veg: true, position: 2 },
            { name: 'Garlic Naan', category: 'Breads', price: '₹80', veg: true, position: 3 },
            { name: 'Masala Chai', category: 'Drinks', price: '₹60', veg: true, position: 4 },
          ],
        },
        hours: { create: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, opensAt: '11:00', closesAt: '23:30', closed: false })) },
      },
    })

    const card = await prisma.digitalCard.create({
      data: {
        businessId: business.id,
        slug: 'royal-spice',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        templateId: template.id,
        menuUrl: 'https://tapcard.in/royal-spice/menu',
        bookingUrl: 'https://tapcard.in/royal-spice/book',
        bookingLabel: 'Reserve a Table',
        appearance: { ...(template.preset as { appearance: object }).appearance, avatarShape: 'rounded', cardStyle: 'elevated', gallery: ['sunset', 'forest', 'aurora', 'midnight'] },
        sections: {
          create: SECTION_ORDER.map((kind, position) => ({
            kind,
            position,
            enabled: ['PROFILE', 'CONTACT', 'MENU', 'REVIEWS', 'GALLERY', 'SOCIAL', 'LINKS'].includes(kind),
          })),
        },
      },
    })
    await prisma.qRCode.create({ data: { cardId: card.id } })

    // A little history so the dashboard has something to show.
    const types = ['PAGE_VIEW', 'QR_SCAN', 'WHATSAPP_CLICK', 'PHONE_CLICK', 'WEBSITE_CLICK', 'GOOGLE_REVIEW_CLICK', 'MAP_CLICK', 'MENU_CLICK', 'BOOKING_CLICK'] as const
    const devices = ['ANDROID', 'ANDROID', 'IOS', 'DESKTOP'] as const
    const sources = ['QR scan', 'NFC tap', 'Direct link', 'Instagram']
    const events = []
    for (let day = 89; day >= 0; day--) {
      const base = 6 + Math.round(8 * Math.abs(Math.sin(day / 3.5)))
      for (let i = 0; i < base; i++) {
        const at = new Date()
        at.setDate(at.getDate() - day)
        at.setHours(9 + (i % 12), (i * 7) % 60, 0, 0)
        events.push({
          cardId: card.id,
          type: types[(day + i) % types.length],
          device: devices[(day + i) % devices.length],
          source: sources[(day + i) % sources.length],
          visitorKey: `seed-${day}-${i % 5}`,
          createdAt: at,
        })
      }
    }
    await prisma.analyticsEvent.createMany({ data: events })
    console.info(`  seeded ${events.length} analytics events`)
  }

  console.info('Seed complete.')
  console.info('  admin@tapcard.in / TapCard@2026  (ADMIN)')
  console.info('  rahul@royalspice.in / TapCard@2026  (owner of /royal-spice)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
