'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import UnlockPopup from '../../components/UnlockPopup'

/* ─────────────────────────────────────────────
   TYPES & DEFAULTS
───────────────────────────────────────────── */
type Experience = { company: string; role: string; duration: string; location: string; bullets: string[] }
type Project = { name: string; context: string; bullets: string[] }
type Education2 = { college: string; degree: string; year: string; cgpa: string }
type Toast = { id: number; message: string }

interface FormData {
  name: string; college: string; degree: string; year: string; cgpa: string
  phone: string; email: string; linkedin: string; city: string
  summary: string
  experiences: Experience[]
  education2: Education2
  projects: Project[]
  skills: string[]
  languages: string[]
}

const defaultFormData: FormData = {
  name: '', college: '', degree: '', year: '', cgpa: '', phone: '', email: '', linkedin: '', city: '',
  summary: '',
  experiences: [{ company: '', role: '', duration: '', location: '', bullets: ['', '', '', ''] }],
  education2: { college: '', degree: '', year: '', cgpa: '' },
  projects: [{ name: '', context: '', bullets: ['', ''] }],
  skills: [],
  languages: [],
}

const ACTION_VERBS = ['Analyzed','Evaluated','Recommended','Structured','Synthesized','Identified','Developed','Modeled','Forecasted','Managed','Launched','Grew','Optimized','Created','Drove','Sourced','Negotiated','Converted','Coordinated','Streamlined','Implemented','Executed','Built','Scaled','Led','Presented','Researched','Delivered','Generated','Reduced','Improved','Increased','Designed','Supervised','Trained','Established','Initiated','Resolved']

const DOMAIN_SUGGESTIONS: Record<string, string[]> = {
  'Consulting': ['MS Excel', 'PowerPoint', 'Case Frameworks', 'Market Research', 'Financial Modeling'],
  'Finance': ['MS Excel (Advanced)', 'Financial Modeling', 'Bloomberg', 'Valuation', 'Tally'],
  "Founder's Office": ['Notion', 'Airtable', 'Google Analytics', 'Excel', 'Canva'],
  'Marketing': ['Canva', 'Google Analytics', 'Meta Ads', 'Mailchimp', 'Excel'],
  'BD': ['CRM Tools', 'Excel', 'PowerPoint', 'LinkedIn Sales Navigator', 'Notion'],
  'Operations': ['Excel', 'SQL (Basic)', 'Notion', 'Google Sheets', 'Tableau'],
}

const DOMAINS = ['Consulting', 'Finance', "Founder's Office", 'Marketing', 'BD', 'Operations']

const EXAMPLE_DATA: FormData = {
  name: 'Rahul Mehta', college: '[Your College], Delhi', degree: 'BBA (Honours)', year: '2025', cgpa: '8.1', phone: '+91 98XXX XXXXX', email: 'rahul.mehta@email.com', linkedin: 'linkedin.com/in/rahulmehta', city: 'Delhi',
  summary: 'Final-year BBA student at [Your College], Delhi, targeting Business Development and consulting roles. Built and converted a 45-lead B2B pipeline during my internship at Bloom. Strong in Excel, market research, and structured thinking.',
  experiences: [
    { company: 'Bloom D2C Startup', role: 'Business Development Intern', duration: 'Jun\u2013Aug 2024', location: 'Delhi', bullets: ['Identified and cold-contacted 45 potential B2B partnership leads over 6 weeks', 'Converted 4 leads into active discussions, contributing to 2 signed agreements worth \u20B93.2L', 'Built and maintained a CRM tracker for 60+ prospects using Notion and Google Sheets', ''] },
    { company: 'College Finance Society', role: 'Research Analyst', duration: 'Aug 2023\u2013Present', location: '', bullets: ['Prepared weekly market research reports on 3 sectors, distributed to 200+ members', 'Co-authored a 12-page report on FMCG sector trends; presented to faculty panel of 5', '', ''] },
  ],
  education2: { college: '', degree: '', year: '', cgpa: '' },
  projects: [{ name: 'Competitive Analysis \u2014 EdTech Sector', context: 'College Strategy Course', bullets: ['Analyzed 5 EdTech companies across pricing, positioning, and growth strategies', 'Identified 3 untapped market opportunities; ranked 1st among 14 teams at college'] }],
  skills: ['MS Excel (Advanced)', 'PowerPoint', 'Notion', 'Google Analytics (Basic)', 'Canva'],
  languages: ['English (Fluent)', 'Hindi (Native)'],
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
  if (!f.experiences.some(e => e.company && e.bullets.filter(Boolean).length >= 2)) return 'an experience with 2+ bullet points'
  if (!f.college || !f.degree || !f.year) return 'education details'
  if (!f.projects.some(p => p.name)) return 'a project'
  if (f.skills.length < 3) return 'at least 3 skills'
  if (!f.cgpa) return 'your CGPA'
  if (!f.linkedin) return 'your LinkedIn URL'
  return null
}

function calcATS(f: FormData): { score: number; missing: { label: string; section: string }[] } {
  let score = 0
  const missing: { label: string; section: string }[] = []
  if (f.name) score += 5; else missing.push({ label: 'Add your name', section: 'personal' })
  if (f.email) score += 5; else missing.push({ label: 'Add email', section: 'personal' })
  if (f.phone) score += 5; else missing.push({ label: 'Add phone', section: 'personal' })
  if (f.linkedin) score += 5; else missing.push({ label: 'Add LinkedIn', section: 'personal' })
  if (f.summary.length > 100) score += 10; else missing.push({ label: 'Write a summary (100+ chars)', section: 'summary' })
  const expCount = f.experiences.filter(e => e.company).length
  if (expCount >= 1) score += 10; else missing.push({ label: 'Add at least 1 experience', section: 'experience' })
  if (expCount >= 2) score += 5; else if (expCount === 1) missing.push({ label: 'Add a 2nd experience', section: 'experience' })
  const allBullets = f.experiences.flatMap(e => e.bullets)
  if (allBullets.some(b => { const w = b.trim().split(/\s+/)[0]; return ACTION_VERBS.some(v => v.toLowerCase() === w?.toLowerCase()) })) score += 10; else missing.push({ label: 'Start a bullet with an action verb', section: 'experience' })
  if (allBullets.some(b => /\d/.test(b))) score += 10; else missing.push({ label: 'Add numbers to a bullet point', section: 'experience' })
  if (f.projects.some(p => p.name)) score += 10; else missing.push({ label: 'Add a project', section: 'projects' })
  if (f.skills.length >= 4) score += 10; else missing.push({ label: 'Add at least 4 skills', section: 'skills' })
  if (f.college && f.degree && f.year) score += 5; else missing.push({ label: 'Complete education', section: 'education' })
  if (f.cgpa) score += 5; else missing.push({ label: 'Add CGPA', section: 'education' })
  return { score: Math.min(score, 100), missing }
}

function getBulletTip(bullet: string): { text: string; type: 'warn' | 'good' } {
  if (!bullet.trim()) return { text: '', type: 'warn' }
  const weakStarters = ['helped', 'worked', 'assisted']
  const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase() || ''
  if (weakStarters.includes(firstWord)) return { text: "Start stronger \u2014 try 'Drove', 'Built', 'Managed'", type: 'warn' }
  if (!/\d/.test(bullet)) return { text: "Add a specific number \u2014 e.g. '40% growth' or '\u20B93.2L impact'", type: 'warn' }
  if (bullet.length < 60) return { text: 'Add more context \u2014 what was the result or impact?', type: 'warn' }
  return { text: '\u2713 Strong bullet', type: 'good' }
}

/* ─────────────────────────────────────────────
   SECTION COMPLETENESS
───────────────────────────────────────────── */
type SectionStatus = 'empty' | 'partial' | 'complete'

function sectionStatus(section: string, f: FormData): SectionStatus {
  switch (section) {
    case 'personal': {
      const fields = [f.name, f.phone, f.email, f.college, f.degree, f.year, f.city]
      const filled = fields.filter(Boolean).length
      if (filled === 0) return 'empty'
      return filled >= 5 ? 'complete' : 'partial'
    }
    case 'summary': return f.summary.length > 50 ? 'complete' : f.summary ? 'partial' : 'empty'
    case 'experience': {
      const hasAny = f.experiences.some(e => e.company)
      if (!hasAny) return 'empty'
      return f.experiences.some(e => e.company && e.bullets.filter(Boolean).length >= 2) ? 'complete' : 'partial'
    }
    case 'education': return (f.college && f.degree && f.year) ? 'complete' : (f.college || f.degree || f.year) ? 'partial' : 'empty'
    case 'projects': {
      const hasAny = f.projects.some(p => p.name)
      if (!hasAny) return 'empty'
      return f.projects.some(p => p.name && p.bullets.filter(Boolean).length >= 1) ? 'complete' : 'partial'
    }
    case 'skills': return f.skills.length >= 3 ? 'complete' : f.skills.length > 0 ? 'partial' : 'empty'
    case 'languages': return f.languages.length > 0 ? 'complete' : 'empty'
    default: return 'empty'
  }
}

function statusColor(st: SectionStatus): string {
  if (st === 'complete') return '#10b981'
  if (st === 'partial') return '#f59e0b'
  return 'rgba(255,255,255,0.1)'
}

/* ─────────────────────────────────────────────
   LIVE PREVIEW (LSE FORMAT)
───────────────────────────────────────────── */
function LivePreview({ f, zoom }: { f: FormData; zoom: number }) {
  const contactParts = [f.phone, f.email, f.linkedin, f.city].filter(Boolean)
  const hasEdu = f.college || f.degree || f.year
  const hasExp = f.experiences.some(e => e.company || e.role)
  const hasProj = f.projects.some(p => p.name)
  const hasEdu2 = f.education2.college || f.education2.degree

  const sectionHeading = (label: string) => (
    <div style={{ borderBottom: '1.5px solid black', marginBottom: 8, marginTop: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
    </div>
  )

  const isEmpty = !f.name && !hasEdu && !hasExp && !hasProj && f.skills.length === 0

  return (
    <div id="resume-print-target" style={{ fontFamily: 'Times New Roman, serif', fontSize: 10.5, lineHeight: 1.5, color: '#000', padding: 40, background: '#fff', width: 680, minHeight: 960, position: 'relative', transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
      {/* One page mark */}
      <div style={{ position: 'absolute', top: 1050, left: 0, right: 0, height: 1, background: 'rgba(239,68,68,0.5)', zIndex: 10 }} />
      <div style={{ position: 'absolute', top: 1050, right: 8, fontSize: 8, color: 'rgba(239,68,68,0.7)', zIndex: 10 }}>page break</div>

      {isEmpty && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
          Your resume will appear here as you type
        </div>
      )}

      {f.name && (
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>{f.name}</div>
          {contactParts.length > 0 && (
            <div style={{ fontSize: 10, color: '#333', marginTop: 4 }}>{contactParts.join(' \u00B7 ')}</div>
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
                {e.bullets.filter(Boolean).map((b, j) => <div key={j}>\u2014 {b}</div>)}
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
                {p.bullets.filter(Boolean).map((b, j) => <div key={j}>\u2014 {b}</div>)}
              </div>
            )
          })}
        </div>
      )}

      {f.skills.length > 0 && (
        <div data-section="skills">
          {sectionHeading('Skills')}
          <div style={{ marginBottom: f.languages.length > 0 ? 6 : 0 }}>{f.skills.join(', ')}</div>
        </div>
      )}

      {f.languages.length > 0 && (
        <div data-section="languages">
          {f.skills.length === 0 && sectionHeading('Languages')}
          <div><span style={{ fontWeight: 'bold' }}>Languages:</span> {f.languages.join(', ')}</div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   COLLAPSIBLE SECTION WRAPPER
───────────────────────────────────────────── */
function SectionCard({ id, icon, title, status, expanded, onToggle, children }: {
  id: string; icon: string; title: string; status: SectionStatus; expanded: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${statusColor(status)}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', fontFamily: "'DM Sans',sans-serif", textAlign: 'left' }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{title}</span>
        <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, background: status === 'complete' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: status === 'complete' ? '#10b981' : 'rgba(255,255,255,0.3)', border: `1px solid ${status === 'complete' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
          {status === 'complete' ? '\u2713' : '\u25CB'}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>\u25BC</span>
      </button>
      {expanded && (
        <div style={{ padding: '0 18px 18px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   TAG INPUT
───────────────────────────────────────────── */
function TagInput({ tags, onChange, inputValue, onInputChange, placeholder, max, suggestions }: {
  tags: string[]; onChange: (t: string[]) => void; inputValue: string; onInputChange: (v: string) => void; placeholder: string; max: number; suggestions?: string[]
}) {
  const addTag = (tag: string) => {
    const t = tag.trim()
    if (t && !tags.includes(t) && tags.length < max) {
      onChange([...tags, t])
    }
    onInputChange('')
  }
  const removeTag = (idx: number) => onChange(tags.filter((_, i) => i !== idx))

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {tags.map((tag, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 12, fontWeight: 600 }}>
            {tag}
            <button onClick={() => removeTag(i)} style={{ background: 'none', border: 'none', color: '#93BBFF', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>\u00D7</button>
          </span>
        ))}
      </div>
      {tags.length >= max && <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 6 }}>Maximum {max} items reached</div>}
      <input
        value={inputValue}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
            e.preventDefault()
            addTag(inputValue)
          }
        }}
        placeholder={placeholder}
        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: 14, padding: '8px 0 6px', width: '100%', outline: 'none', fontFamily: 'inherit' }}
      />
      {suggestions && suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {suggestions.filter(s => !tags.includes(s)).map(s => (
            <button key={s} onClick={() => addTag(s)} style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────── */
export default function ResumeBuilderPage() {
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [targetDomain, setTargetDomain] = useState('Consulting')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personal', 'summary', 'experience', 'education', 'projects', 'skills', 'languages']))
  const [skillInput, setSkillInput] = useState('')
  const [langInput, setLangInput] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showATS, setShowATS] = useState(false)
  const [savedTime, setSavedTime] = useState<Date | null>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [zoom, setZoom] = useState(90)
  const [showTips, setShowTips] = useState(false)
  const [showEdu2, setShowEdu2] = useState(false)

  const formPanelRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const toastIdRef = useRef(0)

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('resumeDraft')
      if (saved) {
        const parsed = JSON.parse(saved) as FormData
        setFormData(parsed)
        if (parsed.education2 && (parsed.education2.college || parsed.education2.degree)) setShowEdu2(true)
        addToast('Draft restored')
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addToast = useCallback((message: string) => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const toggleSection = (s: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s); else next.add(s)
      return next
    })
  }

  const scrollToSection = (section: string) => {
    if (!expandedSections.has(section)) toggleSection(section)
    setTimeout(() => {
      const el = sectionRefs.current[section]
      if (el && formPanelRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
    setActiveTab('edit')
  }

  // Field updaters
  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const setExpField = (idx: number, key: keyof Experience, value: string) => {
    setFormData(prev => {
      const exps = prev.experiences.map((e, i) => i === idx ? { ...e, [key]: value } : e)
      return { ...prev, experiences: exps }
    })
  }

  const setExpBullet = (idx: number, bIdx: number, value: string) => {
    setFormData(prev => {
      const exps = prev.experiences.map((e, i) => {
        if (i !== idx) return e
        const bullets = [...e.bullets]
        bullets[bIdx] = value
        return { ...e, bullets }
      })
      return { ...prev, experiences: exps }
    })
  }

  const addExperience = () => {
    if (formData.experiences.length >= 3) return
    setFormData(prev => ({ ...prev, experiences: [...prev.experiences, { company: '', role: '', duration: '', location: '', bullets: ['', '', '', ''] }] }))
  }

  const removeExperience = (idx: number) => {
    setFormData(prev => ({ ...prev, experiences: prev.experiences.filter((_, i) => i !== idx) }))
  }

  const addExpBullet = (idx: number) => {
    setFormData(prev => {
      const exps = prev.experiences.map((e, i) => {
        if (i !== idx || e.bullets.length >= 4) return e
        return { ...e, bullets: [...e.bullets, ''] }
      })
      return { ...prev, experiences: exps }
    })
  }

  const setProjField = (idx: number, key: keyof Project, value: string) => {
    setFormData(prev => {
      const projs = prev.projects.map((p, i) => i === idx ? { ...p, [key]: value } : p)
      return { ...prev, projects: projs }
    })
  }

  const setProjBullet = (idx: number, bIdx: number, value: string) => {
    setFormData(prev => {
      const projs = prev.projects.map((p, i) => {
        if (i !== idx) return p
        const bullets = [...p.bullets]
        bullets[bIdx] = value
        return { ...p, bullets }
      })
      return { ...prev, projects: projs }
    })
  }

  const addProject = () => {
    if (formData.projects.length >= 2) return
    setFormData(prev => ({ ...prev, projects: [...prev.projects, { name: '', context: '', bullets: ['', ''] }] }))
  }

  const removeProject = (idx: number) => {
    setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }))
  }

  // Actions
  const handleSave = () => {
    localStorage.setItem('resumeDraft', JSON.stringify(formData))
    setSavedTime(new Date())
    addToast('Draft saved \u2713')
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
    addToast('All fields cleared')
  }

  const savedAgo = savedTime ? `Saved ${Math.max(0, Math.floor((Date.now() - savedTime.getTime()) / 60000))} min ago` : ''

  const strength = calcStrength(formData)
  const missing = firstMissing(formData)
  const ats = calcATS(formData)

  const inputStyle: React.CSSProperties = {
    background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.18)', color: 'white', fontSize: 14, padding: '8px 0 6px', width: '100%', outline: 'none', fontFamily: 'inherit',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4,
  }

  const renderInput = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, note?: string) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} onFocus={e => { e.currentTarget.style.borderBottomColor = '#4F7CFF' }} onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.18)' }} />
      {note && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{note}</div>}
    </div>
  )

  const renderTextarea = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, rows = 2, maxLen?: number) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} maxLength={maxLen} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} onFocus={e => { e.currentTarget.style.borderBottomColor = '#4F7CFF' }} onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.18)' }} />
      {maxLen && (
        <div style={{ fontSize: 11, textAlign: 'right', color: value.length > 300 ? '#ef4444' : value.length > 250 ? '#f59e0b' : '#10b981' }}>{value.length}/{maxLen}</div>
      )}
    </div>
  )

  const [bulletTips, setBulletTips] = useState<Record<string, boolean>>({})
  const toggleBulletTip = (key: string) => setBulletTips(prev => ({ ...prev, [key]: !prev[key] }))

  /* ─── RENDER ─── */
  return (
    <main style={{ background: '#0D1117', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.3)}
        @media print {
          #form-panel, #header-bar, .no-print { display: none !important; }
          #resume-print-target { display: block !important; position: static !important; width: 100% !important; height: auto !important; overflow: visible !important; background: white !important; }
          body { background: white !important; }
          @page { size: A4; margin: 15mm; }
        }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media(max-width:860px){
          .builder-desktop{display:none !important}
          .builder-mobile{display:flex !important}
        }
        @media(min-width:861px){
          .builder-desktop{display:flex !important}
          .builder-mobile{display:none !important}
        }
      `}</style>

      <UnlockPopup isOpen={showPopup} onClose={() => setShowPopup(false)} onEmailUnlock={() => {}} resourceName="Resume Templates" localStorageKey="resumeTemplates" showEmailOption={false} emailAlreadySubmitted={false} />

      {/* Print Modal */}
      {showPrintModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowPrintModal(false) }} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#111827', borderRadius: 20, padding: 32, maxWidth: 420, width: '100%', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Download as PDF</h3>
            <ol style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 2, paddingLeft: 20, marginBottom: 24 }}>
              <li>A print dialog will open.</li>
              <li>Set destination to &quot;Save as PDF&quot;.</li>
              <li>Set margins to &quot;None&quot;.</li>
              <li>Disable background graphics.</li>
            </ol>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { window.print(); setShowPrintModal(false) }} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Open Print Dialog \u2192
              </button>
              <button onClick={() => setShowPrintModal(false)} style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div className="no-print" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #f59e0b', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#fff', animation: 'slideInRight 0.3s ease', backdropFilter: 'blur(8px)', minWidth: 200 }}>
            {t.message}
          </div>
        ))}
      </div>

      {/* HEADER BAR */}
      <div id="header-bar" className="no-print" style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5, flexShrink: 0 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>Resume Builder</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {savedAgo && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginRight: 4 }}>{savedAgo}</span>}
          <button onClick={handleSave} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Save Draft</button>
          <button onClick={handleFillExample} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.2)', color: '#93BBFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Fill Example</button>
          <button onClick={() => setShowPrintModal(true)} style={{ padding: '7px 14px', borderRadius: 8, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Download PDF</button>
          <button onClick={handleReset} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.6)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
        </div>
      </div>

      {/* MOBILE TAB BAR */}
      <div className="builder-mobile no-print" style={{ display: 'none', position: 'sticky', top: 56, zIndex: 150, background: 'rgba(13,17,23,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex' }}>
          {(['edit', 'preview'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', borderBottom: activeTab === tab ? '2px solid #4F7CFF' : '2px solid transparent', color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>{tab}</button>
          ))}
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="builder-desktop" style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
        {/* LEFT PANEL (FORM) */}
        <div id="form-panel" ref={formPanelRef} style={{ width: '42%', height: 'calc(100vh - 56px)', overflowY: 'auto', background: '#0D1117', padding: '24px 20px' }}>
          {/* Strength Bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Resume strength</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: strength >= 60 ? '#10b981' : '#f59e0b' }}>{strength}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${strength}%`, borderRadius: 3, background: strength >= 60 ? '#10b981' : '#f59e0b', transition: 'width 0.3s ease' }} />
            </div>
            {missing && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Add {missing} to strengthen your resume</div>}
          </div>

          {/* Domain Pills */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {DOMAINS.map(d => (
                <button key={d} onClick={() => setTargetDomain(d)} style={{ padding: '5px 12px', borderRadius: 100, background: targetDomain === d ? 'rgba(79,124,255,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${targetDomain === d ? 'rgba(79,124,255,0.5)' : 'rgba(255,255,255,0.08)'}`, color: targetDomain === d ? '#93BBFF' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {d}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Showing keywords for {targetDomain}</div>
          </div>

          {/* Section 1: Personal Details */}
          <div ref={el => { sectionRefs.current['personal'] = el }}>
            <SectionCard id="personal" icon="\uD83D\uDC64" title="Personal Details" status={sectionStatus('personal', formData)} expanded={expandedSections.has('personal')} onToggle={() => toggleSection('personal')}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  {renderInput('Full Name', formData.name, v => setField('name', v), 'Rahul Mehta')}
                </div>
                {renderInput('Phone', formData.phone, v => setField('phone', v), '+91 98XXX XXXXX')}
                {renderInput('Email', formData.email, v => setField('email', v), 'you@email.com')}
                {renderInput('College', formData.college, v => setField('college', v), '[Your College], Delhi')}
                {renderInput('Degree', formData.degree, v => setField('degree', v), 'BBA (Honours)')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, gridColumn: '1 / -1' }}>
                  {renderInput('Year', formData.year, v => setField('year', v), '2025')}
                  {renderInput('CGPA', formData.cgpa, v => setField('cgpa', v), '8.1', 'Leave blank if below 7.5')}
                  {renderInput('City', formData.city, v => setField('city', v), 'Delhi')}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  {renderInput('LinkedIn', formData.linkedin, v => setField('linkedin', v), 'linkedin.com/in/yourname', 'e.g. linkedin.com/in/yourname')}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Section 2: Summary */}
          <div ref={el => { sectionRefs.current['summary'] = el }}>
            <SectionCard id="summary" icon="\u270D\uFE0F" title="Summary" status={sectionStatus('summary', formData)} expanded={expandedSections.has('summary')} onToggle={() => toggleSection('summary')}>
              {renderTextarea('Professional Summary', formData.summary, v => setField('summary', v), 'Write 2\u20133 lines about your background, strengths, and goals.', 4, 300)}
              <button onClick={() => setShowTips(!showTips)} style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8, padding: 0 }}>
                Tips {showTips ? '\u2191' : '\u2193'}
              </button>
              {showTips && (
                <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.15)', fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                  Write 2\u20133 lines. Include: what you are, what you want, what makes you different. Avoid: &quot;seeking a challenging opportunity&quot;.
                </div>
              )}
            </SectionCard>
          </div>

          {/* Section 3: Experience */}
          <div ref={el => { sectionRefs.current['experience'] = el }}>
            <SectionCard id="experience" icon="\uD83D\uDCBC" title="Experience" status={sectionStatus('experience', formData)} expanded={expandedSections.has('experience')} onToggle={() => toggleSection('experience')}>
              {formData.experiences.map((exp, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 16px 12px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{exp.company || `Experience ${i + 1}`}</span>
                    {formData.experiences.length > 1 && (
                      <button onClick={() => removeExperience(i)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.5)', fontSize: 16, cursor: 'pointer', padding: '2px 6px' }}>\u00D7</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    {renderInput('Company', exp.company, v => setExpField(i, 'company', v), 'Bloom D2C Startup')}
                    {renderInput('Role', exp.role, v => setExpField(i, 'role', v), 'Business Development Intern')}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {renderInput('Duration', exp.duration, v => setExpField(i, 'duration', v), 'Jun\u2013Aug 2024')}
                      {renderInput('Location (optional)', exp.location, v => setExpField(i, 'location', v), 'Delhi')}
                    </div>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {exp.bullets.map((b, bIdx) => {
                      const tipKey = `exp-${i}-${bIdx}`
                      const tip = b ? getBulletTip(b) : null
                      return (
                        <div key={bIdx}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <label style={{ ...labelStyle, flex: 1, marginBottom: 0 }}>Achievement {bIdx + 1}</label>
                            {b && (
                              <button onClick={() => toggleBulletTip(tipKey)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: 14, padding: 0 }}>\u26A1</button>
                            )}
                          </div>
                          <textarea value={b} onChange={e => setExpBullet(i, bIdx, e.target.value)} placeholder="What you did + result with numbers" rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} onFocus={e => { e.currentTarget.style.borderBottomColor = '#4F7CFF' }} onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.18)' }} />
                          {bulletTips[tipKey] && tip && (
                            <div style={{ fontSize: 11, marginTop: 4, padding: '6px 10px', borderRadius: 6, background: tip.type === 'good' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${tip.type === 'good' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`, color: tip.type === 'good' ? '#6ee7b7' : '#fcd34d' }}>
                              {tip.text}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {exp.bullets.length < 4 && (
                      <button onClick={() => addExpBullet(i)} style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>+ Add Achievement</button>
                    )}
                  </div>
                </div>
              ))}
              {formData.experiences.length < 3 && (
                <button onClick={addExperience} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(79,124,255,0.25)', background: 'rgba(79,124,255,0.06)', color: '#93BBFF', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Experience</button>
              )}
            </SectionCard>
          </div>

          {/* Section 4: Education */}
          <div ref={el => { sectionRefs.current['education'] = el }}>
            <SectionCard id="education" icon="\uD83C\uDF93" title="Education" status={sectionStatus('education', formData)} expanded={expandedSections.has('education')} onToggle={() => toggleSection('education')}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                {renderInput('College', formData.college, v => setField('college', v), '[Your College], Delhi')}
                {renderInput('Degree', formData.degree, v => setField('degree', v), 'BBA (Honours)')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {renderInput('Year', formData.year, v => setField('year', v), '2025')}
                  {renderInput('CGPA', formData.cgpa, v => setField('cgpa', v), '8.1')}
                </div>
              </div>
              {!showEdu2 && (
                <button onClick={() => setShowEdu2(true)} style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 12, padding: 0 }}>+ Add Qualification</button>
              )}
              {showEdu2 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Additional Qualification</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    {renderInput('College / School', formData.education2.college, v => setField('education2', { ...formData.education2, college: v }), 'School name')}
                    {renderInput('Degree / Board', formData.education2.degree, v => setField('education2', { ...formData.education2, degree: v }), 'Class XII / CBSE')}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {renderInput('Year', formData.education2.year, v => setField('education2', { ...formData.education2, year: v }), '2022')}
                      {renderInput('CGPA / %', formData.education2.cgpa, v => setField('education2', { ...formData.education2, cgpa: v }), '92%')}
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Section 5: Projects */}
          <div ref={el => { sectionRefs.current['projects'] = el }}>
            <SectionCard id="projects" icon="\uD83D\uDD2C" title="Projects" status={sectionStatus('projects', formData)} expanded={expandedSections.has('projects')} onToggle={() => toggleSection('projects')}>
              {formData.projects.map((proj, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 16px 12px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{proj.name || `Project ${i + 1}`}</span>
                    {formData.projects.length > 1 && (
                      <button onClick={() => removeProject(i)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.5)', fontSize: 16, cursor: 'pointer', padding: '2px 6px' }}>\u00D7</button>
                    )}
                  </div>
                  {renderInput('Project Name', proj.name, v => setProjField(i, 'name', v), 'Competitive Analysis \u2014 EdTech Sector')}
                  <div style={{ marginTop: 12 }}>
                    {renderInput('Context', proj.context, v => setProjField(i, 'context', v), 'College Strategy Course')}
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {proj.bullets.map((b, bIdx) => {
                      const tipKey = `proj-${i}-${bIdx}`
                      const tip = b ? getBulletTip(b) : null
                      return (
                        <div key={bIdx}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <label style={{ ...labelStyle, flex: 1, marginBottom: 0 }}>Bullet {bIdx + 1}</label>
                            {b && (
                              <button onClick={() => toggleBulletTip(tipKey)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: 14, padding: 0 }}>\u26A1</button>
                            )}
                          </div>
                          <textarea value={b} onChange={e => setProjBullet(i, bIdx, e.target.value)} placeholder="What you did + result" rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} onFocus={e => { e.currentTarget.style.borderBottomColor = '#4F7CFF' }} onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.18)' }} />
                          {bulletTips[tipKey] && tip && (
                            <div style={{ fontSize: 11, marginTop: 4, padding: '6px 10px', borderRadius: 6, background: tip.type === 'good' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${tip.type === 'good' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`, color: tip.type === 'good' ? '#6ee7b7' : '#fcd34d' }}>
                              {tip.text}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
              {formData.projects.length < 2 && (
                <button onClick={addProject} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(79,124,255,0.25)', background: 'rgba(79,124,255,0.06)', color: '#93BBFF', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Project</button>
              )}
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(79,124,255,0.04)', border: '1px solid rgba(79,124,255,0.1)', fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                Include case competitions, academic research, freelance work. Participation shows initiative even without a win.
              </div>
            </SectionCard>
          </div>

          {/* Section 6: Skills & Tools */}
          <div ref={el => { sectionRefs.current['skills'] = el }}>
            <SectionCard id="skills" icon="\uD83D\uDEE0\uFE0F" title="Skills & Tools" status={sectionStatus('skills', formData)} expanded={expandedSections.has('skills')} onToggle={() => toggleSection('skills')}>
              <TagInput
                tags={formData.skills}
                onChange={v => setField('skills', v)}
                inputValue={skillInput}
                onInputChange={setSkillInput}
                placeholder="Type a skill + Enter"
                max={8}
                suggestions={DOMAIN_SUGGESTIONS[targetDomain]}
              />
            </SectionCard>
          </div>

          {/* Section 7: Languages */}
          <div ref={el => { sectionRefs.current['languages'] = el }}>
            <SectionCard id="languages" icon="\uD83C\uDF10" title="Languages" status={sectionStatus('languages', formData)} expanded={expandedSections.has('languages')} onToggle={() => toggleSection('languages')}>
              <TagInput
                tags={formData.languages}
                onChange={v => setField('languages', v)}
                inputValue={langInput}
                onInputChange={setLangInput}
                placeholder="Type a language + Enter"
                max={8}
                suggestions={['English (Fluent)', 'Hindi (Native)']}
              />
            </SectionCard>
          </div>

          {/* ATS Score Panel */}
          <div style={{ marginTop: 8, marginBottom: 24 }}>
            <button onClick={() => setShowATS(!showATS)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, cursor: 'pointer', color: '#fff', fontFamily: 'inherit', textAlign: 'left' }}>
              <span style={{ fontSize: 16 }}>{'\uD83D\uDCCA'}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>ATS Score</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: ats.score > 75 ? '#10b981' : ats.score > 50 ? '#f59e0b' : '#ef4444' }}>{ats.score}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', transition: 'transform 0.2s', transform: showATS ? 'rotate(180deg)' : 'rotate(0deg)' }}>{'\u25BC'}</span>
            </button>
            {showATS && (
              <div style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '20px 18px' }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 48, fontWeight: 800, color: ats.score > 75 ? '#10b981' : ats.score > 50 ? '#f59e0b' : '#ef4444' }}>{ats.score}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                    ATS Readiness: {ats.score > 75 ? 'Excellent' : ats.score > 60 ? 'Good' : ats.score > 50 ? 'Fair' : 'Poor'}
                  </div>
                </div>
                {ats.missing.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ats.missing.map((m, i) => (
                      <button key={i} onClick={() => scrollToSection(m.section)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                        <span style={{ color: '#f59e0b' }}>\u25CB</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL (PREVIEW) */}
        <div style={{ width: '58%', height: 'calc(100vh - 56px)', overflowY: 'auto', background: '#111827' }}>
          {/* Preview header */}
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(8px)', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>LSE Format</span>
              {['IIM', 'DU', 'Startup', 'Finance'].map(n => (
                <span key={n} style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>{'\uD83D\uDD12'} {n}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[75, 90, 100].map(z => (
                <button key={z} onClick={() => setZoom(z)} style={{ padding: '4px 10px', borderRadius: 6, background: zoom === z ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${zoom === z ? 'rgba(79,124,255,0.3)' : 'rgba(255,255,255,0.08)'}`, color: zoom === z ? '#93BBFF' : 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{z}%</button>
              ))}
            </div>
          </div>

          {/* Resume render area */}
          <div style={{ padding: 24, display: 'flex', justifyContent: 'center', backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            <div style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)', borderRadius: 4, overflow: 'hidden', width: 680 * (zoom / 100) }}>
              <LivePreview f={formData} zoom={zoom} />
            </div>
          </div>

          {/* Upgrade card */}
          <div style={{ padding: '20px 24px 40px' }}>
            <div style={{ background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.15)', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Want 5 more formats? Unlock the full template pack.</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {['IIM', 'DU', 'Startup', 'Finance', 'Marketing'].map(label => (
                  <span key={label} style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.2)', color: '#93BBFF', fontSize: 11, fontWeight: 700 }}>{label}</span>
                ))}
              </div>
              <button onClick={() => setShowPopup(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 12px rgba(79,124,255,0.3)' }}>
                Unlock All Templates \u2014 \u20B9199 \u2192
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="builder-mobile" style={{ display: 'none', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
        {activeTab === 'edit' && (
          <div style={{ padding: '20px 16px', background: '#0D1117', flex: 1 }}>
            {/* Strength Bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Resume strength</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: strength >= 60 ? '#10b981' : '#f59e0b' }}>{strength}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${strength}%`, borderRadius: 3, background: strength >= 60 ? '#10b981' : '#f59e0b', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Domain Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {DOMAINS.map(d => (
                <button key={d} onClick={() => setTargetDomain(d)} style={{ padding: '5px 12px', borderRadius: 100, background: targetDomain === d ? 'rgba(79,124,255,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${targetDomain === d ? 'rgba(79,124,255,0.5)' : 'rgba(255,255,255,0.08)'}`, color: targetDomain === d ? '#93BBFF' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{d}</button>
              ))}
            </div>

            {/* All sections (same as desktop, reused via sectionRefs) */}
            <SectionCard id="personal-m" icon="\uD83D\uDC64" title="Personal Details" status={sectionStatus('personal', formData)} expanded={expandedSections.has('personal')} onToggle={() => toggleSection('personal')}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                {renderInput('Full Name', formData.name, v => setField('name', v), 'Rahul Mehta')}
                {renderInput('Phone', formData.phone, v => setField('phone', v), '+91 98XXX XXXXX')}
                {renderInput('Email', formData.email, v => setField('email', v), 'you@email.com')}
                {renderInput('College', formData.college, v => setField('college', v), '[Your College], Delhi')}
                {renderInput('Degree', formData.degree, v => setField('degree', v), 'BBA (Honours)')}
                {renderInput('Year', formData.year, v => setField('year', v), '2025')}
                {renderInput('CGPA', formData.cgpa, v => setField('cgpa', v), '8.1')}
                {renderInput('City', formData.city, v => setField('city', v), 'Delhi')}
                {renderInput('LinkedIn', formData.linkedin, v => setField('linkedin', v), 'linkedin.com/in/yourname')}
              </div>
            </SectionCard>

            <SectionCard id="summary-m" icon="\u270D\uFE0F" title="Summary" status={sectionStatus('summary', formData)} expanded={expandedSections.has('summary')} onToggle={() => toggleSection('summary')}>
              {renderTextarea('Summary', formData.summary, v => setField('summary', v), 'Your summary here', 4, 300)}
            </SectionCard>

            <SectionCard id="experience-m" icon="\uD83D\uDCBC" title="Experience" status={sectionStatus('experience', formData)} expanded={expandedSections.has('experience')} onToggle={() => toggleSection('experience')}>
              {formData.experiences.map((exp, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  {renderInput('Company', exp.company, v => setExpField(i, 'company', v))}
                  <div style={{ marginTop: 10 }}>{renderInput('Role', exp.role, v => setExpField(i, 'role', v))}</div>
                  <div style={{ marginTop: 10 }}>{renderInput('Duration', exp.duration, v => setExpField(i, 'duration', v))}</div>
                  {exp.bullets.map((b, bIdx) => (
                    <div key={bIdx} style={{ marginTop: 10 }}>
                      {renderTextarea(`Achievement ${bIdx + 1}`, b, v => setExpBullet(i, bIdx, v), 'Impact + numbers', 2)}
                    </div>
                  ))}
                </div>
              ))}
              {formData.experiences.length < 3 && (
                <button onClick={addExperience} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(79,124,255,0.25)', background: 'rgba(79,124,255,0.06)', color: '#93BBFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Experience</button>
              )}
            </SectionCard>

            <SectionCard id="projects-m" icon="\uD83D\uDD2C" title="Projects" status={sectionStatus('projects', formData)} expanded={expandedSections.has('projects')} onToggle={() => toggleSection('projects')}>
              {formData.projects.map((proj, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  {renderInput('Project Name', proj.name, v => setProjField(i, 'name', v))}
                  <div style={{ marginTop: 10 }}>{renderInput('Context', proj.context, v => setProjField(i, 'context', v))}</div>
                  {proj.bullets.map((b, bIdx) => (
                    <div key={bIdx} style={{ marginTop: 10 }}>
                      {renderTextarea(`Bullet ${bIdx + 1}`, b, v => setProjBullet(i, bIdx, v), 'What you did + result', 2)}
                    </div>
                  ))}
                </div>
              ))}
            </SectionCard>

            <SectionCard id="skills-m" icon="\uD83D\uDEE0\uFE0F" title="Skills" status={sectionStatus('skills', formData)} expanded={expandedSections.has('skills')} onToggle={() => toggleSection('skills')}>
              <TagInput tags={formData.skills} onChange={v => setField('skills', v)} inputValue={skillInput} onInputChange={setSkillInput} placeholder="Type + Enter" max={8} suggestions={DOMAIN_SUGGESTIONS[targetDomain]} />
            </SectionCard>

            <SectionCard id="languages-m" icon="\uD83C\uDF10" title="Languages" status={sectionStatus('languages', formData)} expanded={expandedSections.has('languages')} onToggle={() => toggleSection('languages')}>
              <TagInput tags={formData.languages} onChange={v => setField('languages', v)} inputValue={langInput} onInputChange={setLangInput} placeholder="Type + Enter" max={8} suggestions={['English (Fluent)', 'Hindi (Native)']} />
            </SectionCard>
          </div>
        )}

        {activeTab === 'preview' && (
          <div style={{ padding: 16, background: '#111827', flex: 1, overflowX: 'auto' }}>
            <div style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.5)', borderRadius: 4, overflow: 'hidden', display: 'inline-block' }}>
              <LivePreview f={formData} zoom={55} />
            </div>
          </div>
        )}

        {/* Floating preview button */}
        {activeTab === 'edit' && (
          <button onClick={() => setActiveTab('preview')} className="no-print" style={{ position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%', background: '#f59e0b', border: 'none', fontSize: 22, cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,158,11,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {'\uD83D\uDCC4'}
          </button>
        )}
      </div>
    </main>
  )
}
