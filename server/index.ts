import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { env, isProd } from './lib/env'
import { assertDatabase, prisma } from './lib/prisma'
import { errorHandler, notFound } from './middleware/error'
import { generalLimiter } from './middleware/rateLimit'
import { authRouter } from './routes/auth.routes'
import { cardRouter } from './routes/card.routes'
import { publicRouter } from './routes/public.routes'
import { analyticsRouter } from './routes/analytics.routes'
import { reviewRouter } from './routes/review.routes'

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
app.use('/api/public', publicRouter)

app.use(notFound)
app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  assertDatabase()
    .then(() => {
      app.listen(env.PORT, () => console.info(`TapCard API listening on ${env.API_URL} (${env.NODE_ENV})`))
    })
    .catch((e) => {
      console.error('\nCould not reach the database. Check DATABASE_URL in .env\n', e instanceof Error ? e.message : e)
      process.exit(1)
    })

  const shutdown = async () => {
    await prisma.$disconnect()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}
