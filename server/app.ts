import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { env, isProd } from './lib/env.js'
import { assertDatabase } from './lib/prisma.js'
import { errorHandler, notFound } from './middleware/error.js'
import { generalLimiter } from './middleware/rateLimit.js'
import { authRouter } from './routes/auth.routes.js'
import { cardRouter } from './routes/card.routes.js'
import { publicRouter } from './routes/public.routes.js'
import { analyticsRouter } from './routes/analytics.routes.js'
import { reviewRouter } from './routes/review.routes.js'
import { requestRouter } from './routes/request.routes.js'

export const app = express()

app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(
  helmet({
    // The API serves JSON and QR images, never HTML, so a strict default is fine.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: isProd ? undefined : false,
  }),
)

const allowedOrigins = [
  env.APP_URL,
  env.PUBLIC_ORIGIN,
  'http://localhost:5173',
  'http://localhost:4173',
  ...env.EXTRA_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
]

app.use(
  cors({
    // Requests without an Origin (curl, health checks, NFC redirects) are allowed through;
    // browser requests must come from a known origin because sessions ride on cookies.
    origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('Origin not allowed'))),
    credentials: true,
  }),
)

app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())
app.use(generalLimiter)

app.get('/api/health', async (_req, res) => {
  try {
    await assertDatabase()
    res.json({ ok: true, service: 'tapcard-api', database: 'connected' })
  } catch {
    res.status(503).json({ ok: false, service: 'tapcard-api', database: 'unreachable' })
  }
})

app.use('/api/auth', authRouter)
app.use('/api/cards', cardRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/admin/requests', requestRouter)
app.use('/api/public', publicRouter)

app.use(notFound)
app.use(errorHandler)
