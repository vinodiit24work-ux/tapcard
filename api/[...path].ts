/**
 * Vercel serverless entry point for the whole API.
 *
 * A catch-all route keeps the original request path (`/api/health`, `/api/public/...`)
 * intact, so the Express router sees exactly what it sees locally.
 *
 * The website and API deploy to one origin, which keeps session cookies first-party.
 */
export { app as default } from '../server/app.js'
