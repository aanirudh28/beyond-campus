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
  const [fullyUnlocked, setFullyUnlocked] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set([2]))
  const [domainTab, setDomainTab] = useState<DomainKey>('Consulting')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fullyUnlockedVal = localStorage.getItem('resourcePackUnlocked') === 'true'
    setFullyUnlocked(fullyUnlockedVal)
    const saved = localStorage.getItem('resumeChecklist')
    if (saved) {
      try { setChecklist(JSON.parse(saved)) } catch {}
    }

    const savedEmail = localStorage.getItem('userEmail')
    if (savedEmail) {
      fetch('/api/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: savedEmail }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.hasAccess) {
            localStorage.setItem('resourcePackUnlocked', 'true')
            setFullyUnlocked(true)
          } else {
            localStorage.removeItem('resourcePackUnlocked')
            localStorage.removeItem('coldEmailPackEmailUnlocked')
            localStorage.removeItem('linkedinScriptsEmailUnlocked')
            localStorage.removeItem('resumeGuideEmailUnlocked')
            setFullyUnlocked(false)
          }
        })
        .catch(() => {})
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

  // Chapter 2 ("The 6 Sections") is always free; all others require paid unlock
  const canAccess = (ch: number): boolean => fullyUnlocked || ch === 2

  const completedCount = Object.values(checklist).filter(Boolean).length
  const progressPct = Math.round((completedCount / TOTAL_CHECKS) * 100)

  const bannerText = fullyUnlocked
    ? 'All 7 chapters unlocked ✓'
    : 'Chapter 2 free · Unlock all 7 →'

  const domains: DomainKey[] = ['Consulting', 'Finance', "Founder's Office", 'Marketing', 'Business Development', 'Operations']

  /* chapter 2 sections are always accessible now */
  const ch2SectionUnlocked = true

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}

        /* Chapter cards */
        .chapter-card{
          background:#111827;
          border:1px solid rgba(255,255,255,0.07);
          border-radius:24px;
          padding:40px 44px;
          margin-bottom:20px;
          transition:border-color 0.25s,box-shadow 0.25s;
          position:relative;
          overflow:hidden;
        }
        .chapter-card.expanded{
          border-color:rgba(79,124,255,0.3);
          box-shadow:0 8px 48px rgba(79,124,255,0.06);
        }
        .chapter-card.locked{
          background:#0e1520;
          border-color:rgba(255,255,255,0.04);
        }
        .chapter-card:hover:not(.locked){border-color:rgba(79,124,255,0.2)}

        /* Chapter watermark number */
        .ch-watermark{
          position:absolute;
          right:32px;
          top:50%;
          transform:translateY(-50%);
          font-family:'DM Serif Display',serif;
          font-size:120px;
          color:rgba(255,255,255,0.04);
          pointer-events:none;
          user-select:none;
          line-height:1;
        }

        /* Rule cards (Chapter 1) */
        .rule-card{
          display:flex;
          gap:24px;
          align-items:flex-start;
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:18px;
          padding:28px 32px;
          transition:border-color 0.2s;
        }
        .rule-card:hover{border-color:rgba(79,124,255,0.2)}
        .rule-num-large{
          font-family:'DM Serif Display',serif;
          font-size:48px;
          line-height:1;
          color:rgba(79,124,255,0.25);
          flex-shrink:0;
          width:52px;
          text-align:center;
          padding-top:2px;
        }

        /* Section header inside chapter */
        .ch-section-header{
          font-size:11px;
          font-weight:800;
          letter-spacing:2.5px;
          text-transform:uppercase;
          color:rgba(255,255,255,0.25);
          margin-bottom:18px;
          margin-top:36px;
          display:flex;
          align-items:center;
          gap:12px;
        }
        .ch-section-header::after{
          content:'';
          flex:1;
          height:1px;
          background:rgba(255,255,255,0.06);
        }
        .ch-section-header:first-child{margin-top:0}

        /* Section 2–6 label */
        .section-badge-row{
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:16px;
        }

        /* Include / Never include grid */
        .include-grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:20px;
          margin:20px 0 24px;
        }
        @media(max-width:600px){.include-grid{grid-template-columns:1fr}}
        .include-list{list-style:none;display:flex;flex-direction:column;gap:8px}
        .include-list li{
          font-size:15px;
          color:rgba(255,255,255,0.7);
          display:flex;
          align-items:flex-start;
          gap:10px;
          line-height:1.6;
          padding:2px 0;
        }

        /* Before/after */
        .before-after{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:16px;
          margin:24px 0;
        }
        @media(max-width:640px){.before-after{grid-template-columns:1fr}}
        .before-box{
          background:rgba(239,68,68,0.05);
          border:1px solid rgba(239,68,68,0.18);
          border-radius:16px;
          padding:22px 24px;
        }
        .after-box{
          background:rgba(16,185,129,0.05);
          border:1px solid rgba(16,185,129,0.18);
          border-radius:16px;
          padding:22px 24px;
        }

        /* Code block */
        .code-block{
          background:rgba(255,255,255,0.04);
          border-radius:12px;
          padding:20px 24px;
          font-family:'Courier New',Courier,monospace;
          font-size:14px;
          line-height:1.85;
          color:rgba(255,255,255,0.85);
          white-space:pre-wrap;
          word-break:break-word;
          border:1px solid rgba(255,255,255,0.07);
          margin-top:12px;
        }

        /* Formula block */
        .formula-block{
          background:rgba(79,124,255,0.06);
          border:1px solid rgba(79,124,255,0.18);
          border-radius:12px;
          padding:18px 24px;
          font-family:'Courier New',Courier,monospace;
          font-size:14px;
          line-height:1.75;
          color:#93BBFF;
          margin-top:12px;
        }

        /* Formatting table */
        .fmt-table{width:100%;border-collapse:collapse}
        .fmt-table th{
          text-align:left;
          padding:12px 20px;
          font-size:10px;
          font-weight:800;
          letter-spacing:2px;
          text-transform:uppercase;
          color:rgba(255,255,255,0.3);
          border-bottom:1px solid rgba(255,255,255,0.08);
        }
        .fmt-table td{
          padding:16px 20px;
          font-size:15px;
          color:rgba(255,255,255,0.75);
          vertical-align:top;
          border-bottom:1px solid rgba(255,255,255,0.05);
          line-height:1.6;
        }
        .fmt-table td:first-child{
          font-weight:700;
          color:rgba(255,255,255,0.95);
          white-space:nowrap;
          width:180px;
        }
        .fmt-table tr:last-child td{border-bottom:none}
        .fmt-table tr:nth-child(even) td{background:rgba(255,255,255,0.015)}

        /* Mistake cards */
        .mistake-card{
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:16px;
          padding:24px 28px;
          display:flex;
          gap:20px;
          align-items:flex-start;
          transition:border-color 0.2s;
        }
        .mistake-card:hover{border-color:rgba(239,68,68,0.25)}

        /* Domain tabs */
        .domain-tab{
          padding:9px 20px;
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

        /* Checklist */
        .checklist-row{
          display:flex;
          align-items:flex-start;
          gap:14px;
          padding:14px 0;
          border-bottom:1px solid rgba(255,255,255,0.05);
          cursor:pointer;
          transition:opacity 0.15s;
        }
        .checklist-row:last-child{border-bottom:none}
        .checklist-row:hover{opacity:0.85}
        .check-box{
          width:22px;
          height:22px;
          border-radius:7px;
          border:2px solid rgba(255,255,255,0.18);
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

        /* Pill */
        .pill{
          display:inline-block;
          padding:5px 14px;
          border-radius:100px;
          font-size:13px;
          font-weight:700;
          margin:4px 4px 4px 0;
        }

        /* Sidebar */
        .sidebar{width:272px;flex-shrink:0}
        @media(max-width:1000px){.sidebar{display:none}}
        @media(max-width:640px){.top-bar-title{display:none}}

        /* Progress bar */
        .progress-bar-track{
          height:6px;
          background:rgba(255,255,255,0.08);
          border-radius:100px;
          overflow:hidden;
          margin:8px 0 4px;
        }

        /* ATS rule rows */
        .ats-rule{
          display:flex;
          gap:20px;
          align-items:flex-start;
          padding:24px 0;
          border-bottom:1px solid rgba(255,255,255,0.05);
        }
        .ats-rule:first-child{padding-top:0}
        .ats-rule:last-child{border-bottom:none;padding-bottom:0}
        .ats-num{
          font-family:'DM Serif Display',serif;
          font-size:40px;
          color:rgba(79,124,255,0.2);
          line-height:1;
          flex-shrink:0;
          width:44px;
          text-align:center;
          padding-top:2px;
        }

        /* Verb domain group */
        .verb-group{margin-bottom:24px}
        .verb-group-label{
          font-size:11px;
          font-weight:800;
          letter-spacing:2px;
          text-transform:uppercase;
          color:rgba(255,255,255,0.3);
          margin-bottom:10px;
        }
      `}</style>

      <UnlockPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onEmailUnlock={() => {}}
        resourceName="Resume Guide"
        localStorageKey="resumeGuide"
        showEmailOption={false}
        emailAlreadySubmitted={false}
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
      <section style={{ padding: '80px 24px 56px', textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#7dd3fc', textTransform: 'uppercase', marginBottom: 24 }}>
          Free Resource
        </div>
        <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, marginBottom: 20 }}>
          The Resume Guide
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
          Everything you need to build a resume that gets you shortlisted for consulting, finance, Founder's Office, marketing, and BD roles — off campus.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
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
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px 100px', display: 'flex', gap: 48, alignItems: 'flex-start' }}>

        {/* LEFT — Chapters */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ══ CHAPTER 1 ══ */}
          {canAccess(1) ? (
          <ChapterCard
            num={1}
            title={CHAPTER_TITLES[0]}
            locked={false}
            expanded={expanded.has(1)}
            onToggle={() => toggleExpand(1)}
            preview="Most students start writing their resume before they understand what a resume actually does. These 6 rules fix that."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Rule 1 */}
              <div className="rule-card">
                <div className="rule-num-large">1</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: -0.3 }}>One page. Always.</div>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 16 }}>
                    Recruiters spend 6–10 seconds on a resume at first pass. A second page doesn't get read — it gets your resume put to the bottom of the pile. It signals one thing clearly: this person couldn't edit their own work. Every single line on your resume must justify its existence.
                  </p>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 20 }}>
                    The most common reason students go to page 2 is that they include everything they've ever done, instead of the best things they've done. A curated list of 6 strong bullets beats a sprawling list of 14 average ones, every time.
                  </p>
                  <div style={{ background: 'rgba(79,124,255,0.07)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#93BBFF', textTransform: 'uppercase', marginBottom: 8 }}>How to fit it on one page</div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        'Remove every bullet that doesn\'t quantify something or show a specific skill',
                        'Reduce font size to 10pt and margins to 0.5" if needed',
                        'Cut your Skills section to only what\'s directly relevant to this application',
                        'If still over: the problem is content, not formatting — something doesn\'t belong',
                      ].map(t => <li key={t} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, display: 'flex', gap: 10 }}><span style={{ color: '#93BBFF', flexShrink: 0, fontWeight: 700 }}>→</span>{t}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Rule 2 */}
              <div className="rule-card">
                <div className="rule-num-large">2</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: -0.3 }}>ATS first, human second.</div>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 16 }}>
                    Companies like Deloitte, Goldman Sachs, Unilever, and most mid-size startups receive hundreds to thousands of applications per role. They cannot read every one manually. Applicant Tracking Systems (ATS) scan your resume first — parsing the text, extracting keywords, and scoring your fit before any human sees it.
                  </p>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 20 }}>
                    If your formatting is incompatible with ATS — tables, columns, text boxes, graphics — the system fails to parse your content correctly, and your resume is either scored poorly or rejected automatically. You never knew you were in the running.
                  </p>
                  <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#f87171', textTransform: 'uppercase', marginBottom: 8 }}>Signs your resume is failing ATS</div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        'You\'re applying to many roles and getting zero responses',
                        'Your resume has a two-column layout, table, or text box',
                        'You\'re using a Canva or Zety template',
                        'Your section headers say "Experience" but with a decorative icon before them',
                        'You have a photo or company logos embedded',
                      ].map(t => <li key={t} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, display: 'flex', gap: 10 }}><span style={{ color: '#f87171', flexShrink: 0, fontWeight: 700 }}>✗</span>{t}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Rule 3 */}
              <div className="rule-card">
                <div className="rule-num-large">3</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: -0.3 }}>Tailor every application.</div>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 16 }}>
                    Sending the same resume to every company is the single most common — and most costly — mistake students make. A generic resume doesn't perform better because it appeals to everyone. It performs worse because it speaks to no one specifically.
                  </p>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 20 }}>
                    Tailoring doesn't mean rewriting your resume from scratch for each application. It takes 10–15 minutes per role and makes a measurable difference in your response rate.
                  </p>
                  <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 8 }}>The 3-step tailoring process</div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        ['Match their exact language', 'If the JD says "stakeholder management", use that phrase — not "managing relationships" or "cross-functional coordination"'],
                        ['Lead with the most relevant experience', 'Reorder your bullets to put the experience most relevant to this role first within each section'],
                        ['Adjust your Skills section', 'Add the specific tools and skills they mention in the JD; remove skills that aren\'t relevant to this role'],
                      ].map(([title, body]) => <li key={title} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}><span style={{ color: '#6ee7b7', fontWeight: 800 }}>{title} — </span>{body}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Rule 4 */}
              <div className="rule-card">
                <div className="rule-num-large">4</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: -0.3 }}>Outcomes, not activities.</div>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 16 }}>
                    This is the most impactful change most students can make to their resume today. The difference between a forgettable resume and a shortlisted one is usually not the experiences — it's how those experiences are described.
                  </p>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 20 }}>
                    Activities describe what your role required. Outcomes describe what you actually delivered. Recruiters can't hire your job description — they hire what you actually accomplished.
                  </p>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 14 }}>Before → After</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      ['Managed social media for the company', 'Grew Instagram following from 800 to 4,200 in 3 months by restructuring content calendar and A/B testing caption formats'],
                      ['Helped with financial analysis', 'Built 3-statement financial model for a Series B fintech startup; identified ₹12L cost optimisation opportunity, presented to CFO'],
                      ['Was part of the events team', 'Co-led annual cultural fest with a ₹6L budget; coordinated 14 vendors and drove 40% increase in ticketed attendance YoY'],
                      ['Worked on research projects', 'Authored 3,000-word market entry report on D2C beauty sector; analysis cited in company\'s Q3 strategy deck'],
                    ].map(([weak, strong]) => (
                      <div key={weak} className="before-after" style={{ margin: 0 }}>
                        <div className="before-box" style={{ padding: '14px 18px' }}>
                          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#f87171', marginBottom: 8, textTransform: 'uppercase' }}>✗ Weak</div>
                          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{weak}</p>
                        </div>
                        <div className="after-box" style={{ padding: '14px 18px' }}>
                          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#6ee7b7', marginBottom: 8, textTransform: 'uppercase' }}>✓ Strong</div>
                          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{strong}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginTop: 16, fontStyle: 'italic' }}>
                    Note: "I don't have any numbers" is almost never true. You managed X people, grew Y by Z%, worked across N teams, reduced time by X hours/week, or served Y customers. Dig for the number. It's there.
                  </p>
                </div>
              </div>

              {/* Rule 5 */}
              <div className="rule-card">
                <div className="rule-num-large">5</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: -0.3 }}>Specificity beats impressiveness.</div>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 16 }}>
                    Students try to sound impressive with broad, sweeping claims. Recruiters have learned to tune these out entirely. Specific, concrete details are actually harder to fake — which is exactly why they're more credible and more memorable.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: 'Generic (Forgettable)', color: '#f87171', items: ['"Passionate about finance"', '"Strong leadership skills"', '"Experience in marketing"', '"Interested in consulting"'] },
                      { label: 'Specific (Memorable)', color: '#6ee7b7', items: ['"Built a DCF model for a listed FMCG company — won 2nd at IIM A case comp (47 teams)"', '"Led a 12-person team for college fest; ₹6L P&L responsibility"', '"Grew client\'s email open rate from 18% to 34% over 6-week campaign"', '"Structured a market entry memo for an EdTech startup looking to expand to SEA"'] },
                    ].map(col => (
                      <div key={col.label}>
                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: col.color, textTransform: 'uppercase', marginBottom: 10 }}>{col.label}</div>
                        {col.items.map(item => <p key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 8, fontStyle: 'italic' }}>{item}</p>)}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9 }}>
                    The rule: if a sentence could appear on anyone's resume — or on a LinkedIn profile with no edits — it's too generic. Push until it can only be yours.
                  </p>
                </div>
              </div>

              {/* Rule 6 */}
              <div className="rule-card">
                <div className="rule-num-large">6</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: -0.3 }}>Simple formatting wins.</div>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 16 }}>
                    The most common formatting mistake is treating your resume like a design project. Canva templates, multi-column layouts, colour gradients, custom icons — these feel polished when you're building them. When a recruiter opens them, or when ATS tries to parse them, they become a liability.
                  </p>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 20 }}>
                    ATS systems parse text linearly — left to right, top to bottom. A two-column layout often produces garbled output where your education section gets mixed up with your skills section. Tables cause outright parsing failures. Graphics don't parse at all.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '16px 18px' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#f87171', marginBottom: 10, textTransform: 'uppercase' }}>Avoid</div>
                      {['Two-column layouts', 'Tables for any content', 'Text boxes or shapes', 'Canva / Zety / Novoresume templates', 'Coloured section headers', 'Photos or icons', 'Horizontal dividers made of graphics'].map(i => <p key={i} style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 4 }}>✗ {i}</p>)}
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: '16px 18px' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#6ee7b7', marginBottom: 10, textTransform: 'uppercase' }}>Use instead</div>
                      {['Single-column layout', 'Standard section headers (Experience, Education, Skills)', 'Calibri, Arial, or Garamond', 'Simple horizontal lines (text, not graphic)', 'Black or very dark grey text only', 'Word or Google Docs (not Canva)', 'Export as PDF once complete'].map(i => <p key={i} style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 4 }}>✓ {i}</p>)}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </ChapterCard>
          ) : (
            <LockedChapterCard num={1} title={CHAPTER_TITLES[0]} preview="Most students start writing their resume before they understand what a resume actually does. These 6 rules fix that." onUnlock={() => setShowPopup(true)} label="Unlock via Summer Program or Cohort →" />
          )}

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
            <div>
              <SectionBadge num={1} title="Header" free />
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: 16 }}>
                The header is the first thing a recruiter sees. Keep it clean, complete, and scannable in under 3 seconds.
              </p>
              <div className="include-grid">
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 10 }}>Include</div>
                  <ul className="include-list">
                    {['Full name (large, top of page)', 'Phone number (Indian format)', 'Professional email address', 'LinkedIn URL (shortened)', 'City (just city, no full address)', 'Portfolio/GitHub (if relevant to role)'].map(item => (
                      <li key={item}><span style={{ color: '#6ee7b7', fontWeight: 800, flexShrink: 0 }}>✓</span>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#f87171', textTransform: 'uppercase', marginBottom: 10 }}>Never Include</div>
                  <ul className="include-list">
                    {['Date of birth', 'Photo', '"Objective" statements', 'Full home address', 'Marital status'].map(item => (
                      <li key={item}><span style={{ color: '#f87171', fontWeight: 800, flexShrink: 0 }}>✗</span>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>Formula</div>
              <div className="code-block">[Full Name] | [Phone] | [Email] | [LinkedIn] | [City]</div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', margin: '20px 0 8px' }}>Example</div>
              <div className="code-block">{`Priya Sharma\n+91 98765 43210 · priya.sharma@gmail.com · linkedin.com/in/priyasharma · Mumbai`}</div>
            </div>

            {/* Sections 2–6 */}
            <>
              {/* Section 2: Education */}
                <div style={{ paddingTop: 32, marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <SectionBadge num={2} title="Education" />
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: 16 }}>Strong for recent grads. Show it confidently if your numbers are good.</p>
                  <div className="include-grid">
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 10 }}>Include</div>
                      <ul className="include-list">
                        {['College name', 'Degree + major', 'Year of graduation (or expected)', 'CGPA (if 7.5+)', 'Relevant coursework (2–3 max, only if relevant)', 'Academic achievements (if strong)'].map(item => (
                          <li key={item}><span style={{ color: '#6ee7b7', fontWeight: 800, flexShrink: 0 }}>✓</span>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#f87171', textTransform: 'uppercase', marginBottom: 10 }}>Never Include</div>
                      <ul className="include-list">
                        {['School (10th/12th) unless exceptional board result', 'CGPA below 7.0', 'Every course you\'ve taken'].map(item => (
                          <li key={item}><span style={{ color: '#f87171', fontWeight: 800, flexShrink: 0 }}>✗</span>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>Formula</div>
                  <div className="code-block">[College Name] | [Degree], [Major] | [Year] | CGPA: [X.X]</div>
                </div>

                {/* Section 3: Experience */}
                <div style={{ paddingTop: 32, marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <SectionBadge num={3} title="Experience" />
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: 16 }}>
                    The most important section. Each entry: Company name + role title + dates + location. 2–4 bullets using the formula: <strong style={{ color: '#fff' }}>Action verb + what you did + result/impact.</strong>
                  </p>

                  {/* Before/after */}
                  <div className="before-after">
                    <div className="before-box">
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#f87171', marginBottom: 12, textTransform: 'uppercase' }}>Weak</div>
                      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 12 }}>Worked on social media marketing for the brand</p>
                      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>Helped with financial analysis</p>
                    </div>
                    <div className="after-box">
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#6ee7b7', marginBottom: 12, textTransform: 'uppercase' }}>Strong</div>
                      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, marginBottom: 12 }}>Grew brand's Instagram engagement rate from 2.1% to 5.8% over 8 weeks by restructuring content calendar and A/B testing caption formats</p>
                      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75 }}>Built 3-statement financial model for Series B fintech startup; identified ₹12L cost optimisation opportunity presented to CFO</p>
                    </div>
                  </div>

                  {/* Action verb pills — 2-col grid of domain groups */}
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 16 }}>Action Verbs by Domain</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      {[
                        { domain: 'Consulting', verbs: ['Analysed', 'Structured', 'Synthesised', 'Benchmarked', 'Mapped', 'Recommended', 'Evaluated', 'Optimised'], color: '#93BBFF', bg: 'rgba(79,124,255,0.12)', border: 'rgba(79,124,255,0.3)' },
                        { domain: 'Finance', verbs: ['Modelled', 'Forecasted', 'Valued', 'Audited', 'Reconciled', 'Projected', 'Stress-tested', 'Calculated'], color: '#c4b5fd', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
                        { domain: 'Marketing', verbs: ['Grew', 'Launched', 'Campaigned', 'Scaled', 'Tested', 'Optimised', 'Converted', 'Tracked'], color: '#fcd34d', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
                        { domain: 'BD', verbs: ['Sourced', 'Pitched', 'Closed', 'Negotiated', 'Onboarded', 'Prospected', 'Partnered', 'Generated'], color: '#5eead4', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.3)' },
                        { domain: 'Operations', verbs: ['Streamlined', 'Automated', 'Reduced', 'Improved', 'Coordinated', 'Deployed', 'Managed', 'Delivered'], color: '#86efac', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
                        { domain: "Founder's Office", verbs: ['Led', 'Drove', 'Built', 'Designed', 'Executed', 'Owned', 'Shipped', 'Scaled'], color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
                      ].map(row => (
                        <div key={row.domain} className="verb-group">
                          <div className="verb-group-label" style={{ color: row.color }}>{row.domain}</div>
                          <div>
                            {row.verbs.map(v => (
                              <span key={v} className="pill" style={{ background: row.bg, border: `1px solid ${row.border}`, color: row.color }}>{v}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 4: Projects */}
                <div style={{ paddingTop: 32, marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <SectionBadge num={4} title="Projects" />
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: 14 }}>
                    For students without internship experience, projects carry the section.
                  </p>
                  <ul className="include-list">
                    {[
                      'Project name + what it was + result',
                      '2–3 bullet points max',
                      'Only include if genuinely relevant — a random college fest project weakens the resume',
                    ].map(item => (
                      <li key={item}><span style={{ color: '#93BBFF', fontWeight: 800, flexShrink: 0 }}>→</span>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Section 5: Skills */}
                <div style={{ paddingTop: 32, marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <SectionBadge num={5} title="Skills" />
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: 16 }}>Keep it clean and scannable. Only list skills you can be tested on.</p>
                  <div className="include-grid">
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 10 }}>Include</div>
                      <ul className="include-list">
                        {['Technical: Excel, Python, SQL, Tableau', 'Languages: English (Professional), Hindi (Native)', 'Certifications: CFA Level 1 (if relevant)'].map(item => (
                          <li key={item}><span style={{ color: '#6ee7b7', fontWeight: 800, flexShrink: 0 }}>✓</span>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#f87171', textTransform: 'uppercase', marginBottom: 10 }}>Never Write</div>
                      <ul className="include-list">
                        {['"Microsoft Office"', '"Communication skills"', '"Team player"', '"Leadership"'].map(item => (
                          <li key={item}><span style={{ color: '#f87171', fontWeight: 800, flexShrink: 0 }}>✗</span>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 6: Activities */}
                <div style={{ paddingTop: 32, marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <SectionBadge num={6} title="Activities & Achievements" />
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: 14 }}>Optional but powerful if strong. Leave it out if you don't have strong entries — a weak activities section hurts more than it helps.</p>
                  <ul className="include-list">
                    {[
                      'Case competition wins (mention rank + participants)',
                      'Club leadership positions (with measurable impact)',
                      'Publications, patents, national-level achievements',
                    ].map(item => (
                      <li key={item}><span style={{ color: '#93BBFF', fontWeight: 800, flexShrink: 0 }}>→</span>{item}</li>
                    ))}
                  </ul>
                </div>
            </>
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
              <div>
                {[
                  { title: 'Use standard section headers.', body: 'Write "Experience", "Education", "Skills" — not "My Journey", "Where I\'ve Been", "Things I Can Do". ATS looks for standard keywords.' },
                  { title: 'No tables, columns, or text boxes.', body: 'ATS parsers read left to right, top to bottom. Two-column layouts get scrambled. Tables cause parsing failures. Use a single-column layout.' },
                  { title: 'Submit as .docx or .pdf — correctly.', body: 'Most ATS accept both, but some prefer .docx. If the application says PDF, use PDF. Save your file as FirstName_LastName_Resume.pdf — not "resume_final_v3_ACTUAL.pdf".' },
                  { title: 'Mirror the job description.', body: 'If the JD says "financial modelling", write "financial modelling" — not "financial analysis" or "FM". ATS does keyword matching. Use their exact language.' },
                  { title: 'No images, logos, or graphics.', body: 'They don\'t parse. A company logo or decorative line in your header can corrupt the parsed output.' },
                ].map((rule, i) => (
                  <div key={i} className="ats-rule">
                    <div className="ats-num">{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 10 }}>{rule.title}</div>
                      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 1.85 }}>{rule.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChapterCard>
          ) : (
            <LockedChapterCard num={3} title={CHAPTER_TITLES[2]} preview="ATS rejects 75% of resumes before a human sees them. These 5 rules keep you in the game." onUnlock={() => setShowPopup(true)} label="Unlock via Summer Program or Cohort →" />
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
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 24 }}>
                Every formatting decision on your resume sends a signal. These are the rules that separate a professional resume from a student one.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table className="fmt-table">
                  <thead>
                    <tr>
                      <th style={{ width: 180 }}>Rule</th>
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
            <LockedChapterCard num={4} title={CHAPTER_TITLES[3]} preview="The formatting decisions that separate a professional resume from a student resume." onUnlock={() => setShowPopup(true)} label="Unlock via Summer Program or Cohort →" />
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                    <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>⚠️</span>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#f87171', marginBottom: 10 }}>{m.title}</div>
                      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 1.85 }}>{m.body}</p>
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
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
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
              <div style={{ background: 'rgba(79,124,255,0.04)', border: '1px solid rgba(79,124,255,0.12)', borderRadius: 16, padding: '28px 28px 24px' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 20, letterSpacing: -0.3 }}>{domainTab}</div>
                <div style={{ marginBottom: 24 }}>
                  {DOMAIN_TIPS[domainTab].tips.map((tip, i) => (
                    <p key={i} style={{ fontSize: 15, lineHeight: 1.85, color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>
                      → {tip}
                    </p>
                  ))}
                </div>
                <div className="verb-group">
                  <div className="verb-group-label">Action Verbs</div>
                  <div>
                    {DOMAIN_TIPS[domainTab].verbs.map(v => (
                      <span key={v} className="pill" style={{ background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF' }}>{v}</span>
                    ))}
                  </div>
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
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: completedCount === TOTAL_CHECKS ? '#6ee7b7' : '#fcd34d' }}>
                    {completedCount} / {TOTAL_CHECKS} complete
                  </span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{progressPct}%</span>
                </div>
                <div className="progress-bar-track">
                  <div style={{ height: '100%', width: `${progressPct}%`, background: completedCount === TOTAL_CHECKS ? 'linear-gradient(90deg,#10b981,#6ee7b7)' : 'linear-gradient(90deg,#f59e0b,#fcd34d)', borderRadius: 100, transition: 'width 0.3s ease' }} />
                </div>
              </div>

              {/* Checklist categories */}
              {CHECKLIST.map((cat, catIdx) => (
                <div key={cat.category}>
                  <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8, marginTop: catIdx === 0 ? 0 : 28 }}>{cat.category}</div>
                  {cat.items.map(item => (
                    <div
                      key={item.key}
                      className="checklist-row"
                      onClick={() => toggleCheck(item.key)}
                    >
                      <div className={`check-box${checklist[item.key] ? ' checked' : ''}`}>
                        {checklist[item.key] && <span style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 800, lineHeight: 1 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 15, color: checklist[item.key] ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.72)', lineHeight: 1.6, textDecoration: checklist[item.key] ? 'line-through' : 'none', transition: 'color 0.15s' }}>
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
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 18 }}>Chapters</div>

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
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: isExpanded && accessible ? 'rgba(79,124,255,0.1)' : 'transparent', border: `1px solid ${isExpanded && accessible ? 'rgba(79,124,255,0.25)' : 'transparent'}`, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textAlign: 'left', width: '100%', transition: 'all 0.15s' }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.25)', width: 18, flexShrink: 0 }}>{ch}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: accessible ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>{title}</span>
                      <span style={{ fontSize: 12, flexShrink: 0 }}>
                        {accessible ? (isExpanded ? <span style={{ color: '#93BBFF' }}>✓</span> : <span style={{ color: 'rgba(255,255,255,0.25)' }}>↓</span>) : <span style={{ opacity: 0.4 }}>🔒</span>}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Sidebar unlock section */}
              {!fullyUnlocked && (
                <div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 18 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 14 }}>Chapters 3–7 are unlocked via Summer Program or Full Cohort.</div>
                  <button
                    onClick={() => setShowPopup(true)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,rgba(79,124,255,0.18),rgba(123,97,255,0.12))', border: '1.5px solid rgba(79,124,255,0.4)', color: '#93BBFF', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                  >
                    Unlock all 7 →
                  </button>
                </div>
              )}

              {fullyUnlocked && (
                <div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 18 }} />
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
              Join Summer Program — ₹699 →
            </a>
            <a href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 100, background: 'rgba(79,124,255,0.12)', border: '1.5px solid rgba(79,124,255,0.35)', color: '#93BBFF', fontWeight: 700, fontSize: 14 }}>
              Book a Session — ₹299
            </a>
            <a href="/resources/resume-builder" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)', fontWeight: 700, fontSize: 14 }}>
              Build your resume →
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
    { bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.3)', text: '#7dd3fc' },
    { bg: 'rgba(79,124,255,0.12)', border: 'rgba(79,124,255,0.3)', text: '#93BBFF' },
    { bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.3)', text: '#5eead4' },
    { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d' },
    { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
    { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#a5b4fc' },
    { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#6ee7b7' },
  ]
  const c = colors[(num - 1) % colors.length]

  return (
    <div className={`chapter-card${locked ? ' locked' : expanded ? ' expanded' : ''}`}>
      <span className="ch-watermark">{String(num).padStart(2, '0')}</span>
      <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: "'DM Sans',sans-serif" }}>
        {/* Chapter label + number badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: c.text, textTransform: 'uppercase', opacity: 0.8 }}>CH</span>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: c.text }}>{num}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.25, letterSpacing: -0.3, paddingRight: 48 }}>{title}</div>
          {!expanded && <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginTop: 6, paddingRight: 48 }}>{preview}</div>}
        </div>
        <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.25)', flexShrink: 0, transition: 'transform 0.25s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', marginTop: 2 }}>⌄</span>
      </button>
      {expanded && <div style={{ marginTop: 36, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>{children}</div>}
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
    { bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.2)', text: 'rgba(125,211,252,0.4)' },
    { bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.2)', text: 'rgba(147,187,255,0.4)' },
    { bg: 'rgba(20,184,166,0.1)', border: 'rgba(20,184,166,0.2)', text: 'rgba(94,234,212,0.4)' },
    { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: 'rgba(252,211,77,0.4)' },
    { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', text: 'rgba(248,113,113,0.4)' },
    { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', text: 'rgba(165,180,252,0.4)' },
    { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: 'rgba(110,231,183,0.4)' },
  ]
  const c = colors[(num - 1) % colors.length]

  return (
    <div className="chapter-card locked">
      <span className="ch-watermark">{String(num).padStart(2, '0')}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: c.text, textTransform: 'uppercase', opacity: 0.6 }}>CH</span>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: c.text }}>{num}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.35)', lineHeight: 1.25, letterSpacing: -0.3, paddingRight: 48 }}>{title}</div>
        </div>
        <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
      </div>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.25)', lineHeight: 1.75, marginBottom: 18, paddingRight: 24 }}>{preview}</p>
      <button
        onClick={onUnlock}
        style={{ padding: '10px 24px', borderRadius: 100, background: isPaid ? 'rgba(79,124,255,0.12)' : 'rgba(245,158,11,0.1)', border: `1px solid ${isPaid ? 'rgba(79,124,255,0.3)' : 'rgba(245,158,11,0.25)'}`, color: isPaid ? '#93BBFF' : '#fcd34d', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
      >
        {label}
      </button>
    </div>
  )
}

function SectionBadge({ num, title, free = false }: { num: number; title: string; free?: boolean }) {
  return (
    <div className="section-badge-row">
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, padding: '4px 11px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.22)', color: '#93BBFF', textTransform: 'uppercase' }}>Section {num}</span>
      <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.2 }}>{title}</span>
      {free && <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7', letterSpacing: 0.5 }}>ALWAYS FREE</span>}
    </div>
  )
}
