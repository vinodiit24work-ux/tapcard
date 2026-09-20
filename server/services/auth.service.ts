import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'node:crypto'
import type { Response } from 'express'
import { prisma } from '../lib/prisma'
import { env, isProd } from '../lib/env'
import { ApiError } from '../utils/http'
import type { Role } from '../generated/prisma/enums'

const ACCESS_TTL = '15m'
const REFRESH_DAYS = 30
const ACCESS_COOKIE = 'tc_access'
const REFRESH_COOKIE = 'tc_refresh'

export interface AccessClaims {
  sub: string
  role: Role
  email: string
}

/** Argon2id with sensible cost. Hashing is deliberately slow. */
export const hashPassword = (plain: string) =>
  argon2.hash(plain, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 })

export const verifyPassword = async (hash: string, plain: string) => {
  try {
    return await argon2.verify(hash, plain)
  } catch {
    return false
  }
}

export const signAccessToken = (claims: AccessClaims) =>
  jwt.sign(claims, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL, issuer: 'tapcard' })

export const verifyAccessToken = (token: string): AccessClaims => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: 'tapcard' }) as AccessClaims
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.')
  }
}

/** Opaque random token for the client; only its hash is ever stored. */
const newRefreshToken = () => {
  const token = randomBytes(48).toString('base64url')
  return { token, hash: createHash('sha256').update(token).digest('hex') }
}

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export async function createSession(userId: string, userAgent?: string, ip?: string) {
  const { token, hash } = newRefreshToken()
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000)
  await prisma.session.create({ data: { userId, tokenHash: hash, userAgent, ip, expiresAt } })
  return { token, expiresAt }
}

export async function rotateSession(refreshToken: string, userAgent?: string, ip?: string) {
  const existing = await prisma.session.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
    include: { user: true },
  })
  if (!existing || existing.revokedAt || existing.expiresAt < new Date() || existing.user.deletedAt) {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.')
  }
  // Single-use refresh tokens: the old one is revoked the moment it is exchanged.
  const { token, hash } = newRefreshToken()
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000)
  await prisma.$transaction([
    prisma.session.update({ where: { id: existing.id }, data: { revokedAt: new Date() } }),
    prisma.session.create({ data: { userId: existing.userId, tokenHash: hash, userAgent, ip, expiresAt } }),
  ])
  return { token, expiresAt, user: existing.user }
}

export async function revokeSession(refreshToken: string) {
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export const revokeAllSessions = (userId: string) =>
  prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } })

const cookieBase = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  path: '/',
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string, refreshExpiry: Date) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 })
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieBase, expires: refreshExpiry })
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, cookieBase)
  res.clearCookie(REFRESH_COOKIE, cookieBase)
}

export const cookieNames = { access: ACCESS_COOKIE, refresh: REFRESH_COOKIE }

/** Single-use, time-limited tokens for email verification and password reset. */
export function oneTimeToken(hours: number) {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashToken(token), expires: new Date(Date.now() + hours * 60 * 60 * 1000) }
}
