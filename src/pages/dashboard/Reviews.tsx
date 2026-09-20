import { useCallback, useEffect, useState } from 'react'
import { Download, Eye, EyeOff, MessageSquareQuote, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, Badge } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/Table'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback'
import { StarsStatic } from '@/components/review/StarRating'
import { ownerApi, type OwnerReview, type ReviewStats } from '@/services/ownerApi'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { num } from '@/lib/format'
import { cn } from '@/lib/cn'

const when = (iso: string) => {
  const d = new Date(iso)
  const mins = Math.round((Date.now() - d.getTime()) / 60000)
  if (mins < 60) return `${Math.max(1, mins)} min ago`
  if (mins < 1440) return `${Math.round(mins / 60)} hr ago`
  if (mins < 10080) return `${Math.round(mins / 1440)} days ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function Reviews() {
  useDocumentTitle('Reviews')
  const toast = useToast()
  const [reviews, setReviews] = useState<OwnerReview[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [filter, setFilter] = useState<number | 'all'>('all')
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(() => {
    setState('loading')
    ownerApi.reviews
      .list({ rating: filter === 'all' ? undefined : filter })
      .then((r) => {
        setReviews(r.reviews)
        setStats(r.stats)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [filter])
  useEffect(load, [load])

  const setStatus = async (r: OwnerReview) => {
    const next = r.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED'
    setReviews((list) => list.map((x) => (x.id === r.id ? { ...x, status: next } : x)))
    try {
      await ownerApi.reviews.setStatus(r.id, next)
      toast(next === 'HIDDEN' ? 'Review hidden' : 'Review restored', 'info')
    } catch {
      setReviews((list) => list.map((x) => (x.id === r.id ? { ...x, status: r.status } : x)))
      toast('Could not update that review', 'error')
    }
  }

  const exportCsv = () => {
    const rows = [
      ['Date', 'Rating', 'Review', 'Name', 'From suggestion', 'Opened Google'],
      ...reviews.map((r) => [
        new Date(r.createdAt).toISOString().slice(0, 10),
        String(r.rating),
        (r.text ?? '').replace(/"/g, '""'),
        r.customerName ?? '',
        r.suggestion ? 'yes' : 'no',
        r.googleClickedAt ? 'yes' : 'no',
      ]),
    ]
    const csv = rows.map((row) => row.map((c) => `"${c}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'tapcard-reviews.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast('Reviews exported')
  }

  if (state === 'error') return <ErrorState onRetry={load} />

  const max = Math.max(1, ...(stats?.distribution.map((d) => d.count) ?? [1]))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="What customers submitted on your review page."
        action={<Button variant="secondary" icon={<Download className="size-4" />} onClick={exportCsv} disabled={reviews.length === 0}>Export CSV</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card className="p-6 text-center">
            {state === 'loading' || !stats ? (
              <Skeleton className="mx-auto h-24 w-40" />
            ) : (
              <>
                <p className="font-display text-5xl font-extrabold text-ink-900">{stats.average || '—'}</p>
                <StarsStatic value={stats.average} size={18} className="mt-2 justify-center" />
                <p className="mt-2 text-[13px] text-ink-500">{num(stats.total)} review{stats.total === 1 ? '' : 's'} on TapCard</p>
              </>
            )}
          </Card>

          <Card>
            <CardHeader title="Ratings" />
            <div className="space-y-2 p-5 pt-3">
              {(stats?.distribution ?? []).map((d) => (
                <button
                  key={d.rating}
                  onClick={() => setFilter(filter === d.rating ? 'all' : d.rating)}
                  className={cn('flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors', filter === d.rating ? 'bg-brand-50' : 'hover:bg-ink-50')}
                >
                  <span className="flex w-7 items-center gap-0.5 text-[13px] font-semibold text-ink-700">
                    {d.rating}
                    <Star className="size-3 text-amber-400" fill="currentColor" />
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <span className="block h-full rounded-full bg-amber-400" style={{ width: `${(d.count / max) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right text-[12px] text-ink-500">{d.count}</span>
                </button>
              ))}
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')} className="w-full pt-1 text-[12px] font-medium text-brand-700 hover:underline">
                  Clear filter
                </button>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Google" description="Clicks through to your Google listing" />
            <div className="p-5 pt-3">
              <p className="font-display text-3xl font-extrabold text-ink-900">{num(stats?.googleClicks ?? 0)}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
                Customers who tapped through to Google after reviewing. We count the click — we cannot see whether a review was
                published on Google, so we never claim one was.
              </p>
            </div>
          </Card>
        </div>

        <Card className="min-w-0">
          <CardHeader
            title={filter === 'all' ? 'All reviews' : `${filter}-star reviews`}
            description={`${reviews.length} shown`}
          />
          {state === 'loading' ? (
            <div className="space-y-3 p-5">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : reviews.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<MessageSquareQuote className="size-5" />}
                title={filter === 'all' ? 'No reviews yet' : 'No reviews with that rating'}
                description={filter === 'all' ? 'Share your QR code or review link and the first reviews will appear here.' : 'Try a different rating.'}
                action={filter === 'all' ? undefined : <Button variant="secondary" onClick={() => setFilter('all')}>Show all</Button>}
              />
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {reviews.map((r) => (
                <li key={r.id} className={cn('p-5', r.status === 'HIDDEN' && 'bg-ink-50/60')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <StarsStatic value={r.rating} size={15} />
                    <span className="text-[13px] font-semibold text-ink-900">{r.customerName ?? 'Anonymous'}</span>
                    <span className="text-[12px] text-ink-400">{when(r.createdAt)}</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      {r.suggestion && <Badge tone="neutral">{r.edited ? 'Edited a suggestion' : 'Used a suggestion'}</Badge>}
                      {r.googleClickedAt && <Badge tone="blue">Opened Google</Badge>}
                      {r.status === 'HIDDEN' && <Badge tone="amber">Hidden</Badge>}
                      <button
                        onClick={() => setStatus(r)}
                        aria-label={r.status === 'PUBLISHED' ? 'Hide review' : 'Restore review'}
                        title={r.status === 'PUBLISHED' ? 'Hide from your summary' : 'Restore'}
                        className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                      >
                        {r.status === 'PUBLISHED' ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                    </div>
                  </div>
                  {r.text && <p className="mt-2 text-[14px] leading-relaxed text-ink-700">“{r.text}”</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
