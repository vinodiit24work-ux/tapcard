import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form'
import { useAuth } from '@/store/auth'
import { api } from '@/services/ownerApi'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/cn'

const emailOk = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)

function GoogleButton({ label }: { label: string }) {
  const toast = useToast()
  return (
    <Button variant="secondary" full size="lg" onClick={() => toast('Google sign-in is connected in a later phase', 'info')} icon={
      <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
        <path fill="#4285F4" d="M23 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.17a5.3 5.3 0 0 1-2.29 3.47v2.89h3.7C21.74 18.8 23 15.8 23 12.27z" />
        <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1.03 7.6-2.78l-3.71-2.89c-1.03.69-2.35 1.1-3.89 1.1-2.99 0-5.53-2.02-6.43-4.74H1.73v2.98A11.49 11.49 0 0 0 12 23.5z" />
        <path fill="#FBBC05" d="M5.57 14.19a6.9 6.9 0 0 1 0-4.38V6.83H1.73a11.5 11.5 0 0 0 0 10.34l3.84-2.98z" />
        <path fill="#EA4335" d="M12 5.07c1.69 0 3.2.58 4.39 1.72l3.29-3.29C17.7 1.63 15.1.5 12 .5 7.54.5 3.68 3.06 1.73 6.83l3.84 2.98C6.47 7.09 9.01 5.07 12 5.07z" />
      </svg>
    }>{label}</Button>
  )
}

function Divider() {
  return (
    <div className="relative my-5 text-center">
      <span className="absolute inset-x-0 top-1/2 h-px bg-ink-200" />
      <span className="relative bg-white px-3 text-xs font-medium text-ink-400">or</span>
    </div>
  )
}

export function Login() {
  useDocumentTitle('Log in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!emailOk(email)) errs.email = 'Enter a valid email address.'
    if (password.length < 6) errs.password = 'Password must be at least 6 characters.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    login(email, password)
      .then((u) => {
        toast(`Welcome back, ${u.name.split(' ')[0]}`)
        navigate(u.role === 'ADMIN' ? '/admin' : '/dashboard')
      })
      .catch((err: Error) => setErrors({ password: err.message }))
      .finally(() => setBusy(false))
  }

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-[28px] font-extrabold tracking-tight text-ink-900">Welcome back</h1>
      <p className="mt-2 text-[15px] text-ink-500">Log in to manage your card, QR and analytics.</p>
      <div className="mt-7"><GoogleButton label="Continue with Google" /></div>
      <Divider />
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" placeholder="you@business.in" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} leading={<Mail className="size-4" />} />
        <Input
          label="Password"
          type={show ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
          right={<Link to="/forgot-password" className="text-[13px] font-medium text-brand-700 hover:underline">Forgot?</Link>}
        />
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-600">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
          {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />} Show password
        </label>
        <Button type="submit" full size="lg" loading={busy}>Log in</Button>
      </form>
      <p className="mt-6 text-center text-[14px] text-ink-500">
        New to TapCard? <Link to="/register" className="font-semibold text-brand-700 hover:underline">Create a free card</Link>
      </p>
      <div className="mt-6 rounded-xl border border-ink-200 bg-ink-50 p-3 text-center text-xs text-ink-500">
        Demo: any email works. Use one starting with <span className="font-mono font-semibold text-ink-700">admin@</span> for the admin panel.
      </div>
    </div>
  )
}

export function Register() {
  useDocumentTitle('Create your free card')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const strength = Math.min(4, (form.password.length >= 8 ? 1 : 0) + (/[A-Z]/.test(form.password) ? 1 : 0) + (/\d/.test(form.password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(form.password) ? 1 : 0))
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.name.trim().length < 2) errs.name = 'Please enter your name.'
    if (!emailOk(form.email)) errs.email = 'Enter a valid email address.'
    if (form.password.length < 8) errs.password = 'Use at least 8 characters.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    register(form.name, form.email, form.password)
      .then(() => navigate('/onboarding'))
      .catch((err: Error) => setErrors({ email: err.message }))
      .finally(() => setBusy(false))
  }

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-[28px] font-extrabold tracking-tight text-ink-900">Create your free card</h1>
      <p className="mt-2 text-[15px] text-ink-500">No credit card needed. Live in about five minutes.</p>
      <div className="mt-7"><GoogleButton label="Sign up with Google" /></div>
      <Divider />
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Your name" placeholder="Rahul Verma" autoComplete="name" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Work email" type="email" autoComplete="email" placeholder="you@business.in" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} leading={<Mail className="size-4" />} />
        <div>
          <Input label="Password" type={show ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={cn('h-1 flex-1 rounded-full', i < strength ? ['bg-red-400', 'bg-amber-400', 'bg-lime-500', 'bg-emerald-500'][strength - 1] : 'bg-ink-200')} />
                ))}
              </div>
              <span className="text-xs font-medium text-ink-500">{labels[strength]}</span>
            </div>
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-600">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" /> Show password
        </label>
        <Button type="submit" full size="lg" loading={busy}>Create my card</Button>
        <p className="text-center text-xs leading-relaxed text-ink-400">
          By continuing you agree to our <Link to="/terms" className="underline hover:text-ink-600">Terms</Link> and <Link to="/privacy" className="underline hover:text-ink-600">Privacy Policy</Link>.
        </p>
      </form>
      <p className="mt-6 text-center text-[14px] text-ink-500">
        Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link>
      </p>
    </div>
  )
}

export function ForgotPassword() {
  useDocumentTitle('Reset password')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailOk(email)) return setError('Enter a valid email address.')
    setError('')
    setBusy(true)
    api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
      .catch(() => undefined) // the endpoint answers the same way either way
      .finally(() => { setBusy(false); setSent(true) })
  }

  if (sent)
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Mail className="size-7" /></div>
        <h1 className="mt-5 font-display text-[26px] font-extrabold text-ink-900">Check your inbox</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-500">If an account exists for <span className="font-semibold text-ink-800">{email}</span>, we have sent a link to reset your password. It expires in 30 minutes.</p>
        <Button variant="secondary" full size="lg" className="mt-7" onClick={() => setSent(false)}>Use a different email</Button>
        <Link to="/login" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" /> Back to log in</Link>
      </div>
    )

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-[28px] font-extrabold tracking-tight text-ink-900">Reset your password</h1>
      <p className="mt-2 text-[15px] text-ink-500">Enter the email on your account and we will send a reset link.</p>
      <form onSubmit={submit} noValidate className="mt-7 space-y-4">
        <Input label="Email" type="email" placeholder="you@business.in" value={email} error={error} onChange={(e) => setEmail(e.target.value)} leading={<Mail className="size-4" />} />
        <Button type="submit" full size="lg" loading={busy}>Send reset link</Button>
      </form>
      <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" /> Back to log in</Link>
    </div>
  )
}

export function VerifyEmail() {
  useDocumentTitle('Verify your email')
  const { user, refresh } = useAuth()
  const [params] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState(params.get('token') ?? '')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const toast = useToast()

  const confirm = () => {
    if (!code.trim()) return setError('Paste the link or code from your email.')
    setBusy(true)
    setError('')
    api('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token: code.trim() }) })
      .then(async () => {
        await refresh()
        toast('Email verified')
        navigate('/onboarding')
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setBusy(false))
  }

  return (
    <div className="animate-fade-up text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><ShieldCheck className="size-7" /></div>
      <h1 className="mt-5 font-display text-[26px] font-extrabold text-ink-900">Verify your email</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
        We sent a verification link to <span className="font-semibold text-ink-800">{user?.email ?? params.get('email') ?? 'your email'}</span>. Paste the code from
        that email to activate your account.
      </p>
      <div className="mt-7 text-left">
        <Input label="Verification code" value={code} error={error} onChange={(e) => setCode(e.target.value)} placeholder="Paste the code from your email" />
      </div>
      <Button full size="lg" className="mt-4" loading={busy} onClick={confirm} icon={<Check className="size-4" />}>Verify and continue</Button>
      <button onClick={() => navigate('/onboarding')} className="mt-4 w-full text-[14px] font-medium text-ink-500 hover:text-ink-800">Skip for now</button>
      <p className="mt-5 text-[14px] text-ink-500">
        Did not get it?{' '}
        <button
          onClick={() =>
            api<{ verifyToken?: string }>('/auth/resend-verification', { method: 'POST' })
              .then((r) => { if (r.verifyToken) setCode(r.verifyToken); toast('Verification email resent', 'info') })
              .catch((e: Error) => setError(e.message))
          }
          className="font-semibold text-brand-700 hover:underline"
        >
          Resend code
        </button>
      </p>
    </div>
  )
}
