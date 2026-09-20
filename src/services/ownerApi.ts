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

/* ------------------------------------------------- admin: card requests -- */

export const REQUEST_FLOW = [
  'NEW_REQUEST', 'CONTACT_CUSTOMER', 'ORDER_CONFIRMED', 'CREATING_CARD', 'GOOGLE_CONNECTED',
  'PREVIEW_READY', 'CUSTOMER_APPROVAL', 'REVISION_REQUESTED', 'APPROVED', 'FINAL_CARD_READY',
  'DIGITAL_CARD_SENT', 'PHYSICAL_CARD_PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
] as const
export type RequestStatus = (typeof REQUEST_FLOW)[number]

export const STATUS_LABEL: Record<RequestStatus, string> = {
  NEW_REQUEST: 'New Request',
  CONTACT_CUSTOMER: 'Contact Customer',
  ORDER_CONFIRMED: 'Order Confirmed',
  CREATING_CARD: 'Creating Card',
  GOOGLE_CONNECTED: 'Google Review Connected',
  PREVIEW_READY: 'Preview Ready',
  CUSTOMER_APPROVAL: 'Customer Approval',
  REVISION_REQUESTED: 'Revision Requested',
  APPROVED: 'Approved',
  FINAL_CARD_READY: 'Final Card Ready',
  DIGITAL_CARD_SENT: 'Digital Card Sent',
  PHYSICAL_CARD_PREPARING: 'Physical Card Preparing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export interface CardRequest {
  id: string
  reference: string
  businessName: string
  contactName: string
  phone: string
  whatsapp: string
  email: string
  category: string
  city: string
  address: string
  wantsPhysical: boolean
  wantsDigital: boolean
  notes: string | null
  status: RequestStatus
  businessId: string | null
  createdAt: string
  business: null | {
    id: string
    name: string
    logoUrl: string | null
    reviewUrl: string
    googleName: string | null
    googleAddress: string | null
    googleConnectedAt: string | null
    googleVerifiedBy: string | null
    suggestions: Suggestion[]
    card: null | { slug: string; status: string; approvalStatus: string; approvalSentAt: string | null; approvedAt: string | null; revisionNote: string | null }
  }
  events: { id: string; status: RequestStatus; note: string | null; createdAt: string }[]
  readiness: { ready: boolean; checks: { id: string; label: string; done: boolean }[] }
  links: { review: string; card: string } | null
}

export const requestApi = {
  list: (q: { status?: string; q?: string } = {}) => {
    const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][])
    return api<{ requests: CardRequest[]; counts: Record<string, number> }>(`/admin/requests?${p}`)
  },
  get: (id: string) => api<{ request: CardRequest; card: ServerCard | null }>(`/admin/requests/${id}`),
  update: (id: string, patch: Record<string, unknown>) =>
    api<{ request: CardRequest }>(`/admin/requests/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }).then((r) => r.request),
  setStatus: (id: string, status: RequestStatus, note?: string) =>
    api<{ request: CardRequest }>(`/admin/requests/${id}/status`, { method: 'POST', body: JSON.stringify({ status, note }) }).then((r) => r.request),
  build: (id: string, body: { slug: string; templateKey?: string }) =>
    api<{ request: CardRequest }>(`/admin/requests/${id}/build`, { method: 'POST', body: JSON.stringify(body) }).then((r) => r.request),
  connectGoogle: (id: string, body: { reviewUrl: string; placeId?: string; googleName?: string; googleAddress?: string; verified: true }) =>
    api<{ request: CardRequest }>(`/admin/requests/${id}/google`, { method: 'POST', body: JSON.stringify(body) }).then((r) => r.request),
  updateBusiness: (id: string, patch: Record<string, unknown>) =>
    api<{ request: CardRequest }>(`/admin/requests/${id}/business`, { method: 'PATCH', body: JSON.stringify(patch) }).then((r) => r.request),
  updateCard: (id: string, patch: Record<string, unknown>) =>
    api<{ request: CardRequest }>(`/admin/requests/${id}/card`, { method: 'PATCH', body: JSON.stringify(patch) }).then((r) => r.request),
  setSuggestions: (id: string, suggestions: { text: string; enabled: boolean }[]) =>
    api<{ request: CardRequest }>(`/admin/requests/${id}/suggestions`, { method: 'PUT', body: JSON.stringify({ suggestions }) }).then((r) => r.request),
  generate: (id: string) =>
    api<{ request: CardRequest }>(`/admin/requests/${id}/generate`, { method: 'POST' }).then((r) => r.request),
  send: (id: string, channel: 'whatsapp' | 'email' | 'link') =>
    api<{ link: string; message: string; whatsapp: string | null; mailto: string | null; reviewLink: string; cardLink: string }>(
      `/admin/requests/${id}/send`,
      { method: 'POST', body: JSON.stringify({ channel }) },
    ),
}

/** Public: the "Get My TapCard" form and the customer's approval screen. */
export const publicApi = {
  submitRequest: (body: Record<string, unknown>) =>
    api<{ request: { reference: string; businessName: string } }>('/public/requests', { method: 'POST', body: JSON.stringify(body) }),
  approval: (token: string) =>
    api<{ card: Record<string, unknown>; approval: { status: string; note: string | null }; links: { review: string; card: string } }>(`/public/approve/${token}`),
  decide: (token: string, decision: 'approve' | 'changes', note?: string) =>
    api<{ ok: boolean; status: string }>('/public/approve', { method: 'POST', body: JSON.stringify({ token, decision, note }) }),
}
