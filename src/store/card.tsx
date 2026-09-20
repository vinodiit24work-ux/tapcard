import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type { Appearance, CardData, SectionConfig, Template } from '@/types'
import type { ReviewSettings } from '@/features/builder/ReviewCopyEditor'
import { royalSpice } from '@/data/templates'
import { usePersistentState } from '@/hooks/usePersistentState'

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

interface CardCtx {
  card: CardData
  review: ReviewSettings
  patchReview: (p: Partial<ReviewSettings>) => void
  suggestions: string[]
  setSuggestions: (s: string[]) => void
  published: boolean
  dirty: boolean
  setCard: (c: CardData) => void
  patch: (p: Partial<CardData>) => void
  patchAppearance: (p: Partial<Appearance>) => void
  setSections: (s: SectionConfig[]) => void
  applyTemplate: (t: Template) => void
  publish: () => void
  unpublish: () => void
  save: () => void
  reset: () => void
}

const Ctx = createContext<CardCtx | null>(null)

/** Phase 1: the signed-in business's card lives in localStorage. */
export function CardProvider({ children }: { children: ReactNode }) {
  const [card, setCardRaw] = usePersistentState<CardData>('tc.card', royalSpice)
  const [review, setReview] = usePersistentState<ReviewSettings>('tc.review', DEFAULT_REVIEW_SETTINGS)
  const [suggestions, setSuggestions] = usePersistentState<string[]>('tc.suggestions', [
    'Amazing food and great service!',
    'Loved the food. Will definitely visit again!',
    'Great ambience and friendly staff.',
    'Excellent experience with quick service.',
  ])
  const [saved, setSaved] = usePersistentState<CardData>('tc.card.saved', royalSpice)
  const [published, setPublished] = usePersistentState<boolean>('tc.card.published', true)

  const setCard = useCallback((c: CardData) => setCardRaw(c), [setCardRaw])
  const patch = useCallback((p: Partial<CardData>) => setCardRaw((c) => ({ ...c, ...p })), [setCardRaw])
  const patchAppearance = useCallback((p: Partial<Appearance>) => setCardRaw((c) => ({ ...c, appearance: { ...c.appearance, ...p } })), [setCardRaw])
  const setSections = useCallback((sections: SectionConfig[]) => setCardRaw((c) => ({ ...c, sections })), [setCardRaw])
  const applyTemplate = useCallback(
    (t: Template) => setCardRaw((c) => ({ ...t.card, slug: c.slug, businessName: c.businessName === royalSpice.businessName ? t.card.businessName : c.businessName })),
    [setCardRaw],
  )
  const save = useCallback(() => setSaved(card), [card, setSaved])
  const reset = useCallback(() => {
    setCardRaw(royalSpice)
    setSaved(royalSpice)
  }, [setCardRaw, setSaved])

  const patchReview = useCallback((p: Partial<ReviewSettings>) => setReview((r) => ({ ...r, ...p })), [setReview])

  const dirty = useMemo(() => JSON.stringify(card) !== JSON.stringify(saved), [card, saved])
  const value = useMemo<CardCtx>(
    () => ({ card, review, patchReview, suggestions, setSuggestions, published, dirty, setCard, patch, patchAppearance, setSections, applyTemplate, save, reset, publish: () => { setPublished(true); setSaved(card) }, unpublish: () => setPublished(false) }),
    [card, review, patchReview, suggestions, setSuggestions, published, dirty, setCard, patch, patchAppearance, setSections, applyTemplate, save, reset, setPublished, setSaved],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useCard = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCard must be used within CardProvider')
  return c
}
