import { ButtonLink } from '@/components/ui/Button'
import { LogoMark } from '@/components/ui/Logo'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-6 text-center">
      <LogoMark className="size-12" />
      <p className="mt-6 font-mono text-[13px] font-bold text-brand-600">404</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-[15px] text-ink-500">The page you are looking for does not exist or has moved.</p>
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <ButtonLink to="/" size="lg">Back to home</ButtonLink>
        <ButtonLink to="/dashboard" size="lg" variant="secondary">Go to dashboard</ButtonLink>
      </div>
    </div>
  )
}
