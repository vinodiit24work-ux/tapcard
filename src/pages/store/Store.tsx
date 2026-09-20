import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Minus, Nfc, Plus, QrCode, ShoppingCart, Truck } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Card'
import { Modal, Skeleton } from '@/components/ui/Feedback'
import { PageHeader } from '@/components/ui/Table'
import { Input, Segmented, Textarea } from '@/components/ui/Form'
import { QRImage } from '@/components/card/QRImage'
import { useCart } from '@/store/cart'
import { useCard } from '@/store/card'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { inr, reviewUrl } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { CartLine } from '@/types'
import type { ApiProduct } from '@/services/ownerApi'

const filters = ['All', 'QR', 'NFC', 'Stands', 'Packs'] as const

function ProductArt({ p, className }: { p: ApiProduct; className?: string }) {
  const nfc = p.tech === 'NFC'
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden', className)} style={{ background: nfc ? 'linear-gradient(135deg,#1e1b4b,#3b2fd6)' : 'linear-gradient(135deg,#eef1f6,#dfe4ec)' }}>
      {p.kind === 'STAND' ? (
        <div className="flex flex-col items-center">
          <div className={cn('flex size-24 items-center justify-center rounded-xl shadow-float', nfc ? 'bg-white/95' : 'bg-white')}>
            {nfc ? <Nfc className="size-10 text-brand-700" /> : <QRImage text={reviewUrl('royal-spice')} size={72} />}
          </div>
          <div className={cn('mt-1 h-3 w-16 rounded-b-lg', nfc ? 'bg-white/40' : 'bg-white/80')} />
        </div>
      ) : (
        <div className="relative">
          {p.packSize > 1 && (
            <>
              <div className={cn('absolute -left-3 -top-2 h-[88px] w-[152px] rotate-[-8deg] rounded-xl', nfc ? 'bg-white/25' : 'bg-white/60')} />
              <div className={cn('absolute -left-1.5 -top-1 h-[88px] w-[152px] rotate-[-4deg] rounded-xl', nfc ? 'bg-white/45' : 'bg-white/80')} />
            </>
          )}
          <div className={cn('relative flex h-[88px] w-[152px] items-center gap-2.5 rounded-xl p-3 shadow-float', nfc ? 'bg-ink-900 text-white ring-1 ring-white/20' : 'bg-white')}>
            <div className="min-w-0 flex-1">
              <p className={cn('truncate font-display text-[11px] font-extrabold leading-tight', nfc ? 'text-white' : 'text-ink-900')}>Royal Spice</p>
              <p className={cn('truncate text-[8px]', nfc ? 'text-white/60' : 'text-ink-500')}>Restaurant &amp; Cafe</p>
              <div className={cn('mt-2 flex items-center gap-1 text-[7px] font-semibold', nfc ? 'text-brand-300' : 'text-brand-600')}>
                {nfc ? <><Nfc className="size-2.5" /> TAP HERE</> : <><QrCode className="size-2.5" /> SCAN ME</>}
              </div>
            </div>
            <div className={cn('rounded-md p-1', nfc ? 'bg-white' : 'bg-white ring-1 ring-ink-200')}>
              <QRImage text={reviewUrl('royal-spice')} size={38} options={{ margin: 0 }} />
            </div>
          </div>
          {p.packSize > 1 && <span className="absolute -bottom-2 -right-2 rounded-full bg-ink-900 px-2 py-0.5 text-[10px] font-bold text-white">×{p.packSize}</span>}
        </div>
      )}
    </div>
  )
}

export function Store() {
  useDocumentTitle('Physical cards')
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const [open, setOpen] = useState<ApiProduct | null>(null)
  const { add, totals, products, ready } = useCart()
  const { card } = useCard()
  const toast = useToast()

  const shown = products.filter((p) =>
    filter === 'All' ? true : filter === 'Stands' ? p.kind === 'STAND' : filter === 'Packs' ? p.kind === 'PACK' : p.tech === filter && p.kind !== 'STAND',
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Physical Cards & Stands"
        description="Printed QR cards, tap-ready NFC cards and table stands — all pointing to your digital card."
        action={
          <ButtonLink to="/cart" variant={totals.count ? 'primary' : 'secondary'} icon={<ShoppingCart className="size-4" />}>
            Cart{totals.count ? ` · ${totals.count}` : ''}
          </ButtonLink>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors', filter === f ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50')}>{f}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[13px] text-ink-500"><Truck className="size-4" /> Free shipping over ₹999</div>
      </div>

      {!ready ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-80" />)}</div>
      ) : (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((p) => (
          <Card key={p.id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-card">
            <button onClick={() => setOpen(p)} className="block" aria-label={`Customize ${p.name}`}>
              <ProductArt p={p} className="h-48 w-full" />
            </button>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-[15px] font-bold text-ink-900">{p.name}</h3>
                {p.badge && <Badge tone={p.badge === 'Best seller' ? 'brand' : 'green'}>{p.badge}</Badge>}
              </div>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-500">{p.description}</p>
              <ul className="mt-3 space-y-1">
                {(p.features as string[]).map((f) => <li key={f} className="flex items-start gap-1.5 text-[12px] text-ink-600"><Check className="mt-0.5 size-3 shrink-0 text-emerald-600" />{f}</li>)}
              </ul>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="font-display text-xl font-extrabold text-ink-900">{inr(p.pricePaise / 100)}</p>
                  {p.compareAtPaise && <p className="text-[12px] text-ink-400 line-through">{inr(p.compareAtPaise / 100)}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => { add({ productId: p.sku, qty: 1, businessName: card.businessName, finish: 'matte', color: 'white', notes: '' }); toast(`${p.name} added to cart`) }}>Add</Button>
                  <Button size="sm" onClick={() => setOpen(p)}>Customize</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}

      <Card className="flex flex-wrap items-center gap-5 p-6">
        <QRImage text={reviewUrl(card.slug)} size={84} />
        <div className="min-w-[220px] flex-1">
          <h3 className="font-display text-[15px] font-bold text-ink-900">Every product carries this QR</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-500">Your printed cards point to <span className="font-mono text-ink-700">{reviewUrl(card.slug)}</span>. Change your details anytime — the cards never go out of date.</p>
        </div>
        <ButtonLink to="/dashboard/card-builder" variant="secondary" size="sm">Check my card first</ButtonLink>
      </Card>

      <CustomizeModal product={open} onClose={() => setOpen(null)} />
    </div>
  )
}

function CustomizeModal({ product, onClose }: { product: ApiProduct | null; onClose: () => void }) {
  const { add } = useCart()
  const { card } = useCard()
  const toast = useToast()
  const [qty, setQty] = useState(1)
  const [businessName, setBusinessName] = useState(card.businessName)
  const [finish, setFinish] = useState<CartLine['finish']>('matte')
  const [color, setColor] = useState<CartLine['color']>('white')
  const [notes, setNotes] = useState('')

  if (!product) return null
  const addToCart = (buyNow: boolean) => {
    add({ productId: product.sku, qty, businessName, finish, color, notes })
    toast(`${product.name} × ${qty} added`)
    onClose()
    setQty(1)
    if (buyNow) window.location.assign('/checkout')
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={product.name}
      description={`${product.material} · ${product.tech}`}
      footer={
        <>
          <Button variant="secondary" onClick={() => addToCart(false)} icon={<ShoppingCart className="size-4" />}>Add to cart</Button>
          <Button onClick={() => addToCart(true)}>Buy now · {inr((product.pricePaise / 100) * qty)}</Button>
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <ProductArt p={product} className="h-56 rounded-2xl" />
        <div className="space-y-4">
          <Input label="Name printed on the card" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-700">Finish</p>
            <Segmented value={finish} onChange={setFinish} options={[{ value: 'matte', label: 'Matte' }, { value: 'gloss', label: 'Gloss' }]} />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-700">Card colour</p>
            <Segmented value={color} onChange={setColor} options={[{ value: 'white', label: 'White' }, { value: 'black', label: 'Black' }, { value: 'brand', label: 'Brand' }]} />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-700">Quantity</p>
            <div className="inline-flex items-center rounded-lg border border-ink-200">
              <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 text-ink-600 hover:bg-ink-50"><Minus className="size-4" /></button>
              <input value={qty} onChange={(e) => setQty(Math.max(1, Math.min(500, +e.target.value || 1)))} aria-label="Quantity" className="w-14 border-x border-ink-200 py-2 text-center text-[14px] font-semibold focus:outline-none" />
              <button aria-label="Increase" onClick={() => setQty((q) => Math.min(500, q + 1))} className="p-2.5 text-ink-600 hover:bg-ink-50"><Plus className="size-4" /></button>
            </div>
          </div>
          <Textarea label="Notes for our print team (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="[&_textarea]:min-h-16" placeholder="e.g. match the gold from our signboard" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between rounded-xl bg-ink-50 p-4">
        <span className="text-[14px] text-ink-600">{qty} × {inr(product.pricePaise / 100)}</span>
        <span className="font-display text-xl font-extrabold text-ink-900">{inr((product.pricePaise / 100) * qty)}</span>
      </div>
      <p className="mt-3 text-center text-[12px] text-ink-500">Prices exclude 18% GST · <Link to="/refund-policy" className="underline">Refund policy</Link></p>
    </Modal>
  )
}
