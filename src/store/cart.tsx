import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartLine } from '@/types'
import { catalogueApi, type ApiProduct, type CommerceSettings } from '@/services/ownerApi'
import { DEFAULT_COMMERCE } from '@/hooks/useCatalogue'
import { usePersistentState } from '@/hooks/usePersistentState'

export interface Totals {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  count: number
}

interface CartCtx {
  lines: CartLine[]
  products: ApiProduct[]
  commerce: CommerceSettings
  ready: boolean
  coupon: string | null
  couponError: string | null
  totals: Totals
  productFor: (id: string) => ApiProduct | undefined
  add: (line: Omit<CartLine, 'id'>) => void
  setQty: (id: string, qty: number) => void
  update: (id: string, patch: Partial<CartLine>) => void
  remove: (id: string) => void
  clear: () => void
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: () => void
}

const Ctx = createContext<CartCtx | null>(null)

/** Money is computed in paise from live prices, then shown in rupees at the edges. */
export function computeTotals(
  lines: CartLine[],
  products: ApiProduct[],
  commerce: CommerceSettings,
  discount: number,
): Totals {
  const subtotal = lines.reduce((sum, l) => {
    const p = products.find((x) => x.sku === l.productId)
    return sum + (p?.pricePaise ?? 0) * l.qty
  }, 0)
  const capped = Math.min(discount, subtotal)
  const taxable = subtotal - capped
  const shipping = lines.length === 0 || subtotal >= commerce.freeShippingOverPaise ? 0 : commerce.shippingFlatPaise
  const tax = Math.round((taxable * commerce.gstRatePercent) / 100)
  return {
    subtotal: subtotal / 100,
    discount: capped / 100,
    shipping: shipping / 100,
    tax: tax / 100,
    total: (taxable + shipping + tax) / 100,
    count: lines.reduce((s, l) => s + l.qty, 0),
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = usePersistentState<CartLine[]>('tc.cart', [])
  const [coupon, setCoupon] = usePersistentState<string | null>('tc.coupon', null)
  const [discountPaise, setDiscountPaise] = useState(0)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [commerce, setCommerce] = useState<CommerceSettings>(DEFAULT_COMMERCE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let dead = false
    Promise.all([catalogueApi.products(), catalogueApi.settings()])
      .then(([p, c]) => {
        if (dead) return
        setProducts(p)
        if (c) setCommerce(c)
      })
      .catch(() => undefined)
      .finally(() => !dead && setReady(true))
    return () => { dead = true }
  }, [])

  const productFor = useCallback((sku: string) => products.find((p) => p.sku === sku), [products])

  const add = useCallback(
    (line: Omit<CartLine, 'id'>) => setLines((ls) => [...ls, { ...line, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }]),
    [setLines],
  )
  const setQty = useCallback((id: string, qty: number) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty: Math.min(500, Math.max(1, qty)) } : l))), [setLines])
  const update = useCallback((id: string, patch: Partial<CartLine>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l))), [setLines])
  const remove = useCallback((id: string) => setLines((ls) => ls.filter((l) => l.id !== id)), [setLines])
  const clear = useCallback(() => {
    setLines([])
    setCoupon(null)
    setDiscountPaise(0)
    setCouponError(null)
  }, [setLines, setCoupon])

  /**
   * Coupons are validated by the server against the live subtotal. The client never
   * decides a discount — it only displays what the server allowed.
   */
  const applyCoupon = useCallback(
    async (raw: string) => {
      const code = raw.trim().toUpperCase()
      if (!code) return false
      const subtotalPaise = lines.reduce((s, l) => s + (products.find((p) => p.sku === l.productId)?.pricePaise ?? 0) * l.qty, 0)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/public/coupons/validate`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ code, subtotalPaise }),
        })
        const body = await res.json()
        if (!res.ok) {
          setCouponError(body?.error?.message ?? 'That code is not valid.')
          return false
        }
        setCoupon(code)
        setDiscountPaise(body.discountPaise)
        setCouponError(null)
        return true
      } catch {
        setCouponError('We could not check that code. Please try again.')
        return false
      }
    },
    [lines, products, setCoupon],
  )

  const removeCoupon = useCallback(() => {
    setCoupon(null)
    setDiscountPaise(0)
    setCouponError(null)
  }, [setCoupon])

  const totals = useMemo(() => computeTotals(lines, products, commerce, discountPaise), [lines, products, commerce, discountPaise])

  const value = useMemo(
    () => ({ lines, products, commerce, ready, coupon, couponError, totals, productFor, add, setQty, update, remove, clear, applyCoupon, removeCoupon }),
    [lines, products, commerce, ready, coupon, couponError, totals, productFor, add, setQty, update, remove, clear, applyCoupon, removeCoupon],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useCart = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be used within CartProvider')
  return c
}
