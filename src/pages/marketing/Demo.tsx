import { ArrowRight, QrCode, Smartphone, Zap } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Section, SectionHead } from '@/features/marketing/Bits'
import { ReviewDemo } from '@/features/marketing/ReviewDemo'
import { reviewUrl } from '@/lib/format'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const steps = [
  { icon: QrCode, t: 'Scan or tap', d: 'Point any phone camera at the code, or tap an NFC card. No app, no sign-up.' },
  { icon: Smartphone, t: 'The review page opens', d: 'Straight to the rating — never a profile they have to navigate first.' },
  { icon: Zap, t: 'They review in seconds', d: 'Pick a suggested line or write their own, submit, then continue to Google.' },
]

export function Demo() {
  useDocumentTitle('Live demo')
  return (
    <>
      <Section className="pb-8">
        <SectionHead eyebrow="Live demo" title="This is exactly what your customers will see" description="Scan a TapCard QR and this opens. Choose a rating, pick a suggested review or write your own, and submit — nothing is saved here." />
      </Section>

      <div className="container-page pb-16"><ReviewDemo height={680} /></div>

      <Section className="border-y border-ink-200 bg-ink-50/60">
        <SectionHead title="What happens when someone scans" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.t} className="rounded-2xl border border-ink-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><s.icon className="size-5" /></div>
                <span className="font-mono text-xs font-bold text-ink-400">STEP {i + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-[17px] font-bold text-ink-900">{s.t}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-500">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Open a real published review page</h2>
          <p className="mt-3 text-[15px] text-ink-500">This is the live page, exactly as a customer lands on it after scanning.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {['royal-spice'].map((s) => (
              <a key={s} href={`/review/${s}`} target="_blank" rel="noreferrer" className="rounded-full border border-ink-200 bg-white px-4 py-2 font-mono text-[13px] text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50">
                {reviewUrl(s).replace('https://', '')}
              </a>
            ))}
          </div>
          <ButtonLink to="/register" size="lg" className="mt-10" iconRight={<ArrowRight className="size-4" />}>Create my review card free</ButtonLink>
        </div>
      </Section>
    </>
  )
}
