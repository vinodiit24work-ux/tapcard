import type { NextFunction, Request, Response } from 'express'
import { cookieNames, verifyAccessToken, type AccessClaims } from '../services/auth.service'
import { ApiError } from '../utils/http'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AccessClaims
    }
  }
}

const readToken = (req: Request) => {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) return header.slice(7)
  return req.cookies?.[cookieNames.access] as string | undefined
}

/** Attaches `req.auth` when a valid token is present; never rejects. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req)
  if (token) {
    try {
      req.auth = verifyAccessToken(token)
    } catch {
      /* an invalid token is treated as anonymous here */
    }
  }
  next()
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req)
  if (!token) return next(ApiError.unauthorized())
  try {
    req.auth = verifyAccessToken(token)
    next()
  } catch (e) {
    next(e)
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(ApiError.unauthorized())
  if (req.auth.role !== 'ADMIN') return next(ApiError.forbidden('This area is restricted to administrators.'))
  next()
}
