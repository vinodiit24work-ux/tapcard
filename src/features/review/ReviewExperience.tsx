import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Check, Globe, MapPin, MessageCircle, PartyPopper, Pencil, Phone, Star } from 'lucide-react'
import type { ReviewCardData, ReviewEvent, SubmittedReview } from '@/types/review'
import { StarRating } from '@/components/review/StarRating'
import { alpha, covers, fonts, onColor, radii } from '@/lib/theme'
import { digitsOnly, initials } from '@/lib/format'
import { cn } from '@/lib/cn'

type Step = 'rate' | 'write' | 'thanks'

interface Props {
  card: ReviewCardData
  /** False in the builder and demo previews: nothing is submitted and links do not open. */
  live?: boolean
  onSubmit?: (review: { rating: number; text?: string; customerName?: string; suggestionId?: string }) => Promise<SubmittedReview>
  onEvent?: (event: ReviewEvent, label?: string) => void
  onGoogleClick?: () => void
  /** Lets the builder preview a specific step. */
  forceStep?: Step
  className?: string
}

/**
 * The customer-facing review experience — what a QR scan or NFC tap opens.
 *
 * Deliberate choices:
 * - No rating is preselected, and submission is blocked until the customer picks one.
 * - Suggestions are a starting point, never a substitute: the text drops into an editable
 *   box and the customer can change or clear it before submitting.
 * - The Google call to action is offered after submitting, to everyone, whatever they rated.
 *   Routing only happy customers to Google would be review gating, which is deceptive and
 *   against Google's policies, so this component does not do it.
 */
export function ReviewExperience({ card, live = false, onSubmit, onEvent, onGoogleClick, forceStep, className }: Props) {
  const a = card.appearance
  const dark = a.mode === 'dark'
  const r = radii[a.radius]

  const [step, setStep] = useState<Step>('rate')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [chosen, setChosen] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState<SubmittedReview | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const startedOwn = useRef(false)

  const activeStep = forceStep ?? step

  useEffect(() => {
    if (live) onEvent?.('REVIEW_PAGE_VIEW')
    // A page view is recorded once per mount, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])

  const vars = useMemo(
    () =>
      ({
        '--c-bg': a.background,
        '--c-text': a.text,
        '--c-primary': a.primary,
        '--c-on': onColor(a.primary),
        '--c-surface': dark ? 'rgba(255,255,255,0.06)' : '#ffffff',
        '--c-border': dark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.10)',
        '--c-muted': alpha(a.text, 0.62),
        '--c-soft': alpha(a.primary, dark ? 0.22 : 0.10),
        '--r-btn': r.btn,
        '--r-card': r.card,
        fontFamily: fonts[a.font].family,
        background: a.background,
        color: a.text,
      }) as CSSProperties,
    [a, dark, r],
  )

  const primaryBtn: CSSProperties = {
    borderRadius: 'var(--r-btn)',
    background: 'var(--c-primary)',
    color: 'var(--c-on)',
    boxShadow: `0 8px 20px -8px ${alpha(a.primary, 0.6)}`,
  }
  const surface: CSSProperties = {
    background: 'var(--c-surface)',
    borderRadius: 'var(--r-card)',
    // Longhand only: mixing `border` with `borderColor` makes React warn and can drop styles.
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--c-border)',
    boxShadow: a.cardStyle === 'elevated' ? '0 10px 30px -18px rgba(15,23,42,0.35)' : 'none',
  }

  const chooseRating = (v: number) => {
    setRating(v)
    setError('')
    if (live) onEvent?.('RATING_SELECTED', String(v))
  }

  const chooseSuggestion = (id: string, value: string) => {
    if (chosen === id) {
      // Tapping the selected suggestion again clears it — the customer stays in control.
      setChosen(null)
      setText('')
      return
    }
    setChosen(id)
    setText(value)
    if (live) onEvent?.('SUGGESTION_SELECTED', value.slice(0, 60))
  }

  const onWrite = (value: string) => {
    setText(value)
    // Editing keeps the link to the suggestion it started from — the business can see the
    // customer began there, and the submitted words are still entirely the customer's.
    // Clearing the box drops the link, because nothing of the suggestion remains.
    if (chosen && value.trim() === '') setChosen(null)
    if (!chosen && !startedOwn.current && value.trim().length > 0) {
      startedOwn.current = true
      if (live) onEvent?.('OWN_REVIEW_STARTED')
    }
  }

  const submit = async () => {
    if (rating === 0) {
      setError('Please choose a rating first.')
      return
    }
    if (!live) {
      setStep('thanks')
      return
    }
    setBusy(true)
    setError('')
    try {
      const result = await onSubmit?.({
        rating,
        text: text.trim() || undefined,
        customerName: name.trim() || undefined,
        suggestionId: chosen ?? undefined,
      })
      if (result) setSubmitted(result)
      setStep('thanks')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not save your review. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const openGoogle = () => {
    onGoogleClick?.()
    if (live && card.googleReviewUrl) window.open(card.googleReviewUrl, '_blank', 'noopener')
  }

  const coverBg = a.coverImage ? `url(${a.coverImage}) center/cover` : covers[a.cover].css
  const avatarRadius = a.avatarShape === 'circle' ? '9999px' : a.avatarShape === 'rounded' ? '22px' : '8px'

  /* ------------------------------------------------------------------ head -- */
  const header = (
    <header className="relative">
      <div className="h-24 w-full" style={{ background: coverBg }} />
      <div className="-mt-10 flex flex-col items-center px-6 text-center">
        <div
          className="flex size-20 items-center justify-center overflow-hidden text-[26px] font-extrabold"
          style={{
            background: card.logo ? '#fff' : 'var(--c-primary)',
            color: 'var(--c-on)',
            borderRadius: avatarRadius,
            border: '4px solid var(--c-bg)',
            boxShadow: '0 10px 24px -10px rgba(15,23,42,0.4)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          {card.logo ? <img src={card.logo} alt="" className="size-full object-cover" /> : initials(card.businessName)}
        </div>
        <h1 className="mt-3 text-[22px] font-bold leading-tight" style={{ letterSpacing: '-0.02em' }}>
          {card.businessName || 'Your Business'}
        </h1>
        {card.tagline && (
          <p className="mt-0.5 text-[13px]" style={{ color: 'var(--c-muted)' }}>
            {card.tagline}
          </p>
        )}
      </div>
    </header>
  )

  /* ----------------------------------------------------------------- steps -- */
  if (activeStep === 'thanks') {
    return (
      <article className={className} style={{ ...vars, minHeight: '100%' }} aria-label={`Thank you from ${card.businessName}`}>
        {header}
        <div className="animate-fade-up px-6 pb-10 pt-8 text-center">
          <div
            className="mx-auto flex size-16 items-center justify-center rounded-full"
            style={{ background: 'var(--c-soft)', color: 'var(--c-primary)' }}
          >
            <PartyPopper className="size-8" />
          </div>
          <h2 className="mt-5 text-[24px] font-bold leading-tight">{card.copy.thankYouTitle}</h2>
          <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>
            {card.copy.thankYouMessage}
          </p>

          {(submitted || rating > 0) && (
            <div className="mx-auto mt-6 max-w-[320px] p-4 text-left" style={surface}>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="size-4"
                    style={{ color: '#f5a623', fill: s <= (submitted?.rating ?? rating) ? '#f5a623' : 'transparent' }}
                    strokeWidth={1.8}
                  />
                ))}
                <span className="ml-auto text-[12px]" style={{ color: 'var(--c-muted)' }}>
                  Your review
                </span>
              </div>
              {(text || submitted?.text) && (
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>
                  “{text || submitted?.text}”
                </p>
              )}
            </div>
          )}

          {card.googleReviewUrl && (
            <>
              <button type="button" onClick={openGoogle} className="mt-7 flex w-full items-center justify-center gap-2.5 px-5 py-4 text-[16px] font-bold transition active:scale-[0.985]" style={primaryBtn}>
                <GoogleGlyph />
                {card.copy.googleCtaLabel}
              </button>
              <p className="mt-3 text-[12px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>
                It takes a few seconds and helps other customers find us.
              </p>
            </>
          )}

          {card.showBusinessInfo && card.business && <BusinessLinks card={card} live={live} onEvent={onEvent} surface={surface} />}

          <Branding show={card.showBranding} />
        </div>
      </article>
    )
  }

  const canSubmit = rating > 0

  return (
    <article className={className} style={{ ...vars, minHeight: '100%' }} aria-label={`Leave a review for ${card.businessName}`}>
      {header}

      <div className="px-6 pb-10 pt-6">
        {/* ---------------------------------------------------------- rating -- */}
        <section className="text-center">
          <h2 className="text-[20px] font-bold leading-snug">{card.copy.headline}</h2>
          {card.copy.description && (
            <p className="mx-auto mt-1.5 max-w-[32ch] text-[14px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              {card.copy.description}
            </p>
          )}
          <div className="mt-5">
            <StarRating value={rating} onChange={chooseRating} size={40} colour="#f5a623" />
          </div>
        </section>

        {/* ------------------------------------------------------ suggestions -- */}
        {card.suggestions.length > 0 && (
          <section className="mt-7">
            <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--c-muted)', fontFamily: 'Inter, sans-serif' }}>
              {card.copy.suggestionsTitle}
            </h3>
            <div className="space-y-2">
              {card.suggestions.map((s) => {
                const active = chosen === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => chooseSuggestion(s.id, s.text)}
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left text-[14px] leading-snug transition active:scale-[0.99]"
                    style={{
                      ...surface,
                      ...(active
                        ? { borderColor: a.primary, background: 'var(--c-soft)', boxShadow: `0 0 0 1px ${a.primary} inset` }
                        : {}),
                    }}
                  >
                    <span
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                      style={{ borderColor: active ? a.primary : 'var(--c-border)', background: active ? a.primary : 'transparent' }}
                    >
                      {active && <Check className="size-3" style={{ color: 'var(--c-on)' }} strokeWidth={3} />}
                    </span>
                    <span className="flex-1">{s.text}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-2.5 px-1 text-[12px]" style={{ color: 'var(--c-muted)' }}>
              Tap one to start, then edit it below however you like.
            </p>
          </section>
        )}

        {/* ---------------------------------------------------- own review -- */}
        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--c-muted)', fontFamily: 'Inter, sans-serif' }}>
              <Pencil className="size-3.5" />
              {card.suggestions.length > 0 ? 'Or write your own' : card.copy.ownReviewTitle}
            </h3>
            {text && (
              <button
                type="button"
                onClick={() => {
                  setText('')
                  setChosen(null)
                  textareaRef.current?.focus()
                }}
                className="text-[12px] font-semibold underline decoration-dotted"
                style={{ color: 'var(--c-muted)' }}
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onWrite(e.target.value)}
            rows={4}
            maxLength={1500}
            placeholder="Tell us about your experience…"
            aria-label="Your review"
            className="w-full resize-y px-4 py-3 text-[15px] leading-relaxed outline-none transition"
            style={{
              ...surface,
              color: 'var(--c-text)',
              caretColor: a.primary,
            }}
          />
          <div className="mt-1 flex justify-between px-1 text-[11px]" style={{ color: 'var(--c-muted)' }}>
            <span>{chosen ? 'Edited from a suggestion' : 'Optional — your rating alone is enough'}</span>
            <span>{text.length}/1500</span>
          </div>
        </section>

        {/* ----------------------------------------------------------- name -- */}
        {card.askForName && (
          <section className="mt-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Your name (optional)"
              aria-label="Your name, optional"
              className="w-full px-4 py-3 text-[15px] outline-none"
              style={{ ...surface, color: 'var(--c-text)', caretColor: a.primary }}
            />
          </section>
        )}

        {/* --------------------------------------------------------- submit -- */}
        {error && (
          <p role="alert" className="mt-4 rounded-xl px-3 py-2.5 text-center text-[13px] font-medium" style={{ background: alpha('#dc2626', 0.1), color: '#dc2626' }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          aria-disabled={!canSubmit}
          className={cn(
            'mt-5 flex w-full items-center justify-center gap-2 px-5 py-4 text-[16px] font-bold transition active:scale-[0.985]',
            !canSubmit && 'opacity-45',
            busy && 'opacity-70',
          )}
          style={primaryBtn}
        >
          {busy ? <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
          {busy ? 'Sending…' : card.copy.submitLabel}
        </button>

        {!canSubmit && (
          <p className="mt-2 text-center text-[12px]" style={{ color: 'var(--c-muted)' }}>
            Choose a rating above to continue
          </p>
        )}

        {card.showBusinessInfo && card.business && <BusinessLinks card={card} live={live} onEvent={onEvent} surface={surface} />}
        <Branding show={card.showBranding} />
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ parts -- */

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M23 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.17a5.3 5.3 0 0 1-2.29 3.47v2.89h3.7C21.74 18.8 23 15.8 23 12.27z" />
      <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1.03 7.6-2.78l-3.71-2.89c-1.03.69-2.35 1.1-3.89 1.1-2.99 0-5.53-2.02-6.43-4.74H1.73v2.98A11.49 11.49 0 0 0 12 23.5z" />
      <path fill="#FBBC05" d="M5.57 14.19a6.9 6.9 0 0 1 0-4.38V6.83H1.73a11.5 11.5 0 0 0 0 10.34l3.84-2.98z" />
      <path fill="#EA4335" d="M12 5.07c1.69 0 3.2.58 4.39 1.72l3.29-3.29C17.7 1.63 15.1.5 12 .5 7.54.5 3.68 3.06 1.73 6.83l3.84 2.98C6.47 7.09 9.01 5.07 12 5.07z" />
    </svg>
  )
}

function Branding({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <p className="mt-8 text-center">
      <a
        href="https://tapcard.in"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
        style={{ background: 'var(--c-soft)', color: 'var(--c-muted)', fontFamily: 'Inter, sans-serif' }}
      >
        Powered by TapCard
      </a>
    </p>
  )
}

/** Secondary contact details. Present, but always below the review itself. */
function BusinessLinks({
  card,
  live,
  onEvent,
  surface,
}: {
  card: ReviewCardData
  live: boolean
  onEvent?: (e: ReviewEvent, label?: string) => void
  surface: CSSProperties
}) {
  const b = card.business
  if (!b) return null
  const wa = digitsOnly(b.whatsapp)
  const links = [
    wa && { href: `https://wa.me/${wa}`, icon: <MessageCircle className="size-4" />, label: 'WhatsApp' },
    b.phone && { href: `tel:${b.phone.replace(/\s/g, '')}`, icon: <Phone className="size-4" />, label: 'Call' },
    b.website && { href: b.website, icon: <Globe className="size-4" />, label: 'Website' },
    b.mapsUrl && { href: b.mapsUrl, icon: <MapPin className="size-4" />, label: 'Directions' },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[]

  if (links.length === 0) return null

  return (
    <section className="mt-8">
      <div className="mb-2.5 flex items-center gap-3">
        <span className="h-px flex-1" style={{ background: 'var(--c-border)' }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-muted)', fontFamily: 'Inter, sans-serif' }}>
          {card.businessName}
        </span>
        <span className="h-px flex-1" style={{ background: 'var(--c-border)' }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={live ? l.href : '#'}
            target={live ? '_blank' : undefined}
            rel="noreferrer"
            onClick={(e) => {
              if (!live) e.preventDefault()
              onEvent?.(('WEBSITE_CLICK' as ReviewEvent), l.label)
            }}
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-[13px] font-semibold transition active:scale-[0.98]"
            style={{ ...surface, color: 'var(--c-text)' }}
          >
            <span style={{ color: 'var(--c-primary)' }}>{l.icon}</span>
            {l.label}
          </a>
        ))}
      </div>
      {b.address && (
        <p className="mt-3 flex items-start justify-center gap-1.5 px-2 text-center text-[12px] leading-snug" style={{ color: 'var(--c-muted)' }}>
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          {b.address}
        </p>
      )}
    </section>
  )
}
