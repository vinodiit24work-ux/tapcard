import { randomBytes, randomInt } from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { env } from '../lib/env.js'
import type { RequestStatus } from '../generated/prisma/enums.js'

export const requestReference = () => `REQ-${randomInt(10000, 99999)}`

/** Opaque, single-purpose token: it only ever lets a customer approve their own card. */
export const approvalToken = () => randomBytes(24).toString('base64url')

export const reviewLink = (slug: string) => `${env.PUBLIC_ORIGIN.replace(/\/$/, '')}/review/${slug}`
export const cardLink = (slug: string) => `${env.PUBLIC_ORIGIN.replace(/\/$/, '')}/card/${slug}`
export const approvalLink = (token: string) => `${env.PUBLIC_ORIGIN.replace(/\/$/, '')}/approve/${token}`

export const requestInclude = {
  business: {
    include: {
      card: { select: { slug: true, status: true, approvalStatus: true, approvalSentAt: true, approvedAt: true, revisionNote: true } },
      suggestions: { orderBy: { position: 'asc' } },
    },
  },
  events: { orderBy: { createdAt: 'desc' }, take: 30 },
  assignedTo: { select: { name: true, email: true } },
} as const

/** Records a status move on the request and its timeline in one transaction. */
export async function moveStatus(requestId: string, status: RequestStatus, actorId?: string, note?: string) {
  const [updated] = await prisma.$transaction([
    prisma.cardRequest.update({ where: { id: requestId }, data: { status } }),
    prisma.cardRequestEvent.create({ data: { requestId, status, actorId, note } }),
  ])
  return updated
}

/**
 * What still has to be true before a final card can be generated.
 * Returned to the admin UI so the checklist reflects real state, not a guess.
 */
export function readiness(r: {
  business: null | {
    name: string
    phone: string
    logoUrl: string | null
    reviewUrl: string
    googleConnectedAt: Date | null
    suggestions: { enabled: boolean }[]
    card: null | { slug: string }
  }
}) {
  const b = r.business
  const suggestions = b?.suggestions.filter((s) => s.enabled).length ?? 0
  const checks = [
    { id: 'business', label: 'Business information complete', done: Boolean(b?.name && b.phone) },
    { id: 'logo', label: 'Logo added', done: Boolean(b?.logoUrl) },
    { id: 'card', label: 'Card created and styled', done: Boolean(b?.card?.slug) },
    { id: 'google', label: 'Google review connected', done: Boolean(b?.googleConnectedAt && b.reviewUrl) },
    { id: 'suggestions', label: 'Review phrases configured', done: suggestions >= 2 },
    { id: 'qr', label: 'QR generated from the permanent review link', done: Boolean(b?.card?.slug) },
    { id: 'nfc', label: 'NFC destination configured', done: Boolean(b?.card?.slug) },
  ]
  return { checks, ready: checks.every((c) => c.done) }
}

/** The message the team sends. Kept in one place so every channel says the same thing. */
export function handoverMessage(businessName: string, link: string) {
  return `Hi! Your TapCard for ${businessName} is ready. Please review your digital card and confirm if everything looks correct: ${link}`
}
