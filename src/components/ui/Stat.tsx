import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Skeleton } from './Feedback'
import { num } from '@/lib/format'

export function StatCard({ label, value, delta, icon, loading, suffix }: { label: string; value: number | string; delta?: number; icon?: ReactNode; loading?: boolean; suffix?: string }) {
  if (loading)
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="mt-3 h-8 w-20" />
        <Skeleton className="mt-3 h-3 w-28" />
      </div>
    )
  const up = (delta ?? 0) >= 0
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-ink-500">{label}</p>
        {icon && <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>}
      </div>
      <p className="mt-2 font-display text-[28px] font-extrabold leading-none tracking-tight text-ink-900">
        {typeof value === 'number' ? num(value) : value}
        {suffix && <span className="ml-1 text-sm font-semibold text-ink-400">{suffix}</span>}
      </p>
      {delta !== undefined && (
        <p className={cn('mt-2.5 inline-flex items-center gap-1 text-[12px] font-semibold', up ? 'text-emerald-600' : 'text-red-600')}>
          {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {Math.abs(delta).toFixed(1)}%
          <span className="font-normal text-ink-400">vs previous</span>
        </p>
      )}
    </div>
  )
}
