import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '../utils/http.js'
import { isProd } from '../lib/env.js'

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound('That endpoint does not exist.'))
}

/** The single place an error becomes a response. Internals never leak to the client. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {}
    for (const issue of err.issues) fields[issue.path.join('.') || 'form'] = issue.message
    return res.status(400).json({ error: { code: 'validation_failed', message: 'Please check the highlighted fields.', fields } })
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } })
  }

  const e = err as { code?: string; meta?: { target?: string[] } }
  if (e?.code === 'P2002') {
    const field = e.meta?.target?.[0] ?? 'value'
    return res.status(409).json({ error: { code: 'conflict', message: `That ${field} is already taken.` } })
  }
  if (e?.code === 'P2025') {
    return res.status(404).json({ error: { code: 'not_found', message: 'Not found.' } })
  }

  console.error('[unhandled]', err)
  return res.status(500).json({
    error: {
      code: 'server_error',
      message: 'Something went wrong on our side. Please try again.',
      ...(isProd ? {} : { debug: err instanceof Error ? err.message : String(err) }),
    },
  })
}
