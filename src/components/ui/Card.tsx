import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-ink-200/80 bg-white shadow-soft', className)} {...p} />
}

export function CardHeader({ title, description, action, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-5', className)}>
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-semibold text-ink-900">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

type Tone = 'neutral' | 'brand' | 'green' | 'amber' | 'red' | 'blue' | 'purple'
const tones: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  blue: 'bg-sky-50 text-sky-700 ring-sky-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
}

export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', tones[tone], className)}>{children}</span>
}

export const statusTone = (s: string): Tone => {
  const v = s.toLowerCase()
  if (['paid', 'active', 'delivered', 'published', 'resolved', 'success', 'verified'].includes(v)) return 'green'
  if (['pending', 'design review', 'open', 'trialing', 'draft'].includes(v)) return 'amber'
  if (['production', 'shipped', 'in progress'].includes(v)) return 'blue'
  if (['cancelled', 'failed', 'suspended', 'refunded', 'past due', 'expired'].includes(v)) return 'red'
  return 'neutral'
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={statusTone(status)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </Badge>
  )
}
