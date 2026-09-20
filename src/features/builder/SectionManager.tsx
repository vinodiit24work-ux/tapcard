import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarCheck, Contact, Eye, EyeOff, GripVertical, Image, Link2, Lock, Sparkles, Star, User, UtensilsCrossed, Wrench, type LucideIcon } from 'lucide-react'
import type { SectionConfig, SectionId } from '@/types'
import { cn } from '@/lib/cn'

export const sectionMeta: Record<SectionId, { label: string; icon: LucideIcon; hint: string; locked?: boolean }> = {
  profile: { label: 'Profile', icon: User, hint: 'Logo, name, tagline', locked: true },
  contact: { label: 'Contact', icon: Contact, hint: 'WhatsApp, call, email, directions' },
  social: { label: 'Social', icon: Sparkles, hint: 'Instagram, Facebook, LinkedIn, YouTube' },
  menu: { label: 'Menu', icon: UtensilsCrossed, hint: 'Menu link and item list' },
  services: { label: 'Services', icon: Wrench, hint: 'Services with prices' },
  booking: { label: 'Booking', icon: CalendarCheck, hint: 'Appointment or reservation button' },
  reviews: { label: 'Reviews', icon: Star, hint: 'Google review button' },
  gallery: { label: 'Gallery', icon: Image, hint: 'Photo grid' },
  links: { label: 'Custom Links', icon: Link2, hint: 'Any extra buttons' },
}

function Row({ s, onToggle, onEdit }: { s: SectionConfig; onToggle: () => void; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id, disabled: sectionMeta[s.id].locked })
  const meta = sectionMeta[s.id]
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-2 rounded-xl border bg-white px-2.5 py-2.5 transition-shadow', isDragging ? 'z-10 border-brand-400 shadow-float' : 'border-ink-200', !s.enabled && 'bg-ink-50')}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${meta.label}`}
        disabled={meta.locked}
        className={cn('-ml-1 rounded p-1 text-ink-400', meta.locked ? 'cursor-not-allowed opacity-30' : 'cursor-grab hover:bg-ink-100 hover:text-ink-700 active:cursor-grabbing')}
      >
        <GripVertical className="size-4" />
      </button>
      <button onClick={onEdit} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
        <meta.icon className={cn('size-4 shrink-0', s.enabled ? 'text-brand-600' : 'text-ink-400')} />
        <span className="min-w-0">
          <span className={cn('block truncate text-[13px] font-semibold', s.enabled ? 'text-ink-900' : 'text-ink-500')}>{meta.label}</span>
          <span className="block truncate text-[11px] text-ink-400">{meta.hint}</span>
        </span>
      </button>
      {meta.locked ? (
        <span title="Always visible" className="rounded-md bg-ink-100 p-1.5 text-ink-400"><Lock className="size-3.5" /></span>
      ) : (
        <button onClick={onToggle} aria-label={s.enabled ? `Hide ${meta.label}` : `Show ${meta.label}`} title={s.enabled ? 'Visible on card' : 'Hidden from card'} className={cn('rounded-lg p-1.5 transition-colors', s.enabled ? 'text-emerald-600 hover:bg-emerald-50' : 'text-ink-400 hover:bg-ink-100')}>
          {s.enabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
      )}
    </li>
  )
}

export function SectionManager({ sections, onChange, onEdit }: { sections: SectionConfig[]; onChange: (s: SectionConfig[]) => void; onEdit: (id: SectionId) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = sections.findIndex((s) => s.id === active.id)
    const to = sections.findIndex((s) => s.id === over.id)
    if (sections[to]?.id === 'profile') return
    onChange(arrayMove(sections, from, to))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-1.5">
          {sections.map((s) => (
            <Row key={s.id} s={s} onEdit={() => onEdit(s.id)} onToggle={() => onChange(sections.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)))} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
