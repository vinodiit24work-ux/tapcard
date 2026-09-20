import nodemailer from 'nodemailer'
import { env } from '../lib/env.js'

/**
 * Transactional email.
 *
 * Configured with a single `SMTP_URL`, so any provider works without code changes.
 * When it is not configured the app keeps working: nothing is sent, the message is
 * logged in development, and callers still receive the link so a human can send it.
 * Silently pretending an email went out would be worse than admitting it did not.
 */
const transporter = env.SMTP_URL ? nodemailer.createTransport(env.SMTP_URL) : null

export const emailConfigured = Boolean(transporter)

interface Mail {
  to: string
  subject: string
  heading: string
  body: string[]
  action?: { label: string; url: string }
  footer?: string
}

/** One template, so every message looks like it came from the same company. */
function render({ heading, body, action, footer }: Mail) {
  const text = [heading, '', ...body, action ? `\n${action.label}: ${action.url}` : '', footer ? `\n${footer}` : '']
    .filter(Boolean)
    .join('\n')

  const html = `<!doctype html><html><body style="margin:0;background:#f2f3f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#13151d">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:16px;border:1px solid #e1e4ee">
        <tr><td style="padding:28px 28px 0">
          <span style="display:inline-block;width:26px;height:26px;border-radius:8px;background:#5b4bff;vertical-align:middle"></span>
          <span style="font-size:17px;font-weight:800;letter-spacing:-.02em;vertical-align:middle;margin-left:8px">TapCard</span>
        </td></tr>
        <tr><td style="padding:22px 28px 0">
          <h1 style="margin:0;font-size:21px;font-weight:800;letter-spacing:-.02em">${escape(heading)}</h1>
          ${body.map((p) => `<p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#4b5163">${escape(p)}</p>`).join('')}
        </td></tr>
        ${action ? `<tr><td style="padding:24px 28px 0">
          <a href="${escape(action.url)}" style="display:inline-block;background:#5b4bff;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:13px 22px;border-radius:10px">${escape(action.label)}</a>
          <p style="margin:12px 0 0;font-size:12px;color:#878da0;word-break:break-all">${escape(action.url)}</p>
        </td></tr>` : ''}
        <tr><td style="padding:24px 28px 28px">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#878da0;border-top:1px solid #e1e4ee;padding-top:16px">
            ${escape(footer ?? 'You are receiving this because someone used this address on TapCard.')}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`

  return { text, html }
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Never throws: a failed email must not fail the request that triggered it. */
export async function send(mail: Mail): Promise<{ sent: boolean; reason?: string }> {
  const { text, html } = render(mail)

  if (!transporter) {
    if (env.NODE_ENV !== 'production') {
      console.info(`\n[email → ${mail.to}] ${mail.subject}\n${text}\n`)
    }
    return { sent: false, reason: 'email_not_configured' }
  }

  try {
    await transporter.sendMail({ from: env.EMAIL_FROM, to: mail.to, subject: mail.subject, text, html })
    return { sent: true }
  } catch (e) {
    console.error('[email] delivery failed', e instanceof Error ? e.message : e)
    return { sent: false, reason: 'delivery_failed' }
  }
}

/* ------------------------------------------------------------- messages -- */

export const emails = {
  verify: (to: string, name: string, url: string) =>
    send({
      to,
      subject: 'Confirm your email for TapCard',
      heading: `Welcome, ${name.split(' ')[0]}`,
      body: ['Confirm this address and your review card is ready to set up.', 'This link works for the next 24 hours.'],
      action: { label: 'Confirm my email', url },
    }),

  reset: (to: string, url: string) =>
    send({
      to,
      subject: 'Reset your TapCard password',
      heading: 'Reset your password',
      body: ['Use the link below to choose a new password. It expires in 30 minutes.', 'If you did not ask for this, you can safely ignore it — nothing has changed.'],
      action: { label: 'Choose a new password', url },
    }),

  approval: (to: string, businessName: string, url: string) =>
    send({
      to,
      subject: `Your TapCard for ${businessName} is ready`,
      heading: 'Your TapCard is ready',
      body: [
        `We have finished building the review card for ${businessName}.`,
        'Have a look and let us know if anything needs changing. Nothing gets printed until you approve it.',
      ],
      action: { label: 'Review my card', url },
      footer: 'Questions? Just reply to this email and a person will answer.',
    }),

  requestReceived: (to: string, businessName: string, reference: string) =>
    send({
      to,
      subject: `We have your TapCard request (${reference})`,
      heading: 'Thanks — we have your details',
      body: [
        `Your request for ${businessName} is with our team. Your reference is ${reference}.`,
        'We will call you within one working day to confirm the details, then build your review card and send it over for approval.',
      ],
    }),

  approved: (to: string, businessName: string) =>
    send({
      to,
      subject: `${businessName} approved their TapCard`,
      heading: 'Card approved',
      body: [`${businessName} has approved their review card. It is ready to go into production.`],
    }),
}
