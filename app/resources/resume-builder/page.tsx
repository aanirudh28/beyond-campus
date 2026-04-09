'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import UnlockPopup from '../../components/UnlockPopup'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/* ─────────────────────────────────────────────
   TYPES & DEFAULTS
───────────────────────────────────────────── */
type Experience    = { company: string; role: string; duration: string; location: string; bullets: string[] }
type Project       = { name: string; context: string; bullets: string[] }
type Education2    = { college: string; degree: string; year: string; cgpa: string }
type Certification = { name: string; org: string; year: string; inProgress: boolean }
type Position      = { title: string; org: string; duration: string; bullet: string }
type Toast         = { id: number; message: string; type?: 'success' | 'warn' | 'error' }

interface FormData {
  name: string; college: string; degree: string; year: string; cgpa: string
  phone: string; email: string; linkedin: string; city: string
  summary: string
  experiences: Experience[]
  education2: Education2
  education3: Education2
  projects: Project[]
  skills: string[]
  languages: string[]
  certifications: Certification[]
  positions: Position[]
}

const defaultFormData: FormData = {
  name: '', college: '', degree: '', year: '', cgpa: '', phone: '', email: '', linkedin: '', city: '',
  summary: '',
  experiences: [{ company: '', role: '', duration: '', location: '', bullets: ['', '', '', ''] }],
  education2: { college: '', degree: '', year: '', cgpa: '' },
  education3: { college: '', degree: '', year: '', cgpa: '' },
  projects: [{ name: '', context: '', bullets: ['', ''] }],
  skills: [],
  languages: [],
  certifications: [],
  positions: [],
}

const ACTION_VERBS = ['Analyzed','Evaluated','Recommended','Structured','Synthesized','Identified','Developed','Modeled','Forecasted','Managed','Launched','Grew','Optimized','Created','Drove','Sourced','Negotiated','Converted','Coordinated','Streamlined','Implemented','Executed','Built','Scaled','Led','Presented','Researched','Delivered','Generated','Reduced','Improved','Increased','Designed','Supervised','Trained','Established','Initiated','Resolved']

const DOMAIN_SUGGESTIONS: Record<string, string[]> = {
  'Consulting':        ['MS Excel', 'PowerPoint', 'Case Frameworks', 'Market Research', 'Financial Modeling'],
  'Finance':           ['MS Excel (Advanced)', 'Financial Modeling', 'Bloomberg', 'Valuation', 'Tally'],
  "Founder's Office":  ['Notion', 'Airtable', 'Google Analytics', 'Excel', 'Canva'],
  'Marketing':         ['Canva', 'Google Analytics', 'Meta Ads', 'Mailchimp', 'Excel'],
  'BD':                ['CRM Tools', 'Excel', 'PowerPoint', 'LinkedIn Sales Navigator', 'Notion'],
  'Operations':        ['Excel', 'SQL (Basic)', 'Notion', 'Google Sheets', 'Tableau'],
}

const DOMAINS = ['Consulting', 'Finance', "Founder's Office", 'Marketing', 'BD', 'Operations']

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'Consulting':        ['analysis', 'strategy', 'framework', 'market', 'research', 'presentation', 'stakeholder', 'recommendations', 'structured', 'case'],
  'Finance':           ['financial', 'modeling', 'excel', 'valuation', 'analysis', 'forecast', 'budget', 'revenue', 'cost', 'p&l'],
  "Founder's Office":  ['strategy', 'operations', 'growth', 'cross-functional', 'stakeholder', 'execution', 'coordination', 'initiative', 'project', 'leadership'],
  'Marketing':         ['campaign', 'content', 'social media', 'analytics', 'engagement', 'brand', 'digital', 'audience', 'conversion', 'growth'],
  'BD':                ['partnership', 'sales', 'negotiation', 'pipeline', 'client', 'revenue', 'outreach', 'relationship', 'deal', 'prospect'],
  'Operations':        ['process', 'efficiency', 'optimization', 'coordination', 'vendor', 'logistics', 'workflow', 'implementation', 'tracking', 'reporting'],
}

const EXAMPLE_DATA: FormData = {
  name: 'Rahul Mehta', college: '[Your College], Delhi', degree: 'BBA (Honours)', year: '2025', cgpa: '8.1',
  phone: '+91 98XXX XXXXX', email: 'rahul.mehta@email.com', linkedin: 'linkedin.com/in/rahulmehta', city: 'Delhi',
  summary: 'Final-year BBA student at [Your College], Delhi, targeting Business Development and consulting roles. Built and converted a 45-lead B2B pipeline during my internship at Bloom. Strong in Excel, market research, and structured thinking.',
  experiences: [
    { company: 'Bloom D2C Startup', role: 'Business Development Intern', duration: 'Jun\u2013Aug 2024', location: 'Delhi',
      bullets: ['Identified and cold-contacted 45 potential B2B partnership leads over 6 weeks', 'Converted 4 leads into active discussions, contributing to 2 signed agreements worth ₹3.2L', 'Built and maintained a CRM tracker for 60+ prospects using Notion and Google Sheets', ''] },
    { company: 'College Finance Society', role: 'Research Analyst', duration: 'Aug 2023\u2013Present', location: '',
      bullets: ['Prepared weekly market research reports on 3 sectors, distributed to 200+ members', 'Co-authored a 12-page report on FMCG sector trends; presented to faculty panel of 5', '', ''] },
  ],
  education2: { college: '', degree: '', year: '', cgpa: '' },
  education3: { college: '', degree: '', year: '', cgpa: '' },
  projects: [{ name: 'Competitive Analysis — EdTech Sector', context: 'College Strategy Course',
    bullets: ['Analyzed 5 EdTech companies across pricing, positioning, and growth strategies', 'Identified 3 untapped market opportunities; ranked 1st among 14 teams at college'] }],
  skills: ['MS Excel (Advanced)', 'PowerPoint', 'Notion', 'Google Analytics (Basic)', 'Canva'],
  languages: ['English (Fluent)', 'Hindi (Native)'],
  certifications: [],
  positions: [],
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function calcStrength(f: FormData): number {
  let s = 0
  if (f.name) s += 10
  if (f.phone && f.email) s += 10
  if (f.summary.length > 50) s += 10
  if (f.experiences.some(e => e.company && e.bullets.filter(Boolean).length >= 2)) s += 20
  if (f.college && f.degree && f.year) s += 10
  if (f.projects.some(p => p.name)) s += 15
  if (f.skills.length >= 3) s += 10
  if (f.cgpa) s += 5
  if (f.linkedin) s += 5
  const allBullets = [...f.experiences.flatMap(e => e.bullets), ...f.projects.flatMap(p => p.bullets)]
  if (allBullets.some(b => /\d/.test(b))) s += 5
  return Math.min(s, 100)
}

function firstMissing(f: FormData): string | null {
  if (!f.name) return 'your name'
  if (!f.phone || !f.email) return 'phone and email'
  if (f.summary.length <= 50) return 'a summary (50+ characters)'
  if (!f.experiences.some(e => e.company && e.bullets.filter(Boolean).length >= 2)) return 'an experience with 2+ bullets'
  if (!f.college || !f.degree || !f.year) return 'education details'
  if (!f.projects.some(p => p.name)) return 'a project'
  if (f.skills.length < 3) return 'at least 3 skills'
  if (!f.cgpa) return 'your CGPA'
  if (!f.linkedin) return 'your LinkedIn'
  return null
}

function calcATS(f: FormData): { score: number; missing: { label: string; section: string }[] } {
  let score = 0
  const missing: { label: string; section: string }[] = []
  if (f.name)    score += 5; else missing.push({ label: 'Add your name', section: 'personal' })
  if (f.email)   score += 5; else missing.push({ label: 'Add email', section: 'personal' })
  if (f.phone)   score += 5; else missing.push({ label: 'Add phone', section: 'personal' })
  if (f.linkedin) score += 5; else missing.push({ label: 'Add LinkedIn', section: 'personal' })
  if (f.summary.length > 100) score += 10; else missing.push({ label: 'Write a summary (100+ chars)', section: 'summary' })
  const expCount = f.experiences.filter(e => e.company).length
  if (expCount >= 1) score += 10; else missing.push({ label: 'Add at least 1 experience', section: 'experience' })
  if (expCount >= 2) score += 5;  else if (expCount === 1) missing.push({ label: 'Add a 2nd experience or role', section: 'experience' })
  const allBullets = f.experiences.flatMap(e => e.bullets)
  if (allBullets.some(b => { const w = b.trim().split(/\s+/)[0]; return ACTION_VERBS.some(v => v.toLowerCase() === w?.toLowerCase()) }))
    score += 10; else missing.push({ label: 'Start a bullet with an action verb', section: 'experience' })
  if (allBullets.some(b => /\d/.test(b))) score += 10; else missing.push({ label: 'Add numbers to a bullet point', section: 'experience' })
  if (f.projects.some(p => p.name)) score += 10; else missing.push({ label: 'Add a project', section: 'projects' })
  if (f.skills.length >= 4) score += 10; else missing.push({ label: 'Add at least 4 skills', section: 'skills' })
  if (f.college && f.degree && f.year) score += 5; else missing.push({ label: 'Complete education details', section: 'education' })
  if (f.cgpa) score += 5; else missing.push({ label: 'Add CGPA', section: 'education' })
  return { score: Math.min(score, 100), missing }
}

const weakVerbs = ['helped', 'worked on', 'assisted', 'was responsible for', 'responsible for', 'participated', 'contributed to', 'involved in', 'supported', 'handled', 'did', 'made', 'tried', 'attempted']
const strongVerbs = ['led', 'built', 'drove', 'grew', 'increased', 'reduced', 'launched', 'managed', 'developed', 'created', 'designed', 'executed', 'delivered', 'achieved', 'generated', 'streamlined', 'optimized', 'automated', 'spearheaded', 'coordinated', 'negotiated', 'analyzed', 'presented', 'trained', 'mentored', 'established', 'implemented', 'transformed', 'expanded', 'secured', 'identified', 'evaluated', 'recommended', 'forecasted', 'sourced', 'converted', 'researched', 'supervised', 'initiated', 'resolved', 'structured', 'synthesized', 'modeled', 'scaled']

function analyzeBullet(text: string): { status: 'empty' | 'weak' | 'improve' | 'ok' | 'strong'; message: string } {
  if (!text || text.length < 10) return { status: 'empty', message: '' }
  const lower = text.toLowerCase().trim()
  const hasNumber = /\d/.test(text) || /₹|%|lpa|lakhs|cr\b|k\b/.test(lower)
  const foundWeak = weakVerbs.find(v => lower.startsWith(v))
  const hasStrongVerb = strongVerbs.some(v => lower.startsWith(v))
  const isTooShort = text.length < 40
  const isTooLong = text.length > 200
  if (foundWeak) return { status: 'weak', message: `Replace "${foundWeak}" with a stronger verb` }
  if (!hasStrongVerb && text.length > 20) return { status: 'improve', message: 'Start with a strong action verb (Led, Built, Grew, etc.)' }
  if (!hasNumber && text.length > 50) return { status: 'improve', message: 'Add a number or metric — how much? how many? by what %?' }
  if (isTooShort) return { status: 'improve', message: 'Too short — add context and impact' }
  if (isTooLong) return { status: 'improve', message: 'Too long — keep under ~20 words' }
  if (hasStrongVerb && hasNumber) return { status: 'strong', message: '✓ Strong bullet' }
  return { status: 'ok', message: 'Good — consider adding a metric if possible' }
}

function calculatePageFit(f: FormData): number {
  let c = 80
  if (f.summary) c += f.summary.length / 1.8
  f.experiences.forEach(exp => { c += 60; exp.bullets.filter(Boolean).forEach(b => { c += b.length + 20 }) })
  c += 50 * (1 + (f.education2?.college ? 1 : 0) + (f.education3?.college ? 1 : 0))
  f.projects.forEach(proj => { c += 60; proj.bullets.filter(Boolean).forEach(b => { c += b.length + 20 }) })
  c += Math.min((f.skills?.join(', ').length || 0), 120)
  if (f.certifications?.length) c += f.certifications.filter(cert => cert.name).length * 40
  if (f.positions?.length) f.positions.filter(p => p.title).forEach(p => { c += 50 + (p.bullet?.length || 0) })
  return Math.min(Math.round((c / 3800) * 100), 110)
}

function generateLinkedInHeadline(f: FormData, domain: string): string {
  const degree = f.degree || 'Student'
  const college = f.college || 'College'
  const yearLabel = f.year ? (f.year >= '2025' ? 'Final Year' : `${f.year} Year`) : 'Final Year'
  const domainLabel: Record<string, string> = {
    'Consulting': 'Consulting & Strategy', 'Finance': 'Finance & FP&A',
    "Founder's Office": "Founder's Office & Ops", 'Marketing': 'Marketing & Growth',
    'BD': 'Business Development', 'Operations': 'Operations',
  }
  return `${yearLabel} ${degree} | Targeting ${domainLabel[domain] || domain} | ${college} | Open to Off-Campus`
}

function generateSummary(f: FormData, domain: string): string {
  const degree = f.degree || '[Degree]'
  const college = f.college || '[College]'
  const hasExp = f.experiences?.some(e => e.company)
  const expText = hasExp ? `with hands-on experience in ${domain.toLowerCase()} roles` : 'seeking my first internship experience'
  const context: Record<string, string> = {
    'Consulting': 'structured problem-solving and business analysis',
    'Finance': 'financial analysis and data-driven decision making',
    "Founder's Office": 'cross-functional execution and strategic initiatives',
    'Marketing': 'campaign strategy and brand building',
    'BD': 'relationship building and business development',
    'Operations': 'process optimization and operational efficiency',
  }
  return `Final year ${degree} student at ${college}, ${expText}. Interested in ${context[domain] || 'business roles'}. Looking to contribute in an off-campus role at a growth-oriented organization where I can add measurable value from day one.`
}

type SectionStatus = 'empty' | 'partial' | 'complete'

function sectionStatus(section: string, f: FormData): SectionStatus {
  switch (section) {
    case 'personal': {
      const filled = [f.name, f.phone, f.email, f.college, f.degree, f.year, f.city].filter(Boolean).length
      return filled === 0 ? 'empty' : filled >= 5 ? 'complete' : 'partial'
    }
    case 'summary':    return f.summary.length > 50 ? 'complete' : f.summary ? 'partial' : 'empty'
    case 'experience': {
      const hasAny = f.experiences.some(e => e.company)
      if (!hasAny) return 'empty'
      return f.experiences.some(e => e.company && e.bullets.filter(Boolean).length >= 2) ? 'complete' : 'partial'
    }
    case 'education':  return (f.college && f.degree && f.year) ? 'complete' : (f.college || f.degree || f.year) ? 'partial' : 'empty'
    case 'projects': {
      const hasAny = f.projects.some(p => p.name)
      if (!hasAny) return 'empty'
      return f.projects.some(p => p.name && p.bullets.filter(Boolean).length >= 1) ? 'complete' : 'partial'
    }
    case 'skills':    return f.skills.length >= 3 ? 'complete' : f.skills.length > 0 ? 'partial' : 'empty'
    case 'languages':     return f.languages.length > 0 ? 'complete' : 'empty'
    case 'certifications': return f.certifications?.length > 0 && f.certifications.some(c => c.name) ? 'complete' : f.certifications?.length > 0 ? 'partial' : 'empty'
    case 'positions':     return f.positions?.length > 0 && f.positions.some(p => p.title) ? 'complete' : f.positions?.length > 0 ? 'partial' : 'empty'
    default:              return 'empty'
  }
}

function statusColor(st: SectionStatus): string {
  if (st === 'complete') return '#10b981'
  if (st === 'partial')  return '#f59e0b'
  return 'rgba(255,255,255,0.08)'
}

/* ─────────────────────────────────────────────
   LIVE PREVIEW (LSE FORMAT)
───────────────────────────────────────────── */
function LivePreview({ f, zoom, recruiterView }: { f: FormData; zoom: number; recruiterView?: boolean }) {
  const contactParts = [f.phone, f.email, f.linkedin, f.city].filter(Boolean)
  const hasEdu  = f.college || f.degree || f.year
  const hasExp  = f.experiences.some(e => e.company || e.role)
  const hasProj = f.projects.some(p => p.name)
  const hasEdu2 = f.education2.college || f.education2.degree
  const hasEdu3 = f.education3.college || f.education3.degree
  const isEmpty = !f.name && !f.email && !f.college

  const sectionHeading = (label: string) => (
    <div style={{ borderBottom: '1px solid #000', marginBottom: 6, marginTop: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
    </div>
  )

  return (
    <div id="resume-print-target" style={{ fontFamily: 'Times New Roman, serif', fontSize: 10.5, lineHeight: 1.5, color: '#000', padding: 40, background: '#fff', width: 680, minHeight: 960, position: 'relative', transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
      {/* Page break indicator — line only, no text */}
      <div style={{ position: 'absolute', top: 1050, left: 0, right: 0, height: 1, background: 'rgba(239,68,68,0.5)', zIndex: 10, pointerEvents: 'none' }} />

      {isEmpty && (
        <div style={{ opacity: 1, transition: 'opacity 0.4s ease', padding: '40px 0 0' }}>
          {/* Name skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div className="skeleton-pulse" style={{ width: 180, height: 16, background: '#e5e7eb', borderRadius: 4 }} />
            <div className="skeleton-pulse" style={{ width: 280, height: 10, background: '#e5e7eb', borderRadius: 4, marginTop: 6 }} />
          </div>
          {/* Education */}
          <div style={{ marginTop: 20 }}>
            <div className="skeleton-pulse" style={{ width: 80, height: 10, background: '#e5e7eb', borderRadius: 4 }} />
            <div style={{ height: 1, background: '#d1d5db', width: '100%', marginTop: 4 }} />
            <div className="skeleton-pulse" style={{ width: 200, height: 10, background: '#e5e7eb', borderRadius: 4, marginTop: 8 }} />
            <div className="skeleton-pulse" style={{ width: 150, height: 8, background: '#e5e7eb', borderRadius: 4, marginTop: 4 }} />
          </div>
          {/* Experience */}
          <div style={{ marginTop: 20 }}>
            <div className="skeleton-pulse" style={{ width: 80, height: 10, background: '#e5e7eb', borderRadius: 4 }} />
            <div style={{ height: 1, background: '#d1d5db', width: '100%', marginTop: 4 }} />
            <div className="skeleton-pulse" style={{ width: 220, height: 10, background: '#e5e7eb', borderRadius: 4, marginTop: 8 }} />
            <div className="skeleton-pulse" style={{ width: 300, height: 8, background: '#e5e7eb', borderRadius: 4, marginTop: 4 }} />
            <div className="skeleton-pulse" style={{ width: 260, height: 8, background: '#e5e7eb', borderRadius: 4, marginTop: 4 }} />
            <div className="skeleton-pulse" style={{ width: 280, height: 8, background: '#e5e7eb', borderRadius: 4, marginTop: 4 }} />
          </div>
          {/* Skills */}
          <div style={{ marginTop: 20 }}>
            <div className="skeleton-pulse" style={{ width: 80, height: 10, background: '#e5e7eb', borderRadius: 4 }} />
            <div style={{ height: 1, background: '#d1d5db', width: '100%', marginTop: 4 }} />
            <div className="skeleton-pulse" style={{ width: 320, height: 8, background: '#e5e7eb', borderRadius: 4, marginTop: 8 }} />
          </div>
          {/* Caption */}
          <div style={{ marginTop: 32, textAlign: 'center', fontSize: 11, color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>
            Start typing to see your resume appear here
          </div>
        </div>
      )}

      <div className={recruiterView ? 'recruiter-on' : ''} style={{ opacity: isEmpty ? 0 : 1, transition: 'opacity 0.4s ease', pointerEvents: isEmpty ? 'none' : 'auto' }}>
      {f.name && (
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase' }}>{f.name}</div>
          {contactParts.length > 0 && (
            <div style={{ fontSize: 9.5, color: '#333', marginTop: 4, letterSpacing: 0.3 }}>{contactParts.join(' · ')}</div>
          )}
        </div>
      )}

      {f.name && <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '8px 0' }} />}

      {hasEdu && (
        <div data-section="education">
          {sectionHeading('Education')}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>{f.college}</span>
              {f.year && <span>Expected {f.year}</span>}
            </div>
            <div>{[f.degree, f.cgpa && `CGPA: ${f.cgpa}`].filter(Boolean).join(' \u00B7 ')}</div>
          </div>
          {hasEdu2 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{f.education2.college}</span>
                {f.education2.year && <span>{f.education2.year}</span>}
              </div>
              <div>{[f.education2.degree, f.education2.cgpa && `CGPA: ${f.education2.cgpa}`].filter(Boolean).join(' \u00B7 ')}</div>
            </div>
          )}
          {hasEdu3 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{f.education3.college}</span>
                {f.education3.year && <span>{f.education3.year}</span>}
              </div>
              <div>{[f.education3.degree, f.education3.cgpa && `CGPA: ${f.education3.cgpa}`].filter(Boolean).join(' \u00B7 ')}</div>
            </div>
          )}
        </div>
      )}

      {f.summary && (
        <div data-section="summary">
          {sectionHeading('Summary')}
          <div style={{ marginBottom: 6 }}>{f.summary}</div>
        </div>
      )}

      {hasExp && (
        <div data-section="experience">
          {sectionHeading('Experience')}
          {f.experiences.map((e, i) => {
            if (!e.company && !e.role) return null
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>{e.company}</span>
                  <span>{e.duration}{e.location ? ` \u00B7 ${e.location}` : ''}</span>
                </div>
                {e.role && <div style={{ fontStyle: 'italic' }}>{e.role}</div>}
                {e.bullets.filter(Boolean).map((b, j) => <div key={j}>— {b}</div>)}
              </div>
            )
          })}
        </div>
      )}

      {hasProj && (
        <div data-section="projects">
          {sectionHeading('Projects')}
          {f.projects.map((p, i) => {
            if (!p.name) return null
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 'bold' }}>
                  {p.name}{p.context && <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}> | {p.context}</span>}
                </div>
                {p.bullets.filter(Boolean).map((b, j) => <div key={j}>— {b}</div>)}
              </div>
            )
          })}
        </div>
      )}

      {f.positions && f.positions.length > 0 && f.positions.some(p => p.title) && (
        <div data-section="positions">
          {sectionHeading('Positions of Responsibility')}
          {f.positions.map((p, i) => !p.title ? null : (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{p.title}{p.org && <span style={{ fontWeight: 'normal' }}> | {p.org}</span>}</span>
                {p.duration && <span>{p.duration}</span>}
              </div>
              {p.bullet && <div>— {p.bullet}</div>}
            </div>
          ))}
        </div>
      )}

      {f.skills.length > 0 && (
        <div data-section="skills">
          {sectionHeading('Skills')}
          <div style={{ marginBottom: f.languages.length > 0 ? 6 : 0 }}>{f.skills.join(', ')}</div>
        </div>
      )}

      {f.certifications && f.certifications.length > 0 && f.certifications.some(c => c.name) && (
        <div data-section="certifications">
          {sectionHeading('Certifications')}
          {f.certifications.map((c, i) => !c.name ? null : (
            <div key={i} style={{ marginBottom: 4 }}>
              <span style={{ fontWeight: 'bold' }}>{c.name}</span>
              {c.org && <span> — {c.org}</span>}
              {c.inProgress ? <span style={{ fontStyle: 'italic' }}> (In Progress)</span> : c.year ? <span>, {c.year}</span> : null}
            </div>
          ))}
        </div>
      )}

      {f.languages.length > 0 && (
        <div data-section="languages">
          {f.skills.length === 0 && sectionHeading('Languages')}
          <div><span style={{ fontWeight: 'bold' }}>Languages:</span> {f.languages.join(', ')}</div>
        </div>
      )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────── */
function SectionCard({ id, icon, title, status, expanded, onToggle, children }: {
  id: string; icon: string; title: string; status: SectionStatus; expanded: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.05)', borderLeft: `3px solid ${statusColor(status)}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden', transition: 'border-color 0.3s' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', fontFamily: "'DM Sans',sans-serif", textAlign: 'left' }}
      >
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{title}</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>▼</span>
      </button>
      {expanded && <div style={{ padding: '0 18px 18px' }}>{children}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────────
   TAG INPUT
───────────────────────────────────────────── */
function TagInput({ tags, onChange, inputValue, onInputChange, placeholder, max, suggestions }: {
  tags: string[]; onChange: (t: string[]) => void; inputValue: string; onInputChange: (v: string) => void
  placeholder: string; max: number; suggestions?: string[]
}) {
  const addTag = (tag: string) => {
    const t = tag.trim()
    if (t && !tags.includes(t) && tags.length < max) onChange([...tags, t])
    onInputChange('')
  }
  const removeTag = (idx: number) => onChange(tags.filter((_, i) => i !== idx))

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {tags.map((tag, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 12, fontWeight: 600 }}>
            {tag}
            <button onClick={() => removeTag(i)} style={{ background: 'none', border: 'none', color: '#93BBFF', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>
      {tags.length >= max && <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 6 }}>Maximum {max} reached</div>}
      <input
        value={inputValue}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) { e.preventDefault(); addTag(inputValue) } }}
        placeholder={placeholder}
        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: 14, padding: '8px 0 6px', width: '100%', outline: 'none', fontFamily: 'inherit' }}
      />
      {suggestions && suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {suggestions.filter(s => !tags.includes(s)).map(s => (
            <button key={s} onClick={() => addTag(s)} style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   ATS CIRCLE INDICATOR
───────────────────────────────────────────── */
function ATSCircle({ score }: { score: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score > 75 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={32} cy={32} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      <text x={32} y={32} textAnchor="middle" dominantBaseline="middle" fill={color}
        fontSize={13} fontWeight={800} fontFamily="DM Sans,sans-serif"
        style={{ transform: 'rotate(90deg)', transformOrigin: '32px 32px' }}>
        {score}
      </text>
    </svg>
  )
}

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────── */
export default function ResumeBuilderPage() {
  const [formData, setFormData]               = useState<FormData>(defaultFormData)
  const [activeTab, setActiveTab]             = useState<'edit' | 'preview'>('edit')
  const [targetDomain, setTargetDomain]       = useState('Consulting')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personal', 'summary', 'experience', 'education', 'projects', 'skills', 'languages']))
  const [skillInput, setSkillInput]           = useState('')
  const [langInput, setLangInput]             = useState('')
  const [toasts, setToasts]                   = useState<Toast[]>([])
  const [showATS, setShowATS]                 = useState(false)
  const [savedTime, setSavedTime]             = useState<Date | null>(null)
  const [showPopup, setShowPopup]             = useState(false)
  const [zoom, setZoom]                       = useState(90)
  const [showTips, setShowTips]               = useState(false)
  const [showEdu2, setShowEdu2]               = useState(false)
  const [showEdu3, setShowEdu3]               = useState(false)
  const [bulletBank, setBulletBank]           = useState(false)
  const [activeBulletKey, setActiveBulletKey] = useState<string | null>(null)
  const [isPdfLoading, setIsPdfLoading]       = useState(false)
  const [showKeywords, setShowKeywords]       = useState(false)
  const [generatedHeadline, setGeneratedHeadline] = useState('')
  const [headlineCopied, setHeadlineCopied]   = useState(false)
  const [generatedSummary, setGeneratedSummary] = useState('')
  const [showPdfModal, setShowPdfModal]       = useState(false)
  const [isScoreCardLoading, setIsScoreCardLoading] = useState(false)
  const [recruiterView, setRecruiterView]           = useState(false)
  const [recruiterTimer, setRecruiterTimer]         = useState(6)
  const [recruiterDone, setRecruiterDone]           = useState(false)

  const formPanelRef  = useRef<HTMLDivElement>(null)
  const sectionRefs   = useRef<Record<string, HTMLDivElement | null>>({})
  const bulletRefs    = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const toastIdRef           = useRef(0)
  const recruiterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('resumeDraft')
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FormData>
        setFormData({ ...defaultFormData, ...parsed })
        if (parsed.education2?.college || parsed.education2?.degree) setShowEdu2(true)
        if (parsed.education3?.college || parsed.education3?.degree) setShowEdu3(true)
        addToast('Draft restored', 'success')
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave() }
      if (e.key === 'Escape') setBulletBank(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData])

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const toggleSection = (s: string) => {
    setExpandedSections(prev => { const n = new Set(prev); if (n.has(s)) n.delete(s); else n.add(s); return n })
  }

  const scrollToSection = (section: string) => {
    if (!expandedSections.has(section)) toggleSection(section)
    setTimeout(() => { sectionRefs.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100)
    setActiveTab('edit')
  }

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData(prev => ({ ...prev, [key]: value }))

  const setExpField = (idx: number, key: keyof Experience, value: string) =>
    setFormData(prev => ({ ...prev, experiences: prev.experiences.map((e, i) => i === idx ? { ...e, [key]: value } : e) }))

  const setExpBullet = (idx: number, bIdx: number, value: string) =>
    setFormData(prev => ({ ...prev, experiences: prev.experiences.map((e, i) => { if (i !== idx) return e; const b = [...e.bullets]; b[bIdx] = value; return { ...e, bullets: b } }) }))

  const addExperience = () => {
    if (formData.experiences.length >= 5) return
    setFormData(prev => ({ ...prev, experiences: [...prev.experiences, { company: '', role: '', duration: '', location: '', bullets: ['', '', '', ''] }] }))
  }

  const removeExperience = (idx: number) =>
    setFormData(prev => ({ ...prev, experiences: prev.experiences.filter((_, i) => i !== idx) }))

  const addExpBullet = (idx: number) =>
    setFormData(prev => ({ ...prev, experiences: prev.experiences.map((e, i) => i !== idx || e.bullets.length >= 6 ? e : { ...e, bullets: [...e.bullets, ''] }) }))

  const setProjField = (idx: number, key: keyof Project, value: string) =>
    setFormData(prev => ({ ...prev, projects: prev.projects.map((p, i) => i === idx ? { ...p, [key]: value } : p) }))

  const setProjBullet = (idx: number, bIdx: number, value: string) =>
    setFormData(prev => ({ ...prev, projects: prev.projects.map((p, i) => { if (i !== idx) return p; const b = [...p.bullets]; b[bIdx] = value; return { ...p, bullets: b } }) }))

  const addProject = () => {
    if (formData.projects.length >= 4) return
    setFormData(prev => ({ ...prev, projects: [...prev.projects, { name: '', context: '', bullets: ['', ''] }] }))
  }

  const addProjBullet = (idx: number) =>
    setFormData(prev => ({ ...prev, projects: prev.projects.map((p, i) => i !== idx || p.bullets.length >= 4 ? p : { ...p, bullets: [...p.bullets, ''] }) }))

  const removeProject = (idx: number) =>
    setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }))

  const addCert = () => { if (formData.certifications.length >= 4) return; setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { name: '', org: '', year: '', inProgress: false }] })) }
  const removeCert = (idx: number) => setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== idx) }))
  const setCertField = (idx: number, key: keyof Certification, value: string | boolean) => setFormData(prev => ({ ...prev, certifications: prev.certifications.map((c, i) => i === idx ? { ...c, [key]: value } : c) }))

  const addPosition = () => { if (formData.positions.length >= 4) return; setFormData(prev => ({ ...prev, positions: [...prev.positions, { title: '', org: '', duration: '', bullet: '' }] })) }
  const removePosition = (idx: number) => setFormData(prev => ({ ...prev, positions: prev.positions.filter((_, i) => i !== idx) }))
  const setPosField = (idx: number, key: keyof Position, value: string) => setFormData(prev => ({ ...prev, positions: prev.positions.map((p, i) => i === idx ? { ...p, [key]: value } : p) }))

  const handleSave = () => {
    localStorage.setItem('resumeDraft', JSON.stringify(formData))
    setSavedTime(new Date())
    addToast('Draft saved ✓', 'success')
  }

  const handleFillExample = () => {
    if (!window.confirm('Fill with example data? This will replace current content.')) return
    setFormData(EXAMPLE_DATA)
    addToast('Example data loaded')
  }

  const handleReset = () => {
    if (!window.confirm('Clear all fields and start over?')) return
    setFormData(defaultFormData)
    localStorage.removeItem('resumeDraft')
    setSavedTime(null)
    setShowEdu2(false)
    setShowEdu3(false)
    addToast('All fields cleared', 'warn')
  }

  const toggleRecruiterView = () => {
    if (recruiterView) {
      if (recruiterIntervalRef.current) { clearInterval(recruiterIntervalRef.current); recruiterIntervalRef.current = null }
      setRecruiterView(false)
      setRecruiterTimer(6)
      setRecruiterDone(false)
    } else {
      setRecruiterView(true)
      setRecruiterTimer(6)
      setRecruiterDone(false)
      recruiterIntervalRef.current = setInterval(() => {
        setRecruiterTimer(prev => {
          if (prev <= 1) {
            if (recruiterIntervalRef.current) { clearInterval(recruiterIntervalRef.current); recruiterIntervalRef.current = null }
            setRecruiterDone(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const handleDownloadPDF = async () => {
    const el = document.getElementById('resume-print-target')
    if (!el) return
    setIsPdfLoading(true)
    addToast('Generating PDF\u2026')
    const prevTransform = (el as HTMLElement).style.transform
    const prevOrigin    = (el as HTMLElement).style.transformOrigin
    ;(el as HTMLElement).style.transform = 'none'
    ;(el as HTMLElement).style.transformOrigin = 'top left'
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, windowWidth: el.scrollWidth, windowHeight: el.scrollHeight })
      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pw      = pdf.internal.pageSize.getWidth()
      const ph      = pdf.internal.pageSize.getHeight()
      const ratio   = pw / (canvas.width / 2)
      const scaledH = (canvas.height / 2) * ratio
      if (scaledH <= ph) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pw, scaledH)
      } else {
        const pageHpx = (ph / ratio) * 2
        let y = 0
        while (y < canvas.height) {
          const sc = document.createElement('canvas')
          sc.width  = canvas.width
          sc.height = Math.min(pageHpx, canvas.height - y)
          sc.getContext('2d')!.drawImage(canvas, 0, y, canvas.width, sc.height, 0, 0, canvas.width, sc.height)
          if (y > 0) pdf.addPage()
          pdf.addImage(sc.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, pw, (sc.height / 2) * ratio)
          y += pageHpx
        }
      }
      pdf.save(`${(formData.name || 'resume').replace(/\s+/g, '_')}_resume.pdf`)
      addToast('PDF downloaded ✓', 'success')
    } catch { addToast('Download failed — try again', 'error') }
    finally {
      ;(el as HTMLElement).style.transform = prevTransform
      ;(el as HTMLElement).style.transformOrigin = prevOrigin
      setIsPdfLoading(false)
    }
  }

  const insertVerb = (verb: string) => {
    if (!activeBulletKey) return
    const ta = bulletRefs.current[activeBulletKey]
    if (!ta) return
    const start  = ta.selectionStart ?? 0
    const cur    = ta.value
    const newVal = cur.slice(0, start) + verb + ' ' + cur.slice(start)
    // parse key: "exp-0-1" or "proj-0-1"
    const parts = activeBulletKey.split('-')
    if (parts[0] === 'exp')  setExpBullet(+parts[1], +parts[2], newVal)
    if (parts[0] === 'proj') setProjBullet(+parts[1], +parts[2], newVal)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + verb.length + 1, start + verb.length + 1) }, 0)
  }

  const savedAgo = savedTime ? `Saved ${Math.max(0, Math.floor((Date.now() - savedTime.getTime()) / 60000))}m ago` : ''
  const strength = calcStrength(formData)
  const missing  = firstMissing(formData)
  const ats      = calcATS(formData)

  const inputStyle: React.CSSProperties = {
    background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)',
    color: 'white', fontSize: 13, padding: '8px 0 6px', width: '100%', outline: 'none', fontFamily: 'inherit',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 3,
  }

  const renderInput = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, note?: string) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle}
        onFocus={e => { e.currentTarget.style.borderBottomColor = '#4F7CFF' }}
        onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)' }} />
      {note && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{note}</div>}
    </div>
  )

  const renderTextarea = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, rows = 2, maxLen?: number) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} maxLength={maxLen}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }}
        onFocus={e => { e.currentTarget.style.borderBottomColor = '#4F7CFF' }}
        onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)' }} />
      {maxLen && (
        <div style={{ fontSize: 10, textAlign: 'right', color: value.length > 300 ? '#ef4444' : value.length > 250 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}>{value.length}/{maxLen}</div>
      )}
    </div>
  )

  const renderBulletField = (key: string, value: string, onSet: (v: string) => void, placeholder: string) => {
    const analysis = analyzeBullet(value)
    const hintColor = analysis.status === 'weak' ? '#ef4444' : analysis.status === 'improve' ? '#f59e0b' : analysis.status === 'strong' ? '#10b981' : 'rgba(255,255,255,0.3)'
    return (
      <div key={key}>
        <label style={{ ...labelStyle, marginBottom: 3 }}>Achievement</label>
        <textarea
          ref={el => { bulletRefs.current[key] = el }}
          value={value} onChange={e => onSet(e.target.value)}
          placeholder={placeholder} rows={2}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }}
          onFocus={e => { e.currentTarget.style.borderBottomColor = '#4F7CFF'; setActiveBulletKey(key) }}
          onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)' }}
        />
        {analysis.status !== 'empty' && (
          <div style={{ fontSize: 11, marginTop: 3, color: hintColor }}>{analysis.message}</div>
        )}
      </div>
    )
  }

  /* ─── STRENGTH BAR COLOR ─── */
  const strengthColor = strength >= 80 ? '#10b981' : strength >= 50 ? '#4F7CFF' : '#f59e0b'
  const strengthLabel = strength >= 80 ? 'Strong' : strength >= 50 ? 'Good' : strength >= 25 ? 'Building' : 'Just started'

  /* ─── FORM SECTIONS (shared desktop + mobile) ─── */
  const renderFormSections = (mobile = false) => (
    <>
      {/* Strength Bar */}
      <div style={{ marginBottom: 20, padding: '14px 16px', background: '#161b22', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>Resume Strength</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: strengthColor }}>{strengthLabel}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: strengthColor }}>{strength}%</span>
          </div>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${strength}%`, borderRadius: 3, background: `linear-gradient(90deg, ${strengthColor}, ${strengthColor}cc)`, transition: 'width 0.4s ease' }} />
        </div>
        {missing && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Next: add {missing}</div>}
      </div>

      {/* Domain Pills */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Target Domain</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DOMAINS.map(d => (
            <button key={d} onClick={() => setTargetDomain(d)} style={{ padding: '5px 12px', borderRadius: 100, background: targetDomain === d ? 'rgba(79,124,255,0.18)' : 'rgba(255,255,255,0.04)', border: `1px solid ${targetDomain === d ? 'rgba(79,124,255,0.45)' : 'rgba(255,255,255,0.07)'}`, color: targetDomain === d ? '#93BBFF' : 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* ATS Score — compact always-visible bar */}
      <div style={{ marginBottom: 16, background: '#161b22', border: '1px solid rgba(255,255,255,0.05)', borderLeft: `3px solid ${ats.score > 75 ? '#10b981' : ats.score > 50 ? '#f59e0b' : '#ef4444'}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, flexShrink: 0 }}>ATS</span>
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${ats.score}%`, borderRadius: 3, background: ats.score > 75 ? '#10b981' : ats.score > 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: ats.score > 75 ? '#10b981' : ats.score > 50 ? '#f59e0b' : '#ef4444', minWidth: 26, textAlign: 'right', flexShrink: 0 }}>{ats.score}</span>
          {ats.missing[0] && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1.5 }}>{ats.missing[0].label}</span>}
          <button onClick={() => setShowATS(!showATS)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', padding: 0, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {showATS ? 'hide ▲' : 'details ▼'}
          </button>
        </div>
        {showATS && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <ATSCircle score={ats.score} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>ATS Readiness</div>
                <div style={{ fontSize: 12, color: ats.score > 75 ? '#10b981' : ats.score > 60 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                  {ats.score > 75 ? 'Excellent' : ats.score > 60 ? 'Good' : ats.score > 50 ? 'Fair' : 'Needs work'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{ats.missing.length} items to improve</div>
              </div>
            </div>
            {ats.missing.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {ats.missing.map((m, i) => (
                  <button key={i} onClick={() => scrollToSection(m.section)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <span style={{ color: '#f59e0b', fontSize: 10 }}>●</span>
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Keyword Density Panel */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setShowKeywords(!showKeywords)} style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
          {showKeywords ? 'Hide keywords ▲' : 'Check keywords ▼'}
        </button>
        {showKeywords && (() => {
          const keywords = DOMAIN_KEYWORDS[targetDomain] || []
          const resumeText = [formData.summary, ...formData.experiences.flatMap(e => [e.company, e.role, ...e.bullets]), ...formData.projects.flatMap(p => [p.name, p.context, ...p.bullets]), formData.skills.join(' ')].join(' ').toLowerCase()
          const found = keywords.filter(k => resumeText.includes(k))
          return (
            <div style={{ marginTop: 10, padding: '12px 14px', background: '#161b22', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{found.length} of {keywords.length} {targetDomain} keywords found</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {keywords.map(k => {
                  const present = resumeText.includes(k)
                  return (
                    <span key={k} style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: present ? 'rgba(79,124,255,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${present ? 'rgba(79,124,255,0.3)' : 'rgba(255,255,255,0.07)'}`, color: present ? '#93BBFF' : 'rgba(255,255,255,0.25)' }}>
                      {present ? '✓ ' : ''}{k}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Score Share Card */}
      <div style={{ marginBottom: 16 }}>
        <div id="resume-score-card" style={{ background: '#111827', borderRadius: 16, padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>🔥 Resume Builder</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>beyond-campus.in</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: `conic-gradient(${strengthColor} ${strength * 3.6}deg, rgba(255,255,255,0.06) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: strengthColor }}>{strength}%</div>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{strengthLabel}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Domain: {targetDomain}</div>
              {missing && <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>Next: {missing}</div>}
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
            Built with Beyond Campus Resume Builder · beyond-campus.in/resources/resume-builder
          </div>
        </div>
        <button
          onClick={async () => {
            const el = document.getElementById('resume-score-card')
            if (!el) return
            setIsScoreCardLoading(true)
            try {
              const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#111827' })
              const link = document.createElement('a')
              link.download = 'my_resume_score.png'
              link.href = canvas.toDataURL('image/png')
              link.click()
            } catch { /* ignore */ }
            setIsScoreCardLoading(false)
          }}
          style={{ marginTop: 8, width: '100%', padding: '9px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {isScoreCardLoading ? 'Generating…' : '📸 Share My Resume Score'}
        </button>
      </div>

      {/* Section Cards */}
      <div ref={el => { sectionRefs.current['personal'] = el }}>
        <SectionCard id={mobile ? 'personal-m' : 'personal'} icon="👤" title="Personal Details" status={sectionStatus('personal', formData)} expanded={expandedSections.has('personal')} onToggle={() => toggleSection('personal')}>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: '20px 14px' }}>
            <div style={{ gridColumn: mobile ? '1' : '1 / -1' }}>{renderInput('Full Name', formData.name, v => setField('name', v), 'Rahul Mehta')}</div>
            {renderInput('Phone', formData.phone, v => setField('phone', v), '+91 98XXX XXXXX')}
            {renderInput('Email', formData.email, v => setField('email', v), 'you@email.com')}
            {renderInput('College', formData.college, v => setField('college', v), '[Your College], Delhi')}
            {renderInput('Degree', formData.degree, v => setField('degree', v), 'BBA (Honours)')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, gridColumn: mobile ? '1' : '1 / -1' }}>
              {renderInput('Year', formData.year, v => setField('year', v), '2025')}
              {renderInput('CGPA', formData.cgpa, v => setField('cgpa', v), '8.1', 'Omit if below 7.5')}
              {renderInput('City', formData.city, v => setField('city', v), 'Delhi')}
            </div>
            <div style={{ gridColumn: mobile ? '1' : '1 / -1' }}>
              {renderInput('LinkedIn URL', formData.linkedin, v => setField('linkedin', v), 'linkedin.com/in/yourname')}
              <div style={{ marginTop: 8 }}>
                <button onClick={() => setGeneratedHeadline(generateLinkedInHeadline(formData, targetDomain))} style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Generate LinkedIn headline →</button>
                {generatedHeadline && (
                  <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.15)', fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                    {generatedHeadline}
                    <button onClick={() => { navigator.clipboard.writeText(generatedHeadline); setHeadlineCopied(true); setTimeout(() => setHeadlineCopied(false), 2000) }} style={{ marginLeft: 8, background: 'none', border: 'none', color: headlineCopied ? '#10b981' : '#4F7CFF', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                      {headlineCopied ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div ref={el => { sectionRefs.current['summary'] = el }}>
        <SectionCard id={mobile ? 'summary-m' : 'summary'} icon="✍️" title="Summary" status={sectionStatus('summary', formData)} expanded={expandedSections.has('summary')} onToggle={() => toggleSection('summary')}>
          {renderTextarea('Professional Summary', formData.summary, v => setField('summary', v), 'Write 2\u20133 lines about your background, strengths, and goals.', 4, 300)}
          <button onClick={() => setShowTips(!showTips)} style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8, padding: 0 }}>
            Tips {showTips ? '\u2191' : '\u2193'}
          </button>
          {showTips && (
            <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.12)', fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              Include: who you are, what you want, what makes you different. Avoid generic phrases like &quot;seeking a challenging role.&quot;
            </div>
          )}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => setGeneratedSummary(generateSummary(formData, targetDomain))} style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Generate a starting point →</button>
            {generatedSummary && (
              <div style={{ marginTop: 8, padding: '12px 14px', borderRadius: 8, background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.15)' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 10 }}>{generatedSummary}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setField('summary', generatedSummary); setGeneratedSummary('') }} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Use this →</button>
                  <button onClick={() => setGeneratedSummary(generateSummary(formData, targetDomain))} style={{ padding: '5px 12px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Regenerate</button>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>Edit this to make it specific to you — personalized summaries perform 3× better.</div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div ref={el => { sectionRefs.current['experience'] = el }}>
        <SectionCard id={mobile ? 'experience-m' : 'experience'} icon="💼" title="Experience" status={sectionStatus('experience', formData)} expanded={expandedSections.has('experience')} onToggle={() => toggleSection('experience')}>
          {formData.experiences.map((exp, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 14px 12px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>{exp.company || `Experience ${i + 1}`}</span>
                {formData.experiences.length > 1 && (
                  <button onClick={() => removeExperience(i)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.45)', fontSize: 16, cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>×</button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                {renderInput('Company', exp.company, v => setExpField(i, 'company', v), 'Bloom D2C Startup')}
                {renderInput('Role', exp.role, v => setExpField(i, 'role', v), 'Business Development Intern')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {renderInput('Duration', exp.duration, v => setExpField(i, 'duration', v), 'Jun\u2013Aug 2024')}
                  {renderInput('Location', exp.location, v => setExpField(i, 'location', v), 'Delhi')}
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {exp.bullets.map((b, bIdx) => renderBulletField(`exp-${i}-${bIdx}`, b, v => setExpBullet(i, bIdx, v), 'What you did + result (e.g. Grew Instagram from 800 to 3,400 followers in 6 weeks)'))}
                {exp.bullets.length < 6 && (
                  <button onClick={() => addExpBullet(i)} style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>+ Add Achievement</button>
                )}
              </div>
            </div>
          ))}
          {formData.experiences.length < 5 && (
            <button onClick={addExperience} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(79,124,255,0.25)', background: 'rgba(79,124,255,0.06)', color: '#93BBFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Experience</button>
          )}
        </SectionCard>
      </div>

      <div ref={el => { sectionRefs.current['education'] = el }}>
        <SectionCard id={mobile ? 'education-m' : 'education'} icon="🎓" title="Education" status={sectionStatus('education', formData)} expanded={expandedSections.has('education')} onToggle={() => toggleSection('education')}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
            {renderInput('College', formData.college, v => setField('college', v), '[Your College], Delhi')}
            {renderInput('Degree', formData.degree, v => setField('degree', v), 'BBA (Honours)')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {renderInput('Year', formData.year, v => setField('year', v), '2025')}
              {renderInput('CGPA', formData.cgpa, v => setField('cgpa', v), '8.1')}
            </div>
          </div>
          {!showEdu2 && (
            <button onClick={() => setShowEdu2(true)} style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 12, padding: 0 }}>+ Add Class XII / School</button>
          )}
          {showEdu2 && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>Class XII / School</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {renderInput('College / School', formData.education2.college, v => setField('education2', { ...formData.education2, college: v }), 'School name')}
                {renderInput('Degree / Board', formData.education2.degree, v => setField('education2', { ...formData.education2, degree: v }), 'Class XII / CBSE')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {renderInput('Year', formData.education2.year, v => setField('education2', { ...formData.education2, year: v }), '2022')}
                  {renderInput('CGPA / %', formData.education2.cgpa, v => setField('education2', { ...formData.education2, cgpa: v }), '92%')}
                </div>
              </div>
              {!showEdu3 && (
                <button onClick={() => setShowEdu3(true)} style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 12, padding: 0 }}>+ Add Class X / School</button>
              )}
            </div>
          )}
          {showEdu3 && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>Class X / School</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {renderInput('School', formData.education3.college, v => setField('education3', { ...formData.education3, college: v }), 'School name')}
                {renderInput('Degree / Board', formData.education3.degree, v => setField('education3', { ...formData.education3, degree: v }), 'Class X / CBSE')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {renderInput('Year', formData.education3.year, v => setField('education3', { ...formData.education3, year: v }), '2020')}
                  {renderInput('CGPA / %', formData.education3.cgpa, v => setField('education3', { ...formData.education3, cgpa: v }), '95%')}
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <div ref={el => { sectionRefs.current['projects'] = el }}>
        <SectionCard id={mobile ? 'projects-m' : 'projects'} icon="🔬" title="Projects" status={sectionStatus('projects', formData)} expanded={expandedSections.has('projects')} onToggle={() => toggleSection('projects')}>
          {formData.projects.map((proj, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 14px 12px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>{proj.name || `Project ${i + 1}`}</span>
                {formData.projects.length > 1 && (
                  <button onClick={() => removeProject(i)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.45)', fontSize: 16, cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>×</button>
                )}
              </div>
              {renderInput('Project Name', proj.name, v => setProjField(i, 'name', v), 'Competitive Analysis — EdTech Sector')}
              <div style={{ marginTop: 10 }}>{renderInput('Context', proj.context, v => setProjField(i, 'context', v), 'College Strategy Course')}</div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {proj.bullets.map((b, bIdx) => renderBulletField(`proj-${i}-${bIdx}`, b, v => setProjBullet(i, bIdx, v), 'What you built + outcome (e.g. Built a financial model tracking 10 KPIs for a mock e-commerce business)'))}
                {proj.bullets.length < 4 && (
                  <button onClick={() => addProjBullet(i)} style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>+ Add Achievement</button>
                )}
              </div>
            </div>
          ))}
          {formData.projects.length < 4 && (
            <button onClick={addProject} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(79,124,255,0.25)', background: 'rgba(79,124,255,0.06)', color: '#93BBFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Project</button>
          )}
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(79,124,255,0.04)', border: '1px solid rgba(79,124,255,0.08)', fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
            Include case competitions, academic research, freelance work.
          </div>
          <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.15)', fontSize: 12, color: '#93BBFF', lineHeight: 1.6 }}>
            💡 Not sure what to build?{' '}
            <a href="/resources/career-toolkit" style={{ color: '#93BBFF', fontWeight: 700, textDecoration: 'underline' }}>
              See project playbooks by role →
            </a>
          </div>
          <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', fontSize: 12, color: '#f87171', lineHeight: 1.6 }}>
            Already have a resume?{' '}
            <a href="/resources/resume-roast" style={{ color: '#f87171', fontWeight: 700, textDecoration: 'underline' }}>
              🔥 Get it roasted first →
            </a>
          </div>
        </SectionCard>
      </div>

      {/* Positions of Responsibility */}
      <div ref={el => { sectionRefs.current['positions'] = el }}>
        <SectionCard id={mobile ? 'positions-m' : 'positions'} icon="🎖️" title="Positions of Responsibility" status={sectionStatus('positions', formData)} expanded={expandedSections.has('positions')} onToggle={() => toggleSection('positions')}>
          {formData.positions.map((pos, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 14px 12px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>{pos.title || `Position ${i + 1}`}</span>
                <button onClick={() => removePosition(i)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.45)', fontSize: 16, cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                {renderInput('Position Title', pos.title, v => setPosField(i, 'title', v), 'Cultural Secretary')}
                {renderInput('Organisation', pos.org, v => setPosField(i, 'org', v), 'Annual College Fest Committee')}
                {renderInput('Duration', pos.duration, v => setPosField(i, 'duration', v), '2023–24')}
                {renderTextarea('Achievement (optional)', pos.bullet, v => setPosField(i, 'bullet', v), 'Managed logistics for 2,000-person event with ₹8L budget', 2)}
              </div>
            </div>
          ))}
          {formData.positions.length < 4 && (
            <button onClick={addPosition} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(79,124,255,0.25)', background: 'rgba(79,124,255,0.06)', color: '#93BBFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Position</button>
          )}
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
            Include committee roles, club leadership, event management, college council positions.
          </div>
        </SectionCard>
      </div>

      <div ref={el => { sectionRefs.current['skills'] = el }}>
        <SectionCard id={mobile ? 'skills-m' : 'skills'} icon="🛠️" title="Skills &amp; Tools" status={sectionStatus('skills', formData)} expanded={expandedSections.has('skills')} onToggle={() => toggleSection('skills')}>
          <TagInput tags={formData.skills} onChange={v => setField('skills', v)} inputValue={skillInput} onInputChange={setSkillInput} placeholder="Type a skill + Enter" max={16} suggestions={DOMAIN_SUGGESTIONS[targetDomain]} />
        </SectionCard>
      </div>

      {/* Certifications */}
      <div ref={el => { sectionRefs.current['certifications'] = el }}>
        <SectionCard id={mobile ? 'certifications-m' : 'certifications'} icon="🏆" title="Certifications" status={sectionStatus('certifications', formData)} expanded={expandedSections.has('certifications')} onToggle={() => toggleSection('certifications')}>
          {formData.certifications.map((cert, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 14px 12px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>{cert.name || `Certification ${i + 1}`}</span>
                <button onClick={() => removeCert(i)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.45)', fontSize: 16, cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                {renderInput('Certification Name', cert.name, v => setCertField(i, 'name', v), 'Google Analytics Individual Qualification')}
                {renderInput('Issuing Organisation', cert.org, v => setCertField(i, 'org', v), 'Google')}
                {!cert.inProgress && renderInput('Year', cert.year, v => setCertField(i, 'year', v), '2024')}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  <input type="checkbox" checked={cert.inProgress} onChange={e => setCertField(i, 'inProgress', e.target.checked)} style={{ width: 14, height: 14, accentColor: '#4F7CFF' }} />
                  In Progress
                </label>
              </div>
            </div>
          ))}
          {formData.certifications.length < 4 && (
            <button onClick={addCert} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(79,124,255,0.25)', background: 'rgba(79,124,255,0.06)', color: '#93BBFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Certification</button>
          )}
        </SectionCard>
      </div>

      <div ref={el => { sectionRefs.current['languages'] = el }}>
        <SectionCard id={mobile ? 'languages-m' : 'languages'} icon="🌐" title="Languages" status={sectionStatus('languages', formData)} expanded={expandedSections.has('languages')} onToggle={() => toggleSection('languages')}>
          <TagInput tags={formData.languages} onChange={v => setField('languages', v)} inputValue={langInput} onInputChange={setLangInput} placeholder="Type a language + Enter" max={8} suggestions={['English (Fluent)', 'Hindi (Native)']} />
        </SectionCard>
      </div>

    </>
  )

  /* ─── RENDER ─── */
  return (
    <main style={{ background: '#0D1117', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.25)}
        @media print {
          *{-webkit-print-color-adjust:exact;}
          #header-bar,.no-print,#form-panel,.builder-mobile{display:none!important}
          .builder-desktop{display:block!important;height:auto!important}
          #resume-print-target{position:static!important;width:210mm!important;margin:0 auto!important;padding:15mm!important;box-shadow:none!important;border-radius:0!important;transform:none!important;font-family:'Times New Roman',serif!important;}
          body,html{background:white!important}
          @page{size:A4;margin:0}
        }
        @keyframes slideInRight { from { transform:translateX(60px);opacity:0; } to { transform:translateX(0);opacity:1; } }
        @keyframes skeletonPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .skeleton-pulse { animation: skeletonPulse 1.5s ease-in-out infinite; }
        @keyframes fadeUp { from { opacity:0;transform:translateY(8px); } to { opacity:1;transform:translateY(0); } }
        .builder-desktop{display:none}
        .builder-mobile{display:none}
        @media(max-width:860px){
          .builder-desktop{display:none !important}
          .builder-mobile{display:flex !important}
        }
        @media(min-width:861px){
          .builder-desktop{display:flex !important}
          .builder-mobile{display:none !important}
        }
        .verb-chip:hover { background:rgba(79,124,255,0.15) !important; border-color:rgba(79,124,255,0.4) !important; color:#93BBFF !important; }
        @keyframes recruiterPulse { 0%,100% { box-shadow:0 0 0 0 rgba(245,158,11,0.4); } 50% { box-shadow:0 0 0 6px rgba(245,158,11,0); } }
        .recruiter-on > * { opacity:0.12 !important; transition:opacity 0.3s; }
        .recruiter-on > :first-child { opacity:1 !important; background:rgba(245,158,11,0.12) !important; border-radius:4px; }
        .recruiter-on > [data-section="education"] { opacity:1 !important; background:rgba(245,158,11,0.12) !important; border-radius:4px; }
        .recruiter-on > [data-section="experience"] { opacity:1 !important; background:rgba(245,158,11,0.12) !important; border-radius:4px; }
        .recruiter-on > [data-section="skills"] { opacity:1 !important; background:rgba(245,158,11,0.12) !important; border-radius:4px; }
        .recruiter-on > [data-section="experience"] > div:nth-child(n+3) { opacity:0.12 !important; background:transparent !important; }
        .recruiter-on > [data-section="experience"] > div:nth-child(2) > div:nth-child(n+4) { opacity:0.12 !important; }
        .template-locked:hover { border-color:rgba(79,124,255,0.3) !important; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
      `}</style>

      <UnlockPopup isOpen={showPopup} onClose={() => setShowPopup(false)} onEmailUnlock={() => {}} resourceName="Resume Templates" localStorageKey="resumeTemplates" showEmailOption={false} emailAlreadySubmitted={false} />

      {/* TOASTS */}
      <div className="no-print" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: 'rgba(17,24,39,0.96)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${t.type === 'error' ? '#ef4444' : t.type === 'warn' ? '#f59e0b' : '#10b981'}`, borderRadius: 10, padding: '11px 18px', fontSize: 13, fontWeight: 600, color: '#fff', animation: 'slideInRight 0.25s ease', backdropFilter: 'blur(8px)', minWidth: 200, whiteSpace: 'nowrap' }}>
            {t.message}
          </div>
        ))}
      </div>

      {/* PDF MODAL */}
      {showPdfModal && (
        <div className="no-print" onClick={() => setShowPdfModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 400, fontFamily: "'DM Sans',sans-serif" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>📄</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 6 }}>Download Your Resume</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 20 }}>
              Follow these steps for best results:<br/>
              1. Click <strong style={{ color: 'rgba(255,255,255,0.8)' }}>"Open Print Dialog"</strong> below<br/>
              2. Set destination: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Save as PDF</strong><br/>
              3. Set margins: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>None</strong><br/>
              4. Uncheck <strong style={{ color: 'rgba(255,255,255,0.8)' }}>"Headers &amp; footers"</strong><br/>
              5. Click Save
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowPdfModal(false); setTimeout(() => window.print(), 100) }} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Open Print Dialog →</button>
              <button onClick={() => setShowPdfModal(false)} style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* BULLET BANK DRAWER */}
      {bulletBank && (
        <div className="no-print" onClick={() => setBulletBank(false)} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxWidth: 600, margin: '0 auto', background: '#111827', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px 32px', animation: 'fadeUp 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Action Verb Bank</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Click to insert at cursor{activeBulletKey ? '' : ' — focus a bullet first'}</div>
              </div>
              <button onClick={() => setBulletBank(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {ACTION_VERBS.map(v => (
                <button key={v} className="verb-chip" onClick={() => { insertVerb(v); setBulletBank(false) }}
                  style={{ padding: '6px 13px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div id="header-bar" className="no-print" style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(13,17,23,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5, flexShrink: 0 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {savedAgo && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginRight: 4 }}>{savedAgo}</span>}
          <button onClick={handleSave} title="Ctrl+S" style={{ height: 32, padding: '0 14px', borderRadius: 100, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save Draft</button>
          <button onClick={handleFillExample} style={{ height: 32, padding: '0 14px', borderRadius: 100, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Example</button>
          <button onClick={() => setShowPdfModal(true)} style={{ height: 32, padding: '0 14px', borderRadius: 100, background: '#f59e0b', border: 'none', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Download PDF
          </button>
          <button onClick={handleReset} style={{ height: 32, padding: '0 10px', background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
        </div>
      </div>

      {/* MOBILE TAB BAR */}
      <div className="builder-mobile no-print" style={{ position: 'sticky', top: 56, zIndex: 150, background: '#0D1117', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex' }}>
          {([['edit', '✏️ Edit'], ['preview', '👁 Preview']] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab as 'edit' | 'preview')} style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', borderBottom: activeTab === tab ? '2px solid #4F7CFF' : '2px solid transparent', color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>{label}</button>
          ))}
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="builder-desktop" style={{ height: 'calc(100vh - 56px)' }}>
        {/* LEFT: FORM */}
        <div id="form-panel" ref={formPanelRef} style={{ width: '42%', height: 'calc(100vh - 56px)', overflowY: 'auto', background: '#0D1117', padding: '20px 18px' }}>
          {renderFormSections(false)}
        </div>

        {/* RIGHT: PREVIEW */}
        <div style={{ width: '58%', height: 'calc(100vh - 56px)', overflowY: 'auto', background: '#0f1520' }}>
          {/* Preview sticky header */}
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(15,21,32,0.97)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Active template */}
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', padding: '4px 12px', borderRadius: 100, background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.35)' }}>
                LSE Format
              </span>
              {/* Locked templates */}
              {['IIM', 'DU', 'Startup', 'Finance'].map(n => (
                <button key={n} className="template-locked" onClick={() => setShowPopup(true)}
                  style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: '4px 11px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}>
                  🔒 {n}
                </button>
              ))}
            </div>
            {/* Page fit + Recruiter View + Zoom controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {recruiterView && (
                <div style={{ fontSize: 12, color: '#f59e0b', background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 100, padding: '3px 12px', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: 0.2 }}>
                  {recruiterDone ? '⏱ Time\'s up' : `⏱ ${recruiterTimer}s remaining`}
                </div>
              )}
              {(() => {
                const pageFit = calculatePageFit(formData)
                const fitColor = pageFit >= 100 ? '#ef4444' : pageFit >= 90 ? '#f59e0b' : pageFit >= 70 ? '#10b981' : 'rgba(255,255,255,0.3)'
                return <span style={{ fontSize: 11, color: fitColor, fontWeight: 600 }}>{pageFit >= 100 ? '⚠️ Overflowing' : pageFit >= 90 ? `${pageFit}% — almost full` : pageFit >= 70 ? `${pageFit}% ✓` : `${pageFit}%`}</span>
              })()}
              <button onClick={toggleRecruiterView} style={{ height: 28, padding: '0 12px', borderRadius: 100, background: recruiterView ? '#f59e0b' : 'transparent', border: recruiterView ? 'none' : '1px solid rgba(255,255,255,0.2)', color: recruiterView ? '#000' : 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, animation: recruiterView && !recruiterDone ? 'recruiterPulse 1.5s ease infinite' : 'none' }}>
                {recruiterView ? '👁 Recruiter View ON' : '👁 Recruiter View'}
              </button>
              <div style={{ display: 'flex', gap: 3 }}>
                {[75, 90, 100].map(z => (
                  <button key={z} onClick={() => setZoom(z)} style={{ padding: '4px 10px', borderRadius: 6, background: zoom === z ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${zoom === z ? 'rgba(79,124,255,0.35)' : 'rgba(255,255,255,0.07)'}`, color: zoom === z ? '#93BBFF' : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>{z}%</button>
                ))}
              </div>
            </div>
          </div>

          {/* Resume render area */}
          <div style={{ padding: '28px 24px', display: 'flex', justifyContent: 'center', backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            <div style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.6)', borderRadius: 4, overflow: 'hidden', width: 680 * (zoom / 100) }}>
              <LivePreview f={formData} zoom={zoom} recruiterView={recruiterView} />
            </div>
          </div>

          {/* Upgrade card */}
          <div style={{ padding: '0 24px 40px' }}>
            <div style={{ background: 'linear-gradient(135deg,rgba(79,124,255,0.08),rgba(123,97,255,0.05))', border: '1px solid rgba(79,124,255,0.18)', borderRadius: 16, padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 20 }}>📋</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Unlock 5 more formats</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>IIM, DU, Startup, Finance, Marketing</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {['IIM', 'DU', 'Startup', 'Finance', 'Marketing'].map(label => (
                  <span key={label} style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.2)', color: '#93BBFF', fontSize: 11, fontWeight: 700 }}>{label}</span>
                ))}
              </div>
              <button onClick={() => setShowPopup(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 12px rgba(79,124,255,0.3)' }}>
                Unlock All Templates — ₹199 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RECRUITER VIEW OVERLAY CARD (desktop) */}
      {recruiterView && recruiterDone && (
        <div className="no-print builder-desktop" style={{ position: 'fixed', bottom: 40, left: '42%', right: 0, display: 'flex', justifyContent: 'center', zIndex: 500, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto', background: '#111827', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: '20px', maxWidth: 320, width: '100%', fontFamily: "'DM Sans',sans-serif", animation: 'fadeUp 0.25s ease' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4 }}>This is what they remembered.</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 14 }}>Everything else was ignored.</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Make these 5 elements count:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
              {['Name — clear and prominent', 'Recent role — specific title', 'First bullet — your best one', 'CGPA — only if 7.5+', 'Skills — match the JD'].map((item, i) => (
                <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {item}
                </div>
              ))}
            </div>
            <button onClick={toggleRecruiterView} style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Turn off Recruiter View
            </button>
          </div>
        </div>
      )}

      {/* MOBILE LAYOUT */}
      <div className="builder-mobile" style={{ flexDirection: 'column', minHeight: 'calc(100vh - 104px)' }}>
        {activeTab === 'edit' && (
          <div style={{ padding: '16px 14px', background: '#0D1117', flex: 1 }}>
            {renderFormSections(true)}
          </div>
        )}
        {activeTab === 'preview' && (
          <div style={{ padding: 16, background: '#0f1520', flex: 1, overflowX: 'auto' }}>
            {/* Mobile template switcher */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#93BBFF', padding: '4px 12px', borderRadius: 100, background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.35)' }}>LSE</span>
              {['IIM', 'DU', 'Startup', 'Finance'].map(n => (
                <button key={n} onClick={() => setShowPopup(true)} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', fontFamily: 'inherit' }}>🔒 {n}</button>
              ))}
            </div>
            <div style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.5)', borderRadius: 4, overflow: 'hidden', display: 'inline-block' }}>
              <LivePreview f={formData} zoom={55} recruiterView={recruiterView} />
            </div>
            {recruiterView && recruiterDone && (
              <div style={{ marginTop: 20, background: '#111827', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: '20px', fontFamily: "'DM Sans',sans-serif" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4 }}>This is what they remembered.</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 14 }}>Everything else was ignored.</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Make these 5 elements count:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
                  {['Name — clear and prominent', 'Recent role — specific title', 'First bullet — your best one', 'CGPA — only if 7.5+', 'Skills — match the JD'].map((item, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {item}
                    </div>
                  ))}
                </div>
                <button onClick={toggleRecruiterView} style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Turn off Recruiter View
                </button>
              </div>
            )}
          </div>
        )}
        {activeTab === 'edit' && (
          <button onClick={() => setActiveTab('preview')} className="no-print" style={{ position: 'fixed', bottom: 24, right: 20, width: 50, height: 50, borderRadius: '50%', background: '#4F7CFF', border: 'none', fontSize: 20, cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,124,255,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            📄
          </button>
        )}
      </div>
    </main>
  )
}
