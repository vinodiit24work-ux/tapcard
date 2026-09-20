import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { env, isProd } from './env.js'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

export const prisma = new PrismaClient({
  adapter,
  log: isProd ? ['error'] : ['warn', 'error'],
})

export async function assertDatabase() {
  await prisma.$queryRaw`SELECT 1`
}
