// Server-only data helpers for the public /aptitude SEO surface (doc 11).
// Trust rule: ONLY questions the founder explicitly designated public
// (seo_slug set in the admin console) ever leave here — their full layered
// explanations are public BY DESIGN; the rest of the bank stays locked.
// Every helper fails soft (empty result) so a missing table/env can never
// break a public page render.

import { serviceClient } from '@/lib/tracker'
import { loadCurriculum, type QuestionPayload } from '@/lib/apti'

export interface PublicSkill { slug: string; name: string }
export interface PublicTopic {
  slug: string
  name: string
  domain: string
  skills: PublicSkill[]
}

export interface PublicQuestion {
  seoSlug: string
  type: string
  stemMd: string
  options: { key: string; text: string; trap: string | null }[]
  answerKeys: string[] | null
  answerValue: number | null
  tolerance: number | null
  solutionMd: string
  shortcutMd: string | null
  trapExplanations: Record<string, string>
  skillName: string
  topicSlug: string
  topicName: string
  domain: string
  benchmarkSec: number
}

export const DOMAIN_LABELS: Record<string, string> = {
  quant: 'Quantitative Aptitude',
  logical: 'Logical Reasoning',
  verbal: 'Verbal Ability',
  di: 'Data Interpretation',
  business: 'Business Aptitude',
}

export async function getPublicTopics(): Promise<PublicTopic[]> {
  try {
    const curriculum = await loadCurriculum()
    return curriculum.topics
      .slice()
      .sort((a, b) => a.ord - b.ord)
      .map((t) => ({
        slug: t.slug,
        name: t.name,
        domain: t.domain,
        skills: curriculum.skills
          .filter((s) => s.topic_id === t.id)
          .map((s) => ({ slug: s.slug, name: s.name })),
      }))
  } catch {
    return []
  }
}

interface SeoQuestionRow {
  seo_slug: string
  skill_id: string
  type: string
  payload: QuestionPayload
  time_benchmark_sec: number
}

async function toPublic(rows: SeoQuestionRow[]): Promise<PublicQuestion[]> {
  const curriculum = await loadCurriculum()
  const topicById = new Map(curriculum.topics.map((t) => [t.id, t]))
  return rows.flatMap((row) => {
    const skill = curriculum.skillById.get(row.skill_id)
    const topic = skill ? topicById.get(skill.topic_id) : undefined
    if (!skill || !topic) return []
    return [{
      seoSlug: row.seo_slug,
      type: row.type,
      stemMd: row.payload.stem_md,
      options: (row.payload.options ?? []).map((o) => ({ key: o.key, text: o.text, trap: o.trap })),
      answerKeys: row.payload.answer.keys ?? null,
      answerValue: row.payload.answer.value ?? null,
      tolerance: row.payload.answer.tolerance ?? null,
      solutionMd: row.payload.solution_md,
      shortcutMd: row.payload.shortcut_md ?? null,
      trapExplanations: row.payload.trap_explanations ?? {},
      skillName: skill.name,
      topicSlug: topic.slug,
      topicName: topic.name,
      domain: topic.domain,
      benchmarkSec: row.time_benchmark_sec,
    }]
  })
}

const SEO_SELECT = 'seo_slug, skill_id, type, payload, time_benchmark_sec'

// Sample questions for a topic hub (skills of that topic, capped).
export async function getSeoQuestionsForTopic(topicSlug: string, limit = 3): Promise<PublicQuestion[]> {
  try {
    const curriculum = await loadCurriculum()
    const topic = curriculum.topics.find((t) => t.slug === topicSlug)
    if (!topic) return []
    const skillIds = curriculum.skills.filter((s) => s.topic_id === topic.id).map((s) => s.id)
    if (skillIds.length === 0) return []
    const { data } = await serviceClient()
      .from('apti_questions')
      .select(SEO_SELECT)
      .eq('status', 'approved')
      .not('seo_slug', 'is', null)
      .in('skill_id', skillIds)
      .limit(limit)
    return await toPublic((data ?? []) as SeoQuestionRow[])
  } catch {
    return []
  }
}

export async function getSeoQuestionBySlug(slug: string): Promise<PublicQuestion | null> {
  try {
    const { data } = await serviceClient()
      .from('apti_questions')
      .select(SEO_SELECT)
      .eq('status', 'approved')
      .eq('seo_slug', slug)
      .maybeSingle()
    if (!data) return null
    const [q] = await toPublic([data as SeoQuestionRow])
    return q ?? null
  } catch {
    return null
  }
}

// Sitemap + hub cross-links: slugs only, capped.
export async function getSeoQuestionSlugs(limit = 500): Promise<{ slug: string; topicSlug: string }[]> {
  try {
    const [{ data }, curriculum] = await Promise.all([
      serviceClient()
        .from('apti_questions')
        .select('seo_slug, skill_id')
        .eq('status', 'approved')
        .not('seo_slug', 'is', null)
        .limit(limit),
      loadCurriculum(),
    ])
    const topicById = new Map(curriculum.topics.map((t) => [t.id, t]))
    return (data ?? []).flatMap((row: { seo_slug: string; skill_id: string }) => {
      const skill = curriculum.skillById.get(row.skill_id)
      const topic = skill ? topicById.get(skill.topic_id) : undefined
      return topic ? [{ slug: row.seo_slug, topicSlug: topic.slug }] : []
    })
  } catch {
    return []
  }
}
