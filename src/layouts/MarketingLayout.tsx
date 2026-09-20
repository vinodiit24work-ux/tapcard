import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useAuth } from '@/store/auth'

const links = [
  { to: '/features', label: 'Features' },
  { to: '/templates', label: 'Templates' },
  { to: '/demo', label: 'Demo' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
]

function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()
  const loc = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [loc.pathname])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={cn('sticky top-0 z-50 transition-all', scrolled || open ? 'border-b border-ink-200/80 bg-white/90 backdrop-blur-md' : 'border-b border-transparent')}>
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'text-brand-700' : 'text-ink-600 hover:text-ink-900')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <ButtonLink to="/dashboard" size="md">Go to dashboard</ButtonLink>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost">Log in</ButtonLink>
              <ButtonLink to="/get-card">Get my TapCard</ButtonLink>
            </>
          )}
        </div>
        <button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="-mr-2 rounded-lg p-2 text-ink-700 md:hidden">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      {open && (
        <div className="animate-pop border-t border-ink-100 bg-white px-4 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className="rounded-lg px-3 py-3 text-base font-medium text-ink-800 hover:bg-ink-50">{l.label}</NavLink>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {user ? (
              <ButtonLink to="/dashboard" full className="col-span-2">Go to dashboard</ButtonLink>
            ) : (
              <>
                <ButtonLink to="/login" variant="secondary" full>Log in</ButtonLink>
                <ButtonLink to="/register" full>Get started</ButtonLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

const cols = [
  { h: 'Product', l: [['Features', '/features'], ['Templates', '/templates'], ['Live demo', '/demo'], ['Pricing', '/pricing']] },
  { h: 'Company', l: [['About', '/about'], ['Contact', '/contact'], ['FAQ', '/faq']] },
  { h: 'Legal', l: [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Refund Policy', '/refund-policy']] },
]

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-950 text-ink-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">One QR. Your Entire Business. Digital cards, QR codes and NFC for Indian businesses.</p>
          <p className="mt-6 text-xs text-ink-500">Made with care in India 🇮🇳</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="text-sm font-semibold text-white">{c.h}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.l.map(([label, to]) => (
                <li key={to}><Link to={to} className="text-ink-400 transition-colors hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-500 sm:flex-row">
          <span>© 2026 TapCard Technologies Pvt. Ltd. All rights reserved.</span>
          <span>Payments secured by Razorpay · GST invoices provided</span>
        </div>
      </div>
    </footer>
  )
}

export function MarketingLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  )
}
