import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger' | 'accent'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-soft hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  accent: 'bg-accent-500 text-white shadow-soft hover:bg-accent-600 disabled:bg-accent-400/60',
  dark: 'bg-ink-900 text-white shadow-soft hover:bg-ink-800 disabled:bg-ink-400',
  secondary: 'bg-white text-ink-800 border border-ink-200 shadow-soft hover:bg-ink-50 hover:border-ink-300 disabled:text-ink-400 disabled:bg-ink-50',
  ghost: 'text-ink-700 hover:bg-ink-100 disabled:text-ink-400 disabled:hover:bg-transparent',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50 disabled:text-red-300',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-[10px]',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
}

interface Common {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  full?: boolean
}

export const buttonClass = ({ variant = 'primary', size = 'md', full }: Common) =>
  cn(
    'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150 select-none',
    'active:scale-[0.98] disabled:active:scale-100',
    variants[variant],
    sizes[size],
    full && 'w-full min-w-0',
  )

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & Common>(function Button(
  { variant, size, loading, icon, iconRight, full, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={cn(buttonClass({ variant, size, full }), className)} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
})

export function ButtonLink({ variant, size, icon, iconRight, full, className, children, ...rest }: LinkProps & Common) {
  return (
    <Link className={cn(buttonClass({ variant, size, full }), className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  )
}
