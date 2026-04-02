'use client'

import { useState, useCallback } from 'react'
import UnlockPopup from '../../components/UnlockPopup'

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type ExpBlock = {
  company: string
  role: string
  duration: string
  location: string
  bullets: [string, string, string, string]
}

type ProjectBlock = {
  name: string
  context: string
  bullets: [string, string]
}

type FormData = {
  fullName: string
  college: string
  degree: string
  gradYear: string
  cgpa: string
  phone: string
  email: string
  linkedin: string
  city: string
  summary: string
  experience: ExpBlock[]
  projects: ProjectBlock[]
  skills: string
  languages: string
}

const EMPTY_EXP: ExpBlock = {
  company: '', role: '', duration: '', location: '',
  bullets: ['', '', '', ''],
}

const EMPTY_PROJECT: ProjectBlock = {
  name: '', context: '',
  bullets: ['', ''],
}

const DEFAULT_FORM: FormData = {
  fullName: '',
  college: '',
  degree: '',
  gradYear: '',
  cgpa: '',
  phone: '',
  email: '',
  linkedin: '',
  city: '',
  summary: '',
  experience: [{ ...EMPTY_EXP, bullets: ['', '', '', ''] }],
  projects: [{ ...EMPTY_PROJECT, bullets: ['', ''] }],
  skills: '',
  languages: '',
}

/* ─────────────────────────────────────────────
   PLAIN TEXT COPY BUILDER
───────────────────────────────────────────── */
function buildPlainText(f: FormData): string {
  const lines: string[] = []
  if (f.fullName) lines.push(f.fullName)
  const contact = [f.phone, f.email, f.linkedin, f.city].filter(Boolean).join(' · ')
  if (contact) lines.push(contact)
  const edu = [f.college, f.degree, f.gradYear && `Expected ${f.gradYear}`, f.cgpa && `CGPA: ${f.cgpa}`].filter(Boolean).join(' | ')
  if (edu) { lines.push(''); lines.push('EDUCATION'); lines.push(edu) }
  if (f.summary) { lines.push(''); lines.push('SUMMARY'); lines.push(f.summary) }
  if (f.experience.some(e => e.company || e.role)) {
    lines.push(''); lines.push('EXPERIENCE')
    f.experience.forEach(e => {
      if (!e.company && !e.role) return
      lines.push(`${e.company}${e.role ? ` | ${e.role}` : ''}${e.duration ? ` | ${e.duration}` : ''}`)
      e.bullets.forEach(b => { if (b) lines.push(`— ${b}`) })
    })
  }
  if (f.projects.some(p => p.name)) {
    lines.push(''); lines.push('PROJECTS')
    f.projects.forEach(p => {
      if (!p.name) return
      lines.push(`${p.name}${p.context ? ` | ${p.context}` : ''}`)
      p.bullets.forEach(b => { if (b) lines.push(`— ${b}`) })
    })
  }
  if (f.skills) { lines.push(''); lines.push('SKILLS'); lines.push(f.skills) }
  if (f.languages) { lines.push(''); lines.push('LANGUAGES'); lines.push(f.languages) }
  return lines.join('\n')
}

/* ─────────────────────────────────────────────
   INPUT COMPONENT (underline style)
───────────────────────────────────────────── */
function Field({
  label,
  value,
  onChange,
  placeholder,
  optional,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  optional?: boolean
  type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
        {label}{optional && <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', opacity: 0.6 }}> (optional)</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${focused ? '#4F7CFF' : 'rgba(255,255,255,0.2)'}`,
          color: '#fff',
          fontSize: 14,
          padding: '6px 0',
          fontFamily: "'DM Sans','Inter',sans-serif",
          outline: 'none',
          width: '100%',
          transition: 'border-color 0.15s',
        }}
      />
    </div>
  )
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${focused ? '#4F7CFF' : 'rgba(255,255,255,0.2)'}`,
          color: '#fff',
          fontSize: 13,
          padding: '6px 0',
          fontFamily: "'DM Sans','Inter',sans-serif",
          outline: 'none',
          width: '100%',
          resize: 'vertical',
          lineHeight: 1.65,
          transition: 'border-color 0.15s',
        }}
      />
      {maxLength && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>{value.length}/{maxLength}</div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   LIVE PREVIEW — LSE FORMAT
───────────────────────────────────────────── */
function LivePreview({ f }: { f: FormData }) {
  const contactParts = [f.phone, f.email, f.linkedin, f.city].filter(Boolean)
  const hasEdu = f.college || f.degree || f.gradYear
  const hasExp = f.experience.some(e => e.company || e.role)
  const hasProj = f.projects.some(p => p.name)

  return (
    <div id="resume-print-target" style={{ fontFamily: 'Times New Roman, serif', fontSize: 10.5, lineHeight: 1.5, color: '#000', padding: '28px 32px', background: '#fff', minHeight: 800 }}>
      {/* Header */}
      {f.fullName && (
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>{f.fullName}</div>
          {contactParts.length > 0 && (
            <div style={{ fontSize: 10, color: '#333', marginTop: 4 }}>{contactParts.join(' · ')}</div>
          )}
        </div>
      )}

      {/* Education */}
      {hasEdu && (
        <>
          <div style={{ borderBottom: '1.5px solid black', marginBottom: 6, marginTop: f.fullName ? 0 : 0 }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Education</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>{f.college}</span>
              {f.gradYear && <span>Expected {f.gradYear}</span>}
            </div>
            <div>
              {[f.degree, f.cgpa && `CGPA: ${f.cgpa}`].filter(Boolean).join(' · ')}
            </div>
          </div>
        </>
      )}

      {/* Summary */}
      {f.summary && (
        <>
          <div style={{ borderBottom: '1.5px solid black', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Summary</div>
          </div>
          <div style={{ marginBottom: 12 }}>{f.summary}</div>
        </>
      )}

      {/* Experience */}
      {hasExp && (
        <>
          <div style={{ borderBottom: '1.5px solid black', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Experience</div>
          </div>
          {f.experience.map((e, i) => {
            if (!e.company && !e.role) return null
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>{e.company}</span>
                  <span>{e.duration}{e.location ? ` · ${e.location}` : ''}</span>
                </div>
                {e.role && <div style={{ fontStyle: 'italic' }}>{e.role}</div>}
                {e.bullets.filter(Boolean).map((b, j) => <div key={j}>— {b}</div>)}
              </div>
            )
          })}
        </>
      )}

      {/* Projects */}
      {hasProj && (
        <>
          <div style={{ borderBottom: '1.5px solid black', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Projects</div>
          </div>
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
        </>
      )}

      {/* Skills */}
      {f.skills && (
        <>
          <div style={{ borderBottom: '1.5px solid black', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Skills</div>
          </div>
          <div style={{ marginBottom: f.languages ? 10 : 0 }}>{f.skills}</div>
        </>
      )}

      {/* Languages */}
      {f.languages && (
        <>
          {!f.skills && (
            <div style={{ borderBottom: '1.5px solid black', marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Languages</div>
            </div>
          )}
          <div><span style={{ fontWeight: 'bold' }}>Languages:</span> {f.languages}</div>
        </>
      )}

      {/* Empty state */}
      {!f.fullName && !hasEdu && !hasExp && !hasProj && !f.skills && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
          Your resume will appear here as you type →
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function ResumeBuilderPage() {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM)
  const [showPopup, setShowPopup] = useState(false)
  const [copied, setCopied] = useState(false)

  const setField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const setExpField = (idx: number, key: keyof ExpBlock, value: string) => {
    setForm(prev => {
      const exp = prev.experience.map((e, i) => i === idx ? { ...e, [key]: value } : e)
      return { ...prev, experience: exp }
    })
  }

  const setExpBullet = (idx: number, bIdx: number, value: string) => {
    setForm(prev => {
      const exp = prev.experience.map((e, i) => {
        if (i !== idx) return e
        const bullets = [...e.bullets] as [string, string, string, string]
        bullets[bIdx] = value
        return { ...e, bullets }
      })
      return { ...prev, experience: exp }
    })
  }

  const addExp = () => {
    if (form.experience.length >= 3) return
    setForm(prev => ({ ...prev, experience: [...prev.experience, { ...EMPTY_EXP, bullets: ['', '', '', ''] as [string, string, string, string] }] }))
  }

  const removeExp = (idx: number) => {
    setForm(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }))
  }

  const setProjField = (idx: number, key: keyof ProjectBlock, value: string) => {
    setForm(prev => {
      const projects = prev.projects.map((p, i) => i === idx ? { ...p, [key]: value } : p)
      return { ...prev, projects }
    })
  }

  const setProjBullet = (idx: number, bIdx: number, value: string) => {
    setForm(prev => {
      const projects = prev.projects.map((p, i) => {
        if (i !== idx) return p
        const bullets = [...p.bullets] as [string, string]
        bullets[bIdx] = value
        return { ...p, bullets }
      })
      return { ...prev, projects }
    })
  }

  const addProject = () => {
    if (form.projects.length >= 2) return
    setForm(prev => ({ ...prev, projects: [...prev.projects, { ...EMPTY_PROJECT, bullets: ['', ''] as [string, string] }] }))
  }

  const removeProject = (idx: number) => {
    setForm(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }))
  }

  const handleDownload = () => {
    window.print()
  }

  const handleCopy = () => {
    const text = buildPlainText(form)
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    if (window.confirm('Reset all fields? This cannot be undone.')) {
      setForm(DEFAULT_FORM)
    }
  }

  const inputStyle = {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 14,
    padding: '6px 0',
    fontFamily: "'DM Sans','Inter',sans-serif",
    outline: 'none',
    width: '100%',
  }

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}

        .form-section-title{
          font-size:11px;font-weight:800;letter-spacing:2.5px;
          text-transform:uppercase;color:rgba(255,255,255,0.3);
          margin-bottom:18px;margin-top:36px;
          display:flex;align-items:center;gap:12px;
        }
        .form-section-title:first-child{margin-top:0}
        .form-section-title::after{
          content:'';flex:1;height:1px;background:rgba(255,255,255,0.06);
        }

        .add-btn{
          display:inline-flex;align-items:center;gap:6px;
          padding:8px 16px;border-radius:8px;
          border:1px solid rgba(79,124,255,0.25);
          background:rgba(79,124,255,0.06);
          color:#93BBFF;font-size:13px;font-weight:700;
          cursor:pointer;font-family:"DM Sans",sans-serif;
          transition:all 0.15s;
        }
        .add-btn:hover{background:rgba(79,124,255,0.14);border-color:rgba(79,124,255,0.4)}
        .add-btn:disabled{opacity:0.35;cursor:not-allowed}

        .remove-btn{
          display:inline-flex;align-items:center;gap:4px;
          padding:6px 12px;border-radius:8px;
          border:1px solid rgba(239,68,68,0.15);
          background:rgba(239,68,68,0.04);
          color:rgba(239,68,68,0.5);font-size:12px;font-weight:600;
          cursor:pointer;font-family:"DM Sans",sans-serif;
          transition:all 0.15s;
        }
        .remove-btn:hover{background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.35);color:#f87171}

        .exp-block{
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px;
          padding:20px 20px 16px;
          margin-bottom:16px;
        }

        .sticky-actions{
          position:sticky;bottom:0;
          background:rgba(11,11,15,0.97);
          backdrop-filter:blur(12px);
          border-top:1px solid rgba(255,255,255,0.07);
          padding:14px 24px;
          display:flex;gap:8px;
        }
        .action-btn{
          display:inline-flex;align-items:center;justify-content:center;gap:6px;
          padding:10px 18px;border-radius:10px;
          font-size:13px;font-weight:700;
          font-family:"DM Sans",sans-serif;
          cursor:pointer;transition:all 0.15s;
          flex:1;
        }
        .action-btn-dl{
          background:linear-gradient(135deg,#4F7CFF,#7B61FF);
          color:#fff;border:none;
          box-shadow:0 2px 12px rgba(79,124,255,0.3);
        }
        .action-btn-dl:hover{opacity:0.9}
        .action-btn-copy{
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.12);
          color:rgba(255,255,255,0.75);
        }
        .action-btn-copy:hover{background:rgba(255,255,255,0.09)}
        .action-btn-reset{
          background:rgba(239,68,68,0.06);
          border:1px solid rgba(239,68,68,0.15);
          color:rgba(239,68,68,0.6);
        }
        .action-btn-reset:hover{background:rgba(239,68,68,0.12);color:#f87171;border-color:rgba(239,68,68,0.35)}

        @media(max-width:860px){
          .builder-layout{flex-direction:column !important}
          .form-panel{width:100% !important;max-height:none !important;overflow-y:visible !important}
          .preview-panel{width:100% !important;border-left:none !important;border-top:1px solid rgba(255,255,255,0.07) !important}
          .sticky-actions{position:static}
        }

        @media print {
          body > *:not(#resume-print-target){display:none !important}
          #resume-print-target{display:block !important;width:100%}
          @page{size:A4;margin:15mm}
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

      {/* STICKY TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5, flexShrink: 0 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>Resume Builder — Free</span>
        <a href="/resources/resume-templates" style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          All Templates →
        </a>
      </div>

      {/* BUILDER LAYOUT */}
      <div className="builder-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 52px)' }}>

        {/* LEFT: FORM */}
        <div className="form-panel" style={{ width: '45%', overflowY: 'auto', maxHeight: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 52, height: 'calc(100vh - 52px)' }}>
          <div style={{ padding: '32px 24px 0', flex: 1 }}>

            {/* Personal Details */}
            <div className="form-section-title">Personal Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Full Name" value={form.fullName} onChange={v => setField('fullName', v)} placeholder="Rahul Mehta" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="College Name" value={form.college} onChange={v => setField('college', v)} placeholder="[Your College], Delhi" />
              </div>
              <Field label="Degree" value={form.degree} onChange={v => setField('degree', v)} placeholder="BBA (Honours)" />
              <Field label="Graduation Year" value={form.gradYear} onChange={v => setField('gradYear', v)} placeholder="2025" />
              <Field label="CGPA" value={form.cgpa} onChange={v => setField('cgpa', v)} placeholder="8.1" optional />
              <Field label="City" value={form.city} onChange={v => setField('city', v)} placeholder="Delhi" />
              <Field label="Phone" value={form.phone} onChange={v => setField('phone', v)} placeholder="+91 98XXX XXXXX" />
              <Field label="Email" value={form.email} onChange={v => setField('email', v)} placeholder="you@email.com" type="email" />
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="LinkedIn URL" value={form.linkedin} onChange={v => setField('linkedin', v)} placeholder="linkedin.com/in/yourname" optional />
              </div>
            </div>

            {/* Summary */}
            <div className="form-section-title" style={{ marginTop: 32 }}>Summary <span style={{ fontSize: 10, fontWeight: 400, letterSpacing: 0, textTransform: 'none', opacity: 0.5 }}>(optional)</span></div>
            <TextareaField
              label="Professional Summary"
              value={form.summary}
              onChange={v => setField('summary', v)}
              placeholder="2–3 sentence overview of your background, strengths, and what you're looking for."
              rows={4}
              maxLength={300}
            />

            {/* Experience */}
            <div className="form-section-title" style={{ marginTop: 32 }}>Experience</div>
            {form.experience.map((exp, i) => (
              <div key={i} className="exp-block">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>Experience {i + 1}</span>
                  {form.experience.length > 1 && (
                    <button className="remove-btn" onClick={() => removeExp(i)}>Remove</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Field label="Company" value={exp.company} onChange={v => setExpField(i, 'company', v)} placeholder="Bloom D2C Startup" />
                  </div>
                  <Field label="Role" value={exp.role} onChange={v => setExpField(i, 'role', v)} placeholder="Business Development Intern" />
                  <Field label="Duration" value={exp.duration} onChange={v => setExpField(i, 'duration', v)} placeholder="Jun 2024 – Aug 2024" />
                  <Field label="Location" value={exp.location} onChange={v => setExpField(i, 'location', v)} placeholder="Mumbai" optional />
                </div>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {([0, 1, 2, 3] as const).map(bIdx => (
                    <TextareaField
                      key={bIdx}
                      label={`Bullet ${bIdx + 1}${bIdx >= 2 ? ' (optional)' : ''}`}
                      value={exp.bullets[bIdx]}
                      onChange={v => setExpBullet(i, bIdx, v)}
                      placeholder="What you did + result with numbers"
                      rows={2}
                    />
                  ))}
                </div>
              </div>
            ))}
            {form.experience.length < 3 && (
              <button className="add-btn" onClick={addExp}>+ Add Experience</button>
            )}

            {/* Projects */}
            <div className="form-section-title" style={{ marginTop: 32 }}>Projects</div>
            {form.projects.map((proj, i) => (
              <div key={i} className="exp-block">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>Project {i + 1}</span>
                  {form.projects.length > 1 && (
                    <button className="remove-btn" onClick={() => removeProject(i)}>Remove</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                  <Field label="Project Name" value={proj.name} onChange={v => setProjField(i, 'name', v)} placeholder="Competitive Analysis — EdTech Sector" />
                  <Field label="Context" value={proj.context} onChange={v => setProjField(i, 'context', v)} placeholder="College Strategy Course" optional />
                </div>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {([0, 1] as const).map(bIdx => (
                    <TextareaField
                      key={bIdx}
                      label={`Bullet ${bIdx + 1}`}
                      value={proj.bullets[bIdx]}
                      onChange={v => setProjBullet(i, bIdx, v)}
                      placeholder="What you did + result with numbers"
                      rows={2}
                    />
                  ))}
                </div>
              </div>
            ))}
            {form.projects.length < 2 && (
              <button className="add-btn" onClick={addProject}>+ Add Project</button>
            )}

            {/* Skills & Languages */}
            <div className="form-section-title" style={{ marginTop: 32 }}>Skills &amp; Languages</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field
                label="Skills & Tools"
                value={form.skills}
                onChange={v => setField('skills', v)}
                placeholder="MS Excel, PowerPoint, Canva, Google Analytics, Notion"
              />
              <Field
                label="Languages"
                value={form.languages}
                onChange={v => setField('languages', v)}
                placeholder="English (Fluent), Hindi (Native)"
              />
            </div>

            <div style={{ height: 32 }} />
          </div>

          {/* Sticky action buttons */}
          <div className="sticky-actions">
            <button className="action-btn action-btn-dl" onClick={handleDownload}>
              Download PDF
            </button>
            <button className={`action-btn action-btn-copy${copied ? ' copied' : ''}`} onClick={handleCopy} style={{ background: copied ? 'rgba(16,185,129,0.12)' : undefined, borderColor: copied ? 'rgba(16,185,129,0.3)' : undefined, color: copied ? '#6ee7b7' : undefined }}>
              {copied ? 'Copied ✓' : 'Copy Text'}
            </button>
            <button className="action-btn action-btn-reset" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="preview-panel" style={{ width: '55%', borderLeft: '1px solid rgba(255,255,255,0.07)', overflowY: 'auto', maxHeight: 'calc(100vh - 52px)', background: '#1a1a24', display: 'flex', flexDirection: 'column', position: 'sticky', top: 52, height: 'calc(100vh - 52px)' }}>
          {/* Preview header */}
          <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Live Preview — LSE Format</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>Updates as you type</span>
          </div>

          {/* Preview content */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <div style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.4)', borderRadius: 4, overflow: 'hidden' }}>
              <LivePreview f={form} />
            </div>
          </div>

          {/* Upgrade prompt */}
          <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <div style={{ background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.15)', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                Want 5 more formats?
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {['IIM', 'DU', 'Startup', 'Finance', 'Marketing'].map(label => (
                  <span key={label} style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.2)', color: '#93BBFF', fontSize: 11, fontWeight: 700 }}>{label}</span>
                ))}
              </div>
              <button
                onClick={() => setShowPopup(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 2px 12px rgba(79,124,255,0.3)' }}
              >
                Unlock All Templates — ₹199 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
