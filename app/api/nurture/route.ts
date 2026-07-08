export const runtime = 'nodejs'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { serviceClient } from '@/lib/tracker'
import { emailShell, ctaButton } from '@/lib/nurture'

// Daily drip sequences. One email max per address per run; hard cap per run
// keeps us inside Resend's free tier (100/day) alongside follow-up reminders.
const MAX_SENDS_PER_RUN = 70
const SITE = 'https://www.beyond-campus.in'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

interface Step {
  sequence: string
  step: number
  afterDays: number
  subject: string
  body: (name: string | null) => string
}

const TRACKER_STEPS: Step[] = [
  {
    sequence: 'tracker', step: 0, afterDays: 0,
    subject: 'Your job tracker is live — 3 quick wins for today',
    body: name => `
      <h1 style="font-size: 22px; margin: 0 0 12px;">${name ? `${name.split(' ')[0]}, you're` : "You're"} in 🎯</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Most students lose offers to chaos, not rejection — they forget who they applied to and never follow up. You just fixed that. Three things to do in your first 10 minutes:</p>
      <ol style="color: rgba(255,255,255,0.75); font-size: 14px; line-height: 2;">
        <li><strong style="color: white;">Smart-paste 5 jobs</strong> — paste any job link or JD, AI fills in the card</li>
        <li><strong style="color: white;">Set your weekly goal</strong> (⚙️ in the tracker) — 5 applications/week is the baseline that gets people hired</li>
        <li><strong style="color: white;">Generate one AI cold email</strong> — open any card → AI Writer tab</li>
      </ol>
      ${ctaButton(`${SITE}/tracker`, 'Open my tracker →')}`,
  },
  {
    sequence: 'tracker', step: 1, afterDays: 3,
    subject: 'The 3-day rule that doubles reply rates',
    body: () => `
      <h1 style="font-size: 22px; margin: 0 0 12px;">Nobody replies to the first email 📬</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">That's normal. Recruiters are drowning. The students who get replies are the ones who follow up within 3–5 days — politely, briefly, once or twice.</p>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Your tracker already schedules a follow-up date for every application. When one comes due, the AI Writer drafts the follow-up in 5 seconds — it even references when you originally applied.</p>
      ${ctaButton(`${SITE}/tracker`, 'Check my follow-ups →')}`,
  },
  {
    sequence: 'tracker', step: 2, afterDays: 7,
    subject: 'A week in — want a human to look at your strategy?',
    body: name => `
      <h1 style="font-size: 22px; margin: 0 0 12px;">${name ? `${name.split(' ')[0]}, the` : 'The'} tracker shows you <em>what's</em> happening. A mentor shows you <em>why</em>.</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">If your reply rate feels stuck, it's usually one of three things: the resume, the targeting, or the outreach. A 1:1 strategy session diagnoses which one in 15 minutes — personalized company targets, resume feedback, and an outreach plan.</p>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Students who've done it have landed shortlists at Deloitte, EY, and top startups — almost all off-campus.</p>
      ${ctaButton(`${SITE}/book`, 'Book a strategy session →')}`,
  },
]

const TRACKER_INACTIVE_STEP: Step = {
  sequence: 'tracker', step: 9, afterDays: 0,
  subject: 'Your pipeline misses you 👀',
  body: name => `
    <h1 style="font-size: 22px; margin: 0 0 12px;">${name ? `${name.split(' ')[0]}, your` : 'Your'} applications are getting cold</h1>
    <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">It's been a few days since anything moved on your board. Companies forget candidates fast — a quick follow-up or 3 fresh applications today puts you back in the game.</p>
    <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">The job hunt rewards boring consistency more than brilliance. 15 minutes, right now:</p>
    ${ctaButton(`${SITE}/tracker`, 'Revive my pipeline →')}`,
}

const ROAST_STEPS: Step[] = [
  {
    sequence: 'roast', step: 0, afterDays: 1,
    subject: 'Your resume got roasted. Now make it land interviews.',
    body: () => `
      <h1 style="font-size: 22px; margin: 0 0 12px;">Fixed resume → now what? 🎯</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">A sharp resume sitting on your desktop gets zero interviews. The next step is volume + follow-ups — and that's exactly what our free Job Tracker handles: a board for every application, automatic follow-up reminders, and AI that writes cold emails using <em>your actual resume highlights from the roast</em>.</p>
      ${ctaButton(`${SITE}/job-tracker`, 'Start tracking free →')}`,
  },
  {
    sequence: 'roast', step: 1, afterDays: 5,
    subject: 'The fastest fix for a stuck job hunt (15 minutes)',
    body: () => `
      <h1 style="font-size: 22px; margin: 0 0 12px;">AI told you what's wrong. A mentor tells you what to do.</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">The roast found the problems in your resume. A 1:1 strategy session goes further — a real mentor reviews your fixed resume, gives you a personalized list of companies to target, and hands you an outreach plan that actually fits your profile.</p>
      ${ctaButton(`${SITE}/book`, 'Book my session →')}`,
  },
]

const LEAD_STEPS: Step[] = [
  {
    sequence: 'lead', step: 0, afterDays: 2,
    subject: 'You grabbed the resource — here\'s the tool that uses it',
    body: () => `
      <h1 style="font-size: 22px; margin: 0 0 12px;">Templates are ammo. You still need a system. 🎯</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Cold email templates only work if you actually send them — consistently, with follow-ups, to the right companies. Our free Job Tracker turns that into a system: a board for every application, AI-written outreach, and reminders so nothing slips.</p>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Free forever. Sign in with Google, takes 30 seconds.</p>
      ${ctaButton(`${SITE}/job-tracker`, 'Start tracking free →')}`,
  },
  {
    sequence: 'lead', step: 1, afterDays: 6,
    subject: 'Off-campus placements aren\'t luck. They\'re a playbook.',
    body: () => `
      <h1 style="font-size: 22px; margin: 0 0 12px;">What if you didn't have to figure this out alone?</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">The Placement Cohort is 8 weeks of exactly that: weekly live sessions, personalized resume reviews, company targeting, and cold-outreach strategy — built for BBA/BCom and non-tech students chasing consulting, finance, and business roles off-campus.</p>
      ${ctaButton(`${SITE}/cohort`, 'See the Placement Cohort →')}`,
  },
]

// Apti launch (docs/aptitude/11): announce to the existing warm base, capped
// per run so the rollout spreads over days instead of starving the drips.
// Step 1 is gated on step 0's actual send date, not account age.
const APTI_MAX_PER_RUN = 30
const APTI_STEPS: Step[] = [
  {
    sequence: 'apti', step: 0, afterDays: 0,
    subject: 'We built the aptitude platform we wished existed. It\'s free.',
    body: name => `
      <h1 style="font-size: 22px; margin: 0 0 12px;">${name ? `${name.split(' ')[0]}, the` : 'The'} aptitude round just got beatable 🧮</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Every placement season, sharp students get filtered out by a 60-minute aptitude test — not because they can't do the maths, but because they practised randomly and never found out <em>why</em> they miss.</p>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">So we built <strong style="color: white;">Apti</strong>: 10 adaptive questions a day at your level, a rating that moves like chess Elo, your mistakes brought back until you beat them, and an honest readiness score for Deloitte, ICICI, HUL — whoever you're targeting.</p>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Free. Actually free — every question, every mock, every explanation. Forever.</p>
      ${ctaButton(`${SITE}/aptitude`, 'See how it works →')}`,
  },
  {
    sequence: 'apti', step: 1, afterDays: 4,
    subject: '8 questions tell you exactly where you stand',
    body: name => `
      <h1 style="font-size: 22px; margin: 0 0 12px;">${name ? `${name.split(' ')[0]}, most` : 'Most'} students prep blind. You don't have to.</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Apti's diagnostic takes 8 questions and about two minutes. At the end you get your starting rating, your two biggest gaps, and your first focus topic — the exact place your prep should begin.</p>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">From there it's 12 minutes a day. The set adapts to you, your mistakes come back on a schedule until you redeem them, and the rating tells you the truth about whether you're ready.</p>
      ${ctaButton(`${SITE}/aptitude`, 'Find my level →')}`,
  },
]

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const svc = serviceClient()
  const resend = new Resend(process.env.RESEND_API_KEY!)

  const [{ data: optoutRows }, { data: sentRows }, { data: trackerUsers }] = await Promise.all([
    svc.from('nurture_optouts').select('email'),
    svc.from('nurture_sends').select('email, sequence, step, sent_at'),
    svc.from('tracker_profiles').select('email, name, created_at, email_reminders_enabled'),
  ])

  const optouts = new Set((optoutRows || []).map(r => r.email.toLowerCase()))
  const sent = new Set((sentRows || []).map(r => `${r.email.toLowerCase()}|${r.sequence}|${r.step}`))
  const trackerEmails = new Set((trackerUsers || []).map(u => u.email.toLowerCase()))
  // when each address got the apti announcement — gates apti step 1 below
  const aptiAnnouncedAt = new Map<string, string>()
  for (const r of sentRows || []) {
    if (r.sequence === 'apti' && r.step === 0) aptiAnnouncedAt.set(r.email.toLowerCase(), r.sent_at)
  }
  const roastAudience = new Set<string>()
  const mailedThisRun = new Set<string>()
  let sends = 0

  const runStart = Date.now()
  const trySend = async (email: string, name: string | null, step: Step) => {
    const key = email.toLowerCase()
    if (sends >= MAX_SENDS_PER_RUN) return
    // leave headroom under the 60s function limit — the rest go next run
    if (Date.now() - runStart > 45_000) return
    if (optouts.has(key) || mailedThisRun.has(key)) return
    if (sent.has(`${key}|${step.sequence}|${step.step}`)) return
    try {
      // the SDK reports failures via `error`, it does NOT throw — a 429 from
      // Resend's ~2 req/s limit must not be recorded as sent
      const { error } = await resend.emails.send({
        from: 'Beyond Campus <bookings@beyond-campus.in>',
        to: email,
        subject: step.subject,
        html: emailShell(step.body(name), email),
      })
      if (error) return
      await svc.from('nurture_sends').insert({ email: key, sequence: step.sequence, step: step.step })
      mailedThisRun.add(key)
      sends++
      await new Promise(r => setTimeout(r, 550)) // stay under Resend's rate limit
    } catch { /* one bad address shouldn't kill the batch */ }
  }

  // ---- Tracker sequence (welcome / day 3 / day 7) ----
  for (const u of trackerUsers || []) {
    if (!u.email) continue
    for (const step of TRACKER_STEPS) {
      if (u.created_at <= daysAgo(step.afterDays)) {
        await trySend(u.email, u.name, step)
      }
    }
  }

  // ---- Tracker inactivity (has apps, nothing touched in 5 days) ----
  try {
    const { data: apps } = await svc.from('applications').select('user_id, updated_at').limit(10000)
    const { data: profiles } = await svc.from('tracker_profiles').select('user_id, email, name')
    const latestByUser = new Map<string, string>()
    for (const a of apps || []) {
      const cur = latestByUser.get(a.user_id)
      if (!cur || a.updated_at > cur) latestByUser.set(a.user_id, a.updated_at)
    }
    for (const p of profiles || []) {
      const latest = latestByUser.get(p.user_id)
      if (latest && latest < daysAgo(5) && p.email) {
        await trySend(p.email, p.name, TRACKER_INACTIVE_STEP)
      }
    }
  } catch { /* skip audience on error */ }

  // ---- Roast sequence (skip anyone already in the tracker) ----
  try {
    const { data: roasts } = await svc
      .from('roast_results')
      .select('email, created_at')
      .not('email', 'is', null)
      .order('created_at', { ascending: false })
      .limit(2000)
    const latestRoast = new Map<string, string>()
    for (const r of roasts || []) {
      if (r.email && !latestRoast.has(r.email.toLowerCase())) latestRoast.set(r.email.toLowerCase(), r.created_at)
    }
    for (const [email, createdAt] of latestRoast) {
      if (trackerEmails.has(email)) continue
      roastAudience.add(email)
      for (const step of ROAST_STEPS) {
        if (createdAt <= daysAgo(step.afterDays)) await trySend(email, null, step)
      }
    }
  } catch { /* skip audience on error */ }

  // ---- Leads sequence (downloads + interest forms; skip tracker users) ----
  const leadEmails = new Map<string, string>() // email -> earliest seen created_at
  for (const table of ['consultation_leads', 'leads']) {
    try {
      const { data } = await svc.from(table).select('email, created_at').not('email', 'is', null).limit(5000)
      for (const row of data || []) {
        const key = row.email.toLowerCase()
        const cur = leadEmails.get(key)
        if (!cur || row.created_at < cur) leadEmails.set(key, row.created_at)
      }
    } catch { /* table may lack created_at — skip it */ }
  }
  for (const [email, createdAt] of leadEmails) {
    if (trackerEmails.has(email)) continue
    for (const step of LEAD_STEPS) {
      if (createdAt <= daysAgo(step.afterDays)) await trySend(email, null, step)
    }
  }

  // ---- Monday jobs digest (reuses trySend: optouts, dedupe, caps) ----
  if (new Date().getUTCDay() === 1) {
    try {
      const { data: topJobs } = await svc
        .from('jobs')
        .select('company, role, location')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(8)

      if (topJobs && topJobs.length >= 3) {
        const now = new Date()
        const jan1 = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
        const isoWeek = now.getUTCFullYear() * 100 + Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + 1) / 7)

        const rows = topJobs.map(j => `
          <tr><td style="padding: 9px 14px; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <strong style="color: white;">${j.company}</strong>
            <span style="color: rgba(255,255,255,0.55);"> — ${j.role}</span>
            ${j.location ? `<span style="color: rgba(255,255,255,0.35); font-size: 12px;"> · ${j.location}</span>` : ''}
          </td></tr>`).join('')

        const digestStep: Step = {
          sequence: 'jobs_digest',
          step: isoWeek,
          afterDays: 0,
          subject: `${topJobs.length} fresh openings for off-campus hustlers 💼`,
          body: name => `
            <h1 style="font-size: 22px; margin: 0 0 12px;">${name ? `${name.split(' ')[0]}, new` : 'New'} roles just dropped 👇</h1>
            <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Hand-picked, fresher-friendly, non-tech. One click saves any of them to your board with a follow-up reminder set.</p>
            <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.03); border-radius: 12px; overflow: hidden;">${rows}</table>
            ${ctaButton(`${SITE}/tracker/jobs`, 'Browse all openings →')}`,
        }

        let digestSends = 0
        for (const u of trackerUsers || []) {
          if (digestSends >= 25 || sends >= MAX_SENDS_PER_RUN) break
          if (!u.email || u.email_reminders_enabled === false) continue
          const before = sends
          await trySend(u.email, u.name, digestStep)
          if (sends > before) digestSends++
        }
      }
    } catch { /* digest failure must not affect the nurture run */ }
  }

  // ---- Apti launch announcement (runs last: fills leftover budget only) ----
  try {
    const { data: aptiProfiles } = await svc.from('apti_profiles').select('email')
    const aptiUsers = new Set((aptiProfiles || []).map(p => (p.email ?? '').toLowerCase()))

    // whole warm base, deduped: leads + roast-only emails + tracker users
    const audience = new Map<string, string | null>()
    for (const [email] of leadEmails) audience.set(email, null)
    for (const email of roastAudience) audience.set(email, null)
    for (const u of trackerUsers || []) {
      if (u.email && u.email_reminders_enabled !== false) audience.set(u.email.toLowerCase(), u.name)
    }

    let aptiSends = 0
    for (const [email, name] of audience) {
      if (aptiSends >= APTI_MAX_PER_RUN || sends >= MAX_SENDS_PER_RUN) break
      if (aptiUsers.has(email)) continue // already practicing — no announcement
      const before = sends
      const announcedAt = aptiAnnouncedAt.get(email)
      if (!announcedAt) await trySend(email, name, APTI_STEPS[0])
      else if (announcedAt <= daysAgo(APTI_STEPS[1].afterDays)) await trySend(email, name, APTI_STEPS[1])
      if (sends > before) aptiSends++
    }
  } catch { /* apti announcement must not affect the nurture run */ }

  return NextResponse.json({ sent: sends })
}
