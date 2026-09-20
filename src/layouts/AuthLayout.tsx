import { Link, Outlet } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { DigitalCardPreview } from '@/components/card/DigitalCardPreview'
import { royalSpice } from '@/data/templates'

export function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-sm text-ink-500 hover:text-ink-800">← Back to site</Link>
        </div>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          <Outlet />
        </div>
        <p className="text-center text-xs text-ink-400">Protected by industry-standard encryption</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:items-center lg:justify-center" aria-hidden>
        <div className="absolute inset-0 opacity-90" style={{ background: 'radial-gradient(60% 50% at 70% 20%, rgba(108,88,255,.45), transparent 70%), radial-gradient(50% 40% at 20% 90%, rgba(255,122,69,.25), transparent 70%)' }} />
        <div className="relative z-10 flex max-w-md flex-col items-center px-8 text-center">
          <PhoneFrame height={520} width={280} floating><DigitalCardPreview card={royalSpice} /></PhoneFrame>
          <h2 className="mt-10 font-display text-2xl font-bold text-white">One QR. Your Entire Business.</h2>
          <ul className="mt-5 space-y-2 text-left text-sm text-ink-300">
            {['Live in under 5 minutes', 'Free forever plan', 'Works with QR & NFC'].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> {t}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
