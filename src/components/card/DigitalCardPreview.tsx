import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { BookOpen, CalendarCheck, ChevronDown, Download, ExternalLink, Globe, Link2, Mail, MapPin, Navigation, Phone, Star, UtensilsCrossed } from 'lucide-react'
import type { CardAction, CardData, SectionId } from '@/types'
import { alpha, covers, fonts, onColor, radii } from '@/lib/theme'
import { digitsOnly, initials } from '@/lib/format'
import { FacebookIcon, InstagramIcon, LinkedinIcon, WhatsappIcon, YoutubeIcon } from '@/components/icons/Brand'

interface Props {
  card: CardData
  /** When false (builder / gallery previews) links do not navigate. */
  interactive?: boolean
  onAction?: (action: CardAction, label: string) => void
  className?: string
}

const socialUrl = (kind: 'instagram' | 'facebook' | 'linkedin' | 'youtube', v: string) => {
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  const h = v.replace(/^@/, '')
  return { instagram: `https://instagram.com/${h}`, facebook: `https://facebook.com/${h}`, linkedin: `https://linkedin.com/in/${h}`, youtube: `https://youtube.com/@${h}` }[kind]
}

function vCard(c: CardData) {
  return ['BEGIN:VCARD', 'VERSION:3.0', `FN:${c.businessName}`, `ORG:${c.businessName}`, `TITLE:${c.tagline}`, c.phone && `TEL;TYPE=WORK,VOICE:${c.phone}`, c.email && `EMAIL:${c.email}`, c.website && `URL:${c.website}`, c.address && `ADR;TYPE=WORK:;;${c.address};;;;`, 'END:VCARD'].filter(Boolean).join('\r\n')
}

export function DigitalCardPreview({ card, interactive = false, onAction, className }: Props) {
  const a = card.appearance
  const dark = a.mode === 'dark'
  const r = radii[a.radius]
  const [hoursOpen, setHoursOpen] = useState(false)
  const [menuCat, setMenuCat] = useState<string>('All')

  const vars = useMemo(
    () =>
      ({
        '--c-bg': a.background,
        '--c-text': a.text,
        '--c-primary': a.primary,
        '--c-on': onColor(a.primary),
        '--c-surface': dark ? 'rgba(255,255,255,0.06)' : '#ffffff',
        '--c-border': dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
        '--c-muted': alpha(a.text, 0.62),
        '--c-soft': alpha(a.primary, dark ? 0.2 : 0.11),
        '--r-btn': r.btn,
        '--r-card': r.card,
        fontFamily: fonts[a.font].family,
        background: a.background,
        color: a.text,
      }) as CSSProperties,
    [a, dark, r],
  )

  const track = (action: CardAction, label: string) => (e: React.MouseEvent) => {
    onAction?.(action, label)
    if (!interactive) e.preventDefault()
  }

  const linkProps = (href: string, action: CardAction, label: string) => ({
    href: interactive ? href : '#',
    target: interactive && /^https?:/.test(href) ? '_blank' : undefined,
    rel: 'noopener noreferrer',
    onClick: track(action, label),
  })

  const btnBase = 'group flex w-full items-center gap-3 px-4 py-3.5 text-[15px] font-semibold transition active:scale-[0.985] focus-visible:outline-2'
  /** The primary action is filled; secondary actions stay quiet so one thing leads. */
  const btnStyle = (primary: boolean): CSSProperties => {
    const s: CSSProperties = { borderRadius: 'var(--r-btn)' }
    if (primary) {
      if (a.buttonStyle === 'outline') return { ...s, border: `1.5px solid ${a.primary}`, color: dark ? 'var(--c-text)' : 'var(--c-primary)', background: 'var(--c-soft)' }
      return { ...s, background: 'var(--c-primary)', color: 'var(--c-on)', boxShadow: `0 6px 16px -6px ${alpha(a.primary, 0.55)}` }
    }
    if (a.buttonStyle === 'outline') return { ...s, border: '1.5px solid var(--c-border)', color: 'var(--c-text)', background: 'transparent' }
    if (a.buttonStyle === 'soft') return { ...s, background: 'var(--c-soft)', color: 'var(--c-text)' }
    return { ...s, background: 'var(--c-surface)', color: 'var(--c-text)', border: '1px solid var(--c-border)', boxShadow: a.cardStyle === 'elevated' ? '0 4px 14px -10px rgba(15,23,42,0.35)' : 'none' }
  }
  const surface: CSSProperties =
    a.cardStyle === 'flat'
      ? {}
      : { background: 'var(--c-surface)', borderRadius: 'var(--r-card)', border: '1px solid var(--c-border)', boxShadow: a.cardStyle === 'elevated' ? '0 8px 24px -12px rgba(15,23,42,0.22)' : 'none' }

  const Btn = ({ href, action, label, icon, primary, sub }: { href: string; action: CardAction; label: string; icon: ReactNode; primary?: boolean; sub?: string }) => (
    <a {...linkProps(href, action, label)} className={btnBase} style={btnStyle(!!primary)}>
      <span className="flex size-6 shrink-0 items-center justify-center" style={primary ? undefined : { color: 'var(--c-primary)' }}>{icon}</span>
      <span className="min-w-0 flex-1 truncate text-left">
        {label}
        {sub && <span className="block text-xs font-normal opacity-75">{sub}</span>}
      </span>
      <ExternalLink className="size-4 opacity-0 transition group-hover:opacity-60" />
    </a>
  )

  const Section = ({ title, children }: { title?: string; children: ReactNode }) => (
    <section className="px-5 pt-5">
      {title && (
        <h3 className="mb-2.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--c-muted)', fontFamily: 'Inter, sans-serif' }}>
          {title}
        </h3>
      )}
      {children}
    </section>
  )

  const saveContact = (e: React.MouseEvent) => {
    onAction?.('custom', 'Save contact')
    e.preventDefault()
    if (!interactive) return
    const url = URL.createObjectURL(new Blob([vCard(card)], { type: 'text/vcard' }))
    const el = document.createElement('a')
    el.href = url
    el.download = `${card.slug}.vcf`
    el.click()
    URL.revokeObjectURL(url)
  }

  const radiusAvatar = a.avatarShape === 'circle' ? '9999px' : a.avatarShape === 'rounded' ? '22px' : '6px'
  const wa = digitsOnly(card.whatsapp)
  const menuCats = ['All', ...Array.from(new Set(card.menu.map((m) => m.category)))]
  const visibleMenu = menuCat === 'All' ? card.menu : card.menu.filter((m) => m.category === menuCat)
  const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]
  const socials = [
    { k: 'instagram' as const, v: card.instagram, I: InstagramIcon, label: 'Instagram' },
    { k: 'facebook' as const, v: card.facebook, I: FacebookIcon, label: 'Facebook' },
    { k: 'linkedin' as const, v: card.linkedin, I: LinkedinIcon, label: 'LinkedIn' },
    { k: 'youtube' as const, v: card.youtube, I: YoutubeIcon, label: 'YouTube' },
  ].filter((s) => s.v)

  const renderers: Record<SectionId, () => ReactNode> = {
    profile: () => null,
    contact: () => {
      const items = [
        card.phone && { href: `tel:${card.phone.replace(/\s/g, '')}`, action: 'phone' as const, label: 'Call', icon: <Phone className="size-5" />, sub: card.phone },
        card.email && { href: `mailto:${card.email}`, action: 'email' as const, label: 'Email', icon: <Mail className="size-5" />, sub: card.email },
        card.website && { href: card.website, action: 'website' as const, label: 'Website', icon: <Globe className="size-5" />, sub: card.website.replace(/^https?:\/\//, '') },
        card.mapsUrl && { href: card.mapsUrl, action: 'maps' as const, label: 'Directions', icon: <Navigation className="size-5" />, sub: card.address },
      ].filter(Boolean) as { href: string; action: CardAction; label: string; icon: ReactNode; sub: string }[]
      const today_ = card.hours.find((h) => h.day === today)
      return (
        <Section>
          <div className="space-y-2.5">
            {wa && <Btn primary href={`https://wa.me/${wa}`} action="whatsapp" label="WhatsApp" icon={<WhatsappIcon size={22} />} sub="Chat with us instantly" />}
            {items.map((i) => (
              <Btn key={i.label} {...i} sub={undefined} />
            ))}
          </div>
          {card.address && (
            <p className="mt-4 flex items-start gap-2 px-1 text-[13px] leading-snug" style={{ color: 'var(--c-muted)' }}>
              <MapPin className="mt-0.5 size-4 shrink-0" /> {card.address}
            </p>
          )}
          {card.hours.length > 0 && (
            <div className="mt-3" style={surface}>
              <button type="button" onClick={() => setHoursOpen((o) => !o)} aria-expanded={hoursOpen} className="flex w-full items-center justify-between px-4 py-3 text-[13px] font-semibold">
                <span>
                  Opening hours
                  {today_ && (
                    <span className="ml-2 font-normal" style={{ color: 'var(--c-muted)' }}>
                      {today_.closed ? 'Closed today' : `Today ${today_.open}–${today_.close}`}
                    </span>
                  )}
                </span>
                <ChevronDown className={`size-4 transition ${hoursOpen ? 'rotate-180' : ''}`} />
              </button>
              {hoursOpen && (
                <ul className="space-y-1.5 px-4 pb-3.5 text-[13px]">
                  {card.hours.map((h) => (
                    <li key={h.day} className="flex justify-between" style={{ fontWeight: h.day === today ? 700 : 400, color: h.day === today ? 'var(--c-text)' : 'var(--c-muted)' }}>
                      <span>{h.day}</span>
                      <span>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Section>
      )
    },
    social: () =>
      socials.length === 0 ? null : (
        <Section>
          <div className="flex flex-wrap justify-center gap-3">
            {socials.map(({ k, v, I, label }) => (
              <a key={k} aria-label={label} {...linkProps(socialUrl(k, v), 'social', label)} className="flex size-12 items-center justify-center transition hover:scale-105 active:scale-95" style={{ ...surface, borderRadius: r.btn === '999px' ? '999px' : 'var(--r-btn)', color: 'var(--c-text)' }}>
                <I size={22} />
              </a>
            ))}
          </div>
        </Section>
      ),
    menu: () =>
      !card.menuUrl && card.menu.length === 0 ? null : (
        <Section title="Menu">
          {card.menuUrl && <Btn href={card.menuUrl} action="menu" label="View Full Menu" icon={<UtensilsCrossed className="size-5" />} />}
          {card.menu.length > 0 && (
            <div className="mt-3" style={surface}>
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pt-3">
                {menuCats.map((c) => (
                  <button key={c} type="button" onClick={() => setMenuCat(c)} className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition" style={menuCat === c ? { background: 'var(--c-primary)', color: 'var(--c-on)' } : { background: 'var(--c-soft)', color: 'var(--c-text)' }}>
                    {c}
                  </button>
                ))}
              </div>
              <ul className="divide-y px-4 py-1" style={{ borderColor: 'var(--c-border)' }}>
                {visibleMenu.map((m) => (
                  <li key={m.id} className="flex items-start justify-between gap-3 py-3" style={{ borderColor: 'var(--c-border)' }}>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[14px] font-semibold">
                        <span className="inline-block size-2.5 shrink-0 rounded-[3px] border-2" style={{ borderColor: m.veg ? '#16a34a' : '#dc2626', background: m.veg ? '#16a34a' : '#dc2626', boxShadow: 'inset 0 0 0 2px var(--c-bg)' }} />
                        {m.name}
                      </p>
                      {m.description && (
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--c-muted)' }}>
                          {m.description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[14px] font-bold">{m.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      ),
    services: () =>
      card.services.length === 0 ? null : (
        <Section title="Services">
          <ul style={surface} className="divide-y px-4 py-1">
            {card.services.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3 py-3" style={{ borderColor: 'var(--c-border)' }}>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">{s.name}</p>
                  {s.description && (
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--c-muted)' }}>
                      {s.description}
                    </p>
                  )}
                </div>
                {s.price && <span className="shrink-0 text-[14px] font-bold">{s.price}</span>}
              </li>
            ))}
          </ul>
        </Section>
      ),
    booking: () =>
      !card.bookingUrl ? null : (
        <Section>
          <Btn primary href={card.bookingUrl} action="booking" label={card.bookingLabel || 'Book Now'} icon={<CalendarCheck className="size-5" />} />
        </Section>
      ),
    reviews: () =>
      !card.reviewUrl ? null : (
        <Section title="Reviews">
          <a {...linkProps(card.reviewUrl, 'review', 'Google Review')} className="flex items-center gap-3 p-4 transition active:scale-[0.985]" style={surface}>
            <span className="flex size-10 items-center justify-center rounded-full" style={{ background: 'var(--c-soft)' }}>
              <Star className="size-5" style={{ color: '#f5a623', fill: '#f5a623' }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-[15px] font-bold">
                4.8
                <span className="flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="size-3.5" style={{ color: '#f5a623', fill: i < 5 ? '#f5a623' : 'none' }} />
                  ))}
                </span>
              </span>
              <span className="block text-xs" style={{ color: 'var(--c-muted)' }}>
                Loved by 240+ customers · Leave a Google review
              </span>
            </span>
            <ExternalLink className="size-4" style={{ color: 'var(--c-muted)' }} />
          </a>
        </Section>
      ),
    gallery: () =>
      card.gallery.length === 0 ? null : (
        <Section title="Gallery">
          <div className="grid grid-cols-2 gap-2">
            {card.gallery.map((g, i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden" style={{ background: covers[g].css, borderRadius: 'calc(var(--r-card) * 0.6)' }} />
            ))}
          </div>
        </Section>
      ),
    links: () =>
      card.customLinks.length === 0 ? null : (
        <Section title="More">
          <div className="space-y-2.5">
            {card.customLinks.map((l) => (
              <Btn key={l.id} href={l.url} action="custom" label={l.label} icon={<Link2 className="size-5" />} />
            ))}
          </div>
        </Section>
      ),
  }

  const coverBg = a.coverImage ? `url(${a.coverImage}) center/cover` : covers[a.cover].css

  return (
    <article className={className} style={{ ...vars, minHeight: '100%' }} aria-label={`${card.businessName} digital card`}>
      <header className="relative">
        <div className="h-36 w-full" style={{ background: coverBg }} />
        <div className="-mt-12 flex flex-col items-center px-5 text-center">
          <div className="flex size-24 items-center justify-center overflow-hidden text-[30px] font-extrabold" style={{ background: card.logo ? '#fff' : 'var(--c-primary)', color: 'var(--c-on)', borderRadius: radiusAvatar, border: '4px solid var(--c-bg)', boxShadow: '0 8px 20px -8px rgba(15,23,42,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {card.logo ? <img src={card.logo} alt={`${card.businessName} logo`} className="size-full object-cover" /> : initials(card.businessName)}
          </div>
          <h1 className="mt-3 text-[26px] font-bold leading-tight" style={{ fontFamily: fonts[a.font].family, letterSpacing: '-0.02em' }}>
            {card.businessName || 'Your Business'}
          </h1>
          <p className="mt-0.5 text-[14px] font-medium" style={{ color: 'var(--c-muted)' }}>
            {card.tagline}
          </p>
          {card.description && (
            <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              {card.description}
            </p>
          )}
          <button type="button" onClick={saveContact} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold transition active:scale-95" style={{ ...surface, borderRadius: 'var(--r-btn)', color: 'var(--c-text)' }}>
            <Download className="size-4" /> Save contact
          </button>
        </div>
      </header>

      {card.sections.filter((s) => s.enabled && s.id !== 'profile').map((s) => <div key={s.id}>{renderers[s.id]()}</div>)}

      <footer className="px-5 pb-8 pt-8 text-center">
        {a.showBranding && (
          <a {...linkProps('https://tapcard.in', 'custom', 'Made with TapCard')} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold" style={{ background: 'var(--c-soft)', color: 'var(--c-muted)', fontFamily: 'Inter, sans-serif' }}>
            <BookOpen className="size-3" /> Made with TapCard
          </a>
        )}
      </footer>
    </article>
  )
}
