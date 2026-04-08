'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'

type Section = {
  score: number
  verdict: string
  issues: string[]
  positives: string[]
}

type RoastData = {
  id: string
  overall_score: number
  domain: string
  grade: string
  grade_label: string
  roast_summary: string
  shareable_headline: string
  tone: string
  sections: {
    education: Section
    experience: Section
    projects: Section
    skills: Section
    formatting: Section
  }
  top_mistakes: {
    title: string
    description: string
    example: string
    fix: string
    severity: 'critical' | 'major' | 'minor'
  }[]
  ats_issues: {
    score: number
    issues: string[]
    missing_keywords: string[]
  }
  recruiter_perception: {
    first_impression: string
    likely_decision: 'shortlist' | 'maybe' | 'reject'
    what_stands_out: string
    what_kills_it: string
  }
  rewritten_bullets: {
    original: string
    rewritten: string
    why_better: string
  }[]
  actionable_fixes: {
    priority: number
    action: string
    impact: string
    time_needed: string
  }[]
}

function scoreColor(s: number) {
  if (s < 40) return '#ef4444'
  if (s < 66) return '#f59e0b'
  if (s < 81) return '#4F7CFF'
  return '#10b981'
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const [display, setDisplay] = useState(0)
  const r = size / 2 - 10
  const circ = 2 * Math.PI * r
  const offset = circ - (display / 100) * circ
  const color = scoreColor(score)

  useEffect(() => {
    let start = 0
    const duration = 1500
    const step = (timestamp: number, startTime: number) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      setDisplay(Math.round(progress * score))
      if (progress < 1) requestAnimationFrame(t => step(t, startTime))
    }
    requestAnimationFrame(t => step(t, t))
  }, [score])

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
      />
      <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={size === 80 ? 22 : 34} fontWeight={900} fontFamily="DM Sans, sans-serif">{display}</text>
    </svg>
  )
}

function Typewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 20)
    return () => clearInterval(id)
  }, [text])
  return <span>🔥 {displayed}</span>
}

function SectionCard({ name, data }: { name: string; data: Section }) {
  const [open, setOpen] = useState(false)
  const color = scoreColor(data.score)
  return (
    <div style={{ background: '#111827', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `4px solid ${color}` }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{name}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color }}>{data.score}</div>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 12 }}>{data.verdict}</p>
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: '#93BBFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
          {open ? 'Hide details ▲' : 'See details ▼'}
        </button>
      </div>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {data.issues.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Issues</div>
              {data.issues.map((iss, i) => (
                <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 4 }}>❌ {iss}</div>
              ))}
            </div>
          )}
          {data.positives.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Positives</div>
              {data.positives.map((p, i) => (
                <div key={i} style={{ fontSize: 13, color: '#6ee7b7', lineHeight: 1.7, marginBottom: 4 }}>✓ {p}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function RoastResultsPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<RoastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/resume-roast/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setNotFound(true); setLoading(false); return }
        setData(d)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  const copyLink = () => {
    navigator.clipboard.writeText(`https://www.beyond-campus.in/resources/resume-roast/results/${id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCard = async () => {
    if (!shareCardRef.current) return
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(shareCardRef.current, { backgroundColor: '#111827', scale: 2 })
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'resume-roast.png'
    a.click()
  }

  if (loading) {
    return (
      <main style={{ background: '#0B0B0F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>Loading your roast...</div>
          <div style={{ width: 200, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden', margin: '0 auto' }}>
            <div style={{ height: '100%', background: '#ef4444', borderRadius: 100, width: '60%', animation: 'none' }} />
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !data) {
    return (
      <main style={{ background: '#0B0B0F', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif", padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤔</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12 }}>Roast not found</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>This link may have expired or doesn&apos;t exist.</div>
          <a href="/resources/resume-roast" style={{ padding: '12px 24px', borderRadius: 100, background: '#ef4444', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Roast a Resume →
          </a>
        </div>
      </main>
    )
  }

  const decisionColor = { shortlist: '#10b981', maybe: '#f59e0b', reject: '#ef4444' }[data.recruiter_perception.likely_decision]
  const decisionLabel = { shortlist: 'SHORTLIST', maybe: 'MAYBE', reject: 'REJECT' }[data.recruiter_perception.likely_decision]
  const severityConfig = {
    critical: { label: '🔴 CRITICAL', color: '#ef4444' },
    major: { label: '🟡 MAJOR', color: '#f59e0b' },
    minor: { label: '⚪ MINOR', color: 'rgba(255,255,255,0.4)' },
  }

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .reveal{animation:fadeUp 0.5s ease both}
        .section-label{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
        @media(max-width:640px){
          .sections-grid{grid-template-columns:1fr!important}
          .cta-row{flex-direction:column!important}
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <a href="/resources/resume-roast" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
          ← Roast Another
        </a>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 100px', display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 40 }}>

        {/* SECTION 1 — SCORE HERO */}
        <div className="reveal" style={{ animationDelay: '0ms', background: 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(220,38,38,0.04))', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 24, padding: 'clamp(24px,5vw,40px)' }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <ScoreRing score={data.overall_score} />
              <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(data.overall_score) }}>{data.grade}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{data.grade_label}</div>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 12 }}>Your Roast</div>
              <p style={{ fontSize: 17, color: 'white', lineHeight: 1.8 }}>
                <Typewriter text={data.roast_summary} />
              </p>
            </div>
          </div>

          {/* Score range bar */}
          <div style={{ marginTop: 28, position: 'relative' }}>
            <div style={{ display: 'flex', height: 8, borderRadius: 100, overflow: 'hidden', gap: 2 }}>
              <div style={{ flex: 40, background: 'rgba(239,68,68,0.4)', borderRadius: '100px 0 0 100px' }} />
              <div style={{ flex: 25, background: 'rgba(245,158,11,0.4)' }} />
              <div style={{ flex: 15, background: 'rgba(79,124,255,0.4)' }} />
              <div style={{ flex: 20, background: 'rgba(16,185,129,0.4)', borderRadius: '0 100px 100px 0' }} />
            </div>
            <div style={{ position: 'absolute', left: `${Math.min(data.overall_score, 99)}%`, top: -4, transform: 'translateX(-50%)', width: 4, height: 16, background: 'white', borderRadius: 2, boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              <span>Ouch (0)</span><span>Room to grow (40)</span><span>Getting there (65)</span><span>You&apos;re good (80+)</span>
            </div>
          </div>
        </div>

        {/* SECTION 2 — RECRUITER PERCEPTION */}
        <div className="reveal" style={{ animationDelay: '100ms', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '4px solid #7B61FF', borderRadius: 16, padding: 28 }}>
          <div className="section-label" style={{ color: '#7B61FF' }}>👤 What the Recruiter Sees</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>FIRST IMPRESSION (6 seconds)</div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontStyle: 'italic' }}>&ldquo;{data.recruiter_perception.first_impression}&rdquo;</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>LIKELY DECISION</div>
              <span style={{ padding: '4px 14px', borderRadius: 100, background: `${decisionColor}20`, border: `1px solid ${decisionColor}60`, color: decisionColor, fontSize: 13, fontWeight: 800 }}>
                {decisionLabel}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>WHAT STANDS OUT</div>
              <p style={{ fontSize: 14, color: '#6ee7b7', lineHeight: 1.7 }}>{data.recruiter_perception.what_stands_out}</p>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>THE DEALBREAKER</div>
              <p style={{ fontSize: 14, color: '#f87171', lineHeight: 1.7 }}>{data.recruiter_perception.what_kills_it}</p>
            </div>
          </div>
        </div>

        {/* SECTION 3 — SECTION SCORES */}
        <div className="reveal" style={{ animationDelay: '200ms' }}>
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.35)' }}>Section Breakdown</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 20 }}>Where exactly you&apos;re losing points</div>
          <div className="sections-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {(['education', 'experience', 'projects', 'skills', 'formatting'] as const).map(k => (
              <SectionCard key={k} name={k.charAt(0).toUpperCase() + k.slice(1)} data={data.sections[k]} />
            ))}
          </div>
        </div>

        {/* SECTION 4 — TOP MISTAKES */}
        <div className="reveal" style={{ animationDelay: '300ms' }}>
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.35)' }}>Top Mistakes</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 20 }}>The specific things hurting you</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.top_mistakes.map((m, i) => {
              const sev = severityConfig[m.severity]
              return (
                <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 24px 20px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 11, fontWeight: 700, color: sev.color, letterSpacing: 0.5 }}>{sev.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#f87171', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: 'white', paddingRight: 80 }}>{m.title}</div>
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 14 }}>{m.description}</p>
                  <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', lineHeight: 1.6 }}>
                    &ldquo;{m.example}&rdquo;
                  </div>
                  <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 12, fontSize: 13, color: '#6ee7b7', lineHeight: 1.7 }}>
                    <strong>Fix:</strong> {m.fix}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* SECTION 5 — ATS */}
        <div className="reveal" style={{ animationDelay: '400ms', background: '#111827', border: '1px solid rgba(79,124,255,0.2)', borderLeft: '4px solid #4F7CFF', borderRadius: 16, padding: 28 }}>
          <div className="section-label" style={{ color: '#4F7CFF' }}>🤖 ATS Compatibility</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, marginTop: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: scoreColor(data.ats_issues.score) }}>{data.ats_issues.score}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Applicant Tracking System Score</div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: scoreColor(data.ats_issues.score), borderRadius: 100, width: `${data.ats_issues.score}%`, transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Most companies filter resumes automatically before a human sees them</div>
            </div>
          </div>
          {data.ats_issues.issues.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {data.ats_issues.issues.map((iss, i) => (
                <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 4 }}>❌ {iss}</div>
              ))}
            </div>
          )}
          {data.ats_issues.missing_keywords.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Missing for {data.domain} roles</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.ats_issues.missing_keywords.map((kw, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600 }}>{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6 — BULLET REWRITES */}
        <div className="reveal" style={{ animationDelay: '500ms' }}>
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.35)' }}>✍️ Rewritten Bullets</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 20 }}>Your worst bullets — fixed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.rewritten_bullets.map((b, i) => (
              <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', background: 'rgba(239,68,68,0.04)', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#f87171', textTransform: 'uppercase', marginBottom: 8 }}>Original</div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{b.original}</p>
                </div>
                <div style={{ padding: '8px 20px', textAlign: 'center', fontSize: 18, color: '#f59e0b' }}>→</div>
                <div style={{ padding: '18px 20px', background: 'rgba(16,185,129,0.04)', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 8 }}>Rewritten</div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, fontWeight: 600 }}>{b.rewritten}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8, lineHeight: 1.6 }}>Why it&apos;s better: {b.why_better}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7 — FIX IT IN AN HOUR */}
        <div className="reveal" style={{ animationDelay: '600ms' }}>
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.35)' }}>🛠️ Fix It In An Hour</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 20 }}>Do these 5 things — in this order</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.actionable_fixes.sort((a, b) => a.priority - b.priority).map((fix, i) => (
              <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderLeft: i === 0 ? '4px solid #4F7CFF' : '4px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 64, fontWeight: 900, color: 'rgba(255,255,255,0.03)', pointerEvents: 'none', lineHeight: 1 }}>{fix.priority}</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 6 }}>{fix.action}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{fix.impact}</div>
                  </div>
                  <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                    {fix.time_needed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 8 — SHARE CARD */}
        <div className="reveal" style={{ animationDelay: '700ms' }}>
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Share Your Roast</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div ref={shareCardRef} style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: 32, maxWidth: 500, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>🔥 Resume Roast</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>beyond-campus.in</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <ScoreRing score={data.overall_score} size={80} />
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor(data.overall_score) }}>{data.grade}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{data.grade_label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{data.domain}</div>
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 16 }}>{data.shareable_headline}</div>
              {data.top_mistakes[0] && (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, fontSize: 13, color: '#f87171', marginBottom: 16 }}>
                  Top mistake: {data.top_mistakes[0].title}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Recruiter verdict:</span>
                <span style={{ padding: '3px 12px', borderRadius: 100, background: `${decisionColor}20`, border: `1px solid ${decisionColor}60`, color: decisionColor, fontSize: 12, fontWeight: 800 }}>
                  {decisionLabel}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                Get yours roasted free → beyond-campus.in/resources/resume-roast
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={downloadCard} style={{ padding: '11px 22px', borderRadius: 10, background: '#111827', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              📸 Download Card
            </button>
            <button onClick={copyLink} style={{ padding: '11px 22px', borderRadius: 10, background: copied ? 'rgba(16,185,129,0.15)' : '#111827', border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.15)'}`, color: copied ? '#6ee7b7' : 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
          </div>
        </div>

        {/* SECTION 9 — CTA */}
        <div className="reveal" style={{ animationDelay: '800ms' }}>
          <div className="cta-row" style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, background: 'linear-gradient(135deg,rgba(79,124,255,0.08),rgba(123,97,255,0.06))', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 8 }}>Want a mentor to review your fixed resume?</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20 }}>After applying the fixes, book a 1:1 session for a human review and personalized strategy.</p>
              <a href="/book" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 22px', borderRadius: 10, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', fontWeight: 700, fontSize: 14 }}>
                Book Session — ₹299 →
              </a>
            </div>
            <div style={{ flex: 1, background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 8 }}>Build your resume from scratch instead?</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20 }}>Use our free LSE-format resume builder with live ATS scoring.</p>
              <a href="/resources/resume-builder" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 22px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: 'white', fontWeight: 700, fontSize: 14 }}>
                Open Resume Builder →
              </a>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
