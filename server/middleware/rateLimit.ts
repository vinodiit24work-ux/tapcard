import rateLimit from 'express-rate-limit'

const message = { error: { code: 'rate_limited', message: 'Too many requests. Please try again shortly.' } }

export const generalLimiter = rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false, message })

/** Deliberately strict: these endpoints are the ones worth brute forcing. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message,
})

/** Public and unauthenticated, so it is capped per IP to keep analytics honest. */
export const eventLimiter = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false, message })
