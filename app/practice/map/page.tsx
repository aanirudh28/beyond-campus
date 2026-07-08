'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GRAD, COLORS, Mono, AptiStyles, DOMAIN_LABELS } from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'

interface Topic { id: string; domain: string; slug: string; name: string; ord: number; meta: { one_liner?: string } }
interface Skill { id: string; topic_id: string; slug: string; name: string; ord: number; benchmark_rating: number; prereq_skill_slugs: string[] }
interface SkillState { skill_id: string; rating: number; attempts: number; correct: number; mastery: string; last_practiced: string | null }

const DOMAIN_ORDER = ['quant', 'logical', 'verbal', 'di', 'business']

// A prerequisite counts as met once it reaches familiar. Below that (learning,
// rusty, unseen) it leaves the dependent skill on shaky ground.
const READY_MASTERY = ['familiar', 'proficient', 'mastered']
const EARNED = ['proficient', 'mastered']

// The honest-progress ladder (docs/aptitude/05 §5). Rusty sits apart — a decayed
// proficient, shown amber, never a rung you climb toward.
const LADDER = ['unseen', 'learning', 'familiar', 'proficient', 'mastered'] as const

// Each domain carries its own accent so the sections read as distinct places,
// not one endless list. State colours (below) stay universal so mastery reads
// consistently everywhere.
const DOMAIN_ACCENT: Record<string, string> = {
  quant: '#4F7CFF', logical: '#7B61FF', verbal: '#34D399', di: '#22D3EE', business: '#F5C518',
}

const MASTERY_META: Record<string, { label: string; color: string; bg: string; border: string; dot: string; fill: string }> = {
  unseen:     { label: 'Unseen',     color: COLORS.muted2, bg: 'rgba(255,255,255,0.02)', border: COLORS.hair,              dot: 'rgba(255,255,255,0.22)', fill: 'rgba(255,255,255,0.18)' },
  learning:   { label: 'Learning',   color: COLORS.blueSoft, bg: 'rgba(79,124,255,0.08)', border: 'rgba(79,124,255,0.35)', dot: '#4F7CFF', fill: 'linear-gradient(90deg,#4F7CFF,#6E8BFF)' },
  familiar:   { label: 'Familiar',   color: '#A5B4FC', bg: 'rgba(123,97,255,0.10)', border: 'rgba(123,97,255,0.4)',        dot: '#7B61FF', fill: 'linear-gradient(90deg,#7B61FF,#A5B4FC)' },
  proficient: { label: 'Proficient', color: '#fff', bg: 'rgba(79,124,255,0.18)', border: COLORS.blue,                      dot: '#93BBFF', fill: GRAD },
  mastered:   { label: 'Mastered',   color: '#F5C518', bg: 'rgba(245,197,24,0.08)', border: 'rgba(245,197,24,0.5)',        dot: '#F5C518', fill: 'linear-gradient(90deg,#F5C518,#FBBF24)' },
  rusty:      { label: 'Rusty',      color: COLORS.stretch, bg: COLORS.stretchBg, border: 'rgba(251,191,36,0.4)',          dot: '#F59E0B', fill: 'linear-gradient(90deg,#F59E0B,#FBBF24)' },
}

// Honest preview of what the founder is authoring next (docs/aptitude/03 P0 order).
const COMING_SOON: { domain: string; names: string[] }[] = [
  { domain: 'quant', names: ['Averages & Mixtures', 'Profit, Loss & Discount', 'Simple & Compound Interest', 'Time, Speed & Distance', 'Time & Work'] },
  { domain: 'logical', names: ['Coding–Decoding', 'Blood Relations', 'Linear Arrangement', 'Syllogisms'] },
  { domain: 'verbal', names: ['Grammar & Sentence Correction', 'Reading Comprehension', 'Fill in the Blanks'] },
  { domain: 'di', names: ['Tables', 'Bar & Line Graphs', 'Pie Charts'] },
]
const comingFor = (domain: string) => COMING_SOON.find((c) => c.domain === domain)?.names ?? []

function ladderFill(mastery: string): number {
  const idx = mastery === 'rusty' ? 3 : Math.max(0, LADDER.indexOf(mastery as typeof LADDER[number]))
  return ((idx + 1) / LADDER.length) * 100
}

// ---------- small visual primitives ----------

function ProgressBar({ ratio, height = 4, color }: { ratio: number; height?: number; color?: string }) {
  return (
    <div style={{ height, background: 'rgba(255,255,255,0.07)', borderRadius: 100, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.max(0, Math.min(1, ratio)) * 100}%`,
        background: color ?? GRAD, borderRadius: 100,
        transition: 'width 0.8s cubic-bezier(0.2,0.6,0.2,1)',
      }} />
    </div>
  )
}

function MasteryDot({ mastery, size = 8 }: { mastery: string; size?: number }) {
  const m = MASTERY_META[mastery] ?? MASTERY_META.unseen
  const mastered = mastery === 'mastered'
  return (
    <span style={{
      width: size, height: size, minWidth: size, borderRadius: '50%', background: m.dot,
      boxShadow: mastered ? '0 0 0 2px rgba(245,197,24,0.25)' : mastery === 'proficient' ? '0 0 6px rgba(147,187,255,0.6)' : 'none',
      display: 'inline-block',
    }} />
  )
}

// The ladder as a filled track with rung labels — for the expanded skill sheet.
function MasteryLadder({ mastery }: { mastery: string }) {
  const rusty = mastery === 'rusty'
  const idx = rusty ? 3 : Math.max(0, LADDER.indexOf(mastery as typeof LADDER[number]))
  return (
    <div>
      <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 100 }}>
        <div style={{
          position: 'absolute', inset: 0, width: `${ladderFill(mastery)}%`, borderRadius: 100,
          background: MASTERY_META[mastery].fill,
          transition: 'width 0.8s cubic-bezier(0.2,0.6,0.2,1)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
        {LADDER.map((step, i) => (
          <span key={step} style={{
            fontSize: 9.5, fontFamily: 'var(--mono)', letterSpacing: 0.5, textTransform: 'uppercase',
            color: i === idx ? (rusty ? COLORS.stretch : i >= 4 ? '#F5C518' : COLORS.blueSoft) : i < idx ? COLORS.muted2 : 'rgba(255,255,255,0.2)',
            fontWeight: i === idx ? 700 : 500,
          }}>{step.slice(0, 4)}</span>
        ))}
      </div>
    </div>
  )
}

export default function MapPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [states, setStates] = useState<Map<string, SkillState>>(new Map())
  const [openSkill, setOpenSkill] = useState<string | null>(null)
  const [activeDomain, setActiveDomain] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionBusy, setSessionBusy] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const practiceSkill = async (skillId: string) => {
    if (sessionBusy) return
    setSessionBusy(true)
    setSessionError(null)
    try {
      const res = await fetch('/api/apti/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'topic', skillId }),
      })
      const d = await res.json()
      if (!res.ok) { setSessionError(d.error || 'Could not start the session'); return }
      router.push(`/practice/set/${d.setId}`)
    } catch {
      setSessionError('Network hiccup — try again.')
    } finally {
      setSessionBusy(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [{ data: t }, { data: s }, { data: st }] = await Promise.all([
        supabase.from('apti_topics').select('*').order('ord'),
        supabase.from('apti_skills').select('*').order('ord'),
        supabase.from('apti_skill_state').select('*'),
      ])
      if (cancelled) return
      setTopics((t as Topic[]) ?? [])
      setSkills((s as Skill[]) ?? [])
      setStates(new Map(((st as SkillState[]) ?? []).map((row) => [row.skill_id, row])))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const byDomain = useMemo(() => {
    const sorted = [...topics].sort((a, b) =>
      DOMAIN_ORDER.indexOf(a.domain) - DOMAIN_ORDER.indexOf(b.domain) || a.ord - b.ord)
    const groups = new Map<string, Topic[]>()
    for (const t of sorted) groups.set(t.domain, [...(groups.get(t.domain) ?? []), t])
    return groups
  }, [topics])

  const bySlug = useMemo(() => new Map(skills.map((s) => [s.slug, s])), [skills])
  const masteryOf = (id: string) => states.get(id)?.mastery ?? 'unseen'
  const prereqSkillsOf = (skill: Skill): Skill[] =>
    (skill.prereq_skill_slugs ?? []).map((slug) => bySlug.get(slug)).filter((s): s is Skill => !!s)
  const isReady = (skill: Skill) =>
    prereqSkillsOf(skill).every((p) => READY_MASTERY.includes(masteryOf(p.id)))

  const focusSkillId = useMemo(() => {
    const ordered: Skill[] = []
    for (const domain of DOMAIN_ORDER)
      for (const t of byDomain.get(domain) ?? [])
        for (const s of skills.filter((x) => x.topic_id === t.id).sort((a, b) => a.ord - b.ord))
          ordered.push(s)
    const open = ordered.filter((s) => !EARNED.includes(masteryOf(s.id)))
    const ready = open.filter(isReady)
    return (ready.length > 0 ? ready : open)[0]?.id ?? null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byDomain, skills, states, bySlug])

  const focusSkill = skills.find((s) => s.id === focusSkillId) ?? null
  const focusTopic = topics.find((t) => t.id === focusSkill?.topic_id) ?? null
  const focusMetPrereqs = focusSkill ? prereqSkillsOf(focusSkill).filter((p) => READY_MASTERY.includes(masteryOf(p.id))) : []
  const focusUnlocks = focusSkill ? skills.filter((s) => (s.prereq_skill_slugs ?? []).includes(focusSkill.slug)) : []

  const earnedCount = skills.filter((s) => EARNED.includes(masteryOf(s.id))).length
  const goldCount = skills.filter((s) => masteryOf(s.id) === 'mastered').length
  const total = skills.length

  const spectrum = [...LADDER, 'rusty'].map((k) => ({
    key: k, ...MASTERY_META[k], n: skills.filter((s) => masteryOf(s.id) === k).length,
  })).filter((x) => x.n > 0)

  // tabs: every domain that has real topics or an authored coming-soon list
  const domainTabs = DOMAIN_ORDER.filter((d) => byDomain.has(d) || comingFor(d).length > 0)
  const focusDomain = focusTopic?.domain ?? null
  const effectiveDomain = (activeDomain && domainTabs.includes(activeDomain) ? activeDomain : null)
    ?? focusDomain ?? domainTabs[0] ?? null

  const jumpToFocus = () => {
    if (!focusSkill) return
    setActiveDomain(focusDomain)
    setOpenSkill(focusSkill.id)
  }

  const domainTopics = effectiveDomain ? byDomain.get(effectiveDomain) ?? [] : []
  const domainSkills = skills.filter((s) => domainTopics.some((t) => t.id === s.topic_id))
  const domainEarned = domainSkills.filter((s) => EARNED.includes(masteryOf(s.id))).length
  const accent = effectiveDomain ? DOMAIN_ACCENT[effectiveDomain] ?? COLORS.blue : COLORS.blue

  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AptiStyles />

      <div aria-hidden style={{
        position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 680, height: 440, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(79,124,255,0.14), rgba(123,97,255,0.05) 55%, transparent 75%)',
        filter: 'blur(48px)', animation: 'aurora-drift 15s ease-in-out infinite alternate',
      }} />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 120px', position: 'relative' }}>
        <header className="apti-in" style={{ marginBottom: 22 }}>
          <p className="mono-label" style={{ marginBottom: 10 }}>Mastery Map</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 36, letterSpacing: -1.2, lineHeight: 1.1, marginBottom: 8 }}>
            Know exactly <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>where you stand.</em>
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 14.5, lineHeight: 1.6 }}>
            Every skill earns its colour. No locks, no gates — an honest picture that fills itself in as you practise.
          </p>
        </header>

        {/* ── hero: overall progress + the mastery spectrum (doubles as legend) ── */}
        {!loading && total > 0 && (
          <div className="apti-in" style={{
            marginBottom: 22, padding: 22, borderRadius: 20,
            background: 'linear-gradient(160deg, rgba(79,124,255,0.07), rgba(123,97,255,0.04))',
            border: `1px solid ${COLORS.hair}`, animationDelay: '0.08s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <Mono style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{earnedCount}</Mono>
                  <Mono style={{ fontSize: 18, color: COLORS.muted2 }}>/ {total}</Mono>
                </div>
                <span style={{ fontSize: 12.5, color: COLORS.muted }}>skills at proficient or better</span>
              </div>
              {goldCount > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <Mono style={{ fontSize: 22, fontWeight: 700, color: '#F5C518', lineHeight: 1 }}>{goldCount}</Mono>
                  <span style={{ display: 'block', fontSize: 11, color: 'rgba(245,197,24,0.7)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--mono)', marginTop: 2 }}>mastered</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 3, height: 12, borderRadius: 100, overflow: 'hidden', marginBottom: 12 }}>
              {spectrum.map((seg) => (
                <div key={seg.key} title={`${seg.label}: ${seg.n}`} style={{
                  flexGrow: seg.n, minWidth: 6, background: seg.fill, opacity: seg.key === 'unseen' ? 0.55 : 1,
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {[...LADDER, 'rusty'].map((k) => {
                const m = MASTERY_META[k]
                const n = skills.filter((s) => masteryOf(s.id) === k).length
                return (
                  <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
                    <MasteryDot mastery={k} size={7} />
                    <span style={{ color: n > 0 ? m.color : COLORS.muted2 }}>{m.label}</span>
                    <Mono style={{ color: COLORS.muted2, fontSize: 11 }}>{n}</Mono>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* ── recommended focus — what to do next, and why ── */}
        {!loading && focusSkill && (
          <button
            onClick={jumpToFocus}
            className="apti-in apti-option"
            style={{
              display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
              marginBottom: 24, padding: '18px 20px', borderRadius: 18, fontFamily: 'inherit',
              background: 'linear-gradient(135deg, rgba(79,124,255,0.14), rgba(123,97,255,0.08))',
              border: '1px solid rgba(79,124,255,0.4)', animationDelay: '0.14s', color: '#fff',
              boxShadow: '0 0 28px rgba(79,124,255,0.14)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p className="mono-label" style={{ color: COLORS.blueSoft, margin: 0 }}>◎ Recommended focus</p>
              <span style={{ fontSize: 12.5, color: COLORS.blueSoft, fontWeight: 600 }}>Open →</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              {focusSkill.name}
              {focusTopic && <span style={{ color: COLORS.muted2, fontWeight: 400, fontSize: 14 }}> · {focusTopic.name}</span>}
            </p>
            <p style={{ fontSize: 13.5, color: COLORS.muted, lineHeight: 1.6 }}>
              {focusMetPrereqs.length > 0
                ? `${focusMetPrereqs.map((p) => p.name).join(' and ')} ${focusMetPrereqs.length > 1 ? 'are' : 'is'} solid, so this is your next rung.`
                : 'Foundational ground — most of what comes later leans on it.'}
              {focusUnlocks.length > 0 && ` Clear it and ${focusUnlocks[0].name} opens up.`}
            </p>
          </button>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '70px 0' }}>
            <div style={{
              width: 34, height: 34, margin: '0 auto 16px', borderRadius: '50%',
              border: '3px solid rgba(79,124,255,0.2)', borderTopColor: COLORS.blue,
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: COLORS.muted2, fontSize: 14 }}>Charting your map…</p>
          </div>
        )}

        {/* ── domain tabs — one place at a time, not one endless list ── */}
        {!loading && domainTabs.length > 0 && (
          <div className="apti-in" style={{
            display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 22,
            animationDelay: '0.2s', scrollbarWidth: 'none',
          }}>
            {domainTabs.map((d) => {
              const pool = skills.filter((s) => (byDomain.get(d) ?? []).some((t) => t.id === s.topic_id))
              const e = pool.filter((s) => EARNED.includes(masteryOf(s.id))).length
              const isActive = d === effectiveDomain
              const acc = DOMAIN_ACCENT[d] ?? COLORS.blue
              const soon = pool.length === 0
              return (
                <button
                  key={d}
                  onClick={() => { setActiveDomain(d); setOpenSkill(null) }}
                  className="apti-option"
                  style={{
                    flex: '0 0 auto', minWidth: 118, textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: 8, padding: '11px 16px 12px', borderRadius: 14,
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
                    border: isActive ? `1px solid ${acc}66` : `1px solid ${COLORS.hair}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: isActive ? '#fff' : COLORS.muted }}>
                      {DOMAIN_LABELS[d] ?? d}
                    </span>
                    <Mono style={{ fontSize: 11, color: COLORS.muted2 }}>{soon ? 'soon' : `${e}/${pool.length}`}</Mono>
                  </div>
                  <div style={{ height: 3, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pool.length ? (e / pool.length) * 100 : 0}%`, background: acc, borderRadius: 100 }} />
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ── active domain body ── */}
        {!loading && effectiveDomain && (
          <section className="apti-in" key={effectiveDomain} style={{ animationDelay: '0.24s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 24, letterSpacing: -0.5 }}>{DOMAIN_LABELS[effectiveDomain] ?? effectiveDomain}</span>
              {domainSkills.length > 0 && (
                <Mono style={{ fontSize: 12.5, color: accent, fontWeight: 600 }}>{domainEarned} / {domainSkills.length} earned</Mono>
              )}
            </div>

            {domainTopics.map((topic) => {
              const topicSkills = skills.filter((s) => s.topic_id === topic.id).sort((a, b) => a.ord - b.ord)
              const topicEarned = topicSkills.filter((s) => EARNED.includes(masteryOf(s.id))).length
              const full = topicEarned === topicSkills.length && topicSkills.length > 0
              return (
                <div key={topic.id} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: topic.meta?.one_liner ? 3 : 10 }}>
                    <h2 style={{ fontSize: 16.5, fontWeight: 700 }}>{topic.name}</h2>
                    <Mono style={{ fontSize: 11.5, color: full ? '#F5C518' : COLORS.muted2, whiteSpace: 'nowrap' }}>{topicEarned}/{topicSkills.length}</Mono>
                  </div>
                  {topic.meta?.one_liner && (
                    <p style={{ fontSize: 12.5, color: COLORS.muted2, marginBottom: 11 }}>{topic.meta.one_liner}</p>
                  )}
                  <div style={{ marginBottom: 12 }}>
                    <ProgressBar ratio={topicSkills.length ? topicEarned / topicSkills.length : 0} color={full ? 'linear-gradient(90deg,#F5C518,#FBBF24)' : accent} />
                  </div>

                  {/* skill node grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {topicSkills.map((skill) => {
                      const mastery = masteryOf(skill.id)
                      const m = MASTERY_META[mastery]
                      const isFocus = skill.id === focusSkillId
                      const isOpen = openSkill === skill.id
                      const mastered = mastery === 'mastered'
                      return (
                        <div key={skill.id} style={{ display: 'contents' }}>
                          <button
                            className="apti-option"
                            onClick={() => setOpenSkill(isOpen ? null : skill.id)}
                            style={{
                              textAlign: 'left', fontFamily: 'inherit', color: '#fff', cursor: 'pointer',
                              padding: '13px 14px 12px', borderRadius: 14,
                              background: isOpen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
                              border: isFocus ? '1px solid transparent' : `1px solid ${mastered ? 'rgba(245,197,24,0.4)' : COLORS.hair}`,
                              backgroundImage: isFocus ? `linear-gradient(${COLORS.bg}, ${COLORS.bg}), ${GRAD}` : undefined,
                              backgroundOrigin: isFocus ? 'border-box' : undefined,
                              backgroundClip: isFocus ? 'padding-box, border-box' : undefined,
                              boxShadow: mastered ? '0 0 0 1px rgba(245,197,24,0.4), 0 0 16px rgba(245,197,24,0.12)' : isFocus ? '0 0 22px rgba(79,124,255,0.18)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 9 }}>
                              <MasteryDot mastery={mastery} />
                              {isFocus
                                ? <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: 0.8, textTransform: 'uppercase', color: COLORS.blueSoft }}>◎ Focus</span>
                                : <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: 0.8, textTransform: 'uppercase', color: m.color }}>{m.label}</span>}
                            </div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35, marginBottom: 12, minHeight: '2.7em' }}>{skill.name}</div>
                            <div style={{ height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${ladderFill(mastery)}%`, background: m.fill, borderRadius: 100 }} />
                            </div>
                          </button>

                          {/* expanded skill sheet — spans the grid */}
                          {isOpen && (() => {
                            const st = states.get(skill.id)
                            const acc2 = st && st.attempts > 0 ? Math.round((st.correct / st.attempts) * 100) : null
                            const prereqs = prereqSkillsOf(skill)
                            const weak = prereqs.filter((p) => !READY_MASTERY.includes(masteryOf(p.id)))
                            return (
                              <div className="apti-in" style={{
                                gridColumn: '1 / -1', padding: 16, borderRadius: 14,
                                background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`,
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                  <span style={{ fontSize: 14.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <MasteryDot mastery={mastery} size={9} />{skill.name}
                                  </span>
                                  <span style={{ fontSize: 10.5, fontFamily: 'var(--mono)', letterSpacing: 1, textTransform: 'uppercase', color: m.color }}>{m.label}</span>
                                </div>

                                <div style={{ marginBottom: 16 }}><MasteryLadder mastery={mastery} /></div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                  {[
                                    { v: st?.rating ?? '—', l: `rating · bench ${skill.benchmark_rating}` },
                                    { v: acc2 !== null ? `${acc2}%` : '—', l: 'accuracy' },
                                    { v: st?.attempts ?? 0, l: 'attempts' },
                                  ].map((tile, i) => (
                                    <div key={i} style={{ padding: '11px 12px', borderRadius: 11, background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}` }}>
                                      <Mono style={{ fontSize: 18, fontWeight: 600, display: 'block', lineHeight: 1.1 }}>{tile.v}</Mono>
                                      <span style={{ color: COLORS.muted2, fontSize: 11 }}>{tile.l}</span>
                                    </div>
                                  ))}
                                </div>

                                {prereqs.length > 0 && (
                                  <div style={{ marginTop: 16 }}>
                                    <p className="mono-label" style={{ marginBottom: 8 }}>Builds on</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                      {prereqs.map((p) => {
                                        const pm = MASTERY_META[masteryOf(p.id)]
                                        return (
                                          <span key={p.id} style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            fontSize: 12, padding: '5px 11px', borderRadius: 100,
                                            color: pm.color, background: pm.bg, border: `1px solid ${pm.border}`,
                                          }}><MasteryDot mastery={masteryOf(p.id)} size={6} />{p.name}</span>
                                        )
                                      })}
                                    </div>
                                    {weak.length > 0 && (
                                      <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, background: COLORS.stretchBg, border: '1px solid rgba(251,191,36,0.3)' }}>
                                        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55, margin: '0 0 10px' }}>
                                          <strong style={{ color: COLORS.stretch }}>Shaky ground.</strong> {skill.name} leans on {weak.map((p) => p.name).join(' and ')}. Strengthen {weak.length > 1 ? 'those' : 'that'} first and this gets much easier.
                                        </p>
                                        <button
                                          onClick={() => practiceSkill(weak[0].id)}
                                          disabled={sessionBusy}
                                          style={{
                                            padding: '9px 15px', fontSize: 12.5, fontFamily: 'inherit', fontWeight: 700,
                                            background: 'rgba(251,191,36,0.15)', color: COLORS.stretch, border: '1px solid rgba(251,191,36,0.4)',
                                            borderRadius: 100, cursor: sessionBusy ? 'default' : 'pointer',
                                          }}
                                        >
                                          Drill {weak[0].name} first →
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <p style={{ margin: '14px 0 0', fontSize: 12.5, color: COLORS.muted2, lineHeight: 1.55 }}>
                                  {skill.id === focusSkillId
                                    ? '◎ Your current focus — today’s set is built around this.'
                                    : EARNED.includes(mastery)
                                      ? 'Holding strong. Maintenance probes will keep it honest.'
                                      : 'It enters your daily sets when the map reaches it — or sooner if you keep missing it.'}
                                </p>
                                <button
                                  onClick={() => practiceSkill(skill.id)}
                                  disabled={sessionBusy}
                                  className="apti-cta"
                                  style={{
                                    marginTop: 12, width: '100%', padding: '13px 16px',
                                    background: GRAD, color: '#fff', border: 'none', borderRadius: 100,
                                    fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                                    cursor: sessionBusy ? 'default' : 'pointer', opacity: sessionBusy ? 0.6 : 1,
                                    boxShadow: '0 0 24px rgba(79,124,255,0.3)',
                                  }}
                                >
                                  {sessionBusy ? 'Building…' : 'Practice this skill →'}
                                </button>
                                {sessionError && <p style={{ margin: '10px 0 0', fontSize: 12.5, color: COLORS.wrong }}>{sessionError}</p>}
                              </div>
                            )
                          })()}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* coming soon within the active domain */}
            {comingFor(effectiveDomain).length > 0 && (
              <div style={{ marginTop: domainTopics.length > 0 ? 4 : 0 }}>
                {domainTopics.length === 0 && (
                  <p style={{ fontSize: 13.5, color: COLORS.muted, lineHeight: 1.6, marginBottom: 14 }}>
                    {DOMAIN_LABELS[effectiveDomain]} is being authored now. Here is what is landing:
                  </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  {comingFor(effectiveDomain).map((n) => (
                    <span key={n} style={{
                      padding: '9px 14px', fontSize: 13.5, borderRadius: 100,
                      color: 'rgba(255,255,255,0.24)', border: '1px dashed rgba(255,255,255,0.1)',
                    }}>{n}</span>
                  ))}
                  <span style={{ fontSize: 10.5, color: COLORS.muted2, fontFamily: 'var(--mono)', letterSpacing: 1.5 }}>SHIPPING WEEKLY</span>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <AptiNav active="map" />
    </main>
  )
}
