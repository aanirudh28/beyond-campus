export const runtime = 'nodejs'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { serviceClient } from '@/lib/tracker'
import { loadCurriculum, type QuestionPayload } from '@/lib/apti'
import {
  buildGenerationPrompt, buildVerificationPrompt,
  GENERATION_SCHEMA, VERIFICATION_SCHEMA,
  validateCandidate, candidateToPayload, ratingSeed, contentHash,
  type GeneratedCandidate, type SkillContext,
} from '@/lib/apti-content'

const ADMIN_PASSWORD = 'beyondcampus2024'
const MODEL = 'claude-haiku-4-5-20251001'
const MAX_BATCH = 5

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function extractJson<T>(message: Anthropic.Message): T {
  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') throw new Error('no text block')
  return JSON.parse(block.text) as T
}

// Founder question console backend (docs/aptitude/13). Actions:
//   overview — per-skill bank counts
//   generate — Haiku drafts against the skill's trap library, cold-solve
//              verified, hash-deduped, inserted as status='draft'
//   queue    — drafts for review (full payload; the console is founder-only)
//   verdict  — approve (→ approved) or reject (delete + log reason)
//   update   — edit a draft in place (archives prior version)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const svc = serviceClient()

    switch (body.action) {
      case 'overview': {
        const curriculum = await loadCurriculum()
        const { data: rows } = await svc
          .from('apti_questions').select('skill_id, status')
        const counts = new Map<string, { approved: number; draft: number }>()
        for (const r of rows ?? []) {
          const c = counts.get(r.skill_id) ?? { approved: 0, draft: 0 }
          if (r.status === 'approved') c.approved++
          if (r.status === 'draft') c.draft++
          counts.set(r.skill_id, c)
        }
        const topicById = new Map(curriculum.topics.map((t) => [t.id, t]))
        return NextResponse.json({
          skills: curriculum.skills.map((s) => ({
            id: s.id,
            slug: s.slug,
            name: s.name,
            topic: topicById.get(s.topic_id)?.name ?? '',
            domain: topicById.get(s.topic_id)?.domain ?? '',
            approved: counts.get(s.id)?.approved ?? 0,
            draft: counts.get(s.id)?.draft ?? 0,
          })),
        })
      }

      case 'generate': {
        const count = Math.max(1, Math.min(MAX_BATCH, Number(body.count) || 4))
        const curriculum = await loadCurriculum()
        const skillRow = curriculum.skills.find((s) => s.slug === body.skillSlug)
        if (!skillRow) return NextResponse.json({ error: 'Unknown skill' }, { status: 400 })
        const topic = curriculum.topics.find((t) => t.id === skillRow.topic_id)!
        const skill: SkillContext = {
          slug: skillRow.slug,
          name: skillRow.name,
          domain: topic.domain,
          topicName: topic.name,
          benchmarkRating: skillRow.benchmark_rating,
          benchmarkSeconds: skillRow.benchmark_seconds,
        }

        const { data: existing } = await svc
          .from('apti_questions')
          .select('payload, content_hash')
          .eq('skill_id', skillRow.id)
        const existingHashes = new Set((existing ?? []).map((q) => q.content_hash))
        const existingStems = (existing ?? []).map((q) => (q.payload as QuestionPayload).stem_md)

        // draft generation (structured output → guaranteed-parseable JSON)
        const genMsg = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 8000,
          output_config: { format: { type: 'json_schema', schema: GENERATION_SCHEMA } },
          messages: [{ role: 'user', content: buildGenerationPrompt(skill, count, existingStems) }],
        })
        const { questions: candidates } = extractJson<{ questions: GeneratedCandidate[] }>(genMsg)

        const rejected: { stem: string; reason: string }[] = []
        const structurallyValid: GeneratedCandidate[] = []
        for (const c of candidates ?? []) {
          const problem = validateCandidate(c, skill)
          if (problem) rejected.push({ stem: c.stem_md?.slice(0, 80) ?? '(empty)', reason: problem })
          else structurallyValid.push(c)
        }

        // cold-solve verification: a second model call answers the questions
        // without seeing the keyed answers; mismatches are auto-rejected
        let verified: GeneratedCandidate[] = []
        if (structurallyValid.length > 0) {
          const verMsg = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 2000,
            output_config: { format: { type: 'json_schema', schema: VERIFICATION_SCHEMA } },
            messages: [{ role: 'user', content: buildVerificationPrompt(structurallyValid) }],
          })
          const { answers } = extractJson<{ answers: { index: number; answer_key: string }[] }>(verMsg)
          const byIndex = new Map(answers.map((a) => [a.index, a.answer_key]))
          structurallyValid.forEach((c, i) => {
            if (byIndex.get(i) === c.answer_key) verified.push(c)
            else rejected.push({ stem: c.stem_md.slice(0, 80), reason: `cold-solve got ${byIndex.get(i) ?? '?'}, keyed ${c.answer_key}` })
          })
        }

        // dedupe: structure hash vs existing bank and within the batch
        const batchHashes = new Set<string>()
        verified = verified.filter((c) => {
          const h = contentHash(c.stem_md)
          if (existingHashes.has(h) || batchHashes.has(h)) {
            rejected.push({ stem: c.stem_md.slice(0, 80), reason: 'duplicate structure' })
            return false
          }
          batchHashes.add(h)
          return true
        })

        let inserted = 0
        if (verified.length > 0) {
          const { error } = await svc.from('apti_questions').insert(verified.map((c) => ({
            skill_id: skillRow.id,
            type: 'mcq_single',
            payload: candidateToPayload(c),
            rating: ratingSeed(c.difficulty, skill.benchmarkRating),
            time_benchmark_sec: c.time_benchmark_sec,
            status: 'draft',
            content_hash: contentHash(c.stem_md),
          })))
          if (!error) inserted = verified.length
          else rejected.push({ stem: '(batch)', reason: `insert failed: ${error.message}` })
        }

        await svc.from('apti_events').insert({
          name: 'admin_generate',
          props: { skill: skill.slug, requested: count, inserted, rejected: rejected.length },
        })
        return NextResponse.json({ inserted, rejected })
      }

      case 'queue': {
        let q = svc.from('apti_questions')
          .select('id, skill_id, payload, rating, time_benchmark_sec, created_at')
          .eq('status', 'draft')
          .order('created_at')
          .limit(12)
        if (body.skillSlug) {
          const curriculum = await loadCurriculum()
          const skillRow = curriculum.skills.find((s) => s.slug === body.skillSlug)
          if (skillRow) q = q.eq('skill_id', skillRow.id)
        }
        const [{ data: drafts }, curriculum] = await Promise.all([q, loadCurriculum()])
        const topicById = new Map(curriculum.topics.map((t) => [t.id, t]))
        return NextResponse.json({
          drafts: (drafts ?? []).map((d) => {
            const skill = curriculum.skillById.get(d.skill_id)
            return {
              ...d,
              skill_name: skill?.name ?? '',
              skill_slug: skill?.slug ?? '',
              topic_name: skill ? topicById.get(skill.topic_id)?.name ?? '' : '',
            }
          }),
        })
      }

      case 'verdict': {
        if (!body.id || !['approve', 'reject'].includes(body.verdict)) {
          return NextResponse.json({ error: 'Bad verdict' }, { status: 400 })
        }
        if (body.verdict === 'approve') {
          await svc.from('apti_questions')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', body.id).eq('status', 'draft')
        } else {
          const { data: q } = await svc.from('apti_questions')
            .select('payload, skill_id').eq('id', body.id).single()
          // rejection reasons feed prompt improvement (doc 13)
          await svc.from('apti_events').insert({
            name: 'admin_reject',
            props: { id: body.id, reason: body.reason ?? 'unspecified', skill_id: q?.skill_id, stem: (q?.payload as QuestionPayload | undefined)?.stem_md?.slice(0, 120) },
          })
          await svc.from('apti_questions').delete().eq('id', body.id).eq('status', 'draft')
        }
        return NextResponse.json({ ok: true })
      }

      case 'update': {
        if (!body.id || !body.payload) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        const { data: current } = await svc.from('apti_questions')
          .select('payload, version').eq('id', body.id).single()
        if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        await svc.from('apti_question_versions').insert({
          question_id: body.id,
          version: current.version,
          payload: current.payload,
          changed_by: 'founder-console',
        })
        const payload = body.payload as QuestionPayload
        await svc.from('apti_questions').update({
          payload,
          content_hash: contentHash(payload.stem_md),
          version: current.version + 1,
          ...(typeof body.timeBenchmarkSec === 'number' ? { time_benchmark_sec: body.timeBenchmarkSec } : {}),
          updated_at: new Date().toISOString(),
        }).eq('id', body.id)
        return NextResponse.json({ ok: true })
      }

      // Designate/undesignate a question for the public SEO pages (doc 11 §4).
      // Only approved questions can go public; the slug is derived from the
      // stem + a short id suffix so it stays unique and readable.
      case 'seo': {
        if (!body.id || typeof body.on !== 'boolean') {
          return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }
        if (!body.on) {
          await svc.from('apti_questions').update({ seo_slug: null }).eq('id', body.id)
          return NextResponse.json({ ok: true, seoSlug: null })
        }
        const { data: q } = await svc.from('apti_questions')
          .select('id, status, payload, seo_slug').eq('id', body.id).single()
        if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (q.status !== 'approved') {
          return NextResponse.json({ error: 'Approve the question first' }, { status: 400 })
        }
        if (q.seo_slug) return NextResponse.json({ ok: true, seoSlug: q.seo_slug })
        const stem = ((q.payload as QuestionPayload).stem_md ?? '')
        const slugBase = stem.toLowerCase()
          .replace(/\*\*/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim().split(/\s+/).slice(0, 9).join('-')
          .slice(0, 70).replace(/-+$/, '')
        const seoSlug = `${slugBase || 'question'}-${String(q.id).slice(0, 6)}`
        await svc.from('apti_questions').update({ seo_slug: seoSlug }).eq('id', body.id)
        return NextResponse.json({ ok: true, seoSlug })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) {
    console.error('admin/apti error', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
