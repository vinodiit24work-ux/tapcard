import { useState } from 'react'
import { Briefcase, Dumbbell, RotateCcw, Scissors, Stethoscope, Store, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { QRImage } from '@/components/card/QRImage'
import { ReviewExperience } from '@/features/review/ReviewExperience'
import { reviewDemos } from '@/data/reviewDemo'
import { reviewUrl } from '@/lib/format'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

const icons: Record<string, LucideIcon> = {
  restaurant: UtensilsCrossed, salon: Scissors, gym: Dumbbell, doctor: Stethoscope, freelancer: Briefcase, retail: Store,
}

/**
 * A real, working review experience on the marketing site. Nothing is submitted —
 * the component runs in preview mode, so visitors can try the whole flow safely.
 */
export function ReviewDemo({ withQr = true, height = 660 }: { withQr?: boolean; height?: number }) {
  const [active, setActive] = useState(reviewDemos[0].id)
  const [run, setRun] = useState(0)
  const current = reviewDemos.find((d) => d.id === active) ?? reviewDemos[0]

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Business type">
          {reviewDemos.map((d) => {
            const Icon = icons[d.id]
            const on = d.id === active
            return (
              <button
                key={d.id}
                role="tab"
                aria-selected={on}
                onClick={() => { setActive(d.id); setRun((n) => n + 1) }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all',
                  on ? 'border-brand-600 bg-brand-600 text-white shadow-soft' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50',
                )}
              >
                <Icon className="size-4" /> {d.label}
              </button>
            )
          })}
        </div>

        <ol className="mt-8 space-y-3">
          {[
            ['Scan or tap', 'The customer points their camera at your QR, or taps your NFC card.'],
            ['Rate in one tap', 'Your review page opens straight away — no app, no sign-in.'],
            ['Pick a line or write their own', 'Your suggestions make it effortless; the text stays editable.'],
            ['Continue to Google', 'After submitting, they are offered your Google listing.'],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[12px] font-bold text-brand-700">{i + 1}</span>
              <span>
                <span className="block text-[14px] font-semibold text-ink-900">{t}</span>
                <span className="block text-[13px] leading-relaxed text-ink-500">{d}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" icon={<RotateCcw className="size-4" />} onClick={() => setRun((n) => n + 1)}>
            Start over
          </Button>
          <span className="text-[13px] text-ink-500">Try it — nothing is actually submitted.</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        <PhoneFrame height={height} width={310}>
          <ReviewExperience key={`${current.id}-${run}`} card={current.card} />
        </PhoneFrame>
        {withQr && (
          <div className="flex flex-col items-center rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
            <QRImage text={reviewUrl(current.card.slug)} size={124} options={{ fg: '#0f1729' }} />
            <p className="mt-2 text-xs font-medium text-ink-500">Scan to review</p>
          </div>
        )}
      </div>
    </div>
  )
}
