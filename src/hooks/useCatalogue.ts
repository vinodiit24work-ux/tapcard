import { useEffect, useState } from 'react'
import { catalogueApi, type ApiPlan, type ApiProduct, type CommerceSettings } from '@/services/ownerApi'

export const DEFAULT_COMMERCE: CommerceSettings = {
  gstRatePercent: 18,
  shippingFlatPaise: 7900,
  freeShippingOverPaise: 99900,
  productionSlaDays: 5,
}

/**
 * Products, plans and commercial settings come from the database, so prices can change
 * without a deploy. The UI falls back to nothing rather than to stale hardcoded prices —
 * showing a wrong price is worse than showing a loading state.
 */
export function useCatalogue() {
  const [products, setProducts] = useState<ApiProduct[] | null>(null)
  const [plans, setPlans] = useState<ApiPlan[] | null>(null)
  const [commerce, setCommerce] = useState<CommerceSettings>(DEFAULT_COMMERCE)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let dead = false
    Promise.all([catalogueApi.products(), catalogueApi.plans(), catalogueApi.settings()])
      .then(([p, pl, c]) => {
        if (dead) return
        setProducts(p)
        setPlans(pl)
        if (c) setCommerce(c)
        setState('ready')
      })
      .catch(() => !dead && setState('error'))
    return () => { dead = true }
  }, [])

  return { products, plans, commerce, state }
}
