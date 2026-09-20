import { useRef, useState } from 'react'
import { Check, Copy, Download, FileImage, Link2, Nfc, Printer, QrCode as QrIcon, Share2 } from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ColorField, Segmented, Switch } from '@/components/ui/Form'
import { QRImage, qrSvg } from '@/components/card/QRImage'
import { useCard } from '@/store/card'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { reviewUrl } from '@/lib/format'
import { cn } from '@/lib/cn'

const sizes = { small: 512, medium: 1024, large: 2048 }
type SizeKey = keyof typeof sizes

export function QrPage() {
  useDocumentTitle('QR & NFC')
  const { card } = useCard()
  const toast = useToast()
  const [fg, setFg] = useState('#0f1729')
  const [bg, setBg] = useState('#ffffff')
  const [margin, setMargin] = useState(2)
  const [size, setSize] = useState<SizeKey>('medium')
  const [withLogo, setWithLogo] = useState(false)
  const [copied, setCopied] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // The QR encodes the permanent review link, so reprints are never needed.
  const url = reviewUrl(card.slug)
  const opts = { fg, bg, margin, logo: withLogo ? card.logo : undefined }

  const downloadPng = async () => {
    const px = sizes[size]
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, url, { width: px, margin, errorCorrectionLevel: withLogo ? 'H' : 'M', color: { dark: fg, light: bg } })
    if (withLogo && card.logo) {
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      img.src = card.logo
      await new Promise((r) => { img.onload = r; img.onerror = r })
      const s = px * 0.2
      const o = (px - s) / 2
      ctx.fillStyle = bg
      ctx.fillRect(o - 8, o - 8, s + 16, s + 16)
      ctx.drawImage(img, o, o, s, s)
    }
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `${card.slug}-qr-${px}.png`
    a.click()
    toast(`PNG downloaded (${px}×${px})`)
  }

  const downloadSvg = async () => {
    const svg = await qrSvg(url, opts)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `${card.slug}-qr.svg`
    a.click()
    URL.revokeObjectURL(href)
    toast('SVG downloaded — best for printing')
  }

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast('Card link copied')
    setTimeout(() => setCopied(false), 1800)
  }

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: card.businessName, url })
      else copy()
    } catch { /* dismissed */ }
  }

  const print = () => {
    const w = window.open('', '_blank', 'width=720,height=900')
    if (!w || !printRef.current) return toast('Allow pop-ups to print your QR', 'error')
    w.document.write(`<html><head><title>${card.businessName} — QR</title><style>
      body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}
      h1{font-size:28px;margin:0 0 4px}p{color:#667085;margin:0 0 28px}
      .u{font-family:ui-monospace,monospace;font-size:14px;color:#475467;margin-top:20px}
      img{width:340px;height:340px}
    </style></head><body>${printRef.current.innerHTML}</body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 400)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">QR &amp; NFC</h1>
        <p className="mt-1 text-[15px] text-ink-500">Your QR code and NFC card open your review page — customers can rate you in seconds.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="flex min-w-0 flex-col items-center justify-center p-4 sm:p-10">
          <div ref={printRef} className="w-full max-w-sm">
            <div className="flex flex-col items-center rounded-3xl border border-ink-200 p-5 shadow-soft sm:p-6" style={{ background: bg }}>
              <h1 className="font-display text-lg font-bold" style={{ color: fg }}>{card.businessName}</h1>
              <p className="mb-4 text-[13px] opacity-70" style={{ color: fg }}>Scan for menu, contact & directions</p>
              <QRImage text={url} size={272} options={opts} />
              <p className="u mt-4 font-mono text-[12px] opacity-70" style={{ color: fg }}>{url.replace('https://', '')}</p>
            </div>
          </div>

          <div className="mt-7 flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <Button full icon={<Download className="size-4" />} onClick={downloadPng}>Download PNG</Button>
            <Button full variant="secondary" icon={<FileImage className="size-4" />} onClick={downloadSvg}>Download SVG</Button>
          </div>
          <div className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <Button full variant="secondary" icon={copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />} onClick={copy}>{copied ? 'Copied' : 'Copy URL'}</Button>
            <Button full variant="secondary" icon={<Share2 className="size-4" />} onClick={share}>Share</Button>
            <Button full variant="secondary" icon={<Printer className="size-4" />} onClick={print}>Print</Button>
          </div>

          <div className="mt-6 flex w-full max-w-md items-center gap-2 rounded-xl bg-ink-50 px-3.5 py-3">
            <Link2 className="size-4 shrink-0 text-ink-400" />
            <span className="truncate font-mono text-[13px] text-ink-700">{url}</span>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Customize" description="Print-safe by default" />
            <div className="space-y-5 p-5">
              <ColorField label="QR colour" value={fg} onChange={setFg} />
              <ColorField label="Background" value={bg} onChange={setBg} />
              <div>
                <p className="mb-2 text-[13px] font-medium text-ink-700">Quiet margin · {margin}</p>
                <input type="range" min={0} max={6} value={margin} onChange={(e) => setMargin(+e.target.value)} className="w-full accent-brand-600" aria-label="QR margin" />
                <p className="mt-1 text-[11px] text-ink-400">A margin of 2 or more scans most reliably.</p>
              </div>
              <div>
                <p className="mb-2 text-[13px] font-medium text-ink-700">Download size</p>
                <Segmented<SizeKey> value={size} onChange={setSize} options={[{ value: 'small', label: '512' }, { value: 'medium', label: '1024' }, { value: 'large', label: '2048' }]} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-ink-200 p-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink-900">Logo in centre</p>
                  <p className="text-[11px] text-ink-500">{card.logo ? 'Uses higher error correction' : 'Upload a logo in the builder first'}</p>
                </div>
                <Switch checked={withLogo && !!card.logo} onChange={setWithLogo} disabled={!card.logo} label="Show logo in QR" />
              </div>
              <div className={cn('rounded-xl p-3 text-[12px] leading-relaxed', contrastOk(fg, bg) ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900')}>
                {contrastOk(fg, bg) ? '✓ Good contrast — this will scan reliably.' : '⚠ Low contrast between QR and background. Dark on light scans best.'}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="NFC" description="Write this same link to any NFC tag or card" />
            <div className="space-y-3 p-5 pt-3">
              <div className="flex items-center gap-3 rounded-xl bg-ink-950 p-4 text-white">
                <Nfc className="size-7 shrink-0 text-brand-300" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">Tap to review</p>
                  <p className="truncate font-mono text-[11px] text-ink-400">{url}</p>
                </div>
              </div>
              <Button full variant="secondary" size="sm" icon={copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />} onClick={copy}>
                {copied ? 'Copied' : 'Copy NFC destination'}
              </Button>
              <p className="text-[12px] leading-relaxed text-ink-500">
                NFC cards we ship come pre-written. To program your own tag, write this URL as an NDEF record — the same link the QR
                encodes, so both open the same review page.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Printing tips" />
            <ul className="space-y-2.5 p-5 pt-3 text-[13px] leading-relaxed text-ink-600">
              <li className="flex gap-2"><QrIcon className="mt-0.5 size-3.5 shrink-0 text-brand-600" /> Use the SVG for anything printed — it stays sharp at any size.</li>
              <li className="flex gap-2"><QrIcon className="mt-0.5 size-3.5 shrink-0 text-brand-600" /> Print at 2cm × 2cm or larger for table tents and cards.</li>
              <li className="flex gap-2"><QrIcon className="mt-0.5 size-3.5 shrink-0 text-brand-600" /> Keep a clear white margin around the code.</li>
              <li className="flex gap-2"><QrIcon className="mt-0.5 size-3.5 shrink-0 text-brand-600" /> Add a line like “Scan to review us” — it roughly doubles scan rates.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

function luminance(hex: string) {
  const h = hex.replace('#', '')
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrastOk(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05) >= 4
}
