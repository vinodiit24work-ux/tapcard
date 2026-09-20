import { useState } from 'react'
import { CalendarCheck, Download, Eye, MapPin, MessageCircle, MousePointerClick, Phone, ScanLine, Star, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/Stat'
import { ErrorState, Skeleton } from '@/components/ui/Feedback'
import { Segmented } from '@/components/ui/Form'
import { ClicksLineChart, DonutChart, HorizontalBars, ScanAreaChart } from '@/components/charts/Charts'
import { clicksSeries, deltas, devices, metricsFor, rangeLabel, scansSeries, sources, topActions, type Range } from '@/data/dashboard'
import { useMockQuery } from '@/hooks/useMockQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/components/ui/Toast'

export function Analytics() {
  useDocumentTitle('Analytics')
  const [range, setRange] = useState<Range>('30')
  const toast = useToast()
  const m = metricsFor(range)
  const { status, retry } = useMockQuery(m, { delay: 600 })
  const loading = status === 'loading'

  if (status === 'error') return <ErrorState onRetry={retry} />

  const tiles = [
    { label: 'QR Scans', value: m.scans, delta: deltas.scans, icon: <ScanLine className="size-4" /> },
    { label: 'Unique Visitors', value: m.visitors, delta: deltas.visitors, icon: <Eye className="size-4" /> },
    { label: 'WhatsApp', value: m.whatsapp, delta: deltas.whatsapp, icon: <MessageCircle className="size-4" /> },
    { label: 'Calls', value: m.calls, delta: deltas.calls, icon: <Phone className="size-4" /> },
    { label: 'Website', value: m.website, delta: deltas.website, icon: <MousePointerClick className="size-4" /> },
    { label: 'Google Reviews', value: m.reviews, delta: deltas.reviews, icon: <Star className="size-4" /> },
    { label: 'Directions', value: m.maps, delta: deltas.maps, icon: <MapPin className="size-4" /> },
    { label: 'Menu Views', value: m.menu, delta: deltas.menu, icon: <UtensilsCrossed className="size-4" /> },
    { label: 'Bookings', value: m.bookings, delta: deltas.bookings, icon: <CalendarCheck className="size-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">Analytics</h1>
          <p className="mt-1 text-[15px] text-ink-500">Scans and taps on your digital card · {rangeLabel[range]}</p>
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
          <div className="px-2 pb-4 pt-5">{loading ? <Skeleton className="mx-3 h-[260px]" /> : <ScanAreaChart data={scansSeries(range)} />}</div>
        </Card>
        <Card>
          <CardHeader title="Clicks by action" description="WhatsApp, calls and website" />
          <div className="px-2 pb-4 pt-5">{loading ? <Skeleton className="mx-3 h-[260px]" /> : <ClicksLineChart data={clicksSeries(range)} />}</div>
        </Card>
        <Card>
          <CardHeader title="Most tapped buttons" description="Across the selected period" />
          <div className="px-2 pb-4 pt-5">{loading ? <Skeleton className="mx-3 h-[260px]" /> : <HorizontalBars data={topActions} />}</div>
        </Card>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Card>
            <CardHeader title="Devices" />
            <div className="px-3 pb-4 pt-3">{loading ? <Skeleton className="mx-3 h-[220px]" /> : <DonutChart data={devices} />}</div>
          </Card>
          <Card>
            <CardHeader title="Sources" />
            <div className="px-3 pb-4 pt-3">{loading ? <Skeleton className="mx-3 h-[220px]" /> : <DonutChart data={sources} />}</div>
          </Card>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-ink-50 p-5 text-[13px] leading-relaxed text-ink-600">
        <strong className="font-semibold text-ink-800">About this data.</strong> We record the event type, a coarse device category and an approximate location at the time of the request. We do not track your customers across sites or store anything that identifies them personally.
      </div>
    </div>
  )
}
