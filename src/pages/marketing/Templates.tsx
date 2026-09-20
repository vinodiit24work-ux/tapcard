import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Search } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Modal, EmptyState } from '@/components/ui/Feedback'
import { Section, SectionHead } from '@/features/marketing/Bits'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { DigitalCardPreview } from '@/components/card/DigitalCardPreview'
import { templates } from '@/data/templates'
import { covers } from '@/lib/theme'
import { cn } from '@/lib/cn'
import { useCard } from '@/store/card'
import { useAuth } from '@/store/auth'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { Template } from '@/types'

const cats = ['All', ...Array.from(new Set(templates.map((t) => t.category)))]

export function Templates() {
  useDocumentTitle('Templates')
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Template | null>(null)
  const { applyTemplate } = useCard()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const shown = useMemo(
    () => templates.filter((t) => (cat === 'All' || t.category === cat) && (t.name + t.category + t.description).toLowerCase().includes(q.toLowerCase())),
    [cat, q],
  )

  const use = (t: Template) => {
    applyTemplate(t)
    toast(`${t.name} applied to your card`)
    navigate(user ? '/dashboard/card-builder' : '/register')
  }

  return (
    <>
      <Section className="pb-4">
        <SectionHead eyebrow="Templates" title="Ten designs, built for how each business sells" description="Every template is a real card — open a preview, then make it yours in the builder." />
      </Section>

      <div className="container-page pb-20">
        <div className="sticky top-16 z-20 -mx-4 mb-8 flex flex-col gap-3 border-b border-ink-200 bg-white/90 px-4 py-3 backdrop-blur sm:flex-row sm:items-center">
          <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={cn('shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors', cat === c ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200')}>{c}</button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates" aria-label="Search templates" className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
          </div>
        </div>

        {shown.length === 0 ? (
          <EmptyState title="No templates match that" description="Try a different category or clear your search." action={<Button variant="secondary" onClick={() => { setQ(''); setCat('All') }}>Clear filters</Button>} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((t) => (
              <article key={t.id} className="group overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all hover:-translate-y-1 hover:shadow-card">
                {/* The card preview contains its own links, so the click target is an overlay
                    button rather than a wrapper — nested interactive elements are invalid. */}
                <div className="relative h-60 overflow-hidden" style={{ background: covers[t.card.appearance.cover].css }}>
                  <div aria-hidden className="absolute inset-x-0 bottom-0 top-8 mx-auto w-[176px] overflow-hidden rounded-t-2xl bg-white shadow-float transition-transform duration-300 group-hover:-translate-y-2">
                    <div className="pointer-events-none origin-top-left scale-[0.55]" style={{ width: 320 }}>
                      <DigitalCardPreview card={t.card} />
                    </div>
                  </div>
                  {t.popular && <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ink-800">Popular</span>}
                  <button onClick={() => setOpen(t)} aria-label={`Preview ${t.name}`} className="absolute inset-0 z-20 size-full cursor-pointer focus-visible:outline-offset-[-3px]" />
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-[15px] font-bold text-ink-900">{t.name}</h3>
                    <p className="text-[13px] text-ink-500">{t.category}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => use(t)}>Use</Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} size="lg" title={open?.name} description={`${open?.category} template`} footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(null)}>Close</Button>
          {open && <Button onClick={() => use(open)} iconRight={<ArrowRight className="size-4" />}>Use this template</Button>}
        </>
      }>
        {open && (
          <div className="grid gap-8 sm:grid-cols-[auto_minmax(0,1fr)]">
            <PhoneFrame height={520} width={280}><DigitalCardPreview card={open.card} interactive={false} /></PhoneFrame>
            <div>
              <p className="text-[15px] leading-relaxed text-ink-600">{open.description}</p>
              <h4 className="mt-6 text-[13px] font-bold uppercase tracking-wider text-ink-400">Sections included</h4>
              <ul className="mt-3 space-y-2">
                {open.card.sections.filter((s) => s.enabled).map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-sm capitalize text-ink-700"><Check className="size-4 text-emerald-600" /> {s.id}</li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl bg-ink-50 p-4 text-[13px] text-ink-600">Everything here is editable — colours, fonts, buttons and sections.</div>
            </div>
          </div>
        )}
      </Modal>

      <Section className="border-t border-ink-200 bg-ink-50/60">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-ink-900">Nothing quite right?</h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-ink-500">Start from any template and change every colour, font and section in the builder.</p>
          <ButtonLink to="/register" className="mt-7" size="lg">Start from scratch</ButtonLink>
        </div>
      </Section>
    </>
  )
}
