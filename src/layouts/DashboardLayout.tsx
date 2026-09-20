import { Navigate, useLocation } from 'react-router-dom'
import { BarChart3, Boxes, CreditCard, IdCard, LayoutDashboard, Lightbulb, LifeBuoy, MessageSquareQuote, Palette, Package, QrCode } from 'lucide-react'
import { AppShell, type NavItem } from './AppShell'
import { useAuth } from '@/store/auth'

const items: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/card', label: 'Review Card', icon: IdCard },
  { to: '/dashboard/card-builder', label: 'Customize', icon: Palette },
  { to: '/dashboard/suggested-reviews', label: 'Suggested Reviews', icon: Lightbulb },
  { to: '/dashboard/reviews', label: 'Reviews', icon: MessageSquareQuote },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/qr', label: 'QR / NFC', icon: QrCode },
  { to: '/dashboard/store', label: 'Physical Cards', icon: Boxes },
  { to: '/dashboard/orders', label: 'Orders', icon: Package },
  { to: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { to: '/dashboard/support', label: 'Support', icon: LifeBuoy },
]

export function DashboardLayout() {
  const { user, ready } = useAuth()
  const loc = useLocation()
  if (!ready) return <SessionLoading />
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  return <AppShell items={items} area="dashboard" cartBadge />
}

export function SessionLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-50">
      <span className="size-7 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" role="status" aria-label="Loading" />
    </div>
  )
}
