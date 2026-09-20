import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Eye, ExternalLink, Globe, Layers, Maximize2, Monitor, Plus, RotateCcw, Save, Smartphone, Tablet, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Segmented, Textarea } from '@/components/ui/Form'
import { Badge } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Feedback'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { DigitalCardPreview } from '@/components/card/DigitalCardPreview'
import { SectionManager, sectionMeta } from '@/features/builder/SectionManager'
import { AppearanceEditor } from '@/features/builder/AppearanceEditor'
import { ReviewCopyEditor } from '@/features/builder/ReviewCopyEditor'
import { ReviewExperience } from '@/features/review/ReviewExperience'
import type { ReviewCardData } from '@/types/review'
import { useCard } from '@/store/card'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cardUrl, reviewUrl, slugify } from '@/lib/format'
import { covers } from '@/lib/theme'
import { cn } from '@/lib/cn'
import type { MenuItem, SectionId, ServiceItem } from '@/types'

type Pane = SectionId | 'appearance' | 'review'
const panes: { id: Pane; label: string }[] = [
  { id: 'review', label: 'Review Page' },
  { id: 'profile', label: 'Profile' },
  { id: 'contact', label: 'Contact' },
  { id: 'social', label: 'Social' },
  { id: 'menu', label: 'Menu' },
  { id: 'services', label: 'Services' },
  { id: 'booking', label: 'Booking' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'links', label: 'Custom Links' },
  { id: 'appearance', label: 'Appearance' },
]

const rid = () => Math.random().toString(36).slice(2, 9)

export function CardBuilder() {
  useDocumentTitle('Customize your review card')
  const { card, review, patchReview, suggestions, patch, patchAppearance, setSections, published, dirty, save, publish } = useCard()
  const toast = useToast()
  const [pane, setPane] = useState<Pane>('review')
  const [previewMode, setPreviewMode] = useState<'review' | 'card'>('review')
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [full, setFull] = useState(false)
  const [busy, setBusy] = useState(false)

  const onSave = () => {
    setBusy(true)
    setTimeout(() => {
      save()
      setBusy(false)
      toast('Changes saved')
    }, 500)
  }
  const onPublish = () => {
    setBusy(true)
    setTimeout(() => {
      publish()
      setBusy(false)
      toast('Your card is live')
    }, 700)
  }

  const setService = (id: string, p: Partial<ServiceItem>) => patch({ services: card.services.map((s) => (s.id === id ? { ...s, ...p } : s)) })
  const setMenuItem = (id: string, p: Partial<MenuItem>) => patch({ menu: card.menu.map((m) => (m.id === id ? { ...m, ...p } : m)) })

  const size = { mobile: { w: 320, h: 620 }, tablet: { w: 420, h: 660 }, desktop: { w: 520, h: 660 } }[device]

  const editor = (
    <div className="space-y-5">
      {pane === 'profile' && (
        <>
          <Input label="Business name" value={card.businessName} onChange={(e) => patch({ businessName: e.target.value })} placeholder="Royal Spice" />
          <Input label="Card link" value={card.slug} onChange={(e) => patch({ slug: slugify(e.target.value) })} hint={cardUrl(card.slug || 'your-business')} leading={<span className="text-[13px]">tapcard.in/</span>} className="[&_input]:pl-[88px]" />
          <Input label="Tagline" value={card.tagline} onChange={(e) => patch({ tagline: e.target.value })} placeholder="Restaurant & Cafe" />
          <Textarea label="Description" value={card.description} onChange={(e) => patch({ description: e.target.value })} hint={`${card.description.length}/200 characters`} maxLength={200} />
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-700">Logo</p>
            <div className="flex items-center gap-3">
              {card.logo ? <img src={card.logo} alt="Logo" className="size-14 rounded-xl object-cover ring-1 ring-ink-200" /> : <div className="flex size-14 items-center justify-center rounded-xl bg-ink-100 text-[11px] font-medium text-ink-400">None</div>}
              <label className="cursor-pointer rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50">
                Upload
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  if (f.size > 2 * 1024 * 1024) return toast('Image must be under 2MB', 'error')
                  const r = new FileReader()
                  r.onload = () => { patch({ logo: String(r.result) }); toast('Logo updated') }
                  r.readAsDataURL(f)
                }} />
              </label>
              {card.logo && <Button size="sm" variant="danger" onClick={() => patch({ logo: undefined })}>Remove</Button>}
            </div>
          </div>
        </>
      )}

      {pane === 'contact' && (
        <>
          <Input label="Phone" value={card.phone} onChange={(e) => patch({ phone: e.target.value })} placeholder="+91 98765 43210" />
          <Input label="WhatsApp" value={card.whatsapp} onChange={(e) => patch({ whatsapp: e.target.value })} hint="Country code + number, digits only" placeholder="919876543210" />
          <Input label="Email" type="email" value={card.email} onChange={(e) => patch({ email: e.target.value })} placeholder="hello@business.in" />
          <Input label="Website" value={card.website} onChange={(e) => patch({ website: e.target.value })} placeholder="https://business.in" leading={<Globe className="size-4" />} />
          <Textarea label="Address" value={card.address} onChange={(e) => patch({ address: e.target.value })} className="[&_textarea]:min-h-16" />
          <Input label="Google Maps link" value={card.mapsUrl} onChange={(e) => patch({ mapsUrl: e.target.value })} placeholder="https://maps.google.com/..." />
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-700">Opening hours</p>
            <div className="space-y-1.5">
              {card.hours.map((h, i) => (
                <div key={h.day} className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-2.5 py-2">
                  <span className="w-9 text-[12px] font-semibold text-ink-700">{h.day}</span>
                  <input type="time" value={h.open} disabled={h.closed} onChange={(e) => patch({ hours: card.hours.map((x, j) => (i === j ? { ...x, open: e.target.value } : x)) })} className="w-[84px] rounded-md border border-ink-200 px-1.5 py-1 text-[12px] disabled:bg-ink-50 disabled:text-ink-400" />
                  <span className="text-ink-400">–</span>
                  <input type="time" value={h.close} disabled={h.closed} onChange={(e) => patch({ hours: card.hours.map((x, j) => (i === j ? { ...x, close: e.target.value } : x)) })} className="w-[84px] rounded-md border border-ink-200 px-1.5 py-1 text-[12px] disabled:bg-ink-50 disabled:text-ink-400" />
                  <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-[11px] text-ink-500">
                    <input type="checkbox" checked={!!h.closed} onChange={(e) => patch({ hours: card.hours.map((x, j) => (i === j ? { ...x, closed: e.target.checked } : x)) })} className="size-3.5 rounded border-ink-300 text-brand-600" /> Closed
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {pane === 'social' && (
        <>
          <Input label="Instagram" value={card.instagram} onChange={(e) => patch({ instagram: e.target.value })} placeholder="yourbusiness" leading={<span className="text-[13px]">@</span>} />
          <Input label="Facebook" value={card.facebook} onChange={(e) => patch({ facebook: e.target.value })} placeholder="yourbusiness" />
          <Input label="LinkedIn" value={card.linkedin} onChange={(e) => patch({ linkedin: e.target.value })} placeholder="your-profile" />
          <Input label="YouTube" value={card.youtube} onChange={(e) => patch({ youtube: e.target.value })} placeholder="yourchannel" />
        </>
      )}

      {pane === 'menu' && (
        <>
          <Input label="Full menu link" value={card.menuUrl} onChange={(e) => patch({ menuUrl: e.target.value })} placeholder="https://..." hint="Optional — links out to a PDF or page" />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-medium text-ink-700">Menu items ({card.menu.length})</p>
              <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} onClick={() => patch({ menu: [...card.menu, { id: rid(), name: '', category: 'Mains', price: '', veg: true }] })}>Add</Button>
            </div>
            <div className="space-y-2">
              {card.menu.map((m) => (
                <div key={m.id} className="rounded-xl border border-ink-200 bg-white p-3">
                  <div className="flex gap-2">
                    <input value={m.name} onChange={(e) => setMenuItem(m.id, { name: e.target.value })} placeholder="Item name" className="min-w-0 flex-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[13px] focus:border-brand-500 focus:outline-none" />
                    <input value={m.price} onChange={(e) => setMenuItem(m.id, { price: e.target.value })} placeholder="₹0" className="w-20 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[13px] focus:border-brand-500 focus:outline-none" />
                    <button aria-label="Delete item" onClick={() => patch({ menu: card.menu.filter((x) => x.id !== m.id) })} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input value={m.category} onChange={(e) => setMenuItem(m.id, { category: e.target.value })} placeholder="Category" className="w-28 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[12px] focus:border-brand-500 focus:outline-none" />
                    <input value={m.description ?? ''} onChange={(e) => setMenuItem(m.id, { description: e.target.value })} placeholder="Short description" className="min-w-0 flex-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[12px] focus:border-brand-500 focus:outline-none" />
                    <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] text-ink-600">
                      <input type="checkbox" checked={!!m.veg} onChange={(e) => setMenuItem(m.id, { veg: e.target.checked })} className="size-3.5 rounded border-ink-300 text-emerald-600" /> Veg
                    </label>
                  </div>
                </div>
              ))}
              {card.menu.length === 0 && <p className="rounded-xl border border-dashed border-ink-200 py-6 text-center text-[13px] text-ink-400">No items yet. Add your first dish.</p>}
            </div>
          </div>
        </>
      )}

      {pane === 'services' && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-medium text-ink-700">Services ({card.services.length})</p>
            <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} onClick={() => patch({ services: [...card.services, { id: rid(), name: '', price: '' }] })}>Add</Button>
          </div>
          <div className="space-y-2">
            {card.services.map((s) => (
              <div key={s.id} className="rounded-xl border border-ink-200 bg-white p-3">
                <div className="flex gap-2">
                  <input value={s.name} onChange={(e) => setService(s.id, { name: e.target.value })} placeholder="Service name" className="min-w-0 flex-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[13px] focus:border-brand-500 focus:outline-none" />
                  <input value={s.price ?? ''} onChange={(e) => setService(s.id, { price: e.target.value })} placeholder="₹0" className="w-24 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[13px] focus:border-brand-500 focus:outline-none" />
                  <button aria-label="Delete service" onClick={() => patch({ services: card.services.filter((x) => x.id !== s.id) })} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
                </div>
                <input value={s.description ?? ''} onChange={(e) => setService(s.id, { description: e.target.value })} placeholder="Short description" className="mt-2 w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-[12px] focus:border-brand-500 focus:outline-none" />
              </div>
            ))}
            {card.services.length === 0 && <p className="rounded-xl border border-dashed border-ink-200 py-6 text-center text-[13px] text-ink-400">No services yet.</p>}
          </div>
        </div>
      )}

      {pane === 'booking' && (
        <>
          <Input label="Button label" value={card.bookingLabel} onChange={(e) => patch({ bookingLabel: e.target.value })} placeholder="Book Appointment" />
          <Input label="Booking link" value={card.bookingUrl} onChange={(e) => patch({ bookingUrl: e.target.value })} placeholder="https://cal.com/yourname" hint="Cal.com, Calendly, your own form — or a WhatsApp link" />
        </>
      )}

      {pane === 'reviews' && (
        <>
          <Input label="Google review link" value={card.reviewUrl} onChange={(e) => patch({ reviewUrl: e.target.value })} placeholder="https://g.page/r/..." />
          <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-[13px] leading-relaxed text-ink-600">
            <p className="font-semibold text-ink-800">Where do I find this link?</p>
            <p className="mt-1.5">Open your Google Business Profile → Read reviews → Get more reviews → copy the short link.</p>
          </div>
        </>
      )}

      {pane === 'gallery' && (
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-700">Gallery tiles ({card.gallery.length})</p>
          <p className="mb-3 text-[12px] text-ink-500">Phase 1 uses styled placeholders; image upload is wired to storage in a later phase.</p>
          <div className="grid grid-cols-2 gap-2">
            {card.gallery.map((g, i) => (
              <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl" style={{ background: covers[g].css }}>
                <button aria-label="Remove tile" onClick={() => patch({ gallery: card.gallery.filter((_, j) => j !== i) })} className="absolute right-1.5 top-1.5 rounded-lg bg-white/90 p-1 text-ink-600 opacity-0 transition group-hover:opacity-100 hover:text-red-600"><X className="size-3.5" /></button>
              </div>
            ))}
            <button onClick={() => patch({ gallery: [...card.gallery, 'aurora'] })} className="flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed border-ink-300 text-ink-400 hover:border-brand-400 hover:text-brand-600"><Plus className="size-5" /></button>
          </div>
        </div>
      )}

      {pane === 'links' && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-medium text-ink-700">Custom buttons ({card.customLinks.length})</p>
            <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} onClick={() => patch({ customLinks: [...card.customLinks, { id: rid(), label: '', url: '' }] })}>Add</Button>
          </div>
          <div className="space-y-2">
            {card.customLinks.map((l) => (
              <div key={l.id} className="flex gap-2 rounded-xl border border-ink-200 bg-white p-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <input value={l.label} onChange={(e) => patch({ customLinks: card.customLinks.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)) })} placeholder="Button label" className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-[13px] focus:border-brand-500 focus:outline-none" />
                  <input value={l.url} onChange={(e) => patch({ customLinks: card.customLinks.map((x) => (x.id === l.id ? { ...x, url: e.target.value } : x)) })} placeholder="https://" className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-[12px] focus:border-brand-500 focus:outline-none" />
                </div>
                <button aria-label="Delete link" onClick={() => patch({ customLinks: card.customLinks.filter((x) => x.id !== l.id) })} className="self-start rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
              </div>
            ))}
            {card.customLinks.length === 0 && <p className="rounded-xl border border-dashed border-ink-200 py-6 text-center text-[13px] text-ink-400">No custom buttons yet.</p>}
          </div>
        </div>
      )}

      {pane === 'appearance' && <AppearanceEditor appearance={card.appearance} onChange={patchAppearance} />}

      {pane === 'review' && (
        <>
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-[13px] leading-relaxed text-brand-900">
            This is what opens when a customer scans your QR or taps your NFC card. Manage the suggestions themselves in{' '}
            <Link to="/dashboard/suggested-reviews" className="font-semibold underline">Suggested Reviews</Link>.
          </div>
          <Input label="Google review link" value={card.reviewUrl} onChange={(e) => patch({ reviewUrl: e.target.value })} placeholder="https://g.page/r/..." hint="Where the “Review on Google” button sends customers after they submit." />
          <ReviewCopyEditor value={review} onChange={patchReview} />
        </>
      )}
    </div>
  )

  /** The builder previews the real customer component, fed from the working draft. */
  const reviewPreviewCard: ReviewCardData = {
    slug: card.slug,
    businessName: card.businessName,
    tagline: card.tagline,
    category: card.category,
    logo: card.logo,
    appearance: card.appearance,
    copy: review,
    askForName: review.askForName,
    showBusinessInfo: review.showBusinessInfo,
    showBranding: card.appearance.showBranding,
    googleReviewUrl: card.reviewUrl,
    suggestions: suggestions.map((text, i) => ({ id: `preview-${i}`, text })),
    business: review.showBusinessInfo
      ? { phone: card.phone, whatsapp: card.whatsapp, website: card.website, address: card.address, mapsUrl: card.mapsUrl, instagram: card.instagram, facebook: card.facebook }
      : null,
  }

  const preview = previewMode === 'review' ? <ReviewExperience card={reviewPreviewCard} /> : <DigitalCardPreview card={card} />

  return (
    <div className="-m-4 flex min-h-[calc(100dvh-4rem)] flex-col sm:-m-6 lg:-m-8">
      {/* Toolbar */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 border-b border-ink-200 bg-white/90 px-4 py-2.5 backdrop-blur sm:px-6">
        <div className="mr-auto flex min-w-0 items-center gap-3">
          <h1 className="truncate font-display text-[15px] font-bold text-ink-900">Review card builder</h1>
          {published ? <Badge tone="green"><span className="size-1.5 rounded-full bg-current" /> Published</Badge> : <Badge tone="amber">Draft</Badge>}
          {dirty && <span className="hidden text-[12px] text-ink-500 sm:inline">Unsaved changes</span>}
        </div>
        <div className="hidden lg:block">
          <Segmented value={device} onChange={setDevice} className="w-[220px]" options={[{ value: 'mobile', label: <Smartphone className="mx-auto size-4" /> }, { value: 'tablet', label: <Tablet className="mx-auto size-4" /> }, { value: 'desktop', label: <Monitor className="mx-auto size-4" /> }]} />
        </div>
        <Button size="sm" variant="ghost" className="lg:hidden" icon={<Eye className="size-4" />} onClick={() => setFull(true)}>Preview</Button>
        <Button size="sm" variant="secondary" icon={<Save className="size-4" />} loading={busy} onClick={onSave} disabled={!dirty}>Save</Button>
        <Button size="sm" icon={<Check className="size-4" />} loading={busy} onClick={onPublish}>{published ? 'Update live card' : 'Publish'}</Button>
      </div>

      <div className="grid flex-1 lg:grid-cols-[248px_minmax(0,1fr)_auto]">
        {/* Sections sidebar */}
        <aside className="border-b border-ink-200 bg-white p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-400"><Layers className="size-3.5" /> Sections</h2>
            <button onClick={() => { setSections(card.sections.map((s) => ({ ...s, enabled: true }))); toast('All sections shown') }} className="text-[11px] font-medium text-brand-700 hover:underline">Show all</button>
          </div>
          <SectionManager sections={card.sections} onChange={setSections} onEdit={(id) => setPane(id)} />
          <button onClick={() => setPane('appearance')} className={cn('mt-4 flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition-colors', pane === 'appearance' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50')}>
            <span className="size-4 rounded bg-gradient-to-br from-brand-500 to-accent-500" /> Appearance
          </button>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-400">Drag to reorder. Hidden sections stay saved — they just do not show on your card.</p>
        </aside>

        {/* Editor */}
        <section className="min-w-0 bg-ink-50 p-4 sm:p-6">
          <div className="no-scrollbar mb-5 flex gap-1.5 overflow-x-auto">
            {panes.map((p) => (
              <button key={p.id} onClick={() => setPane(p.id)} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors', pane === p.id ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-100')}>{p.label}</button>
            ))}
          </div>
          <div className="mx-auto max-w-xl rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink-900">{pane === 'appearance' ? 'Appearance' : pane === 'review' ? 'Review Page' : sectionMeta[pane].label}</h2>
              {pane !== 'appearance' && pane !== 'review' && pane !== 'profile' && (
                <button onClick={() => setSections(card.sections.map((s) => (s.id === pane ? { ...s, enabled: !s.enabled } : s)))} className="text-[12px] font-semibold text-brand-700 hover:underline">
                  {card.sections.find((s) => s.id === pane)?.enabled ? 'Hide this section' : 'Show this section'}
                </button>
              )}
            </div>
            {editor}
          </div>
        </section>

        {/* Live preview */}
        <aside className="hidden border-l border-ink-200 bg-white p-6 lg:block">
          <div className="sticky top-32 flex flex-col items-center">
            <div className="mb-2 w-full">
              <Segmented value={previewMode} onChange={setPreviewMode} options={[{ value: 'review', label: 'Review page' }, { value: 'card', label: 'Contact card' }]} />
            </div>
            <div className="mb-3 flex w-full items-center justify-between gap-3">
              <span className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Live preview</span>
              <div className="flex gap-1">
                <button aria-label="Expand preview" onClick={() => setFull(true)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"><Maximize2 className="size-4" /></button>
                <a aria-label="Open the live page" href={previewMode === 'review' ? `/review/${card.slug}` : `/${card.slug}`} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"><ExternalLink className="size-4" /></a>
              </div>
            </div>
            {device === 'mobile' ? (
              <PhoneFrame height={size.h} width={size.w}>{preview}</PhoneFrame>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-ink-200 shadow-card" style={{ width: size.w }}>
                <div className="no-scrollbar overflow-y-auto" style={{ height: size.h }}>{preview}</div>
              </div>
            )}
            <div className="mt-4 flex w-full items-center gap-2 rounded-xl bg-ink-50 px-3 py-2">
              <Globe className="size-3.5 shrink-0 text-ink-400" />
              <span className="truncate font-mono text-[11px] text-ink-600">{previewMode === 'review' ? reviewUrl(card.slug) : cardUrl(card.slug)}</span>
            </div>
            <Link to="/dashboard/qr" className="mt-3 text-[13px] font-medium text-brand-700 hover:underline">Get your QR code →</Link>
          </div>
        </aside>
      </div>

      <Modal open={full} onClose={() => setFull(false)} size="sm" title="Card preview" footer={<><Button variant="secondary" icon={<RotateCcw className="size-4" />} onClick={() => setFull(false)}>Back to editing</Button></>}>
        <div className="flex justify-center"><PhoneFrame height={620} width={300}>{preview}</PhoneFrame></div>
      </Modal>
    </div>
  )
}
