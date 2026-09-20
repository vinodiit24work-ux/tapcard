import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, Check, CheckCircle2, Copy, ExternalLink, Inbox, Link2, Mail, MessageCircle,
  Nfc, Phone, QrCode, Search, ShieldCheck, Sparkles, X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, Badge } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/Table'
import { EmptyState, ErrorState, Modal, Skeleton } from '@/components/ui/Feedback'
import { Input, Select, Switch } from '@/components/ui/Form'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { QRImage } from '@/components/card/QRImage'
import { ReviewExperience } from '@/features/review/ReviewExperience'
import { requestApi, REQUEST_FLOW, STATUS_LABEL, type CardRequest, type RequestStatus } from '@/services/ownerApi'
import { reviewApi } from '@/services/reviewApi'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { slugify } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { ReviewCardData } from '@/types/review'

const tone = (s: RequestStatus) =>
  s === 'DELIVERED' || s === 'APPROVED' || s === 'GOOGLE_CONNECTED' ? 'green'
  : s === 'REVISION_REQUESTED' || s === 'CANCELLED' ? 'red'
  : s === 'NEW_REQUEST' ? 'amber'
  : s === 'SHIPPED' || s === 'DIGITAL_CARD_SENT' || s === 'FINAL_CARD_READY' ? 'blue'
  : 'neutral'

const when = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export function AdminRequests() {
  useDocumentTitle('Admin · Card Requests')
  const toast = useToast()
  const [requests, setRequests] = useState<CardRequest[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState<string>('ALL')
  const [q, setQ] = useState('')
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [openId, setOpenId] = useState<string | null>(null)

  const load = useCallback(() => {
    setState('loading')
    requestApi
      .list({ status: filter === 'ALL' ? undefined : filter, q: q || undefined })
      .then((r) => {
        setRequests(r.requests)
        setCounts(r.counts)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [filter, q])
  useEffect(load, [load])

  const open = requests.find((r) => r.id === openId) ?? null

  if (state === 'error') return <ErrorState onRetry={load} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Card Requests"
        description="Every “Get My TapCard” enquiry, from first contact to a delivered card."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
          {(['ALL', 'NEW_REQUEST', 'CREATING_CARD', 'CUSTOMER_APPROVAL', 'REVISION_REQUESTED', 'FINAL_CARD_READY', 'DELIVERED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                filter === s ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50',
              )}
            >
              {s === 'ALL' ? 'All' : STATUS_LABEL[s]}
              {s !== 'ALL' && counts[s] ? <span className="ml-1.5 opacity-60">{counts[s]}</span> : null}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Business, name, phone or ref"
            aria-label="Search requests"
            className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
          />
        </div>
      </div>

      {state === 'loading' ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-5" />}
          title={q || filter !== 'ALL' ? 'No requests match' : 'No requests yet'}
          description={q || filter !== 'ALL' ? 'Try a different filter or search.' : 'Enquiries from the website land here.'}
        />
      ) : (
        <div className="grid gap-3">
          {requests.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-center gap-4 p-4 transition-shadow hover:shadow-soft">
              <div className="min-w-[200px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-[15px] font-bold text-ink-900">{r.businessName}</h3>
                  <Badge tone={tone(r.status)}>{STATUS_LABEL[r.status]}</Badge>
                  {r.business?.googleConnectedAt && <Badge tone="green"><ShieldCheck className="size-3" /> Google</Badge>}
                </div>
                <p className="mt-1 text-[13px] text-ink-500">
                  {r.contactName} · {r.phone}
                  {r.city ? ` · ${r.city}` : ''} · {r.category}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-ink-500">
                {r.wantsDigital && <Badge tone="neutral">Digital</Badge>}
                {r.wantsPhysical && <Badge tone="neutral">Physical</Badge>}
              </div>
              <div className="text-right text-[12px] text-ink-400">
                <p className="font-mono">{r.reference}</p>
                <p>{when(r.createdAt)}</p>
              </div>
              <Button size="sm" onClick={() => setOpenId(r.id)} iconRight={<ArrowRight className="size-3.5" />}>
                {r.businessId ? 'Open' : 'Create card'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {open && <RequestDrawer request={open} onClose={() => setOpenId(null)} onChanged={load} toast={toast} />}
    </div>
  )
}

/* ------------------------------------------------------------------ drawer -- */

function RequestDrawer({
  request,
  onClose,
  onChanged,
  toast,
}: {
  request: CardRequest
  onClose: () => void
  onChanged: () => void
  toast: (m: string, t?: 'success' | 'error' | 'info') => void
}) {
  const [r, setR] = useState(request)
  const [tab, setTab] = useState<'details' | 'design' | 'google' | 'final'>('details')
  const [busy, setBusy] = useState(false)
  const [slug, setSlug] = useState(slugify(request.businessName))
  const [template, setTemplate] = useState('restaurant')
  const [preview, setPreview] = useState<ReviewCardData | null>(null)
  const [sent, setSent] = useState<{ link: string; message: string; whatsapp: string | null; mailto: string | null } | null>(null)

  const refresh = useCallback(
    (next: CardRequest) => {
      setR(next)
      onChanged()
    },
    [onChanged],
  )

  const slugRef = r.business?.card?.slug
  useEffect(() => {
    if (!slugRef) return setPreview(null)
    reviewApi.getCard(slugRef, true).then(setPreview).catch(() => setPreview(null))
  }, [slugRef, r.business?.reviewUrl, r.business?.suggestions.length])

  const run = (fn: () => Promise<CardRequest>, ok: string) => {
    setBusy(true)
    fn()
      .then((next) => { refresh(next); toast(ok) })
      .catch((e: Error) => toast(e.message, 'error'))
      .finally(() => setBusy(false))
  }

  return (
    <Modal open onClose={onClose} size="xl" title={r.businessName} description={`${r.reference} · ${r.contactName} · ${r.phone}`}>
      <div className="mb-5 flex gap-1.5">
        {([['details', 'Customer & card'], ['design', 'Design & phrases'], ['google', 'Google review'], ['final', 'Final card']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn('rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors', tab === id ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0 space-y-5">
          {tab === 'details' && <DetailsTab r={r} busy={busy} slug={slug} setSlug={setSlug} template={template} setTemplate={setTemplate} run={run} />}
          {tab === 'design' && <DesignTab r={r} busy={busy} run={run} toast={toast} />}
          {tab === 'google' && <GoogleTab r={r} busy={busy} run={run} toast={toast} />}
          {tab === 'final' && <FinalTab r={r} busy={busy} run={run} sent={sent} setSent={setSent} toast={toast} setBusy={setBusy} />}
        </div>

        <div className="hidden xl:block">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink-400">Review page preview</p>
          {preview ? (
            <PhoneFrame height={520} width={270}><ReviewExperience card={preview} /></PhoneFrame>
          ) : (
            <div className="flex h-[520px] w-[270px] items-center justify-center rounded-2xl border border-dashed border-ink-300 p-6 text-center text-[13px] text-ink-400">
              Create the card to see the customer's review page here.
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

/* ---------------------------------------------------------------- details -- */

function DetailsTab({
  r, busy, slug, setSlug, template, setTemplate, run,
}: {
  r: CardRequest; busy: boolean; slug: string; setSlug: (s: string) => void
  template: string; setTemplate: (s: string) => void
  run: (fn: () => Promise<CardRequest>, ok: string) => void
}) {
  const [note, setNote] = useState('')
  return (
    <>
      <Card>
        <CardHeader title="Customer" description="Captured from the website enquiry" />
        <dl className="divide-y divide-ink-100">
          {[
            ['Owner / contact', r.contactName],
            ['Phone', r.phone],
            ['WhatsApp', r.whatsapp || '—'],
            ['Email', r.email || '—'],
            ['Category', r.category],
            ['City', r.city || '—'],
            ['Address', r.address || '—'],
            ['Wants', [r.wantsDigital && 'Digital card', r.wantsPhysical && 'Physical card'].filter(Boolean).join(' + ') || '—'],
            ['Requested', when(r.createdAt)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-4 px-5 py-2.5">
              <dt className="text-[13px] text-ink-500">{k}</dt>
              <dd className="max-w-[60%] text-right text-[14px] font-medium text-ink-900">{v}</dd>
            </div>
          ))}
        </dl>
        {r.notes && <p className="border-t border-ink-100 px-5 py-3 text-[13px] italic text-ink-600">“{r.notes}”</p>}
        <div className="flex flex-wrap gap-2 border-t border-ink-100 p-4">
          <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50"><Phone className="size-3.5" /> Call</a>
          {r.whatsapp && <a href={`https://wa.me/${r.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50"><MessageCircle className="size-3.5" /> WhatsApp</a>}
          {r.email && <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50"><Mail className="size-3.5" /> Email</a>}
        </div>
      </Card>

      {!r.businessId ? (
        <Card>
          <CardHeader title="Create the card" description="Sets up the business, its permanent review link and a starter set of phrases." />
          <div className="space-y-4 p-5">
            <Input label="Permanent link" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} hint={`Customers will land on /review/${slug || 'business-name'} — this never changes once printed.`} leading={<span className="text-[13px]">/review/</span>} className="[&_input]:pl-[70px]" />
            <Select label="Starting template" value={template} onChange={(e) => setTemplate(e.target.value)}>
              {['restaurant', 'cafe', 'salon', 'gym', 'doctor', 'clinic', 'real-estate', 'freelancer', 'consultant', 'retail'].map((t) => (
                <option key={t} value={t}>{t.replace('-', ' ')}</option>
              ))}
            </Select>
            <Button loading={busy} disabled={slug.length < 3} onClick={() => run(() => requestApi.build(r.id, { slug, templateKey: template }), 'Card created')} icon={<Sparkles className="size-4" />}>
              Create card
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Card"
            description={`Live at /review/${r.business?.card?.slug}`}
            action={<a href={`/review/${r.business?.card?.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 hover:underline">Open <ExternalLink className="size-3.5" /></a>}
          />
          <div className="flex flex-wrap items-center gap-3 p-5">
            <Badge tone={r.business?.card?.status === 'PUBLISHED' ? 'green' : 'amber'}>{r.business?.card?.status}</Badge>
            <span className="text-[13px] text-ink-500">{r.business?.suggestions.length ?? 0} review phrases</span>
            <a href="/dashboard/card-builder" className="ml-auto text-[13px] font-medium text-brand-700 hover:underline">Edit design →</a>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Move this request along" />
        <div className="space-y-3 p-5">
          <Select label="Status" value={r.status} onChange={(e) => run(() => requestApi.setStatus(r.id, e.target.value as RequestStatus, note || undefined), 'Status updated')}>
            {REQUEST_FLOW.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </Select>
          <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Spoke to the owner, confirmed the order" />
          {r.events.length > 0 && (
            <ol className="mt-2 space-y-2 border-t border-ink-100 pt-3">
              {r.events.slice(0, 6).map((e) => (
                <li key={e.id} className="flex gap-2 text-[12px]">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-ink-300" />
                  <span>
                    <strong className="font-semibold text-ink-800">{STATUS_LABEL[e.status]}</strong>
                    {e.note ? <span className="text-ink-500"> — {e.note}</span> : null}
                    <span className="block text-ink-400">{when(e.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Card>
    </>
  )
}

/* ----------------------------------------------------------------- design -- */

function DesignTab({
  r, busy, run, toast,
}: {
  r: CardRequest; busy: boolean
  run: (fn: () => Promise<CardRequest>, ok: string) => void
  toast: (m: string, t?: 'success' | 'error' | 'info') => void
}) {
  const [phrases, setPhrases] = useState(
    r.business?.suggestions.map((s) => ({ text: s.text, enabled: s.enabled !== false })) ?? [],
  )
  const [primary, setPrimary] = useState('#5b4bff')

  if (!r.businessId) {
    return <EmptyState icon={<Sparkles className="size-5" />} title="Create the card first" description="Design and phrases are saved against the customer's card." />
  }

  const move = (i: number, dir: -1 | 1) => {
    const next = [...phrases]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setPhrases(next)
  }

  return (
    <>
      <Card>
        <CardHeader title="Logo & branding" description="Shown at the top of the customer's review page" />
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            {r.business?.logoUrl ? (
              <img src={r.business.logoUrl} alt="" className="size-14 rounded-xl object-cover ring-1 ring-ink-200" />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-xl bg-ink-100 text-[11px] text-ink-400">None</div>
            )}
            <label className="cursor-pointer rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50">
              Upload logo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  if (f.size > 2 * 1024 * 1024) return toast('Image must be under 2MB', 'error')
                  const reader = new FileReader()
                  reader.onload = () => run(() => requestApi.updateBusiness(r.id, { logoUrl: String(reader.result) }), 'Logo saved')
                  reader.readAsDataURL(f)
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Input label="Brand colour" value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-40 [&_input]:font-mono [&_input]:uppercase" />
            <Button size="sm" variant="secondary" loading={busy} onClick={() => run(() => requestApi.updateCard(r.id, { appearance: { primary, themeId: 'custom' } }), 'Colour saved')}>
              Apply colour
            </Button>
            <a href="/dashboard/card-builder" className="ml-auto text-[13px] font-medium text-brand-700 hover:underline">Full design editor →</a>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title={`Suggested review phrases (${phrases.length})`} description="Customers tap one to start, then edit it in their own words." />
        <div className="space-y-2 p-5">
          {phrases.map((p, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl border border-ink-200 p-2.5">
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded px-1 text-ink-400 hover:bg-ink-100 disabled:opacity-30" aria-label="Move up">↑</button>
                <button onClick={() => move(i, 1)} disabled={i === phrases.length - 1} className="rounded px-1 text-ink-400 hover:bg-ink-100 disabled:opacity-30" aria-label="Move down">↓</button>
              </div>
              <textarea
                value={p.text}
                onChange={(e) => setPhrases(phrases.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                rows={2}
                maxLength={300}
                className="min-w-0 flex-1 resize-none rounded-lg border border-ink-200 px-2.5 py-1.5 text-[13px] focus:border-brand-500 focus:outline-none"
              />
              <div className="flex shrink-0 items-center gap-1">
                <Switch checked={p.enabled} label="Enabled" onChange={(v) => setPhrases(phrases.map((x, j) => (j === i ? { ...x, enabled: v } : x)))} />
                <button onClick={() => setPhrases(phrases.filter((_, j) => j !== i))} aria-label="Delete" className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600"><X className="size-4" /></button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant="secondary" disabled={phrases.length >= 12} onClick={() => setPhrases([...phrases, { text: '', enabled: true }])}>Add phrase</Button>
            <Button
              size="sm"
              loading={busy}
              disabled={phrases.some((p) => p.text.trim().length < 4)}
              onClick={() => run(() => requestApi.setSuggestions(r.id, phrases.map((p) => ({ text: p.text.trim(), enabled: p.enabled }))), 'Phrases saved')}
            >
              Save phrases
            </Button>
          </div>
          <p className="text-[12px] leading-relaxed text-ink-500">
            Nothing is ever posted to Google for the customer — they choose or write their review and continue there themselves.
          </p>
        </div>
      </Card>
    </>
  )
}

/* ----------------------------------------------------------------- google -- */

function GoogleTab({
  r, busy, run, toast,
}: {
  r: CardRequest; busy: boolean
  run: (fn: () => Promise<CardRequest>, ok: string) => void
  toast: (m: string, t?: 'success' | 'error' | 'info') => void
}) {
  const [url, setUrl] = useState(r.business?.reviewUrl ?? '')
  const [name, setName] = useState(r.business?.googleName ?? r.businessName)
  const [address, setAddress] = useState(r.business?.googleAddress ?? [r.address, r.city].filter(Boolean).join(', '))
  const [opened, setOpened] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const connected = Boolean(r.business?.googleConnectedAt)

  const searchUrl = useMemo(
    () => `https://www.google.com/maps/search/${encodeURIComponent([r.businessName, r.address, r.city].filter(Boolean).join(' '))}`,
    [r.businessName, r.address, r.city],
  )

  if (!r.businessId) {
    return <EmptyState icon={<ShieldCheck className="size-5" />} title="Create the card first" description="The Google connection is saved against the customer's business." />
  }

  return (
    <>
      {connected && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-emerald-900">Google Review Connected ✓</p>
            <p className="mt-0.5 text-[13px] text-emerald-800">{r.business?.googleName ?? 'Verified destination'}</p>
            <a href={r.business?.reviewUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all font-mono text-[11px] text-emerald-700 underline">{r.business?.reviewUrl}</a>
            <p className="mt-1.5 text-[12px] text-emerald-700">Verified by {r.business?.googleVerifiedBy} · {r.business?.googleConnectedAt ? when(r.business.googleConnectedAt) : ''}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader title="Find the customer's business on Google" description="Open the search, find their listing, then copy its review link." />
        <div className="space-y-4 p-5">
          <a href={searchUrl} target="_blank" rel="noreferrer" onClick={() => setOpened(true)} className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-ink-800 hover:bg-ink-50">
            <Search className="size-4" /> Search Google Maps for “{r.businessName}”
            <ExternalLink className="size-3.5 text-ink-400" />
          </a>

          <ol className="space-y-1.5 rounded-xl bg-ink-50 p-4 text-[13px] leading-relaxed text-ink-600">
            <li>1. Find the customer's listing and open it.</li>
            <li>2. Choose <strong>Share → Copy link</strong>, or open the business profile and use <strong>Ask for reviews</strong>.</li>
            <li>3. Paste that link below and confirm it opens the right business.</li>
          </ol>

          <Input
            label="Google review link"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setConfirmed(false) }}
            placeholder="https://g.page/r/... or https://maps.app.goo.gl/..."
            hint="Accepted: g.page, maps.app.goo.gl, search.google.com or google.com links."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Business name on Google" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Address on Google" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <input
              id="verified"
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-amber-400 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="verified" className="text-[13px] leading-relaxed text-amber-900">
              I opened this link and it shows <strong>the customer's own business</strong>. We never guess a review link from a
              business name — a wrong link sends their customers to someone else's listing.
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={!url}
              onClick={() => { window.open(url, '_blank', 'noopener'); setOpened(true); toast('Check it shows the right business', 'info') }}
              icon={<ExternalLink className="size-4" />}
            >
              Test this link
            </Button>
            <Button
              loading={busy}
              disabled={!url || !confirmed}
              onClick={() => run(() => requestApi.connectGoogle(r.id, { reviewUrl: url.trim(), googleName: name.trim() || undefined, googleAddress: address.trim() || undefined, verified: true }), 'Google review connected')}
              icon={<ShieldCheck className="size-4" />}
            >
              {connected ? 'Update connection' : 'Connect Google review'}
            </Button>
          </div>
          {!opened && url && <p className="text-[12px] text-ink-500">Open the link once before confirming.</p>}
        </div>
      </Card>

      <p className="text-[12px] leading-relaxed text-ink-500">
        The QR and NFC never point at Google directly — they point at the permanent TapCard review page, which then offers this
        Google link. Changing the destination later needs no reprint.
      </p>
    </>
  )
}

/* ------------------------------------------------------------------ final -- */

function FinalTab({
  r, busy, run, sent, setSent, toast, setBusy,
}: {
  r: CardRequest; busy: boolean
  run: (fn: () => Promise<CardRequest>, ok: string) => void
  sent: { link: string; message: string; whatsapp: string | null; mailto: string | null } | null
  setSent: (s: { link: string; message: string; whatsapp: string | null; mailto: string | null } | null) => void
  toast: (m: string, t?: 'success' | 'error' | 'info') => void
  setBusy: (b: boolean) => void
}) {
  const slug = r.business?.card?.slug
  const reviewUrl = r.links?.review ?? ''
  const approval = r.business?.card

  if (!slug) {
    return <EmptyState icon={<QrCode className="size-5" />} title="Create the card first" description="The final card is generated once the customer's card exists." />
  }

  return (
    <>
      <Card>
        <CardHeader title="Before generating" description="Every item must be done — the checklist reflects live data." />
        <ul className="divide-y divide-ink-100">
          {r.readiness.checks.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-5 py-2.5">
              <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full', c.done ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-400')}>
                {c.done ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" />}
              </span>
              <span className={cn('text-[14px]', c.done ? 'text-ink-800' : 'text-ink-500')}>{c.label}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-ink-100 p-5">
          <Button
            loading={busy}
            disabled={!r.readiness.ready}
            onClick={() => run(() => requestApi.generate(r.id), 'Final card generated and published')}
            icon={<Sparkles className="size-4" />}
          >
            Generate final card
          </Button>
          {!r.readiness.ready && <p className="mt-2 text-[12px] text-ink-500">Finish the outstanding items above first.</p>}
        </div>
      </Card>

      <Card>
        <CardHeader title="QR & NFC" description="Both point at the permanent review link" />
        <div className="flex flex-wrap items-center gap-5 p-5">
          <div className="rounded-xl border border-ink-200 p-3"><QRImage text={reviewUrl} size={120} /></div>
          <div className="min-w-[200px] flex-1 space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2">
              <Link2 className="size-3.5 shrink-0 text-ink-400" />
              <code className="truncate font-mono text-[11px] text-ink-700">{reviewUrl}</code>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-ink-950 px-3 py-2 text-white">
              <Nfc className="size-3.5 shrink-0 text-brand-300" />
              <code className="truncate font-mono text-[11px]">{reviewUrl}</code>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="secondary" onClick={() => window.open(reviewUrl, '_blank')} icon={<ExternalLink className="size-3.5" />}>Test QR destination</Button>
              <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(reviewUrl); toast('NFC destination copied') }} icon={<Copy className="size-3.5" />}>Copy NFC URL</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Send the digital card"
          description="Creates the customer's approval link — nothing is sent automatically."
          action={approval?.approvalStatus && approval.approvalStatus !== 'NOT_SENT' ? <Badge tone={approval.approvalStatus === 'APPROVED' ? 'green' : approval.approvalStatus === 'CHANGES_REQUESTED' ? 'red' : 'blue'}>{approval.approvalStatus.replace('_', ' ').toLowerCase()}</Badge> : undefined}
        />
        <div className="space-y-3 p-5">
          {approval?.revisionNote && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-[13px] font-semibold text-red-900">The customer asked for changes</p>
              <p className="mt-1 text-[13px] text-red-800">“{approval.revisionNote}”</p>
            </div>
          )}
          <Button
            loading={busy}
            onClick={() => {
              setBusy(true)
              requestApi
                .send(r.id, 'link')
                .then((s) => { setSent(s); toast('Approval link ready') })
                .catch((e: Error) => toast(e.message, 'error'))
                .finally(() => setBusy(false))
            }}
            icon={<Sparkles className="size-4" />}
          >
            Prepare the customer's link
          </Button>

          {sent && (
            <div className="space-y-3 rounded-xl border border-ink-200 bg-ink-50 p-4">
              <p className="text-[13px] text-ink-700">{sent.message}</p>
              <div className="flex flex-wrap gap-2">
                {sent.whatsapp && <a href={sent.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"><MessageCircle className="size-3.5" /> Send on WhatsApp</a>}
                {sent.mailto && <a href={sent.mailto} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] font-semibold text-ink-800 hover:bg-ink-100"><Mail className="size-3.5" /> Send by email</a>}
                <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(sent.link); toast('Link copied') }} icon={<Copy className="size-3.5" />}>Copy link</Button>
                <Button size="sm" variant="ghost" onClick={() => window.open(sent.link, '_blank')} icon={<ExternalLink className="size-3.5" />}>Preview as customer</Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {r.wantsPhysical && (
        <Card>
          <CardHeader title="Physical card" description="Move the request along as production progresses" />
          <div className="flex flex-wrap gap-2 p-5">
            {(['PHYSICAL_CARD_PREPARING', 'SHIPPED', 'DELIVERED'] as const).map((s) => (
              <Button key={s} size="sm" variant={r.status === s ? 'primary' : 'secondary'} loading={busy} onClick={() => run(() => requestApi.setStatus(r.id, s), `Marked ${STATUS_LABEL[s].toLowerCase()}`)}>
                {STATUS_LABEL[s]}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
