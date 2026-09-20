import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ban, Building2, CheckCircle2, CreditCard, Download, ExternalLink, IndianRupee, LifeBuoy, Package, Percent, Plus, Search, Settings as SettingsIcon, ShieldCheck, Ticket, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, Badge, StatusBadge } from '@/components/ui/Card'
import { DataTable, PageHeader, type Column } from '@/components/ui/Table'
import { EmptyState, Modal } from '@/components/ui/Feedback'
import { Input, Segmented, Select, Switch, Textarea } from '@/components/ui/Form'
import { StatCard } from '@/components/ui/Stat'
import { RevenueBars } from '@/components/charts/Charts'
import { adminBusinesses, adminCoupons, adminOrders, adminPayments, adminRevenue, adminStats, adminTemplates, adminTickets, adminUsers } from '@/data/admin'
import { plans, products } from '@/data/commerce'
import { useMockQuery } from '@/hooks/useMockQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/components/ui/Toast'
import { cardUrl, inr } from '@/lib/format'

/** Shared search + table frame for the admin list screens. */
function ListPage<T extends object>({ title, description, action, columns, rows, search, placeholder, empty, onRowClick }: {
  title: string
  description: string
  action?: React.ReactNode
  columns: Column<T>[]
  rows: T[]
  search: (row: T, q: string) => boolean
  placeholder: string
  empty: React.ReactNode
  onRowClick?: (row: T) => void
}) {
  useDocumentTitle(`Admin · ${title}`)
  const [q, setQ] = useState('')
  const matched = useMemo(() => rows.filter((r) => search(r, q.toLowerCase())), [rows, q, search])
  const { status } = useMockQuery(matched, { delay: 450 })
  const filtered = status === 'empty' ? [] : matched

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} action={action} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-9 w-full rounded-lg border border-ink-200 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
          </div>
          <span className="text-[13px] text-ink-500">{filtered.length} of {rows.length}</span>
        </div>
        <DataTable columns={columns} rows={filtered} loading={status === 'loading'} onRowClick={onRowClick} empty={filtered.length === 0 ? empty : undefined} />
      </Card>
    </div>
  )
}

export function AdminOverview() {
  useDocumentTitle('Admin · Overview')
  const { status } = useMockQuery(adminStats, { delay: 500 })
  const loading = status === 'loading'
  const icons = [<Users key="u" className="size-4" />, <Building2 key="b" className="size-4" />, <IndianRupee key="r" className="size-4" />, <Package key="o" className="size-4" />]

  return (
    <div className="space-y-6">
      <PageHeader title="Platform overview" description="How TapCard is doing today." action={<Button variant="secondary" icon={<Download className="size-4" />}>Export report</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((s, i) => <StatCard key={s.label} loading={loading} label={s.label} value={s.value} delta={s.delta} icon={icons[i]} />)}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Revenue" description="Subscriptions vs physical orders (₹ thousands)" />
          <div className="px-2 pb-4 pt-5"><RevenueBars data={adminRevenue} /></div>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Needs attention" />
            <ul className="divide-y divide-ink-100">
              {[
                { icon: Package, label: '3 orders in design review', to: '/admin/orders', tone: 'amber' as const },
                { icon: LifeBuoy, label: '1 high-priority ticket', to: '/admin/support', tone: 'red' as const },
                { icon: CreditCard, label: '1 failed payment today', to: '/admin/payments', tone: 'red' as const },
                { icon: Ticket, label: 'DIWALI25 coupon still draft', to: '/admin/coupons', tone: 'neutral' as const },
              ].map((r) => (
                <li key={r.label}>
                  <Link to={r.to} className="flex items-center gap-3 px-5 py-3.5 hover:bg-ink-50">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-ink-100 text-ink-600"><r.icon className="size-4" /></span>
                    <span className="flex-1 text-[14px] font-medium text-ink-800">{r.label}</span>
                    <Badge tone={r.tone}>Review</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Recent signups" />
            <ul className="divide-y divide-ink-100">
              {adminUsers.slice(0, 4).map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">{u.name.slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink-900">{u.name}</p>
                    <p className="truncate text-[12px] text-ink-500">{u.email}</p>
                  </div>
                  <Badge tone={u.plan === 'FREE' ? 'neutral' : 'brand'}>{u.plan}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Latest orders" action={<Link to="/admin/orders" className="text-[13px] font-medium text-brand-700 hover:underline">View all →</Link>} />
        <DataTable
          columns={[
            { key: 'id', header: 'Order', cell: (r) => <span className="font-mono text-[13px] font-semibold">{r.id}</span> },
            { key: 'c', header: 'Customer', cell: (r) => r.customer },
            { key: 'i', header: 'Items', cell: (r) => r.items, hideBelow: 'md' },
            { key: 't', header: 'Total', cell: (r) => <span className="font-semibold">{inr(r.total)}</span> },
            { key: 's', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={adminOrders.slice(0, 5)}
          rowKey={(r) => r.id}
        />
      </Card>
    </div>
  )
}

export function AdminUsers() {
  const toast = useToast()
  const [sel, setSel] = useState<(typeof adminUsers)[number] | null>(null)
  const [users, setUsers] = useState(adminUsers)

  const columns: Column<(typeof adminUsers)[number]>[] = [
    { key: 'n', header: 'User', cell: (r) => (
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">{r.name.slice(0, 2).toUpperCase()}</span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900">{r.name}</p>
          <p className="truncate text-[12px] text-ink-500">{r.email}</p>
        </div>
      </div>
    ) },
    { key: 'p', header: 'Plan', cell: (r) => <Badge tone={r.plan === 'FREE' ? 'neutral' : 'brand'}>{r.plan}</Badge>, hideBelow: 'sm' },
    { key: 'r', header: 'Role', cell: (r) => <Badge tone={r.role === 'ADMIN' ? 'purple' : 'neutral'}>{r.role}</Badge>, hideBelow: 'md' },
    { key: 'j', header: 'Joined', cell: (r) => <span className="text-ink-500">{r.joined}</span>, hideBelow: 'lg' },
    { key: 's', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <>
      <ListPage
        title="Users"
        description="Everyone with a TapCard account."
        action={<Button variant="secondary" icon={<Download className="size-4" />} onClick={() => toast('Export runs server-side from Phase 4', 'info')}>Export</Button>}
        columns={columns}
        rows={users}
        onRowClick={setSel}
        search={(r, q) => (r.name + r.email + r.plan).toLowerCase().includes(q)}
        placeholder="Search by name, email or plan"
        empty={<EmptyState icon={<Users className="size-5" />} title="No users match" description="Try a different search." />}
      />
      <Modal
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel?.name}
        description={sel?.email}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSel(null)}>Close</Button>
            {sel && (
              <Button
                variant={sel.status === 'Suspended' ? 'primary' : 'danger'}
                icon={sel.status === 'Suspended' ? <CheckCircle2 className="size-4" /> : <Ban className="size-4" />}
                onClick={() => {
                  const next = sel.status === 'Suspended' ? 'Active' : 'Suspended'
                  setUsers((us) => us.map((u) => (u.id === sel.id ? { ...u, status: next } : u)))
                  toast(`${sel.name} ${next === 'Active' ? 'reactivated' : 'suspended'} · logged to audit trail`)
                  setSel(null)
                }}
              >
                {sel.status === 'Suspended' ? 'Reactivate user' : 'Suspend user'}
              </Button>
            )}
          </>
        }
      >
        {sel && (
          <dl className="divide-y divide-ink-100">
            {[['User ID', sel.id], ['Plan', sel.plan], ['Role', sel.role], ['Status', sel.status], ['Joined', sel.joined]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5">
                <dt className="text-[13px] text-ink-500">{k}</dt>
                <dd className="text-[14px] font-medium text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </>
  )
}

export function AdminBusinesses() {
  const columns: Column<(typeof adminBusinesses)[number]>[] = [
    { key: 'n', header: 'Business', cell: (r) => <span className="font-semibold text-ink-900">{r.name}</span> },
    { key: 'u', header: 'Public URL', cell: (r) => <a href={`/${r.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[12px] text-brand-700 hover:underline">{cardUrl(r.slug).replace('https://', '')}<ExternalLink className="size-3" /></a>, hideBelow: 'sm' },
    { key: 'c', header: 'Category', cell: (r) => r.category, hideBelow: 'md' },
    { key: 'o', header: 'Owner', cell: (r) => <span className="text-ink-500">{r.owner}</span>, hideBelow: 'lg' },
    { key: 'sc', header: 'Scans', cell: (r) => <span className="font-semibold">{r.scans.toLocaleString('en-IN')}</span> },
    { key: 's', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ]
  return (
    <ListPage
      title="Businesses"
      description="Every card on the platform."
      columns={columns}
      rows={adminBusinesses}
      search={(r, q) => (r.name + r.slug + r.category + r.owner).toLowerCase().includes(q)}
      placeholder="Search business, slug or owner"
      empty={<EmptyState icon={<Building2 className="size-5" />} title="No businesses match" />}
    />
  )
}

const orderStatuses = ['Pending', 'Paid', 'Design Review', 'Production', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']

export function AdminOrders() {
  const toast = useToast()
  const [rows, setRows] = useState(adminOrders)
  const [sel, setSel] = useState<(typeof adminOrders)[number] | null>(null)
  const [status, setStatus] = useState('')
  const [tracking, setTracking] = useState('')

  const columns: Column<(typeof adminOrders)[number]>[] = [
    { key: 'id', header: 'Order', cell: (r) => <span className="font-mono text-[13px] font-semibold text-ink-900">{r.id}</span> },
    { key: 'c', header: 'Customer', cell: (r) => r.customer, hideBelow: 'sm' },
    { key: 'i', header: 'Items', cell: (r) => r.items, hideBelow: 'md' },
    { key: 'd', header: 'Date', cell: (r) => <span className="text-ink-500">{r.date}</span>, hideBelow: 'lg' },
    { key: 't', header: 'Total', cell: (r) => <span className="font-semibold">{inr(r.total)}</span> },
    { key: 's', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <>
      <ListPage
        title="Orders"
        description="Production and fulfilment queue."
        columns={columns}
        rows={rows}
        onRowClick={(r) => { setSel(r); setStatus(r.status); setTracking('') }}
        search={(r, q) => (r.id + r.customer + r.items + r.status).toLowerCase().includes(q)}
        placeholder="Search order ID, customer or status"
        empty={<EmptyState icon={<Package className="size-5" />} title="No orders match" />}
      />
      <Modal
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel ? `Order ${sel.id}` : ''}
        description={sel?.customer}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSel(null)}>Cancel</Button>
            <Button onClick={() => {
              setRows((rs) => rs.map((r) => (r.id === sel!.id ? { ...r, status } : r)))
              toast(`${sel!.id} → ${status}${tracking ? ` · tracking ${tracking}` : ''}`)
              setSel(null)
            }}>Save changes</Button>
          </>
        }
      >
        {sel && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-ink-50 p-4">
              <span className="text-[14px] text-ink-600">{sel.items}</span>
              <span className="font-display text-lg font-bold text-ink-900">{inr(sel.total)}</span>
            </div>
            <Select label="Order status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {orderStatuses.map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Input label="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="DTDC 7X4419203" hint="Added to the customer's order page and emailed to them." />
            <Textarea label="Internal note (optional)" className="[&_textarea]:min-h-16" placeholder="Visible to admins only" />
            <p className="rounded-lg bg-ink-50 px-3 py-2 text-[12px] text-ink-500">Status changes are written to the audit log with your admin ID.</p>
          </div>
        )}
      </Modal>
    </>
  )
}

export function AdminProducts() {
  useDocumentTitle('Admin · Products')
  const toast = useToast()
  const [sel, setSel] = useState<(typeof products)[number] | null>(null)
  const [price, setPrice] = useState(0)

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Pricing and availability for physical products." action={<Button icon={<Plus className="size-4" />} onClick={() => toast('Product creation is wired to the API in Phase 4', 'info')}>New product</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{p.tech} · {p.kind}</p>
                <h3 className="mt-1 font-display text-[15px] font-bold text-ink-900">{p.name}</h3>
              </div>
              {p.badge && <Badge tone="brand">{p.badge}</Badge>}
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{p.description}</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="font-display text-xl font-extrabold text-ink-900">{inr(p.price)}</p>
                <p className="text-[12px] text-ink-400">Pack of {p.packSize}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => { setSel(p); setPrice(p.price) }}>Edit price</Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel ? `Edit ${sel.name}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSel(null)}>Cancel</Button>
            <Button onClick={() => { toast(`${sel!.name} price → ${inr(price)} · audit logged`); setSel(null) }}>Save price</Button>
          </>
        }
      >
        {sel && (
          <div className="space-y-4">
            <Input label="Price (₹)" type="number" value={price} onChange={(e) => setPrice(+e.target.value)} hint="Prices are stored centrally, never hardcoded in the app." />
            <Input label="Compare-at price (₹)" type="number" defaultValue={sel.compareAt ?? 0} />
            <div className="flex items-center justify-between rounded-xl border border-ink-200 p-3">
              <span className="text-[14px] font-medium text-ink-900">Available for purchase</span>
              <Switch checked onChange={() => toast('Availability toggled', 'info')} label="Available" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export function AdminTemplates() {
  const toast = useToast()
  return (
    <ListPage
      title="Templates"
      description="Card templates available to businesses."
      action={<Button icon={<Plus className="size-4" />} onClick={() => toast('Template editor arrives in Phase 4', 'info')}>New template</Button>}
      columns={[
        { key: 'n', header: 'Template', cell: (r) => <span className="font-semibold text-ink-900">{r.name}</span> },
        { key: 'c', header: 'Category', cell: (r) => r.category, hideBelow: 'sm' },
        { key: 'u', header: 'In use by', cell: (r) => <span className="font-semibold">{r.uses.toLocaleString('en-IN')}</span> },
        { key: 's', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
      ]}
      rows={adminTemplates}
      search={(r, q) => (r.name + r.category).toLowerCase().includes(q)}
      placeholder="Search templates"
      empty={<EmptyState title="No templates match" />}
    />
  )
}

export function AdminPlans() {
  useDocumentTitle('Admin · Plans')
  const toast = useToast()
  return (
    <div className="space-y-6">
      <PageHeader title="Plans" description="Subscription tiers and their limits." />
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink-900">{p.name}</h3>
              <Badge tone={p.popular ? 'brand' : 'neutral'}>{p.id}</Badge>
            </div>
            <div className="mt-4 space-y-3">
              <Input label="Monthly price (₹)" type="number" defaultValue={p.price} />
              <Input label="Yearly price (₹)" type="number" defaultValue={p.price * 10} />
              <Input label="Card limit" type="number" defaultValue={p.id === 'BUSINESS' ? 10 : 1} />
            </div>
            <ul className="mt-4 space-y-1 text-[12px] text-ink-500">{p.features.slice(0, 3).map((f) => <li key={f}>· {f}</li>)}</ul>
            <Button className="mt-5" full variant="secondary" onClick={() => toast(`${p.name} plan saved · audit logged`)}>Save plan</Button>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <div className="flex items-start gap-3 text-[13px] leading-relaxed text-ink-600">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
          <span>Plan prices are read from the database at runtime by both the marketing site and checkout. Changing a price here never requires a code deploy, and existing subscribers keep their current price until renewal.</span>
        </div>
      </Card>
    </div>
  )
}

export function AdminCoupons() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  return (
    <>
      <ListPage
        title="Coupons"
        description="Discount codes for plans and physical orders."
        action={<Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>New coupon</Button>}
        columns={[
          { key: 'c', header: 'Code', cell: (r) => <span className="font-mono text-[13px] font-bold text-ink-900">{r.code}</span> },
          { key: 't', header: 'Discount', cell: (r) => r.type, hideBelow: 'sm' },
          { key: 'u', header: 'Used', cell: (r) => <span className="text-ink-600">{r.used} / {r.limit}</span> },
          { key: 'e', header: 'Expires', cell: (r) => <span className="text-ink-500">{r.expires}</span>, hideBelow: 'md' },
          { key: 's', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
        ]}
        rows={adminCoupons}
        search={(r, q) => (r.code + r.type + r.status).toLowerCase().includes(q)}
        placeholder="Search code or status"
        empty={<EmptyState icon={<Ticket className="size-5" />} title="No coupons match" />}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="New coupon" description="Codes are validated server-side at checkout." footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { toast('Coupon created'); setOpen(false) }}>Create coupon</Button></>}>
        <div className="space-y-4">
          <Input label="Code" placeholder="DIWALI25" className="[&_input]:font-mono [&_input]:uppercase" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Type"><option>Percentage</option><option>Fixed amount</option></Select>
            <Input label="Value" type="number" placeholder="25" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Starts" type="date" />
            <Input label="Expires" type="date" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Max uses" type="number" placeholder="500" />
            <Input label="Per user" type="number" placeholder="1" />
            <Input label="Min order (₹)" type="number" placeholder="499" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-ink-200 p-3">
            <span className="text-[14px] font-medium text-ink-900">Active immediately</span>
            <Switch checked onChange={() => {}} label="Active" />
          </div>
        </div>
      </Modal>
    </>
  )
}

export function AdminPayments() {
  return (
    <ListPage
      title="Payments"
      description="Every transaction processed through Razorpay."
      columns={[
        { key: 'id', header: 'Payment ID', cell: (r) => <span className="font-mono text-[12px] text-ink-700">{r.id}</span> },
        { key: 'c', header: 'Customer', cell: (r) => <span className="font-medium text-ink-900">{r.customer}</span>, hideBelow: 'sm' },
        { key: 'f', header: 'For', cell: (r) => r.for, hideBelow: 'md' },
        { key: 'm', header: 'Method', cell: (r) => <Badge tone="neutral">{r.method}</Badge>, hideBelow: 'lg' },
        { key: 'a', header: 'Amount', cell: (r) => <span className="font-semibold">{inr(r.amount)}</span> },
        { key: 's', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
      ]}
      rows={adminPayments}
      search={(r, q) => (r.id + r.customer + r.for + r.status).toLowerCase().includes(q)}
      placeholder="Search payment ID, customer or status"
      empty={<EmptyState icon={<CreditCard className="size-5" />} title="No payments match" />}
    />
  )
}

export function AdminSupport() {
  const toast = useToast()
  const [sel, setSel] = useState<(typeof adminTickets)[number] | null>(null)
  const [reply, setReply] = useState('')
  return (
    <>
      <ListPage
        title="Support"
        description="Customer tickets across the platform."
        columns={[
          { key: 'id', header: 'Ticket', cell: (r) => <span className="font-mono text-[13px]">{r.id}</span> },
          { key: 's', header: 'Subject', cell: (r) => <span className="font-semibold text-ink-900">{r.subject}</span> },
          { key: 'f', header: 'From', cell: (r) => r.from, hideBelow: 'md' },
          { key: 'p', header: 'Priority', cell: (r) => <Badge tone={r.priority === 'High' ? 'red' : r.priority === 'Medium' ? 'amber' : 'neutral'}>{r.priority}</Badge>, hideBelow: 'sm' },
          { key: 'st', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          { key: 'u', header: 'Updated', cell: (r) => <span className="text-ink-500">{r.updated}</span>, hideBelow: 'lg' },
        ]}
        rows={adminTickets}
        onRowClick={setSel}
        search={(r, q) => (r.subject + r.from + r.status + r.priority).toLowerCase().includes(q)}
        placeholder="Search subject, customer or status"
        empty={<EmptyState icon={<LifeBuoy className="size-5" />} title="No tickets match" />}
      />
      <Modal
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel?.subject}
        description={sel ? `${sel.id} · from ${sel.from}` : ''}
        footer={<><Button variant="secondary" onClick={() => setSel(null)}>Close</Button><Button onClick={() => { toast('Reply sent'); setSel(null); setReply('') }}>Send reply</Button></>}
      >
        {sel && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge tone={sel.priority === 'High' ? 'red' : 'neutral'}>{sel.priority} priority</Badge>
              <StatusBadge status={sel.status} />
            </div>
            <div className="rounded-xl bg-ink-50 p-4 text-[14px] leading-relaxed text-ink-700">
              {sel.subject}. Could you help me sort this out? — {sel.from}
            </div>
            <Textarea label="Reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your reply…" />
            <Select label="Set status"><option>Open</option><option>In Progress</option><option>Resolved</option></Select>
          </div>
        )}
      </Modal>
    </>
  )
}

export function AdminSettings() {
  useDocumentTitle('Admin · Settings')
  const toast = useToast()
  const [mode, setMode] = useState<'test' | 'live'>('test')
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Platform settings" description="Configuration that applies to the whole platform." />

      <Card>
        <CardHeader title="Commerce" description="Tax and shipping defaults used at checkout" />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Input label="GST rate (%)" type="number" defaultValue={18} />
          <Input label="Flat shipping (₹)" type="number" defaultValue={79} />
          <Input label="Free shipping above (₹)" type="number" defaultValue={999} />
          <Input label="Production SLA (days)" type="number" defaultValue={5} />
        </div>
        <div className="px-5 pb-5"><Button onClick={() => toast('Commerce settings saved · audit logged')}>Save settings</Button></div>
      </Card>

      <Card>
        <CardHeader title="Payments" description="Razorpay is connected in Phase 3" action={<Badge tone={mode === 'live' ? 'green' : 'amber'}>{mode === 'live' ? 'Live mode' : 'Test mode'}</Badge>} />
        <div className="space-y-4 p-5">
          <Segmented value={mode} onChange={setMode} options={[{ value: 'test', label: 'Test mode' }, { value: 'live', label: 'Live mode' }]} />
          <Input label="RAZORPAY_KEY_ID" defaultValue="rzp_test_•••••••••••" disabled hint="Secrets live in server environment variables and are never exposed to the browser." />
          <Input label="Webhook endpoint" defaultValue="https://api.tapcard.in/api/webhooks/razorpay" disabled />
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <span>Orders are only marked paid after a server-side signature check on both the payment verification call and the webhook. Client-side success is never trusted.</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Feature flags" />
        <div className="divide-y divide-ink-100">
          {[
            ['New signups', 'Allow new accounts to be created', true],
            ['NFC ordering', 'Show NFC products in the store', true],
            ['Custom domains', 'Business plan custom domain support', false],
            ['Maintenance mode', 'Show a maintenance page to all visitors', false],
          ].map(([title, desc, on]) => (
            <div key={title as string} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-[14px] font-semibold text-ink-900">{title as string}</p>
                <p className="text-[13px] text-ink-500">{desc as string}</p>
              </div>
              <Switch checked={on as boolean} label={title as string} onChange={() => toast('Flag updated · audit logged')} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Audit log" description="Recent admin actions" action={<Percent className="size-4 text-ink-300" />} />
        <ul className="divide-y divide-ink-100 text-[13px]">
          {[
            ['Vinod Kumar', 'changed Premium QR Card price from ₹649 to ₹599', '12 min ago'],
            ['Vinod Kumar', 'suspended user sameer@example.com', '2 hr ago'],
            ['Vinod Kumar', 'updated order TC-20418 to Shipped', 'Yesterday'],
            ['System', 'processed refund for pay_QX7c44', '3 days ago'],
          ].map(([who, what, when]) => (
            <li key={what} className="flex flex-wrap items-center gap-x-1.5 px-5 py-3">
              <TrendingUp className="mr-1 size-3.5 text-ink-300" />
              <span className="font-semibold text-ink-900">{who}</span>
              <span className="text-ink-600">{what}</span>
              <span className="ml-auto text-ink-400">{when}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-ink-100 px-5 py-3 text-[12px] text-ink-400"><SettingsIcon className="mr-1.5 inline size-3.5" />Audit entries record who, what and when — never secrets or payment credentials.</div>
      </Card>
    </div>
  )
}
