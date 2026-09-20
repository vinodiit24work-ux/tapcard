import { Check } from 'lucide-react'
import type { Appearance, AvatarShape, ButtonStyle, CardStyle, CoverId, FontId, Radius } from '@/types'
import { ColorField, Segmented, Switch } from '@/components/ui/Form'
import { covers, fonts, radii, themePresets } from '@/lib/theme'
import { cn } from '@/lib/cn'

const Group = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <h4 className="mb-2.5 text-[13px] font-semibold text-ink-700">{label}</h4>
    {children}
  </div>
)

export function AppearanceEditor({ appearance, onChange }: { appearance: Appearance; onChange: (p: Partial<Appearance>) => void }) {
  const a = appearance
  return (
    <div className="space-y-7">
      <Group label="Preset themes">
        <div className="grid grid-cols-2 gap-2">
          {themePresets.map((p) => (
            <button key={p.id} onClick={() => onChange({ themeId: p.id, ...p.appearance })} className={cn('flex items-center gap-2.5 rounded-xl border bg-white p-2.5 text-left transition-all hover:shadow-soft', a.themeId === p.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-ink-200')}>
              <span className="size-8 shrink-0 rounded-lg" style={{ background: covers[p.appearance.cover].css }} />
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-800">{p.name}</span>
              {a.themeId === p.id && <Check className="size-3.5 shrink-0 text-brand-600" />}
            </button>
          ))}
        </div>
      </Group>

      <Group label="Colours">
        <div className="space-y-3">
          <ColorField label="Primary" value={a.primary} onChange={(v) => onChange({ primary: v, themeId: 'custom' })} />
          <ColorField label="Background" value={a.background} onChange={(v) => onChange({ background: v, themeId: 'custom' })} />
          <ColorField label="Text" value={a.text} onChange={(v) => onChange({ text: v, themeId: 'custom' })} />
        </div>
      </Group>

      <Group label="Mode">
        <Segmented value={a.mode} onChange={(mode) => onChange({ mode, background: mode === 'dark' ? '#0b1020' : '#f6f7fb', text: mode === 'dark' ? '#f3f4f8' : '#0f1729', themeId: 'custom' })} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
      </Group>

      <Group label="Button style">
        <Segmented<ButtonStyle> value={a.buttonStyle} onChange={(buttonStyle) => onChange({ buttonStyle })} options={[{ value: 'solid', label: 'Solid' }, { value: 'soft', label: 'Soft' }, { value: 'outline', label: 'Outline' }]} />
      </Group>

      <Group label="Corner radius">
        <div className="grid grid-cols-5 gap-1.5">
          {(Object.keys(radii) as Radius[]).map((r) => (
            <button key={r} onClick={() => onChange({ radius: r })} className={cn('flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2 text-[10px] font-medium transition-colors', a.radius === r ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 bg-white text-ink-500 hover:border-ink-300')}>
              <span className="size-5 border-2 border-current opacity-60" style={{ borderRadius: radii[r].btn === '999px' ? '999px' : `min(${radii[r].btn}, 10px)` }} />
              {radii[r].label}
            </button>
          ))}
        </div>
      </Group>

      <Group label="Font">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(fonts) as FontId[]).map((f) => (
            <button key={f} onClick={() => onChange({ font: f })} className={cn('rounded-lg border px-3 py-2.5 text-left transition-colors', a.font === f ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white hover:border-ink-300')}>
              <span className="block text-[15px] font-semibold text-ink-900" style={{ fontFamily: fonts[f].family }}>Aa</span>
              <span className="block text-[11px] text-ink-500">{fonts[f].label}</span>
            </button>
          ))}
        </div>
      </Group>

      <Group label="Card style">
        <Segmented<CardStyle> value={a.cardStyle} onChange={(cardStyle) => onChange({ cardStyle })} options={[{ value: 'elevated', label: 'Elevated' }, { value: 'bordered', label: 'Bordered' }, { value: 'flat', label: 'Flat' }]} />
      </Group>

      <Group label="Profile image shape">
        <Segmented<AvatarShape> value={a.avatarShape} onChange={(avatarShape) => onChange({ avatarShape })} options={[{ value: 'circle', label: 'Circle' }, { value: 'rounded', label: 'Rounded' }, { value: 'square', label: 'Square' }]} />
      </Group>

      <Group label="Cover">
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(covers) as CoverId[]).map((c) => (
            <button key={c} aria-label={covers[c].label} title={covers[c].label} onClick={() => onChange({ cover: c, coverImage: undefined })} className={cn('h-11 rounded-lg ring-offset-2 transition-all', a.cover === c && !a.coverImage && 'ring-2 ring-brand-500')} style={{ background: covers[c].css }} />
          ))}
        </div>
        <label className="mt-2.5 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-ink-300 px-3 py-2.5 text-[12px] font-medium text-ink-600 hover:border-brand-400 hover:text-brand-700">
          Upload a cover image
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            const reader = new FileReader()
            reader.onload = () => onChange({ coverImage: String(reader.result) })
            reader.readAsDataURL(f)
          }} />
        </label>
        {a.coverImage && (
          <button onClick={() => onChange({ coverImage: undefined })} className="mt-2 w-full rounded-lg bg-ink-100 px-3 py-2 text-[12px] font-medium text-ink-600 hover:bg-ink-200">Remove cover image</button>
        )}
      </Group>

      <Group label="Branding">
        <div className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-3">
          <div>
            <p className="text-[13px] font-semibold text-ink-900">Show “Made with TapCard”</p>
            <p className="text-[11px] text-ink-500">Turn off on Pro and Business plans</p>
          </div>
          <Switch checked={a.showBranding} onChange={(showBranding) => onChange({ showBranding })} label="Show TapCard branding" />
        </div>
      </Group>
    </div>
  )
}
