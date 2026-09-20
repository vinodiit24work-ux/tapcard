import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Inbox, RefreshCw, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

export const Skeleton = ({ className }: { className?: string }) => <div aria-hidden className={cn('skeleton', className)} />

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-14 text-center', className)}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white text-ink-400 shadow-soft ring-1 ring-ink-200">{icon ?? <Inbox className="size-5" />}</div>
      <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', description = 'We could not load this. Please check your connection and try again.', onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/40 px-6 py-14 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white text-red-500 shadow-soft ring-1 ring-red-200">
        <AlertTriangle className="size-5" />
      </div>
      <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>
      {onRetry && (
        <Button className="mt-5" variant="secondary" icon={<RefreshCw className="size-4" />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title?: string; description?: string; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])
  if (!open) return null
  const w = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size]
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn('relative flex max-h-[92dvh] w-full animate-pop flex-col overflow-hidden rounded-t-3xl bg-white shadow-float sm:rounded-2xl', w)}>
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <div>
            {title && <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
          </div>
          <button aria-label="Close" onClick={onClose} className="-mr-1 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 bg-ink-50/60 px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
