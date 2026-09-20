import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastTone = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}
const Ctx = createContext<{ toast: (m: string, t?: ToastTone) => void } | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const toast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = Date.now() + Math.random()
    setItems((s) => [...s, { id, message, tone }])
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3200)
  }, [])
  const value = useMemo(() => ({ toast }), [toast])
  const Icon = { success: CheckCircle2, error: XCircle, info: Info }
  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4">
        {items.map((t) => {
          const I = Icon[t.tone]
          return (
            <div key={t.id} className="pointer-events-auto flex animate-pop items-center gap-2.5 rounded-xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-float">
              <I className={cn('size-4.5', t.tone === 'success' && 'text-emerald-400', t.tone === 'error' && 'text-red-400', t.tone === 'info' && 'text-sky-400')} />
              {t.message}
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useToast must be used within ToastProvider')
  return c.toast
}
