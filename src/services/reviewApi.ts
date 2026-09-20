import type { ReviewCardData, ReviewEvent, SubmittedReview } from '@/types/review'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}/api${path}`, {
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    ...init,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error?.message ?? 'Something went wrong. Please try again.')
  return body as T
}

export const reviewApi = {
  /**
   * Public: the review experience behind a QR code.
   * The response is briefly cacheable for customers; owner previews pass `fresh` so an
   * edit is visible immediately rather than after the cache window.
   */
  getCard: (slug: string, fresh = false) =>
    request<{ card: ReviewCardData }>(`/public/review/${encodeURIComponent(slug)}`, fresh ? { cache: 'no-store' } : undefined).then((r) => r.card),

  submit: (slug: string, review: { rating: number; text?: string; customerName?: string; suggestionId?: string }) =>
    request<{ review: SubmittedReview; googleReviewUrl: string }>('/public/reviews', {
      method: 'POST',
      body: JSON.stringify({ slug, ...review }),
    }),

  /** A click through to Google — recorded as a click, never as a completed Google review. */
  googleClick: (reviewId: string) =>
    request(`/public/reviews/${reviewId}/google-click`, { method: 'POST' }).catch(() => undefined),

  event: (slug: string, type: ReviewEvent, label?: string) =>
    request('/public/events', { method: 'POST', body: JSON.stringify({ slug, type, label }) }).catch(() => undefined),
}
