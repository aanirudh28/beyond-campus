export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthedUser, syncProEntitlement, getAiUsage, recordGeneration, parseClaudeJson, FREE_AI_CAP } from '@/lib/tracker'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const systemPrompt = `You extract structured job data from job postings for Indian students doing off-campus applications.
Return ONLY valid JSON, no markdown fences, with this exact shape:
{
  "company": <string or null>,
  "role": <string or null>,
  "location": <string or null>,
  "source": <"linkedin"|"portal"|"career_page"|"other" — guess from the URL or text>,
  "salary_range": <string or null, e.g. "6-8 LPA">,
  "experience_level": <string or null>,
  "follow_up_days": <integer 3-10 — recommended days to wait before following up on this kind of role>,
  "jd_summary": <string, max 40 words, the essence of the role>
}
If the text clearly isn't a job posting, return {"company": null}.`

async function fetchJobPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const html = await res.text()
    // crude but effective: strip tags, scripts, styles; Claude handles the rest
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text.length > 200 ? text : null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, text } = await req.json()
  if (!url && !text) return NextResponse.json({ error: 'Provide a url or text' }, { status: 400 })

  const isPro = await syncProEntitlement(user.id, user.email!)
  if (!isPro) {
    const used = await getAiUsage(user.id)
    if (used >= FREE_AI_CAP) {
      return NextResponse.json({ error: 'AI_CAP_REACHED', used, cap: FREE_AI_CAP }, { status: 403 })
    }
  }

  let content = text as string | undefined
  if (!content && url) {
    const fetched = await fetchJobPage(url)
    if (!fetched) return NextResponse.json({ needsText: true })
    content = fetched
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `${url ? `Job URL: ${url}\n\n` : ''}Job posting content:\n\n${content!.slice(0, 8000)}`,
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
