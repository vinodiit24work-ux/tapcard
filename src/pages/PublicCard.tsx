import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QrCode, Share2 } from 'lucide-react'
import { DigitalCardPreview } from '@/components/card/DigitalCardPreview'
import { QRImage } from '@/components/card/QRImage'
import { Modal } from '@/components/ui/Feedback'
import { Button, ButtonLink } from '@/components/ui/Button'
import { LogoMark } from '@/components/ui/Logo'
import { publicCards } from '@/data/templates'
import { useCard } from '@/store/card'
import { useToast } from '@/components/ui/Toast'
import { cardUrl } from '@/lib/format'
import type { CardAction, CardData } from '@/types'

function Head({ card }: { card: CardData }) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = `${card.businessName} — ${card.tagline}`
    const set = (sel: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector(sel) as HTMLMetaElement | HTMLLinkElement | null
      if (!el) {
        el = document.createElement(sel.startsWith('link') ? 'link' : 'meta')
        document.head.appendChild(el)
      }
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v))
      return el
    }
    const desc = card.description || `${card.businessName} — ${card.tagline}. Call, WhatsApp, directions and more.`
    set('meta[name="description"]', { name: 'description', content: desc })
    set('meta[property="og:title"]', { property: 'og:title', content: card.businessName })
    set('meta[property="og:description"]', { property: 'og:description', content: desc })
    set('meta[property="og:type"]', { property: 'og:type', content: 'profile' })
    set('meta[property="og:url"]', { property: 'og:url', content: cardUrl(card.slug) })
    set('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    set('link[rel="canonical"]', { rel: 'canonical', href: cardUrl(card.slug) })
    set('meta[name="theme-color"]', { name: 'theme-color', content: card.appearance.primary })

    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: card.businessName,
      description: desc,
      telephone: card.phone,
      email: card.email,
      url: cardUrl(card.slug),
      address: { '@type': 'PostalAddress', streetAddress: card.address },
    })
    document.head.appendChild(ld)
    return () => {
      document.title = prevTitle
      ld.remove()
    }
  }, [card])
  return null
}

export function PublicCard() {
  const { slug = '' } = useParams()
  const { card: myCard, published } = useCard()
  const toast = useToast()
  const [qr, setQr] = useState(false)

  const card = useMemo(() => (myCard.slug === slug && published ? myCard : publicCards[slug]), [slug, myCard, published])

  useEffect(() => {
    if (card) console.info('[analytics] PAGE_VIEW', { slug, source: new URLSearchParams(location.search).get('src') ?? 'direct' })
  }, [card, slug])

  if (!card)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-6 text-center">
        <LogoMark className="size-12" />
        <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">This card does not exist</h1>
        <p className="mt-2 max-w-sm text-[15px] text-ink-500">
          Nothing is published at <span className="font-mono text-ink-700">tapcard.in/{slug}</span>. Check the link, or claim it as your own.
        </p>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <ButtonLink to="/register" size="lg">Claim this link</ButtonLink>
          <ButtonLink to="/" size="lg" variant="secondary">Go to TapCard</ButtonLink>
        </div>
      </div>
    )

  const track = (action: CardAction, label: string) => {
    console.info('[analytics]', action.toUpperCase() + '_CLICK', { slug, label })
  }

  const share = async () => {
    const url = cardUrl(card.slug)
    try {
      if (navigator.share) await navigator.share({ title: card.businessName, url })
      else {
        await navigator.clipboard.writeText(url)
        toast('Link copied')
      }
    } catch {
      /* dismissed */
    }
  }

  return (
    <div className="min-h-dvh" style={{ background: card.appearance.background }}>
      <Head card={card} />
      <div className="mx-auto min-h-dvh w-full max-w-[460px] pb-20 shadow-[0_0_80px_-20px_rgba(15,23,42,0.18)]">
        <DigitalCardPreview card={card} interactive onAction={track} />
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-ink-900/90 p-1 text-white shadow-float backdrop-blur">
          <button onClick={share} className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold hover:bg-white/10"><Share2 className="size-4" /> Share</button>
          <span className="h-5 w-px bg-white/20" />
          <button onClick={() => setQr(true)} className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold hover:bg-white/10"><QrCode className="size-4" /> QR</button>
          <span className="h-5 w-px bg-white/20" />
          <Link to="/register" className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-brand-200 hover:bg-white/10">Get yours</Link>
        </div>
      </div>

      <Modal open={qr} onClose={() => setQr(false)} title={card.businessName} description="Scan to open this card" size="sm" footer={<Button variant="secondary" onClick={() => setQr(false)}>Close</Button>}>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl border border-ink-200 p-4"><QRImage text={cardUrl(card.slug)} size={200} options={{ fg: '#0f1729' }} /></div>
          <p className="break-all text-center font-mono text-[13px] text-ink-600">{cardUrl(card.slug)}</p>
        </div>
      </Modal>
    </div>
  )
}
