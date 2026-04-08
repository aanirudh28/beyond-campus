'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const processingMessages = [
  'Reading your resume...',
  'Scanning for action verbs...',
  "Counting how many times you said 'responsible for'...",
  'Checking if your bullets have numbers...',
  'Assessing the damage...',
  'Finding the good parts (there are some)...',
  'Calculating your ATS score...',
  'Writing your personalized roast...',
  'Almost done — brace yourself...',
  'Preparing your results...',
]

type Tone = 'normal' | 'savage' | 'recruiter'

export default function ResumeRoastPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tone, setTone] = useState<Tone>('savage')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const [msgVisible, setMsgVisible] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Progress bar animation
  useEffect(() => {
    if (!processing) return
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) { clearInterval(interval); return 95 }
        return p + (95 - p) * 0.025
      })
    }, 200)
    return () => clearInterval(interval)
  }, [processing])

  // Rotating messages
  useEffect(() => {
    if (!processing) return
    const interval = setInterval(() => {
      setMsgVisible(false)
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % processingMessages.length)
        setMsgVisible(true)
      }, 300)
    }, 1500)
    return () => clearInterval(interval)
  }, [processing])

  const handleFile = (f: File) => {
    setError(null)
    if (f.type !== 'application/pdf') { setError('Only PDF files accepted.'); return }
    if (f.size > 5 * 1024 * 1024) { setError('File too large. Max 5MB.'); return }
    setFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)

  const handleSubmit = async () => {
    if (!file) return
    setError(null)
    setProcessing(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('tone', tone)
      const res = await fetch('/api/resume-roast', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setProcessing(false); return }
      setProgress(100)
      setTimeout(() => router.push(`/resources/resume-roast/results/${data.id}`), 400)
    } catch {
      setError('Network error. Please try again.')
      setProcessing(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  if (processing) {
    return (
      <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Inter',sans-serif", padding: '24px' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
          .fire-pulse{animation:pulse 1.5s ease-in-out infinite}
          .msg-fade{transition:opacity 0.3s ease}
        `}</style>
        <div className="fire-pulse" style={{ fontSize: 72, marginBottom: 32 }}>🔥</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8, textAlign: 'center' }}>Roasting your resume...</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 40 }}>This takes about 20–30 seconds</p>
        <div style={{ width: '100%', maxWidth: 440, marginBottom: 32 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#ef4444,#dc2626)', borderRadius: 100, width: `${progress}%`, transition: 'width 0.3s ease' }} />
          </div>
        </div>
        <p className="msg-fade" style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', textAlign: 'center', opacity: msgVisible ? 1 : 0, minHeight: 24 }}>
          {processingMessages[msgIndex]}
        </p>
      </main>
    )
  }

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        .tone-card{background:#111827;border:1.5px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;cursor:pointer;transition:all 0.2s;flex:1;min-width:0}
        .tone-card:hover{border-color:rgba(239,68,68,0.35);background:rgba(239,68,68,0.04)}
        .tone-card.selected{border:2px solid #ef4444;background:rgba(239,68,68,0.08)}
        .upload-zone{background:#111827;border:2px dashed rgba(239,68,68,0.3);border-radius:20px;padding:60px 32px;min-height:200px;cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10}
        .upload-zone:hover,.upload-zone.drag-over{border-color:#ef4444;background:rgba(239,68,68,0.05)}
        .submit-btn{width:100%;height:56px;background:linear-gradient(135deg,#ef4444,#dc2626);border:none;border-radius:100px;font-size:18px;font-weight:800;color:white;cursor:pointer;transition:opacity 0.2s;font-family:'DM Sans',sans-serif}
        .submit-btn:disabled{opacity:0.4;cursor:not-allowed}
        .submit-btn:not(:disabled):hover{opacity:0.9}
        .what-card{background:#111827;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:24px}
        @media(max-width:640px){
          .tone-row{flex-direction:column!important}
          .what-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <a href="/free" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← All Resources
        </a>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 100px' }}>

        {/* HERO */}
        <div style={{ padding: '64px 0 48px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>
            RESUME ROAST 🔥
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 18, color: 'white' }}>
            Find out why you&apos;re getting rejected —<br />
            <span style={{ color: '#ef4444' }}>before a recruiter does</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            Upload your resume. Get brutally honest feedback. Fix it in an hour.
          </p>
        </div>

        {/* TONE SELECTOR */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 12 }}>Choose Your Tone</div>
          <div className="tone-row" style={{ display: 'flex', gap: 12 }}>
            {([
              { key: 'normal' as Tone, emoji: '😐', label: 'Normal', desc: 'Honest. Direct. Constructive.', sub: 'Good starting point' },
              { key: 'savage' as Tone, emoji: '🔥', label: 'Savage', desc: 'No filter. Might hurt.', sub: 'For the brave', badge: 'Most Popular' },
              { key: 'recruiter' as Tone, emoji: '💼', label: 'Recruiter', desc: 'Cold. Corporate. Realistic.', sub: 'What they actually think' },
            ] as const).map(t => (
              <div key={t.key} className={`tone-card${tone === t.key ? ' selected' : ''}`} onClick={() => setTone(t.key)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{t.emoji}</span>
                  {'badge' in t && t.badge && (
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 100, background: '#ef4444', color: 'white', letterSpacing: 0.5 }}>{t.badge}</span>
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{t.desc}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{t.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* UPLOAD ZONE */}
        <div style={{ marginBottom: 20 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <div
            className={`upload-zone${dragOver ? ' drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            {file ? (
              <>
                <div style={{ fontSize: 40 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{file.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{formatSize(file.size)}</div>
                <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Change file</span>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48 }}>🔥</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Drop your PDF here</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>or click to browse</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>PDF only · Max 5MB</div>
              </>
            )}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 14, fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* SUBMIT */}
        <button className="submit-btn" disabled={!file} onClick={handleSubmit}>
          Roast My Resume 🔥
        </button>

        {/* SOCIAL PROOF */}
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
          3,200+ resumes roasted · Average score: 51/100 · Most common mistake: No metrics
        </div>

        {/* WHAT YOU GET */}
        <div style={{ marginTop: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 8 }}>What You&apos;ll Get</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>A complete teardown of your resume</div>
          </div>
          <div className="what-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { icon: '🎯', title: 'Overall Score', desc: '0–100 score with grade and verdict' },
              { icon: '🔥', title: 'Roast Summary', desc: 'Brutally honest 3-sentence summary' },
              { icon: '🛠️', title: 'Section Breakdown', desc: 'Education, Experience, Projects, Skills scored individually' },
              { icon: '✍️', title: 'Rewritten Bullets', desc: 'Your worst bullets rewritten the right way' },
              { icon: '🤖', title: 'ATS Analysis', desc: 'What applicant tracking systems see' },
              { icon: '💼', title: 'Recruiter Perception', desc: 'What they think in the first 6 seconds' },
            ].map(w => (
              <div key={w.title} className="what-card">
                <div style={{ fontSize: 24, marginBottom: 10 }}>{w.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{w.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BUILDER LINK */}
        <div style={{ marginTop: 40, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          Don&apos;t have a resume yet?{' '}
          <a href="/resources/resume-builder" style={{ color: '#93BBFF', fontWeight: 700 }}>Build one free →</a>
        </div>

      </div>
    </main>
  )
}
