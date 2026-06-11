export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthedUser, syncProEntitlement, recordGeneration, parseClaudeJson } from '@/lib/tracker'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const systemPrompt = `You extract structured job data from job postings for Indian students doing off-campus applications.
Return ONLY valid JSON, no markdown fences, with this exact shape:
{
  "company": <string or null>,
  "role": <string or null>,
  "location": <string or null>,
  "source": <"linkedin"|"portal"|"career_page"|"other" — guess from the text>,
  "salary_range": <string or null, e.g. "6-8 LPA">,
  "experience_level": <string or null>,
  "follow_up_days": <integer 3-10 — recommended days to wait before following up on this kind of role>,
  "jd_summary": <string, max 40 words, the essence of the role>
}
If the text clearly isn't a job posting, return {"company": null}.`

export async function POST(req: NextRequest) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await req.json()
  if (!text || typeof text !== 'string' || text.trim().length < 40) {
    return NextResponse.json({ error: 'Paste the job description text' }, { status: 400 })
  }

  // Smart paste is Pro-only — JD extraction burns far more tokens than the
  // other AI features, so it sits outside the free monthly cap entirely
  const isPro = await syncProEntitlement(user.id, user.email!)
  if (!isPro) return NextResponse.json({ error: 'PRO_REQUIRED' }, { status: 403 })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Job posting content:\n\n${text.slice(0, 8000)}`,
      }],
    })
    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const data = parseClaudeJson(raw)

    if (data.company) await recordGeneration(user.id, 'extract', data)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
  }
}
