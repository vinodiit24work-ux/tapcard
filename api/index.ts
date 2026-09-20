/**
 * Vercel serverless entry point.
 *
 * The API and the website deploy together to one origin, so the browser never makes a
 * cross-site request and session cookies stay first-party.
 */
export { app as default } from '../server/app'
