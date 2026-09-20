import { env } from './lib/env'
import { assertDatabase, prisma } from './lib/prisma'
import { app } from './app'

/** Local development and traditional hosts. Serverless entry points import `app` directly. */
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
