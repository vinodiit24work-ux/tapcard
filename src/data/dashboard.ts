const days = (n: number, f: (i: number) => number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(2026, 8, 19 - (n - 1 - i))
    return { date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), value: Math.max(0, Math.round(f(i))) }
  })

const wave = (n: number, base: number, amp: number, seed: number) =>
  days(n, (i) => base + amp * Math.sin(i / 2.2 + seed) + (i * amp) / (n * 1.4) + ((i * 7 + seed * 13) % 9))

export type Range = '1' | '7' | '30' | '90'
export const rangeDays: Record<Range, number> = { '1': 1, '7': 7, '30': 30, '90': 90 }
export const rangeLabel: Record<Range, string> = { '1': 'Today', '7': '7 Days', '30': '30 Days', '90': '90 Days' }

export function scansSeries(range: Range) {
  if (range === '1') return ['9a', '11a', '1p', '3p', '5p', '7p', '9p'].map((date, i) => ({ date, value: [6, 11, 24, 17, 22, 31, 14][i] }))
  const n = rangeDays[range]
  return wave(n, 30, 12, 1)
}

export function clicksSeries(range: Range) {
  if (range === '1') return ['9a', '11a', '1p', '3p', '5p', '7p', '9p'].map((date, i) => ({ date, whatsapp: [2, 4, 9, 6, 8, 12, 5][i], calls: [1, 2, 4, 3, 3, 5, 2][i], website: [1, 2, 3, 3, 4, 4, 2][i] }))
  const n = rangeDays[range]
  const a = wave(n, 10, 5, 2)
  const b = wave(n, 6, 3, 4)
  const c = wave(n, 5, 3, 6)
  return a.map((x, i) => ({ date: x.date, whatsapp: x.value, calls: b[i].value, website: c[i].value }))
}

const scale: Record<Range, number> = { '1': 0.05, '7': 0.28, '30': 1, '90': 2.7 }
export function metricsFor(range: Range) {
  const s = scale[range]
  const v = (n: number) => Math.round(n * s)
  return {
    scans: v(1248),
    visitors: v(923),
    whatsapp: v(327),
    calls: v(214),
    website: v(213),
    reviews: v(184),
    maps: v(162),
    menu: v(391),
    bookings: v(76),
  }
}

export const deltas = { scans: 12.4, visitors: 8.1, whatsapp: 21.6, calls: -3.2, website: 5.7, reviews: 14.9, maps: 6.3, menu: 18.2, bookings: 9.4 }

export const devices = [
  { name: 'Android', value: 58 },
  { name: 'iPhone', value: 33 },
  { name: 'Desktop', value: 9 },
]

export const sources = [
  { name: 'QR scan', value: 61 },
  { name: 'NFC tap', value: 17 },
  { name: 'Direct link', value: 14 },
  { name: 'Instagram', value: 8 },
]

export const topActions = [
  { name: 'View Menu', value: 391 },
  { name: 'WhatsApp', value: 327 },
  { name: 'Call', value: 214 },
  { name: 'Website', value: 213 },
  { name: 'Google Review', value: 184 },
  { name: 'Directions', value: 162 },
]

export const recentActivity = [
  { id: 1, icon: 'scan', text: 'QR code scanned', meta: 'Bengaluru · Android', time: '2 min ago' },
  { id: 2, icon: 'whatsapp', text: 'WhatsApp button tapped', meta: 'Bengaluru · iPhone', time: '6 min ago' },
  { id: 3, icon: 'review', text: 'Google Review opened', meta: 'Mysuru · Android', time: '18 min ago' },
  { id: 4, icon: 'menu', text: 'Menu viewed', meta: 'Bengaluru · Android', time: '31 min ago' },
  { id: 5, icon: 'scan', text: 'NFC card tapped', meta: 'Bengaluru · iPhone', time: '47 min ago' },
  { id: 6, icon: 'phone', text: 'Call button tapped', meta: 'Hosur · Android', time: '1 hr ago' },
]

export const leads = [
  { id: 'L-1042', name: 'Priya Nair', phone: '+91 98450 11223', message: 'Table for 6 this Saturday, 8pm?', source: 'Card form', date: '19 Sep 2026' },
  { id: 'L-1041', name: 'Karthik Rao', phone: '+91 99001 44556', message: 'Do you cater for office events?', source: 'Card form', date: '18 Sep 2026' },
  { id: 'L-1040', name: 'Sana Sheikh', phone: '+91 97400 88110', message: 'Birthday cake pre-order for Sunday.', source: 'WhatsApp', date: '17 Sep 2026' },
  { id: 'L-1039', name: 'Vikram Shetty', phone: '+91 98860 77321', message: 'Looking for a private dining option.', source: 'Card form', date: '15 Sep 2026' },
]

export const orders = [
  { id: 'TC-20418', date: '17 Sep 2026', items: 'NFC Business Card × 25', total: 22475, status: 'Shipped', tracking: 'DTDC 7X4419203' },
  { id: 'TC-20377', date: '2 Sep 2026', items: 'QR Table Stand × 8', total: 3992, status: 'Delivered', tracking: 'Delhivery 3372910' },
  { id: 'TC-20351', date: '28 Aug 2026', items: 'Premium QR Card × 50', total: 29950, status: 'Delivered', tracking: 'DTDC 7X4398112' },
  { id: 'TC-20488', date: '19 Sep 2026', items: 'QR Card 5-Pack × 1', total: 1249, status: 'Design Review', tracking: '' },
]

export const invoices = [
  { id: 'INV-3091', date: '01 Sep 2026', amount: 299, status: 'Paid' },
  { id: 'INV-2874', date: '01 Aug 2026', amount: 299, status: 'Paid' },
  { id: 'INV-2650', date: '01 Jul 2026', amount: 299, status: 'Paid' },
]

export const notifications = [
  { id: 1, title: 'Your QR was scanned 42 times today', time: '10 min ago', unread: true },
  { id: 2, title: 'Order TC-20418 has shipped', time: '2 hr ago', unread: true },
  { id: 3, title: 'New lead: Priya Nair', time: 'Yesterday', unread: false },
]
