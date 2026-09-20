import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Appearance, CardData, SectionConfig, Template } from '@/types'
import type { ReviewSettings } from '@/features/builder/ReviewCopyEditor'
import type { Suggestion } from '@/types/review'
import { cardApi, ownerApi, type ServerCard } from '@/services/ownerApi'
import { royalSpice } from '@/data/templates'
import { useAuth } from '@/store/auth'

export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  headline: 'How was your experience?',
  description: 'Your feedback helps us serve you better.',
  suggestionsTitle: 'Share your experience',
  ownReviewTitle: 'Write your own review',
  submitLabel: 'Submit Review',
  thankYouTitle: 'Thank you!',
  thankYouMessage: 'Thank you for sharing your experience with us.',
  googleCtaLabel: 'Review on Google',
  askForName: true,
  showBusinessInfo: true,
}

type Status = 'loading' | 'ready' | 'none' | 'error'

interface CardCtx {
  card: CardData
  review: ReviewSettings
  suggestions: Suggestion[]
  status: Status
  published: boolean
  dirty: boolean
  saving: boolean
  /** Local edits, mirrored to the server by `save()`. */
  patch: (p: Partial<CardData>) => void
  patchAppearance: (p: Partial<Appearance>) => void
  patchReview: (p: Partial<ReviewSettings>) => void
  setSections: (s: SectionConfig[]) => void
  setCard: (c: CardData) => void
  applyTemplate: (t: Template) => void
  save: () => Promise<void>
  publish: () => Promise<void>
  unpublish: () => Promise<void>
  reload: () => void
  createBusiness: (b: { name: string; category: string; slug: string; tagline?: string; description?: string; templateKey?: string }) => Promise<void>
}

const Ctx = createContext<CardCtx | null>(null)

/** Maps the API shape onto the shape the Phase 1 components already expect. */
function toCardData(s: ServerCard): CardData {
  return {
    ...royalSpice,
    slug: s.slug,
    category: s.category,
    businessName: s.businessName,
    tagline: s.tagline,
    description: s.description,
    logo: s.logo,
    phone: s.phone,
    whatsapp: s.whatsapp,
    email: s.email,
    website: s.website,
    address: s.address,
    mapsUrl: s.mapsUrl,
    reviewUrl: s.reviewUrl,
    instagram: s.instagram,
    facebook: s.facebook,
    linkedin: s.linkedin,
    youtube: s.youtube,
    menuUrl: s.menuUrl,
    bookingUrl: s.bookingUrl,
    bookingLabel: s.bookingLabel,
    services: s.services,
    menu: s.menu,
    customLinks: s.customLinks,
    gallery: (s.gallery ?? []) as CardData['gallery'],
    hours: s.hours,
    sections: s.sections as SectionConfig[],
    appearance: { ...royalSpice.appearance, ...(s.appearance as object) } as Appearance,
  }
}

export function CardProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  const [card, setCardState] = useState<CardData>(royalSpice)
  const [saved, setSaved] = useState<CardData>(royalSpice)
  const [review, setReview] = useState<ReviewSettings>(DEFAULT_REVIEW_SETTINGS)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const reviewSaved = useRef<ReviewSettings>(DEFAULT_REVIEW_SETTINGS)

  const load = useCallback(() => {
    if (!user) {
      setStatus('none')
      return
    }
    setStatus('loading')
    cardApi
      .get()
      .then(async (s) => {
        if (!s) {
          setStatus('none')
          return
        }
        const data = toCardData(s)
        setCardState(data)
        setSaved(data)
        setPublished(s.status === 'PUBLISHED')
        // Review copy and suggestions live beside the card.
        const [copy, sugg] = await Promise.all([
          fetchReviewCopy(s),
          ownerApi.suggestions.list().catch(() => [] as Suggestion[]),
        ])
        setReview(copy)
        reviewSaved.current = copy
        setSuggestions(sugg)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [user])

  useEffect(() => {
    if (ready) load()
  }, [ready, load])

  const patch = useCallback((p: Partial<CardData>) => setCardState((c) => ({ ...c, ...p })), [])
  const patchAppearance = useCallback((p: Partial<Appearance>) => setCardState((c) => ({ ...c, appearance: { ...c.appearance, ...p } })), [])
  const patchReview = useCallback((p: Partial<ReviewSettings>) => setReview((r) => ({ ...r, ...p })), [])
  const setSections = useCallback((sections: SectionConfig[]) => setCardState((c) => ({ ...c, sections })), [])
  const setCard = useCallback((c: CardData) => setCardState(c), [])
  const applyTemplate = useCallback(
    (t: Template) => setCardState((c) => ({ ...t.card, slug: c.slug, businessName: c.businessName || t.card.businessName })),
    [],
  )

  /** Writes only what changed, so one edited field is not a nine-request save. */
  const save = useCallback(async () => {
    if (!user) return
    setSaving(true)
    try {
      const changed = <K extends keyof CardData>(k: K) => JSON.stringify(card[k]) !== JSON.stringify(saved[k])

      const businessFields = ['businessName', 'category', 'tagline', 'description', 'phone', 'whatsapp', 'email', 'website', 'address', 'mapsUrl', 'reviewUrl', 'logo'] as const
      const businessPatch: Record<string, unknown> = {}
      for (const f of businessFields) {
        if (changed(f)) businessPatch[f === 'businessName' ? 'name' : f === 'logo' ? 'logoUrl' : f] = card[f]
      }
      if (Object.keys(businessPatch).length) await cardApi.updateBusiness(businessPatch)

      if (changed('appearance') || changed('bookingUrl') || changed('bookingLabel') || changed('menuUrl')) {
        const { showBranding, ...appearance } = card.appearance
        await cardApi.updateCard({ appearance, bookingUrl: card.bookingUrl, bookingLabel: card.bookingLabel, menuUrl: card.menuUrl, showBranding })
      }
      if (changed('sections')) await cardApi.setSections(card.sections.map((s) => ({ id: s.id, enabled: s.enabled })))
      if (changed('instagram') || changed('facebook') || changed('linkedin') || changed('youtube')) {
        await cardApi.setSocial({ instagram: card.instagram, facebook: card.facebook, linkedin: card.linkedin, youtube: card.youtube })
      }
      if (changed('customLinks')) await cardApi.setLinks(card.customLinks.map(({ label, url }) => ({ label, url })))
      if (changed('services')) await cardApi.setServices(card.services.map(({ name, description, price }) => ({ name, description, price })))
      if (changed('menu')) await cardApi.setMenu(card.menu.map((m) => ({ name: m.name, category: m.category, price: m.price, description: m.description, veg: m.veg ?? true })))
      if (changed('hours')) await cardApi.setHours(card.hours)
      if (changed('slug')) await cardApi.setSlug(card.slug)

      if (JSON.stringify(review) !== JSON.stringify(reviewSaved.current)) {
        await ownerApi.copy.update({
          reviewHeadline: review.headline,
          reviewDescription: review.description,
          suggestionsTitle: review.suggestionsTitle,
          ownReviewTitle: review.ownReviewTitle,
          submitLabel: review.submitLabel,
          thankYouTitle: review.thankYouTitle,
          thankYouMessage: review.thankYouMessage,
          googleCtaLabel: review.googleCtaLabel,
          askForName: review.askForName,
          showBusinessInfo: review.showBusinessInfo,
        } as never)
        reviewSaved.current = review
      }

      setSaved(card)
    } finally {
      setSaving(false)
    }
  }, [card, saved, review, user])

  const publish = useCallback(async () => {
    await save()
    const s = await cardApi.publish()
    setPublished(s.status === 'PUBLISHED')
  }, [save])

  const unpublish = useCallback(async () => {
    const s = await cardApi.unpublish()
    setPublished(s.status === 'PUBLISHED')
  }, [])

  const createBusiness = useCallback(
    async (b: { name: string; category: string; slug: string; tagline?: string; description?: string; templateKey?: string }) => {
      const s = await cardApi.create(b)
      const data = toCardData(s)
      setCardState(data)
      setSaved(data)
      setPublished(s.status === 'PUBLISHED')
      setStatus('ready')
    },
    [],
  )

  const dirty = useMemo(
    () => JSON.stringify(card) !== JSON.stringify(saved) || JSON.stringify(review) !== JSON.stringify(reviewSaved.current),
    [card, saved, review],
  )

  const value = useMemo<CardCtx>(
    () => ({ card, review, suggestions, status, published, dirty, saving, patch, patchAppearance, patchReview, setSections, setCard, applyTemplate, save, publish, unpublish, reload: load, createBusiness }),
    [card, review, suggestions, status, published, dirty, saving, patch, patchAppearance, patchReview, setSections, setCard, applyTemplate, save, publish, unpublish, load, createBusiness],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** The review copy travels with the public review card, which needs no extra endpoint. */
async function fetchReviewCopy(s: ServerCard): Promise<ReviewSettings> {
  try {
    const API = import.meta.env.VITE_API_URL ?? ''
    const res = await fetch(`${API}/api/public/review/${encodeURIComponent(s.slug)}`, { cache: 'no-store' })
    if (!res.ok) return DEFAULT_REVIEW_SETTINGS
    const { card } = await res.json()
    return { ...card.copy, askForName: card.askForName, showBusinessInfo: card.showBusinessInfo }
  } catch {
    return DEFAULT_REVIEW_SETTINGS
  }
}

export const useCard = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCard must be used within CardProvider')
  return c
}
