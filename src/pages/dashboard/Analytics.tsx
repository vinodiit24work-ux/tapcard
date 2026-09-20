import { useCallback, useEffect, useState } from 'react'
import { CalendarCheck, Download, Eye, MapPin, MessageCircle, MousePointerClick, Phone, ScanLine, Star, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/Stat'
import { ErrorState, Skeleton } from '@/components/ui/Feedback'
import { Segmented } from '@/components/ui/Form'
import { ClicksLineChart, DonutChart, HorizontalBars, ScanAreaChart } from '@/components/charts/Charts'
import { rangeLabel, type Range } from '@/data/dashboard'
import { analyticsApi, type AnalyticsSummary } from '@/services/ownerApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/components/ui/Toast'

export function Analytics() {
  useDocumentTitle('Analytics')
  const [range, setRange] = useState<Range>('30')
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const toast = useToast()

  const load = useCallback(() => {
    setState('loading')
    analyticsApi
      .summary(range)
      .then((d) => { setData(d); setState('ready') })
      .catch(() => setState('error'))
  }, [range])
  useEffect(load, [load])

  const loading = state === 'loading'
  if (state === 'error') return <ErrorState onRetry={load} />

  const m = data?.metrics ?? {}
  const deltas = data?.deltas ?? {}
  const tiles = [
    { label: 'Scans & Opens', value: m.scans ?? 0, delta: deltas.scans, icon: <ScanLine className="size-4" /> },
    { label: 'Review Page Views', value: m.reviewViews ?? 0, delta: deltas.reviewViews, icon: <Eye className="size-4" /> },
    { label: 'Reviews Submitted', value: m.reviewsSubmitted ?? 0, delta: deltas.reviewsSubmitted, icon: <Star className="size-4" /> },
    { label: 'Unique Visitors', value: m.visitors ?? 0, delta: deltas.visitors, icon: <Eye className="size-4" /> },
    { label: 'WhatsApp', value: m.whatsapp ?? 0, delta: deltas.whatsapp, icon: <MessageCircle className="size-4" /> },
    { label: 'Calls', value: m.calls ?? 0, delta: deltas.calls, icon: <Phone className="size-4" /> },
    { label: 'Website', value: m.website ?? 0, delta: deltas.website, icon: <MousePointerClick className="size-4" /> },
    { label: 'Google Reviews', value: m.reviews ?? 0, delta: deltas.reviews, icon: <Star className="size-4" /> },
    { label: 'Directions', value: m.maps ?? 0, delta: deltas.maps, icon: <MapPin className="size-4" /> },
    { label: 'Menu Views', value: m.menu ?? 0, delta: deltas.menu, icon: <UtensilsCrossed className="size-4" /> },
    { label: 'Bookings', value: m.bookings ?? 0, delta: deltas.bookings, icon: <CalendarCheck className="size-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">Analytics</h1>
          <p className="mt-1 text-[15px] text-ink-500">Scans, review page views and reviews collected · {rangeLabel[range]}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented className="w-[290px]" value={range} onChange={setRange} options={(['1', '7', '30', '90'] as Range[]).map((r) => ({ value: r, label: rangeLabel[r] }))} />
          <Button variant="secondary" icon={<Download className="size-4" />} onClick={() => toast('CSV export is connected to the API in a later phase', 'info')}>Export</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t) => <StatCard key={t.label} loading={loading} {...t} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Scans over time" description={rangeLabel[range]} />
          <div className="px-2 pb-4 pt-5">{loading ? <Skeleton className="mx-3 h-[260px]" /> : <ScanAreaChart data={data?.series.scans ?? []} />}</div>
        </Card>
        <Card>
          <CardHeader title="Clicks by action" description="WhatsApp, calls and website" />
          <div className="px-2 pb-4 pt-5">{loading ? <Skeleton className="mx-3 h-[260px]" /> : <ClicksLineChart data={data?.series.clicks ?? []} />}</div>
        </Card>
        <Card>
          <CardHeader title="Most tapped buttons" description="Across the selected period" />
          <div className="px-2 pb-4 pt-5">{loading ? <Skeleton className="mx-3 h-[260px]" /> : <HorizontalBars data={data?.topActions ?? []} />}</div>
        </Card>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Card>
            <CardHeader title="Devices" />
            <div className="px-3 pb-4 pt-3">{loading ? <Skeleton className="mx-3 h-[220px]" /> : <DonutChart data={data?.devices ?? []} />}</div>
          </Card>
          <Card>
            <CardHeader title="Sources" />
            <div className="px-3 pb-4 pt-3">{loading ? <Skeleton className="mx-3 h-[220px]" /> : <DonutChart data={data?.sources ?? []} />}</div>
          </Card>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-ink-50 p-5 text-[13px] leading-relaxed text-ink-600">
        <strong className="font-semibold text-ink-800">About this data.</strong> We record the event type and a coarse device category, plus a daily-rotating hash used only to estimate unique visitors. We do not track your customers across sites or store anything that identifies them personally. A tap through to Google is counted as a click — we cannot see whether a review was published there.
      </div>
    </div>
  )
}
