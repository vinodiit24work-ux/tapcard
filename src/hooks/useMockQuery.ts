import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export type QueryStatus = 'loading' | 'error' | 'empty' | 'success'

/**
 * Phase 1 stand-in for a data hook. Simulates latency and lets QA force a state with
 * ?state=loading | error | empty. In Phase 3 this is replaced by real service calls.
 */
export function useMockQuery<T>(data: T, opts: { delay?: number; isEmpty?: (d: T) => boolean } = {}) {
  const { delay = 650, isEmpty } = opts
  const [params] = useSearchParams()
  const forced = params.get('state')
  const [tick, setTick] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const t = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(t)
  }, [delay, tick])

  const retry = useCallback(() => setTick((n) => n + 1), [])

  let status: QueryStatus = 'success'
  if (forced === 'loading' || !ready) status = 'loading'
  else if (forced === 'error') status = 'error'
  else if (forced === 'empty' || (isEmpty && isEmpty(data))) status = 'empty'

  return { status, data, retry, isLoading: status === 'loading' }
}
