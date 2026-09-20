import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Briefcase, Building2, Check, Coffee, Dumbbell, Link2, MousePointerClick, Nfc, Palette, QrCode, Scissors, ScanLine, Sparkles, Star, Stethoscope, Store, Timer, UtensilsCrossed, Zap, type LucideIcon } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { ReviewExperience } from '@/features/review/ReviewExperience'
import { toReviewCard } from '@/data/reviewDemo'
import { ReviewDemo } from '@/features/marketing/ReviewDemo'
import { QRImage } from '@/components/card/QRImage'
import { Accordion, Eyebrow, Section, SectionHead, faqs } from '@/features/marketing/Bits'
import { royalSpice, templates } from '@/data/templates'
import { useCatalogue } from '@/hooks/useCatalogue'
import { inr, num, reviewUrl } from '@/lib/format'
import { covers } from '@/lib/theme'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const stats = [
  { v: '12,400+', l: 'Businesses on TapCard' },
  { v: '3.1M', l: 'Reviews collected this year' },
  { v: '4.8/5', l: 'Average customer rating' },
  { v: '< 5 min', l: 'To publish your card' },
]

const steps = [
  { n: '01', icon: Palette, t: 'Build your review card', d: 'Pick a design, add your logo and write a few suggested reviews your customers can tap.' },
  { n: '02', icon: QrCode, t: 'Get your QR & NFC', d: 'Publish and you get a permanent review link, a QR code to print, and the destination for any NFC card.' },
  { n: '03', icon: Star, t: 'Collect reviews', d: 'Customers tap or scan, rate you in seconds, and continue to your Google listing.' },
]

const features: { icon: LucideIcon; t: string; d: string; span?: boolean }[] = [
  { icon: Zap, t: 'Reviews in about ten seconds', d: 'Rate, tap a suggested line, submit. No app, no account, no typing unless they want to.', span: true },
  { icon: Star, t: 'Suggested reviews', d: 'Offer a few ready-made lines. Customers can pick one and edit it — the words stay theirs.' },
  { icon: Nfc, t: 'QR + NFC together', d: 'The same review page opens whether they scan or tap. Nothing to reprint when you change it.' },
  { icon: BarChart3, t: 'Real analytics', d: 'Scans, review page views, reviews submitted and Google clicks — with your conversion rate.' },
  { icon: Palette, t: 'Complete control of design', d: 'Colours, fonts, corner radius, button style, light and dark — all live-previewed on a real phone frame.' },
  { icon: Star, t: 'Straight to Google', d: 'After submitting, every customer is offered your Google listing in one tap.' },
  { icon: Link2, t: 'Your own link', d: 'A clean, memorable URL like tapcard.in/royal-spice that you can put anywhere.' },
  { icon: Timer, t: 'Always current', d: 'Change a suggestion or your Google link and every printed card updates on the next scan.' },
]

const categories = [
  { icon: UtensilsCrossed, l: 'Restaurants' },
  { icon: Coffee, l: 'Cafés' },
  { icon: Scissors, l: 'Salons & Spas' },
  { icon: Dumbbell, l: 'Gyms' },
  { icon: Stethoscope, l: 'Clinics & Doctors' },
  { icon: Building2, l: 'Real Estate' },
  { icon: Store, l: 'Retail Shops' },
  { icon: Briefcase, l: 'Freelancers' },
]

const metrics = [
  { l: 'QR Scans', v: 1248, d: '+12.4%' },
  { l: 'Review Page Views', v: 1102, d: '+11.8%' },
  { l: 'Reviews Submitted', v: 418, d: '+26.4%' },
  { l: 'Google Clicks', v: 291, d: '+19.2%' },
]

export function Home() {
  useDocumentTitle('TapCard — One Tap. One Scan. One Easy Review.')
  const { plans: apiPlans } = useCatalogue()
  const plans = (apiPlans ?? []).map((p) => ({ id: p.tier, name: p.name, price: p.monthlyPaise / 100, tagline: p.tagline, popular: p.popular, features: p.features, cta: p.tier === 'FREE' ? 'Start free' : p.tier === 'PRO' ? 'Go Pro' : 'Choose Business' }))
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 h-[560px]" style={{ background: 'radial-gradient(45% 55% at 20% 40%, rgba(108,88,255,0.13), transparent 70%), radial-gradient(40% 50% at 85% 10%, rgba(255,122,69,0.12), transparent 70%)' }} />
        <div className="container-page relative grid items-center gap-14 py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:py-24">
          <div className="animate-fade-up">
            <Eyebrow><Sparkles className="size-3.5" /> QR &amp; NFC review cards shipping across India</Eyebrow>
            <h1 className="mt-5 text-balance text-[40px] font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-[56px]">
              One Tap. One Scan.<br />
              <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">One Easy Review.</span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-ink-600 sm:text-lg">
              Create a branded review card for your business. Share it digitally, or let customers tap or scan a QR/NFC card to instantly
              share their experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/get-card" size="lg" iconRight={<ArrowRight className="size-4" />}>Get My Review Card</ButtonLink>
              <ButtonLink to="/demo" size="lg" variant="secondary" icon={<MousePointerClick className="size-4" />}>See Demo</ButtonLink>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
              {['Free forever plan', 'No app for customers', 'Live in 5 minutes'].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check className="size-4 text-emerald-600" /> {t}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
            <PhoneFrame height={600} width={300} floating>
              <ReviewExperience card={toReviewCard(royalSpice)} />
            </PhoneFrame>
            <div className="flex flex-row items-center gap-4 sm:flex-col sm:gap-3">
              <div className="rounded-3xl border border-ink-200 bg-white p-4 shadow-card">
                <QRImage text={reviewUrl('royal-spice')} size={112} options={{ fg: '#0f1729' }} />
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-600">
                <ScanLine className="size-4 text-brand-600" /> Scan to review
              </div>
              <div className="hidden rounded-2xl border border-ink-200 bg-white px-3 py-2 text-center shadow-soft sm:block">
                <div className="flex items-center gap-1.5 text-xs font-medium text-ink-500"><Nfc className="size-3.5 text-brand-600" /> or tap NFC</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-ink-200 bg-ink-50/60 py-10">
        <div className="container-page">
          <p className="text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-400">Trusted by businesses across India</p>
          <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="text-center">
                <dt className="font-display text-3xl font-extrabold text-ink-900">{s.v}</dt>
                <dd className="mt-1 text-[13px] text-ink-500">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <Section>
        <SectionHead eyebrow="How it works" title="From zero to a live card in three steps" description="No designer, no developer and no app. Just your business details and five spare minutes." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="group relative rounded-2xl border border-ink-200 bg-white p-7 transition-shadow hover:shadow-card">
              <span className="font-mono text-[13px] font-bold text-brand-600">{s.n}</span>
              <div className="mt-4 flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <s.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-ink-900">{s.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Interactive demo */}
      <Section className="border-y border-ink-200 bg-ink-50/60">
        <SectionHead eyebrow="Try it yourself" title="This is what your customer sees" description="Pick a business, choose a rating and submit — the real review experience, running here in the page." />
        <div className="mt-12"><ReviewDemo /></div>
      </Section>

      {/* Features bento */}
      <Section>
        <SectionHead eyebrow="Features" title="Everything a small business actually needs" description="Built around the things that bring customers back — not a list of features nobody uses." />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.t} className={cn('rounded-2xl border border-ink-200 bg-white p-6 transition-shadow hover:shadow-card', f.span && 'sm:col-span-2')}>
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><f.icon className="size-5" /></div>
              <h3 className="mt-4 font-display text-[17px] font-bold text-ink-900">{f.t}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-500">{f.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Categories */}
      <Section className="border-y border-ink-200 bg-ink-50/60">
        <SectionHead eyebrow="Built for every business" title="Made for the businesses on your street" />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <div key={c.l} className="flex flex-col items-center gap-3 rounded-2xl border border-ink-200 bg-white px-4 py-7 text-center transition-all hover:-translate-y-0.5 hover:shadow-card">
              <c.icon className="size-6 text-brand-600" />
              <span className="text-sm font-semibold text-ink-800">{c.l}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* QR + NFC */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHead center={false} eyebrow={<><Nfc className="size-3.5" /> QR &amp; NFC</>} title="Scan it or tap it. Same review page." description="Your QR code and your NFC card both open one permanent link. Rewrite your suggested reviews or change your Google listing tonight, and every card you handed out last year already points to the new version." />
            <ul className="mt-8 space-y-3">
              {[
                'Printed QR on cards, stands, posters and bills',
                'NFC cards and table stands that work by tap',
                'Nothing to reprint when your review page changes',
                'Works on iPhone and Android with no app',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-ink-700">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="size-3.5" /></span>
                  {t}
                </li>
              ))}
            </ul>
            <ButtonLink to="/dashboard/store" className="mt-8" variant="dark" iconRight={<ArrowRight className="size-4" />}>Shop QR &amp; NFC review cards</ButtonLink>
          </div>
          <div className="relative grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-ink-200 bg-white p-6 text-center shadow-card">
              <QRImage text={reviewUrl('royal-spice')} size={140} className="mx-auto" options={{ fg: '#0f1729' }} />
              <p className="mt-3 text-sm font-semibold text-ink-800">Scan</p>
              <p className="text-xs text-ink-500">Any phone camera</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-3xl p-6 text-center text-white shadow-card" style={{ background: covers.aurora.css }}>
              <Nfc className="size-16" />
              <p className="mt-3 text-sm font-semibold">Tap</p>
              <p className="text-xs opacity-80">NFC card or stand</p>
            </div>
            <div className="col-span-2 rounded-3xl border border-ink-200 bg-ink-950 p-6 text-center">
              <p className="break-all font-mono text-sm text-brand-300">{reviewUrl('royal-spice')}</p>
              <p className="mt-1 text-xs text-ink-400">One permanent link behind both</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Analytics preview */}
      <Section className="border-y border-ink-200 bg-ink-50/60">
        <SectionHead eyebrow={<><BarChart3 className="size-3.5" /> Analytics</>} title="See how many scans become reviews" description="Scans, review page views, reviews submitted and Google clicks — measured without collecting anything you would not want collected about yourself." />
        <div className="mt-12 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
          <div className="grid gap-px bg-ink-200 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.l} className="bg-white p-6">
                <p className="text-[13px] font-medium text-ink-500">{m.l}</p>
                <p className="mt-1.5 font-display text-3xl font-extrabold text-ink-900">{num(m.v)}</p>
                <p className="mt-1 text-xs font-semibold text-emerald-600">{m.d} vs last month</p>
              </div>
            ))}
          </div>
          <div className="flex h-44 items-end gap-1.5 border-t border-ink-200 px-6 py-6 sm:h-56">
            {Array.from({ length: 30 }, (_, i) => 28 + 30 * Math.abs(Math.sin(i / 3.4)) + (i % 5) * 3).map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-brand-200 to-brand-500 transition-all hover:from-brand-300 hover:to-brand-600" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </Section>

      {/* Templates */}
      <Section>
        <SectionHead eyebrow="Templates" title="Start from a design that already fits" description="Ten designs tuned for different kinds of business. Change the colours, copy and suggestions afterwards." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templates.slice(0, 4).map((t) => (
            <Link key={t.id} to="/templates" className="group overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all hover:-translate-y-1 hover:shadow-card">
              <div className="h-40 overflow-hidden" style={{ background: covers[t.card.appearance.cover].css }}>
                <div className="flex h-full items-end p-4">
                  <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ink-800">{t.category}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display text-[15px] font-bold text-ink-900">{t.name}</h3>
                <p className="mt-1 line-clamp-2 text-[13px] text-ink-500">{t.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center"><ButtonLink to="/templates" variant="secondary" iconRight={<ArrowRight className="size-4" />}>Browse all templates</ButtonLink></div>
      </Section>

      {/* Pricing */}
      <Section className="border-y border-ink-200 bg-ink-50/60" id="pricing">
        <SectionHead eyebrow="Pricing" title="Start free. Upgrade when it pays for itself." description="All prices in ₹, GST invoice included. Cancel anytime." />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className={cn('relative flex flex-col rounded-2xl border bg-white p-7', p.popular ? 'border-brand-500 shadow-card ring-1 ring-brand-500' : 'border-ink-200')}>
              {p.popular && <span className="absolute -top-3 left-7 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold text-white">Most popular</span>}
              <h3 className="font-display text-lg font-bold text-ink-900">{p.name}</h3>
              <p className="mt-1 text-[13px] text-ink-500">{p.tagline}</p>
              <p className="mt-5 font-display text-4xl font-extrabold text-ink-900">
                {p.price === 0 ? '₹0' : inr(p.price)}
                <span className="text-sm font-medium text-ink-500">/month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-[14px] text-ink-600">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {f}</li>
                ))}
              </ul>
              <ButtonLink to="/get-card" className="mt-7" full variant={p.popular ? 'primary' : 'secondary'}>{p.cta}</ButtonLink>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionHead eyebrow="FAQ" title="Questions we get asked most" />
        <div className="mx-auto mt-12 max-w-3xl"><Accordion items={faqs.slice(0, 5)} /></div>
        <p className="mt-8 text-center text-sm text-ink-500">Still unsure? <Link to="/contact" className="font-semibold text-brand-700 hover:underline">Talk to us →</Link></p>
      </Section>

      {/* Final CTA */}
      <section className="pb-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-14" style={{ background: covers.aurora.css }}>
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-balance font-display text-3xl font-extrabold text-white sm:text-4xl">Your happiest customers just need somewhere to say so.</h2>
              <p className="mt-4 text-pretty text-lg text-white/85">Give them one thing to tap. Set up your review card free — it takes about five minutes.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink to="/get-card" size="lg" className="bg-white !text-ink-900 hover:bg-ink-100" iconRight={<ArrowRight className="size-4" />}>Get My Review Card</ButtonLink>
                <ButtonLink to="/demo" size="lg" className="border border-white/40 bg-white/10 !text-white backdrop-blur hover:bg-white/20">See Demo</ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
