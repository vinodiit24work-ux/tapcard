/** Words that would collide with application routes and must never become a card slug. */
export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'app', 'about', 'auth', 'billing', 'blog', 'cart', 'checkout', 'contact',
  'dashboard', 'demo', 'docs', 'faq', 'features', 'forgot-password', 'help', 'login', 'logout',
  'onboarding', 'pricing', 'privacy', 'refund-policy', 'register', 'settings', 'signup',
  'support', 'tapcard', 'templates', 'terms', 'verify-email', 'www',
])

export const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

export const isValidSlug = (slug: string) => /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug) && !RESERVED_SLUGS.has(slug)
