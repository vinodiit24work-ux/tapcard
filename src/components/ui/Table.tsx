import type { ReactNode } from 'react'
import { Skeleton } from './Feedback'
import { cn } from '@/lib/cn'

export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  hideBelow?: 'sm' | 'md' | 'lg'
}

const hide = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' }

export function DataTable<T extends { id?: string | number }>({ columns, rows, loading, empty, onRowClick, rowKey }: { columns: Column<T>[]; rows: T[]; loading?: boolean; empty?: ReactNode; onRowClick?: (row: T) => void; rowKey?: (row: T, i: number) => string }) {
  if (loading)
    return (
      <div className="space-y-2 p-5">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-11" />)}</div>
    )
  if (rows.length === 0 && empty) return <div className="p-5">{empty}</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50/70">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn('whitespace-nowrap px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-ink-500', c.hideBelow && hide[c.hideBelow], c.className)}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((r, i) => (
            <tr key={rowKey ? rowKey(r, i) : String(r.id ?? i)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-ink-50')}>
              {columns.map((c) => (
                <td key={c.key} className={cn('px-5 py-3.5 text-[14px] text-ink-700', c.hideBelow && hide[c.hideBelow], c.className)}>{c.cell(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
        {description && <p className="mt-1 text-[15px] text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
