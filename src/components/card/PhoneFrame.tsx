import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Device bezel around scrollable content. Height is fixed so layouts stay predictable. */
export function PhoneFrame({ children, className, height = 640, width = 320, floating }: { children: ReactNode; className?: string; height?: number; width?: number; floating?: boolean }) {
  return (
    <div
      className={cn('relative mx-auto shrink-0 rounded-[2.6rem] bg-ink-950 p-[9px] shadow-float ring-1 ring-ink-800', floating && 'animate-float', className)}
      style={{ width: width + 18, maxWidth: '100%' }}
    >
      <div className="absolute left-1/2 top-[15px] z-20 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-ink-950" aria-hidden />
      <div className="no-scrollbar overflow-y-auto overflow-x-hidden rounded-[2rem] bg-white" style={{ height }}>
        {children}
      </div>
    </div>
  )
}
