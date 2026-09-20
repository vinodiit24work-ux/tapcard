import { Navigate } from 'react-router-dom'
import { Boxes, Building2, CreditCard, Inbox, LayoutDashboard, LayoutTemplate, LifeBuoy, Package, Percent, Settings, Ticket, Users } from 'lucide-react'
import { AppShell, type NavItem } from './AppShell'
import { SessionLoading } from './DashboardLayout'
import { useAuth } from '@/store/auth'

const items: NavItem[] = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/requests', label: 'Card Requests', icon: Inbox },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/businesses', label: 'Businesses', icon: Building2 },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/admin/plans', label: 'Plans', icon: Percent },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/support', label: 'Support', icon: LifeBuoy },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminLayout() {
  const { user, ready } = useAuth()
  if (!ready) return <SessionLoading />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <AppShell items={items} area="admin" />
}
