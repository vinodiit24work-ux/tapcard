import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, ExternalLink, MessageSquare, PartyPopper, QrCode } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Form'
import { Logo, LogoMark } from '@/components/ui/Logo'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { QRImage } from '@/components/card/QRImage'
import { ReviewExperience } from '@/features/review/ReviewExperience'
import { publicApi } from '@/services/ownerApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { ReviewCardData } from '@/types/review'

/**
 * What the customer opens from the link the team sends them.
 * No account, no password — the token in the URL only ever lets them see this card
 * and either approve it or ask for changes.
 */
export function ApprovalPage() {
  const { token = '' } = useParams()
  useDocumentTitle('Your TapCard is ready')
  const [card, setCard] = useState<ReviewCardData | null>(null)
  const [links, setLinks] = useState<{ review: string; card: string } | null>(null)
  const [status, setStatus] = useState<string>('')
  const [note, setNote] = useState('')
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(() => {
    setState('loading')
    publicApi
      .approval(token)
      .then((r) => {
        setCard(r.card as unknown as ReviewCardData)
        setLinks(r.links)
        setStatus(r.approval.status)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [token])
  useEffect(load, [load])

  const decide = (decision: 'approve' | 'changes') => {
    if (decision === 'changes' && note.trim().length < 4) return
    setBusy(true)
    publicApi
      .decide(token, decision, note.trim() || undefined)
      .then((r) => { setStatus(r.status); setAsking(false) })
      .finally(() => setBusy(false))
  }

  if (state === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ink-50">
        <span className="size-7 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" role="status" aria-label="Loading" />
      </div>
    )
  }

  if (state === 'error' || !card) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-6 text-center">
        <LogoMark className="size-12" />
        <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">This link is no longer valid</h1>
        <p className="mt-2 max-w-sm text-[15px] text-ink-500">Please ask us for a fresh link and we will send it straight over.</p>
        <ButtonLink to="/" size="lg" className="mt-7" variant="secondary">Go to TapCard</ButtonLink>
      </div>
    )
  }

  const approved = status === 'APPROVED'
  const askedForChanges = status === 'CHANGES_REQUESTED'

  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <span className="text-[13px] text-ink-500">Your card preview</span>
        </div>
      </header>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[auto_minmax(0,1fr)]">
        <div className="mx-auto">
          <PhoneFrame height={600} width={300}><ReviewExperience card={card} /></PhoneFrame>
          <p className="mt-3 text-center text-[12px] text-ink-500">This is what your customers will see</p>
        </div>

        <div className="max-w-xl space-y-5">
          {approved ? (
            <Card className="p-7 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><PartyPopper className="size-7" /></div>
              <h1 className="mt-5 font-display text-2xl font-extrabold text-ink-900">Thank you — approved!</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
                We are preparing your cards now. You will hear from us as soon as they are on their way.
              </p>
            </Card>
          ) : askedForChanges ? (
            <Card className="p-7 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><MessageSquare className="size-7" /></div>
              <h1 className="mt-5 font-display text-2xl font-extrabold text-ink-900">We have your changes</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
                Our team is updating your card and will send you a new preview shortly.
              </p>
            </Card>
          ) : (
            <>
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900">Your TapCard is ready</h1>
                <p className="mt-2 text-[16px] leading-relaxed text-ink-600">
                  Have a look at {card.businessName}'s review page. Try tapping the stars and a suggested review — this is exactly what
                  your customers get when they scan your card.
                </p>
              </div>

              <Card className="p-5">
                <p className="text-[13px] font-semibold text-ink-800">Please check</p>
                <ul className="mt-3 space-y-2 text-[14px] text-ink-600">
                  {['Your business name and logo are right', 'The suggested reviews sound like your customers', 'The Google button opens your own listing'].map((t) => (
                    <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {t}</li>
                  ))}
                </ul>
              </Card>

              {asking ? (
                <Card className="p-5">
                  <Textarea
                    label="What would you like changed?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Please use our new logo, and change the second review phrase."
                    hint="Be as specific as you like — it goes straight to the person building your card."
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button loading={busy} disabled={note.trim().length < 4} onClick={() => decide('changes')}>Send my changes</Button>
                    <Button variant="ghost" onClick={() => setAsking(false)}>Cancel</Button>
                  </div>
                </Card>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button size="lg" loading={busy} onClick={() => decide('approve')} icon={<Check className="size-4" />}>Approve card</Button>
                  <Button size="lg" variant="secondary" onClick={() => setAsking(true)} icon={<MessageSquare className="size-4" />}>Request changes</Button>
                </div>
              )}
            </>
          )}

          {links && (
            <Card className="flex flex-wrap items-center gap-5 p-5">
              <div className="rounded-xl border border-ink-200 p-3"><QRImage text={links.review} size={104} /></div>
              <div className="min-w-[200px] flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-800"><QrCode className="size-3.5 text-brand-600" /> Your permanent link</p>
                <p className="mt-1 break-all font-mono text-[12px] text-ink-600">{links.review}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
                  Your printed QR and NFC cards will point here. We can change your details or review phrases later without reprinting
                  anything.
                </p>
                <a href={links.review} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 hover:underline">
                  Open it <ExternalLink className="size-3.5" />
                </a>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
