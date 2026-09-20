import { useState } from 'react'
import { Briefcase, Dumbbell, Scissors, Stethoscope, Store, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { DigitalCardPreview } from '@/components/card/DigitalCardPreview'
import { QRImage } from '@/components/card/QRImage'
import { demoCategories } from '@/data/templates'
import { cardUrl } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useToast } from '@/components/ui/Toast'

const icons: Record<string, LucideIcon> = { restaurant: UtensilsCrossed, salon: Scissors, gym: Dumbbell, doctor: Stethoscope, freelancer: Briefcase, retail: Store }

export function InteractiveDemo({ withQr = true, height = 620 }: { withQr?: boolean; height?: number }) {
  const [active, setActive] = useState(demoCategories[0].id)
  const toast = useToast()
  const current = demoCategories.find((c) => c.id === active) ?? demoCategories[0]

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Business type">
          {demoCategories.map((c) => {
            const Icon = icons[c.id]
            const on = c.id === active
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(c.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all',
                  on ? 'border-brand-600 bg-brand-600 text-white shadow-soft' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50',
                )}
              >
                <Icon className="size-4" /> {c.label}
              </button>
            )
          })}
        </div>

        <dl className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-ink-200 bg-white p-5">
            <dt className="text-[13px] font-semibold text-ink-500">Live card link</dt>
            <dd className="mt-1 break-all font-mono text-sm text-brand-700">{cardUrl(current.card.slug)}</dd>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-white p-5">
            <dt className="text-[13px] font-semibold text-ink-500">What customers tap</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {current.card.sections.filter((s) => s.enabled && s.id !== 'profile').map((s) => (
                <span key={s.id} className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium capitalize text-ink-700">{s.id}</span>
              ))}
            </dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-ink-500">Tap any button in the preview — every tap is what your analytics will count.</p>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        <PhoneFrame height={height} width={310}>
          <DigitalCardPreview key={current.id} card={current.card} onAction={(_, label) => toast(`${label} tapped — this would open for your customer`, 'info')} />
        </PhoneFrame>
        {withQr && (
          <div className="flex flex-col items-center rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
            <QRImage text={cardUrl(current.card.slug)} size={124} options={{ fg: '#0f1729' }} />
            <p className="mt-2 text-xs font-medium text-ink-500">Scan to open</p>
          </div>
        )}
      </div>
    </div>
  )
}
