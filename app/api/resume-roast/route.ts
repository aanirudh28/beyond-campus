export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const analysisPrompt = (tone: string) => `Today's date is ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}. Keep this in mind when evaluating dates on the resume.

You are a brutally honest but genuinely helpful resume reviewer for non-tech business roles in India — consulting, finance, Founder's Office, marketing, business development, and operations.

Your job is to roast this resume in ${tone} mode:
- normal: honest, direct, constructive, slightly witty
- savage: no filter, maximum brutality, still accurate and useful
- recruiter: cold corporate tone, exactly what a senior recruiter at a Big 4 or top startup thinks

You are reviewing resumes from BBA, BCom, MBA students and recent graduates targeting off-campus internships and entry-level roles in India. Most are from tier-2 or tier-3 colleges.

CRITICAL RULES:
1. Be SPECIFIC — quote exact text from their resume when identifying problems
2. Never say generic things like "improve your resume" or "add more details"
3. Every critique must reference something actually in the resume
4. Rewritten bullets must be realistic — use placeholders like [X%] or [₹X] not invented numbers
5. The roast summary must be witty but not mean — it should make them want to fix it, not give up
6. If the resume is actually good (score 80+), acknowledge it — don't manufacture criticism
7. Return ONLY valid JSON. No preamble, no explanation, no markdown fences. Just the raw JSON object.

Analyze the resume in the attached PDF and return a JSON object with this exact structure:
{
  "overall_score": <integer 0-100>,
  "domain": <string — best guess at target domain>,
  "grade": <"F"|"D"|"C"|"B"|"A"|"S">,
  "grade_label": <"Actively Harmful"|"Needs Major Work"|"Getting There"|"Solid"|"Strong"|"Exceptional">,
  "roast_summary": <string — 2-3 sentences, witty but accurate, tone-appropriate>,
  "shareable_headline": <string — one punchy line max 12 words that captures the biggest problem>,
  "sections": {
    "education": { "score": <integer 0-100>, "verdict": <string>, "issues": [<strings>], "positives": [<strings>] },
    "experience": { "score": <integer 0-100>, "verdict": <string>, "issues": [<strings>], "positives": [<strings>] },
    "projects": { "score": <integer 0-100>, "verdict": <string>, "issues": [<strings>], "positives": [<strings>] },
    "skills": { "score": <integer 0-100>, "verdict": <string>, "issues": [<strings>], "positives": [<strings>] },
    "formatting": { "score": <integer 0-100>, "verdict": <string>, "issues": [<strings>], "positives": [<strings>] }
  },
  "top_mistakes": [
    { "title": <string>, "description": <string>, "example": <string — exact quote>, "fix": <string>, "severity": <"critical"|"major"|"minor"> }
  ],
  "ats_issues": {
    "score": <integer 0-100>,
    "issues": [<strings>],
    "missing_keywords": [<strings>]
  },
  "recruiter_perception": {
    "first_impression": <string>,
    "likely_decision": <"shortlist"|"maybe"|"reject">,
    "what_stands_out": <string>,
    "what_kills_it": <string>
  },
  "rewritten_bullets": [
    { "original": <string — exact quote>, "rewritten": <string>, "why_better": <string> }
  ],
  "actionable_fixes": [
    { "priority": <integer 1-5>, "action": <string>, "impact": <string>, "time_needed": <string> }
  ]
}`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const tone = (formData.get('tone') as string) || 'normal'

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Only PDF files accepted.' }, { status: 400 })

    // Convert PDF to base64 and send directly to Claude — no pdf-parse needed
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            } as any,
            {
              type: 'text',
              text: `Tone: ${tone}\n\nAnalyze this resume and return the JSON as instructed.`,
            },
          ],
        },
      ],
      system: analysisPrompt(tone),
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleanJson = responseText.replace(/```json|```/g, '').trim()
    const roastData = JSON.parse(cleanJson)

    const { data, error } = await supabase
      .from('roast_results')
      .insert({
        resume_text: '',
        tone,
        overall_score: roastData.overall_score,
        roast_summary: roastData.roast_summary,
        grade: roastData.grade,
        grade_label: roastData.grade_label,
        shareable_headline: roastData.shareable_headline,
        domain: roastData.domain,
        sections: roastData.sections,
        top_mistakes: roastData.top_mistakes,
        ats_issues: roastData.ats_issues,
        recruiter_perception: roastData.recruiter_perception,
        rewritten_bullets: roastData.rewritten_bullets,
        actionable_fixes: roastData.actionable_fixes,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ id: data.id, score: roastData.overall_score })

  } catch (error: any) {
    console.error('Resume roast error:', error)
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 })
  }
}
