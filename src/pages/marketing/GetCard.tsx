import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, MessageCircle, PartyPopper, Phone, ShieldCheck, Sparkles } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select, Switch, Textarea } from '@/components/ui/Form'
import { Section, SectionHead } from '@/features/marketing/Bits'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { ReviewExperience } from '@/features/review/ReviewExperience'
import { toReviewCard } from '@/data/reviewDemo'
import { royalSpice } from '@/data/templates'
import { publicApi } from '@/services/ownerApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CATEGORIES = ['Restaurant', 'Cafe', 'Salon & Spa', 'Gym & Fitness', 'Doctor / Clinic', 'Real Estate', 'Retail Shop', 'Hotel', 'Freelancer', 'Consultant', 'Other']

/**
 * "Get My TapCard" — the enquiry that starts a build. Kept short on purpose:
 * the team calls the customer and fills in the rest, so asking for everything
 * up front only costs submissions.
 */
export function GetCard() {
  useDocumentTitle('Get my TapCard')
  const [form, setForm] = useState({
    businessName: '', contactName: '', phone: '', whatsapp: '', email: '',
    category: 'Restaurant', city: '', address: '', notes: '',
    wantsDigital: true, wantsPhysical: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ reference: string } | null>(null)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.businessName.trim().length < 2) errs.businessName = 'Enter your business name.'
    if (form.contactName.trim().length < 2) errs.contactName = 'Enter your name.'
    if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a 10-digit mobile number.'
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email address.'
    if (!form.wantsDigital && !form.wantsPhysical) errs.wants = 'Choose at least one — digital, physical or both.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    publicApi
      .submitRequest({ ...form, whatsapp: form.whatsapp || form.phone })
      .then((r) => setDone({ reference: r.request.reference }))
      .catch((err: Error) => setErrors({ form: err.message }))
      .finally(() => setBusy(false))
  }

  if (done) {
    return (
      <Section>
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><PartyPopper className="size-8" /></div>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-ink-900">We have your details</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-ink-600">
            Your reference is <span className="font-mono font-semibold text-ink-900">{done.reference}</span>. Our team will call you on{' '}
            <span className="font-semibold text-ink-900">{form.phone}</span> within one working day to confirm the details and build your
            review card.
          </p>
          <div className="mt-8 rounded-2xl border border-ink-200 bg-ink-50 p-5 text-left">
            <p className="text-[13px] font-semibold text-ink-800">What happens next</p>
            <ol className="mt-3 space-y-2 text-[14px] text-ink-600">
              <li>1. We call you and confirm your business details.</li>
              <li>2. We build your review card and connect your Google listing.</li>
              <li>3. You get a link to check it and approve it.</li>
              <li>4. Your QR and NFC cards are produced and shipped.</li>
            </ol>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <ButtonLink to="/demo" variant="secondary" size="lg">See the demo again</ButtonLink>
            <ButtonLink to="/" size="lg">Back to home</ButtonLink>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section>
      <SectionHead
        eyebrow={<><Sparkles className="size-3.5" /> Done for you</>}
        title="Get my TapCard"
        description="Tell us about your business and our team will build your review card, connect your Google listing and send it to you to approve."
      />

      <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <Card className="p-6 sm:p-8">
          <form onSubmit={submit} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Business name" value={form.businessName} error={errors.businessName} onChange={set('businessName')} placeholder="Royal Spice" />
              <Select label="Category" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Your name" value={form.contactName} error={errors.contactName} onChange={set('contactName')} placeholder="Rahul Verma" />
              <Input label="Phone" value={form.phone} error={errors.phone} onChange={set('phone')} placeholder="98765 43210" leading={<span className="text-[13px]">+91</span>} className="[&_input]:pl-11" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="WhatsApp (if different)" value={form.whatsapp} onChange={set('whatsapp')} placeholder="Same as phone" />
              <Input label="Email (optional)" type="email" value={form.email} error={errors.email} onChange={set('email')} placeholder="you@business.in" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="City" value={form.city} onChange={set('city')} placeholder="Bengaluru" />
              <Input label="Area / address" value={form.address} onChange={set('address')} placeholder="Indiranagar" hint="Helps us find your Google listing." />
            </div>

            <div>
              <p className="mb-2 text-[13px] font-medium text-ink-700">What do you need?</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {([['wantsDigital', 'Digital review card', 'A link and QR you can share anywhere'], ['wantsPhysical', 'Physical QR/NFC card', 'Printed cards and table stands']] as const).map(([k, title, desc]) => (
                  <div key={k} className="flex items-start justify-between gap-3 rounded-xl border border-ink-200 p-3.5">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink-900">{title}</p>
                      <p className="text-[12px] text-ink-500">{desc}</p>
                    </div>
                    <Switch checked={form[k]} label={title} onChange={(v) => setForm({ ...form, [k]: v })} />
                  </div>
                ))}
              </div>
              {errors.wants && <p className="mt-1.5 text-xs text-red-600">{errors.wants}</p>}
            </div>

            <Textarea label="Anything else? (optional)" value={form.notes} onChange={set('notes')} className="[&_textarea]:min-h-20" placeholder="We have two branches, and we would like our logo in gold." />

            {errors.form && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[14px] text-red-700">{errors.form}</p>}

            <Button type="submit" full size="lg" loading={busy} iconRight={<ArrowRight className="size-4" />}>Request my TapCard</Button>
            <p className="text-center text-[12px] text-ink-500">No payment now. We confirm everything with you on a call first.</p>
          </form>
        </Card>

        <aside className="hidden space-y-4 lg:block">
          <PhoneFrame height={440} width={250}><ReviewExperience card={toReviewCard(royalSpice)} /></PhoneFrame>
          <ul className="space-y-2.5 px-1">
            {[
              'We build it for you — nothing to design',
              'Your Google listing connected and checked',
              'You approve it before anything is printed',
              'One permanent link, so cards never expire',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-[13px] text-ink-600">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {t}
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-800"><ShieldCheck className="size-4 text-brand-600" /> Prefer to talk first?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="tel:+918045678900" className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-100"><Phone className="size-3.5" /> Call us</a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-100"><MessageCircle className="size-3.5" /> WhatsApp</a>
            </div>
          </div>
        </aside>
      </div>

      <p className="mt-10 text-center text-[13px] text-ink-500">
        Rather build it yourself? <Link to="/register" className="font-semibold text-brand-700 hover:underline">Create a free account</Link>.
      </p>
    </Section>
  )
}
