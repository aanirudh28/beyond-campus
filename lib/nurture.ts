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

export interface WeeklyCaseRow { title: string; prompt: string; hint: string | null }

export function weeklyCaseSubject(title: string) {
  return `This week's case: ${title}`
}

// Body for the Wednesday weekly-case drip (wrap with emailShell). Shared by the
// nurture cron and the admin test-send, so a preview is identical to the real send.
export function weeklyCaseBody(c: WeeklyCaseRow) {
  return `
    <h1 style="font-size: 22px; margin: 0 0 12px;">🧩 This week's case</h1>
    <p style="color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">${c.title}</p>
    <p style="color: rgba(255,255,255,0.75); font-size: 15px; line-height: 1.7; white-space: pre-line;">${c.prompt}</p>
    ${c.hint ? `<div style="background: rgba(79,124,255,0.08); border: 1px solid rgba(79,124,255,0.2); border-radius: 12px; padding: 14px 16px; margin: 16px 0;"><p style="color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.6; margin: 0;"><strong style="color: #93BBFF;">Framework nudge:</strong> ${c.hint}</p></div>` : ''}
    <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Structure your answer out loud before reaching for a framework. Practising the structure is what separates shortlists from rejections.</p>
    ${ctaButton(`${SITE}/resources/consulting`, 'More casebooks to practise →')}`
}
