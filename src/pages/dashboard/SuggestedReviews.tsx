import { useCallback, useEffect, useState } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, Eye, EyeOff, GripVertical, Lightbulb, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, Badge } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/Table'
import { EmptyState, ErrorState, Modal, Skeleton } from '@/components/ui/Feedback'
import { Textarea } from '@/components/ui/Form'
import { PhoneFrame } from '@/components/card/PhoneFrame'
import { ReviewExperience } from '@/features/review/ReviewExperience'
import { ownerApi } from '@/services/ownerApi'
import { reviewApi } from '@/services/reviewApi'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useCard } from '@/store/card'
import { cn } from '@/lib/cn'
import type { ReviewCardData, Suggestion } from '@/types/review'

const STARTERS = [
  'Amazing food and great service!',
  'Loved it. Will definitely visit again!',
  'Great ambience and friendly staff.',
  'Excellent experience with quick service.',
  'Highly recommend to anyone in the area.',
]

function Row({ s, onToggle, onEdit, onDelete }: { s: Suggestion; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-start gap-2 rounded-xl border bg-white p-3', isDragging ? 'z-10 border-brand-400 shadow-float' : 'border-ink-200', !s.enabled && 'bg-ink-50')}
    >
      <button {...attributes} {...listeners} aria-label="Reorder" className="mt-0.5 cursor-grab rounded p-1 text-ink-400 hover:bg-ink-100 active:cursor-grabbing">
        <GripVertical className="size-4" />
      </button>
      <p className={cn('min-w-0 flex-1 text-[14px] leading-snug', s.enabled ? 'text-ink-800' : 'text-ink-400 line-through')}>{s.text}</p>
      {typeof s.useCount === 'number' && s.useCount > 0 && (
        <Badge tone="neutral" className="mt-0.5 shrink-0">
          used {s.useCount}×
        </Badge>
      )}
      <div className="flex shrink-0 gap-0.5">
        <button onClick={onToggle} aria-label={s.enabled ? 'Hide from customers' : 'Show to customers'} title={s.enabled ? 'Shown to customers' : 'Hidden'} className={cn('rounded-lg p-1.5', s.enabled ? 'text-emerald-600 hover:bg-emerald-50' : 'text-ink-400 hover:bg-ink-100')}>
          {s.enabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
        <button onClick={onEdit} aria-label="Edit" className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"><Pencil className="size-4" /></button>
        <button onClick={onDelete} aria-label="Delete" className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
      </div>
    </li>
  )
}

export function SuggestedReviews() {
  useDocumentTitle('Suggested Reviews')
  const toast = useToast()
  const { card } = useCard()
  const [items, setItems] = useState<Suggestion[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [editing, setEditing] = useState<Suggestion | null>(null)
  const [draft, setDraft] = useState('')
  const [adding, setAdding] = useState(false)
  const [preview, setPreview] = useState<ReviewCardData | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const load = useCallback(() => {
    setState('loading')
    ownerApi.suggestions
      .list()
      .then((s) => {
        setItems(s)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [])
  useEffect(load, [load])

  // The preview is the real customer component, fed by the real public endpoint.
  const refreshPreview = useCallback(() => {
    reviewApi.getCard(card.slug, true).then(setPreview).catch(() => setPreview(null))
  }, [card.slug])
  useEffect(refreshPreview, [refreshPreview, items])

  const add = async () => {
    if (draft.trim().length < 4) return toast('Write at least a few words.', 'error')
    try {
      const s = await ownerApi.suggestions.create(draft.trim())
      setItems((x) => [...x, s])
      setDraft('')
      setAdding(false)
      toast('Suggestion added')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not add that', 'error')
    }
  }

  const saveEdit = async () => {
    if (!editing) return
    try {
      const s = await ownerApi.suggestions.update(editing.id, { text: draft.trim() })
      setItems((x) => x.map((i) => (i.id === s.id ? s : i)))
      setEditing(null)
      toast('Suggestion updated — it changes for every future scan')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not save', 'error')
    }
  }

  const toggle = async (s: Suggestion) => {
    const next = !s.enabled
    setItems((x) => x.map((i) => (i.id === s.id ? { ...i, enabled: next } : i)))
    try {
      await ownerApi.suggestions.update(s.id, { enabled: next })
    } catch {
      setItems((x) => x.map((i) => (i.id === s.id ? { ...i, enabled: !next } : i)))
      toast('Could not update that', 'error')
    }
  }

  const remove = async (s: Suggestion) => {
    const before = items
    setItems((x) => x.filter((i) => i.id !== s.id))
    try {
      await ownerApi.suggestions.remove(s.id)
      toast('Suggestion deleted', 'info')
    } catch {
      setItems(before)
      toast('Could not delete that', 'error')
    }
  }

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.id === active.id)
    const to = items.findIndex((i) => i.id === over.id)
    const next = arrayMove(items, from, to)
    setItems(next)
    try {
      await ownerApi.suggestions.reorder(next.map((i) => i.id))
    } catch {
      setItems(items)
      toast('Could not save the new order', 'error')
    }
  }

  if (state === 'error') return <ErrorState onRetry={load} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suggested Reviews"
        description="One-tap starting points for your customers. They can always edit the text or write their own."
        action={<Button icon={<Plus className="size-4" />} onClick={() => { setDraft(''); setAdding(true) }} disabled={items.length >= 12}>Add suggestion</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title={`Your suggestions (${items.length})`} description={items.length >= 12 ? 'Maximum of 12 reached' : 'Drag to reorder — customers see them in this order'} />
            <div className="p-5 pt-3">
              {state === 'loading' ? (
                <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
              ) : items.length === 0 ? (
                <EmptyState
                  icon={<Lightbulb className="size-5" />}
                  title="No suggestions yet"
                  description="Suggestions make leaving a review almost effortless — most customers pick one and tap submit."
                  action={<Button onClick={() => { setDraft(''); setAdding(true) }} icon={<Plus className="size-4" />}>Add your first</Button>}
                />
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2">
                      {items.map((s) => (
                        <Row key={s.id} s={s} onToggle={() => toggle(s)} onEdit={() => { setEditing(s); setDraft(s.text) }} onDelete={() => remove(s)} />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </Card>

          {items.length < 12 && (
            <Card>
              <CardHeader title="Quick starters" description="Tap to add — edit the wording to sound like your business" />
              <div className="flex flex-wrap gap-2 p-5 pt-3">
                {STARTERS.filter((t) => !items.some((i) => i.text === t)).map((t) => (
                  <button
                    key={t}
                    onClick={async () => {
                      try {
                        const s = await ownerApi.suggestions.create(t)
                        setItems((x) => [...x, s])
                        toast('Added')
                      } catch (e) {
                        toast(e instanceof Error ? e.message : 'Could not add', 'error')
                      }
                    }}
                    className="rounded-full border border-dashed border-ink-300 px-3 py-1.5 text-[13px] text-ink-600 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </Card>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-ink-50 p-4 text-[13px] leading-relaxed text-ink-600">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span>
              Edits appear on the very next scan. Your printed QR codes and NFC cards never need reprinting, because they point at your
              permanent review link.
            </span>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-ink-400">What customers see</p>
            <PhoneFrame height={560} width={280}>
              {preview ? <ReviewExperience card={preview} /> : <div className="p-6"><Skeleton className="h-64" /></div>}
            </PhoneFrame>
          </div>
        </div>
      </div>

      <Modal
        open={adding || !!editing}
        onClose={() => { setAdding(false); setEditing(null) }}
        title={editing ? 'Edit suggestion' : 'Add a suggestion'}
        description="Keep it short, specific and in your customers' words."
        footer={
          <>
            <Button variant="secondary" onClick={() => { setAdding(false); setEditing(null) }} icon={<X className="size-4" />}>Cancel</Button>
            <Button onClick={editing ? saveEdit : add} icon={<Check className="size-4" />}>{editing ? 'Save changes' : 'Add suggestion'}</Button>
          </>
        }
      >
        <Textarea
          label="Suggested review"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={300}
          placeholder="Amazing food and great service!"
          hint={`${draft.length}/300 — customers can edit this before submitting`}
        />
      </Modal>
    </div>
  )
}
