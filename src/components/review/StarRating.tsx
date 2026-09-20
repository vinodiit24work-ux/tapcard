import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/cn'

const LABELS = ['', 'Poor', 'Could be better', 'Good', 'Great', 'Excellent']

/**
 * Accessible star rating. Nothing is preselected — the customer chooses their own,
 * and a rating is never assumed on their behalf.
 */
export function StarRating({
  value,
  onChange,
  size = 44,
  showLabel = true,
  colour = '#f5a623',
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  size?: number
  showLabel?: boolean
  colour?: string
  disabled?: boolean
}) {
  const [hover, setHover] = useState(0)
  const shown = hover || value

  return (
    <div className="flex flex-col items-center gap-2">
      <div role="radiogroup" aria-label="Your rating" className="flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? '' : 's'} — ${LABELS[star]}`}
            disabled={disabled}
            onMouseEnter={() => !disabled && setHover(star)}
            onFocus={() => !disabled && setHover(star)}
            onBlur={() => setHover(0)}
            onClick={() => !disabled && onChange(star)}
            className={cn('rounded-lg p-0.5 transition-transform', !disabled && 'hover:scale-110 active:scale-95', disabled && 'cursor-not-allowed opacity-60')}
          >
            <Star
              style={{ width: size, height: size, color: star <= shown ? colour : 'currentColor', fill: star <= shown ? colour : 'transparent' }}
              className={cn('transition-colors', star <= shown ? '' : 'opacity-25')}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      {showLabel && (
        <p className="h-5 text-[13px] font-semibold transition-opacity" style={{ opacity: shown ? 1 : 0 }}>
          {LABELS[shown] || ' '}
        </p>
      )}
    </div>
  )
}

/** Read-only stars for dashboards and summaries. */
export function StarsStatic({ value, size = 14, colour = '#f5a623', className }: { value: number; size?: number; colour?: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{ width: size, height: size, color: colour, fill: s <= Math.round(value) ? colour : 'transparent' }}
          className={s <= Math.round(value) ? '' : 'opacity-30'}
          strokeWidth={1.8}
          aria-hidden
        />
      ))}
    </span>
  )
}
