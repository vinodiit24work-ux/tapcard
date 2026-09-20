import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '@/services/ownerApi'

export interface User {
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  verified: boolean
}

interface AuthCtx {
  user: User | null
  /** False until the first session check finishes, so guards do not flash. */
  ready: boolean
  hasBusiness: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

/**
 * Sessions live in httpOnly cookies the browser cannot read, so the current user is
 * resolved from the API rather than from localStorage.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [hasBusiness, setHasBusiness] = useState(false)
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const me = await api<{ user: User; hasBusiness: boolean }>('/auth/me')
      setUser(me.user)
      setHasBusiness(me.hasBusiness)
    } catch {
      // An expired access token can often be exchanged silently before giving up.
      try {
        const r = await api<{ user: User }>('/auth/refresh', { method: 'POST' })
        setUser(r.user)
        const me = await api<{ user: User; hasBusiness: boolean }>('/auth/me')
        setHasBusiness(me.hasBusiness)
      } catch {
        setUser(null)
        setHasBusiness(false)
      }
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    setUser(r.user)
    const me = await api<{ hasBusiness: boolean }>('/auth/me').catch(() => ({ hasBusiness: false }))
    setHasBusiness(me.hasBusiness)
    return r.user
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const r = await api<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
    setUser(r.user)
    setHasBusiness(false)
    return r.user
  }, [])

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined)
    setUser(null)
    setHasBusiness(false)
  }, [])

  const value = useMemo(() => ({ user, ready, hasBusiness, login, register, logout, refresh }), [user, ready, hasBusiness, login, register, logout, refresh])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used within AuthProvider')
  return c
}
