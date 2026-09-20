import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ExternalLink, LogOut, Menu, Search, Settings, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Card'
import { useAuth } from '@/store/auth'
import { useCart } from '@/store/cart'
import { notifications } from '@/data/dashboard'
import { initials } from '@/lib/format'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: string
}

function useClickAway<T extends HTMLElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', h)
    document.addEventListener('keydown', k)
    return () => {
      document.removeEventListener('mousedown', h)
      document.removeEventListener('keydown', k)
    }
  }, [open, close])
  return ref
}

function NavList({ items, onNavigate, admin }: { items: NavItem[]; onNavigate?: () => void; admin?: boolean }) {
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2" aria-label="Main">
      {items.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-[10px] px-3 py-2 text-[14px] font-medium transition-colors',
              isActive ? (admin ? 'bg-white/10 text-white' : 'bg-brand-50 text-brand-700') : admin ? 'text-ink-300 hover:bg-white/5 hover:text-white' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
            )
          }
        >
          <Icon className="size-[18px] shrink-0" />
          <span className="flex-1 truncate">{label}</span>
          {badge && <span className="rounded-full bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{badge}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppShell({ items, area, cartBadge }: { items: NavItem[]; area: 'dashboard' | 'admin'; cartBadge?: boolean }) {
  const admin = area === 'admin'
  const [drawer, setDrawer] = useState(false)
  const [notif, setNotif] = useState(false)
  const [profile, setProfile] = useState(false)
  const [q, setQ] = useState('')
  const { user, logout } = useAuth()
  const { totals } = useCart()
  const navigate = useNavigate()
  const loc = useLocation()
  const nRef = useClickAway<HTMLDivElement>(notif, () => setNotif(false))
  const pRef = useClickAway<HTMLDivElement>(profile, () => setProfile(false))

  useEffect(() => {
    setDrawer(false)
    window.scrollTo(0, 0)
  }, [loc.pathname])

  const sidebar = (onNavigate?: () => void): ReactNode => (
    <div className={cn('flex h-full flex-col', admin ? 'bg-ink-950 text-white' : 'bg-white')}>
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Logo to={admin ? '/admin' : '/dashboard'} light={admin} />
        {admin && <Badge tone="purple">Admin</Badge>}
      </div>
      <NavList items={items} onNavigate={onNavigate} admin={admin} />
      <div className={cn('space-y-0.5 border-t px-3 py-3', admin ? 'border-white/10' : 'border-ink-100')}>
        {!admin && (
          <NavLink to="/dashboard/settings" onClick={onNavigate} className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-[14px] font-medium text-ink-600 hover:bg-ink-100">
            <Settings className="size-[18px]" /> Settings
          </NavLink>
        )}
        <button
          onClick={() => {
            void logout().then(() => navigate('/login'))
          }}
          className={cn('flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-[14px] font-medium', admin ? 'text-ink-300 hover:bg-white/5 hover:text-white' : 'text-ink-600 hover:bg-ink-100')}
        >
          <LogOut className="size-[18px]" /> Logout
        </button>
      </div>
    </div>
  )

  const unread = notifications.filter((n) => n.unread).length

  return (
    <div className="min-h-dvh bg-ink-50">
      <aside className={cn('fixed inset-y-0 left-0 z-40 hidden w-60 border-r lg:block', admin ? 'border-ink-800' : 'border-ink-200')}>{sidebar()}</aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-pop shadow-float">
            {sidebar(() => setDrawer(false))}
            <button aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-ink-400">
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <button aria-label="Open menu" onClick={() => setDrawer(true)} className="-ml-1 rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden">
            <Menu className="size-5" />
          </button>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              const t = q.toLowerCase()
              const hit = items.find((i) => i.label.toLowerCase().includes(t))
              if (hit && t) navigate(hit.to)
            }}
            className="relative hidden max-w-md flex-1 sm:block"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={admin ? 'Search users, orders, businesses…' : 'Search pages, e.g. “analytics”'} aria-label="Search" className="h-10 w-full rounded-[10px] border border-ink-200 bg-ink-50 pl-9 pr-3 text-sm placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100" />
          </form>
          <div className="ml-auto flex items-center gap-1.5">
            {!admin && (
              <Link to="/tapcard-preview-redirect" onClick={(e) => { e.preventDefault(); window.open('/royal-spice', '_blank') }} className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-600 hover:bg-ink-100 md:inline-flex">
                View card <ExternalLink className="size-3.5" />
              </Link>
            )}
            {cartBadge && (
              <Link to="/cart" aria-label={`Cart, ${totals.count} items`} className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-100">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h13l-1.5 8.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.6L5 4H3" /><circle cx="9.5" cy="20.5" r="1" /><circle cx="16.5" cy="20.5" r="1" /></svg>
                {totals.count > 0 && <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">{totals.count}</span>}
              </Link>
            )}
            <div className="relative" ref={nRef}>
              <button aria-label="Notifications" aria-expanded={notif} onClick={() => { setNotif((o) => !o); setProfile(false) }} className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-100">
                <Bell className="size-5" />
                {unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent-500 ring-2 ring-white" />}
              </button>
              {notif && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] animate-pop overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-float">
                  <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                    <span className="text-sm font-semibold">Notifications</span>
                    <Badge tone="brand">{unread} new</Badge>
                  </div>
                  <ul>
                    {notifications.map((n) => (
                      <li key={n.id} className="flex gap-3 border-b border-ink-100 px-4 py-3 last:border-0 hover:bg-ink-50">
                        <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.unread ? 'bg-brand-500' : 'bg-ink-200')} />
                        <div>
                          <p className="text-[13px] font-medium text-ink-800">{n.title}</p>
                          <p className="text-xs text-ink-500">{n.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="relative" ref={pRef}>
              <button aria-label="Account menu" aria-expanded={profile} onClick={() => { setProfile((o) => !o); setNotif(false) }} className="flex items-center gap-2 rounded-full p-1 hover:bg-ink-100">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{initials(user?.name ?? 'U')}</span>
              </button>
              {profile && (
                <div className="absolute right-0 mt-2 w-60 animate-pop overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-float">
                  <div className="border-b border-ink-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold">{user?.name}</p>
                    <p className="truncate text-xs text-ink-500">{user?.email}</p>
                  </div>
                  <div className="p-1.5 text-sm">
                    {!admin && <Link onClick={() => setProfile(false)} to="/dashboard/settings" className="block rounded-lg px-3 py-2 hover:bg-ink-100">Account settings</Link>}
                    {!admin && <Link onClick={() => setProfile(false)} to="/dashboard/billing" className="block rounded-lg px-3 py-2 hover:bg-ink-100">Billing</Link>}
                    {user?.role === 'ADMIN' && <Link onClick={() => setProfile(false)} to={admin ? '/dashboard' : '/admin'} className="block rounded-lg px-3 py-2 hover:bg-ink-100">{admin ? 'Back to dashboard' : 'Admin panel'}</Link>}
                    <button onClick={() => void logout().then(() => navigate('/login'))} className="block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50">Log out</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
