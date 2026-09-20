import type { Appearance, CoverId, FontId, Radius } from '@/types'

export const covers: Record<CoverId, { label: string; css: string }> = {
  aurora: { label: 'Aurora', css: 'radial-gradient(120% 120% at 0% 0%, #7c6cff 0%, transparent 55%), radial-gradient(90% 90% at 100% 20%, #ff8fb1 0%, transparent 55%), linear-gradient(135deg,#3b2fd6,#7c3aed)' },
  sunset: { label: 'Sunset', css: 'radial-gradient(100% 100% at 100% 0%, #ffd27a 0%, transparent 55%), linear-gradient(135deg,#ff7a45,#e0356b)' },
  ocean: { label: 'Ocean', css: 'radial-gradient(100% 100% at 0% 100%, #22d3ee 0%, transparent 55%), linear-gradient(135deg,#0ea5e9,#1e40af)' },
  forest: { label: 'Forest', css: 'radial-gradient(100% 100% at 100% 100%, #a3e635 0%, transparent 55%), linear-gradient(135deg,#059669,#064e3b)' },
  mono: { label: 'Mono', css: 'linear-gradient(135deg,#1f2937,#0b1020)' },
  grid: { label: 'Grid', css: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px) 0 0/22px 22px, linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px) 0 0/22px 22px, linear-gradient(135deg,#334155,#0f172a)' },
  blush: { label: 'Blush', css: 'radial-gradient(100% 100% at 0% 0%, #fde7ef 0%, transparent 60%), linear-gradient(135deg,#f9a8c9,#c084fc)' },
  midnight: { label: 'Midnight', css: 'radial-gradient(90% 90% at 80% 10%, #6366f1 0%, transparent 55%), linear-gradient(135deg,#0f172a,#1e1b4b)' },
}

export const fonts: Record<FontId, { label: string; family: string }> = {
  inter: { label: 'Inter', family: '"Inter", system-ui, sans-serif' },
  jakarta: { label: 'Jakarta', family: '"Plus Jakarta Sans", "Inter", sans-serif' },
  serif: { label: 'Editorial Serif', family: '"DM Serif Display", Georgia, serif' },
  grotesk: { label: 'Grotesk', family: '"Space Grotesk", "Inter", sans-serif' },
}

export const radii: Record<Radius, { label: string; btn: string; card: string }> = {
  none: { label: 'Square', btn: '0px', card: '0px' },
  sm: { label: 'Subtle', btn: '6px', card: '10px' },
  md: { label: 'Rounded', btn: '12px', card: '18px' },
  lg: { label: 'Soft', btn: '18px', card: '26px' },
  full: { label: 'Pill', btn: '999px', card: '26px' },
}

export interface ThemePreset {
  id: string
  name: string
  appearance: Pick<Appearance, 'primary' | 'background' | 'text' | 'mode' | 'cover' | 'font' | 'radius' | 'buttonStyle'>
}

export const themePresets: ThemePreset[] = [
  { id: 'indigo', name: 'Indigo Light', appearance: { primary: '#5b4bff', background: '#f6f7fb', text: '#0f1729', mode: 'light', cover: 'aurora', font: 'jakarta', radius: 'md', buttonStyle: 'solid' } },
  { id: 'midnight', name: 'Midnight', appearance: { primary: '#8b7bff', background: '#0b1020', text: '#f3f4f8', mode: 'dark', cover: 'midnight', font: 'grotesk', radius: 'lg', buttonStyle: 'soft' } },
  { id: 'saffron', name: 'Saffron', appearance: { primary: '#e8590c', background: '#fff8f1', text: '#2b1608', mode: 'light', cover: 'sunset', font: 'serif', radius: 'md', buttonStyle: 'solid' } },
  { id: 'emerald', name: 'Emerald', appearance: { primary: '#0f9d6b', background: '#f3faf6', text: '#0b2a1f', mode: 'light', cover: 'forest', font: 'inter', radius: 'lg', buttonStyle: 'solid' } },
  { id: 'ocean', name: 'Ocean', appearance: { primary: '#0284c7', background: '#f2f9fd', text: '#0a2540', mode: 'light', cover: 'ocean', font: 'jakarta', radius: 'full', buttonStyle: 'solid' } },
  { id: 'blush', name: 'Blush', appearance: { primary: '#c2418a', background: '#fff5f9', text: '#3a0f27', mode: 'light', cover: 'blush', font: 'serif', radius: 'full', buttonStyle: 'outline' } },
  { id: 'graphite', name: 'Graphite', appearance: { primary: '#e2e8f0', background: '#111318', text: '#f5f6f8', mode: 'dark', cover: 'grid', font: 'inter', radius: 'sm', buttonStyle: 'outline' } },
  { id: 'paper', name: 'Paper', appearance: { primary: '#111827', background: '#ffffff', text: '#111827', mode: 'light', cover: 'mono', font: 'serif', radius: 'none', buttonStyle: 'solid' } },
]

/** Pick readable text colour for a filled button. */
export function onColor(hex: string): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#0f1729' : '#ffffff'
}

export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}
