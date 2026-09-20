import 'dotenv/config'
import { z } from 'zod'

/**
 * Fail fast on a bad environment: a server that boots with a missing secret is worse
 * than one that refuses to start.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  APP_URL: z.string().url().default('http://localhost:5173'),
  /// Extra browser origins allowed to call the API (comma separated), e.g. a LAN address.
  EXTRA_ORIGINS: z.string().default(''),
  API_URL: z.string().url().default('http://localhost:4000'),
  PUBLIC_ORIGIN: z.string().default('https://tapcard.in'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ANALYTICS_SALT: z.string().min(16, 'ANALYTICS_SALT must be at least 16 characters'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default('tapcard-media'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  EMAIL_FROM: z.string().default('TapCard <hello@tapcard.in>'),
  SMTP_URL: z.string().optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
  console.error(`\nInvalid environment configuration:\n${issues}\n\nCopy .env.example to .env and fill it in.\n`)
  process.exit(1)
}

export const env = parsed.data
export const isProd = env.NODE_ENV === 'production'
