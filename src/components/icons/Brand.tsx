import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

const base = (size = 20, p: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
})

export function InstagramIcon({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function FacebookIcon({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V8.5z" />
    </svg>
  )
}

export function LinkedinIcon({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V16M8 7.8v.01M12 16v-5.5M12 12.5c0-1.4 1-2 2-2s2.2.6 2.2 2.2V16" />
    </svg>
  )
}

export function YoutubeIcon({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.2 9.4v5.2l4.4-2.6-4.4-2.6z" fill="currentColor" />
    </svg>
  )
}

export function WhatsappIcon({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 8 19.3l-4.5 1.2z" />
      <path d="M9 8.8c.3 2.6 2.6 4.9 5.3 5.5l1-1.2-1.7-.9-.8.5c-.9-.4-1.6-1.1-2-2l.5-.8-.9-1.7L9 8.8z" fill="currentColor" stroke="none" />
    </svg>
  )
}
