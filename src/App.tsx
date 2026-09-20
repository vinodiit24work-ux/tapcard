import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthProvider } from '@/store/auth'
import { CardProvider } from '@/store/card'
import { CartProvider } from '@/store/cart'

import { MarketingLayout } from '@/layouts/MarketingLayout'
import { AuthLayout } from '@/layouts/AuthLayout'

import { Home } from '@/pages/marketing/Home'
import { Features } from '@/pages/marketing/Features'
import { Pricing } from '@/pages/marketing/Pricing'
import { Templates } from '@/pages/marketing/Templates'
import { Demo } from '@/pages/marketing/Demo'
import { About, Contact, Faq, Privacy, Refund, Terms } from '@/pages/marketing/Static'

import { ForgotPassword, Login, Register, VerifyEmail } from '@/pages/auth/Auth'




import { PublicCard } from '@/pages/PublicCard'
import { ReviewPage } from '@/pages/ReviewPage'
import { NotFound } from '@/pages/NotFound'

/* Authenticated areas are code-split: the public card and marketing pages should
   not pay for Recharts, dnd-kit or the admin screens. */
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout').then((m) => ({ default: m.DashboardLayout })))
const AdminLayout = lazy(() => import('@/layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const DashboardHome = lazy(() => import('@/pages/dashboard/Home').then((m) => ({ default: m.DashboardHome })))
const CardBuilder = lazy(() => import('@/pages/dashboard/CardBuilder').then((m) => ({ default: m.CardBuilder })))
const Analytics = lazy(() => import('@/pages/dashboard/Analytics').then((m) => ({ default: m.Analytics })))
const SuggestedReviews = lazy(() => import('@/pages/dashboard/SuggestedReviews').then((m) => ({ default: m.SuggestedReviews })))
const Reviews = lazy(() => import('@/pages/dashboard/Reviews').then((m) => ({ default: m.Reviews })))
const QrPage = lazy(() => import('@/pages/dashboard/Qr').then((m) => ({ default: m.QrPage })))
const MyCard = lazy(() => import('@/pages/dashboard/Pages').then((m) => ({ default: m.MyCard })))
const Leads = lazy(() => import('@/pages/dashboard/Pages').then((m) => ({ default: m.Leads })))
const Orders = lazy(() => import('@/pages/dashboard/Pages').then((m) => ({ default: m.Orders })))
const Billing = lazy(() => import('@/pages/dashboard/Pages').then((m) => ({ default: m.Billing })))
const Settings = lazy(() => import('@/pages/dashboard/Pages').then((m) => ({ default: m.Settings })))
const Support = lazy(() => import('@/pages/dashboard/Pages').then((m) => ({ default: m.Support })))
const Store = lazy(() => import('@/pages/store/Store').then((m) => ({ default: m.Store })))
const CartPage = lazy(() => import('@/pages/store/CartCheckout').then((m) => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('@/pages/store/CartCheckout').then((m) => ({ default: m.CheckoutPage })))
const Onboarding = lazy(() => import('@/pages/auth/Onboarding').then((m) => ({ default: m.Onboarding })))
const Admin = {
  Overview: lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.AdminOverview }))),
  Users: lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.AdminUsers }))),
  Businesses: lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.AdminBusinesses }))),
  Orders: lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.AdminOrders }))),
  Products: lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.AdminProducts }))),
  Templates: lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.AdminTemplates }))),
  Plans: lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.AdminPlans }))),
  Coupons: lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.AdminCoupons }))),
  Payments: lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.AdminPayments }))),
  Support: lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.AdminSupport }))),
  Settings: lazy(() => import('@/pages/admin/Admin').then((m) => ({ default: m.AdminSettings }))),
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <span className="size-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" role="status" aria-label="Loading" />
    </div>
  )
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CardProvider>
          <CartProvider>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Marketing */}
              <Route element={<MarketingLayout />}>
                <Route index element={<Home />} />
                <Route path="features" element={<Features />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="templates" element={<Templates />} />
                <Route path="demo" element={<Demo />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="faq" element={<Faq />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />
                <Route path="refund-policy" element={<Refund />} />
                <Route path="cart" element={<CartPage />} />
              </Route>

              {/* Auth */}
              <Route element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="verify-email" element={<VerifyEmail />} />
              </Route>
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="checkout" element={<CheckoutPage />} />

              {/* Dashboard */}
              <Route path="dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="card" element={<MyCard />} />
                <Route path="card-builder" element={<CardBuilder />} />
                <Route path="qr" element={<QrPage />} />
                <Route path="suggested-reviews" element={<SuggestedReviews />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="leads" element={<Leads />} />
                <Route path="orders" element={<Orders />} />
                <Route path="store" element={<Store />} />
                <Route path="billing" element={<Billing />} />
                <Route path="settings" element={<Settings />} />
                <Route path="support" element={<Support />} />
              </Route>

              {/* Admin */}
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Admin.Overview />} />
                <Route path="users" element={<Admin.Users />} />
                <Route path="businesses" element={<Admin.Businesses />} />
                <Route path="orders" element={<Admin.Orders />} />
                <Route path="products" element={<Admin.Products />} />
                <Route path="templates" element={<Admin.Templates />} />
                <Route path="plans" element={<Admin.Plans />} />
                <Route path="coupons" element={<Admin.Coupons />} />
                <Route path="payments" element={<Admin.Payments />} />
                <Route path="support" element={<Admin.Support />} />
                <Route path="settings" element={<Admin.Settings />} />
              </Route>

              {/* The QR/NFC destination: a permanent URL that opens the review experience. */}
              <Route path="review/:slug" element={<ReviewPage />} />

              {/* Public contact card — secondary, kept for businesses that link to it. */}
              <Route path=":slug" element={<PublicCard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </CartProvider>
        </CardProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
