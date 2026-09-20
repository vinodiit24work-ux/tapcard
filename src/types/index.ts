export type SectionId =
  | 'profile'
  | 'contact'
  | 'social'
  | 'menu'
  | 'services'
  | 'booking'
  | 'reviews'
  | 'gallery'
  | 'links'

export interface SectionConfig {
  id: SectionId
  enabled: boolean
}

export interface ServiceItem {
  id: string
  name: string
  description?: string
  price?: string
}

export interface MenuItem {
  id: string
  name: string
  category: string
  price: string
  description?: string
  veg?: boolean
}

export interface CustomLink {
  id: string
  label: string
  url: string
}

export interface HoursRow {
  day: string
  open: string
  close: string
  closed?: boolean
}

export type ButtonStyle = 'solid' | 'outline' | 'soft'
export type Radius = 'none' | 'sm' | 'md' | 'lg' | 'full'
export type FontId = 'inter' | 'jakarta' | 'serif' | 'grotesk'
export type CardStyle = 'flat' | 'elevated' | 'bordered'
export type AvatarShape = 'circle' | 'rounded' | 'square'
export type CoverId = 'aurora' | 'sunset' | 'ocean' | 'forest' | 'mono' | 'grid' | 'blush' | 'midnight'

export interface Appearance {
  themeId: string
  primary: string
  background: string
  text: string
  mode: 'light' | 'dark'
  buttonStyle: ButtonStyle
  radius: Radius
  font: FontId
  cardStyle: CardStyle
  avatarShape: AvatarShape
  cover: CoverId
  coverImage?: string
  showBranding: boolean
}

export interface CardData {
  slug: string
  category: string
  businessName: string
  tagline: string
  description: string
  logo?: string
  phone: string
  whatsapp: string
  email: string
  website: string
  address: string
  mapsUrl: string
  reviewUrl: string
  instagram: string
  facebook: string
  linkedin: string
  youtube: string
  menuUrl: string
  bookingUrl: string
  bookingLabel: string
  services: ServiceItem[]
  menu: MenuItem[]
  customLinks: CustomLink[]
  gallery: CoverId[]
  hours: HoursRow[]
  sections: SectionConfig[]
  appearance: Appearance
}

export type CardAction =
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'website'
  | 'maps'
  | 'review'
  | 'menu'
  | 'booking'
  | 'social'
  | 'custom'

export interface Template {
  id: string
  name: string
  category: string
  description: string
  popular?: boolean
  card: CardData
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  compareAt?: number
  kind: 'card' | 'stand' | 'pack'
  tech: 'QR' | 'NFC'
  material: string
  badge?: string
  packSize: number
  features: string[]
}

export interface CartLine {
  id: string
  productId: string
  qty: number
  businessName: string
  finish: 'matte' | 'gloss'
  color: 'white' | 'black' | 'brand'
  notes: string
}
