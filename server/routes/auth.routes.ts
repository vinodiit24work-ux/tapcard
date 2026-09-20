import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { env } from '../lib/env.js'
import { ApiError, handler } from '../utils/http.js'
import { validate } from '../middleware/validate.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { requireAuth } from '../middleware/auth.js'
import {
  changePasswordSchema, forgotSchema, loginSchema, registerSchema, resetSchema, updateAccountSchema, verifySchema,
} from '../validators/auth.validators.js'
import {
  clearAuthCookies, cookieNames, createSession, hashPassword, hashToken, oneTimeToken, revokeAllSessions,
  revokeSession, rotateSession, setAuthCookies, signAccessToken, verifyPassword,
} from '../services/auth.service.js'

export const authRouter = Router()

const publicUser = (u: { id: string; name: string; email: string; role: string; emailVerified: boolean }) => ({
  name: u.name,
  email: u.email,
  role: u.role,
  verified: u.emailVerified,
})

/** Emails are queued in Phase 8; until then the link is logged for local testing. */
const deliver = (kind: string, to: string, link: string) => {
  if (env.NODE_ENV !== 'production') console.info(`[email:${kind}] ${to} → ${link}`)
}

authRouter.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  handler(async (req, res) => {
    const { name, email, password } = req.body as { name: string; email: string; password: string }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (existing) throw ApiError.conflict('An account with that email already exists.', 'email_taken')

    const verify = oneTimeToken(24)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        verifyToken: verify.hash,
        verifyTokenExpiry: verify.expires,
      },
    })

    deliver('verify', email, `${env.APP_URL}/verify-email?token=${verify.token}`)

    const session = await createSession(user.id, req.headers['user-agent'], req.ip)
    setAuthCookies(res, signAccessToken({ sub: user.id, role: user.role, email: user.email }), session.token, session.expiresAt)

    res.status(201).json({
      user: publicUser(user),
      // Returned outside production so the flow is testable without an inbox.
      ...(env.NODE_ENV === 'production' ? {} : { verifyToken: verify.token }),
    })
  }),
)

authRouter.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  handler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string }
    const user = await prisma.user.findUnique({ where: { email } })

    // Same response whether the account is missing or the password is wrong.
    const invalid = ApiError.unauthorized('Those details do not match an account.')
    if (!user || user.deletedAt) throw invalid
    if (!(await verifyPassword(user.passwordHash, password))) throw invalid

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    const session = await createSession(user.id, req.headers['user-agent'], req.ip)
    setAuthCookies(res, signAccessToken({ sub: user.id, role: user.role, email: user.email }), session.token, session.expiresAt)
    res.json({ user: publicUser(user) })
  }),
)

authRouter.post(
  '/refresh',
  handler(async (req, res) => {
    const token = req.cookies?.[cookieNames.refresh]
    if (!token) throw ApiError.unauthorized()
    const { token: next, expiresAt, user } = await rotateSession(token, req.headers['user-agent'], req.ip)
    setAuthCookies(res, signAccessToken({ sub: user.id, role: user.role, email: user.email }), next, expiresAt)
    res.json({ user: publicUser(user) })
  }),
)

authRouter.post(
  '/logout',
  handler(async (req, res) => {
    const token = req.cookies?.[cookieNames.refresh]
    if (token) await revokeSession(token)
    clearAuthCookies(res)
    res.json({ ok: true })
  }),
)

authRouter.get(
  '/me',
  requireAuth,
  handler(async (req, res) => {
    const user = await prisma.user.findFirst({
      where: { id: req.auth!.sub, deletedAt: null },
      include: { businesses: { where: { deletedAt: null }, select: { id: true }, take: 1 } },
    })
    if (!user) throw ApiError.unauthorized()
    res.json({ user: publicUser(user), hasBusiness: user.businesses.length > 0 })
  }),
)

authRouter.post(
  '/verify-email',
  validate(verifySchema),
  handler(async (req, res) => {
    const { token } = req.body as { token: string }
    const user = await prisma.user.findFirst({
      where: { verifyToken: hashToken(token), verifyTokenExpiry: { gt: new Date() } },
    })
    if (!user) throw ApiError.badRequest('That verification link is invalid or has expired.')
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null, verifyTokenExpiry: null },
    })
    res.json({ ok: true })
  }),
)

authRouter.post(
  '/resend-verification',
  authLimiter,
  requireAuth,
  handler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.sub } })
    if (user.emailVerified) return res.json({ ok: true })
    const verify = oneTimeToken(24)
    await prisma.user.update({ where: { id: user.id }, data: { verifyToken: verify.hash, verifyTokenExpiry: verify.expires } })
    deliver('verify', user.email, `${env.APP_URL}/verify-email?token=${verify.token}`)
    res.json({ ok: true, ...(env.NODE_ENV === 'production' ? {} : { verifyToken: verify.token }) })
  }),
)

authRouter.post(
  '/forgot-password',
  authLimiter,
  validate(forgotSchema),
  handler(async (req, res) => {
    const { email } = req.body as { email: string }
    const user = await prisma.user.findUnique({ where: { email } })
    if (user && !user.deletedAt) {
      const reset = oneTimeToken(0.5)
      await prisma.user.update({ where: { id: user.id }, data: { resetToken: reset.hash, resetTokenExpiry: reset.expires } })
      deliver('reset', email, `${env.APP_URL}/reset-password?token=${reset.token}`)
    }
    // Always the same answer, so this cannot be used to discover accounts.
    res.json({ ok: true })
  }),
)

authRouter.post(
  '/reset-password',
  authLimiter,
  validate(resetSchema),
  handler(async (req, res) => {
    const { token, password } = req.body as { token: string; password: string }
    const user = await prisma.user.findFirst({ where: { resetToken: hashToken(token), resetTokenExpiry: { gt: new Date() } } })
    if (!user) throw ApiError.badRequest('That reset link is invalid or has expired.')
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password), resetToken: null, resetTokenExpiry: null },
    })
    // A password reset invalidates every existing session.
    await revokeAllSessions(user.id)
    clearAuthCookies(res)
    res.json({ ok: true })
  }),
)

authRouter.patch(
  '/account',
  requireAuth,
  validate(updateAccountSchema),
  handler(async (req, res) => {
    const { name, email } = req.body as { name?: string; email?: string }
    if (email) {
      const clash = await prisma.user.findFirst({ where: { email, NOT: { id: req.auth!.sub } }, select: { id: true } })
      if (clash) throw ApiError.conflict('That email is already in use.', 'email_taken')
    }
    const user = await prisma.user.update({
      where: { id: req.auth!.sub },
      data: { ...(name ? { name } : {}), ...(email ? { email, emailVerified: false } : {}) },
    })
    res.json({ user: publicUser(user) })
  }),
)

authRouter.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  handler(async (req, res) => {
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.sub } })
    if (!(await verifyPassword(user.passwordHash, currentPassword))) {
      throw ApiError.badRequest('Your current password is not correct.')
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } })
    await revokeAllSessions(user.id)
    clearAuthCookies(res)
    res.json({ ok: true })
  }),
)
