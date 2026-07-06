'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GRAD, COLORS, Mono, Card, Chip, AptiStyles, DOMAIN_LABELS } from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'

interface Topic { id: string; domain: string; slug: string; name: string; ord: number; meta: { one_liner?: string } }
interface Skill { id: string; topic_id: string; slug: string; name: string; ord: number; benchmark_rating: number }
interface SkillState { skill_id: string; rating: number; attempts: number; correct: number; mastery: string; last_practiced: string | null }

const DOMAIN_ORDER = ['quant', 'logical', 'verbal', 'di', 'business']

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
  const supabase = createClient()

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

  // recommended focus: first not-yet-proficient skill in curriculum order
  const focusSkillId = useMemo(() => {
    for (const domain of DOMAIN_ORDER) {
      for (const t of byDomain.get(domain) ?? []) {
        for (const s of skills.filter((x) => x.topic_id === t.id).sort((a, b) => a.ord - b.ord)) {
          const m = states.get(s.id)?.mastery ?? 'unseen'
          if (m !== 'proficient' && m !== 'mastered') return s.id
        }
      }
    }
    return null
  }, [byDomain, skills, states])

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
                      <p style={{ margin: '12px 0 0', fontSize: 12.5, color: COLORS.muted2, lineHeight: 1.55 }}>
                        {skill.id === focusSkillId
                          ? '→ Your current focus — today’s set is built around this.'
                          : ['proficient', 'mastered'].includes(st?.mastery ?? '')
                            ? 'Holding strong. Maintenance probes will keep it honest.'
                            : 'It enters your daily sets when the map reaches it — or sooner if you keep missing it.'}
                      </p>
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
