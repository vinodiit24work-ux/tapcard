import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export interface QROptions {
  fg: string
  bg: string
  margin: number
  logo?: string
}

/** Render a QR as a data URL (PNG) for previews and downloads. */
export function useQrDataUrl(text: string, o: QROptions, size = 512) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    let dead = false
    QRCode.toDataURL(text, { width: size, margin: o.margin, errorCorrectionLevel: o.logo ? 'H' : 'M', color: { dark: o.fg, light: o.bg } })
      .then((u) => !dead && setUrl(u))
      .catch(() => !dead && setUrl(''))
    return () => {
      dead = true
    }
  }, [text, o.fg, o.bg, o.margin, o.logo, size])
  return url
}

export async function qrSvg(text: string, o: QROptions) {
  return QRCode.toString(text, { type: 'svg', margin: o.margin, errorCorrectionLevel: o.logo ? 'H' : 'M', color: { dark: o.fg, light: o.bg } })
}

/** `size` is the ideal width; the code shrinks to fit a narrower container. */
export function QRImage({ text, options, size = 160, className }: { text: string; options?: Partial<QROptions>; size?: number; className?: string }) {
  const o: QROptions = { fg: '#0f1729', bg: '#ffffff', margin: 1, ...options }
  const url = useQrDataUrl(text, o, size * 3)
  return (
    <div className={className} style={{ width: size, maxWidth: '100%', aspectRatio: '1 / 1', position: 'relative', background: o.bg }}>
      {url ? (
        <img src={url} alt={`QR code for ${text}`} style={{ display: 'block', width: '100%', height: '100%' }} />
      ) : (
        <div className="skeleton size-full" />
      )}
      {o.logo && url && <img src={o.logo} alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white object-cover p-0.5" style={{ width: '22%', height: '22%' }} />}
    </div>
  )
}
