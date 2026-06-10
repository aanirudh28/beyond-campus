export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthedUser, recordGeneration, parseClaudeJson, serviceClient } from '@/lib/tracker'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const systemPrompt = `You are a sharp, encouraging job-search coach for Indian students applying off-campus.
Given pipeline statistics as JSON, return ONLY valid JSON, no markdown fences:
{
  "headline": <one punchy, specific insight, max 15 words, grounded in their actual numbers>,
  "insights": [exactly 3 of { "title": <max 6 words>, "detail": <one sentence, specific to the data>, "metric": <the key number, e.g. "38%" or "2.5 days"> }],
  "next_week_focus": <one actionable sentence>
}
If total applications < 5, make the headline encouraging about building volume and base insights on what little data exists. Never invent numbers not derivable from the stats.`

function mondayOfThisWeek(): Date {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = serviceClient()

  // one Claude call per user per week — return the cached digest otherwise
  const { data: cached } = await svc
    .from('ai_generations')
    .select('output')
    .eq('user_id', user.id)
    .eq('kind', 'weekly_insight')
    .gte('created_at', mondayOfThisWeek().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (cached) return NextResponse.json({ ...cached.output, cached: true })

  const [{ data: apps }, { data: events }] = await Promise.all([
    svc.from('applications').select('status, source, applied_at, created_at, follow_up_date').eq('user_id', user.id),
    svc.from('application_events').select('event_type, from_status, to_status, created_at, application_id').eq('user_id', user.id),
  ])
  if (!apps || apps.length === 0) return NextResponse.json({ error: 'No data yet' }, { status: 404 })

  // aggregate stats — Claude narrates, it never computes
  const byStatus: Record<string, number> = {}
  const bySource: Record<string, { total: number; replied: number }> = {}
  const byWeekday: Record<string, number> = {}
  for (const app of apps) {
    byStatus[app.status] = (byStatus[app.status] || 0) + 1
    if (app.status !== 'saved') {
      const src = app.source || 'other'
      bySource[src] = bySource[src] || { total: 0, replied: 0 }
      bySource[src].total++
      if (['replied', 'interview', 'offer'].includes(app.status)) bySource[src].replied++
    }
    if (app.applied_at) {
      const wd = new Date(app.applied_at + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long' })
      byWeekday[wd] = (byWeekday[wd] || 0) + 1
    }
  }

  // median days from applied -> replied
  const appliedAt: Record<string, number> = {}
  const replyGaps: number[] = []
  for (const ev of events || []) {
    if (ev.to_status === 'applied') appliedAt[ev.application_id] = new Date(ev.created_at).getTime()
    if (ev.to_status === 'replied' && appliedAt[ev.application_id]) {
      replyGaps.push((new Date(ev.created_at).getTime() - appliedAt[ev.application_id]) / 86400000)
    }
  }
  replyGaps.sort((a, b) => a - b)
  const medianDaysToReply = replyGaps.length ? Math.round(replyGaps[Math.floor(replyGaps.length / 2)] * 10) / 10 : null

  const applied = apps.filter(a => a.status !== 'saved').length
  const stats = {
    total_applications: apps.length,
    applied,
    by_status: byStatus,
    reply_rate_overall: applied ? Math.round((((byStatus.replied || 0) + (byStatus.interview || 0) + (byStatus.offer || 0)) / applied) * 100) : 0,
    by_source: bySource,
    applications_by_weekday: byWeekday,
    median_days_to_reply: medianDaysToReply,
    overdue_followups: apps.filter(a => a.follow_up_date && a.follow_up_date <= new Date().toISOString().slice(0, 10) && !['offer', 'rejected'].includes(a.status)).length,
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: JSON.stringify(stats) }],
    })
    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const digest = parseClaudeJson(raw)

    await recordGeneration(user.id, 'weekly_insight', digest)
    return NextResponse.json({ ...digest, cached: false })
  } catch {
    return NextResponse.json({ error: 'Insights failed' }, { status: 500 })
  }
}
