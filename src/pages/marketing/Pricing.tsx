import { useState } from 'react'
import { Check, Minus } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Accordion, Section, SectionHead } from '@/features/marketing/Bits'
import { Skeleton } from '@/components/ui/Feedback'
import { Segmented } from '@/components/ui/Form'
import { useCatalogue } from '@/hooks/useCatalogue'
import { inr } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const rows: { label: string; free: string | boolean; pro: string | boolean; business: string | boolean }[] = [
  { label: 'Digital cards', free: '1', pro: '1', business: '10' },
  { label: 'TapCard URL', free: true, pro: true, business: true },
  { label: 'Custom domain', free: false, pro: false, business: true },
  { label: 'QR download', free: 'PNG', pro: 'PNG + SVG', business: 'PNG + SVG' },
  { label: 'Custom QR colours & logo', free: false, pro: true, business: true },
  { label: 'Remove TapCard branding', free: false, pro: true, business: true },
  { label: 'Analytics history', free: '7 days', pro: '90 days', business: 'Unlimited' },
  { label: 'Menu, services & booking', free: 'Basic', pro: true, business: true },
  { label: 'Lead capture & export', free: false, pro: true, business: true },
  { label: 'Team members', free: false, pro: false, business: 'Up to 10' },
  { label: 'Discount on physical cards', free: false, pro: '5%', business: '10%' },
  { label: 'Support', free: 'Email', pro: 'Priority email', business: 'Priority + phone' },
]

const Cell = ({ v }: { v: string | boolean }) =>
  typeof v === 'boolean' ? (
    v ? <Check className="mx-auto size-4.5 text-emerald-600" /> : <Minus className="mx-auto size-4 text-ink-300" />
  ) : (
    <span className="text-[14px] font-medium text-ink-700">{v}</span>
  )

const faqs = [
  { q: 'Can I switch plans later?', a: 'Yes. Upgrade or downgrade at any time from Billing. Upgrades take effect immediately with a prorated charge; downgrades apply from your next renewal date.' },
  { q: 'Do prices include GST?', a: 'Plan prices are exclusive of 18% GST, which is added at checkout. Every payment generates a GST invoice you can download, and you can add your GSTIN for input credit.' },
  { q: 'What payment methods can I use?', a: 'UPI, credit and debit cards, netbanking and popular wallets, all processed securely through Razorpay.' },
  { q: 'Is there a contract or lock-in?', a: 'No. Monthly plans can be cancelled anytime and your card stays live until the end of the paid period. Downgrading to Free keeps your card online with Free plan limits.' },
  { q: 'What happens to my card if I stop paying?', a: 'Your card stays online on the Free plan — it never disappears. Pro features like branding removal and extended analytics simply switch off.' },
]

export function Pricing() {
  useDocumentTitle('Pricing')
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const { products, plans: apiPlans, state } = useCatalogue()
  const plans = (apiPlans ?? []).map((p) => ({
    id: p.tier,
    name: p.name,
    price: p.monthlyPaise / 100,
    yearly: p.yearlyPaise / 100,
    tagline: p.tagline,
    popular: p.popular,
    features: p.features,
    cta: p.tier === 'FREE' ? 'Start free' : p.tier === 'PRO' ? 'Go Pro' : 'Choose Business',
  }))

  return (
    <>
      <Section className="pb-10">
        <SectionHead eyebrow="Pricing" title="Simple pricing that scales with your business" description="Start on Free for as long as you like. Upgrade the day it starts paying for itself." />
        <div className="mx-auto mt-8 max-w-[280px]">
          <Segmented value={cycle} onChange={setCycle} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly · 2 months free' }]} />
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {state === 'loading' && [0, 1, 2].map((i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
          {plans.map((p) => (
            <div key={p.id} className={cn('relative flex flex-col rounded-2xl border bg-white p-7', p.popular ? 'border-brand-500 shadow-card ring-1 ring-brand-500' : 'border-ink-200')}>
              {p.popular && <span className="absolute -top-3 left-7 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold text-white">Most popular</span>}
              <h3 className="font-display text-lg font-bold text-ink-900">{p.name}</h3>
              <p className="mt-1 text-[13px] text-ink-500">{p.tagline}</p>
              <p className="mt-5 font-display text-4xl font-extrabold text-ink-900">
                {p.price === 0 ? '₹0' : inr(cycle === 'yearly' ? p.yearly : p.price)}
                <span className="text-sm font-medium text-ink-500">{p.price === 0 ? '' : cycle === 'yearly' ? '/year' : '/month'}</span>
              </p>
              {p.price > 0 && cycle === 'yearly' && <p className="mt-1 text-xs font-semibold text-emerald-600">You save {inr(p.price * 12 - p.yearly)} a year</p>}
              <ul className="mt-6 flex-1 space-y-2.5 text-[14px] text-ink-600">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {f}</li>
                ))}
              </ul>
              <ButtonLink to="/get-card" className="mt-7" full variant={p.popular ? 'primary' : 'secondary'}>{p.cta}</ButtonLink>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] text-ink-500">All plans exclude 18% GST · Cancel anytime · GST invoice on every payment</p>
      </Section>

      <Section className="border-y border-ink-200 bg-ink-50/60">
        <SectionHead title="Compare every plan" />
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] overflow-hidden rounded-2xl border border-ink-200 bg-white text-center">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50">
                <th className="px-5 py-4 text-left text-[13px] font-semibold text-ink-500">Feature</th>
                {plans.map((p) => <th key={p.id} className="px-5 py-4 font-display text-[15px] font-bold text-ink-900">{p.name}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((r) => (
                <tr key={r.label} className="hover:bg-ink-50/60">
                  <td className="px-5 py-3.5 text-left text-[14px] font-medium text-ink-800">{r.label}</td>
                  <td className="px-5 py-3.5"><Cell v={r.free} /></td>
                  <td className="px-5 py-3.5"><Cell v={r.pro} /></td>
                  <td className="px-5 py-3.5"><Cell v={r.business} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <SectionHead title="Physical cards & stands" description="One-time purchases, shipped across India. No subscription needed." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(products ?? []).slice(0, 4).map((p) => (
            <div key={p.id} className="rounded-2xl border border-ink-200 bg-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{p.tech}</p>
              <h3 className="mt-1.5 font-display text-[15px] font-bold text-ink-900">{p.name}</h3>
              <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{inr(p.pricePaise / 100)}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{p.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center"><ButtonLink to="/dashboard/store" variant="secondary">See all products</ButtonLink></div>
      </Section>

      <Section className="border-t border-ink-200 bg-ink-50/60">
        <SectionHead title="Billing questions" />
        <div className="mx-auto mt-10 max-w-3xl"><Accordion items={faqs} /></div>
      </Section>
    </>
  )
}
