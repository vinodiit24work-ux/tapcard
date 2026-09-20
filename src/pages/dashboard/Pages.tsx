import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Download, ExternalLink, Eye, Inbox, LifeBuoy, MessageCircle, Package, Palette, Phone, QrCode, Search, Send, Trash2, Truck } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card, CardHeader, Badge, StatusBadge } from '@/components/ui/Card'
import { DataTable, PageHeader, type Column } from '@/components/ui/Table'
import { EmptyState, ErrorState, Modal } from '@/components/ui/Feedback'
import { Input, Select, Switch, Textarea } from '@/components/ui/Form'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { DigitalCardPreview } from '@/components/card/DigitalCardPreview'
import { QRImage } from '@/components/card/QRImage'
import { invoices, leads, orders } from '@/data/dashboard'
import { adminTickets } from '@/data/admin'
import { plans } from '@/data/commerce'
import { useCard } from '@/store/card'
import { useAuth } from '@/store/auth'
import { useMockQuery } from '@/hooks/useMockQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/components/ui/Toast'
import { inr, reviewUrl } from '@/lib/format'
import { cn } from '@/lib/cn'

/* ---------------------------------- My Card --------------------------------- */

export function MyCard() {
  useDocumentTitle('Review Card')
  const { card, published, publish, unpublish } = useCard()
  const toast = useToast()
  const sections = card.sections.filter((s) => s.enabled)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Card"
        description={published ? 'Your review card is live and scannable.' : 'Your review card is a draft — publish it to go live.'}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<ExternalLink className="size-4" />} onClick={() => window.open(`/review/${card.slug}`, '_blank')}>Open review page</Button>
            <ButtonLink to="/dashboard/card-builder" icon={<Palette className="size-4" />}>Customize</ButtonLink>
          </div>
        }
      />

      <div className="grid min-w-0 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="flex flex-col items-center p-6">
          <PhoneFrame height={520} width={270}><DigitalCardPreview card={card} /></PhoneFrame>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Status" description="Control whether customers can open your card" />
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                {published ? <Badge tone="green"><span className="size-1.5 rounded-full bg-current" /> Published</Badge> : <Badge tone="amber">Draft</Badge>}
                <span className="text-[14px] text-ink-600">{published ? 'Anyone with your link or QR can open it.' : 'Only you can see this card.'}</span>
              </div>
              <Switch checked={published} label="Published" onChange={(v) => { void (v ? publish() : unpublish()).then(() => toast(v ? 'Review card published' : 'Review card unpublished')).catch((e: Error) => toast(e.message, 'error')) }} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Card details" />
            <dl className="divide-y divide-ink-100">
              {[
                ['Business name', card.businessName],
                ['Category', card.category],
                ['Tagline', card.tagline || '—'],
                ['Public URL', reviewUrl(card.slug)],
                ['Phone', card.phone || '—'],
                ['WhatsApp', card.whatsapp || '—'],
                ['Email', card.email || '—'],
                ['Address', card.address || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <dt className="text-[13px] text-ink-500">{k}</dt>
                  <dd className="max-w-[60%] truncate text-right text-[14px] font-medium text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader title="Active sections" description={`${sections.length} of ${card.sections.length} showing`} />
              <div className="flex flex-wrap gap-1.5 p-5 pt-3">
                {card.sections.map((s) => (
                  <span key={s.id} className={cn('rounded-full px-2.5 py-1 text-[12px] font-medium capitalize', s.enabled ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-400 line-through')}>{s.id}</span>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader title="Your QR" />
              <div className="flex flex-col items-center gap-3 p-5 pt-3">
                <QRImage text={reviewUrl(card.slug)} size={120} />
                <ButtonLink to="/dashboard/qr" size="sm" variant="secondary" full icon={<QrCode className="size-4" />}>Download</ButtonLink>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------- Leads ---------------------------------- */

export function Leads() {
  useDocumentTitle('Leads')
  const [q, setQ] = useState('')
  const toast = useToast()
  const matched = leads.filter((l) => (l.name + l.phone + l.message).toLowerCase().includes(q.toLowerCase()))
  const { status, retry } = useMockQuery(matched, { delay: 550 })
  const rows = status === 'empty' ? [] : matched

  const columns: Column<(typeof leads)[number]>[] = [
    { key: 'name', header: 'Name', cell: (r) => <span className="font-semibold text-ink-900">{r.name}</span> },
    { key: 'phone', header: 'Phone', cell: (r) => <a href={`tel:${r.phone}`} className="text-brand-700 hover:underline">{r.phone}</a>, hideBelow: 'sm' },
    { key: 'message', header: 'Message', cell: (r) => <span className="line-clamp-1 max-w-sm">{r.message}</span>, hideBelow: 'md' },
    { key: 'source', header: 'Source', cell: (r) => <Badge tone="neutral">{r.source}</Badge>, hideBelow: 'lg' },
    { key: 'date', header: 'Date', cell: (r) => <span className="text-ink-500">{r.date}</span>, hideBelow: 'sm' },
    {
      key: 'act',
      header: '',
      className: 'text-right',
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <a aria-label={`WhatsApp ${r.name}`} href={`https://wa.me/${r.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-ink-500 hover:bg-emerald-50 hover:text-emerald-600"><MessageCircle className="size-4" /></a>
          <a aria-label={`Call ${r.name}`} href={`tel:${r.phone}`} className="rounded-lg p-2 text-ink-500 hover:bg-brand-50 hover:text-brand-600"><Phone className="size-4" /></a>
        </div>
      ),
    },
  ]

  if (status === 'error') return <ErrorState onRetry={retry} />

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="Enquiries from your card and WhatsApp." action={<Button variant="secondary" icon={<Download className="size-4" />} onClick={() => toast('Lead export arrives with the API', 'info')}>Export CSV</Button>} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads" aria-label="Search leads" className="h-9 w-full rounded-lg border border-ink-200 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
          </div>
          <span className="text-[13px] text-ink-500">{rows.length} leads</span>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={status === 'loading'}
          rowKey={(r) => r.id}
          empty={<EmptyState icon={<Inbox className="size-5" />} title={q ? 'No leads match that search' : 'No leads yet'} description={q ? 'Try a different name or number.' : 'When customers send an enquiry from your card, it appears here.'} action={q ? <Button variant="secondary" onClick={() => setQ('')}>Clear search</Button> : <ButtonLink to="/dashboard/qr" size="sm">Share your QR</ButtonLink>} />}
        />
      </Card>
    </div>
  )
}

/* ---------------------------------- Orders ---------------------------------- */

export function Orders() {
  useDocumentTitle('Orders')
  const { status, retry } = useMockQuery(orders, { delay: 500 })
  const [open, setOpen] = useState<(typeof orders)[number] | null>(null)
  const rows = status === 'empty' ? [] : orders

  const columns: Column<(typeof orders)[number]>[] = [
    { key: 'id', header: 'Order', cell: (r) => <span className="font-mono text-[13px] font-semibold text-ink-900">{r.id}</span> },
    { key: 'items', header: 'Items', cell: (r) => r.items, hideBelow: 'sm' },
    { key: 'date', header: 'Placed', cell: (r) => <span className="text-ink-500">{r.date}</span>, hideBelow: 'md' },
    { key: 'total', header: 'Total', cell: (r) => <span className="font-semibold text-ink-900">{inr(r.total)}</span> },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ]

  if (status === 'error') return <ErrorState onRetry={retry} />

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Your printed QR and NFC card orders." action={<ButtonLink to="/dashboard/store" icon={<Package className="size-4" />}>Order more</ButtonLink>} />
      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          loading={status === 'loading'}
          rowKey={(r) => r.id}
          onRowClick={setOpen}
          empty={<EmptyState icon={<Package className="size-5" />} title="No orders yet" description="Order printed QR cards, NFC cards or table stands for your counter." action={<ButtonLink to="/dashboard/store" size="sm">Browse the store</ButtonLink>} />}
        />
      </Card>

      <Modal open={!!open} onClose={() => setOpen(null)} title={open ? `Order ${open.id}` : ''} description={open?.date} footer={<Button variant="secondary" onClick={() => setOpen(null)}>Close</Button>}>
        {open && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-xl bg-ink-50 p-4">
              <div>
                <p className="text-[13px] text-ink-500">Status</p>
                <div className="mt-1"><StatusBadge status={open.status} /></div>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-ink-500">Total paid</p>
                <p className="font-display text-xl font-bold text-ink-900">{inr(open.total)}</p>
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink-700">Items</p>
              <p className="mt-1 text-[14px] text-ink-600">{open.items}</p>
            </div>
            {open.tracking ? (
              <div className="flex items-center gap-3 rounded-xl border border-ink-200 p-4">
                <Truck className="size-5 text-brand-600" />
                <div>
                  <p className="text-[13px] font-semibold text-ink-900">Tracking</p>
                  <p className="font-mono text-[13px] text-ink-600">{open.tracking}</p>
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-ink-200 p-4 text-center text-[13px] text-ink-500">Tracking appears once your order ships.</p>
            )}
            <div className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-[13px] leading-relaxed text-brand-900">
              <QrCode className="mt-0.5 size-4 shrink-0" />
              Every card in this order points to {reviewUrl('')}{'{your-slug}'} — update your card anytime without reprinting.
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

/* ---------------------------------- Billing --------------------------------- */

export function Billing() {
  useDocumentTitle('Billing')
  const toast = useToast()
  const [current, setCurrent] = useState('PRO')
  const [confirm, setConfirm] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Your plan, payment method and invoices." />

      <Card>
        <CardHeader title="Current plan" action={<Badge tone="brand">{current}</Badge>} />
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-display text-2xl font-extrabold text-ink-900">{plans.find((p) => p.id === current)?.name} · {inr(plans.find((p) => p.id === current)?.price ?? 0)}<span className="text-sm font-medium text-ink-500">/month</span></p>
            <p className="mt-1 text-[14px] text-ink-500">Renews on 1 October 2026 · GST invoice emailed each month</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setConfirm('cancel')}>Cancel plan</Button>
            <Button onClick={() => setConfirm('BUSINESS')}>Upgrade</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className={cn('flex flex-col p-6', current === p.id && 'ring-1 ring-brand-500')}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900">{p.name}</h3>
              {current === p.id && <Badge tone="brand">Current</Badge>}
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-ink-900">{p.price === 0 ? '₹0' : inr(p.price)}<span className="text-sm font-medium text-ink-500">/mo</span></p>
            <ul className="mt-5 flex-1 space-y-2 text-[13px] text-ink-600">{p.features.slice(0, 4).map((f) => <li key={f}>· {f}</li>)}</ul>
            <Button className="mt-5" full variant={current === p.id ? 'secondary' : 'primary'} disabled={current === p.id} onClick={() => setConfirm(p.id)}>
              {current === p.id ? 'Your plan' : plans.findIndex((x) => x.id === p.id) > plans.findIndex((x) => x.id === current) ? 'Upgrade' : 'Downgrade'}
            </Button>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Payment method" action={<Button size="sm" variant="secondary" onClick={() => toast('Payment methods are managed by Razorpay from Phase 3', 'info')}>Update</Button>} />
          <div className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-ink-100 text-ink-600"><CreditCard className="size-5" /></div>
            <div>
              <p className="text-[14px] font-semibold text-ink-900">UPI · growthscalex@okhdfc</p>
              <p className="text-[13px] text-ink-500">Default payment method</p>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Billing details" action={<Button size="sm" variant="secondary" onClick={() => toast('Saved')}>Save</Button>} />
          <div className="space-y-3 p-5">
            <Input label="Billing name" defaultValue="Royal Spice Hospitality Pvt. Ltd." />
            <Input label="GSTIN (optional)" placeholder="29ABCDE1234F1Z5" hint="Add your GSTIN to claim input tax credit." />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Invoices" description="Download a GST invoice for any payment" />
        <DataTable
          columns={[
            { key: 'id', header: 'Invoice', cell: (r) => <span className="font-mono text-[13px] font-semibold">{r.id}</span> },
            { key: 'date', header: 'Date', cell: (r) => r.date },
            { key: 'amount', header: 'Amount', cell: (r) => inr(r.amount) },
            { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            { key: 'a', header: '', className: 'text-right', cell: () => <Button size="sm" variant="ghost" icon={<Download className="size-3.5" />} onClick={() => toast('Invoice PDFs arrive with payments in Phase 3', 'info')}>PDF</Button> },
          ]}
          rows={invoices}
          rowKey={(r) => r.id}
        />
      </Card>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm === 'cancel' ? 'Cancel your plan?' : 'Change plan'}
        description={confirm === 'cancel' ? 'Your card stays online on the Free plan.' : 'Your card and data stay exactly as they are.'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>Keep current plan</Button>
            <Button
              variant={confirm === 'cancel' ? 'danger' : 'primary'}
              onClick={() => {
                if (confirm === 'cancel') { setCurrent('FREE'); toast('Plan cancelled — you are on Free') }
                else { setCurrent(confirm!); toast(`Switched to ${confirm}`) }
                setConfirm(null)
              }}
            >
              {confirm === 'cancel' ? 'Yes, cancel' : 'Confirm change'}
            </Button>
          </>
        }
      >
        <p className="text-[15px] leading-relaxed text-ink-600">
          {confirm === 'cancel'
            ? 'Pro features switch off at the end of your paid period. Your card, QR code and analytics history remain available on the Free plan.'
            : `You will be charged ${inr(plans.find((p) => p.id === confirm)?.price ?? 0)} per month plus GST. Real payment runs through Razorpay in Phase 3.`}
        </p>
      </Modal>
    </div>
  )
}

/* ---------------------------------- Settings -------------------------------- */

export function Settings() {
  useDocumentTitle('Settings')
  const { user, logout } = useAuth()
  const { card, patch } = useCard()
  const toast = useToast()
  const [danger, setDanger] = useState(false)
  const [notifs, setNotifs] = useState({ scans: true, leads: true, orders: true, product: false })

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Your account, business and preferences." />

      <Card>
        <CardHeader title="Account" />
        <div className="space-y-4 p-5">
          <Input label="Name" defaultValue={user?.name} />
          <Input label="Email" type="email" defaultValue={user?.email} hint="Used for login, receipts and alerts." />
          <Button onClick={() => toast('Account details saved')}>Save changes</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Business" />
        <div className="space-y-4 p-5">
          <Input label="Business name" value={card.businessName} onChange={(e) => patch({ businessName: e.target.value })} />
          <Select label="Category" value={card.category} onChange={(e) => patch({ category: e.target.value })}>
            {['Restaurant', 'Cafe', 'Salon', 'Gym', 'Doctor', 'Clinic', 'Real Estate', 'Retail', 'Freelancer', 'Consultant'].map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input label="Card link" value={card.slug} onChange={(e) => patch({ slug: e.target.value })} hint={reviewUrl(card.slug)} />
          <Button onClick={() => toast('Business details saved')}>Save changes</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Password" />
        <div className="space-y-4 p-5">
          <Input label="Current password" type="password" placeholder="••••••••" />
          <Input label="New password" type="password" placeholder="At least 8 characters" />
          <Button onClick={() => toast('Password updated')}>Update password</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Email notifications" />
        <div className="divide-y divide-ink-100">
          {([
            ['scans', 'Weekly scan summary', 'A short recap of scans and taps every Monday'],
            ['leads', 'New leads', 'Email me when someone sends an enquiry'],
            ['orders', 'Order updates', 'Production and shipping updates for printed cards'],
            ['product', 'Product news', 'Occasional updates about new TapCard features'],
          ] as const).map(([k, title, desc]) => (
            <div key={k} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-[14px] font-semibold text-ink-900">{title}</p>
                <p className="text-[13px] text-ink-500">{desc}</p>
              </div>
              <Switch checked={notifs[k]} label={title} onChange={(v) => { setNotifs({ ...notifs, [k]: v }); toast('Preference saved') }} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-red-200">
        <CardHeader title="Danger zone" description="These actions cannot be undone." />
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-[14px] font-semibold text-ink-900">Delete account and card</p>
            <p className="text-[13px] text-ink-500">Your card goes offline and your data is removed.</p>
          </div>
          <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setDanger(true)}>Delete account</Button>
        </div>
      </Card>

      <Modal
        open={danger}
        onClose={() => setDanger(false)}
        title="Delete your account?"
        description="This removes your card, QR links and analytics."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDanger(false)}>Keep my account</Button>
            <Button variant="danger" onClick={() => { void logout(); toast('Account deletion is handled by support for now', 'info') }}>Delete everything</Button>
          </>
        }
      >
        <p className="text-[15px] leading-relaxed text-ink-600">
          Anyone who scans a printed card will see a “card not found” page. Orders already placed are unaffected, and we keep payment records where tax law requires it.
        </p>
      </Modal>
    </div>
  )
}

/* ---------------------------------- Support --------------------------------- */

export function Support() {
  useDocumentTitle('Support')
  const toast = useToast()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || message.trim().length < 10) return toast('Add a subject and a little more detail', 'error')
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      setSubject('')
      setMessage('')
      toast('Ticket created — we reply within one working day')
    }, 800)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Support" description="We usually reply within one working day." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Open a ticket" />
            <form onSubmit={send} className="space-y-4 p-5">
              <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What do you need help with?" />
              <Textarea label="Describe the problem" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Include your card link and what you expected to happen." />
              <Button type="submit" loading={busy} icon={<Send className="size-4" />}>Send ticket</Button>
            </form>
          </Card>
          <Card>
            <CardHeader title="Your tickets" />
            <DataTable
              columns={[
                { key: 'id', header: 'Ticket', cell: (r) => <span className="font-mono text-[13px]">{r.id}</span> },
                { key: 'subject', header: 'Subject', cell: (r) => <span className="font-medium text-ink-900">{r.subject}</span> },
                { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
                { key: 'updated', header: 'Updated', cell: (r) => <span className="text-ink-500">{r.updated}</span>, hideBelow: 'sm' },
              ]}
              rows={adminTickets}
              rowKey={(r) => r.id}
              empty={<EmptyState icon={<LifeBuoy className="size-5" />} title="No tickets yet" description="Everything running smoothly." />}
            />
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Faster answers" />
            <div className="space-y-2 p-5 pt-3">
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-ink-200 p-3 hover:bg-ink-50">
                <MessageCircle className="size-5 text-emerald-600" />
                <span className="text-[14px] font-semibold text-ink-900">WhatsApp support</span>
              </a>
              <a href="mailto:support@tapcard.in" className="flex items-center gap-3 rounded-xl border border-ink-200 p-3 hover:bg-ink-50">
                <Send className="size-5 text-brand-600" />
                <span className="text-[14px] font-semibold text-ink-900">support@tapcard.in</span>
              </a>
              <Link to="/faq" className="flex items-center gap-3 rounded-xl border border-ink-200 p-3 hover:bg-ink-50">
                <Eye className="size-5 text-ink-600" />
                <span className="text-[14px] font-semibold text-ink-900">Read the FAQ</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
