import type { NextFunction, Request, RequestHandler, Response } from 'express'

/** An error we intend to show the client. Anything else becomes a generic 500. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code = 'error',
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static badRequest = (m = 'Invalid request', details?: unknown) => new ApiError(400, m, 'bad_request', details)
  static unauthorized = (m = 'You need to be signed in') => new ApiError(401, m, 'unauthorized')
  static forbidden = (m = 'You do not have access to this') => new ApiError(403, m, 'forbidden')
  static notFound = (m = 'Not found') => new ApiError(404, m, 'not_found')
  static conflict = (m = 'That already exists', code = 'conflict') => new ApiError(409, m, code)
  static tooMany = (m = 'Too many requests. Please slow down.') => new ApiError(429, m, 'rate_limited')
}

/** Forwards rejected promises to the error middleware. */
export const handler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next)
  }
