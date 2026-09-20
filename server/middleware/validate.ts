import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'

/** Parses and replaces the request part, so handlers only ever see validated data. */
export const validate =
  <T>(schema: ZodType<T>, part: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part])
    if (!result.success) return next(result.error)
    if (part === 'body') req.body = result.data
    else Object.defineProperty(req, part, { value: result.data, writable: true, configurable: true })
    next()
  }
