'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GRAD, COLORS, Mono, Card, Chip, AptiStyles, DOMAIN_LABELS } from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'

interface Topic { id: string; domain: string; slug: string; name: string; ord: number; meta: { one_liner?: string } }
interface Skill { id: string; topic_id: string; slug: string; name: string; ord: number; benchmark_rating: number; prereq_skill_slugs: string[] }
interface SkillState { skill_id: string; rating: number; attempts: number; correct: number; mastery: string; last_practiced: string | null }

const DOMAIN_ORDER = ['quant', 'logical', 'verbal', 'di', 'business']

// A prerequisite counts as met once it reaches familiar. Below that (learning,
// rusty, unseen) it leaves the dependent skill on shaky ground.
const READY_MASTERY = ['familiar', 'proficient', 'mastered']

const MASTERY_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  unseen:     { label: 'Unseen',     color: COLORS.muted2, bg: 'rgba(255,255,255,0.02)', border: COLORS.hair },
  learning:   { label: 'Learning',   color: COLORS.blueSoft, bg: 'rgba(79,124,255,0.08)', border: 'rgba(79,124,255,0.35)' },
  familiar:   { label: 'Familiar',   color: '#A5B4FC', bg: 'rgba(123,97,255,0.10)', border: 'rgba(123,97,255,0.4)' },
  proficient: { label: 'Proficient', color: '#fff', bg: 'rgba(79,124,255,0.18)', border: COLORS.blue },
  mastered:   { label: 'Mastered',   color: '#F5C518', bg: 'rgba(245,197,24,0.08)', border: 'rgba(245,197,24,0.5)' },
  rusty:      { label: 'Rusty',      color: COLORS.stretch, bg: COLORS.stretchBg, border: 'rgba(251,191,36,0.4)' },
}

// Honest preview of what the founder is authoring next (docs/aptitude/03 P0 order).
const COMING_SOON: { domain: string; names: string[] }[] = [
  { domain: 'quant', names: ['Averages & Mixtures', 'Profit, Loss & Discount', 'Simple & Compound Interest', 'Time, Speed & Distance', 'Time & Work'] },
  { domain: 'logical', names: ['Coding–Decoding', 'Blood Relations', 'Linear Arrangement', 'Syllogisms'] },
  { domain: 'verbal', names: ['Grammar & Sentence Correction', 'Reading Comprehension', 'Fill in the Blanks'] },
  { domain: 'di', names: ['Tables', 'Bar & Line Graphs', 'Pie Charts'] },
]

export default function MapPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [states, setStates] = useState<Map<string, SkillState>>(new Map())
  const [openSkill, setOpenSkill] = useState<string | null>(null)
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
    for (const t of sorted) {
      groups.set(t.domain, [...(groups.get(t.domain) ?? []), t])
    }
    return groups
  }, [topics])

  const bySlug = useMemo(() => new Map(skills.map((s) => [s.slug, s])), [skills])

  const masteryOf = (id: string) => states.get(id)?.mastery ?? 'unseen'
  const prereqSkillsOf = (skill: Skill): Skill[] =>
    (skill.prereq_skill_slugs ?? []).map((slug) => bySlug.get(slug)).filter((s): s is Skill => !!s)
  // a skill is ready when every prereq that exists in the bank is familiar+
  const isReady = (skill: Skill) =>
    prereqSkillsOf(skill).every((p) => READY_MASTERY.includes(masteryOf(p.id)))

  // recommended focus: earliest open skill (curriculum order) whose prereqs are
  // met; falls back to raw order if everything open is still blocked
  const focusSkillId = useMemo(() => {
    const ordered: Skill[] = []
    for (const domain of DOMAIN_ORDER)
      for (const t of byDomain.get(domain) ?? [])
        for (const s of skills.filter((x) => x.topic_id === t.id).sort((a, b) => a.ord - b.ord))
          ordered.push(s)
    const open = ordered.filter((s) => !['proficient', 'mastered'].includes(masteryOf(s.id)))
    const ready = open.filter(isReady)
    return (ready.length > 0 ? ready : open)[0]?.id ?? null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byDomain, skills, states, bySlug])

  const focusSkill = skills.find((s) => s.id === focusSkillId) ?? null
  const focusTopic = topics.find((t) => t.id === focusSkill?.topic_id) ?? null
  const focusMetPrereqs = focusSkill ? prereqSkillsOf(focusSkill).filter((p) => READY_MASTERY.includes(masteryOf(p.id))) : []
  const focusUnlocks = focusSkill ? skills.filter((s) => (s.prereq_skill_slugs ?? []).includes(focusSkill.slug)) : []

  const masteredCount = [...states.values()].filter((s) => s.mastery === 'proficient' || s.mastery === 'mastered').length

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 120px' }}>
      <AptiStyles />

      <header className="apti-in" style={{ marginBottom: 28 }}>
        <p className="mono-label" style={{ marginBottom: 10 }}>Mastery Map</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 34, letterSpacing: -1, lineHeight: 1.12, marginBottom: 8 }}>
          Know exactly <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>where you stand.</em>
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14.5, lineHeight: 1.6 }}>
          {masteredCount > 0
            ? `${masteredCount} skill${masteredCount === 1 ? '' : 's'} at proficient or better. No skill is ever locked — this is a map, not a cage.`
            : 'Every skill starts dim and earns its colour. No locks, no gates — just an honest picture.'}
        </p>
      </header>

      {/* legend */}
      <div className="apti-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 30, animationDelay: '0.1s' }}>
        {Object.entries(MASTERY_META).map(([k, m]) => (
          <span key={k} style={{
            fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: 1, textTransform: 'uppercase',
            color: m.color, background: m.bg, border: `1px solid ${m.border}`,
            padding: '4px 10px', borderRadius: 100,
          }}>{m.label}</span>
        ))}
      </div>

      {/* recommended focus — the skill graph's headline: what to do next, and why */}
      {!loading && focusSkill && (
        <button
          onClick={() => setOpenSkill(focusSkill.id)}
          className="apti-in"
          style={{
            display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
            marginBottom: 30, padding: '18px 20px', borderRadius: 16, fontFamily: 'inherit',
            background: 'linear-gradient(135deg, rgba(79,124,255,0.1), rgba(123,97,255,0.08))',
            border: '1px solid rgba(79,124,255,0.35)', animationDelay: '0.15s', color: '#fff',
          }}
        >
          <p className="mono-label" style={{ color: COLORS.blueSoft, marginBottom: 8 }}>→ Recommended focus</p>
          <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
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

      {loading && <p style={{ color: COLORS.muted2, textAlign: 'center', padding: '40px 0' }}>Charting…</p>}

      {!loading && [...byDomain.entries()].map(([domain, domainTopics]) => (
        <section key={domain} style={{ marginBottom: 34 }}>
          <p className="mono-label" style={{ marginBottom: 14 }}>{DOMAIN_LABELS[domain] ?? domain}</p>

          {domainTopics.map((topic) => {
            const topicSkills = skills.filter((s) => s.topic_id === topic.id).sort((a, b) => a.ord - b.ord)
            return (
              <Card key={topic.id} style={{ marginBottom: 14, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700 }}>{topic.name}</h2>
                  <Mono style={{ fontSize: 12, color: COLORS.muted2 }}>
                    {topicSkills.filter((s) => ['proficient', 'mastered'].includes(states.get(s.id)?.mastery ?? '')).length}/{topicSkills.length}
                  </Mono>
                </div>
                {topic.meta?.one_liner && (
                  <p style={{ fontSize: 13, color: COLORS.muted2, marginBottom: 14 }}>{topic.meta.one_liner}</p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {topicSkills.map((skill) => {
                    const st = states.get(skill.id)
                    const m = MASTERY_META[st?.mastery ?? 'unseen']
                    const isFocus = skill.id === focusSkillId
                    const isOpen = openSkill === skill.id
                    return (
                      <button
                        key={skill.id}
                        className="apti-option"
                        onClick={() => setOpenSkill(isOpen ? null : skill.id)}
                        style={{
                          padding: '9px 14px', fontSize: 13.5, fontFamily: 'inherit',
                          color: m.color, background: m.bg,
                          border: isFocus ? '1px solid transparent' : `1px solid ${m.border}`,
                          backgroundImage: isFocus ? `linear-gradient(${COLORS.bg}, ${COLORS.bg}), ${GRAD}` : undefined,
                          backgroundOrigin: isFocus ? 'border-box' : undefined,
                          backgroundClip: isFocus ? 'padding-box, border-box' : undefined,
                          borderRadius: 100, cursor: 'pointer',
                        }}
                      >
                        {isFocus && <span style={{ color: COLORS.blueSoft, marginRight: 6 }}>→</span>}
                        {skill.name}
                      </button>
                    )
                  })}
                </div>

                {/* expanded skill sheet */}
                {topicSkills.map((skill) => {
                  if (openSkill !== skill.id) return null
                  const st = states.get(skill.id)
                  const acc = st && st.attempts > 0 ? Math.round((st.correct / st.attempts) * 100) : null
                  return (
                    <div key={skill.id} className="apti-in" style={{
                      marginTop: 14, padding: '14px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{skill.name}</span>
                        <Chip>{MASTERY_META[st?.mastery ?? 'unseen'].label}</Chip>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 13 }}>
                        <div>
                          <Mono style={{ fontSize: 18, fontWeight: 600, display: 'block' }}>{st?.rating ?? '—'}</Mono>
                          <span style={{ color: COLORS.muted2, fontSize: 11.5 }}>rating · bench {skill.benchmark_rating}</span>
                        </div>
                        <div>
                          <Mono style={{ fontSize: 18, fontWeight: 600, display: 'block' }}>{acc !== null ? `${acc}%` : '—'}</Mono>
                          <span style={{ color: COLORS.muted2, fontSize: 11.5 }}>accuracy</span>
                        </div>
                        <div>
                          <Mono style={{ fontSize: 18, fontWeight: 600, display: 'block' }}>{st?.attempts ?? 0}</Mono>
                          <span style={{ color: COLORS.muted2, fontSize: 11.5 }}>attempts</span>
                        </div>
                      </div>

                      {/* prerequisites — builds-on chips, and a strengthen-first nudge if weak */}
                      {(() => {
                        const prereqs = prereqSkillsOf(skill)
                        if (prereqs.length === 0) return null
                        const weak = prereqs.filter((p) => !READY_MASTERY.includes(masteryOf(p.id)))
                        return (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.hair}` }}>
                            <p className="mono-label" style={{ marginBottom: 8 }}>Builds on</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {prereqs.map((p) => {
                                const pm = MASTERY_META[masteryOf(p.id)]
                                return (
                                  <span key={p.id} style={{
                                    fontSize: 12, padding: '5px 11px', borderRadius: 100,
                                    color: pm.color, background: pm.bg, border: `1px solid ${pm.border}`,
                                  }}>{p.name} · {pm.label}</span>
                                )
                              })}
                            </div>
                            {weak.length > 0 && (
                              <div style={{ marginTop: 10, padding: '11px 13px', borderRadius: 10, background: COLORS.stretchBg, border: '1px solid rgba(251,191,36,0.3)' }}>
                                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, margin: '0 0 9px' }}>
                                  Shaky ground: {skill.name} leans on {weak.map((p) => p.name).join(' and ')}. Strengthen {weak.length > 1 ? 'those' : 'that'} first and this gets much easier.
                                </p>
                                <button
                                  onClick={() => practiceSkill(weak[0].id)}
                                  disabled={sessionBusy}
                                  style={{
                                    padding: '8px 14px', fontSize: 12.5, fontFamily: 'inherit', fontWeight: 600,
                                    background: 'rgba(251,191,36,0.15)', color: COLORS.stretch, border: '1px solid rgba(251,191,36,0.4)',
                                    borderRadius: 100, cursor: sessionBusy ? 'default' : 'pointer',
                                  }}
                                >
                                  Drill {weak[0].name} first →
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })()}

                      <p style={{ margin: '12px 0 0', fontSize: 12.5, color: COLORS.muted2, lineHeight: 1.55 }}>
                        {skill.id === focusSkillId
                          ? '→ Your current focus — today’s set is built around this.'
                          : ['proficient', 'mastered'].includes(st?.mastery ?? '')
                            ? 'Holding strong. Maintenance probes will keep it honest.'
                            : 'It enters your daily sets when the map reaches it — or sooner if you keep missing it.'}
                      </p>
                      <button
                        onClick={() => practiceSkill(skill.id)}
                        disabled={sessionBusy}
                        style={{
                          marginTop: 12, width: '100%', padding: '12px 16px',
                          background: GRAD, color: '#fff', border: 'none', borderRadius: 100,
                          fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                          cursor: sessionBusy ? 'default' : 'pointer', opacity: sessionBusy ? 0.6 : 1,
                        }}
                      >
                        {sessionBusy ? 'Building…' : 'Practice this skill →'}
                      </button>
                      {sessionError && <p style={{ margin: '10px 0 0', fontSize: 12.5, color: COLORS.wrong }}>{sessionError}</p>}
                    </div>
                  )
                })}
              </Card>
            )
          })}

          {/* coming soon */}
          {(COMING_SOON.find((c) => c.domain === domain)?.names ?? []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '2px 4px' }}>
              {COMING_SOON.find((c) => c.domain === domain)!.names.map((n) => (
                <span key={n} style={{
                  padding: '9px 14px', fontSize: 13.5, borderRadius: 100,
                  color: 'rgba(255,255,255,0.22)', border: '1px dashed rgba(255,255,255,0.10)',
                }}>{n}</span>
              ))}
              <span style={{ fontSize: 11.5, color: COLORS.muted2, alignSelf: 'center', fontFamily: 'var(--mono)', letterSpacing: 1 }}>
                SHIPPING WEEKLY
              </span>
            </div>
          )}
        </section>
      ))}

      {/* domains that have no topics yet at all */}
      {!loading && ['verbal', 'di'].filter((d) => !byDomain.has(d)).map((domain) => (
        <section key={domain} style={{ marginBottom: 34 }}>
          <p className="mono-label" style={{ marginBottom: 14 }}>{DOMAIN_LABELS[domain]}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(COMING_SOON.find((c) => c.domain === domain)?.names ?? []).map((n) => (
              <span key={n} style={{
                padding: '9px 14px', fontSize: 13.5, borderRadius: 100,
                color: 'rgba(255,255,255,0.22)', border: '1px dashed rgba(255,255,255,0.10)',
              }}>{n}</span>
            ))}
            <span style={{ fontSize: 11.5, color: COLORS.muted2, alignSelf: 'center', fontFamily: 'var(--mono)', letterSpacing: 1 }}>
              SHIPPING WEEKLY
            </span>
          </div>
        </section>
      ))}

      <AptiNav active="map" />
    </main>
  )
}
