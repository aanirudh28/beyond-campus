'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LeadCapturePopup from './components/LeadCapturePopup'
import { track } from '@/lib/analytics'

// Feature flag — flip to true when Mission Control / Phase 1B is ready to ship
const SHOW_COMMUNITY = false

export default function Home() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const resourcesCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [howItWorksVisible, setHowItWorksVisible] = useState(false)
  const howItWorksRef = useRef<HTMLDivElement>(null)

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
    window.addEventListener('scroll', onScroll)
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

  // Exit intent — desktop only, once per session: catch leavers with the free consultation
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

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setHowItWorksVisible(true)
    }, { threshold: 0.15 })
    if (howItWorksRef.current) observer.observe(howItWorksRef.current)
    return () => observer.disconnect()
  }, [])

  const trustItems = ['Personalized Mentorship', 'Weekly Accountability', 'Resume & LinkedIn Reviews', 'Internship & Placement Support']

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

  const TrustStrip = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px', justifyContent: 'center', marginTop: 20 }}>
      {trustItems.map((item, i) => (
        <span key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>}
          {item}
        </span>
      ))}
    </div>
  )

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: "var(--font-dm-sans), 'Inter', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue: #4F7CFF;
          --purple: #7B61FF;
          --bg: #0B0B0F;
          --bg2: #111827;
          --text: #F9FAFB;
          --muted: rgba(255,255,255,0.5);
        }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes border-glow { 0%,100%{border-color:rgba(79,124,255,0.3)} 50%{border-color:rgba(79,124,255,0.8)} }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.55);opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .roast-widget { width:100%; max-width:560px; background:rgba(17,24,39,0.85); border:1px solid rgba(239,68,68,0.25); border-radius:24px; padding:22px; backdrop-filter:blur(8px); box-shadow:0 24px 80px rgba(0,0,0,0.4); text-align:left; }
        .roast-drop { border:2px dashed rgba(239,68,68,0.35); border-radius:16px; padding:26px 20px; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:6px; }
        .roast-drop:hover, .roast-drop.drag-over { border-color:#ef4444; background:rgba(239,68,68,0.06); }
        .roast-input { width:100%; padding:13px 16px; border-radius:12px; background:#0B0B0F; border:1.5px solid rgba(255,255,255,0.1); color:white; font-size:14px; outline:none; font-family:inherit; transition:border-color 0.2s; }
        .roast-input:focus { border-color:rgba(239,68,68,0.45); }
        .roast-submit { width:100%; padding:15px; border-radius:100px; background:linear-gradient(135deg,#ef4444,#dc2626); border:none; color:white; font-size:16px; font-weight:800; cursor:pointer; font-family:inherit; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; gap:9px; }
        .roast-submit:disabled { opacity:0.45; cursor:not-allowed; }
        .roast-submit:not(:disabled):hover { opacity:0.9; }
        .pulse-dot { width:7px; height:7px; border-radius:50%; background:#4F7CFF; flex-shrink:0; display:inline-block; animation:pulse-dot 2s ease-in-out infinite; }

        .hero-headline { font-family: var(--font-dm-serif), serif; font-size: clamp(48px, 7vw, 88px); line-height: 1.0; letter-spacing: -2px; font-weight: 400; }
        .gradient-text { color: #4F7CFF; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 16px 32px; border-radius: 100px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); color: white; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; box-shadow: 0 0 30px rgba(79,124,255,0.4); position: relative; overflow: hidden; }
        .btn-primary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#7B61FF,#4F7CFF); opacity:0; transition:opacity 0.3s; }
        .btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 0 50px rgba(79,124,255,0.6); }
        .btn-primary:hover::before { opacity:1; }
        .btn-primary span { position:relative; z-index:1; }
        .btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 15px 32px; border-radius: 100px; background: transparent; color: white; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; border: 1.5px solid rgba(255,255,255,0.2); }
        .btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); transform: translateY(-2px); }
        .btn-roast { display: inline-flex; align-items: center; gap: 10px; padding: 18px 36px; border-radius: 100px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); color: white; font-weight: 700; font-size: 16px; cursor: pointer; transition: all 0.3s; border: none; box-shadow: 0 0 36px rgba(79,124,255,0.45); position: relative; }
        .btn-roast:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 0 56px rgba(79,124,255,0.65); }
        .section-label { font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--blue); margin-bottom: 16px; display: block; }
        .section-title { font-family: var(--font-dm-serif), serif; font-size: clamp(32px, 4vw, 52px); line-height: 1.1; letter-spacing: -1px; margin-bottom: 20px; }
        .grid-bg { background-image: linear-gradient(rgba(79,124,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79,124,255,0.06) 1px, transparent 1px); background-size: 80px 80px; }
        .noise-overlay { position:fixed; inset:0; pointer-events:none; z-index:999; opacity:0.025; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .ticker-wrap { overflow: hidden; }
        .ticker { display: flex; width: max-content; animation: ticker 30s linear infinite; }
        .ticker-item { white-space: nowrap; padding: 0 40px; font-size: 14px; font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 12px; }
        .avatar-stack { display: flex; }
        .avatar-stack img, .avatar { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #0B0B0F; margin-left: -10px; }
        .avatar-stack > :first-child { margin-left: 0; }
        .pain-item { display: flex; align-items: flex-start; gap: 16px; padding: 24px; border-radius: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s; }
        .pain-item:hover { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.2); }
        .product-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 40px; transition: all 0.4s; position: relative; overflow: hidden; }
        .product-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(79,124,255,0.08),transparent); opacity:0; transition:opacity 0.4s; pointer-events:none; }
        .product-card:hover { border-color: rgba(79,124,255,0.4); transform: translateY(-8px); box-shadow: 0 30px 80px rgba(79,124,255,0.15); }
        .product-card:hover::before { opacity:1; }
        .proof-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; transition: all 0.3s; }
        .proof-card:hover { border-color: rgba(79,124,255,0.3); transform: translateY(-4px); }
        .stat-num { font-family: var(--font-dm-serif), serif; font-size: clamp(48px, 6vw, 72px); line-height: 1; letter-spacing: -2px; }
        .sticky-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: all 0.3s; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; }
        .sticky-nav.scrolled { background: rgba(11,11,15,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 14px 40px; }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .logo-card { display: inline-flex; align-items: center; justify-content: center; height: 38px; padding: 0 14px; background: #fff; border-radius: 10px; border: 1px solid rgba(255,255,255,0.14); transition: transform 0.25s ease, box-shadow 0.25s ease; flex-shrink: 0; }
        .logo-card img { display: block; width: auto; max-width: 110px; object-fit: contain; filter: grayscale(1) opacity(0.6); transition: filter 0.25s ease; }
        .logo-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(79,124,255,0.22); }
        .logo-card:hover img { filter: grayscale(0) opacity(1); }
        .logo-strip { display: flex; gap: 10px; flex-wrap: wrap; }
        @media(max-width: 540px) { .logo-card { height: 32px; padding: 0 10px; } .logo-card img { max-width: 88px; } }
        .hiw-card { background:#111827; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:36px 32px; transition:border-color 0.4s, transform 0.4s, box-shadow 0.4s; opacity:0; transform:translateY(40px); }
        .hiw-card.visible { opacity:1; transform:translateY(0); }
        .hiw-card:hover { border-color:rgba(79,124,255,0.4); transform:translateY(-6px); box-shadow:0 20px 48px rgba(79,124,255,0.14); }
        .proof-strip-card { background:#111827; border-left:4px solid #4F7CFF; border-radius:16px; padding:24px 28px; display:flex; align-items:flex-start; gap:14px; transition:transform 0.3s; }
        .proof-strip-card:hover { transform:translateX(4px); }
        .tool-card { background:#111827; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:36px 32px; display:flex; flex-direction:column; transition:all 0.35s; position:relative; overflow:hidden; }
        .tool-card:hover { transform:translateY(-6px); border-color:rgba(79,124,255,0.45); box-shadow:0 24px 64px rgba(79,124,255,0.16); }
        .tool-cta { display:inline-flex; align-items:center; gap:8px; font-size:14px; font-weight:700; color:#93BBFF; margin-top:auto; transition:gap 0.2s; }
        .tool-card:hover .tool-cta { gap:12px; }
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
        .nav-links { display: flex; align-items: center; gap: 22px; }
        @media(max-width:900px) { .nav-links .nav-hide-mobile { display: none; } }
        @media(max-width:768px) {
          .sticky-nav { padding: 16px 20px; }
          .sticky-nav.scrolled { padding: 12px 20px; }
          .hero-headline { font-size: clamp(36px, 10vw, 56px); }
          .comp-table th, .comp-table td { padding: 14px 10px; font-size: 12px; }
          .comp-table .ct-label { padding-left: 14px; }
          .comp-table .ct-head { padding: 32px 10px 18px; }
          .mobile-cta-bar { display: flex !important; }
          .transformation-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .transformation-arrow { padding: 4px 0 !important; min-width: 0 !important; }
          .transformation-arrow svg { transform: rotate(90deg); }
        }
        .mobile-cta-bar { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 90; background: rgba(11,11,15,0.96); backdrop-filter: blur(16px); border-top: 1px solid rgba(255,255,255,0.08); padding: 10px 16px; align-items: center; justify-content: center; gap: 12px; }
      `}</style>

      <div className="noise-overlay" />

      <LeadCapturePopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} preselectedCohort={popupPreselect} />

      {/* NAV — one primary action; everything else is quiet */}
      <nav className={`sticky-nav${scrollY > 40 ? ' scrolled' : ''}`}>
        <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 22, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: 'var(--blue)' }}>Campus</span>
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
            <a href="/free" style={{ padding: '10px 4px', fontSize: 14, fontWeight: 600, color: resourcesOpen ? 'white' : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: "var(--font-dm-sans),'Inter',sans-serif", transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              Free Tools
              <span style={{ fontSize: 10, opacity: 0.7, display: 'inline-block', transform: resourcesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
            </a>
            {resourcesOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: 8, zIndex: 200 }}>
              <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 8, minWidth: 250, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                {[
                  { href: '/resources/resume-roast', label: '🔥 Resume Roast', badge: 'FREE AI', badgeStyle: { background: '#ef4444', color: 'white' } },
                  { href: '/job-tracker', label: '🎯 Job Tracker', badge: 'NEW', badgeStyle: { background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white' } },
                  { href: '/resources/resume-builder', label: '📄 Resume Builder', badge: 'free', badgeStyle: { color: '#6ee7b7' } },
                  { href: '/resources/career-toolkit', label: '🛠️ Career Toolkit', badge: '15 roles', badgeStyle: { color: '#6ee7b7' } },
                  { href: '/resources/cold-email-pack', label: '✉️ Cold Email Pack', badge: '50 templates', badgeStyle: { color: '#93BBFF' } },
                  { href: '/resources/linkedin-scripts', label: '💬 LinkedIn Scripts', badge: '20 scripts', badgeStyle: { color: '#7dd3fc' } },
                ].map(item => (
                  <a key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,124,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 100, letterSpacing: 0.5, ...item.badgeStyle }}>{item.badge}</span>
                  </a>
                ))}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                <a href="/free" style={{ display: 'block', padding: '10px 12px', borderRadius: 10, textAlign: 'center', background: 'linear-gradient(135deg,rgba(79,124,255,0.15),rgba(123,97,255,0.1))', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  See all free resources →
                </a>
              </div>
              </div>
            )}
          </div>
          {SHOW_COMMUNITY && (
            <a href="/community" className="nav-hide-mobile" style={{ padding: '10px 4px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>Community</a>
          )}
          <a href="#programs" className="nav-hide-mobile" style={{ padding: '10px 4px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>Cohorts</a>
          <a href="/dashboard" className="nav-hide-mobile" style={{ padding: '10px 4px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>Dashboard</a>
          <button onClick={() => openPopup('Strategy Session', 'nav')} className="nav-hide-mobile" style={{ padding: '10px 4px', fontSize: 14, fontWeight: 600, color: '#4F7CFF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s', letterSpacing: 0.1, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 7 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#93BBFF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#4F7CFF')}>
            <span className="pulse-dot" />
            Lost? Let&apos;s talk →
          </button>
          <a href="/resources/resume-roast" className="btn-primary" style={{ padding: '10px 22px', fontSize: 14, fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }} onClick={cta('roast', 'nav')}>
            <span>🔥 Free Resume Roast</span>
          </a>
        </div>
      </nav>

      {/* Mobile sticky bottom CTA — free hook, zero-risk */}
      <div className="mobile-cta-bar">
        <a href="/resources/resume-roast" style={{ flex: 1, maxWidth: 280, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 20px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 0 24px rgba(79,124,255,0.4)' }} onClick={cta('roast', 'mobile_bar')}>
          🔥 Free AI Resume Roast
        </a>
        <button onClick={() => openPopup('Strategy Session', 'mobile_bar')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', padding: '8px 4px', whiteSpace: 'nowrap' }}>
          or talk to us →
        </button>
      </div>

      {/* HERO — one promise, one free action */}
      <section className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '140px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,124,255,0.2), transparent)', top: '10%', left: '-10%', animation: 'glow-pulse 6s ease-in-out infinite' }} />
        <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(123,97,255,0.15), transparent)', bottom: '5%', right: '-5%', animation: 'glow-pulse 8s ease-in-out infinite 2s' }} />
        <div className="orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,210,255,0.1), transparent)', top: '40%', left: '60%', animation: 'float 8s ease-in-out infinite' }} />

        <div style={{ maxWidth: 940, textAlign: 'center', position: 'relative', zIndex: 2, animation: 'fadeUp 0.8s ease both' }}>
          {/* Proof eyebrow — earns attention before the ask */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 18px', background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 100, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 28 }}>
            <span className="pulse-dot" />
            300+ students · 50+ colleges · fastest placement: 12 days
          </div>

          <h1 className="hero-headline" style={{ marginBottom: 28 }}>
            Break Into Top Jobs<br />
            <span className="gradient-text">Without Campus Placements</span>
          </h1>

          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px', fontWeight: 400 }}>
            We show non-tech students how to reach companies directly — cold email, LinkedIn, and the right targeting strategy. No campus. No connections required.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, marginBottom: 28 }}>
            {/* Embedded roast — zero clicks between impulse and action */}
            <div className="roast-widget">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
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
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                3,200+ resumes roasted · Average score: 51/100
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="#programs" className="btn-secondary" style={{ fontSize: 15, padding: '13px 30px', fontFamily: 'inherit', textDecoration: 'none' }} onClick={cta('cohorts_anchor', 'hero')}>
                See the cohorts ↓
              </a>
              <button onClick={() => openPopup('Strategy Session', 'hero')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.78)', fontFamily: 'inherit', transition: 'color 0.2s', padding: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.78)')}>
                Lost? Free 15-min call →
              </button>
            </div>
          </div>

          {/* Social proof row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginTop: 44 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar-stack">
                {['#4F7CFF','#7B61FF','#06b6d4','#10b981','#f59e0b'].map((c, i) => (
                  <div key={i} className="avatar" style={{ background: `linear-gradient(135deg, ${c}, #0B0B0F)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
                    {['P','A','S','R','M'][i]}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>A network of 300+</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>students across 50+ Indian colleges</div>
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, fontWeight: 600, textTransform: 'uppercase' }}>Shortlisted Across Top Employers</div>
              <div className="logo-strip">
                {COMPANY_LOGOS.map(c => (
                  <span key={c.name} className="logo-card" title={c.name}>
                    <img src={c.src} alt={c.name} style={{ height: c.h }} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0', background: 'rgba(79,124,255,0.04)', overflow: 'hidden' }}>
        <div className="ticker">
          {[...Array(2)].map((_, ri) => (
            ["A commerce student from Delhi landed a Founder's Office role at a leading startup", "A BBA student cracked a Big 4 analyst role without a single referral", "A tier-3 college student got a BD internship at a Series B fintech", "A BCom graduate secured 3 competing offers in 30 days", "A student with no network broke into consulting off-campus"].map((item, i) => (
              <span key={`${ri}-${i}`} className="ticker-item">
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>◆</span>
                {item}
              </span>
            ))
          ))}
        </div>
      </div>

      {/* PAIN SECTION */}
      <section style={{ padding: '100px 24px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h2 className="section-title">Sound familiar?</h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.6, marginTop: 8 }}>
            If even one of these hits, you&apos;re not alone — and it isn&apos;t your fault.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            "You've sent 50+ applications. Maybe one or two replies.",
            "Your resume gets ignored — and no one will tell you why.",
            "Cold emails feel like shouting into a void.",
            'Everyone around you "knows someone." You don\'t.',
            "You're working hard, but with no idea what's actually broken.",
          ].map(item => (
            <div className="pain-item" key={item}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid rgba(255,255,255,0.22)', flexShrink: 0, marginTop: 3, transition: 'all 0.3s' }} />
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 36, padding: '24px 32px', background: 'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(123,97,255,0.05))', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 20 }}>
          <p style={{ fontSize: 17, fontWeight: 600, color: '#93BBFF', lineHeight: 1.6 }}>This isn&apos;t a talent problem. It&apos;s a strategy problem. That&apos;s exactly what we fix.</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <a href="/resources/resume-roast" style={{ fontSize: 14, fontWeight: 700, color: '#93BBFF', textDecoration: 'none' }} onClick={cta('roast', 'pain_section')}>
            Want to know what&apos;s broken in <em>your</em> resume? Get the free roast →
          </a>
        </div>
      </section>

      {/* WHAT CHANGES — TRANSFORMATION */}
      <section style={{ padding: '100px 24px', maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className="section-title">Here&apos;s what changes</h2>
          <p style={{ color: 'var(--muted)', fontSize: 17, marginTop: 8 }}>Same effort. Completely different outcome.</p>
        </div>

        <div className="transformation-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: 24, alignItems: 'stretch' }}>

          {/* TODAY panel */}
          <div style={{ background: 'linear-gradient(180deg, rgba(239,68,68,0.07), rgba(239,68,68,0.015))', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 24, padding: '36px 32px', position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#f87171', marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171' }} />
              TODAY
            </div>
            <h3 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 24, fontWeight: 400, color: 'rgba(255,255,255,0.62)', marginBottom: 26, lineHeight: 1.25 }}>Where most students get stuck</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                "50 applications. 1 reply (if you're lucky).",
                "Resume rewritten 3 times. Still ignored.",
                "\"Just network!\" — but with who?",
                "YouTube + ChatGPT + nothing happens.",
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, lineHeight: 1.55 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, color: '#f87171', fontSize: 11, fontWeight: 700 }}>✕</span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'line-through', textDecorationColor: 'rgba(248,113,113,0.4)', textDecorationThickness: '1px' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="transformation-arrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 72 }}>
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

          {/* IN 2 WEEKS panel */}
          <div style={{ background: 'linear-gradient(180deg, rgba(79,124,255,0.1), rgba(123,97,255,0.025))', border: '1px solid rgba(79,124,255,0.32)', borderRadius: 24, padding: '36px 32px', position: 'relative', boxShadow: '0 0 60px rgba(79,124,255,0.08)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.32)', borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#93BBFF', marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#93BBFF', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              IN 2 WEEKS
            </div>
            <h3 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 24, fontWeight: 400, color: 'white', marginBottom: 26, lineHeight: 1.25 }}>Where the cohort gets you</h3>
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

        <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 36, lineHeight: 1.6 }}>
          The work doesn&apos;t change. <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>The system does.</span>
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howItWorksRef} style={{ padding: '100px 24px', background: '#0B0B0F' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="section-title" style={{ maxWidth: 640, margin: '0 auto 8px' }}>From stuck to placed,<br />in three moves</h2>
          </div>

          <style>{`
            .hiw-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            @media(max-width: 768px) {
              .hiw-row { grid-template-columns: 1fr; gap: 14px; }
            }
          `}</style>

          <div className="hiw-row">
            {[
              { num: '01', title: 'Diagnose what\'s blocking you', desc: 'We start by understanding exactly where you\'re stuck — resume, LinkedIn, cold outreach, or targeting. No generic advice. A sharp, honest assessment of what needs to change.', delay: '0s' },
              { num: '02', title: 'Fix your profile and strategy', desc: 'We rebuild your resume and outreach approach for the roles you want — consulting, finance, Founder\'s Office, BD. You get scripts, templates, a target list, and warm introductions.', delay: '0.15s' },
              { num: '03', title: 'Execute until you\'re placed', desc: "Weekly accountability and direct support until you have an offer. We don't disappear after onboarding. We stay until the job is done.", delay: '0.3s' },
            ].map(step => (
              <div
                key={step.num}
                className={`hiw-card${howItWorksVisible ? ' visible' : ''}`}
                style={{ transitionDelay: step.delay, transitionDuration: '0.6s' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 12px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.22)', borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: '#93BBFF', marginBottom: 20 }}>STEP {step.num}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 14 }}>{step.title}</div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.85 }}>{step.desc}</div>
              </div>
            ))}
          </div>

          {/* Proof strip */}
          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Cold emails using our templates get replies within 24 hours on average',
              'Most students land their first interview conversation within 30 days',
              'Students from 50+ colleges across India have gone through this process',
            ].map((fact, i) => (
              <div key={i} className="proof-strip-card">
                <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{fact}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREE TOOLS — convert skeptics with value before any ask */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg, rgba(79,124,255,0.04), transparent)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="section-label">START FREE</span>
            <h2 className="section-title">Don&apos;t trust us yet? Smart.<br />Start with the free stuff.</h2>
            <p style={{ color: 'var(--muted)', fontSize: 17, maxWidth: 560, margin: '8px auto 0', lineHeight: 1.7 }}>
              Everything below is genuinely free. Use it, see how we think, and only then decide if you want us in your corner.
            </p>
          </div>

          <style>{`
            .tools-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            @media(max-width: 860px) { .tools-row { grid-template-columns: 1fr; gap: 14px; } }
          `}</style>

          <div className="tools-row">
            {[
              {
                icon: '🔥',
                title: 'AI Resume Roast',
                badge: 'MOST POPULAR',
                badgeColor: '#ef4444',
                desc: 'Upload your resume. Our AI tells you exactly why recruiters ignore it — brutally, line by line. Takes under a minute.',
                cta: 'Roast my resume →',
                href: '/resources/resume-roast',
              },
              {
                icon: '🎯',
                title: 'Job Tracker',
                badge: 'NEW',
                badgeColor: '#4F7CFF',
                desc: 'Stop tracking 50 applications in your head. Kanban board, follow-up reminders, streaks, and an AI outreach writer.',
                cta: 'Track my applications →',
                href: '/job-tracker',
              },
              {
                icon: '🛠️',
                title: 'Templates & Toolkits',
                badge: 'OPEN ACCESS',
                badgeColor: '#10b981',
                desc: '50 cold email templates, 20 LinkedIn scripts, resume guides and toolkits for 15 roles — the same materials our cohort students use.',
                cta: 'Browse free resources →',
                href: '/free',
              },
            ].map(tool => (
              <a key={tool.title} href={tool.href} className="tool-card" style={{ textDecoration: 'none', color: 'inherit' }} onClick={cta(tool.title, 'free_tools')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ fontSize: 34, lineHeight: 1 }}>{tool.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: '4px 10px', borderRadius: 100, color: tool.badgeColor, background: `${tool.badgeColor}1a`, border: `1px solid ${tool.badgeColor}40` }}>{tool.badge}</span>
                </div>
                <div style={{ fontSize: 21, fontWeight: 800, color: 'white', marginBottom: 12 }}>{tool.title}</div>
                <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 24 }}>{tool.desc}</p>
                <span className="tool-cta">{tool.cta}</span>
              </a>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 36, lineHeight: 1.7 }}>
            Why free? Because once you see what a sharp strategy looks like,{' '}
            <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>you&apos;ll know exactly what working with us feels like.</span>
          </p>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, rgba(79,124,255,0.06), rgba(123,97,255,0.04))', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, textAlign: 'center' }}>
          {[
            { num: '12 Days', label: 'Fastest placement so far' },
            { num: '300+', label: 'Students helped across 50+ colleges' },
            { num: '100%', label: 'Live sessions, never recorded' },
          ].map((s, i) => (
            <div key={i}>
              <div className="stat-num" style={{ color: '#4F7CFF', marginBottom: 8 }}>{s.num}</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      {/* PLACEHOLDER: Replace these cards with real named students, photos, and LinkedIn profile links once collected */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 className="section-title">Students who made it work</h2>
          <p style={{ color: 'var(--muted)', fontSize: 17 }}>Consulting, finance, startups — different paths, same starting point.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {[
            { initial: 'P', name: 'Commerce student, Delhi', role: 'Marketing Intern at a D2C Startup', quote: 'I had zero replies for months. After week 2 of the cohort, I got 3 responses from cold emails. Got my internship offer shortly after.', color: '#4F7CFF', result: 'Internship secured' },
            { initial: 'A', name: 'BBA student, Tier-2 college', role: 'Analyst at a Big 4 Firm', quote: 'My mentor rebuilt my resume and gave me a target company list. Best investment I ever made.', color: '#7B61FF', result: 'Big 4 offer without referral' },
            { initial: 'S', name: 'BCom student, Tier-3 college', role: 'BD Intern at a Series B Startup', quote: 'Nobody from my college had ever cracked a startup this good. The LinkedIn outreach strategy completely changed things for me.', color: '#06b6d4', result: '3 competing offers' },
            { initial: 'R', name: 'BBA graduate, Tier-2 college', role: "Founder's Office at a Leading Startup", quote: 'No campus placements, no referrals. But with the right outreach strategy, I landed my dream role.', color: '#10b981', result: "Founder's Office role" },
            { initial: 'A', name: 'MBA student, Delhi', role: 'Consulting Intern at a Boutique Firm', quote: 'I switched my target from finance to consulting through this cohort. The mentor connections and the strategy made it happen.', color: '#f59e0b', result: 'Career pivot successful' },
            { initial: 'M', name: 'Commerce graduate, Tier-2 college', role: 'Finance Intern at a Fast-Growing Fintech', quote: "This company wasn't even on my radar. My mentor pushed me to apply and helped me prep. The call came through.", color: '#ec4899', result: 'Dream company cracked' },
          ].map((t, i) => (
            <div key={i} className="proof-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, s) => <span key={s} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>)}
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}, #0B0B0F)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{t.initial}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.role}</div>
                </div>
              </div>
              <div style={{ marginTop: 16, padding: '8px 14px', background: `${t.color}15`, border: `1px solid ${t.color}30`, borderRadius: 100, fontSize: 12, fontWeight: 700, color: t.color, display: 'inline-block' }}>{t.result}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDERS */}
      <section style={{ padding: '100px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="section-label">WHO WE ARE</span>
          <h2 className="section-title">Built by people who&apos;ve been exactly where you are</h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 520, margin: '16px auto 0', lineHeight: 1.8 }}>
            No professors. No career coaches who&apos;ve never applied. Just two people who cracked off-campus hiring — and built a system so you don&apos;t have to figure it out alone.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 2, marginBottom: 56 }}>
          {/* Founder 1 */}
          <div style={{ padding: 2, borderRadius: 32, background: 'linear-gradient(145deg, rgba(79,70,229,0.6) 0%, rgba(123,97,255,0.25) 50%, rgba(255,255,255,0.04) 100%)' }}>
            <div style={{ background: 'linear-gradient(160deg, #131020 0%, #0c0b15 100%)', borderRadius: 30, padding: '44px 40px', height: '100%', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', top: -100, left: -60, width: 260, height: 260, background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -80, right: -80, width: 220, height: 220, background: 'radial-gradient(circle, rgba(123,97,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 16, right: 24, fontFamily: 'Georgia,serif', fontSize: 140, lineHeight: 1, color: 'rgba(79,70,229,0.07)', userSelect: 'none', pointerEvents: 'none' }}>&ldquo;</div>
              <Image src="/founders/anirudh.png" alt="Anirudh Agarwal" width={84} height={84} quality={80} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', marginBottom: 24, boxShadow: '0 0 0 5px rgba(79,70,229,0.18), 0 0 40px rgba(79,70,229,0.28)', display: 'block' }} />
              <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 26, fontWeight: 400, color: 'white', marginBottom: 10, lineHeight: 1.2 }}>Anirudh Agarwal</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(79,70,229,0.18)', border: '1px solid rgba(79,70,229,0.35)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 6, letterSpacing: '0.3px' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a5b4fc', display: 'inline-block' }} />
                Associate Consultant @ Aon
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 28, letterSpacing: '0.2px' }}>Christ University, Bangalore</div>
              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(79,70,229,0.4), rgba(123,97,255,0.15), transparent)', marginBottom: 28 }} />
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: 28, position: 'relative', zIndex: 1 }}>
                Cracked consulting off-campus straight after his undergrad. Spent months figuring out what actually gets you interviews — then wrote it down so you don&apos;t have to.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {['Consulting', 'Off-Campus Strategy', 'Cold Outreach'].map(tag => (
                  <span key={tag} style={{ padding: '5px 13px', background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.22)', borderRadius: 100, fontSize: 12, color: '#a5b4fc', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
              <a href="https://www.linkedin.com/in/anirudh-agarwal-36591220b/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'rgba(79,70,229,0.14)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: 12, fontSize: 13, color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                View LinkedIn
              </a>
            </div>
          </div>

          {/* Founder 2 */}
          <div style={{ padding: 2, borderRadius: 32, background: 'linear-gradient(145deg, rgba(6,182,212,0.5) 0%, rgba(8,145,178,0.2) 50%, rgba(255,255,255,0.04) 100%)' }}>
            <div style={{ background: 'linear-gradient(160deg, #0a1418 0%, #0b0f14 100%)', borderRadius: 30, padding: '44px 40px', height: '100%', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', top: -100, left: -60, width: 260, height: 260, background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -80, right: -80, width: 220, height: 220, background: 'radial-gradient(circle, rgba(8,145,178,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 16, right: 24, fontFamily: 'Georgia,serif', fontSize: 140, lineHeight: 1, color: 'rgba(6,182,212,0.07)', userSelect: 'none', pointerEvents: 'none' }}>&ldquo;</div>
              <Image src="/founders/sanya.png" alt="Sanya Srivastava" width={84} height={84} quality={80} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', marginBottom: 24, boxShadow: '0 0 0 5px rgba(6,182,212,0.15), 0 0 40px rgba(6,182,212,0.22)', display: 'block' }} />
              <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 26, fontWeight: 400, color: 'white', marginBottom: 10, lineHeight: 1.2 }}>Sanya Srivastava</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#67e8f9', marginBottom: 6, letterSpacing: '0.3px' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#67e8f9', display: 'inline-block' }} />
                FP&amp;A @ Palo Alto Networks
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 28, letterSpacing: '0.2px' }}>Finance · Corporate Strategy</div>
              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(6,182,212,0.4), rgba(8,145,178,0.15), transparent)', marginBottom: 28 }} />
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: 28, position: 'relative', zIndex: 1 }}>
                Built a career in finance and corporate strategy at a global tech company — without the &ldquo;right&rdquo; pedigree. Knows exactly what finance and strategy roles look for, and how to get there when no one hands you a roadmap.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {['Finance', 'FP&A', 'Corporate Strategy'].map(tag => (
                  <span key={tag} style={{ padding: '5px 13px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.22)', borderRadius: 100, fontSize: 12, color: '#67e8f9', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
              <a href="https://www.linkedin.com/in/sanya-srivastava-bb8806273/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 12, fontSize: 13, color: '#67e8f9', textDecoration: 'none', fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                View LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* shared quote */}
        <div style={{ textAlign: 'center', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: i === 1 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)' }} />)}
            </div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
          </div>
          <p style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 'clamp(20px, 3vw, 28px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, fontStyle: 'italic', maxWidth: 600, margin: '0 auto' }}>
            &ldquo;We built this because the system wasn&apos;t built for us.<br />Now it&apos;s built for you.&rdquo;
          </p>
        </div>
      </section>

      {/* PROGRAMS — the ask, made after value and proof */}
      <section id="programs" style={{ padding: '80px 24px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-label">WORK WITH US</span>
          <h2 className="section-title">Two ways to work with us</h2>
          <p style={{ color: 'var(--muted)', fontSize: 17, marginBottom: 24 }}>Both are live programs with real mentors — pick the one that fits your goal.</p>
          <div className="ladder">
            <span>Start with the free tools</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
            <span>Test us with a ₹549 strategy call</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
            <span style={{ color: '#93BBFF' }}>Join a cohort when you&apos;re ready</span>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 18, lineHeight: 1.6 }}>
            One-time payment · no subscriptions · most students see <span style={{ color: '#93BBFF', fontWeight: 700 }}>25+ cold email replies</span> in their first 2 weeks of doing the work.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

          {/* Internship Cohort — lighter */}
          <div className="product-card" style={{ background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ display: 'inline-flex', padding: '6px 16px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 24, letterSpacing: 1 }}>INTERNSHIP COHORT</div>
            <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 30, marginBottom: 6, lineHeight: 1.1 }}>Internship Cohort</div>
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
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 32px', borderRadius: 100, background: 'transparent', color: '#fbbf24', fontWeight: 700, fontSize: 15, border: '1.5px solid rgba(245,158,11,0.45)', transition: 'all 0.3s', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.45)'; }}>
              Explore Internship Cohort →
            </a>
          </div>

          {/* Placement Cohort — bolder */}
          <div className="product-card" style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.08), rgba(79,124,255,0.05))', border: '1px solid rgba(123,97,255,0.3)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', background: '#4F7CFF', borderRadius: '0 0 16px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap', color: 'white' }}>MOST POPULAR</div>
            <div style={{ display: 'inline-flex', padding: '6px 16px', background: 'rgba(123,97,255,0.15)', border: '1px solid rgba(123,97,255,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#C4B5FD', marginBottom: 24, letterSpacing: 1, marginTop: 20 }}>PLACEMENT COHORT</div>
            <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 30, marginBottom: 6, lineHeight: 1.1 }}>Placement Cohort</div>
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
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 32px', borderRadius: 100, background: 'linear-gradient(135deg, #7B61FF, #4F7CFF)', color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 0 40px rgba(123,97,255,0.4)', transition: 'all 0.3s', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}>
              Explore Placement Cohort →
            </a>
          </div>

        </div>

        {/* Honest scarcity + risk reversal */}
        <div style={{ textAlign: 'center', marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
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

      {/* COMPARISON TABLE */}
      <section style={{ padding: '100px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-label">COMPARE</span>
          <h2 className="section-title">Why students keep choosing this</h2>
          <p style={{ color: 'var(--muted)', fontSize: 17, marginTop: 8 }}>Same goal. Three very different paths.</p>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as never, borderRadius: 28, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.012)' }}>
          <table className="comp-table" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th className="ct-corner"></th>
                <th className="ct-head ct-head-other">
                  <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 17, fontWeight: 400, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Watching YouTube</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Self-study path</div>
                </th>
                <th className="ct-head ct-head-bc">
                  <div className="ct-bc-badge">★ RECOMMENDED</div>
                  <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 20, fontWeight: 400, color: 'white', marginBottom: 6 }}>Beyond Campus</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#93BBFF' }}>Most students start here</div>
                </th>
                <th className="ct-head ct-head-other">
                  <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 17, fontWeight: 400, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Pre-recorded courses</div>
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

        <div style={{ textAlign: 'center', marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/cohort" className="btn-primary" style={{ fontFamily: 'inherit', fontSize: 15, padding: '14px 32px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }} onClick={cta('placement_cohort', 'compare')}>
            <span>Explore Placement Cohort</span>
            <span style={{ position: 'relative', zIndex: 1 }}>→</span>
          </a>
          <a href="/summer" onClick={cta('internship_cohort', 'compare')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 100, background: 'rgba(245,158,11,0.06)', color: '#fbbf24', fontWeight: 600, fontSize: 15, border: '1.5px solid rgba(245,158,11,0.4)', transition: 'all 0.3s', textDecoration: 'none', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.65)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}>
            Explore Internship Cohort →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '100px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Questions we always get</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: '#111827', border: `1px solid ${openFaq === i ? 'rgba(79,124,255,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.3s' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: openFaq === i ? 'white' : 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{faq.q}</span>
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

      {/* FINAL CTA — one last fork: ready (cohort) or not ready (free roast) */}
      <section style={{ padding: '80px 24px 100px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.1), rgba(123,97,255,0.08))', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 28, padding: '56px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', animation: 'border-glow 4s ease-in-out infinite' }}>
          <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, background: 'radial-gradient(circle, rgba(79,124,255,0.2), transparent)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <h2 style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 16, lineHeight: 1.15 }}>
            Your next offer is one email<br />away from being sent.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, maxWidth: 560, margin: '0 auto 36px', color: 'rgba(255,255,255,0.78)' }}>
            Most students who follow the system see{' '}
            <span style={{ color: '#93BBFF', fontWeight: 700 }}>25+ cold email replies</span>{' '}
            in their first 2 weeks. Yours could start this week.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="/cohort" className="btn-primary" style={{ fontSize: 17, padding: '18px 40px', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }} onClick={cta('placement_cohort', 'final_cta')}>
                <span>Explore Placement Cohort</span>
                <span style={{ position: 'relative', zIndex: 1 }}>→</span>
              </a>
              <a href="/resources/resume-roast" className="btn-secondary" style={{ fontSize: 17, padding: '17px 40px', fontFamily: 'inherit', textDecoration: 'none' }} onClick={cta('roast', 'final_cta')}>
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

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px 32px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 24, marginBottom: 6 }}>Beyond<span style={{ color: 'var(--blue)' }}>Campus</span></div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>Breaking campus barriers since 2023</div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/summer" onClick={cta('internship_cohort', 'footer')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 100, background: 'rgba(245,158,11,0.06)', color: '#fbbf24', fontWeight: 600, fontSize: 14, border: '1.5px solid rgba(245,158,11,0.35)', transition: 'all 0.3s', textDecoration: 'none', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)'; }}>
              Internship Cohort →
            </a>
            <a href="/cohort" className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }} onClick={cta('placement_cohort', 'footer')}>
              <span>Placement Cohort</span>
              <span style={{ position: 'relative', zIndex: 1 }}>→</span>
            </a>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>© {new Date().getFullYear()} Beyond Campus. All rights reserved.</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>beyond-campus.in</p>
        </div>
      </footer>
    </main>
  )
}
