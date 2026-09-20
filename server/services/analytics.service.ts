import { createHash } from 'node:crypto'
import { prisma } from '../lib/prisma'
import { env } from '../lib/env'
import type { DeviceKind, EventType } from '../generated/prisma/enums'

/**
 * A coarse, rotating identifier used only to approximate unique visitors.
 * It changes daily and cannot be reversed to an IP, so it never becomes a tracking id.
 */
export function visitorKey(ip: string | undefined, userAgent: string | undefined, cardId: string) {
  const day = new Date().toISOString().slice(0, 10)
  return createHash('sha256').update(`${env.ANALYTICS_SALT}|${day}|${cardId}|${ip ?? ''}|${userAgent ?? ''}`).digest('hex').slice(0, 32)
}

export function deviceFrom(userAgent: string | undefined): DeviceKind {
  const ua = (userAgent ?? '').toLowerCase()
  if (/android/.test(ua)) return 'ANDROID'
  if (/iphone|ipad|ipod/.test(ua)) return 'IOS'
  if (/windows|macintosh|linux|cros/.test(ua)) return 'DESKTOP'
  return 'OTHER'
}

const CLICK_TYPES: EventType[] = [
  'REVIEW_SUBMITTED', 'SUGGESTION_SELECTED', 'OWN_REVIEW_STARTED', 'GOOGLE_REVIEW_CLICK',
  'WHATSAPP_CLICK', 'PHONE_CLICK', 'EMAIL_CLICK', 'WEBSITE_CLICK',
  'MAP_CLICK', 'MENU_CLICK', 'BOOKING_CLICK', 'SOCIAL_CLICK', 'CUSTOM_LINK_CLICK',
]

export const rangeStart = (range: string) => {
  const days = { '1': 1, '7': 7, '30': 30, '90': 90 }[range] ?? 30
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - (days - 1))
  return { from: d, days }
}

/** One pass over the period, then shaped for the dashboard. */
export async function summarise(cardId: string, range: string) {
  const { from, days } = rangeStart(range)
  const previousFrom = new Date(from)
  previousFrom.setDate(previousFrom.getDate() - days)

  const [current, previous] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { cardId, createdAt: { gte: from } },
      select: { type: true, device: true, source: true, visitorKey: true, createdAt: true, label: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ['type'],
      where: { cardId, createdAt: { gte: previousFrom, lt: from } },
      _count: { _all: true },
    }),
  ])

  const count = (t: EventType) => current.filter((e) => e.type === t).length
  const prevCount = (t: EventType) => previous.find((p) => p.type === t)?._count._all ?? 0
  const delta = (t: EventType) => {
    const before = prevCount(t)
    if (before === 0) return count(t) > 0 ? 100 : 0
    return Number((((count(t) - before) / before) * 100).toFixed(1))
  }

  const visitors = new Set(current.filter((e) => e.visitorKey).map((e) => e.visitorKey)).size
  const reviewViews = count('REVIEW_PAGE_VIEW')
  const submitted = count('REVIEW_SUBMITTED')
  // Of the people who opened the review page, how many actually left a review.
  const conversion = reviewViews === 0 ? 0 : Number(((submitted / reviewViews) * 100).toFixed(1))

  // Bucket by day (or by hour for the single-day view).
  const byBucket = new Map<string, { scans: number; whatsapp: number; calls: number; website: number }>()
  const keyFor = (d: Date) =>
    days === 1
      ? `${String(d.getHours()).padStart(2, '0')}:00`
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  for (let i = 0; i < (days === 1 ? 24 : days); i++) {
    const d = new Date(from)
    if (days === 1) d.setHours(i)
    else d.setDate(from.getDate() + i)
    byBucket.set(keyFor(d), { scans: 0, whatsapp: 0, calls: 0, website: 0 })
  }
  for (const e of current) {
    const bucket = byBucket.get(keyFor(new Date(e.createdAt)))
    if (!bucket) continue
    if (e.type === 'QR_SCAN' || e.type === 'PAGE_VIEW' || e.type === 'REVIEW_PAGE_VIEW') bucket.scans++
    if (e.type === 'WHATSAPP_CLICK') bucket.whatsapp++
    if (e.type === 'PHONE_CLICK') bucket.calls++
    if (e.type === 'WEBSITE_CLICK') bucket.website++
  }

  const tally = <T extends string>(list: T[]) => {
    const total = list.length || 1
    const counts = list.reduce<Record<string, number>>((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {})
    return Object.entries(counts)
      .map(([name, n]) => ({ name, value: Math.round((n / total) * 100) }))
      .sort((a, b) => b.value - a.value)
  }

  const labels: Record<string, string> = {
    REVIEW_SUBMITTED: 'Review submitted', SUGGESTION_SELECTED: 'Used a suggestion',
    OWN_REVIEW_STARTED: 'Wrote their own', RATING_SELECTED: 'Chose a rating',
    MENU_CLICK: 'View Menu', WHATSAPP_CLICK: 'WhatsApp', PHONE_CLICK: 'Call', WEBSITE_CLICK: 'Website',
    GOOGLE_REVIEW_CLICK: 'Google Review', MAP_CLICK: 'Directions', BOOKING_CLICK: 'Booking',
    SOCIAL_CLICK: 'Social', EMAIL_CLICK: 'Email', CUSTOM_LINK_CLICK: 'Custom link',
  }

  return {
    range,
    metrics: {
      scans: count('QR_SCAN') + count('PAGE_VIEW') + reviewViews,
      reviewViews,
      reviewsSubmitted: submitted,
      conversion,
      visitors,
      whatsapp: count('WHATSAPP_CLICK'),
      calls: count('PHONE_CLICK'),
      website: count('WEBSITE_CLICK'),
      reviews: count('GOOGLE_REVIEW_CLICK'),
      maps: count('MAP_CLICK'),
      menu: count('MENU_CLICK'),
      bookings: count('BOOKING_CLICK'),
    },
    deltas: {
      scans: delta('PAGE_VIEW'), visitors: delta('PAGE_VIEW'), whatsapp: delta('WHATSAPP_CLICK'),
      calls: delta('PHONE_CLICK'), website: delta('WEBSITE_CLICK'), reviews: delta('GOOGLE_REVIEW_CLICK'),
      maps: delta('MAP_CLICK'), menu: delta('MENU_CLICK'), bookings: delta('BOOKING_CLICK'),
      reviewViews: delta('REVIEW_PAGE_VIEW'), reviewsSubmitted: delta('REVIEW_SUBMITTED'),
    },
    series: {
      scans: [...byBucket].map(([date, v]) => ({ date, value: v.scans })),
      clicks: [...byBucket].map(([date, v]) => ({ date, whatsapp: v.whatsapp, calls: v.calls, website: v.website })),
    },
    devices: tally(current.map((e) => ({ ANDROID: 'Android', IOS: 'iPhone', DESKTOP: 'Desktop', OTHER: 'Other' })[e.device])),
    sources: tally(current.filter((e) => e.source).map((e) => e.source as string)),
    topActions: Object.entries(
      current.filter((e) => CLICK_TYPES.includes(e.type)).reduce<Record<string, number>>((acc, e) => {
        const name = labels[e.type] ?? e.type
        return { ...acc, [name]: (acc[name] ?? 0) + 1 }
      }, {}),
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
  }
}
