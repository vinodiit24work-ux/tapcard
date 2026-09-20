import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

const control =
  'block w-full rounded-[10px] border border-ink-200 bg-white px-3 text-sm text-ink-900 shadow-soft placeholder:text-ink-400 transition-colors ' +
  'hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 ' +
  'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-100'

interface FieldProps {
  label?: string
  hint?: string
  error?: string
  className?: string
  right?: ReactNode
}

export function Field({ label, hint, error, className, right, htmlFor, children }: FieldProps & { htmlFor?: string; children: ReactNode }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || right) && (
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-700">
              {label}
            </label>
          )}
          {right}
        </div>
      )}
      {children}
      {error ? (
        <p role="alert" className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-500">{hint}</p>
      )}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps & { leading?: ReactNode }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, hint, error, className, right, leading, id, ...rest }, ref) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <Field label={label} hint={hint} error={error} right={right} htmlFor={fid} className={className}>
      <div className="relative">
        {leading && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-400">{leading}</span>}
        <input ref={ref} id={fid} aria-invalid={!!error} className={cn(control, 'h-10', leading && 'pl-9')} {...rest} />
      </div>
    </Field>
  )
})

type TAProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps

export const Textarea = forwardRef<HTMLTextAreaElement, TAProps>(function Textarea({ label, hint, error, className, right, id, ...rest }, ref) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <Field label={label} hint={hint} error={error} right={right} htmlFor={fid} className={className}>
      <textarea ref={ref} id={fid} aria-invalid={!!error} className={cn(control, 'min-h-24 resize-y py-2.5 leading-relaxed')} {...rest} />
    </Field>
  )
})

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldProps

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, hint, error, className, right, id, children, ...rest }, ref) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <Field label={label} hint={hint} error={error} right={right} htmlFor={fid} className={className}>
      <select ref={ref} id={fid} aria-invalid={!!error} className={cn(control, 'h-10 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%23667085%27 stroke-width=%272%27%3E%3Cpath d=%27m4 6 4 4 4-4%27/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9')} {...rest}>
        {children}
      </select>
    </Field>
  )
})

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 disabled:opacity-50',
        checked ? 'bg-brand-600' : 'bg-ink-200',
      )}
    >
      <span className={cn('inline-block size-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
    </button>
  )
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id}>
      <div className="flex h-10 items-center gap-2 rounded-[10px] border border-ink-200 bg-white px-2 shadow-soft focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
        <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="size-6 cursor-pointer rounded border-0 bg-transparent p-0" />
        <input
          aria-label={`${label} hex`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          className="w-full bg-transparent font-mono text-sm uppercase text-ink-800 outline-none"
        />
      </div>
    </Field>
  )
}

export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string }) {
  return (
    <div role="radiogroup" className={cn('inline-flex w-full rounded-[10px] bg-ink-100 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all',
            value === o.value ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-800',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
