'use client'

import React, { useState, useEffect } from 'react'
import UnlockPopup from '../../components/UnlockPopup'

/* ─────────────────────────────────────────────
   RESUME PLACEHOLDER CONTENT
───────────────────────────────────────────── */
const RESUME = {
  name: 'Rahul Mehta',
  college: '[Your College], Delhi',
  degree: 'BBA (Honours)',
  grad: 'Expected May 2025',
  cgpa: '8.1/10',
  phone: '+91 98XXX XXXXX',
  email: 'rahul.mehta@email.com',
  linkedin: 'linkedin.com/in/rahulmehta',
  exp: [
    {
      company: 'Bloom D2C Startup',
      role: 'Business Development Intern',
      duration: 'Jun–Aug 2024',
      bullets: [
        'Identified and cold-contacted 45 potential B2B partnership leads over 6 weeks',
        'Converted 4 leads into active discussions, contributing to 2 signed agreements worth ₹3.2L',
        'Built and maintained a CRM tracker for 60+ prospects using Notion and Google Sheets',
      ],
    },
    {
      company: 'College Finance Society',
      role: 'Research Analyst',
      duration: 'Aug 2023–Present',
      bullets: [
        'Prepared weekly market research reports on 3 sectors, distributed to 200+ members',
        'Co-authored a 12-page report on FMCG sector trends; presented to faculty panel of 5',
      ],
    },
  ],
  project: {
    name: 'Competitive Analysis — EdTech Sector',
    context: 'College Strategy Course',
    bullets: [
      'Analyzed 5 EdTech companies across pricing, positioning, and growth strategies',
      'Identified 3 untapped market opportunities; ranked 1st among 14 teams at college',
    ],
  },
  skills: 'MS Excel (Advanced), PowerPoint, Notion, Google Analytics (Basic), Canva',
  languages: 'English (Fluent), Hindi (Native)',
}

/* ─────────────────────────────────────────────
   RESUME HTML RENDERERS
───────────────────────────────────────────── */
function LSEResume() {
  return (
    <div style={{ fontFamily: 'Times New Roman, serif', fontSize: 10.5, lineHeight: 1.5, color: '#000', padding: '24px 28px', background: '#fff', width: 595 }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>{RESUME.name}</div>
        <div style={{ fontSize: 10, color: '#333', marginTop: 4 }}>
          {RESUME.phone} · {RESUME.email} · {RESUME.linkedin} · Delhi
        </div>
      </div>
      <div style={{ borderBottom: '1.5px solid black', marginBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Education</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>{RESUME.college}</span>
          <span>{RESUME.grad}</span>
        </div>
        <div>{RESUME.degree} · CGPA: {RESUME.cgpa}</div>
      </div>
      <div style={{ borderBottom: '1.5px solid black', marginBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Experience</div>
      </div>
      {RESUME.exp.map((e, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>{e.company}</span>
            <span>{e.duration}</span>
          </div>
          <div style={{ fontStyle: 'italic' }}>{e.role}</div>
          {e.bullets.map((b, j) => <div key={j}>— {b}</div>)}
        </div>
      ))}
      <div style={{ borderBottom: '1.5px solid black', marginBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Projects</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 'bold' }}>{RESUME.project.name} <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}>| {RESUME.project.context}</span></div>
        {RESUME.project.bullets.map((b, i) => <div key={i}>— {b}</div>)}
      </div>
      <div style={{ borderBottom: '1.5px solid black', marginBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Skills &amp; Languages</div>
      </div>
      <div><span style={{ fontWeight: 'bold' }}>Skills:</span> {RESUME.skills}</div>
      <div><span style={{ fontWeight: 'bold' }}>Languages:</span> {RESUME.languages}</div>
    </div>
  )
}

function IIMResume() {
  return (
    <div style={{ fontFamily: 'Calibri, Arial, sans-serif', fontSize: 10, lineHeight: 1.4, color: '#000', padding: '24px 28px', background: '#fff', width: 595 }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 }}>{RESUME.name}</div>
        <div style={{ fontSize: 9.5, marginTop: 4 }}>{RESUME.phone} · {RESUME.email} · {RESUME.linkedin}</div>
      </div>
      <div style={{ background: '#000', color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', padding: '2px 6px', marginBottom: 6, marginTop: 10 }}>Education</div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>{RESUME.college}</span>
          <span>{RESUME.grad}</span>
        </div>
        <div>{RESUME.degree} · CGPA: {RESUME.cgpa}</div>
      </div>
      <div style={{ background: '#000', color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', padding: '2px 6px', marginBottom: 6 }}>Experience</div>
      {RESUME.exp.map((e, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>{e.company}</span>
            <span>{e.duration}</span>
          </div>
          <div style={{ fontStyle: 'italic', fontSize: 9.5 }}>{e.role}</div>
          {e.bullets.map((b, j) => <div key={j} style={{ paddingLeft: 10 }}>• {b}</div>)}
        </div>
      ))}
      <div style={{ background: '#000', color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', padding: '2px 6px', marginBottom: 6 }}>Projects</div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 'bold' }}>{RESUME.project.name} <span style={{ fontWeight: 'normal' }}>| {RESUME.project.context}</span></div>
        {RESUME.project.bullets.map((b, i) => <div key={i} style={{ paddingLeft: 10 }}>• {b}</div>)}
      </div>
      <div style={{ background: '#000', color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', padding: '2px 6px', marginBottom: 6 }}>Skills</div>
      <div>{RESUME.skills}</div>
      <div style={{ marginTop: 4 }}><span style={{ fontWeight: 'bold' }}>Languages:</span> {RESUME.languages}</div>
    </div>
  )
}

function DUResume() {
  return (
    <div style={{ fontFamily: 'Calibri, sans-serif', fontSize: 10.5, lineHeight: 1.55, color: '#1a1a1a', padding: '24px 28px', background: '#fff', width: 595 }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' }}>{RESUME.name}</div>
        <div style={{ fontSize: 10, color: '#555' }}>{RESUME.phone} · {RESUME.email} · {RESUME.linkedin}</div>
      </div>
      <div style={{ borderBottom: '1px solid #888', marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#1a1a1a' }}>Education</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>{RESUME.college}</span>
          <span style={{ color: '#555' }}>{RESUME.grad}</span>
        </div>
        <div>{RESUME.degree} · CGPA: {RESUME.cgpa}</div>
      </div>
      <div style={{ borderBottom: '1px solid #888', marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#1a1a1a' }}>Experience</div>
      </div>
      {RESUME.exp.map((e, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>{e.company}</span>
            <span style={{ color: '#555' }}>{e.duration}</span>
          </div>
          <div style={{ fontStyle: 'italic', color: '#444' }}>{e.role}</div>
          {e.bullets.map((b, j) => <div key={j} style={{ paddingLeft: 10 }}>• {b}</div>)}
        </div>
      ))}
      <div style={{ borderBottom: '1px solid #888', marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#1a1a1a' }}>Projects</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 'bold' }}>{RESUME.project.name} <span style={{ fontWeight: 'normal' }}>| {RESUME.project.context}</span></div>
        {RESUME.project.bullets.map((b, i) => <div key={i} style={{ paddingLeft: 10 }}>• {b}</div>)}
      </div>
      <div style={{ borderBottom: '1px solid #888', marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#1a1a1a' }}>Skills</div>
      </div>
      <div>{RESUME.skills}</div>
      <div style={{ marginTop: 4 }}><span style={{ fontWeight: 'bold' }}>Languages:</span> {RESUME.languages}</div>
    </div>
  )
}

function StartupResume() {
  return (
    <div style={{ fontFamily: 'DM Sans, Inter, sans-serif', fontSize: 10.5, lineHeight: 1.6, color: '#1e293b', padding: '24px 28px', background: '#fff', width: 595 }}>
      <div style={{ borderLeft: '4px solid #1e40af', paddingLeft: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{RESUME.name}</div>
        <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{RESUME.phone} · {RESUME.email} · {RESUME.linkedin}</div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#1e40af', marginBottom: 6 }}>Education</div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>{RESUME.college}</span>
          <span style={{ color: '#475569' }}>{RESUME.grad}</span>
        </div>
        <div style={{ color: '#475569' }}>{RESUME.degree} · CGPA: {RESUME.cgpa}</div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#1e40af', marginBottom: 6 }}>Experience</div>
      {RESUME.exp.map((e, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>{e.company}</span>
            <span style={{ color: '#475569' }}>{e.duration}</span>
          </div>
          <div style={{ color: '#64748b' }}>{e.role}</div>
          {e.bullets.map((b, j) => <div key={j} style={{ paddingLeft: 10 }}>· {b}</div>)}
        </div>
      ))}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#1e40af', marginBottom: 6 }}>Projects</div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 700 }}>{RESUME.project.name} <span style={{ fontWeight: 400, color: '#64748b' }}>| {RESUME.project.context}</span></div>
        {RESUME.project.bullets.map((b, i) => <div key={i} style={{ paddingLeft: 10 }}>· {b}</div>)}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#1e40af', marginBottom: 8 }}>Skills</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {RESUME.skills.split(',').map((s, i) => (
          <span key={i} style={{ padding: '2px 8px', borderRadius: 100, background: 'rgba(30,64,175,0.08)', border: '1px solid rgba(30,64,175,0.2)', fontSize: 9.5, color: '#1e40af', fontWeight: 600 }}>{s.trim()}</span>
        ))}
      </div>
      <div style={{ marginTop: 8 }}><span style={{ fontWeight: 700 }}>Languages:</span> {RESUME.languages}</div>
    </div>
  )
}

function FinanceResume() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', fontSize: 10.5, lineHeight: 1.5, color: '#000', padding: '24px 28px', background: '#fff', width: 595 }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' }}>{RESUME.name}</div>
        <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>{RESUME.phone} · {RESUME.email} · {RESUME.linkedin}</div>
      </div>
      <div style={{ background: 'rgba(26,26,46,0.06)', border: '1px solid rgba(26,26,46,0.15)', borderRadius: 4, padding: '6px 10px', marginBottom: 12, marginTop: 6 }}>
        <div style={{ fontSize: 9.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: '#1a1a2e', marginBottom: 4 }}>Key Tools &amp; Skills</div>
        <div style={{ fontSize: 10 }}>{RESUME.skills}</div>
      </div>
      <div style={{ borderBottom: '2px solid #1a1a2e', marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, color: '#1a1a2e' }}>Education</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>{RESUME.college}</span>
          <span>{RESUME.grad}</span>
        </div>
        <div>{RESUME.degree} · CGPA: {RESUME.cgpa}</div>
      </div>
      <div style={{ borderBottom: '2px solid #1a1a2e', marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, color: '#1a1a2e' }}>Experience</div>
      </div>
      {RESUME.exp.map((e, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>{e.company}</span>
            <span>{e.duration}</span>
          </div>
          <div style={{ fontStyle: 'italic' }}>{e.role}</div>
          {e.bullets.map((b, j) => <div key={j} style={{ paddingLeft: 10 }}>— {b}</div>)}
        </div>
      ))}
      <div style={{ borderBottom: '2px solid #1a1a2e', marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, color: '#1a1a2e' }}>Projects</div>
      </div>
      <div>
        <div style={{ fontWeight: 'bold' }}>{RESUME.project.name} <span style={{ fontWeight: 'normal' }}>| {RESUME.project.context}</span></div>
        {RESUME.project.bullets.map((b, i) => <div key={i} style={{ paddingLeft: 10 }}>— {b}</div>)}
      </div>
      <div style={{ marginTop: 8 }}><span style={{ fontWeight: 'bold' }}>Languages:</span> {RESUME.languages}</div>
    </div>
  )
}

function MarketingResume() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, lineHeight: 1.6, color: '#111827', padding: '24px 28px', background: '#fff', width: 595 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#111827', letterSpacing: -0.5 }}>{RESUME.name}</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#6b7280', marginTop: 4, flexWrap: 'wrap' }}>
          <span>{RESUME.phone}</span>
          <span>{RESUME.email}</span>
          <span>{RESUME.linkedin}</span>
        </div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#7c3aed', marginBottom: 6 }}>Education</div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>{RESUME.college}</span>
          <span style={{ color: '#6b7280' }}>{RESUME.grad}</span>
        </div>
        <div style={{ color: '#4b5563' }}>{RESUME.degree} · CGPA: {RESUME.cgpa}</div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#7c3aed', marginBottom: 6 }}>Experience</div>
      {RESUME.exp.map((e, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>{e.company}</span>
            <span style={{ color: '#6b7280' }}>{e.duration}</span>
          </div>
          <div style={{ color: '#6b7280' }}>{e.role}</div>
          {e.bullets.map((b, j) => <div key={j} style={{ paddingLeft: 10 }}>• {b}</div>)}
        </div>
      ))}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#7c3aed', marginBottom: 6 }}>Projects</div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 700 }}>{RESUME.project.name} <span style={{ fontWeight: 400, color: '#6b7280' }}>| {RESUME.project.context}</span></div>
        {RESUME.project.bullets.map((b, i) => <div key={i} style={{ paddingLeft: 10 }}>• {b}</div>)}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#7c3aed', marginBottom: 6 }}>Skills &amp; Tools</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
        {RESUME.skills.split(',').map((s, i) => (
          <div key={i} style={{ fontSize: 10 }}>• {s.trim()}</div>
        ))}
      </div>
      <div style={{ marginTop: 8 }}><span style={{ fontWeight: 700 }}>Languages:</span> {RESUME.languages}</div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TEMPLATE DATA
───────────────────────────────────────────── */
type TemplateItem = {
  id: number
  name: string
  badge: 'FREE' | 'PREMIUM'
  tags: string[]
  description: string
  useLink?: string
  Render: () => React.ReactElement
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 1,
    name: 'LSE Format',
    badge: 'FREE',
    tags: ['All backgrounds', 'Consulting & Finance', 'Classic'],
    description: 'Clean single-column serif format. Universally respected by Indian and global recruiters.',
    useLink: '/resources/resume-builder',
    Render: LSEResume,
  },
  {
    id: 2,
    name: 'IIM Format',
    badge: 'PREMIUM',
    tags: ['Commerce & MBA', 'Big 4 & Consulting', 'Structured'],
    description: 'The gold standard for Indian business school applications.',
    Render: IIMResume,
  },
  {
    id: 3,
    name: 'DU Format',
    badge: 'PREMIUM',
    tags: ['Commerce backgrounds', 'Finance & Operations', 'Professional'],
    description: 'Optimized for Delhi University commerce graduates. Clean and ATS-safe.',
    Render: DUResume,
  },
  {
    id: 4,
    name: "Startup & Founder's Office",
    badge: 'PREMIUM',
    tags: ['Startup roles', "Founder's Office & BD", 'Modern'],
    description: "For growth-stage startups and Founder's Office roles. Clean sans-serif with personality.",
    Render: StartupResume,
  },
  {
    id: 5,
    name: 'Finance & FP&A',
    badge: 'PREMIUM',
    tags: ['Finance backgrounds', 'FP&A & Investment', 'Numbers-forward'],
    description: 'Designed for finance-heavy roles. Skills and tools section prominently placed.',
    Render: FinanceResume,
  },
  {
    id: 6,
    name: 'Marketing & BD',
    badge: 'PREMIUM',
    tags: ['Marketing & BD', 'D2C & Startups', 'Dynamic'],
    description: 'For marketing, content, and BD roles where tools and campaigns matter.',
    Render: MarketingResume,
  },
]

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function ResumeTemplatesPage() {
  const [fullyUnlocked, setFullyUnlocked] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null)

  useEffect(() => {
    setFullyUnlocked(localStorage.getItem('resourcePackUnlocked') === 'true')
  }, [])

  // Close modal on Escape
  useEffect(() => {
    if (!previewTemplate) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreviewTemplate(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [previewTemplate])

  const isLocked = (t: TemplateItem) => t.badge === 'PREMIUM' && !fullyUnlocked

  const bannerText = fullyUnlocked
    ? 'All 6 templates unlocked ✓'
    : 'Template 1 free · Unlock all 6 with Resource Pack →'

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}

        .template-card{
          background:#111827;
          border:1px solid rgba(255,255,255,0.07);
          border-radius:20px;
          overflow:hidden;
          transition:border-color 0.2s,box-shadow 0.2s;
          display:flex;
          flex-direction:column;
        }
        .template-card:hover{
          border-color:rgba(79,124,255,0.3);
          box-shadow:0 8px 32px rgba(79,124,255,0.08);
        }
        .template-card.locked-card{
          border-color:rgba(255,255,255,0.04);
        }

        .unlock-banner{
          display:flex;align-items:center;justify-content:space-between;
          flex-wrap:wrap;gap:10px;
          background:rgba(79,124,255,0.06);
          border:1px solid rgba(79,124,255,0.18);
          border-radius:10px;
          padding:10px 16px;
          margin-bottom:24px;
        }
        .unlock-banner-btn{
          padding:5px 14px;border-radius:100px;
          background:rgba(79,124,255,0.12);
          border:1px solid rgba(79,124,255,0.3);
          color:#93BBFF;font-size:12px;font-weight:700;
          cursor:pointer;
          font-family:"DM Sans",sans-serif;
        }
        .unlock-banner-btn:hover{background:rgba(79,124,255,0.2)}

        .tag-pill{
          padding:4px 10px;
          border-radius:100px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.5);
          font-size:11px;
          font-weight:600;
          white-space:nowrap;
        }

        .preview-thumbnail{
          width:100%;
          height:180px;
          overflow:hidden;
          background:#f8f8f8;
          position:relative;
          flex-shrink:0;
          cursor:pointer;
        }
        .preview-thumbnail-inner{
          position:absolute;
          top:0;
          left:0;
          transform-origin:top left;
          transform:scale(0.18);
          width:555px;
        }

        .action-btn{
          display:inline-flex;align-items:center;justify-content:center;
          padding:9px 18px;border-radius:10px;
          font-size:13px;font-weight:700;
          font-family:"DM Sans",sans-serif;
          cursor:pointer;transition:all 0.15s;
          border:none;
          flex:1;
        }
        .action-btn-primary{
          background:linear-gradient(135deg,#4F7CFF,#7B61FF);
          color:#fff;
          box-shadow:0 2px 12px rgba(79,124,255,0.3);
        }
        .action-btn-primary:hover{opacity:0.9}
        .action-btn-outline{
          background:transparent;
          border:1px solid rgba(255,255,255,0.15) !important;
          color:rgba(255,255,255,0.65);
        }
        .action-btn-outline:hover{background:rgba(255,255,255,0.06);color:#fff}
        .action-btn-lock{
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1) !important;
          color:rgba(255,255,255,0.35);
          cursor:pointer;
        }
        .action-btn-lock:hover{background:rgba(79,124,255,0.1);border-color:rgba(79,124,255,0.3) !important;color:#93BBFF}

        .modal-overlay{
          position:fixed;inset:0;z-index:1000;
          background:rgba(0,0,0,0.92);
          backdrop-filter:blur(8px);
          display:flex;align-items:center;justify-content:center;
          padding:20px;
        }
        .modal-card{
          background:#fff;
          border-radius:16px;
          overflow:hidden;
          max-width:700px;
          width:100%;
          max-height:90vh;
          display:flex;
          flex-direction:column;
          position:relative;
        }
        .modal-body{
          overflow-y:auto;
          flex:1;
          padding:0;
        }
        .modal-footer{
          background:#fff;
          border-top:1px solid #e5e7eb;
          padding:16px 24px;
          display:flex;
          gap:10px;
          align-items:center;
          justify-content:space-between;
          flex-wrap:wrap;
        }

        @media(max-width:900px){
          .template-grid{grid-template-columns:repeat(2,1fr) !important}
        }
        @media(max-width:580px){
          .template-grid{grid-template-columns:1fr !important}
          .top-bar-title{display:none}
          .stat-pills{flex-wrap:wrap}
        }
      `}</style>

      <UnlockPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onEmailUnlock={() => {}}
        resourceName="Resume Templates"
        localStorageKey="resumeTemplates"
        showEmailOption={false}
        emailAlreadySubmitted={false}
      />

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setPreviewTemplate(null) }}
        >
          <div className="modal-card">
            <div style={{ background: '#111827', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{previewTemplate.name}</span>
                <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: previewTemplate.badge === 'FREE' ? 'rgba(16,185,129,0.15)' : 'rgba(79,124,255,0.15)', border: `1px solid ${previewTemplate.badge === 'FREE' ? 'rgba(16,185,129,0.4)' : 'rgba(79,124,255,0.4)'}`, color: previewTemplate.badge === 'FREE' ? '#6ee7b7' : '#93BBFF' }}>{previewTemplate.badge}</span>
              </div>
              <button onClick={() => setPreviewTemplate(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <div className="modal-body">
              <previewTemplate.Render />
            </div>
            <div className="modal-footer">
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {previewTemplate.description}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {previewTemplate.badge === 'FREE' ? (
                  <a
                    href="/resources/resume-builder"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
                  >
                    Use This Template →
                  </a>
                ) : (
                  <button
                    onClick={() => { setPreviewTemplate(null); setShowPopup(true) }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                  >
                    Unlock All Templates — ₹199 →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5, flexShrink: 0 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <span className="top-bar-title" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>Resume Templates — 6 Formats</span>
        <a
          href="/resources/resume-builder"
          style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(79,124,255,0.25)', background: 'rgba(79,124,255,0.06)', color: '#93BBFF', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          Try Builder →
        </a>
      </div>

      {/* HERO */}
      <section style={{ padding: '64px 24px 48px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#93BBFF', textTransform: 'uppercase', marginBottom: 20 }}>
          FREE RESOURCE
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(28px,5vw,48px)', fontWeight: 400, letterSpacing: -1, lineHeight: 1.1, marginBottom: 16 }}>
          Resume Templates That Get You Shortlisted
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 32, maxWidth: 580, margin: '0 auto 32px' }}>
          6 formats used by students who cracked consulting, finance, Founder&apos;s Office, and startup roles — off campus. One free, rest with Resource Pack.
        </p>
        <div className="stat-pills" style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { label: '6 Templates', color: '#4F7CFF', bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.25)' },
            { label: 'ATS-Optimized', color: '#fcd34d', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
            { label: 'Recruiter Approved', color: '#6ee7b7', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
          ].map(p => (
            <span key={p.label} style={{ padding: '8px 18px', borderRadius: 100, background: p.bg, border: `1px solid ${p.border}`, color: p.color, fontSize: 13, fontWeight: 700 }}>{p.label}</span>
          ))}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          {fullyUnlocked ? (
            <span style={{ color: '#10b981', fontWeight: 600 }}>All 6 templates unlocked ✓</span>
          ) : (
            <span>
              1 template free ·{' '}
              <button onClick={() => setShowPopup(true)} style={{ background: 'none', border: 'none', color: '#4F7CFF', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'DM Sans',sans-serif", textDecoration: 'underline', padding: 0 }}>
                Unlock all 6 for ₹199 →
              </button>
            </span>
          )}
        </div>
      </section>

      {/* UNLOCK BANNER */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div className="unlock-banner">
          <span style={{ fontSize: 13, color: '#93BBFF', fontWeight: 600 }}>{bannerText}</span>
          {!fullyUnlocked && (
            <button className="unlock-banner-btn" onClick={() => setShowPopup(true)}>Unlock All →</button>
          )}
        </div>
      </div>

      {/* TEMPLATE GRID */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px 80px' }}>
        <div className="template-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {TEMPLATES.map(t => {
            const locked = isLocked(t)
            return (
              <div key={t.id} className={`template-card${locked ? ' locked-card' : ''}`}>
                {/* Thumbnail preview */}
                <div
                  className="preview-thumbnail"
                  onClick={() => setPreviewTemplate(t)}
                  title={`Preview ${t.name}`}
                >
                  <div className="preview-thumbnail-inner">
                    <t.Render />
                  </div>
                  {locked && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,11,15,0.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
                      onClick={e => { e.stopPropagation(); setShowPopup(true) }}
                    >
                      <div style={{ fontSize: 24 }}>🔒</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Unlock to preview</div>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Name + badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', flex: 1, letterSpacing: -0.3 }}>{t.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: t.badge === 'FREE' ? 'rgba(16,185,129,0.15)' : 'rgba(79,124,255,0.12)', border: `1px solid ${t.badge === 'FREE' ? 'rgba(16,185,129,0.4)' : 'rgba(79,124,255,0.3)'}`, color: t.badge === 'FREE' ? '#6ee7b7' : '#93BBFF', letterSpacing: 0.5 }}>{t.badge}</span>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {t.tags.map(tag => (
                      <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>{t.description}</p>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
                    <button
                      className="action-btn action-btn-outline"
                      onClick={() => setPreviewTemplate(t)}
                      style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      Preview
                    </button>
                    {t.badge === 'FREE' ? (
                      <a
                        href="/resources/resume-builder"
                        className="action-btn action-btn-primary"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        Use This →
                      </a>
                    ) : locked ? (
                      <button
                        className="action-btn action-btn-lock"
                        onClick={() => setShowPopup(true)}
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        🔒 Unlock
                      </button>
                    ) : (
                      <button
                        className="action-btn action-btn-primary"
                        onClick={() => setPreviewTemplate(t)}
                      >
                        Use This →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '64px 24px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(20px,4vw,32px)', fontWeight: 800, letterSpacing: -0.75, lineHeight: 1.2, marginBottom: 12 }}>
            One format covered. Six ready to use.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 32 }}>
            Pair your template with the resume guide and a structured off-campus strategy.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/resources/resume-guide"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 100, background: 'rgba(79,124,255,0.12)', border: '1.5px solid rgba(79,124,255,0.35)', color: '#93BBFF', fontWeight: 700, fontSize: 14 }}
            >
              Read the Resume Guide →
            </a>
            <a
              href="/summer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 100, background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: 'white', fontWeight: 700, fontSize: 14, boxShadow: '0 0 24px rgba(245,158,11,0.25)' }}
            >
              Join Summer Program →
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
