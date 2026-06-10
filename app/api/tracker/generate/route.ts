export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthedUser, syncProEntitlement, getAiUsage, recordGeneration, parseClaudeJson, serviceClient, FREE_AI_CAP } from '@/lib/tracker'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const KINDS = ['cold_email', 'follow_up', 'linkedin_dm'] as const
type Kind = typeof KINDS[number]

const systemPrompt = `You write job-hunt outreach for Indian students and fresh graduates doing off-campus applications for non-tech roles (consulting, finance, BD, marketing, operations, Founder's Office).

Style rules — non-negotiable:
- Concise, specific, confident. Zero cringe.
- NEVER use "I hope this email finds you well", "I am writing to express", or any boilerplate openers.
- Reference something concrete about the company or role.
- Cold emails: max 150 words. Follow-ups: max 100 words and must reference when they originally applied. LinkedIn DMs: max 80 words, casual-professional.
- If resume highlights are provided, weave ONE specific achievement in naturally.
- Sign off with just the sender's first name.

Return ONLY valid JSON, no markdown fences:
{
  "subject": <string for emails, null for linkedin_dm>,
  "body": <string, use \\n for line breaks>,
  "tips": [<exactly 2 short, specific sending tips>]
}`

export async function POST(req: NextRequest) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { applicationId, kind, tone = 'professional' } = await req.json()
  if (!applicationId || !KINDS.includes(kind as Kind)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const isPro = await syncProEntitlement(user.id, user.email!)
  if (!isPro) {
    const used = await getAiUsage(user.id)
    if (used >= FREE_AI_CAP) {
      return NextResponse.json({ error: 'AI_CAP_REACHED', used, cap: FREE_AI_CAP }, { status: 403 })
    }
  }

  const svc = serviceClient()
  const [{ data: app }, { data: profile }, { data: roast }] = await Promise.all([
    svc.from('applications').select('*').eq('id', applicationId).eq('user_id', user.id).single(),
    svc.from('tracker_profiles').select('name').eq('user_id', user.id).single(),
    svc.from('roast_results')
      .select('domain, sections, rewritten_bullets')
      .eq('email', user.email!)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])
  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  const daysSinceApplied = app.applied_at
    ? Math.round((Date.now() - new Date(app.applied_at).getTime()) / 86400000)
    : null

  let resumeContext = ''
  if (roast) {
    const positives: string[] = roast.sections?.experience?.positives || []
    const bullets: string[] = (roast.rewritten_bullets || []).slice(0, 3).map((b: { rewritten: string }) => b.rewritten)
    resumeContext = `\n\nSender's resume highlights (from their resume analysis):\n- Target domain: ${roast.domain || 'unknown'}\n${[...positives.slice(0, 3), ...bullets].map(s => `- ${s}`).join('\n')}`
  }

  const userPrompt = `Write a ${tone} ${kind === 'cold_email' ? 'cold email' : kind === 'follow_up' ? 'follow-up email' : 'LinkedIn DM'}.

Application details:
- Company: ${app.company}
- Role: ${app.role}
${app.location ? `- Location: ${app.location}\n` : ''}${app.jd_text ? `- Job description excerpt: ${app.jd_text.slice(0, 1500)}\n` : ''}${app.contact_name ? `- Addressed to: ${app.contact_name}\n` : ''}- Current stage: ${app.status}
${daysSinceApplied !== null ? `- Applied ${daysSinceApplied} day(s) ago\n` : ''}${app.notes ? `- Sender's notes: ${app.notes.slice(0, 500)}\n` : ''}
Sender: ${profile?.name || 'a final-year student'} (student/recent graduate applying off-campus)${resumeContext}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const data = parseClaudeJson(raw)

    await recordGeneration(user.id, kind, data, applicationId)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
