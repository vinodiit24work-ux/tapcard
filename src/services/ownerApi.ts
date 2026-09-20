import type { ReviewCopy, Suggestion } from '@/types/review'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

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
