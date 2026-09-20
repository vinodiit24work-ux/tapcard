import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, CreditCard, Lock, Minus, Plus, ShieldCheck, ShoppingCart, Tag, Trash2, Truck, X } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/Feedback'
import { Input, Segmented, Select, Textarea } from '@/components/ui/Form'
import { Logo } from '@/components/ui/Logo'

import { useCart } from '@/store/cart'
import { useCard } from '@/store/card'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { inr } from '@/lib/format'
import { cn } from '@/lib/cn'

function Summary({ children }: { children?: React.ReactNode }) {
  const { totals, coupon, couponError, applyCoupon, removeCoupon, commerce } = useCart()
  const [code, setCode] = useState('')
  return (
    <Card className="p-5">
      <h2 className="font-display text-base font-bold text-ink-900">Order summary</h2>
      <dl className="mt-4 space-y-2.5 text-[14px]">
        <div className="flex justify-between"><dt className="text-ink-500">Subtotal</dt><dd className="font-medium text-ink-900">{inr(totals.subtotal)}</dd></div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-emerald-600"><dt>Discount ({coupon})</dt><dd className="font-medium">−{inr(totals.discount)}</dd></div>
        )}
        <div className="flex justify-between">
          <dt className="text-ink-500">Shipping</dt>
          <dd className="font-medium text-ink-900">{totals.shipping === 0 ? <span className="text-emerald-600">Free</span> : inr(totals.shipping)}</dd>
        </div>
        <div className="flex justify-between"><dt className="text-ink-500">GST ({commerce.gstRatePercent}%)</dt><dd className="font-medium text-ink-900">{inr(totals.tax)}</dd></div>
        <div className="flex justify-between border-t border-ink-200 pt-3 text-[16px]"><dt className="font-semibold text-ink-900">Total</dt><dd className="font-display font-extrabold text-ink-900">{inr(totals.total)}</dd></div>
      </dl>

      {totals.subtotal > 0 && totals.subtotal < commerce.freeShippingOverPaise / 100 && (
        <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-[12px] text-brand-800">Add {inr(commerce.freeShippingOverPaise / 100 - totals.subtotal)} more for free shipping.</p>
      )}

      <div className="mt-4">
        {coupon ? (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-800"><Tag className="size-3.5" /> {coupon} applied</span>
            <button onClick={removeCoupon} aria-label="Remove coupon" className="rounded p-1 text-emerald-700 hover:bg-emerald-100"><X className="size-3.5" /></button>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); void applyCoupon(code).then((ok) => ok && setCode('')) }}
            className="flex gap-2"
          >
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" aria-label="Coupon code" className="h-9 min-w-0 flex-1 rounded-lg border border-ink-200 px-3 text-[13px] uppercase focus:border-brand-500 focus:outline-none" />
            <Button size="sm" variant="secondary" type="submit">Apply</Button>
          </form>
        )}
        {couponError && <p className="mt-1.5 text-[12px] text-red-600">{couponError}</p>}
        {!coupon && !couponError && <p className="mt-1.5 text-[12px] text-ink-400">Try TAP10 or WELCOME100</p>}
      </div>

      {children}

      <ul className="mt-5 space-y-2 border-t border-ink-100 pt-4 text-[12px] text-ink-500">
        <li className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-emerald-600" /> Secure payments via Razorpay</li>
        <li className="flex items-center gap-2"><Truck className="size-3.5 text-brand-600" /> Ships in 4–6 working days across India</li>
        <li className="flex items-center gap-2"><Check className="size-3.5 text-brand-600" /> GST invoice with every order</li>
      </ul>
    </Card>
  )
}

export function CartPage() {
  useDocumentTitle('Cart')
  const { lines, setQty, remove, totals, clear, productFor } = useCart()
  const toast = useToast()

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">Your cart</h1>
          <p className="mt-1 text-[15px] text-ink-500">{totals.count} item{totals.count === 1 ? '' : 's'}</p>
        </div>
        <Link to="/dashboard/store" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" /> Continue shopping</Link>
      </div>

      {lines.length === 0 ? (
        <EmptyState icon={<ShoppingCart className="size-5" />} title="Your cart is empty" description="Add printed QR cards, NFC cards or a table stand for your counter." action={<ButtonLink to="/dashboard/store">Browse products</ButtonLink>} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-3">
            {lines.map((l) => {
              const p = productFor(l.productId)
              if (!p) return null
              return (
                <Card key={l.id} className="flex flex-wrap gap-4 p-4 sm:flex-nowrap">
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-xl" style={{ background: p.tech === 'NFC' ? 'linear-gradient(135deg,#1e1b4b,#3b2fd6)' : 'linear-gradient(135deg,#eef1f6,#dfe4ec)' }}>
                    <div className={cn('h-10 w-16 rounded-md shadow', p.tech === 'NFC' ? 'bg-ink-900 ring-1 ring-white/20' : 'bg-white')} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-[15px] font-bold text-ink-900">{p.name}</h3>
                        <p className="mt-0.5 text-[13px] text-ink-500">{l.businessName} · {l.finish} · {l.color}</p>
                        {l.notes && <p className="mt-1 line-clamp-1 text-[12px] italic text-ink-400">“{l.notes}”</p>}
                      </div>
                      <button aria-label={`Remove ${p.name}`} onClick={() => { remove(l.id); toast('Removed from cart', 'info') }} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-lg border border-ink-200">
                        <button aria-label="Decrease quantity" onClick={() => setQty(l.id, l.qty - 1)} className="p-2 text-ink-600 hover:bg-ink-50"><Minus className="size-3.5" /></button>
                        <span className="w-10 border-x border-ink-200 py-1.5 text-center text-[14px] font-semibold">{l.qty}</span>
                        <button aria-label="Increase quantity" onClick={() => setQty(l.id, l.qty + 1)} className="p-2 text-ink-600 hover:bg-ink-50"><Plus className="size-3.5" /></button>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-[17px] font-extrabold text-ink-900">{inr((p.pricePaise / 100) * l.qty)}</p>
                        <p className="text-[12px] text-ink-400">{inr(p.pricePaise / 100)} each</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
            <button onClick={() => { clear(); toast('Cart cleared', 'info') }} className="text-[13px] font-medium text-ink-500 hover:text-red-600">Clear cart</button>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Summary>
              <ButtonLink to="/checkout" full size="lg" className="mt-5" icon={<Lock className="size-4" />}>Checkout</ButtonLink>
            </Summary>
          </div>
        </div>
      )}
    </div>
  )
}

const steps = ['Contact', 'Shipping', 'Payment'] as const

export function CheckoutPage() {
  useDocumentTitle('Checkout')
  const { lines, totals, clear, productFor, commerce } = useCart()
  const { card } = useCard()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [f, setF] = useState({
    name: '', email: '', phone: '',
    business: card.businessName, gstin: '',
    address: '', city: '', state: 'Karnataka', pincode: '',
    notes: '',
  })

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })

  if (lines.length === 0 && !done)
    return (
      <div className="container-page py-20">
        <EmptyState icon={<ShoppingCart className="size-5" />} title="Nothing to check out" description="Your cart is empty." action={<ButtonLink to="/dashboard/store">Browse products</ButtonLink>} />
      </div>
    )

  const validate = () => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (f.name.trim().length < 2) e.name = 'Enter your full name.'
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'Enter a valid email for your invoice.'
      if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a 10-digit mobile number.'
    }
    if (step === 1) {
      if (f.address.trim().length < 8) e.address = 'Enter your full street address.'
      if (!f.city.trim()) e.city = 'City is required.'
      if (!/^\d{6}$/.test(f.pincode)) e.pincode = 'Enter a 6-digit PIN code.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validate()) return
    if (step < 2) return setStep(step + 1)
    setBusy(true)
    setTimeout(() => {
      const id = `TC-${Math.floor(20500 + Math.random() * 400)}`
      setBusy(false)
      setDone(id)
      clear()
      toast('Order placed')
    }, 1200)
  }

  if (done)
    return (
      <div className="container-page flex min-h-[70dvh] items-center justify-center py-16">
        <Card className="w-full max-w-lg p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Check className="size-7" /></div>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-ink-900">Order confirmed</h1>
          <p className="mt-2 text-[15px] text-ink-500">Order <span className="font-mono font-semibold text-ink-800">{done}</span> is in. We have emailed your GST invoice to {f.email || 'your inbox'}.</p>
          <div className="mt-6 rounded-xl bg-ink-50 p-4 text-left text-[13px] leading-relaxed text-ink-600">
            <p className="font-semibold text-ink-800">What happens next</p>
            <p className="mt-1.5">Our team proofs your design, prints your cards and ships them in 4–6 working days. You can follow the status on your Orders page.</p>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <ButtonLink to="/dashboard/orders" variant="secondary" size="lg">Track my order</ButtonLink>
            <ButtonLink to="/dashboard" size="lg">Back to dashboard</ButtonLink>
          </div>
        </Card>
      </div>
    )

  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500"><Lock className="size-3.5" /> Secure checkout</span>
        </div>
      </header>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <nav className="mb-6 flex items-center gap-2" aria-label="Checkout steps">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold', i < step ? 'bg-emerald-600 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-ink-200 text-ink-500')}>
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className={cn('text-[13px] font-semibold', i <= step ? 'text-ink-900' : 'text-ink-400')}>{s}</span>
                {i < steps.length - 1 && <span className={cn('h-px flex-1', i < step ? 'bg-emerald-500' : 'bg-ink-200')} />}
              </div>
            ))}
          </nav>

          <Card className="p-5 sm:p-6">
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-base font-bold text-ink-900">Contact & business</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Full name" value={f.name} error={errors.name} onChange={set('name')} placeholder="Rahul Verma" autoComplete="name" />
                  <Input label="Mobile" value={f.phone} error={errors.phone} onChange={set('phone')} placeholder="98765 43210" autoComplete="tel" leading={<span className="text-[13px]">+91</span>} className="[&_input]:pl-11" />
                </div>
                <Input label="Email" type="email" value={f.email} error={errors.email} onChange={set('email')} placeholder="you@business.in" hint="Your invoice and order updates go here." autoComplete="email" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Business name" value={f.business} onChange={set('business')} />
                  <Input label="GSTIN (optional)" value={f.gstin} onChange={set('gstin')} placeholder="29ABCDE1234F1Z5" hint="For input tax credit" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-base font-bold text-ink-900">Shipping address</h2>
                <Textarea label="Address" value={f.address} error={errors.address} onChange={set('address')} placeholder="Flat / shop number, street, area" className="[&_textarea]:min-h-20" />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="City" value={f.city} error={errors.city} onChange={set('city')} placeholder="Bengaluru" />
                  <Select label="State" value={f.state} onChange={set('state')}>
                    {['Andhra Pradesh', 'Delhi', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'].map((s) => <option key={s}>{s}</option>)}
                  </Select>
                  <Input label="PIN code" value={f.pincode} error={errors.pincode} onChange={set('pincode')} placeholder="560038" inputMode="numeric" maxLength={6} />
                </div>
                <Textarea label="Delivery notes (optional)" value={f.notes} onChange={set('notes')} className="[&_textarea]:min-h-16" placeholder="Landmark, preferred delivery time" />
                <div className="rounded-xl bg-ink-50 p-4 text-[13px] text-ink-600">Shipping across India · Free over {inr(commerce.freeShippingOverPaise / 100)} · Delivery in 4–6 working days after proofing.</div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-base font-bold text-ink-900">Payment</h2>
                <Segmented value={method} onChange={setMethod} options={[{ value: 'upi', label: 'UPI' }, { value: 'card', label: 'Card' }, { value: 'netbanking', label: 'Netbanking' }]} />
                <div className="rounded-xl border border-ink-200 p-5">
                  {method === 'upi' && (
                    <div className="space-y-3">
                      <Input label="UPI ID" placeholder="yourname@okhdfc" />
                      <p className="text-[13px] text-ink-500">You will approve the payment request in your UPI app.</p>
                    </div>
                  )}
                  {method === 'card' && (
                    <div className="space-y-3">
                      <Input label="Card number" placeholder="0000 0000 0000 0000" inputMode="numeric" leading={<CreditCard className="size-4" />} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Expiry" placeholder="MM/YY" />
                        <Input label="CVV" placeholder="123" type="password" maxLength={4} />
                      </div>
                    </div>
                  )}
                  {method === 'netbanking' && (
                    <Select label="Choose your bank">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank'].map((b) => <option key={b}>{b}</option>)}
                    </Select>
                  )}
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                  <span>This is a mock payment screen for Phase 1. Razorpay is integrated in Phase 3, where every payment is verified server-side before an order is marked paid.</span>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)} icon={<ArrowLeft className="size-4" />}>Back</Button>
              <Button size="lg" loading={busy} onClick={next} icon={step === 2 ? <Lock className="size-4" /> : undefined}>
                {step === 2 ? `Pay ${inr(totals.total)}` : 'Continue'}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <Summary />
          <div className="mt-4 space-y-2">
            {lines.map((l) => {
              const p = productFor(l.productId)
              return p ? (
                <div key={l.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[13px]">
                  <span className="min-w-0 flex-1 truncate text-ink-700">{p.name} × {l.qty}</span>
                  <span className="font-semibold text-ink-900">{inr((p.pricePaise / 100) * l.qty)}</span>
                </div>
              ) : null
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
