import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Briefcase, Building2, Check, Coffee, Dumbbell, Image as ImageIcon, PartyPopper, Scissors, Stethoscope, Store, Upload, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Form'
import { Logo } from '@/components/ui/Logo'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { DigitalCardPreview } from '@/components/card/DigitalCardPreview'
import { QRImage } from '@/components/card/QRImage'
import { templates } from '@/data/templates'
import { themePresets } from '@/lib/theme'
import { covers } from '@/lib/theme'
import { reviewUrl, slugify } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useAuth } from '@/store/auth'
import { useCard } from '@/store/card'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const types: { id: string; label: string; icon: LucideIcon; template: string }[] = [
  { id: 'Restaurant', label: 'Restaurant', icon: UtensilsCrossed, template: 'restaurant' },
  { id: 'Cafe', label: 'Café', icon: Coffee, template: 'cafe' },
  { id: 'Salon', label: 'Salon & Spa', icon: Scissors, template: 'salon' },
  { id: 'Gym', label: 'Gym & Fitness', icon: Dumbbell, template: 'gym' },
  { id: 'Doctor', label: 'Doctor / Clinic', icon: Stethoscope, template: 'doctor' },
  { id: 'Real Estate', label: 'Real Estate', icon: Building2, template: 'real-estate' },
  { id: 'Retail', label: 'Retail Shop', icon: Store, template: 'retail' },
  { id: 'Freelancer', label: 'Freelancer', icon: Briefcase, template: 'freelancer' },
]

const stepNames = ['Business type', 'Business info', 'Contact', 'Social links', 'Template', 'Logo', 'Theme', 'Preview']

export function Onboarding() {
  useDocumentTitle('Set up your review card')
  const { user } = useAuth()
  const { card, patch, patchAppearance, applyTemplate, createBusiness, save, publish } = useCard()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [type, setType] = useState('')
  const [tpl, setTpl] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  const slugTaken = ['tapcard', 'admin', 'login', 'pricing'].includes(card.slug)
  const canNext = useMemo(() => {
    if (step === 0) return !!type
    if (step === 1) return card.businessName.trim().length > 1 && !!card.slug && !slugTaken
    if (step === 2) return card.phone.trim().length > 5
    if (step === 4) return !!tpl
    return true
  }, [step, type, card.businessName, card.slug, card.phone, tpl, slugTaken])

  if (!user) return <Navigate to="/register" replace />

  const next = () => {
    if (step === 1) {
      const errs: Record<string, string> = {}
      if (card.businessName.trim().length < 2) errs.businessName = 'Please enter your business name.'
      if (!card.slug) errs.slug = 'Pick a link for your card.'
      else if (slugTaken) errs.slug = 'That link is taken — try another.'
      setErrors(errs)
      if (Object.keys(errs).length) return
    }
    if (step === 2 && card.phone.trim().length < 6) return setErrors({ phone: 'A phone number is required so customers can reach you.' })
    setErrors({})
    if (step < stepNames.length - 1) {
      setStep((s) => s + 1)
      return
    }
    setBusy(true)
    setError('')
    // Create the business first, then save the details gathered in the wizard, then publish.
    createBusiness({
      name: card.businessName,
      category: card.category,
      slug: card.slug,
      tagline: card.tagline,
      description: card.description,
      templateKey: tpl || undefined,
    })
      .then(() => save())
      .then(() => publish())
      .then(() => setDone(true))
      .catch((e: Error) => setError(e.message))
      .finally(() => setBusy(false))
  }

  const pickType = (t: (typeof types)[number]) => {
    setType(t.id)
    patch({ category: t.id })
    const template = templates.find((x) => x.id === t.template)
    if (template) {
      applyTemplate(template)
      setTpl(template.id)
      patch({ category: t.id, businessName: card.businessName, slug: card.slug })
    }
  }

  if (done)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-4 py-12">
        <div className="w-full max-w-lg animate-fade-up rounded-3xl border border-ink-200 bg-white p-8 text-center shadow-card sm:p-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><PartyPopper className="size-8" /></div>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-ink-900">Your review card is live</h1>
          <p className="mt-2 text-[15px] text-ink-500">{card.businessName} is now published and ready to share.</p>
          <div className="mt-7 flex flex-col items-center gap-4 rounded-2xl border border-ink-200 bg-ink-50 p-5">
            <QRImage text={reviewUrl(card.slug)} size={140} />
            <a href={`/review/${card.slug}`} target="_blank" rel="noreferrer" className="break-all font-mono text-sm font-semibold text-brand-700 hover:underline">{reviewUrl(card.slug)}</a>
          </div>
          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" size="lg" onClick={() => window.open(`/review/${card.slug}`, '_blank')}>View my review page</Button>
            <Button size="lg" onClick={() => navigate('/dashboard')} iconRight={<ArrowRight className="size-4" />}>Go to dashboard</Button>
          </div>
          <Link to="/dashboard/qr" className="mt-5 inline-block text-[14px] font-medium text-ink-600 hover:text-ink-900">Download QR & order printed cards →</Link>
        </div>
      </div>
    )

  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-ink-500 hover:text-ink-900">Skip for now</button>
        </div>
      </header>

      <div className="container-page grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:py-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-bold text-brand-600">Step {step + 1} of {stepNames.length}</span>
            <span className="text-[13px] text-ink-500">{stepNames[step]}</span>
          </div>
          <div className="mt-3 flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={stepNames.length}>
            {stepNames.map((s, i) => <span key={s} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= step ? 'bg-brand-600' : 'bg-ink-200')} />)}
          </div>

          <div key={step} className="mt-8 animate-fade-up">
            {step === 0 && (
              <>
                <h1 className="font-display text-2xl font-extrabold text-ink-900">What kind of business is this?</h1>
                <p className="mt-2 text-[15px] text-ink-500">We will suggest a matching template and sections.</p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {types.map((t) => (
                    <button key={t.id} onClick={() => pickType(t)} className={cn('flex flex-col items-center gap-2.5 rounded-2xl border bg-white px-3 py-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-soft', type === t.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-ink-200')}>
                      <t.icon className={cn('size-6', type === t.id ? 'text-brand-600' : 'text-ink-500')} />
                      <span className="text-[13px] font-semibold text-ink-800">{t.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="font-display text-2xl font-extrabold text-ink-900">Tell us about your business</h1>
                <p className="mt-2 text-[15px] text-ink-500">This is what customers see first on your card.</p>
                <div className="mt-6 space-y-4">
                  <Input label="Business name" placeholder="Royal Spice" value={card.businessName} error={errors.businessName} onChange={(e) => patch({ businessName: e.target.value, slug: slugify(e.target.value) })} />
                  <Input label="Your card link" value={card.slug} error={errors.slug} hint={!errors.slug ? `Your card will live at ${reviewUrl(card.slug || 'your-business')}` : undefined} leading={<span className="text-[13px]">/review/</span>} className="[&_input]:pl-[70px]" onChange={(e) => patch({ slug: slugify(e.target.value) })} />
                  <Input label="Tagline" placeholder="Restaurant & Cafe" value={card.tagline} onChange={(e) => patch({ tagline: e.target.value })} />
                  <Textarea label="Short description" placeholder="What makes your business worth visiting?" value={card.description} onChange={(e) => patch({ description: e.target.value })} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="font-display text-2xl font-extrabold text-ink-900">How can customers reach you?</h1>
                <p className="mt-2 text-[15px] text-ink-500">Each of these becomes a one-tap button.</p>
                <div className="mt-6 space-y-4">
                  <Input label="Phone" placeholder="+91 98765 43210" value={card.phone} error={errors.phone} onChange={(e) => patch({ phone: e.target.value })} />
                  <Input label="WhatsApp number" hint="With country code, digits only — e.g. 919876543210" placeholder="919876543210" value={card.whatsapp} onChange={(e) => patch({ whatsapp: e.target.value })} />
                  <Input label="Email" type="email" placeholder="hello@yourbusiness.in" value={card.email} onChange={(e) => patch({ email: e.target.value })} />
                  <Input label="Address" placeholder="12, MG Road, Bengaluru 560038" value={card.address} onChange={(e) => patch({ address: e.target.value })} />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="font-display text-2xl font-extrabold text-ink-900">Add your social profiles</h1>
                <p className="mt-2 text-[15px] text-ink-500">Optional — you can add these later. Just the username is enough.</p>
                <div className="mt-6 space-y-4">
                  <Input label="Instagram" placeholder="yourbusiness" value={card.instagram} onChange={(e) => patch({ instagram: e.target.value })} />
                  <Input label="Facebook" placeholder="yourbusiness" value={card.facebook} onChange={(e) => patch({ facebook: e.target.value })} />
                  <Input label="Website" placeholder="https://yourbusiness.in" value={card.website} onChange={(e) => patch({ website: e.target.value })} />
                  <Input label="Google review link" hint="Paste the link customers use to leave you a review." placeholder="https://g.page/r/..." value={card.reviewUrl} onChange={(e) => patch({ reviewUrl: e.target.value })} />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h1 className="font-display text-2xl font-extrabold text-ink-900">Choose a template</h1>
                <p className="mt-2 text-[15px] text-ink-500">Everything stays editable afterwards.</p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {templates.map((t) => (
                    <button key={t.id} onClick={() => { setTpl(t.id); applyTemplate(t) }} className={cn('overflow-hidden rounded-xl border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-soft', tpl === t.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-ink-200')}>
                      <div className="relative h-20" style={{ background: covers[t.card.appearance.cover].css }}>
                        {tpl === t.id && <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-white text-brand-600"><Check className="size-3.5" /></span>}
                      </div>
                      <div className="p-2.5">
                        <p className="truncate text-[13px] font-semibold text-ink-900">{t.name}</p>
                        <p className="text-[11px] text-ink-500">{t.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <h1 className="font-display text-2xl font-extrabold text-ink-900">Add your logo</h1>
                <p className="mt-2 text-[15px] text-ink-500">Optional. Without one we show your initials in your brand colour.</p>
                <label className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-ink-300 bg-white px-6 py-12 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-ink-100 text-ink-500"><Upload className="size-5" /></div>
                  <span className="text-[15px] font-semibold text-ink-800">Upload a logo</span>
                  <span className="text-[13px] text-ink-500">PNG, JPG or SVG · square works best · up to 2MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      if (f.size > 2 * 1024 * 1024) return toast('That file is over 2MB — please pick a smaller one', 'error')
                      const reader = new FileReader()
                      reader.onload = () => {
                        patch({ logo: String(reader.result) })
                        toast('Logo added')
                      }
                      reader.readAsDataURL(f)
                    }}
                  />
                </label>
                {card.logo && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3">
                    <img src={card.logo} alt="Your logo" className="size-12 rounded-lg object-cover" />
                    <span className="flex-1 text-[14px] font-medium text-ink-800">Logo uploaded</span>
                    <Button size="sm" variant="danger" onClick={() => patch({ logo: undefined })}>Remove</Button>
                  </div>
                )}
                <div className="mt-6 rounded-xl bg-white p-4">
                  <p className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink-700"><ImageIcon className="size-4" /> Cover style</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(covers) as (keyof typeof covers)[]).map((c) => (
                      <button key={c} aria-label={covers[c].label} onClick={() => patchAppearance({ cover: c })} className={cn('h-12 rounded-lg ring-offset-2 transition-all', card.appearance.cover === c && 'ring-2 ring-brand-500')} style={{ background: covers[c].css }} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 6 && (
              <>
                <h1 className="font-display text-2xl font-extrabold text-ink-900">Pick a look</h1>
                <p className="mt-2 text-[15px] text-ink-500">Fine-tune every colour later in the builder.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {themePresets.map((p) => (
                    <button key={p.id} onClick={() => patchAppearance({ themeId: p.id, ...p.appearance })} className={cn('flex items-center gap-3 rounded-xl border bg-white p-3 text-left transition-all hover:shadow-soft', card.appearance.themeId === p.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-ink-200')}>
                      <span className="size-10 shrink-0 rounded-lg" style={{ background: covers[p.appearance.cover].css }} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-ink-900">{p.name}</span>
                        <span className="block text-[12px] capitalize text-ink-500">{p.appearance.mode} · {p.appearance.buttonStyle}</span>
                      </span>
                      <span className="size-5 shrink-0 rounded-full" style={{ background: p.appearance.primary }} />
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 7 && (
              <>
                <h1 className="font-display text-2xl font-extrabold text-ink-900">Ready to publish?</h1>
                <p className="mt-2 text-[15px] text-ink-500">Check the preview. You can change anything afterwards.</p>
                <dl className="mt-6 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200 bg-white">
                  {[
                    ['Business', card.businessName],
                    ['Category', card.category],
                    ['Card link', reviewUrl(card.slug)],
                    ['Phone', card.phone],
                    ['WhatsApp', card.whatsapp || '—'],
                    ['Template', templates.find((t) => t.id === tpl)?.name ?? 'Custom'],
                    ['Theme', themePresets.find((t) => t.id === card.appearance.themeId)?.name ?? 'Custom'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4 px-4 py-3">
                      <dt className="text-[13px] text-ink-500">{k}</dt>
                      <dd className="truncate text-[14px] font-semibold text-ink-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">{error}</p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} icon={<ArrowLeft className="size-4" />}>Back</Button>
            <Button size="lg" onClick={next} disabled={!canNext} loading={busy} iconRight={step === stepNames.length - 1 ? undefined : <ArrowRight className="size-4" />}>
              {step === stepNames.length - 1 ? 'Generate my card' : 'Continue'}
            </Button>
          </div>
        </div>

        <div className="hidden justify-center lg:flex">
          <div className="sticky top-8">
            <PhoneFrame height={600} width={300}><DigitalCardPreview card={card} /></PhoneFrame>
            <p className="mt-4 text-center text-[13px] text-ink-500">Live preview</p>
          </div>
        </div>
      </div>
    </div>
  )
}
