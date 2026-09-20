import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Boxes, ExternalLink, Eye, MessageCircle, MousePointerClick, Palette, Phone, QrCode, ScanLine, Star, UtensilsCrossed } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader, Badge } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/Stat'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback'
import { ScanAreaChart, ClicksLineChart, DonutChart } from '@/components/charts/Charts'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { DigitalCardPreview } from '@/components/card/DigitalCardPreview'
import { QRImage } from '@/components/card/QRImage'
import { recentActivity } from '@/data/dashboard'
import { analyticsApi, type AnalyticsSummary } from '@/services/ownerApi'
import { useAuth } from '@/store/auth'
import { useCard } from '@/store/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { reviewUrl } from '@/lib/format'
import { useToast } from '@/components/ui/Toast'

const activityIcons: Record<string, typeof ScanLine> = { scan: ScanLine, whatsapp: MessageCircle, review: Star, menu: UtensilsCrossed, phone: Phone }

export function DashboardHome() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const { card, published } = useCard()
  const toast = useToast()
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(() => {
    setState('loading')
    analyticsApi
      .summary('30')
      .then((d) => { setData(d); setState('ready') })
      .catch(() => setState('error'))
  }, [])
  useEffect(load, [load])

  const loading = state === 'loading'
  const m = data?.metrics ?? {}
  const deltas = data?.deltas ?? {}

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const copy = async () => {
    await navigator.clipboard.writeText(reviewUrl(card.slug))
    toast('Card link copied')
  }

  if (state === 'error') return <ErrorState onRetry={load} />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">{greeting}, {user?.name.split(' ')[0]}</h1>
          <p className="mt-1 text-[15px] text-ink-500">Here is how {card.businessName} performed in the last 30 days.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<ExternalLink className="size-4" />} onClick={() => window.open(`/review/${card.slug}`, '_blank')}>View review page</Button>
          <ButtonLink to="/dashboard/card-builder" icon={<Palette className="size-4" />}>Customize</ButtonLink>
        </div>
      </div>

      {!published && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Badge tone="amber">Draft</Badge>
          <p className="flex-1 text-[14px] text-amber-900">Your card is not live yet. Publish it so customers can open it.</p>
          <ButtonLink to="/dashboard/card-builder" size="sm">Publish now</ButtonLink>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard loading={loading} label="Scans & Opens" value={m.scans ?? 0} delta={deltas.scans} icon={<ScanLine className="size-4" />} />
        <StatCard loading={loading} label="Review Page Views" value={m.reviewViews ?? 0} delta={deltas.reviewViews} icon={<Eye className="size-4" />} />
        <StatCard loading={loading} label="Reviews Submitted" value={m.reviewsSubmitted ?? 0} delta={deltas.reviewsSubmitted} icon={<Star className="size-4" />} />
        <StatCard loading={loading} label="Google Clicks" value={m.reviews ?? 0} delta={deltas.reviews} icon={<MousePointerClick className="size-4" />} />
        <StatCard loading={loading} label="Conversion" value={`${m.conversion ?? 0}%`} icon={<MessageCircle className="size-4" />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Scans & review page views" description="Last 30 days" action={<Link to="/dashboard/analytics" className="text-[13px] font-medium text-brand-700 hover:underline">Full analytics →</Link>} />
            <div className="px-2 pb-4 pt-5">{loading ? <Skeleton className="mx-3 h-[260px]" /> : <ScanAreaChart data={data?.series.scans ?? []} />}</div>
          </Card>

          <Card>
            <CardHeader title="Click activity" description="What customers tap after reviewing" />
            <div className="px-2 pb-4 pt-5">{loading ? <Skeleton className="mx-3 h-[260px]" /> : <ClicksLineChart data={data?.series.clicks ?? []} />}</div>
          </Card>

          <Card>
            <CardHeader title="Recent activity" description="Live events from your card" />
            {loading ? (
              <div className="space-y-3 p-5">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : recentActivity.length === 0 ? (
              <div className="p-5"><EmptyState title="No activity yet" description="Share your QR code and events will appear here." action={<ButtonLink to="/dashboard/qr" size="sm">Get your QR</ButtonLink>} /></div>
            ) : (
              <ul className="divide-y divide-ink-100">
                {recentActivity.map((a) => {
                  const Icon = activityIcons[a.icon] ?? ScanLine
                  return (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600"><Icon className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-ink-900">{a.text}</p>
                        <p className="truncate text-[12px] text-ink-500">{a.meta}</p>
                      </div>
                      <span className="shrink-0 text-[12px] text-ink-400">{a.time}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <CardHeader title="Your card" description={published ? 'Live and scannable' : 'Not published yet'} />
            <div className="flex flex-col items-center px-5 pb-5 pt-4">
              <PhoneFrame height={380} width={230}><DigitalCardPreview card={card} /></PhoneFrame>
              <button onClick={copy} className="mt-4 w-full truncate rounded-xl bg-ink-50 px-3 py-2.5 text-center font-mono text-[12px] text-ink-600 hover:bg-ink-100">{reviewUrl(card.slug)}</button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Your QR code" />
            <div className="flex flex-col items-center gap-3 p-5 pt-4">
              <QRImage text={reviewUrl(card.slug)} size={130} />
              <ButtonLink to="/dashboard/qr" full variant="secondary" size="sm" icon={<QrCode className="size-4" />}>Customize & download</ButtonLink>
            </div>
          </Card>

          <Card>
            <CardHeader title="Devices" description="How customers open your card" />
            <div className="px-3 pb-4 pt-3">{loading ? <Skeleton className="mx-3 h-[220px]" /> : <DonutChart data={data?.devices ?? []} />}</div>
          </Card>

          <Card>
            <CardHeader title="Quick actions" />
            <div className="grid grid-cols-2 gap-2 p-5 pt-4">
              {[
                { to: '/dashboard/card-builder', icon: Palette, label: 'Edit card' },
                { to: '/dashboard/qr', icon: QrCode, label: 'Download QR' },
                { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
                { to: '/dashboard/store', icon: Boxes, label: 'Order cards' },
              ].map((a) => (
                <Link key={a.to} to={a.to} className="flex flex-col items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft">
                  <a.icon className="size-5 text-brand-600" />
                  <span className="text-[12px] font-semibold text-ink-700">{a.label}</span>
                </Link>
              ))}
            </div>
          </Card>

          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <h3 className="font-display text-[15px] font-bold text-brand-900">Get more from your card</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-brand-800/80">Order NFC cards so customers can tap instead of scan — ideal at a counter or reception desk.</p>
            <ButtonLink to="/dashboard/store" size="sm" className="mt-4" iconRight={<ArrowRight className="size-3.5" />}>Browse products</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  )
}
