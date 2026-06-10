import crypto from 'crypto'

const SITE = 'https://www.beyond-campus.in'

export function unsubToken(email: string) {
  return crypto.createHmac('sha256', process.env.CRON_SECRET!).update(email.toLowerCase()).digest('hex')
}

export function unsubUrl(email: string) {
  return `${SITE}/api/nurture/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubToken(email)}`
}

// Dark-theme shell matching the site's transactional emails, with the
// legally-required unsubscribe link for marketing sends.
export function emailShell(body: string, email: string) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0B0B0F; border-radius: 16px; padding: 36px; color: white;">
    <div style="display: inline-block; padding: 6px 16px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); border-radius: 100px; font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px;">BEYOND CAMPUS</div>
    ${body}
    <p style="color: rgba(255,255,255,0.25); font-size: 11px; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
      You're getting this because you used a Beyond Campus tool or resource.
      <a href="${unsubUrl(email)}" style="color: rgba(255,255,255,0.4);">Unsubscribe</a> from these emails anytime.
    </p>
  </div>`
}

export function ctaButton(href: string, label: string) {
  return `<a href="${href}" style="display: inline-block; margin-top: 8px; padding: 13px 28px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); color: white; text-decoration: none; border-radius: 100px; font-weight: bold; font-size: 14px;">${label}</a>`
}
