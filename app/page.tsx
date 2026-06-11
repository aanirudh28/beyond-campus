'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LeadCapturePopup from './components/LeadCapturePopup'
import { track } from '@/lib/analytics'

// Feature flag — flip to true when Mission Control / Phase 1B is ready to ship
const SHOW_COMMUNITY = false

const COMPANY_LOGOS = [
  { name: 'BCG',           src: '/logos/bcg.svg',          h: 22 },
  { name: 'Bain & Company',src: '/logos/bain.svg',         h: 14 },
  { name: 'Deloitte',      src: '/logos/Deloitte.png',     h: 22 },
  { name: 'EY',            src: '/logos/EY.png',           h: 22 },
  { name: 'Citi',          src: '/logos/citi.svg',         h: 18 },
  { name: 'Aon',           src: '/logos/aon.svg',          h: 16 },
  { name: 'Razorpay',      src: '/logos/razorpay.svg',     h: 16 },
  { name: 'Zomato',        src: '/logos/zomato.svg',       h: 14 },
  { name: 'Blinkit',       src: '/logos/blinkit.svg',      h: 22 },
  { name: 'Urban Company', src: '/logos/urbancompany.png', h: 22 },
]

const TRUST_ITEMS = ['Personalized Mentorship', 'Weekly Accountability', 'Resume & LinkedIn Reviews', 'Internship & Placement Support']

const TrustStrip = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px', justifyContent: 'center', marginTop: 20 }}>
    {TRUST_ITEMS.map((item, i) => (
      <span key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {i > 0 && <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>}
        {item}
      </span>
    ))}
  </div>
)

// Editorial section header — ledger number + rule + mono label
const Ledger = ({ no, label }: { no: string; label: string }) => (
  <div data-reveal style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 40 }}>
    <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 13, fontWeight: 500, color: '#4F7CFF', letterSpacing: 1 }}>{no}</span>
    <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(79,124,255,0.4), rgba(255,255,255,0.06))' }} />
    <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.38)', letterSpacing: 3, textTransform: 'uppercase' }}>{label}</span>
  </div>
)

// Scroll spine — a gradient line that weaves down the page and draws itself in
// as you scroll, with a glowing dot riding the tip. Sits behind all content.
const ScrollSpine = () => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [geom, setGeom] = useState<{ d: string; w: number; h: number } | null>(null)

  // Build the winding path from the container's real pixel size (re-runs on resize)
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const measure = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!w || !h) return
      const segs = Math.max(6, Math.round(h / 950))
      const step = h / segs
      const reach = Math.min(w * 0.33, 430)
      const cx = w / 2
      let x = cx
      let d = `M ${x.toFixed(1)} 0`
      for (let i = 1; i <= segs; i++) {
        const nx = i === segs ? cx : cx + (i % 2 ? reach : -reach)
        const y0 = (i - 1) * step
        const y1 = i * step
        d += ` C ${x.toFixed(1)} ${(y0 + step * 0.55).toFixed(1)} ${nx.toFixed(1)} ${(y1 - step * 0.55).toFixed(1)} ${nx.toFixed(1)} ${y1.toFixed(1)}`
        x = nx
      }
      setGeom({ d, w, h })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // Drive the line + dot from scroll position — direct style writes, rAF-throttled
  useEffect(() => {
    const wrap = wrapRef.current
    const path = pathRef.current
    if (!wrap || !path || !geom) return
    const glow = glowRef.current
    const total = path.getTotalLength()
    path.style.strokeDasharray = `${total}`
    path.style.visibility = 'visible'
    if (glow) { glow.style.strokeDasharray = `${total}`; glow.style.visibility = 'visible' }
    let raf = 0
    const update = () => {
      raf = 0
      const rect = wrap.getBoundingClientRect()
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.72 - rect.top) / rect.height))
      const offset = total * (1 - progress)
      path.style.strokeDashoffset = `${offset}`
      if (glow) glow.style.strokeDashoffset = `${offset}`
      const dot = dotRef.current
      if (dot) {
        const pt = path.getPointAtLength(total * progress)
        dot.style.transform = `translate(${pt.x - 8}px, ${pt.y - 8}px)`
        dot.style.opacity = progress > 0.004 && progress < 0.996 ? '1' : '0'
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [geom])

  return (
    <div ref={wrapRef} className="spine-wrap" aria-hidden="true">
      {geom && (
        <>
          <svg width={geom.w} height={geom.h} viewBox={`0 0 ${geom.w} ${geom.h}`} style={{ position: 'absolute', inset: 0, display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id="spineGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={geom.h}>
                <stop offset="0%" stopColor="#4F7CFF" />
                <stop offset="40%" stopColor="#7B61FF" />
                <stop offset="70%" stopColor="#4F7CFF" />
                <stop offset="100%" stopColor="#93BBFF" />
              </linearGradient>
            </defs>
            <path d={geom.d} stroke="rgba(255,255,255,0.045)" strokeWidth="1.5" fill="none" />
            <path ref={glowRef} d={geom.d} stroke="url(#spineGrad)" strokeWidth="7" fill="none" opacity="0.18" style={{ filter: 'blur(5px)', visibility: 'hidden' }} />
            <path ref={pathRef} d={geom.d} stroke="url(#spineGrad)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" style={{ visibility: 'hidden' }} />
          </svg>
          <div ref={dotRef} className="spine-dot" />
        </>
      )}
    </div>
  )
}

// Count-up stat — animates from 0 when scrolled into view
const Stat = ({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    const num = numRef.current
    if (!el || !num) return
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const dur = 1400
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur)
        num.textContent = `${Math.round(value * (1 - Math.pow(1 - p, 3)))}`
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])
  return (
    <div ref={ref} data-reveal style={{ transitionDelay: `${delay}s` }}>
      <div className="stat-num" style={{ color: '#4F7CFF', marginBottom: 8 }}><span ref={numRef}>0</span>{suffix}</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{label}</div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const resourcesCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false)
  const [popupPreselect, setPopupPreselect] = useState<string | null>(null)
  const openPopup = (cohort?: string, source?: string) => {
    track('lead_popup_open', { preselect: cohort || 'none', source: source || 'unknown' })
    setPopupPreselect(cohort || null)
    setPopupOpen(true)
  }

  // GA click helper — every CTA reports what and where
  const cta = (name: string, location: string) => () => track('cta_click', { cta: name, location })

  // Hero roast widget state
  const roastInputRef = useRef<HTMLInputElement>(null)
  const [roastFile, setRoastFile] = useState<File | null>(null)
  const [roastEmail, setRoastEmail] = useState('')
  const [roastDrag, setRoastDrag] = useState(false)
  const [roastBusy, setRoastBusy] = useState(false)
  const [roastError, setRoastError] = useState<string | null>(null)

  const handleRoastFile = (f: File) => {
    setRoastError(null)
    if (f.type !== 'application/pdf') { setRoastError('Only PDF files accepted.'); return }
    if (f.size > 5 * 1024 * 1024) { setRoastError('File too large. Max 5MB.'); return }
    setRoastFile(f)
    track('roast_file_selected', { location: 'hero' })
  }

  const submitRoast = async () => {
    if (!roastFile || !roastEmail.trim() || roastBusy) return
    setRoastError(null)
    setRoastBusy(true)
    track('roast_submit', { location: 'hero' })
    try {
      const fd = new FormData()
      fd.append('file', roastFile)
      fd.append('tone', 'savage')
      fd.append('email', roastEmail.trim().toLowerCase())
      const res = await fetch('/api/resume-roast', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        track('roast_error', { location: 'hero', message: data.error })
        setRoastError(data.error || 'Something went wrong')
        setRoastBusy(false)
        return
      }
      track('roast_success', { location: 'hero' })
      router.push(`/resources/resume-roast/results/${data.id}`)
    } catch {
      setRoastError('Network error. Please try again.')
      setRoastBusy(false)
    }
  }

  const FAQS = [
    { q: 'Is this a recorded course or live sessions?', a: 'Everything is live — no pre-recorded lectures. The 1:1 session is a live video call you schedule at your convenience. The cohort has weekly live sessions with your mentor.' },
    { q: "I'm from a tier-2 or tier-3 college. Will this actually work for me?", a: "Most of our students are from tier-2 and tier-3 colleges. Off-campus hiring is about strategy, not your college name. The tactics we teach are built specifically for students who don't get recruiters walking onto campus." },
    { q: 'What kind of roles do your students get placed in?', a: "Consulting and finance are the most common. We also see a lot of placements in Founder's Office roles at startups, and in marketing, operations, and BD at fast-growing companies." },
    { q: 'How long will it take to see results?', a: 'Most students get their first meaningful signal — a reply, a LinkedIn intro, or an interview call — within two weeks. By week four, most have at least one active conversation going.' },
    { q: 'How much does it cost?', a: 'The 1:1 strategy session is ₹549. The Placement Cohort is ₹2,500. Both come with personalized guidance — the session is a single focused call, the cohort is an extended program with weekly accountability.' },
    { q: 'How is this different from watching YouTube videos or buying a course?', a: "Personalization and accountability. We review your resume, build your specific target list, and stay with you until something moves. No generic content." },
    { q: 'What if I\'ve been scammed by a placement program before?', a: "That's a fair concern — there are a lot of programs that over-promise. We keep all our free resources fully open so you can see exactly how we think before spending anything. If you want a low-commitment way to test us, start with the ₹549 strategy session — one focused call, then you decide." },
    { q: 'Is my payment secure?', a: "Yes — payments go through Razorpay. We never store card details." },
  ]

  // OAuth rescue: if Supabase falls back to the Site URL, the login code lands
  // here as /?code=... — forward it to the callback so the session completes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('code')) {
      window.location.replace(`/auth/callback${window.location.search}`)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll depth — fires once per threshold per pageview
  useEffect(() => {
    const fired = new Set<number>()
    const onScroll = () => {
      const doc = document.documentElement
      const depth = ((doc.scrollTop + window.innerHeight) / doc.scrollHeight) * 100
      for (const mark of [25, 50, 75, 100]) {
        if (depth >= mark && !fired.has(mark)) {
          fired.add(mark)
          track('scroll_depth', { percent: mark })
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Exit intent — desktop only, once per session
  useEffect(() => {
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 8 && !e.relatedTarget && !sessionStorage.getItem('bc_exit_shown')) {
        sessionStorage.setItem('bc_exit_shown', '1')
        track('exit_intent_popup')
        setPopupPreselect(null)
        setPopupOpen(true)
      }
    }
    document.addEventListener('mouseout', onMouseOut)
    return () => document.removeEventListener('mouseout', onMouseOut)
  }, [])

  // One observer powers every [data-reveal] element on the page
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: "var(--font-dm-sans), 'Inter', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue: #4F7CFF; --purple: #7B61FF; --bg: #0B0B0F; --bg2: #111827;
          --muted: rgba(255,255,255,0.5);
          --serif: var(--font-dm-serif), 'DM Serif Display', serif;
          --mono: var(--font-geist-mono), monospace;
        }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }
        ::selection { background: rgba(79,124,255,0.4); }

        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.55);opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes underline-in { from { transform: scaleX(0); } to { transform: scaleX(1); } }

        /* Scroll reveal — one class, staggered with inline transition-delay */
        [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity 0.7s cubic-bezier(0.2,0.6,0.2,1), transform 0.7s cubic-bezier(0.2,0.6,0.2,1); }
        [data-reveal].in { opacity: 1; transform: translateY(0); }

        .pulse-dot { width:7px; height:7px; border-radius:50%; background:#4F7CFF; flex-shrink:0; display:inline-block; animation:pulse-dot 2s ease-in-out infinite; }

        .hero-headline { font-family: var(--serif); font-size: clamp(46px, 7.6vw, 96px); line-height: 1.02; letter-spacing: -2.5px; font-weight: 400; }
        .hero-em { font-style: italic; color: #93BBFF; position: relative; white-space: nowrap; }
        .hero-em::after { content:''; position:absolute; left:2%; right:2%; bottom:6%; height:clamp(8px,1.2vw,16px); background:linear-gradient(90deg, rgba(79,124,255,0.32), rgba(123,97,255,0.32)); z-index:-1; transform-origin:left; animation:underline-in 0.9s 0.5s cubic-bezier(0.2,0.6,0.2,1) both; }

        .watermark { position:absolute; left:50%; transform:translateX(-50%); bottom:-1vw; font-family:var(--serif); font-size:clamp(80px,15vw,220px); line-height:1; letter-spacing:4px; color:transparent; -webkit-text-stroke:1px rgba(79,124,255,0.07); user-select:none; pointer-events:none; white-space:nowrap; }

        .mono-label { font-family: var(--mono); font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.38); }
        .section-title { font-family: var(--serif); font-size: clamp(30px, 4.2vw, 50px); line-height: 1.08; letter-spacing: -1px; }
        .section-title em { font-style: italic; color: #93BBFF; }

        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 16px 32px; border-radius: 100px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); color: white; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; box-shadow: 0 0 30px rgba(79,124,255,0.35); position: relative; overflow: hidden; }
        .btn-primary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#7B61FF,#4F7CFF); opacity:0; transition:opacity 0.3s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(79,124,255,0.55); }
        .btn-primary:hover::before { opacity:1; }
        .btn-primary span { position:relative; z-index:1; }
        .btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 15px 32px; border-radius: 100px; background: transparent; color: white; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; border: 1.5px solid rgba(255,255,255,0.2); }
        .btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); transform: translateY(-2px); }

        .roast-widget { width:100%; max-width:560px; background:rgba(17,24,39,0.85); border:1px solid rgba(239,68,68,0.25); border-radius:24px; padding:22px; backdrop-filter:blur(8px); box-shadow:0 24px 80px rgba(0,0,0,0.4); text-align:left; position:relative; }
        .roast-exhibit { position:absolute; top:-11px; left:24px; padding:3px 12px; background:#0B0B0F; border:1px solid rgba(239,68,68,0.4); border-radius:100px; font-family:var(--mono); font-size:10px; letter-spacing:2.5px; color:#f87171; font-weight:500; }
        .roast-drop { border:2px dashed rgba(239,68,68,0.35); border-radius:16px; padding:26px 20px; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:6px; }
        .roast-drop:hover, .roast-drop.drag-over { border-color:#ef4444; background:rgba(239,68,68,0.06); }
        .roast-input { width:100%; padding:13px 16px; border-radius:12px; background:#0B0B0F; border:1.5px solid rgba(255,255,255,0.1); color:white; font-size:14px; outline:none; font-family:inherit; transition:border-color 0.2s; }
        .roast-input:focus { border-color:rgba(239,68,68,0.45); }
        .roast-submit { width:100%; padding:15px; border-radius:100px; background:linear-gradient(135deg,#ef4444,#dc2626); border:none; color:white; font-size:16px; font-weight:800; cursor:pointer; font-family:inherit; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; gap:9px; }
        .roast-submit:disabled { opacity:0.45; cursor:not-allowed; }
        .roast-submit:not(:disabled):hover { opacity:0.9; }

        .ticker-wrap { overflow: hidden; }
        .ticker { display: flex; width: max-content; animation: ticker 32s linear infinite; }
        .ticker-item { white-space: nowrap; padding: 0 40px; font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.55); display: flex; align-items: center; gap: 12px; font-family: var(--mono); }

        .math-row { display:grid; grid-template-columns: minmax(150px, 280px) 1fr; gap: 28px; align-items: baseline; padding: 30px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .math-num { font-family: var(--serif); font-size: clamp(44px, 6vw, 76px); line-height: 0.95; letter-spacing: -2px; color: white; }
        .math-num small { font-size: 0.45em; color: rgba(255,255,255,0.4); letter-spacing: 0; }
        @media(max-width: 560px) { .math-row { grid-template-columns: 1fr; gap: 8px; padding: 24px 0; } }

        .panel { border-radius: 24px; padding: 36px 32px; position: relative; }
        .panel-today { background: linear-gradient(180deg, rgba(239,68,68,0.07), rgba(239,68,68,0.015)); border: 1px solid rgba(239,68,68,0.18); }
        .panel-after { background: linear-gradient(180deg, rgba(79,124,255,0.1), rgba(123,97,255,0.025)); border: 1px solid rgba(79,124,255,0.32); box-shadow: 0 0 60px rgba(79,124,255,0.08); }

        .tool-card { background:#111827; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:36px 32px; display:flex; flex-direction:column; transition:all 0.35s; position:relative; overflow:hidden; }
        .tool-card::after { content:attr(data-index); position:absolute; right:18px; bottom:2px; font-family:var(--serif); font-size:96px; line-height:1; color:rgba(79,124,255,0.06); pointer-events:none; }
        .tool-card:hover { transform:translateY(-6px); border-color:rgba(79,124,255,0.45); box-shadow:0 24px 64px rgba(79,124,255,0.16); }
        .tool-cta { display:inline-flex; align-items:center; gap:8px; font-size:14px; font-weight:700; color:#93BBFF; margin-top:auto; transition:gap 0.2s; position:relative; z-index:1; }
        .tool-card:hover .tool-cta { gap:12px; }

        .proof-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; transition: all 0.3s; }
        .proof-card:hover { border-color: rgba(79,124,255,0.3); transform: translateY(-4px); }
        .stat-num { font-family: var(--serif); font-size: clamp(48px, 6vw, 72px); line-height: 1; letter-spacing: -2px; }

        .product-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 40px; transition: all 0.4s; position: relative; overflow: hidden; }
        .product-card:hover { border-color: rgba(79,124,255,0.4); transform: translateY(-8px); box-shadow: 0 30px 80px rgba(79,124,255,0.15); }
        .ladder { display:inline-flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:10px 14px; padding:12px 24px; background:rgba(79,124,255,0.07); border:1px solid rgba(79,124,255,0.2); border-radius:100px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.85); }

        .comp-table { width:100%; border-collapse:separate; border-spacing:0; }
        .comp-table th, .comp-table td { padding:18px 16px; font-size:14px; vertical-align:middle; }
        .comp-table .ct-corner { width:26%; background:transparent; border-bottom:1px solid rgba(255,255,255,0.08); }
        .comp-table .ct-label { text-align:left; color:rgba(255,255,255,0.9); font-weight:600; padding-left:24px; padding-right:8px; border-bottom:1px solid rgba(255,255,255,0.05); }
        .comp-table .ct-head { padding:36px 16px 24px; vertical-align:bottom; text-align:center; position:relative; border-bottom:1px solid rgba(255,255,255,0.1); }
        .comp-table .ct-head-other { background:rgba(255,255,255,0.015); }
        .comp-table .ct-head-bc { background:linear-gradient(180deg, rgba(79,124,255,0.22), rgba(79,124,255,0.06)); position:relative; }
        .comp-table .ct-head-bc::after { content:''; position:absolute; left:0; right:0; bottom:-1px; height:2px; background:#4F7CFF; }
        .comp-table .ct-bc-badge { position:absolute; top:0; left:50%; transform:translateX(-50%); padding:5px 18px; background:#4F7CFF; border-radius:0 0 12px 12px; font-size:10px; font-weight:800; letter-spacing:1.5px; color:white; white-space:nowrap; }
        .comp-table .ct-cell { text-align:center; border-bottom:1px solid rgba(255,255,255,0.05); }
        .comp-table .ct-cell-other { background:rgba(255,255,255,0.012); }
        .comp-table .ct-cell-bc { background:rgba(79,124,255,0.05); }
        .comp-table tbody tr:last-child td { border-bottom:none; }

        .sticky-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: all 0.3s; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; }
        .sticky-nav.scrolled { background: rgba(11,11,15,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 14px 40px; }
        .nav-links { display: flex; align-items: center; gap: 22px; }
        @media(max-width:900px) { .nav-links .nav-hide-mobile { display: none; } }

        .logo-card { display: inline-flex; align-items: center; justify-content: center; height: 38px; padding: 0 14px; background: #fff; border-radius: 10px; border: 1px solid rgba(255,255,255,0.14); transition: transform 0.25s ease, box-shadow 0.25s ease; flex-shrink: 0; }
        .logo-card img { display: block; width: auto; max-width: 110px; object-fit: contain; filter: grayscale(1) opacity(0.6); transition: filter 0.25s ease; }
        .logo-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(79,124,255,0.22); }
        .logo-card:hover img { filter: grayscale(0) opacity(1); }
        .logo-strip { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        @media(max-width: 540px) { .logo-card { height: 32px; padding: 0 10px; } .logo-card img { max-width: 88px; } }

        .noise-overlay { position:fixed; inset:0; pointer-events:none; z-index:999; opacity:0.025; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

        /* Scroll spine — the line that follows your scroll */
        .spine-wrap { position:absolute; inset:0; z-index:0; pointer-events:none; }
        .spine-dot { position:absolute; top:0; left:0; width:16px; height:16px; border-radius:50%; opacity:0; background:radial-gradient(circle, #fff 0%, #93BBFF 35%, rgba(79,124,255,0) 70%); box-shadow:0 0 14px 3px rgba(124,156,255,0.8), 0 0 44px 14px rgba(79,124,255,0.3); transition:opacity 0.3s; will-change:transform; }
        @media(max-width:860px) { .spine-wrap { display:none; } }

        /* Hero aurora — slow drifting glow blobs */
        @keyframes aurora-drift { from { transform:translate3d(0,0,0) scale(1); } to { transform:translate3d(70px,50px,0) scale(1.18); } }
        .aurora { position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; }
        .aurora-a { width:480px; height:480px; top:-8%; left:4%; background:radial-gradient(circle, rgba(79,124,255,0.16), transparent 65%); animation:aurora-drift 16s ease-in-out infinite alternate; }
        .aurora-b { width:430px; height:430px; bottom:-6%; right:3%; background:radial-gradient(circle, rgba(123,97,255,0.14), transparent 65%); animation:aurora-drift 21s ease-in-out -7s infinite alternate-reverse; }

        /* Free-tools bento grid */
        .bento { display:grid; grid-template-columns:repeat(6, 1fr); gap:16px; }
        .bento .b3 { grid-column:span 3; }
        .bento .b2 { grid-column:span 2; }
        .bento-kicker { font-family:var(--mono); font-size:10px; font-weight:500; letter-spacing:2.5px; display:block; margin-bottom:16px; }
        @media(max-width:980px) { .bento .b3 { grid-column:span 6; } .bento .b2 { grid-column:span 3; } }
        @media(max-width:640px) { .bento .b2 { grid-column:span 6; } }

        @media (prefers-reduced-motion: reduce) {
          .spine-wrap { display:none; }
          .aurora-a, .aurora-b, .ticker { animation:none; }
        }

        .mobile-cta-bar { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 90; background: rgba(11,11,15,0.96); backdrop-filter: blur(16px); border-top: 1px solid rgba(255,255,255,0.08); padding: 10px 16px; align-items: center; justify-content: center; gap: 12px; }
        @media(max-width:768px) {
          .sticky-nav { padding: 16px 20px; }
          .sticky-nav.scrolled { padding: 12px 20px; }
          .mobile-cta-bar { display: flex !important; }
          .panel-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .panel-arrow { padding: 4px 0 !important; min-width: 0 !important; }
          .panel-arrow svg { transform: rotate(90deg); }
          .comp-table th, .comp-table td { padding: 14px 10px; font-size: 12px; }
          .comp-table .ct-label { padding-left: 14px; }
          .comp-table .ct-head { padding: 32px 10px 18px; }
        }
      `}</style>

      <div className="noise-overlay" />

      <LeadCapturePopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} preselectedCohort={popupPreselect} />

      {/* NAV — one primary action; everything else is quiet */}
      <nav className={`sticky-nav${scrollY > 40 ? ' scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 22, letterSpacing: -0.5 }}>
            Beyond<span style={{ color: 'var(--blue)' }}>Campus</span>
          </span>
          <span className="nav-hide-mobile" style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.3)' }}>EST. 2023</span>
        </div>
        <div className="nav-links">
          <div
            className="nav-hide-mobile"
            style={{ position: 'relative' }}
            onMouseEnter={() => {
              if (resourcesCloseTimer.current) clearTimeout(resourcesCloseTimer.current)
              setResourcesOpen(true)
            }}
            onMouseLeave={() => {
              resourcesCloseTimer.current = setTimeout(() => setResourcesOpen(false), 120)
            }}
          >
            <a href="/free" style={{ padding: '10px 4px', fontSize: 14, fontWeight: 600, color: resourcesOpen ? 'white' : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
              Free Tools
              <span style={{ fontSize: 10, opacity: 0.7, display: 'inline-block', transform: resourcesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
            </a>
            {resourcesOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: 8, zIndex: 200 }}>
              <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 8, minWidth: 250, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                {[
                  { href: '/resources/resume-roast', label: '🔥 Resume Roast', badge: 'FREE AI', badgeStyle: { background: '#ef4444', color: 'white' } },
                  { href: '/job-tracker', label: '🎯 Job Tracker', badge: 'NEW', badgeStyle: { background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white' } },
                  { href: '/resources/excel-interview-prep', label: '📊 Excel Interview Prep', badge: 'NEW', badgeStyle: { background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: 'white' } },
                  { href: '/resources/resume-builder', label: '📄 Resume Builder', badge: 'free', badgeStyle: { color: '#6ee7b7' } },
                  { href: '/resources/career-toolkit', label: '🛠️ Career Toolkit', badge: '15 roles', badgeStyle: { color: '#6ee7b7' } },
                  { href: '/resources/cold-email-pack', label: '✉️ Cold Email Pack', badge: '50 templates', badgeStyle: { color: '#93BBFF' } },
                  { href: '/resources/linkedin-scripts', label: '💬 LinkedIn Scripts', badge: '20 scripts', badgeStyle: { color: '#7dd3fc' } },
                ].map(item => (
                  <a key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,124,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 100, letterSpacing: 0.5, ...item.badgeStyle }}>{item.badge}</span>
                  </a>
                ))}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                <a href="/free" style={{ display: 'block', padding: '10px 12px', borderRadius: 10, textAlign: 'center', background: 'linear-gradient(135deg,rgba(79,124,255,0.15),rgba(123,97,255,0.1))', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 13, fontWeight: 700 }}>
                  See all free resources →
                </a>
              </div>
              </div>
            )}
          </div>
          {SHOW_COMMUNITY && (
            <a href="/community" className="nav-hide-mobile" style={{ padding: '10px 4px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>Community</a>
          )}
          <a href="#programs" className="nav-hide-mobile" style={{ padding: '10px 4px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>Cohorts</a>
          <a href="/dashboard" className="nav-hide-mobile" style={{ padding: '10px 4px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>Dashboard</a>
          <button onClick={() => openPopup('Strategy Session', 'nav')} className="nav-hide-mobile" style={{ padding: '10px 4px', fontSize: 14, fontWeight: 600, color: '#4F7CFF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 7 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#93BBFF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#4F7CFF')}>
            <span className="pulse-dot" />
            Lost? Let&apos;s talk →
          </button>
          <a href="/resources/resume-roast" className="btn-primary" style={{ padding: '10px 22px', fontSize: 14, fontFamily: 'inherit' }} onClick={cta('roast', 'nav')}>
            <span>🔥 Free Resume Roast</span>
          </a>
        </div>
      </nav>

      {/* Mobile sticky bottom CTA */}
      <div className="mobile-cta-bar">
        <a href="/resources/resume-roast" style={{ flex: 1, maxWidth: 280, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 20px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 14, boxShadow: '0 0 24px rgba(79,124,255,0.4)' }} onClick={cta('roast', 'mobile_bar')}>
          🔥 Free AI Resume Roast
        </a>
        <button onClick={() => openPopup('Strategy Session', 'mobile_bar')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', padding: '8px 4px', whiteSpace: 'nowrap' }}>
          or talk to us →
        </button>
      </div>

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '150px 24px 90px', position: 'relative', overflow: 'hidden' }}>
        {/* editorial glow + slow drifting aurora */}
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '90vw', maxWidth: 1100, height: 500, background: 'radial-gradient(ellipse at center, rgba(79,124,255,0.13), transparent 65%)', pointerEvents: 'none' }} />
        <div className="aurora aurora-a" />
        <div className="aurora aurora-b" />
        <div className="watermark">OFF·CAMPUS</div>

        <div style={{ maxWidth: 960, textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 18px', background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 100, fontFamily: 'var(--mono)', fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 32, letterSpacing: 0.5 }}>
            <span className="pulse-dot" />
            300+ students · 50+ colleges · fastest placement: 12 days
          </div>

          <h1 className="hero-headline" data-reveal style={{ transitionDelay: '0.08s', marginBottom: 30 }}>
            Break into <span className="hero-em">top jobs</span><br />
            without campus placements.
          </h1>

          <p data-reveal style={{ transitionDelay: '0.16s', fontSize: 19, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 44px', fontWeight: 400 }}>
            The off-campus system for non-tech students — cold email, LinkedIn, and
            targeting that actually gets replies. No placement cell. No connections. No excuses needed.
          </p>

          <div data-reveal style={{ transitionDelay: '0.24s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, marginBottom: 28 }}>
            {/* Exhibit A — the roast widget: zero clicks between impulse and action */}
            <div className="roast-widget">
              <span className="roast-exhibit">EXHIBIT A — YOUR RESUME</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, marginTop: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: '#f87171' }}>🔥 FREE AI RESUME ROAST</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>takes ~30 seconds</span>
              </div>
              <input
                ref={roastInputRef}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleRoastFile(f) }}
              />
              <div
                className={`roast-drop${roastDrag ? ' drag-over' : ''}`}
                onClick={() => roastInputRef.current?.click()}
                onDrop={e => { e.preventDefault(); setRoastDrag(false); const f = e.dataTransfer.files[0]; if (f) handleRoastFile(f) }}
                onDragOver={e => { e.preventDefault(); setRoastDrag(true) }}
                onDragLeave={() => setRoastDrag(false)}
              >
                {roastFile ? (
                  <>
                    <div style={{ fontSize: 28 }}>✅</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'white', wordBreak: 'break-all' }}>{roastFile.name}</div>
                    <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600, textDecoration: 'underline' }}>Change file</span>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 32 }}>🔥</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Drop your resume PDF here</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>or click to browse · find out why recruiters ignore it</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>PDF only · Max 5MB · no card, no commitment</div>
                  </>
                )}
              </div>
              {roastFile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  <input
                    className="roast-input"
                    type="email"
                    placeholder="you@college.edu — results land here too"
                    value={roastEmail}
                    onChange={e => setRoastEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') submitRoast() }}
                  />
                  <button className="roast-submit" disabled={!roastEmail.trim() || roastBusy} onClick={submitRoast}>
                    {roastBusy ? (
                      <>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                        Roasting... 20–30 seconds
                      </>
                    ) : 'Roast My Resume 🔥'}
                  </button>
                </div>
              )}
              {roastError && (
                <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, fontWeight: 600 }}>
                  ⚠️ {roastError}
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: 12, fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                3,200+ resumes roasted · average score: 51/100
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="#programs" className="btn-secondary" style={{ fontSize: 15, padding: '13px 30px', fontFamily: 'inherit' }} onClick={cta('cohorts_anchor', 'hero')}>
                See the cohorts ↓
              </a>
              <button onClick={() => openPopup('Strategy Session', 'hero')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.78)', fontFamily: 'inherit', transition: 'color 0.2s', padding: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.78)')}>
                Lost? Free 15-min call →
              </button>
            </div>
          </div>

          {/* Where our students got shortlisted */}
          <div data-reveal style={{ transitionDelay: '0.32s', marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span className="mono-label">Shortlisted across top employers</span>
            <div className="logo-strip">
              {COMPANY_LOGOS.map(c => (
                <span key={c.name} className="logo-card" title={c.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.src} alt={c.name} style={{ height: c.h }} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Everything below shares one canvas so the scroll spine can weave through it */}
      <div style={{ position: 'relative' }}>
      <ScrollSpine />
      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── RECEIPTS TICKER ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '13px 0', background: 'rgba(79,124,255,0.04)', overflow: 'hidden' }}>
        <div className="ticker">
          {[...Array(2)].map((_, ri) => (
            ["A commerce student from Delhi landed a Founder's Office role at a leading startup", 'A BBA student cracked a Big 4 analyst role without a single referral', 'A tier-3 college student got a BD internship at a Series B fintech', 'A BCom graduate secured 3 competing offers in 30 days', 'A student with no network broke into consulting off-campus'].map((item, i) => (
              <span key={`${ri}-${i}`} className="ticker-item">
                <span style={{ color: 'rgba(79,124,255,0.5)' }}>→</span>
                {item}
              </span>
            ))
          ))}
        </div>
      </div>

      {/* ───────────────── Nº 01 — THE MATH ───────────────── */}
      <section style={{ padding: '110px 24px', maxWidth: 860, margin: '0 auto' }}>
        <Ledger no="Nº 01" label="The math nobody shows you" />
        <h2 className="section-title" data-reveal style={{ marginBottom: 12 }}>
          You&apos;re not failing.<br />You&apos;re playing a game <em>designed for someone else.</em>
        </h2>
        <p data-reveal style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 560, marginBottom: 28 }}>
          Campus placement reaches a fraction of students at a fraction of colleges. For everyone else, the numbers look like this:
        </p>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { num: <>50<small> : 1</small></>, label: 'Applications sent for every reply received — the off-campus default when you apply like everyone else.' },
            { num: <>0</>, label: 'Recruiters who will ever tell you why your resume got ignored. Silence is the only feedback.' },
            { num: <>6<small> months</small></>, label: 'Average time spent guessing — rewriting the resume, watching videos, applying into the void.' },
          ].map((row, i) => (
            <div key={i} className="math-row" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="math-num">{row.num}</div>
              <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{row.label}</p>
            </div>
          ))}
        </div>

        <div data-reveal style={{ marginTop: 40, padding: '26px 32px', background: 'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(123,97,255,0.05))', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 20 }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 2.4vw, 23px)', color: '#cdd9ff', lineHeight: 1.55 }}>
            This isn&apos;t a talent problem. It&apos;s a <em style={{ color: 'white' }}>distribution</em> problem —
            your work never reaches a human who can say yes. That&apos;s the part we fix.
          </p>
        </div>
        <div data-reveal style={{ textAlign: 'center', marginTop: 26 }}>
          <a href="/resources/resume-roast" style={{ fontSize: 14, fontWeight: 700, color: '#93BBFF' }} onClick={cta('roast', 'pain_section')}>
            Start with the part you control — get the free resume roast →
          </a>
        </div>
      </section>

      {/* ───────────────── Nº 02 — THE SYSTEM ───────────────── */}
      <section style={{ padding: '110px 24px', maxWidth: 1140, margin: '0 auto' }}>
        <Ledger no="Nº 02" label="The system" />
        <h2 className="section-title" data-reveal style={{ marginBottom: 12 }}>
          Same effort. <em>Different physics.</em>
        </h2>
        <p data-reveal style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 540, lineHeight: 1.7, marginBottom: 48 }}>
          Diagnose what&apos;s blocking you, rebuild the resume and targeting, then execute with a mentor
          watching your numbers every week — until something signs.
        </p>

        <div className="panel-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: 24, alignItems: 'stretch' }}>
          <div className="panel panel-today" data-reveal>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2.5, color: '#f87171', display: 'block', marginBottom: 20 }}>TODAY</span>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400, color: 'rgba(255,255,255,0.62)', marginBottom: 26, lineHeight: 1.25 }}>Where most students get stuck</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                "50 applications. 1 reply (if you're lucky).",
                'Resume rewritten 3 times. Still ignored.',
                '"Just network!" — but with who?',
                'YouTube + ChatGPT + nothing happens.',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, lineHeight: 1.55 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, color: '#f87171', fontSize: 11, fontWeight: 700 }}>✕</span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'line-through', textDecorationColor: 'rgba(248,113,113,0.4)', textDecorationThickness: '1px' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-arrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 72 }}>
            <svg width="72" height="48" viewBox="0 0 72 48" fill="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="arrowGrad" x1="0" y1="0" x2="72" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(248,113,113,0.55)" />
                  <stop offset="100%" stopColor="#4F7CFF" />
                </linearGradient>
              </defs>
              <path d="M 4 24 L 62 24 M 50 12 L 64 24 L 50 36" stroke="url(#arrowGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="panel panel-after" data-reveal style={{ transitionDelay: '0.12s' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2.5, color: '#93BBFF', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#93BBFF', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              IN 2 WEEKS
            </span>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400, color: 'white', marginBottom: 26, lineHeight: 1.25 }}>Where the cohort gets you</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { bold: '25+ replies', rest: ' on your first batch of cold emails.' },
                { bold: 'Resume opened', rest: ' by real hiring managers.' },
                { bold: 'Warm intros', rest: ' from mentors who actually hire.' },
                { bold: 'A weekly mentor', rest: ' — until you have an offer in hand.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, lineHeight: 1.55 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(79,124,255,0.18)', border: '1px solid rgba(79,124,255,0.4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, color: '#93BBFF', fontSize: 11, fontWeight: 700 }}>✓</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>
                    <strong style={{ color: 'white', fontWeight: 700 }}>{item.bold}</strong>{item.rest}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p data-reveal style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 36, lineHeight: 1.6 }}>
          The work doesn&apos;t change. <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>The system does.</span>
        </p>
      </section>

      {/* ───────────────── Nº 03 — THE FREE ARSENAL ───────────────── */}
      <section style={{ padding: '110px 24px', background: 'linear-gradient(180deg, rgba(79,124,255,0.04), transparent)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Ledger no="Nº 03" label="The free arsenal" />
          <h2 className="section-title" data-reveal style={{ marginBottom: 12 }}>
            Don&apos;t trust us yet? <em>Smart.</em><br />Start with the free stuff.
          </h2>
          <p data-reveal style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 560, lineHeight: 1.7, marginBottom: 48 }}>
            Seven free tools covering every stage of the hunt — fix the resume, practice the interview,
            run the outreach, track every application. Use them, see how we think, then decide
            if you want us in your corner.
          </p>

          <div className="bento">
            {/* Featured — Resume Roast with live score gauge */}
            <a href="/resources/resume-roast" className="tool-card b3" data-reveal data-index="01" style={{ color: 'inherit', borderColor: 'rgba(239,68,68,0.22)' }} onClick={cta('AI Resume Roast', 'free_tools')}>
              <span className="bento-kicker" style={{ color: '#f87171' }}>STEP 01 — FIX THE RESUME</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontSize: 34, lineHeight: 1 }}>🔥</span>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: '4px 10px', borderRadius: 100, color: '#ef4444', background: '#ef44441a', border: '1px solid #ef444440' }}>MOST POPULAR</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12 }}>AI Resume Roast</div>
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 22 }}>
                Upload your PDF. Our AI tells you exactly why recruiters ignore it — brutally, line by line. Free, takes ~30 seconds.
              </p>
              <div style={{ marginTop: 'auto', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                  <span>AVG STUDENT SCORE</span>
                  <span style={{ color: '#f87171', fontWeight: 700 }}>51 / 100</span>
                </div>
                <div style={{ height: 6, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ width: '51%', height: '100%', borderRadius: 100, background: 'linear-gradient(90deg, #ef4444, #fbbf24)' }} />
                </div>
              </div>
              <span className="tool-cta" style={{ marginTop: 0 }}>Roast my resume →</span>
            </a>

            {/* Featured — Job Tracker with mini kanban */}
            <a href="/job-tracker" className="tool-card b3" data-reveal data-index="02" style={{ transitionDelay: '0.08s', color: 'inherit', borderColor: 'rgba(79,124,255,0.25)' }} onClick={cta('Job Tracker', 'free_tools')}>
              <span className="bento-kicker" style={{ color: '#93BBFF' }}>STEP 02 — TRACK EVERY SHOT</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontSize: 34, lineHeight: 1 }}>🎯</span>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: '4px 10px', borderRadius: 100, color: '#4F7CFF', background: '#4F7CFF1a', border: '1px solid #4F7CFF40' }}>NEW</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12 }}>Job Tracker</div>
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 22 }}>
                Kanban for your applications, follow-up nudges, a curated feed of fresher openings, and an AI outreach writer.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto', marginBottom: 20 }}>
                {[
                  { l: 'APPLIED', n: 3, c: 'rgba(255,255,255,0.35)', hot: false },
                  { l: 'INTERVIEW', n: 2, c: '#93BBFF', hot: false },
                  { l: 'OFFER', n: 1, c: '#4ade80', hot: true },
                ].map(col => (
                  <div key={col.l} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '9px 9px 5px' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: 1.2, color: col.c, marginBottom: 8 }}>{col.l}</div>
                    {[...Array(col.n)].map((_, i) => (
                      <div key={i} style={{ height: 7, borderRadius: 3, background: col.hot ? 'linear-gradient(90deg, #4ade80, #22d3ee)' : 'rgba(255,255,255,0.12)', marginBottom: 5 }} />
                    ))}
                  </div>
                ))}
              </div>
              <span className="tool-cta" style={{ marginTop: 0 }}>Track my applications →</span>
            </a>

            {/* The rest of the arsenal */}
            {[
              { span: 'b2', index: '03', icon: '📊', title: 'Excel Interview Prep', badge: 'NEW', badgeColor: '#10b981', desc: 'Drill the exact Excel tests analyst and finance roles screen with.', href: '/resources/excel-interview-prep', cta: 'Start practicing →' },
              { span: 'b2', index: '04', icon: '📄', title: 'Resume Builder', badge: 'FREE', badgeColor: '#6ee7b7', desc: 'ATS-safe templates that survive the recruiter’s 6-second scan.', href: '/resources/resume-builder', cta: 'Build mine →' },
              { span: 'b2', index: '05', icon: '✉️', title: 'Cold Email Pack', badge: '50 TEMPLATES', badgeColor: '#93BBFF', desc: 'The exact emails our students used to get real replies from hiring managers.', href: '/resources/cold-email-pack', cta: 'Steal the templates →' },
              { span: 'b3', index: '06', icon: '💬', title: 'LinkedIn Scripts', badge: '20 SCRIPTS', badgeColor: '#7dd3fc', desc: 'Word-for-word DMs that turn strangers into referrals — without sounding desperate.', href: '/resources/linkedin-scripts', cta: 'Get the scripts →' },
              { span: 'b3', index: '07', icon: '🛠️', title: 'Career Toolkit', badge: '15 ROLES', badgeColor: '#fbbf24', desc: 'Role-by-role guides for consulting, finance, marketing, BD, ops and Founder’s Office.', href: '/resources/career-toolkit', cta: 'Browse toolkits →' },
            ].map((tool, i) => (
              <a key={tool.title} href={tool.href} className={`tool-card ${tool.span}`} data-reveal data-index={tool.index} style={{ transitionDelay: `${0.16 + i * 0.06}s`, color: 'inherit', padding: '28px 26px' }} onClick={cta(tool.title, 'free_tools')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 28, lineHeight: 1 }}>{tool.icon}</span>
                  <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.5, padding: '4px 10px', borderRadius: 100, color: tool.badgeColor, background: `${tool.badgeColor}1a`, border: `1px solid ${tool.badgeColor}40` }}>{tool.badge}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 9 }}>{tool.title}</div>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 20 }}>{tool.desc}</p>
                <span className="tool-cta" style={{ fontSize: 13 }}>{tool.cta}</span>
              </a>
            ))}
          </div>

          <p data-reveal style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 36, lineHeight: 1.7 }}>
            Why free? Because once you see what a sharp strategy looks like,{' '}
            <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>you&apos;ll know exactly what working with us feels like.</span>
          </p>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, rgba(79,124,255,0.06), rgba(123,97,255,0.04))', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, textAlign: 'center' }}>
          <Stat value={12} suffix=" Days" label="Fastest placement so far" delay={0} />
          <Stat value={300} suffix="+" label="Students helped across 50+ colleges" delay={0.1} />
          <Stat value={100} suffix="%" label="Live sessions, never recorded" delay={0.2} />
        </div>
      </section>

      {/* ───────────────── Nº 04 — THE RECEIPTS ───────────────── */}
      {/* PLACEHOLDER: Replace cards with real named students, photos, LinkedIn links once collected */}
      <section style={{ padding: '110px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <Ledger no="Nº 04" label="The receipts" />
        <h2 className="section-title" data-reveal style={{ marginBottom: 12 }}>
          Students who <em>made it work</em>
        </h2>
        <p data-reveal style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 48 }}>Consulting, finance, startups — different paths, same starting point.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {[
            { initial: 'P', name: 'Commerce student, Delhi', role: 'Marketing Intern at a D2C Startup', quote: 'I had zero replies for months. After week 2 of the cohort, I got 3 responses from cold emails. Got my internship offer shortly after.', color: '#4F7CFF', result: 'Internship secured' },
            { initial: 'A', name: 'BBA student, Tier-2 college', role: 'Analyst at a Big 4 Firm', quote: 'My mentor rebuilt my resume and gave me a target company list. Best investment I ever made.', color: '#7B61FF', result: 'Big 4 offer without referral' },
            { initial: 'S', name: 'BCom student, Tier-3 college', role: 'BD Intern at a Series B Startup', quote: 'Nobody from my college had ever cracked a startup this good. The LinkedIn outreach strategy completely changed things for me.', color: '#06b6d4', result: '3 competing offers' },
            { initial: 'R', name: 'BBA graduate, Tier-2 college', role: "Founder's Office at a Leading Startup", quote: 'No campus placements, no referrals. But with the right outreach strategy, I landed my dream role.', color: '#10b981', result: "Founder's Office role" },
            { initial: 'A', name: 'MBA student, Delhi', role: 'Consulting Intern at a Boutique Firm', quote: 'I switched my target from finance to consulting through this cohort. The mentor connections and the strategy made it happen.', color: '#f59e0b', result: 'Career pivot successful' },
            { initial: 'M', name: 'Commerce graduate, Tier-2 college', role: 'Finance Intern at a Fast-Growing Fintech', quote: "This company wasn't even on my radar. My mentor pushed me to apply and helped me prep. The call came through.", color: '#ec4899', result: 'Dream company cracked' },
          ].map((t, i) => (
            <div key={i} className="proof-card" data-reveal style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 40, lineHeight: 0.6, color: `${t.color}66`, marginBottom: 14 }}>&ldquo;</div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>{t.quote}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}, #0B0B0F)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{t.initial}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.role}</div>
                </div>
              </div>
              <div style={{ marginTop: 16, padding: '7px 14px', background: `${t.color}15`, border: `1px solid ${t.color}30`, borderRadius: 100, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, letterSpacing: 0.5, color: t.color, display: 'inline-block' }}>{t.result}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── Nº 05 — THE PEOPLE ───────────────── */}
      <section style={{ padding: '110px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <Ledger no="Nº 05" label="The people" />
        <h2 className="section-title" data-reveal style={{ marginBottom: 12 }}>
          Built by people who&apos;ve been<br /><em>exactly where you are</em>
        </h2>
        <p data-reveal style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 520, lineHeight: 1.8, marginBottom: 56 }}>
          No professors. No career coaches who&apos;ve never applied. Just two people who cracked
          off-campus hiring — and built a system so you don&apos;t have to figure it out alone.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 56 }}>
          {/* Founder 1 */}
          <div data-reveal style={{ padding: 2, borderRadius: 32, background: 'linear-gradient(145deg, rgba(79,70,229,0.6) 0%, rgba(123,97,255,0.25) 50%, rgba(255,255,255,0.04) 100%)' }}>
            <div style={{ background: 'linear-gradient(160deg, #131020 0%, #0c0b15 100%)', borderRadius: 30, padding: '44px 40px', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -100, left: -60, width: 260, height: 260, background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 16, right: 24, fontFamily: 'var(--serif)', fontSize: 140, lineHeight: 1, color: 'rgba(79,70,229,0.07)', userSelect: 'none', pointerEvents: 'none' }}>&ldquo;</div>
              <Image src="/founders/anirudh.png" alt="Anirudh Agarwal" width={84} height={84} quality={80} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', marginBottom: 24, boxShadow: '0 0 0 5px rgba(79,70,229,0.18), 0 0 40px rgba(79,70,229,0.28)', display: 'block' }} />
              <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, color: 'white', marginBottom: 10, lineHeight: 1.2 }}>Anirudh Agarwal</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(79,70,229,0.18)', border: '1px solid rgba(79,70,229,0.35)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a5b4fc', display: 'inline-block' }} />
                Associate Consultant @ Aon
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>Christ University, Bangalore</div>
              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(79,70,229,0.4), rgba(123,97,255,0.15), transparent)', marginBottom: 28 }} />
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: 28, position: 'relative', zIndex: 1 }}>
                Cracked consulting off-campus straight after his undergrad. Spent months figuring out what actually gets you interviews — then wrote it down so you don&apos;t have to.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {['Consulting', 'Off-Campus Strategy', 'Cold Outreach'].map(tag => (
                  <span key={tag} style={{ padding: '5px 13px', background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.22)', borderRadius: 100, fontSize: 12, color: '#a5b4fc', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
              <a href="https://www.linkedin.com/in/anirudh-agarwal-36591220b/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'rgba(79,70,229,0.14)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: 12, fontSize: 13, color: '#a5b4fc', fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                View LinkedIn
              </a>
            </div>
          </div>

          {/* Founder 2 */}
          <div data-reveal style={{ transitionDelay: '0.12s', padding: 2, borderRadius: 32, background: 'linear-gradient(145deg, rgba(6,182,212,0.5) 0%, rgba(8,145,178,0.2) 50%, rgba(255,255,255,0.04) 100%)' }}>
            <div style={{ background: 'linear-gradient(160deg, #0a1418 0%, #0b0f14 100%)', borderRadius: 30, padding: '44px 40px', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -100, left: -60, width: 260, height: 260, background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 16, right: 24, fontFamily: 'var(--serif)', fontSize: 140, lineHeight: 1, color: 'rgba(6,182,212,0.07)', userSelect: 'none', pointerEvents: 'none' }}>&ldquo;</div>
              <Image src="/founders/sanya.png" alt="Sanya Srivastava" width={84} height={84} quality={80} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', marginBottom: 24, boxShadow: '0 0 0 5px rgba(6,182,212,0.15), 0 0 40px rgba(6,182,212,0.22)', display: 'block' }} />
              <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, color: 'white', marginBottom: 10, lineHeight: 1.2 }}>Sanya Srivastava</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#67e8f9', marginBottom: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#67e8f9', display: 'inline-block' }} />
                FP&amp;A @ Palo Alto Networks
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>Finance · Corporate Strategy</div>
              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(6,182,212,0.4), rgba(8,145,178,0.15), transparent)', marginBottom: 28 }} />
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: 28, position: 'relative', zIndex: 1 }}>
                Built a career in finance and corporate strategy at a global tech company — without the &ldquo;right&rdquo; pedigree. Knows exactly what finance and strategy roles look for, and how to get there when no one hands you a roadmap.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {['Finance', 'FP&A', 'Corporate Strategy'].map(tag => (
                  <span key={tag} style={{ padding: '5px 13px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.22)', borderRadius: 100, fontSize: 12, color: '#67e8f9', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
              <a href="https://www.linkedin.com/in/sanya-srivastava-bb8806273/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 12, fontSize: 13, color: '#67e8f9', fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                View LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div data-reveal style={{ textAlign: 'center', padding: '0 16px' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(20px, 3vw, 28px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, fontStyle: 'italic', maxWidth: 600, margin: '0 auto' }}>
            &ldquo;We built this because the system wasn&apos;t built for us.<br />Now it&apos;s built for you.&rdquo;
          </p>
        </div>
      </section>

      {/* ───────────────── Nº 06 — THE ASK ───────────────── */}
      <section id="programs" style={{ padding: '110px 24px 80px', maxWidth: 960, margin: '0 auto' }}>
        <Ledger no="Nº 06" label="Work with us" />
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className="section-title" data-reveal style={{ marginBottom: 12 }}>Two ways to <em>work with us</em></h2>
          <p data-reveal style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 24 }}>Both are live programs with real mentors — pick the one that fits your goal.</p>
          <div data-reveal className="ladder">
            <span>Start with the free tools</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
            <span>Test us with a ₹549 strategy call</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
            <span style={{ color: '#93BBFF' }}>Join a cohort when you&apos;re ready</span>
          </div>
          <p data-reveal style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 18, lineHeight: 1.6 }}>
            One-time payment · no subscriptions · most students see <span style={{ color: '#93BBFF', fontWeight: 700 }}>25+ cold email replies</span> in their first 2 weeks of doing the work.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

          {/* Internship Cohort */}
          <div className="product-card" data-reveal style={{ background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2.5, color: '#fbbf24', display: 'block', marginBottom: 22 }}>INTERNSHIP COHORT — 4 WEEKS</span>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 30, marginBottom: 6, lineHeight: 1.1 }}>Internship Cohort</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.5 }}>A 4-week live program to land your first off-campus internship in consulting, finance, or startups.</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '20px 0' }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: '#fbbf24' }}>₹1,750</span>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>/ program</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                'Weekly live sessions with your mentor',
                'Resume and LinkedIn profile review',
                'Cold email templates and targeting strategy',
                'Target company list for your goals',
                'Interview preparation and mock rounds',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: 'rgba(245,158,11,0.4)', fontSize: 16, flexShrink: 0, lineHeight: '1.4' }}>—</span>{f}
                </div>
              ))}
            </div>
            <a
              href="/summer"
              onClick={cta('internship_cohort', 'programs')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 32px', borderRadius: 100, background: 'transparent', color: '#fbbf24', fontWeight: 700, fontSize: 15, border: '1.5px solid rgba(245,158,11,0.45)', transition: 'all 0.3s', width: '100%' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.45)'; }}>
              Explore Internship Cohort →
            </a>
          </div>

          {/* Placement Cohort */}
          <div className="product-card" data-reveal style={{ transitionDelay: '0.12s', background: 'linear-gradient(135deg, rgba(123,97,255,0.08), rgba(79,124,255,0.05))', border: '1px solid rgba(123,97,255,0.3)' }}>
            <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', background: '#4F7CFF', borderRadius: '0 0 16px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap', color: 'white' }}>MOST POPULAR</div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2.5, color: '#C4B5FD', display: 'block', marginBottom: 22, marginTop: 20 }}>PLACEMENT COHORT — UNTIL PLACED</span>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 30, marginBottom: 6, lineHeight: 1.1 }}>Placement Cohort</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.5 }}>An extended program with weekly accountability, live sessions, and mentor support until you&apos;re placed.</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '20px 0' }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: '#7B61FF' }}>₹2,500</span>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>/ program</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                'Everything in the Internship Cohort',
                'Company-specific targeting and prep',
                'Resume and LinkedIn reviewed every week',
                'Direct introductions at target companies',
                'Support until you have an offer',
                'Longer mentorship engagement',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 16, flexShrink: 0, lineHeight: '1.4' }}>—</span>{f}
                </div>
              ))}
            </div>
            <a
              href="/cohort"
              onClick={cta('placement_cohort', 'programs')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 32px', borderRadius: 100, background: 'linear-gradient(135deg, #7B61FF, #4F7CFF)', color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 0 40px rgba(123,97,255,0.4)', transition: 'all 0.3s', width: '100%' }}>
              Explore Placement Cohort →
            </a>
          </div>
        </div>

        <div data-reveal style={{ textAlign: 'center', marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Batches stay small on purpose — every resume gets a weekly human review. When a batch fills, the next one opens.
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)' }}>
            Want to talk before committing?{' '}
            <button onClick={() => openPopup('Strategy Session', 'programs')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.6)', fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3, padding: 0, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
              Book a 1:1 strategy call — ₹549
            </button>
            {' '}and we&apos;ll tell you which fits.
          </p>
        </div>

        <TrustStrip />
      </section>

      {/* ── COMPARISON ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <Ledger no="Nº 07" label="Compare the paths" />
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className="section-title" data-reveal>Same goal. <em>Three very different paths.</em></h2>
        </div>

        <div data-reveal style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as never, borderRadius: 28, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.012)' }}>
          <table className="comp-table" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th className="ct-corner"></th>
                <th className="ct-head ct-head-other">
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 400, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Watching YouTube</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Self-study path</div>
                </th>
                <th className="ct-head ct-head-bc">
                  <div className="ct-bc-badge">★ RECOMMENDED</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400, color: 'white', marginBottom: 6 }}>Beyond Campus</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#93BBFF' }}>Most students start here</div>
                </th>
                <th className="ct-head ct-head-other">
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 400, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Pre-recorded courses</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Video modules</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                type CellKind = 'yes' | 'no' | 'partial' | 'na' | 'price'
                const ICONS: Record<string, { icon: string; color: string; bg: string; border: string }> = {
                  yes: { icon: '✓', color: '#4ade80', bg: 'rgba(74,222,128,0.14)', border: 'rgba(74,222,128,0.32)' },
                  no: { icon: '✗', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.22)' },
                  partial: { icon: '△', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.28)' },
                  na: { icon: '—', color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)' },
                }
                const renderCell = (cell: { kind: CellKind; text: string }, highlight: boolean) => {
                  if (cell.kind === 'price') {
                    return (
                      <span style={{ fontWeight: highlight ? 800 : 500, color: highlight ? 'white' : 'rgba(255,255,255,0.55)', fontSize: highlight ? 15 : 14 }}>
                        {cell.text}
                      </span>
                    )
                  }
                  const m = ICONS[cell.kind]
                  return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, justifyContent: 'center' }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: m.bg, border: `1px solid ${m.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: m.color, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{m.icon}</span>
                      <span style={{ color: highlight ? 'white' : 'rgba(255,255,255,0.62)', fontWeight: highlight ? 600 : 500, fontSize: 13 }}>{cell.text}</span>
                    </span>
                  )
                }

                const rows: Array<{ label: string; yt: { kind: CellKind; text: string }; bc: { kind: CellKind; text: string }; c: { kind: CellKind; text: string } }> = [
                  { label: 'Personalized strategy',          yt: { kind: 'no',      text: 'Generic videos' },     bc: { kind: 'yes',     text: 'Built for your goal' },  c: { kind: 'no',      text: 'Pre-scripted' } },
                  { label: 'Resume reviewed by a human',     yt: { kind: 'no',      text: 'Never' },              bc: { kind: 'yes',     text: 'Every week' },           c: { kind: 'partial', text: 'AI tools only' } },
                  { label: 'Cold emails written with you',   yt: { kind: 'no',      text: 'DIY in the dark' },    bc: { kind: 'yes',     text: 'Drafted with mentor' },  c: { kind: 'partial', text: 'Generic templates' } },
                  { label: 'Warm intros to hiring managers', yt: { kind: 'no',      text: 'None' },               bc: { kind: 'yes',     text: 'Mentor-driven' },        c: { kind: 'no',      text: 'None' } },
                  { label: 'Weekly accountability',          yt: { kind: 'no',      text: "No one's watching" },  bc: { kind: 'yes',     text: "Until you're placed" },  c: { kind: 'no',      text: 'You + a video' } },
                  { label: 'Total investment',               yt: { kind: 'price',   text: 'Free*' },              bc: { kind: 'price',   text: '₹549–₹2,500' },          c: { kind: 'price',   text: '₹5K–₹50K' } },
                ]

                return rows.map((row, i) => (
                  <tr key={i}>
                    <td className="ct-label">{row.label}</td>
                    <td className="ct-cell ct-cell-other">{renderCell(row.yt, false)}</td>
                    <td className="ct-cell ct-cell-bc">{renderCell(row.bc, true)}</td>
                    <td className="ct-cell ct-cell-other">{renderCell(row.c, false)}</td>
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 14 }}>
          * Free to watch. Not free to spend 6 months figuring it out alone.
        </p>

        <div data-reveal style={{ textAlign: 'center', marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/cohort" className="btn-primary" style={{ fontFamily: 'inherit', fontSize: 15, padding: '14px 32px' }} onClick={cta('placement_cohort', 'compare')}>
            <span>Explore Placement Cohort</span>
            <span style={{ position: 'relative', zIndex: 1 }}>→</span>
          </a>
          <a href="/summer" onClick={cta('internship_cohort', 'compare')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 100, background: 'rgba(245,158,11,0.06)', color: '#fbbf24', fontWeight: 600, fontSize: 15, border: '1.5px solid rgba(245,158,11,0.4)', transition: 'all 0.3s', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.65)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}>
            Explore Internship Cohort →
          </a>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '100px 24px', maxWidth: 800, margin: '0 auto' }}>
        <Ledger no="Nº 08" label="Questions we always get" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((faq, i) => (
            <div key={i} data-reveal style={{ transitionDelay: `${Math.min(i, 4) * 0.05}s`, background: '#111827', border: `1px solid ${openFaq === i ? 'rgba(79,124,255,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.3s' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: openFaq === i ? 'white' : 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontFamily: 'inherit' }}>{faq.q}</span>
                <span style={{ fontSize: 22, color: '#4F7CFF', flexShrink: 0, transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block', lineHeight: 1 }}>+</span>
              </button>
              <div style={{ maxHeight: openFaq === i ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                <div style={{ padding: '0 28px 24px', fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85 }}>
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '80px 24px 110px', maxWidth: 860, margin: '0 auto' }}>
        <div data-reveal style={{ position: 'relative', borderRadius: 28, padding: '64px 48px', textAlign: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(79,124,255,0.1), rgba(123,97,255,0.08))', border: '1px solid rgba(79,124,255,0.3)' }}>
          <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 360, height: 220, background: 'radial-gradient(circle, rgba(79,124,255,0.22), transparent)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <span className="mono-label" style={{ display: 'block', marginBottom: 18, color: 'rgba(147,187,255,0.7)' }}>The last section. The first step.</span>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 4.4vw, 46px)', marginBottom: 16, lineHeight: 1.12, letterSpacing: -1 }}>
            Your next offer is one email<br />away from <em style={{ color: '#93BBFF' }}>being sent.</em>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, maxWidth: 560, margin: '0 auto 36px', color: 'rgba(255,255,255,0.78)' }}>
            Most students who follow the system see{' '}
            <span style={{ color: '#93BBFF', fontWeight: 700 }}>25+ cold email replies</span>{' '}
            in their first 2 weeks. Yours could start this week.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="/cohort" className="btn-primary" style={{ fontSize: 17, padding: '18px 40px', fontFamily: 'inherit' }} onClick={cta('placement_cohort', 'final_cta')}>
                <span>Explore Placement Cohort</span>
                <span style={{ position: 'relative', zIndex: 1 }}>→</span>
              </a>
              <a href="/resources/resume-roast" className="btn-secondary" style={{ fontSize: 17, padding: '17px 40px', fontFamily: 'inherit' }} onClick={cta('roast', 'final_cta')}>
                Not ready? Get the free roast 🔥
              </a>
            </div>
            <button onClick={() => openPopup('Strategy Session', 'final_cta')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.38)', fontFamily: 'inherit', transition: 'color 0.2s', padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}>
              Not sure which fits? Book a 1:1 strategy call (₹549) →
            </button>
          </div>
          <TrustStrip />
        </div>
      </section>

      </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px 32px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 6 }}>Beyond<span style={{ color: 'var(--blue)' }}>Campus</span></div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: 0.5 }}>Breaking campus barriers since 2023</div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/summer" onClick={cta('internship_cohort', 'footer')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 100, background: 'rgba(245,158,11,0.06)', color: '#fbbf24', fontWeight: 600, fontSize: 14, border: '1.5px solid rgba(245,158,11,0.35)', transition: 'all 0.3s', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)'; }}>
              Internship Cohort →
            </a>
            <a href="/cohort" className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, fontFamily: 'inherit' }} onClick={cta('placement_cohort', 'footer')}>
              <span>Placement Cohort</span>
              <span style={{ position: 'relative', zIndex: 1 }}>→</span>
            </a>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>© {new Date().getFullYear()} Beyond Campus. All rights reserved.</p>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>beyond-campus.in</p>
        </div>
      </footer>
    </main>
  )
}
