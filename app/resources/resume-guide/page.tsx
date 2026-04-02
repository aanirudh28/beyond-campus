'use client'

import { useState, useEffect, useRef } from 'react'
import UnlockPopup from '../../components/UnlockPopup'

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type DomainKey = 'Consulting' | 'Finance' | "Founder's Office" | 'Marketing' | 'Business Development' | 'Operations'

/* ─────────────────────────────────────────────
   CHECKLIST DATA
───────────────────────────────────────────── */
const CHECKLIST: { category: string; items: { key: string; label: string }[] }[] = [
  {
    category: 'Structure',
    items: [
      { key: 'struct_1', label: 'Resume is exactly 1 page' },
      { key: 'struct_2', label: 'Sections are in order: Header → Education → Experience → Projects → Skills → Activities' },
      { key: 'struct_3', label: 'All dates are right-aligned and consistently formatted' },
      { key: 'struct_4', label: 'Consistent use of bold, italics, and bullet style throughout' },
      { key: 'struct_5', label: 'At least 0.5" margins on all sides' },
    ],
  },
  {
    category: 'Content',
    items: [
      { key: 'content_1', label: 'Every bullet starts with an action verb' },
      { key: 'content_2', label: 'At least 60% of bullets have a quantified result' },
      { key: 'content_3', label: 'No "responsible for" or "assisted with" language' },
      { key: 'content_4', label: 'No irrelevant experiences included' },
      { key: 'content_5', label: 'Skills section lists only testable, relevant skills' },
      { key: 'content_6', label: 'No generic objective statement' },
      { key: 'content_7', label: 'No photo, DOB, or full home address' },
      { key: 'content_8', label: 'LinkedIn URL is included and working' },
    ],
  },
  {
    category: 'Formatting',
    items: [
      { key: 'format_1', label: 'Standard font (Calibri, Arial, or Garamond) at 10–11pt' },
      { key: 'format_2', label: 'No tables, columns, or text boxes' },
      { key: 'format_3', label: 'No images or graphics' },
      { key: 'format_4', label: 'Black text only (one accent colour max)' },
    ],
  },
  {
    category: 'Final Check',
    items: [
      { key: 'final_1', label: 'File saved as FirstName_LastName_Resume.pdf' },
      { key: 'final_2', label: 'Resume tailored to this specific role/company' },
      { key: 'final_3', label: 'Re-read once more out loud before sending' },
    ],
  },
]

const TOTAL_CHECKS = CHECKLIST.reduce((sum, c) => sum + c.items.length, 0)

/* ─────────────────────────────────────────────
   DOMAIN TIPS
───────────────────────────────────────────── */
const DOMAIN_TIPS: Record<DomainKey, { tips: string[]; verbs: string[] }> = {
  Consulting: {
    tips: [
      'Lead with analytical experiences — case competitions, research projects, structured problem-solving.',
      'Quantify everything: "Analysed market entry strategy for 3 cities, recommended top 2 based on TAM and competitive density".',
      'Include your GPA prominently if it\'s 8.0+ — consulting firms use it as a filter.',
      'Case competition wins are gold — mention rank and number of teams.',
    ],
    verbs: ['Analysed', 'Structured', 'Recommended', 'Benchmarked', 'Synthesised'],
  },
  Finance: {
    tips: [
      'Technical skills matter — list Excel, financial modelling, Python, Bloomberg if you\'ve used them.',
      'CFA Level 1 in progress or cleared is worth including.',
      'Any exposure to valuation, equity research, or financial modelling — even personal projects — belongs here.',
      'GPA matters more here than most other domains.',
    ],
    verbs: ['Modelled', 'Valued', 'Forecasted', 'Analysed', 'Reconciled'],
  },
  "Founder's Office": {
    tips: [
      'This role rewards generalists — show breadth: operations, analytics, strategy, GTM.',
      'Show initiative and ownership: "Led", "Built", "Drove" — not "assisted".',
      'Startup experience (even unpaid, even short) is valuable.',
      'Metrics matter: user growth, revenue impact, cost savings, time saved.',
    ],
    verbs: ['Led', 'Drove', 'Built', 'Owned', 'Scaled', 'Shipped'],
  },
  Marketing: {
    tips: [
      'Portfolio links are powerful — attach if you have one (social media, writing samples, campaigns).',
      'Platform-specific skills matter: Meta Ads, Google Analytics, SEO, email marketing tools.',
      'Show campaign results: reach, engagement rate, conversion rate, follower growth.',
      'Personal projects count — a well-run Instagram page with 5k followers is evidence.',
    ],
    verbs: ['Grew', 'Launched', 'Optimised', 'Scaled', 'Converted'],
  },
  'Business Development': {
    tips: [
      'Show commercial outcomes: deals sourced, partnerships closed, revenue generated.',
      'Cold outreach experience is directly relevant — mention it.',
      'Networking and relationship-building is the job — show evidence of it.',
      'Internship experience here is often more valuable than academic credentials.',
    ],
    verbs: ['Sourced', 'Pitched', 'Closed', 'Negotiated', 'Partnered', 'Generated'],
  },
  Operations: {
    tips: [
      'Process improvement is the core skill — show before/after: "Reduced manual reporting time by 40% by building automated tracker in Excel".',
      'Cross-functional work is valued — show you\'ve worked across teams.',
      'Data skills (Excel, SQL basics) are increasingly expected.',
      'Supply chain, logistics, and vendor management experience is highly relevant.',
    ],
    verbs: ['Streamlined', 'Automated', 'Reduced', 'Improved', 'Deployed', 'Coordinated'],
  },
}

/* ─────────────────────────────────────────────
   CHAPTER TITLES
───────────────────────────────────────────── */
const CHAPTER_TITLES = [
  'The 6 Rules Before You Write a Single Word',
  'The 6 Sections',
  'ATS Optimization',
  'Formatting Rules',
  'The 8 Most Common Mistakes',
  'Domain-Specific Tips',
  'The 10-Minute Review Checklist',
]

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function ResumeGuidePage() {
  const [emailUnlocked, setEmailUnlocked] = useState(false)
  const [fullyUnlocked, setFullyUnlocked] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1]))
  const [domainTab, setDomainTab] = useState<DomainKey>('Consulting')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [sidebarEmail, setSidebarEmail] = useState('')
  const [sidebarLoading, setSidebarLoading] = useState(false)
  const [sidebarDone, setSidebarDone] = useState(false)

  useEffect(() => {
    setEmailUnlocked(localStorage.getItem('resumeGuideEmailUnlocked') === 'true')
    setFullyUnlocked(localStorage.getItem('resourcePackUnlocked') === 'true')
    const saved = localStorage.getItem('resumeChecklist')
    if (saved) {
      try { setChecklist(JSON.parse(saved)) } catch {}
    }
  }, [])

  const toggleCheck = (key: string) => {
    setChecklist(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem('resumeChecklist', JSON.stringify(next))
      return next
    })
  }

  const toggleExpand = (n: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(n) ? next.delete(n) : next.add(n)
      return next
    })
  }

  const canAccess = (ch: number): boolean => {
    if (fullyUnlocked) return true
    if (ch === 1) return true
    if (ch <= 3 && emailUnlocked) return true
    return false
  }

  const handleSidebarEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sidebarEmail) return
    setSidebarLoading(true)
    try {
      await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sidebarEmail, resource: 'Resume Guide - Email Unlock' }),
      })
    } catch {}
    localStorage.setItem('resumeGuideEmailUnlocked', 'true')
    setEmailUnlocked(true)
    setSidebarDone(true)
    setSidebarLoading(false)
  }

  const completedCount = Object.values(checklist).filter(Boolean).length
  const progressPct = Math.round((completedCount / TOTAL_CHECKS) * 100)

  const bannerText = fullyUnlocked
    ? 'All 7 chapters unlocked ✓'
    : emailUnlocked
    ? 'Chapters 1–3 unlocked · Get all 7 for ₹199 →'
    : 'Showing Chapters 1–2 (partial) · Enter email to unlock Chapters 2–3 →'

  const domains: DomainKey[] = ['Consulting', 'Finance', "Founder's Office", 'Marketing', 'Business Development', 'Operations']

  /* chapter access lock for ch2 section-level */
  const ch2SectionUnlocked = emailUnlocked || fullyUnlocked

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        .chapter-card{
          background:#111827;
          border:1px solid rgba(255,255,255,0.07);
          border-radius:20px;
          padding:28px;
          margin-bottom:16px;
          transition:border-color 0.2s;
          position:relative;
          overflow:hidden;
        }
        .chapter-card.expanded{border-color:rgba(79,124,255,0.25)}
        .chapter-card.locked{
          background:#0f1623;
          border-color:rgba(255,255,255,0.04);
          opacity:0.7;
        }
        .chapter-card:hover:not(.locked){border-color:rgba(79,124,255,0.2)}
        .ch-watermark{
          position:absolute;
          right:20px;
          top:50%;
          transform:translateY(-50%);
          font-family:'DM Serif Display',serif;
          font-size:80px;
          color:rgba(255,255,255,0.06);
          pointer-events:none;
          user-select:none;
          line-height:1;
        }
        .rule-card{
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px;
          padding:20px 22px;
          position:relative;
          overflow:hidden;
        }
        .rule-num{
          position:absolute;
          right:16px;
          top:50%;
          transform:translateY(-50%);
          font-family:'DM Serif Display',serif;
          font-size:56px;
          color:rgba(255,255,255,0.05);
          line-height:1;
          pointer-events:none;
          user-select:none;
        }
        .section-lock{
          background:rgba(15,22,35,0.95);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:14px;
          padding:24px;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:10px;
          text-align:center;
          margin-top:16px;
        }
        .pill{
          display:inline-block;
          padding:4px 12px;
          border-radius:100px;
          font-size:12px;
          font-weight:700;
          margin:4px;
        }
        .before-after{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
          margin:16px 0;
        }
        @media(max-width:680px){
          .before-after{grid-template-columns:1fr}
        }
        .before-box{
          background:rgba(239,68,68,0.06);
          border:1px solid rgba(239,68,68,0.2);
          border-radius:12px;
          padding:14px 16px;
        }
        .after-box{
          background:rgba(16,185,129,0.06);
          border:1px solid rgba(16,185,129,0.2);
          border-radius:12px;
          padding:14px 16px;
        }
        .fmt-table{width:100%;border-collapse:collapse;font-size:13.5px}
        .fmt-table th{text-align:left;padding:10px 14px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.3);border-bottom:1px solid rgba(255,255,255,0.07)}
        .fmt-table td{padding:10px 14px;color:rgba(255,255,255,0.75);vertical-align:top;border-bottom:1px solid rgba(255,255,255,0.05)}
        .fmt-table td:first-child{font-weight:700;color:rgba(255,255,255,0.9);white-space:nowrap}
        .fmt-table tr:last-child td{border-bottom:none}
        .mistake-card{
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px;
          padding:18px 20px;
          display:flex;
          gap:14px;
          align-items:flex-start;
        }
        .domain-tab{
          padding:8px 16px;
          border-radius:100px;
          font-size:13px;
          font-weight:700;
          cursor:pointer;
          border:1px solid transparent;
          transition:all 0.15s;
          white-space:nowrap;
          background:transparent;
          color:rgba(255,255,255,0.45);
          font-family:'DM Sans',sans-serif;
        }
        .domain-tab.active{
          background:rgba(79,124,255,0.15);
          border-color:rgba(79,124,255,0.4);
          color:#93BBFF;
        }
        .domain-tab:hover:not(.active){
          background:rgba(255,255,255,0.05);
          color:rgba(255,255,255,0.7);
        }
        .checklist-row{
          display:flex;
          align-items:flex-start;
          gap:12px;
          padding:10px 0;
          border-bottom:1px solid rgba(255,255,255,0.05);
          cursor:pointer;
        }
        .checklist-row:last-child{border-bottom:none}
        .checklist-row:hover .check-box{border-color:rgba(79,124,255,0.5)}
        .check-box{
          width:20px;
          height:20px;
          border-radius:6px;
          border:2px solid rgba(255,255,255,0.2);
          flex-shrink:0;
          display:flex;
          align-items:center;
          justify-content:center;
          transition:all 0.15s;
          margin-top:1px;
        }
        .check-box.checked{
          background:rgba(16,185,129,0.2);
          border-color:rgba(16,185,129,0.6);
        }
        .sidebar{width:260px;flex-shrink:0}
        @media(max-width:960px){.sidebar{display:none}}
        @media(max-width:640px){.top-bar-title{display:none}}
        .code-block{
          background:rgba(255,255,255,0.04);
          border-radius:10px;
          padding:14px 18px;
          font-family:'Courier New',Courier,monospace;
          font-size:13px;
          line-height:1.75;
          color:rgba(255,255,255,0.85);
          white-space:pre-wrap;
          word-break:break-word;
          border:1px solid rgba(255,255,255,0.06);
        }
        .section-header{
          font-size:11px;
          font-weight:700;
          letter-spacing:1.5px;
          text-transform:uppercase;
          color:rgba(255,255,255,0.3);
          margin-bottom:12px;
          margin-top:24px;
        }
        .section-header:first-child{margin-top:0}
        .what-list{
          list-style:none;
          display:flex;
          flex-direction:column;
          gap:6px;
          margin:10px 0;
        }
        .what-list li{
          font-size:14px;
          color:rgba(255,255,255,0.7);
          display:flex;
          align-items:flex-start;
          gap:8px;
          line-height:1.6;
        }
        .progress-bar-track{
          height:6px;
          background:rgba(255,255,255,0.08);
          border-radius:100px;
          overflow:hidden;
          margin-bottom:6px;
        }
        .domain-tabs-scroll{
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          margin-bottom:20px;
        }
      `}</style>

      <UnlockPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onEmailUnlock={() => setEmailUnlocked(true)}
        resourceName="Resume Guide"
        localStorageKey="resumeGuide"
        showEmailOption={!emailUnlocked}
        emailAlreadySubmitted={emailUnlocked}
      />

      {/* ── TOP BAR ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5, flexShrink: 0 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <span className="top-bar-title" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>The Resume Guide — 7 Chapters</span>
        {!fullyUnlocked && (
          <button
            onClick={() => setShowPopup(true)}
            style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', color: '#fcd34d', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' }}
          >
            Unlock All →
          </button>
        )}
        {fullyUnlocked && (
          <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#6ee7b7' }}>All Unlocked ✓</span>
        )}
      </div>

      {/* ── HERO ── */}
      <section style={{ padding: '64px 24px 48px', textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#7dd3fc', textTransform: 'uppercase', marginBottom: 20 }}>
          Free Resource
        </div>
        <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, marginBottom: 16 }}>
          The Resume Guide
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 28, maxWidth: 520, margin: '0 auto 28px' }}>
          Everything you need to build a resume that gets you shortlisted for consulting, finance, Founder's Office, marketing, and BD roles — off campus.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { label: '7 Chapters', color: '#7dd3fc', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.25)' },
            { label: '10-Minute Checklist', color: '#93BBFF', bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.25)' },
            { label: 'Domain-Specific Tips', color: '#fcd34d', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
          ].map(p => (
            <span key={p.label} style={{ padding: '8px 18px', borderRadius: 100, background: p.bg, border: `1px solid ${p.border}`, color: p.color, fontSize: 13, fontWeight: 700 }}>{p.label}</span>
          ))}
        </div>
        {/* Access banner */}
        <div
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100, background: fullyUnlocked ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.06)', border: `1px solid ${fullyUnlocked ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.2)'}`, cursor: fullyUnlocked ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, color: fullyUnlocked ? '#6ee7b7' : '#fcd34d' }}
          onClick={() => { if (!fullyUnlocked) setShowPopup(true) }}
        >
          {bannerText}
        </div>
      </section>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px 100px', display: 'flex', gap: 40, alignItems: 'flex-start' }}>

        {/* LEFT — Chapters */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ══ CHAPTER 1 ══ */}
          <ChapterCard
            num={1}
            title={CHAPTER_TITLES[0]}
            locked={false}
            expanded={expanded.has(1)}
            onToggle={() => toggleExpand(1)}
            preview="Most students start writing their resume before they understand what a resume actually does. These 6 rules fix that."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { title: 'One page. Always.', body: 'Recruiters spend 6–10 seconds on a resume. A second page doesn\'t get read — it signals poor editing. Every line must earn its place.' },
                { title: 'ATS first, human second.', body: 'Most companies run resumes through Applicant Tracking Systems before a human sees them. If your formatting breaks ATS parsing, you\'re out before you\'re even considered.' },
                { title: 'Tailor every application.', body: 'A generic resume performs worse than a tailored one every single time. Take 10 minutes per application to match your language to the job description.' },
                { title: 'Outcomes, not activities.', body: '"Managed social media" tells a recruiter nothing. "Grew Instagram from 800 to 4,200 followers in 3 months" tells them everything. Always quantify.' },
                { title: 'Specificity beats impressiveness.', body: '"Passionate about finance" is forgettable. "Built a DCF model for a listed FMCG company as part of a case competition — won 2nd place out of 47 teams" is memorable. Be specific.' },
                { title: 'Simple formatting wins.', body: 'No tables, text boxes, columns, or graphics. They break ATS. Use a clean single-column layout with standard section headers.' },
              ].map((rule, i) => (
                <div key={i} className="rule-card">
                  <span className="rule-num">{i + 1}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#93BBFF', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{rule.title}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, paddingRight: 40 }}>{rule.body}</p>
                </div>
              ))}
            </div>
          </ChapterCard>

          {/* ══ CHAPTER 2 ══ */}
          <ChapterCard
            num={2}
            title={CHAPTER_TITLES[1]}
            locked={false}
            expanded={expanded.has(2)}
            onToggle={() => toggleExpand(2)}
            preview="A strong resume has exactly these 6 sections — no more, no less. Here's what goes in each one and what to never include."
          >
            {/* Section 1: Header — always free */}
            <div style={{ marginBottom: 24 }}>
              <SectionBadge num={1} title="Header" free />
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 14 }}>
                The header is the first thing a recruiter sees. Keep it clean, complete, and scannable in under 3 seconds.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 8 }}>Include</div>
                  <ul className="what-list">
                    {['Full name (large, top of page)', 'Phone number (Indian format)', 'Professional email address', 'LinkedIn URL (shortened)', 'City (just city, no full address)', 'Portfolio/GitHub (if relevant to role)'].map(i => (
                      <li key={i}><span style={{ color: '#6ee7b7', fontWeight: 700, flexShrink: 0 }}>✓</span>{i}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#f87171', textTransform: 'uppercase', marginBottom: 8 }}>Never Include</div>
                  <ul className="what-list">
                    {['Date of birth', 'Photo', '"Objective" statements', 'Full home address', 'Marital status'].map(i => (
                      <li key={i}><span style={{ color: '#f87171', fontWeight: 700, flexShrink: 0 }}>✗</span>{i}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>Formula</div>
              <div className="code-block">[Full Name] | [Phone] | [Email] | [LinkedIn] | [City]</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '14px 0 8px' }}>Example</div>
              <div className="code-block">{`Priya Sharma\n+91 98765 43210 · priya.sharma@gmail.com · linkedin.com/in/priyasharma · Mumbai`}</div>
            </div>

            {/* Sections 2–6: email-locked */}
            {ch2SectionUnlocked ? (
              <>
                {/* Section 2: Education */}
                <div style={{ marginBottom: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <SectionBadge num={2} title="Education" />
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 14 }}>Strong for recent grads. Show it confidently if your numbers are good.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 8 }}>Include</div>
                      <ul className="what-list">
                        {['College name', 'Degree + major', 'Year of graduation (or expected)', 'CGPA (if 7.5+)', 'Relevant coursework (2–3 max, only if relevant)', 'Academic achievements (if strong)'].map(i => (
                          <li key={i}><span style={{ color: '#6ee7b7', fontWeight: 700, flexShrink: 0 }}>✓</span>{i}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#f87171', textTransform: 'uppercase', marginBottom: 8 }}>Never Include</div>
                      <ul className="what-list">
                        {['School (10th/12th) unless exceptional board result', 'CGPA below 7.0', 'Every course you\'ve taken'].map(i => (
                          <li key={i}><span style={{ color: '#f87171', fontWeight: 700, flexShrink: 0 }}>✗</span>{i}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>Formula</div>
                  <div className="code-block">[College Name] | [Degree], [Major] | [Year] | CGPA: [X.X]</div>
                </div>

                {/* Section 3: Experience */}
                <div style={{ marginBottom: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <SectionBadge num={3} title="Experience" />
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 14 }}>
                    The most important section. Each entry: Company name + role title + dates + location. 2–4 bullets using the formula: <strong style={{ color: '#fff' }}>Action verb + what you did + result/impact.</strong>
                  </p>

                  {/* Before/after */}
                  <div className="before-after">
                    <div className="before-box">
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#f87171', marginBottom: 10, textTransform: 'uppercase' }}>Weak</div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 10 }}>Worked on social media marketing for the brand</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Helped with financial analysis</p>
                    </div>
                    <div className="after-box">
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#6ee7b7', marginBottom: 10, textTransform: 'uppercase' }}>Strong</div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 10 }}>Grew brand's Instagram engagement rate from 2.1% to 5.8% over 8 weeks by restructuring content calendar and A/B testing caption formats</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>Built 3-statement financial model for Series B fintech startup; identified ₹12L cost optimisation opportunity presented to CFO</p>
                    </div>
                  </div>

                  {/* Action verb pills */}
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>Action Verbs by Domain</div>
                    {[
                      { domain: 'Consulting', verbs: ['Analysed', 'Structured', 'Synthesised', 'Benchmarked', 'Mapped', 'Recommended', 'Evaluated', 'Optimised'], color: '#93BBFF', bg: 'rgba(79,124,255,0.12)', border: 'rgba(79,124,255,0.3)' },
                      { domain: 'Finance', verbs: ['Modelled', 'Forecasted', 'Valued', 'Audited', 'Reconciled', 'Projected', 'Stress-tested', 'Calculated'], color: '#c4b5fd', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
                      { domain: 'Marketing', verbs: ['Grew', 'Launched', 'Campaigned', 'Scaled', 'Tested', 'Optimised', 'Converted', 'Tracked'], color: '#fcd34d', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
                      { domain: 'BD', verbs: ['Sourced', 'Pitched', 'Closed', 'Negotiated', 'Onboarded', 'Prospected', 'Partnered', 'Generated'], color: '#5eead4', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.3)' },
                      { domain: 'Operations', verbs: ['Streamlined', 'Automated', 'Reduced', 'Improved', 'Coordinated', 'Deployed', 'Managed', 'Delivered'], color: '#86efac', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
                      { domain: "Founder's Office", verbs: ['Led', 'Drove', 'Built', 'Designed', 'Executed', 'Owned', 'Shipped', 'Scaled'], color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
                    ].map(row => (
                      <div key={row.domain} style={{ marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: row.color, marginRight: 8 }}>{row.domain}:</span>
                        <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4 }}>
                          {row.verbs.map(v => (
                            <span key={v} className="pill" style={{ background: row.bg, border: `1px solid ${row.border}`, color: row.color }}>{v}</span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Projects */}
                <div style={{ marginBottom: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <SectionBadge num={4} title="Projects" />
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 12 }}>
                    For students without internship experience, projects carry the section.
                  </p>
                  <ul className="what-list">
                    {[
                      'Project name + what it was + result',
                      '2–3 bullet points max',
                      'Only include if genuinely relevant — a random college fest project weakens the resume',
                    ].map(i => (
                      <li key={i}><span style={{ color: '#93BBFF', fontWeight: 700, flexShrink: 0 }}>→</span>{i}</li>
                    ))}
                  </ul>
                </div>

                {/* Section 5: Skills */}
                <div style={{ marginBottom: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <SectionBadge num={5} title="Skills" />
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 12 }}>Keep it clean and scannable. Only list skills you can be tested on.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 8 }}>Include</div>
                      <ul className="what-list">
                        {['Technical: Excel, Python, SQL, Tableau', 'Languages: English (Professional), Hindi (Native)', 'Certifications: CFA Level 1 (if relevant)'].map(i => (
                          <li key={i}><span style={{ color: '#6ee7b7', fontWeight: 700, flexShrink: 0 }}>✓</span>{i}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#f87171', textTransform: 'uppercase', marginBottom: 8 }}>Never Write</div>
                      <ul className="what-list">
                        {['"Microsoft Office"', '"Communication skills"', '"Team player"', '"Leadership"'].map(i => (
                          <li key={i}><span style={{ color: '#f87171', fontWeight: 700, flexShrink: 0 }}>✗</span>{i}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 6: Activities */}
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <SectionBadge num={6} title="Activities & Achievements" />
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 12 }}>Optional but powerful if strong. Leave it out if you don't have strong entries — a weak activities section hurts more than it helps.</p>
                  <ul className="what-list">
                    {[
                      'Case competition wins (mention rank + participants)',
                      'Club leadership positions (with measurable impact)',
                      'Publications, patents, national-level achievements',
                    ].map(i => (
                      <li key={i}><span style={{ color: '#93BBFF', fontWeight: 700, flexShrink: 0 }}>→</span>{i}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="section-lock">
                <span style={{ fontSize: 28 }}>🔒</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Sections 2–6 locked</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: 320 }}>Enter your email to unlock Education, Experience, Projects, Skills, and Activities sections for free.</p>
                <button
                  onClick={() => setShowPopup(true)}
                  style={{ padding: '10px 24px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#fcd34d', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                >
                  Unlock Free →
                </button>
              </div>
            )}
          </ChapterCard>

          {/* ══ CHAPTER 3 ══ */}
          {canAccess(3) ? (
            <ChapterCard
              num={3}
              title={CHAPTER_TITLES[2]}
              locked={false}
              expanded={expanded.has(3)}
              onToggle={() => toggleExpand(3)}
              preview="ATS rejects 75% of resumes before a human sees them. These 5 rules keep you in the game."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { title: 'Use standard section headers.', body: 'Write "Experience", "Education", "Skills" — not "My Journey", "Where I\'ve Been", "Things I Can Do". ATS looks for standard keywords.' },
                  { title: 'No tables, columns, or text boxes.', body: 'ATS parsers read left to right, top to bottom. Two-column layouts get scrambled. Tables cause parsing failures. Use a single-column layout.' },
                  { title: 'Submit as .docx or .pdf — correctly.', body: 'Most ATS accept both, but some prefer .docx. If the application says PDF, use PDF. Save your file as FirstName_LastName_Resume.pdf — not "resume_final_v3_ACTUAL.pdf".' },
                  { title: 'Mirror the job description.', body: 'If the JD says "financial modelling", write "financial modelling" — not "financial analysis" or "FM". ATS does keyword matching. Use their exact language.' },
                  { title: 'No images, logos, or graphics.', body: 'They don\'t parse. A company logo or decorative line in your header can corrupt the parsed output.' },
                ].map((rule, i) => (
                  <div key={i} className="rule-card">
                    <span className="rule-num">{i + 1}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#5eead4', flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', paddingRight: 40 }}>{rule.title}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, paddingRight: 40 }}>{rule.body}</p>
                  </div>
                ))}
              </div>
            </ChapterCard>
          ) : (
            <LockedChapterCard num={3} title={CHAPTER_TITLES[2]} preview="ATS rejects 75% of resumes before a human sees them. These 5 rules keep you in the game." onUnlock={() => setShowPopup(true)} label="Enter email to unlock free →" />
          )}

          {/* ══ CHAPTER 4 ══ */}
          {canAccess(4) ? (
            <ChapterCard
              num={4}
              title={CHAPTER_TITLES[3]}
              locked={false}
              expanded={expanded.has(4)}
              onToggle={() => toggleExpand(4)}
              preview="The formatting decisions that separate a professional resume from a student resume."
            >
              <div style={{ overflowX: 'auto' }}>
                <table className="fmt-table">
                  <thead>
                    <tr>
                      <th style={{ width: 120 }}>Rule</th>
                      <th>What to do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Font', 'Calibri, Arial, or Garamond — 10–11pt for body, 14–16pt for name'],
                      ['Margins', '0.5" to 0.75" on all sides — never less than 0.5"'],
                      ['Line spacing', 'Single (1.0) within sections, small space between sections'],
                      ['Length', 'Exactly 1 page. Use spacing/font size to make it fit — never go to page 2'],
                      ['Colour', 'Black text only. One accent colour max (dark blue or dark grey) — never red, orange, or green'],
                      ['Consistency', 'If you bold company names, bold all of them. If you italicise roles, italicise all of them'],
                      ['Dates', 'Right-align all dates. Use "Jun 2024 – Aug 2024" format consistently'],
                      ['Bullets', 'Use • or – consistently. Never mix. 2–4 bullets per role'],
                      ['File name', 'FirstName_LastName_Resume.pdf — always'],
                    ].map(([rule, what]) => (
                      <tr key={rule}>
                        <td>{rule}</td>
                        <td>{what}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChapterCard>
          ) : (
            <LockedChapterCard num={4} title={CHAPTER_TITLES[3]} preview="The formatting decisions that separate a professional resume from a student resume." onUnlock={() => setShowPopup(true)} label="Enter email to unlock free →" />
          )}

          {/* ══ CHAPTER 5 ══ */}
          {canAccess(5) ? (
            <ChapterCard
              num={5}
              title={CHAPTER_TITLES[4]}
              locked={false}
              expanded={expanded.has(5)}
              onToggle={() => toggleExpand(5)}
              preview="These 8 mistakes are why strong candidates get rejected before anyone reads their resume."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { title: 'Responsibilities instead of results', body: 'Writing what you were supposed to do, not what you actually achieved. Every bullet should have a number or a clear outcome.' },
                  { title: 'Generic objective statements', body: '"Seeking a challenging opportunity to grow in a dynamic organisation" tells the recruiter nothing about you. Delete the objective section entirely.' },
                  { title: 'Inconsistent formatting', body: 'Bold in some places, not others. Different date formats. Mixed bullet styles. This signals carelessness — the exact opposite of what you want to signal.' },
                  { title: 'Including irrelevant experiences', body: 'Your 8th grade science fair project doesn\'t belong. Every entry should be relevant to the role you\'re applying for or demonstrate a transferable skill.' },
                  { title: 'Weak skills section', body: 'Listing "MS Word", "communication", "teamwork" wastes precious space and insults the recruiter. Your skills section should list tools you can be tested on, not soft skills.' },
                  { title: 'Underselling with vague language', body: '"Assisted with", "helped to", "was involved in" — these phrases make you sound passive. You either did something or you didn\'t. Own your work.' },
                  { title: 'Wrong email address', body: 'Still using the address you made in Class 9? Get a professional email: firstname.lastname@gmail.com. This is a first impression.' },
                  { title: 'Not tailoring for the role', body: 'Sending the same resume to a consulting firm, a fintech startup, and a marketing agency is lazy and ineffective. Tailor your language, section order, and highlights for each application.' },
                ].map((m, i) => (
                  <div key={i} className="mistake-card">
                    <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{m.title}</div>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChapterCard>
          ) : (
            <LockedChapterCard num={5} title={CHAPTER_TITLES[4]} preview="These 8 mistakes are why strong candidates get rejected before anyone reads their resume." onUnlock={() => setShowPopup(true)} label="Unlock all 7 — ₹199 →" isPaid />
          )}

          {/* ══ CHAPTER 6 ══ */}
          {canAccess(6) ? (
            <ChapterCard
              num={6}
              title={CHAPTER_TITLES[5]}
              locked={false}
              expanded={expanded.has(6)}
              onToggle={() => toggleExpand(6)}
              preview="What actually gets you shortlisted varies by domain. These tips are specific to each."
            >
              {/* Domain tabs */}
              <div className="domain-tabs-scroll">
                {domains.map(d => (
                  <button
                    key={d}
                    className={`domain-tab${domainTab === d ? ' active' : ''}`}
                    onClick={() => setDomainTab(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {/* Domain content */}
              <div style={{ background: 'rgba(79,124,255,0.04)', border: '1px solid rgba(79,124,255,0.12)', borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 14 }}>{domainTab}</div>
                <ul className="what-list" style={{ marginBottom: 16 }}>
                  {DOMAIN_TIPS[domainTab].tips.map((tip, i) => (
                    <li key={i}><span style={{ color: '#93BBFF', fontWeight: 700, flexShrink: 0 }}>→</span>{tip}</li>
                  ))}
                </ul>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 10 }}>Action Verbs</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {DOMAIN_TIPS[domainTab].verbs.map(v => (
                    <span key={v} className="pill" style={{ background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF' }}>{v}</span>
                  ))}
                </div>
              </div>
            </ChapterCard>
          ) : (
            <LockedChapterCard num={6} title={CHAPTER_TITLES[5]} preview="What actually gets you shortlisted varies by domain. These tips are specific to each." onUnlock={() => setShowPopup(true)} label="Unlock all 7 — ₹199 →" isPaid />
          )}

          {/* ══ CHAPTER 7 ══ */}
          {canAccess(7) ? (
            <ChapterCard
              num={7}
              title={CHAPTER_TITLES[6]}
              locked={false}
              expanded={expanded.has(7)}
              onToggle={() => toggleExpand(7)}
              preview="Run through this before you send any resume. 4 categories, 20 checks."
            >
              {/* Progress bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: completedCount === TOTAL_CHECKS ? '#6ee7b7' : '#fcd34d' }}>
                    {completedCount} / {TOTAL_CHECKS} complete
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{progressPct}%</span>
                </div>
                <div className="progress-bar-track">
                  <div style={{ height: '100%', width: `${progressPct}%`, background: completedCount === TOTAL_CHECKS ? 'linear-gradient(90deg,#10b981,#6ee7b7)' : 'linear-gradient(90deg,#f59e0b,#fcd34d)', borderRadius: 100, transition: 'width 0.3s ease' }} />
                </div>
              </div>

              {/* Checklist categories */}
              {CHECKLIST.map(cat => (
                <div key={cat.category} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>{cat.category}</div>
                  {cat.items.map(item => (
                    <div
                      key={item.key}
                      className="checklist-row"
                      onClick={() => toggleCheck(item.key)}
                    >
                      <div className={`check-box${checklist[item.key] ? ' checked' : ''}`}>
                        {checklist[item.key] && <span style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 800, lineHeight: 1 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 14, color: checklist[item.key] ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.75)', lineHeight: 1.55, textDecoration: checklist[item.key] ? 'line-through' : 'none', transition: 'color 0.15s' }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </ChapterCard>
          ) : (
            <LockedChapterCard num={7} title={CHAPTER_TITLES[6]} preview="Run through this before you send any resume. 4 categories, 20 checks." onUnlock={() => setShowPopup(true)} label="Unlock all 7 — ₹199 →" isPaid />
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="sidebar">
          <div style={{ position: 'sticky', top: 72 }}>
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 16 }}>Chapters</div>

              {/* Chapter list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 }}>
                {CHAPTER_TITLES.map((title, i) => {
                  const ch = i + 1
                  const accessible = canAccess(ch)
                  const isExpanded = expanded.has(ch)
                  return (
                    <button
                      key={ch}
                      onClick={() => {
                        if (!accessible) { setShowPopup(true); return }
                        toggleExpand(ch)
                        // scroll to chapter
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: isExpanded && accessible ? 'rgba(79,124,255,0.1)' : 'transparent', border: `1px solid ${isExpanded && accessible ? 'rgba(79,124,255,0.25)' : 'transparent'}`, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textAlign: 'left', width: '100%', transition: 'all 0.15s' }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', width: 16, flexShrink: 0 }}>{ch}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: accessible ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
                      <span style={{ fontSize: 12, flexShrink: 0 }}>
                        {accessible ? (isExpanded ? <span style={{ color: '#93BBFF' }}>↑</span> : <span style={{ color: 'rgba(255,255,255,0.25)' }}>↓</span>) : <span style={{ opacity: 0.4 }}>🔒</span>}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Sidebar unlock section */}
              {!emailUnlocked && !fullyUnlocked && (
                <div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 12 }}>Enter your email to unlock Chapters 2–3 for free.</div>
                  {sidebarDone ? (
                    <div style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 600 }}>✅ Chapters 2–3 unlocked!</div>
                  ) : (
                    <form onSubmit={handleSidebarEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={sidebarEmail}
                        onChange={e => setSidebarEmail(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none', width: '100%' }}
                      />
                      <button
                        type="submit"
                        disabled={sidebarLoading}
                        style={{ padding: '9px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.12)', border: '1.5px solid rgba(245,158,11,0.35)', color: '#fcd34d', fontWeight: 700, fontSize: 13, cursor: sidebarLoading ? 'wait' : 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                      >
                        {sidebarLoading ? '...' : 'Unlock Free →'}
                      </button>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>✓ Instant · No spam</div>
                    </form>
                  )}
                </div>
              )}

              {emailUnlocked && !fullyUnlocked && (
                <div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
                  <button
                    onClick={() => setShowPopup(true)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'linear-gradient(135deg,rgba(79,124,255,0.18),rgba(123,97,255,0.12))', border: '1.5px solid rgba(79,124,255,0.4)', color: '#93BBFF', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                  >
                    Unlock all 7 — ₹199 →
                  </button>
                </div>
              )}

              {fullyUnlocked && (
                <div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
                  <div style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 700, textAlign: 'center' }}>All chapters unlocked ✓</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '64px 24px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 800, letterSpacing: -1, lineHeight: 1.15, marginBottom: 14 }}>
            A great resume gets you the interview.<br />We get you the offer.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 32 }}>
            Pair this guide with a structured off-campus strategy and hands-on mentorship that turns interviews into offers.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/summer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 100, background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: 'white', fontWeight: 700, fontSize: 14, boxShadow: '0 0 28px rgba(245,158,11,0.3)' }}>
              Join Summer Program — ₹599 →
            </a>
            <a href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 100, background: 'rgba(79,124,255,0.12)', border: '1.5px solid rgba(79,124,255,0.35)', color: '#93BBFF', fontWeight: 700, fontSize: 14 }}>
              Book a Session — ₹299
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

function ChapterCard({
  num,
  title,
  locked,
  expanded,
  onToggle,
  preview,
  children,
}: {
  num: number
  title: string
  locked: boolean
  expanded: boolean
  onToggle: () => void
  preview: string
  children?: React.ReactNode
}) {
  const colors = [
    { badge: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.35)', text: '#7dd3fc' },
    { badge: 'rgba(79,124,255,0.15)', border: 'rgba(79,124,255,0.35)', text: '#93BBFF' },
    { badge: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.35)', text: '#5eead4' },
    { badge: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', text: '#fcd34d' },
    { badge: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)', text: '#f87171' },
    { badge: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.35)', text: '#a5b4fc' },
    { badge: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', text: '#6ee7b7' },
  ]
  const c = colors[(num - 1) % colors.length]

  return (
    <div className={`chapter-card${locked ? ' locked' : expanded ? ' expanded' : ''}`}>
      <span className="ch-watermark">{num}</span>

      {/* Header */}
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: "'DM Sans',sans-serif" }}
      >
        <span style={{ width: 28, height: 28, borderRadius: 8, background: c.badge, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: c.text, flexShrink: 0 }}>
          {num}
        </span>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', flex: 1, lineHeight: 1.3, paddingRight: 40 }}>{title}</span>
        <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
      </button>

      {/* Preview (when collapsed) */}
      {!expanded && (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginTop: 10, paddingRight: 24 }}>{preview}</p>
      )}

      {/* Content (when expanded) */}
      {expanded && (
        <div style={{ marginTop: 24 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function LockedChapterCard({
  num,
  title,
  preview,
  onUnlock,
  label,
  isPaid = false,
}: {
  num: number
  title: string
  preview: string
  onUnlock: () => void
  label: string
  isPaid?: boolean
}) {
  const colors = [
    { badge: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.2)', text: 'rgba(125,211,252,0.4)' },
    { badge: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.2)', text: 'rgba(147,187,255,0.4)' },
    { badge: 'rgba(20,184,166,0.1)', border: 'rgba(20,184,166,0.2)', text: 'rgba(94,234,212,0.4)' },
    { badge: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: 'rgba(252,211,77,0.4)' },
    { badge: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', text: 'rgba(248,113,113,0.4)' },
    { badge: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', text: 'rgba(165,180,252,0.4)' },
    { badge: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: 'rgba(110,231,183,0.4)' },
  ]
  const c = colors[(num - 1) % colors.length]

  return (
    <div className="chapter-card locked">
      <span className="ch-watermark">{num}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: c.badge, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: c.text, flexShrink: 0 }}>{num}</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.4)', flex: 1, paddingRight: 40 }}>{title}</span>
        <span style={{ fontSize: 16 }}>🔒</span>
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', lineHeight: 1.65, marginBottom: 14, paddingRight: 24 }}>{preview}</p>
      <button
        onClick={onUnlock}
        style={{ padding: '8px 20px', borderRadius: 100, background: isPaid ? 'rgba(79,124,255,0.12)' : 'rgba(245,158,11,0.1)', border: `1px solid ${isPaid ? 'rgba(79,124,255,0.3)' : 'rgba(245,158,11,0.25)'}`, color: isPaid ? '#93BBFF' : '#fcd34d', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
      >
        {label}
      </button>
    </div>
  )
}

function SectionBadge({ num, title, free = false }: { num: number; title: string; free?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.25)', color: '#93BBFF' }}>Section {num}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{title}</span>
      {free && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7', letterSpacing: 0.5 }}>FREE</span>}
    </div>
  )
}
