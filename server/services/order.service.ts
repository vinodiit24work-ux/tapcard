import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/http.js'

export interface CommerceSettings {
  gstRatePercent: number
  shippingFlatPaise: number
  freeShippingOverPaise: number
  productionSlaDays: number
}

const FALLBACK: CommerceSettings = {
  gstRatePercent: 18,
  shippingFlatPaise: 7900,
  freeShippingOverPaise: 99900,
  productionSlaDays: 5,
}

export async function commerceSettings(): Promise<CommerceSettings> {
  const row = await prisma.setting.findUnique({ where: { key: 'commerce' } })
  return { ...FALLBACK, ...((row?.value as Partial<CommerceSettings>) ?? {}) }
}

export interface PricedItem {
  productId: string
  sku: string
  name: string
  quantity: number
  unitPricePaise: number
  businessName: string
  finish: string
  colour: string
  notes?: string
}

/**
 * Prices an order from the database. The caller's numbers are never used — only the
 * SKUs and quantities they chose — so a tampered cart cannot change what is charged.
 */
export async function priceOrder(
  items: { sku: string; quantity: number; businessName: string; finish: string; colour: string; notes?: string }[],
  couponCode: string | undefined,
  userId: string,
) {
  const products = await prisma.product.findMany({ where: { sku: { in: items.map((i) => i.sku) }, active: true } })

  const priced: PricedItem[] = items.map((i) => {
    const p = products.find((x) => x.sku === i.sku)
    if (!p) throw ApiError.badRequest(`“${i.sku}” is no longer available. Please remove it and try again.`)
    return {
      productId: p.id,
      sku: p.sku,
      name: p.name,
      quantity: i.quantity,
      unitPricePaise: p.pricePaise,
      businessName: i.businessName,
      finish: i.finish,
      colour: i.colour,
      notes: i.notes,
    }
  })

  const subtotalPaise = priced.reduce((s, i) => s + i.unitPricePaise * i.quantity, 0)
  const settings = await commerceSettings()

  let discountPaise = 0
  let coupon: { id: string; code: string } | null = null

  if (couponCode) {
    const c = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
    const now = new Date()
    const usable =
      c && c.active &&
      (!c.startsAt || c.startsAt <= now) &&
      (!c.endsAt || c.endsAt >= now) &&
      (c.maxUses === null || c.usedCount < c.maxUses) &&
      subtotalPaise >= c.minOrderPaise

    if (!usable) throw ApiError.badRequest('That coupon is no longer valid for this order.')

    // Per-user limits are enforced here, not just at validation time.
    const used = await prisma.couponRedemption.count({ where: { couponId: c!.id, userId } })
    if (used >= c!.perUserLimit) throw ApiError.badRequest('You have already used that coupon.')

    discountPaise = c!.kind === 'PERCENT' ? Math.round((subtotalPaise * c!.value) / 100) : Math.min(c!.value, subtotalPaise)
    coupon = { id: c!.id, code: c!.code }
  }

  const taxablePaise = subtotalPaise - discountPaise
  const shippingPaise = subtotalPaise >= settings.freeShippingOverPaise ? 0 : settings.shippingFlatPaise
  const taxPaise = Math.round((taxablePaise * settings.gstRatePercent) / 100)

  return {
    items: priced,
    coupon,
    subtotalPaise,
    discountPaise,
    shippingPaise,
    taxPaise,
    totalPaise: taxablePaise + shippingPaise + taxPaise,
    settings,
  }
}

export const orderInclude = {
  items: { include: { product: { select: { sku: true, name: true, tech: true, kind: true } } } },
  address: true,
  coupon: { select: { code: true } },
  payments: { select: { status: true, method: true, amountPaise: true, createdAt: true } },
} as const
