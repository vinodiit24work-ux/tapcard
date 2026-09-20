import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#5B4BFF" />
      <path d="M9 9h6v6H9zM17 9h6v6h-6zM9 17h6v6H9z" fill="#fff" />
      <rect x="17" y="17" width="6" height="6" rx="1.5" fill="#FF7A45" />
    </svg>
  )
}

export function Logo({ to = '/', light, className }: { to?: string; light?: boolean; className?: string }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5', className)} aria-label="TapCard home">
      <LogoMark />
      <span className={cn('font-display text-[19px] font-extrabold tracking-tight', light ? 'text-white' : 'text-ink-900')}>TapCard</span>
    </Link>
  )
}
