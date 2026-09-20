import type { Appearance, CardData, HoursRow, SectionConfig, Template } from '@/types'
import { themePresets } from '@/lib/theme'

const week = (open: string, close: string, sundayClosed = false): HoursRow[] =>
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    day,
    open,
    close,
    closed: sundayClosed && day === 'Sun',
  }))

/** Profile always leads; the sections named in `on` follow in order, then the rest, hidden. */
const sec = (...on: string[]): SectionConfig[] => {
  const all = ['contact', 'social', 'menu', 'services', 'booking', 'reviews', 'gallery', 'links'] as const
  const order = ['profile', ...on, ...all.filter((s) => !on.includes(s))]
  return order.map((id) => ({ id: id as SectionConfig['id'], enabled: id === 'profile' || on.includes(id) }))
}

const look = (themeId: string, over: Partial<Appearance> = {}): Appearance => {
  const t = themePresets.find((p) => p.id === themeId) ?? themePresets[0]
  return { themeId, ...t.appearance, cardStyle: 'elevated', avatarShape: 'rounded', showBranding: true, ...over }
}

const base = (c: Partial<CardData> & Pick<CardData, 'slug' | 'category' | 'businessName' | 'tagline' | 'description' | 'appearance'>): CardData => ({
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'hello@example.in',
  website: 'https://example.in',
  address: '12, MG Road, Indiranagar, Bengaluru 560038',
  mapsUrl: 'https://maps.google.com',
  reviewUrl: 'https://g.page/r/review',
  instagram: '',
  facebook: '',
  linkedin: '',
  youtube: '',
  menuUrl: '',
  bookingUrl: '',
  bookingLabel: 'Book Appointment',
  services: [],
  menu: [],
  customLinks: [],
  gallery: ['sunset', 'aurora', 'ocean', 'forest'],
  hours: week('10:00', '20:00'),
  sections: sec('contact', 'social'),
  ...c,
})

export const royalSpice = base({
  slug: 'royal-spice',
  category: 'Restaurant',
  businessName: 'Royal Spice',
  tagline: 'Restaurant & Cafe',
  description: 'Slow-cooked North Indian classics, tandoor specials and a warm rooftop to enjoy them in. Family-run since 2009.',
  instagram: 'royalspice.blr',
  facebook: 'royalspiceblr',
  menuUrl: 'https://tapcard.in/royal-spice/menu',
  bookingUrl: 'https://tapcard.in/royal-spice/book',
  bookingLabel: 'Reserve a Table',
  phone: '+91 80 4123 4567',
  whatsapp: '918041234567',
  email: 'hello@royalspice.in',
  website: 'https://royalspice.in',
  hours: week('11:00', '23:30'),
  menu: [
    { id: 'm1', name: 'Butter Chicken', category: 'Mains', price: '₹420', description: 'Tandoori chicken in creamy tomato gravy', veg: false },
    { id: 'm2', name: 'Paneer Lababdar', category: 'Mains', price: '₹360', description: 'Cottage cheese, cashew and tomato', veg: true },
    { id: 'm3', name: 'Dal Makhani', category: 'Mains', price: '₹290', description: 'Overnight black lentils, slow simmered', veg: true },
    { id: 'm4', name: 'Garlic Naan', category: 'Breads', price: '₹80', veg: true },
    { id: 'm5', name: 'Masala Chai', category: 'Drinks', price: '₹60', veg: true },
  ],
  gallery: ['sunset', 'forest', 'aurora', 'midnight'],
  customLinks: [{ id: 'l1', label: 'Order on Swiggy', url: 'https://swiggy.com' }],
  sections: sec('contact', 'menu', 'reviews', 'gallery', 'social', 'links'),
  appearance: look('saffron'),
})

export const glowStudio = base({
  slug: 'glow-studio',
  category: 'Salon',
  businessName: 'Glow Studio',
  tagline: 'Beauty & Wellness',
  description: 'Hair, skin and bridal artistry by certified stylists. Relax, we will take care of the rest.',
  instagram: 'glowstudio.mumbai',
  address: '4th Floor, Linking Road, Bandra West, Mumbai 400050',
  bookingUrl: 'https://tapcard.in/glow-studio/book',
  services: [
    { id: 's1', name: 'Signature Haircut', price: '₹799', description: 'Consult, wash, cut and blow-dry' },
    { id: 's2', name: 'Global Hair Colour', price: '₹3,499', description: 'Ammonia-free colour, all lengths' },
    { id: 's3', name: 'Hydra Facial', price: '₹2,499', description: 'Deep cleanse and glow boost' },
    { id: 's4', name: 'Bridal Makeup', price: '₹14,999', description: 'Trial included' },
  ],
  hours: week('10:00', '20:30'),
  gallery: ['blush', 'aurora', 'sunset', 'mono'],
  sections: sec('contact', 'booking', 'services', 'gallery', 'reviews', 'social'),
  appearance: look('blush'),
})

export const ironForge = base({
  slug: 'ironforge-fitness',
  category: 'Gym',
  businessName: 'IronForge Fitness',
  tagline: 'Strength · Conditioning · Community',
  description: 'Personal training, group classes and 24×6 access. Your first week is on us.',
  instagram: 'ironforge.fit',
  youtube: 'ironforgefit',
  address: 'Sector 29, Gurugram, Haryana 122001',
  bookingLabel: 'Book Free Trial',
  bookingUrl: 'https://tapcard.in/ironforge/trial',
  services: [
    { id: 's1', name: 'Monthly Membership', price: '₹1,999' },
    { id: 's2', name: 'Personal Training (12 sessions)', price: '₹9,999' },
    { id: 's3', name: 'HIIT & CrossFit Classes', price: 'Included' },
  ],
  hours: week('05:00', '22:00', true),
  gallery: ['mono', 'grid', 'midnight', 'ocean'],
  sections: sec('contact', 'booking', 'services', 'gallery', 'social'),
  appearance: look('graphite'),
})

export const drMehta = base({
  slug: 'dr-anita-mehta',
  category: 'Doctor',
  businessName: 'Dr. Anita Mehta',
  tagline: 'Consultant Dermatologist · MD',
  description: '15+ years of experience in medical and cosmetic dermatology. Appointments by prior booking.',
  address: 'Mehta Skin Clinic, Koregaon Park, Pune 411001',
  bookingLabel: 'Book Consultation',
  bookingUrl: 'https://tapcard.in/dr-anita-mehta/book',
  linkedin: 'dr-anita-mehta',
  services: [
    { id: 's1', name: 'Skin Consultation', price: '₹800' },
    { id: 's2', name: 'Acne & Scar Treatment', price: 'From ₹2,500' },
    { id: 's3', name: 'Hair Fall Clinic', price: 'From ₹1,500' },
  ],
  hours: week('10:00', '18:00', true),
  sections: sec('contact', 'booking', 'services', 'reviews', 'social'),
  appearance: look('ocean'),
})

export const freelancer = base({
  slug: 'aarav-designs',
  category: 'Freelancer',
  businessName: 'Aarav Sharma',
  tagline: 'Product & Brand Designer',
  description: 'I help startups turn ideas into products people love. Currently booking projects for next month.',
  website: 'https://aarav.design',
  linkedin: 'aarav-sharma',
  instagram: 'aarav.designs',
  youtube: '',
  bookingLabel: 'Book a Discovery Call',
  bookingUrl: 'https://cal.com/aarav',
  customLinks: [
    { id: 'l1', label: 'View Portfolio', url: 'https://aarav.design' },
    { id: 'l2', label: 'Download Resume', url: 'https://aarav.design/cv.pdf' },
  ],
  gallery: ['aurora', 'ocean', 'blush', 'midnight'],
  sections: sec('contact', 'links', 'gallery', 'social', 'booking'),
  appearance: look('midnight'),
})

export const retail = base({
  slug: 'kesar-fashions',
  category: 'Retail',
  businessName: 'Kesar Fashions',
  tagline: 'Ethnic wear for every occasion',
  description: 'Sarees, lehengas and kurta sets from artisans across India. Visit our store or shop on WhatsApp.',
  instagram: 'kesarfashions',
  facebook: 'kesarfashions',
  address: 'Chandni Chowk, Delhi 110006',
  customLinks: [{ id: 'l1', label: 'Shop New Arrivals', url: 'https://kesar.in' }],
  hours: week('10:30', '21:00'),
  gallery: ['sunset', 'blush', 'aurora', 'forest'],
  sections: sec('contact', 'gallery', 'links', 'reviews', 'social'),
  appearance: look('saffron'),
})

const T = (id: string, name: string, category: string, description: string, card: CardData, popular = false): Template => ({ id, name, category, description, card, popular })

export const templates: Template[] = [
  T('restaurant', 'Royal Table', 'Restaurant', 'Menu, reviews and reservations in one tap.', royalSpice, true),
  T(
    'cafe',
    'Morning Brew',
    'Cafe',
    'Cosy, warm and made for menus and Instagram.',
    base({ slug: 'morning-brew', category: 'Cafe', businessName: 'Morning Brew', tagline: 'Specialty Coffee & Bakes', description: 'Single-origin coffee, fresh croissants and a corner for your laptop.', instagram: 'morningbrew.cafe', menuUrl: 'https://tapcard.in/morning-brew/menu', menu: [
      { id: 'm1', name: 'Flat White', category: 'Coffee', price: '₹220', veg: true },
      { id: 'm2', name: 'Cold Brew', category: 'Coffee', price: '₹260', veg: true },
      { id: 'm3', name: 'Almond Croissant', category: 'Bakes', price: '₹180', veg: true },
    ], hours: week('08:00', '22:00'), gallery: ['mono', 'sunset', 'forest', 'aurora'], sections: sec('contact', 'menu', 'gallery', 'social', 'reviews'), appearance: look('paper', { primary: '#7c4a21', font: 'serif' }) }),
  ),
  T('salon', 'Glow', 'Salon', 'Services, prices and instant booking.', glowStudio, true),
  T('gym', 'Iron', 'Gym', 'Membership plans and free-trial booking.', ironForge),
  T('doctor', 'Clinical Calm', 'Doctor', 'Trust-first profile for consultants.', drMehta),
  T(
    'clinic',
    'Care Clinic',
    'Clinic',
    'Multi-doctor clinics with timings and services.',
    base({ slug: 'careplus-clinic', category: 'Clinic', businessName: 'CarePlus Clinic', tagline: 'Family Health & Diagnostics', description: 'General physician, paediatrics and in-house diagnostics under one roof.', bookingLabel: 'Book Appointment', bookingUrl: 'https://tapcard.in/careplus/book', services: [
      { id: 's1', name: 'General Physician', price: '₹500' },
      { id: 's2', name: 'Paediatrics', price: '₹600' },
      { id: 's3', name: 'Full Body Checkup', price: '₹1,999' },
    ], hours: week('09:00', '21:00'), sections: sec('contact', 'booking', 'services', 'reviews'), appearance: look('emerald') }),
  ),
  T(
    'real-estate',
    'Key & Co.',
    'Real Estate',
    'Listings and enquiries for property agents.',
    base({ slug: 'key-and-co', category: 'Real Estate', businessName: 'Rohan Kapoor · Key & Co.', tagline: 'Premium Homes in South Mumbai', description: 'RERA-registered advisor. Buy, sell and lease with a transparent process.', linkedin: 'rohan-kapoor', instagram: 'keyandco.homes', customLinks: [
      { id: 'l1', label: 'View Current Listings', url: '#' },
      { id: 'l2', label: 'Download Brochure', url: '#' },
    ], bookingLabel: 'Schedule Site Visit', bookingUrl: '#', sections: sec('contact', 'booking', 'links', 'gallery', 'social'), appearance: look('midnight', { primary: '#d4a24c' }) }),
  ),
  T('freelancer', 'Solo', 'Freelancer', 'Portfolio links and a discovery-call button.', freelancer, true),
  T(
    'consultant',
    'Advisor',
    'Consultant',
    'Authority-building profile for consultants.',
    base({ slug: 'meera-advisory', category: 'Consultant', businessName: 'Meera Nair Advisory', tagline: 'Growth Strategy for D2C Brands', description: 'Ex-operator helping founders scale from ₹1Cr to ₹50Cr. Limited advisory slots each quarter.', linkedin: 'meera-nair', bookingLabel: 'Book Strategy Call', bookingUrl: '#', services: [
      { id: 's1', name: 'Growth Audit', price: '₹25,000' },
      { id: 's2', name: 'Monthly Advisory', price: '₹75,000/mo' },
    ], sections: sec('contact', 'booking', 'services', 'social'), appearance: look('paper') }),
  ),
  T('retail', 'Storefront', 'Retail', 'Catalogue links, store hours and reviews.', retail),
]

export const demoCategories = [
  { id: 'restaurant', label: 'Restaurant', card: royalSpice },
  { id: 'salon', label: 'Salon', card: glowStudio },
  { id: 'gym', label: 'Gym', card: ironForge },
  { id: 'doctor', label: 'Doctor', card: drMehta },
  { id: 'freelancer', label: 'Freelancer', card: freelancer },
  { id: 'retail', label: 'Retail', card: retail },
]

export const publicCards: Record<string, CardData> = Object.fromEntries(
  [...templates.map((t) => t.card), royalSpice, glowStudio, ironForge, drMehta, freelancer, retail].map((c) => [c.slug, c]),
)

export const blankCard = (over: Partial<CardData> = {}): CardData => ({ ...royalSpice, ...over })
