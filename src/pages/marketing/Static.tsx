import { useState, type ReactNode } from 'react'
import { Mail, MapPin, MessageCircle, Phone, Target, Users, Zap } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Form'
import { Accordion, Section, SectionHead, faqs } from '@/features/marketing/Bits'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function About() {
  useDocumentTitle('About')
  return (
    <>
      <Section className="pb-8">
        <SectionHead eyebrow="About us" title="We build the simplest way for a small business to be reachable" description="TapCard started when a friend who runs a café kept reprinting visiting cards every time her number or menu changed. One QR later, she never had to again." />
      </Section>
      <Section className="pt-0">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Target, t: 'Our mission', d: 'Give every Indian business — from a two-table café to a ten-clinic chain — a professional online presence they can set up themselves in five minutes.' },
            { icon: Users, t: 'Who we build for', d: 'Owners who serve customers all day and do not have time for a website project, a developer or a monthly retainer.' },
            { icon: Zap, t: 'How we work', d: 'Ship what gets used. Every feature on TapCard exists because businesses asked for it more than once.' },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-ink-200 bg-white p-7">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><c.icon className="size-5" /></div>
              <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{c.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{c.d}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section className="border-y border-ink-200 bg-ink-50/60">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-ink-900">What we believe</h2>
          <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-ink-600">
            <p>A business card should not go out of date the moment it is printed. If your number changes, your card should change with it — everywhere, instantly.</p>
            <p>Customers should never have to install anything to reach you. A camera and a browser are enough, and that is all TapCard ever asks of them.</p>
            <p>Analytics should tell you what to do next, not harvest your customers. We measure what was tapped and on what kind of device, and nothing more.</p>
            <p>Good design is not a luxury for small businesses. The card a customer sees at your counter should look as considered as the one a funded startup hands out.</p>
          </div>
          <ButtonLink to="/register" className="mt-9" size="lg">Create your free card</ButtonLink>
        </div>
      </Section>
    </>
  )
}

export function Contact() {
  useDocumentTitle('Contact')
  const toast = useToast()
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', topic: 'sales', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Please tell us your name.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email address.'
    if (form.message.trim().length < 10) errs.message = 'A little more detail helps us help you.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      setSent(true)
      toast('Message sent — we usually reply within a day')
    }, 900)
  }

  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          <SectionHead center={false} eyebrow="Contact" title="Talk to a human" description="Questions about plans, bulk NFC orders or something not working? We answer every message." />
          <dl className="mt-9 space-y-5">
            {[
              { icon: Mail, t: 'Email', v: 'hello@tapcard.in', href: 'mailto:hello@tapcard.in' },
              { icon: MessageCircle, t: 'WhatsApp', v: '+91 98765 43210', href: 'https://wa.me/919876543210' },
              { icon: Phone, t: 'Phone (Mon–Sat, 10am–7pm)', v: '+91 80 4567 8900', href: 'tel:+918045678900' },
              { icon: MapPin, t: 'Office', v: 'Indiranagar, Bengaluru 560038', href: '' },
            ].map((c) => (
              <div key={c.t} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><c.icon className="size-5" /></div>
                <div>
                  <dt className="text-[13px] font-medium text-ink-500">{c.t}</dt>
                  <dd className="text-[15px] font-semibold text-ink-900">{c.href ? <a href={c.href} className="hover:text-brand-700">{c.v}</a> : c.v}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft sm:p-8">
          {sent ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><MessageCircle className="size-7" /></div>
              <h3 className="mt-5 font-display text-xl font-bold text-ink-900">Message received</h3>
              <p className="mt-2 text-[15px] text-ink-500">Thanks {form.name.split(' ')[0]} — we will reply to {form.email} within one working day.</p>
              <Button variant="secondary" className="mt-6" onClick={() => { setSent(false); setForm({ name: '', email: '', topic: 'sales', message: '' }) }}>Send another message</Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <h3 className="font-display text-lg font-bold text-ink-900">Send us a message</h3>
              <Input label="Your name" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rahul Verma" />
              <Input label="Email" type="email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@business.in" />
              <Select label="What is this about?" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                <option value="sales">Plans & pricing</option>
                <option value="bulk">Bulk / NFC orders</option>
                <option value="support">Help with my card</option>
                <option value="partner">Partnerships</option>
              </Select>
              <Textarea label="Message" value={form.message} error={errors.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us a little about your business and what you need." />
              <Button type="submit" full size="lg" loading={busy}>Send message</Button>
              <p className="text-center text-xs text-ink-400">We reply within one working day.</p>
            </form>
          )}
        </div>
      </div>
    </Section>
  )
}

export function Faq() {
  useDocumentTitle('FAQ')
  return (
    <>
      <Section className="pb-8"><SectionHead eyebrow="FAQ" title="Frequently asked questions" description="Everything about cards, QR codes, NFC, billing and privacy." /></Section>
      <div className="container-page pb-20"><div className="mx-auto max-w-3xl"><Accordion items={faqs} /></div></div>
      <Section className="border-t border-ink-200 bg-ink-50/60">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-ink-900">Still have a question?</h2>
          <ButtonLink to="/contact" className="mt-6">Contact us</ButtonLink>
        </div>
      </Section>
    </>
  )
}

function Legal({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  useDocumentTitle(title)
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-ink-500">Last updated {updated}</p>
        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink-600 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink-900 [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
        <div className="mt-12 rounded-2xl border border-ink-200 bg-ink-50 p-5 text-sm text-ink-600">
          Questions about this policy? Write to <a className="font-semibold text-brand-700 hover:underline" href="mailto:legal@tapcard.in">legal@tapcard.in</a>.
        </div>
      </div>
    </Section>
  )
}

export function Privacy() {
  return (
    <Legal title="Privacy Policy" updated="1 September 2026">
      <section><h2>What we collect</h2><p>For account holders we store your name, email address, business details and the content you add to your card. For payments we store an order reference and the payment status returned by Razorpay — never your card number, UPI PIN or bank credentials.</p></section>
      <section><h2>Analytics on your card</h2><p>When someone opens a card we record the event type (scan, view or which button was tapped), a coarse device category, approximate city derived at request time, and a timestamp. We do not set advertising cookies, we do not fingerprint visitors, and we do not build cross-site profiles.</p></section>
      <section><h2>How we use it</h2><ul><li>To run your account and keep your card online</li><li>To show you analytics about your own card</li><li>To process orders, subscriptions and invoices</li><li>To send service email such as receipts and password resets</li></ul></section>
      <section><h2>Sharing</h2><p>We share data only with processors who help us operate: our payment gateway (Razorpay), our email provider, our hosting and storage providers. We do not sell personal data to anyone, for any purpose.</p></section>
      <section><h2>Your rights</h2><p>You can export or delete your data at any time from Settings, or by writing to us. On deletion your card is taken offline and personal data is removed from live systems within 30 days, except records we must retain for tax and accounting.</p></section>
      <section><h2>Security</h2><p>Passwords are hashed, traffic is encrypted in transit, and payment verification happens on our servers rather than in your browser.</p></section>
    </Legal>
  )
}

export function Terms() {
  return (
    <Legal title="Terms of Service" updated="1 September 2026">
      <section><h2>Agreement</h2><p>By creating an account you agree to these terms. TapCard is operated by TapCard Technologies Pvt. Ltd., registered in India.</p></section>
      <section><h2>Your account</h2><p>You are responsible for the accuracy of your business information and for keeping your login credentials secure. One person or business per account unless you are on a plan that supports team members.</p></section>
      <section><h2>Acceptable use</h2><ul><li>Do not impersonate another business or person</li><li>Do not publish unlawful, misleading or infringing content</li><li>Do not use TapCard links for phishing, malware or spam</li><li>Do not attempt to disrupt, overload or reverse-engineer the service</li></ul><p>We may suspend a card that breaches these rules, and will tell you why.</p></section>
      <section><h2>Your content</h2><p>You keep ownership of everything you upload. You grant us the licence needed to host and display it as part of the service.</p></section>
      <section><h2>Plans and payment</h2><p>Paid plans renew automatically until cancelled. Prices are shown exclusive of GST, which is added at checkout. We may change prices with at least 30 days' notice; your current period is unaffected.</p></section>
      <section><h2>Availability</h2><p>We aim for high availability but do not guarantee uninterrupted service. Planned maintenance is announced in advance where possible.</p></section>
      <section><h2>Liability</h2><p>To the extent permitted by law, our total liability is limited to the amount you paid us in the three months before the claim.</p></section>
      <section><h2>Governing law</h2><p>These terms are governed by Indian law, with jurisdiction in the courts of Bengaluru, Karnataka.</p></section>
    </Legal>
  )
}

export function Refund() {
  return (
    <Legal title="Refund & Cancellation Policy" updated="1 September 2026">
      <section><h2>Subscriptions</h2><p>You can cancel a paid plan at any time from Billing. Your plan stays active until the end of the period you have paid for, then drops to Free — your card stays online either way. We do not charge a cancellation fee.</p><p>If you were charged by mistake, or a renewal went through after you intended to cancel, write to us within 7 days and we will refund it in full.</p></section>
      <section><h2>Physical cards and stands</h2><p>Because every card is printed with your own details, orders can be changed or cancelled free of charge until they enter production. You will see the status on your Orders page.</p><ul><li><strong>Before production:</strong> full refund</li><li><strong>Damaged or defective on arrival:</strong> free replacement or full refund — send photos within 7 days of delivery</li><li><strong>Printing error on our side:</strong> free reprint, no return needed</li><li><strong>Correct item, changed your mind:</strong> personalised items cannot be resold, so these are not returnable</li></ul></section>
      <section><h2>How refunds are paid</h2><p>Approved refunds go back to the original payment method through Razorpay, typically within 5–7 working days depending on your bank.</p></section>
      <section><h2>How to request one</h2><p>Email <a className="font-semibold text-brand-700" href="mailto:support@tapcard.in">support@tapcard.in</a> or raise a ticket from your dashboard with your order number. We respond within one working day.</p></section>
    </Legal>
  )
}
