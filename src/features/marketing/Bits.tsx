import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[12px] font-semibold text-brand-700', className)}>{children}</span>
}

export function SectionHead({ eyebrow, title, description, center = true, className }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; center?: boolean; className?: string }) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center', className)}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className="text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-pretty text-[17px] leading-relaxed text-ink-500">{description}</p>}
    </div>
  )
}

export function Section({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('py-16 sm:py-24', className)}>
      <div className="container-page">{children}</div>
    </section>
  )
}

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="divide-y divide-ink-200 overflow-hidden rounded-2xl border border-ink-200 bg-white">
      {items.map((it, i) => (
        <div key={it.q}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-ink-50">
            <span className="font-display text-[15px] font-semibold text-ink-900">{it.q}</span>
            <ChevronDown className={cn('size-5 shrink-0 text-ink-400 transition-transform', open === i && 'rotate-180')} />
          </button>
          {open === i && <p className="animate-fade-up px-5 pb-5 text-[15px] leading-relaxed text-ink-600">{it.a}</p>}
        </div>
      ))}
    </div>
  )
}

export const faqs = [
  { q: 'What exactly is a TapCard digital business card?', a: 'It is a mobile-first web page for your business at your own link, for example tapcard.in/royal-spice. It carries your contact buttons, menu or services, social profiles, reviews and directions. Customers open it by scanning your QR code, tapping your NFC card, or clicking the link — no app to install on either side.' },
  { q: 'Do my customers need to install anything?', a: 'No. The QR opens in the phone camera and the card loads in the browser. NFC cards work with the built-in tap reader on modern iPhones and Android phones.' },
  { q: 'Can I change my card after printing the QR?', a: 'Yes, and this is the main advantage. The QR points to your link, not to your details. Change your phone number, menu or offers anytime and every printed card and stand updates instantly.' },
  { q: 'Is there really a free plan?', a: 'Yes. The Free plan gives you one digital card, your TapCard link, a downloadable QR code and 7 days of analytics. No credit card needed to start.' },
  { q: 'What do the physical cards cost?', a: 'Printed QR cards start at ₹299, premium cards at ₹599 and NFC cards at ₹899, with 5 and 10 packs for teams. Prices include GST invoicing and shipping across India.' },
  { q: 'How do I take payments and get an invoice?', a: 'Payments are processed by Razorpay and support UPI, cards, netbanking and wallets. A GST invoice is emailed for every order and subscription; you can add your GSTIN at checkout.' },
  { q: 'Can I use my own domain?', a: 'Custom domains are available on the Business plan. On Free and Pro your card lives at tapcard.in/your-name.' },
  { q: 'What analytics do I get?', a: 'Scans, unique visitors, and taps on each button — WhatsApp, call, website, menu, directions, booking and Google review — plus device and source breakdowns. We deliberately do not collect unnecessary personal data about your visitors.' },
]
