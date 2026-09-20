import { BarChart3, CalendarCheck, Check, Download, Globe, Layers, Link2, Lock, MapPin, MessageCircle, Nfc, Palette, QrCode, Smartphone, Star, UtensilsCrossed, Users, Zap } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Section, SectionHead } from '@/features/marketing/Bits'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { DigitalCardPreview } from '@/components/card/DigitalCardPreview'
import { glowStudio } from '@/data/templates'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const groups = [
  {
    title: 'Your digital card',
    description: 'A complete mobile profile that works the moment it is scanned.',
    items: [
      { icon: Smartphone, t: 'Mobile-first design', d: 'Built for the phone in your customer’s hand, tested from 360px upwards.' },
      { icon: MessageCircle, t: 'WhatsApp-first buttons', d: 'The action Indian customers actually use, placed first and prominently.' },
      { icon: UtensilsCrossed, t: 'Menus & services', d: 'Categorised menu with veg markers, or a service list with prices.' },
      { icon: CalendarCheck, t: 'Booking button', d: 'Link any booking tool — Cal.com, Calendly, your own form or WhatsApp.' },
      { icon: MapPin, t: 'Directions & hours', d: 'Google Maps link plus opening hours that highlight today.' },
      { icon: Download, t: 'Save contact', d: 'One tap saves your details to the customer’s phone as a vCard.' },
    ],
  },
  {
    title: 'Sharing it',
    description: 'One link behind every surface your business touches.',
    items: [
      { icon: QrCode, t: 'Custom QR codes', d: 'Change colours, add your logo, download PNG or print-ready SVG.' },
      { icon: Nfc, t: 'NFC cards & stands', d: 'Tap-to-open cards and acrylic table stands, printed and shipped in India.' },
      { icon: Link2, t: 'Clean URL', d: 'tapcard.in/your-business — easy to say on a call and print on a bill.' },
      { icon: Globe, t: 'Custom domain', d: 'Point your own domain at your card on the Business plan.' },
    ],
  },
  {
    title: 'Growing with it',
    description: 'Understand what works, then do more of it.',
    items: [
      { icon: BarChart3, t: 'Scan & tap analytics', d: 'Scans, unique visitors and per-button taps across any date range.' },
      { icon: Star, t: 'Review growth', d: 'A dedicated Google review button that removes every extra step.' },
      { icon: Users, t: 'Lead capture', d: 'Collect enquiries from your card and export them whenever you need.' },
      { icon: Layers, t: 'Team cards', d: 'Up to 10 cards on one account, each with its own link and QR.' },
    ],
  },
]

export function Features() {
  useDocumentTitle('Features')
  return (
    <>
      <Section className="pb-8">
        <SectionHead eyebrow={<><Zap className="size-3.5" /> Features</>} title="Everything your business card should have done all along" description="A paper card gives someone your number. A TapCard gives them your menu, your WhatsApp, your directions, your reviews and a way to book — and tells you what they used." />
        <div className="mt-8 flex flex-wrap justify-center gap-3"><ButtonLink to="/register" size="lg">Create your free card</ButtonLink><ButtonLink to="/demo" size="lg" variant="secondary">See a live card</ButtonLink></div>
      </Section>

      {groups.map((g, gi) => (
        <Section key={g.title} className={gi % 2 === 1 ? 'border-y border-ink-200 bg-ink-50/60' : ''}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{g.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{g.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.items.map((i) => (
                <div key={i.t} className="rounded-2xl border border-ink-200 bg-white p-5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><i.icon className="size-[18px]" /></div>
                  <h3 className="mt-3.5 font-display text-[15px] font-bold text-ink-900">{i.t}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-500">{i.d}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      ))}

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHead center={false} eyebrow={<><Palette className="size-3.5" /> Design control</>} title="Make it look like your business, not like a template" description="Colours, fonts, button shapes, light or dark — change anything and watch it update on a real phone frame as you type." />
            <ul className="mt-7 space-y-2.5">
              {['8 ready-made themes, or build your own palette', 'Four font families including an editorial serif', 'Button style: solid, soft or outline', 'Corner radius from square to fully rounded', 'Remove TapCard branding on paid plans'].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[15px] text-ink-700"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />{t}</li>
              ))}
            </ul>
          </div>
          <PhoneFrame height={560} width={300}><DigitalCardPreview card={glowStudio} /></PhoneFrame>
        </div>
      </Section>

      <Section className="border-t border-ink-200 bg-ink-50/60">
        <div className="mx-auto max-w-2xl text-center">
          <Lock className="mx-auto size-8 text-brand-600" />
          <h2 className="mt-4 font-display text-2xl font-bold text-ink-900">Privacy that does not need a policy to explain</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-500">We count scans, taps, device type and rough source. We do not build profiles of the people who scan your code, and we never sell data. Your customers get your card — nothing else happens to them.</p>
          <ButtonLink to="/privacy" variant="secondary" className="mt-7">Read our privacy policy</ButtonLink>
        </div>
      </Section>
    </>
  )
}
