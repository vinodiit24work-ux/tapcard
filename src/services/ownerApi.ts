import type { ReviewCopy, Suggestion } from '@/types/review'

/** Empty in production: the API is served from the same origin as the site. */
const API = import.meta.env.VITE_API_URL ?? ''

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}/api${path}`, {
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    ...init,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error?.message ?? 'Something went wrong. Please try again.')
  return body as T
}

export interface OwnerReview {
  id: string
  rating: number
  text: string | null
  customerName: string | null
  edited: boolean
  status: 'PUBLISHED' | 'HIDDEN'
  device: string
  googleClickedAt: string | null
  createdAt: string
  suggestion: { text: string } | null
}

export interface ReviewStats {
  total: number
  average: number
  distribution: { rating: number; count: number }[]
  googleClicks: number
}

export const ownerApi = {
  suggestions: {
    list: () => api<{ suggestions: Suggestion[] }>('/reviews/suggestions').then((r) => r.suggestions),
    create: (text: string) => api<{ suggestion: Suggestion }>('/reviews/suggestions', { method: 'POST', body: JSON.stringify({ text }) }).then((r) => r.suggestion),
    update: (id: string, patch: { text?: string; enabled?: boolean }) =>
      api<{ suggestion: Suggestion }>(`/reviews/suggestions/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }).then((r) => r.suggestion),
    remove: (id: string) => api(`/reviews/suggestions/${id}`, { method: 'DELETE' }),
    reorder: (ids: string[]) => api<{ suggestions: Suggestion[] }>('/reviews/suggestions/order', { method: 'PUT', body: JSON.stringify({ ids }) }).then((r) => r.suggestions),
  },
  reviews: {
    list: (q: { rating?: number; status?: string; take?: number; skip?: number } = {}) => {
      const params = new URLSearchParams(Object.entries(q).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
      return api<{ reviews: OwnerReview[]; total: number; stats: ReviewStats }>(`/reviews?${params}`)
    },
    setStatus: (id: string, status: 'PUBLISHED' | 'HIDDEN') => api(`/reviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  copy: {
    update: (patch: Partial<ReviewCopy> & { askForName?: boolean; showBusinessInfo?: boolean }) =>
      api<{ copy: Record<string, unknown> }>('/reviews/copy', { method: 'PATCH', body: JSON.stringify(patch) }),
  },
}

/* ------------------------------------------------------------------ cards -- */

export interface ServerCard {
  slug: string
  status: 'DRAFT' | 'PUBLISHED'
  category: string
  businessName: string
  tagline: string
  description: string
  logo?: string
  phone: string
  whatsapp: string
  email: string
  website: string
  address: string
  mapsUrl: string
  reviewUrl: string
  instagram: string
  facebook: string
  linkedin: string
  youtube: string
  menuUrl: string
  bookingUrl: string
  bookingLabel: string
  services: { id: string; name: string; description?: string; price?: string }[]
  menu: { id: string; name: string; category: string; price: string; description?: string; veg?: boolean }[]
  customLinks: { id: string; label: string; url: string }[]
  gallery: string[]
  hours: { day: string; open: string; close: string; closed?: boolean }[]
  sections: { id: string; enabled: boolean }[]
  appearance: Record<string, unknown>
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const cardApi = {
  get: () => api<{ card: ServerCard | null }>('/cards').then((r) => r.card),

  create: (body: { name: string; category: string; slug: string; tagline?: string; description?: string; templateKey?: string }) =>
    api<{ card: ServerCard }>('/cards', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.card),

  updateBusiness: (patch: Record<string, unknown>) =>
    api<{ card: ServerCard }>('/cards/business', { method: 'PATCH', body: JSON.stringify(patch) }).then((r) => r.card),

  updateCard: (patch: Record<string, unknown>) =>
    api<{ card: ServerCard }>('/cards', { method: 'PATCH', body: JSON.stringify(patch) }).then((r) => r.card),

  setSlug: (slug: string) => api<{ card: ServerCard }>('/cards/slug', { method: 'PATCH', body: JSON.stringify({ slug }) }).then((r) => r.card),

  slugAvailable: (slug: string) =>
    api<{ slug: string; available: boolean; reason: string | null }>(`/cards/slug-available?slug=${encodeURIComponent(slug)}`),

  setSections: (sections: { id: string; enabled: boolean }[]) =>
    api<{ card: ServerCard }>('/cards/sections', { method: 'PUT', body: JSON.stringify({ sections }) }).then((r) => r.card),

  publish: () => api<{ card: ServerCard }>('/cards/publish', { method: 'POST' }).then((r) => r.card),
  unpublish: () => api<{ card: ServerCard }>('/cards/unpublish', { method: 'POST' }).then((r) => r.card),

  setSocial: (handles: { instagram: string; facebook: string; linkedin: string; youtube: string }) =>
    api<{ card: ServerCard }>('/cards/social', { method: 'PUT', body: JSON.stringify(handles) }).then((r) => r.card),

  setLinks: (links: { label: string; url: string }[]) =>
    api<{ card: ServerCard }>('/cards/links', { method: 'PUT', body: JSON.stringify({ links }) }).then((r) => r.card),

  setServices: (services: { name: string; description?: string; price?: string }[]) =>
    api<{ card: ServerCard }>('/cards/services', { method: 'PUT', body: JSON.stringify({ services }) }).then((r) => r.card),

  setMenu: (items: { name: string; category: string; price: string; description?: string; veg: boolean }[]) =>
    api<{ card: ServerCard }>('/cards/menu', { method: 'PUT', body: JSON.stringify({ items }) }).then((r) => r.card),

  setHours: (hours: { day: string; open: string; close: string; closed?: boolean }[]) =>
    api<{ card: ServerCard }>('/cards/hours', {
      method: 'PUT',
      body: JSON.stringify({
        hours: hours.map((h) => ({ dayOfWeek: DAYS.indexOf(h.day), opensAt: h.open, closesAt: h.close, closed: !!h.closed })),
      }),
    }).then((r) => r.card),
}

export interface AnalyticsSummary {
  range: string
  metrics: Record<string, number>
  deltas: Record<string, number>
  series: { scans: { date: string; value: number }[]; clicks: { date: string; whatsapp: number; calls: number; website: number }[] }
  devices: { name: string; value: number }[]
  sources: { name: string; value: number }[]
  topActions: { name: string; value: number }[]
}

export const analyticsApi = {
  summary: (range: string) => api<AnalyticsSummary>(`/analytics/summary?range=${range}`),
}
