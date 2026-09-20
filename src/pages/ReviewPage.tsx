import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ReviewExperience } from '@/features/review/ReviewExperience'
import { reviewApi } from '@/services/reviewApi'
import { ButtonLink } from '@/components/ui/Button'
import { LogoMark } from '@/components/ui/Logo'
import type { ReviewCardData, ReviewEvent, SubmittedReview } from '@/types/review'
import { cardUrl } from '@/lib/format'

/**
 * The permanent destination for a business's QR code and NFC tag.
 *
 * The URL never changes, so a printed card keeps working while the owner edits their
 * suggestions, branding or Google link. Everything shown here is fetched fresh.
 */
export function ReviewPage() {
  const { slug = '' } = useParams()
  const [params] = useSearchParams()
  const [card, setCard] = useState<ReviewCardData | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  const submittedId = useRef<string | null>(null)

  const load = useCallback(() => {
    setState('loading')
    reviewApi
      .getCard(slug)
      .then((c) => {
        setCard(c)
        setState('ready')
      })
      .catch((e: Error) => setState(/not published|no review card/i.test(e.message) ? 'missing' : 'error'))
  }, [slug])

  useEffect(load, [load])

  useEffect(() => {
    if (!card) return
    const prev = document.title
    document.title = `Review ${card.businessName}`
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content')
    meta?.setAttribute('content', `Share your experience at ${card.businessName}. It takes a few seconds.`)
    // A review page is a private interaction, not something search engines should index.
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.appendChild(robots)
    const theme = document.querySelector('meta[name="theme-color"]') ?? document.createElement('meta')
    theme.setAttribute('name', 'theme-color')
    theme.setAttribute('content', card.appearance.primary)
    document.head.appendChild(theme)
    return () => {
      document.title = prev
      if (prevDesc) meta?.setAttribute('content', prevDesc)
      robots.remove()
    }
  }, [card])

  const onEvent = useCallback(
    (type: ReviewEvent, label?: string) => {
      // `?src=qr` / `?src=nfc` lets a business tell printed media apart.
      const source = params.get('src') ?? undefined
      void reviewApi.event(slug, type, label ?? source)
    },
    [slug, params],
  )

  const onSubmit = useCallback(
    async (review: { rating: number; text?: string; customerName?: string; suggestionId?: string }): Promise<SubmittedReview> => {
      const { review: saved } = await reviewApi.submit(slug, review)
      submittedId.current = saved.id
      return saved
    },
    [slug],
  )

  const onGoogleClick = useCallback(() => {
    if (submittedId.current) void reviewApi.googleClick(submittedId.current)
    else onEvent('GOOGLE_REVIEW_CLICK')
  }, [onEvent])

  if (state === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ink-50">
        <span className="size-7 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" role="status" aria-label="Loading" />
      </div>
    )
  }

  if (state === 'missing' || state === 'error') {
    const missing = state === 'missing'
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-6 text-center">
        <LogoMark className="size-12" />
        <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">
          {missing ? 'This review card is not live' : 'We could not load this page'}
        </h1>
        <p className="mt-2 max-w-sm text-[15px] text-ink-500">
          {missing ? (
            <>
              Nothing is published at <span className="font-mono text-ink-700">{cardUrl(slug).replace('https://', '')}</span>. If this is your
              business, you can claim the link.
            </>
          ) : (
            'Please check your connection and try again.'
          )}
        </p>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          {missing ? (
            <ButtonLink to="/register" size="lg">Claim this link</ButtonLink>
          ) : (
            <button onClick={load} className="h-12 rounded-xl bg-brand-600 px-6 text-[15px] font-medium text-white hover:bg-brand-700">
              Try again
            </button>
          )}
          <ButtonLink to="/" size="lg" variant="secondary">Go to TapCard</ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh" style={{ background: card!.appearance.background }}>
      <div className="mx-auto min-h-dvh w-full max-w-[460px] shadow-[0_0_80px_-20px_rgba(15,23,42,0.18)]">
        <ReviewExperience card={card!} live onSubmit={onSubmit} onEvent={onEvent} onGoogleClick={onGoogleClick} />
      </div>
    </div>
  )
}
