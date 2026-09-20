import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: {
    // Pooled connection for the app; direct connection for migrations.
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_URL'),
  },
})
