import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type { CartLine } from '@/types'
import { commerceConfig, productById } from '@/data/commerce'
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
  coupon: string | null
  couponError: string | null
  totals: Totals
  add: (line: Omit<CartLine, 'id'>) => void
  setQty: (id: string, qty: number) => void
  update: (id: string, patch: Partial<CartLine>) => void
  remove: (id: string) => void
  clear: () => void
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
}

const Ctx = createContext<CartCtx | null>(null)

export function computeTotals(lines: CartLine[], coupon: string | null): Totals {
  const subtotal = lines.reduce((s, l) => s + (productById(l.productId)?.price ?? 0) * l.qty, 0)
  const c = coupon ? commerceConfig.coupons[coupon as keyof typeof commerceConfig.coupons] : undefined
  let discount = 0
  if (c && subtotal >= c.min) discount = c.kind === 'percent' ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal)
  const taxable = subtotal - discount
  const shipping = lines.length === 0 || subtotal >= commerceConfig.freeShippingOver ? 0 : commerceConfig.shippingFlat
  const tax = Math.round(taxable * commerceConfig.gstRate)
  return { subtotal, discount, shipping, tax, total: taxable + shipping + tax, count: lines.reduce((s, l) => s + l.qty, 0) }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = usePersistentState<CartLine[]>('tc.cart', [])
  const [coupon, setCoupon] = usePersistentState<string | null>('tc.coupon', null)
  const [couponError, setCouponError] = usePersistentState<string | null>('tc.couponErr', null)

  const add = useCallback((line: Omit<CartLine, 'id'>) => setLines((ls) => [...ls, { ...line, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }]), [setLines])
  const setQty = useCallback((id: string, qty: number) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty: Math.min(500, Math.max(1, qty)) } : l))), [setLines])
  const update = useCallback((id: string, patch: Partial<CartLine>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l))), [setLines])
  const remove = useCallback((id: string) => setLines((ls) => ls.filter((l) => l.id !== id)), [setLines])
  const clear = useCallback(() => {
    setLines([])
    setCoupon(null)
    setCouponError(null)
  }, [setLines, setCoupon, setCouponError])

  const applyCoupon = useCallback(
    (raw: string) => {
      const code = raw.trim().toUpperCase()
      const c = commerceConfig.coupons[code as keyof typeof commerceConfig.coupons]
      const sub = computeTotals(lines, null).subtotal
      if (!c) {
        setCouponError('That code is not valid.')
        return false
      }
      if (sub < c.min) {
        setCouponError(`Add items worth ₹${c.min} to use this code.`)
        return false
      }
      setCoupon(code)
      setCouponError(null)
      return true
    },
    [lines, setCoupon, setCouponError],
  )
  const removeCoupon = useCallback(() => {
    setCoupon(null)
    setCouponError(null)
  }, [setCoupon, setCouponError])

  const totals = useMemo(() => computeTotals(lines, coupon), [lines, coupon])
  const value = useMemo(() => ({ lines, coupon, couponError, totals, add, setQty, update, remove, clear, applyCoupon, removeCoupon }), [lines, coupon, couponError, totals, add, setQty, update, remove, clear, applyCoupon, removeCoupon])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useCart = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be used within CartProvider')
  return c
}
