'use client'

import { useState, useEffect } from 'react'
import UnlockPopup from '../../components/UnlockPopup'

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type PersonaKey = 'All' | 'HR / Recruiter' | 'Founder' | 'Alumni & Peers' | 'Network' | 'Direct Ask' | 'Follow-Up' | 'Creative'

type Script = {
  id: number
  title: string
  body: string
  persona: PersonaKey
  tip: string
}

/* ─────────────────────────────────────────────
   SCRIPT DATA
───────────────────────────────────────────── */
const LINKEDIN_SCRIPTS: Script[] = [
  {
    id: 1,
    title: 'Cold HR DM',
    persona: 'HR / Recruiter',
    body: `Hi [Name], I came across [Company] while researching summer internship opportunities in [Domain]. I'm a [Year] [Degree] student at [College] — genuinely interested in your team specifically because [one reason]. Would you be open to a quick 10-minute call? Happy to share my resume.`,
    tip: 'Mention one specific reason you\'re targeting this company — not "I like your culture" but something real like a product, a recent hire, or a market position.',
  },
  {
    id: 2,
    title: 'Founder DM',
    persona: 'Founder',
    body: `Hi [Name], been following [Company] since [milestone] — what you're building in [space] is genuinely exciting. I'm looking for a summer internship where I can do real work at a company that's moving fast. Any chance there's room for someone like me on the team?`,
    tip: 'Founders respond to energy and conviction. Skip the resume talk — lead with what excites you about what they\'re building.',
  },
  {
    id: 3,
    title: 'Alumni DM',
    persona: 'Alumni & Peers',
    body: `Hi [Name], I noticed you went to [College] — I'm currently in [Year] year there. I've been targeting [Company] for my summer internship and your experience there stood out. Would you be open to a 10-minute call? Any perspective you can share would mean a lot.`,
    tip: 'The shared college is your in. Don\'t bury it. Lead with it in the first sentence so they recognise the connection immediately.',
  },
  {
    id: 4,
    title: 'Second Degree Connection',
    persona: 'Network',
    body: `Hi [Name], [Mutual connection] suggested I reach out. I'm a [Degree] student at [College] looking for a summer internship in [Domain]. Would love to learn about your experience at [Company] and whether there might be an opening.`,
    tip: 'Always name the mutual connection. "A friend suggested" doesn\'t work. "[First name] said you\'d be the right person to talk to" does.',
  },
  {
    id: 5,
    title: 'Post Engagement DM',
    persona: 'Network',
    body: `Hi [Name], I've been following your posts on [topic] for a while — your perspective on [specific post] really resonated. I'm exploring summer internships in [Domain] and [Company] is high on my list. Would you be open to a quick chat?`,
    tip: 'Be specific about the post. Quoting a line or referencing the central idea shows you actually read it — not just that you scanned the headline.',
  },
  {
    id: 6,
    title: 'After Connecting',
    persona: 'Network',
    body: `Hi [Name], thanks for connecting! I reached out because I've been targeting [Company] for a summer internship in [Domain]. Would you be open to sharing any insight about the team or pointing me toward the right person to speak to?`,
    tip: 'Send this within 24 hours of them accepting your request. The longer you wait, the colder the lead.',
  },
  {
    id: 7,
    title: 'The One-Liner DM',
    persona: 'Direct Ask',
    body: `Hi [Name] — [Year] [Degree] student at [College], looking for a summer internship at [Company]. Worth a 10-minute call?`,
    tip: 'Works best for busy senior people who get a lot of messages. Brevity signals confidence and respect for their time.',
  },
  {
    id: 8,
    title: 'The Specific Ask',
    persona: 'Direct Ask',
    body: `Hi [Name], I'm [Your Name] from [College]. I've been researching [Company]'s [team/product/market] and I have a few specific questions I think only someone with your experience could answer. Would you have 10 minutes this week?`,
    tip: 'The phrase "only someone with your experience" is deliberate — it\'s flattering without being sycophantic, and it frames you as a serious researcher.',
  },
  {
    id: 9,
    title: 'The Career Pivot DM',
    persona: 'Creative',
    body: `Hi [Name], your journey from [background] to [Domain] at [Company] is exactly the path I'm trying to build. I'm a [Year] student at [College] trying to make a similar move. Would you be open to sharing how you got there?`,
    tip: 'This works when you\'ve done real LinkedIn research. Reference their actual career story — the pivot year, the role they moved from. Generic versions fall flat.',
  },
  {
    id: 10,
    title: 'The Event Follow-Up',
    persona: 'Follow-Up',
    body: `Hi [Name], I attended [event/webinar] where you spoke on [topic] — your point about [specific thing] really stuck with me. I'm looking for a summer internship in [Domain] and [Company] is high on my list. Would love to connect properly.`,
    tip: 'Quote the specific thing they said. Not just "your talk was great." One sentence that shows you were actually in the room, listening.',
  },
  {
    id: 11,
    title: 'The Referral Ask',
    persona: 'Direct Ask',
    body: `Hi [Name], I'll be direct — I'm looking for a summer internship at [Company] and I was hoping you'd be open to either a referral or pointing me toward the right person. I've done [one relevant thing]. Happy to share my resume.`,
    tip: 'The directness of "I\'ll be direct" actually works in your favour. People appreciate not being manipulated into a conversation they didn\'t sign up for.',
  },
  {
    id: 12,
    title: "The 'I've Done My Research' DM",
    persona: 'Creative',
    body: `Hi [Name], I've spent the last month researching [Company] — your [product/approach/market] is something I genuinely find fascinating. I'm a [Year] student at [College] looking for a summer internship where I can go deep on [area]. Any chance we could chat?`,
    tip: '"The last month" signals commitment. Combine it with one specific insight about their product or market to show you\'re not just saying it.',
  },
  {
    id: 13,
    title: 'The Mutual Interest DM',
    persona: 'Network',
    body: `Hi [Name], I noticed we're both interested in [topic/industry] — your work at [Company] on [specific thing] caught my attention. I'm a student exploring this space for my summer internship. Would you have 10 minutes to share your perspective?`,
    tip: 'Shared interests create psychological proximity. Find one real overlap from their profile — a niche topic, a side project, a shared book or talk.',
  },
  {
    id: 14,
    title: 'The City Connection',
    persona: 'Creative',
    body: `Hi [Name], I noticed you're based in [City] — I'll be there this summer. I've been targeting [Company] for my internship search and your profile came up. Would you be open to a coffee or quick call?`,
    tip: 'In-person offers convert better than call offers. "Coffee in [city]" is warm, low-stakes, and memorable.',
  },
  {
    id: 15,
    title: "The 'No Opening' DM",
    persona: 'Creative',
    body: `Hi [Name], I know [Company] may not have a formal internship opening — but I wanted to reach out anyway. I'm a [Year] student at [College] willing to work on a project basis if that's what makes sense. Any chance there's a way to contribute this summer?`,
    tip: '"Project basis" removes the friction of a formal hire. It signals flexibility and often gets you in the door at companies with no active JD.',
  },
  {
    id: 16,
    title: 'The Follow-Up DM',
    persona: 'Follow-Up',
    body: `Hi [Name], I sent a connection request last week along with a note about a summer internship at [Company]. Just wanted to follow up — still very interested and happy to share more about my background.`,
    tip: 'One follow-up after 5–7 days is expected and professional. Two is the max. Keep it short — resist the urge to over-explain.',
  },
  {
    id: 17,
    title: 'The Gratitude DM',
    persona: 'Follow-Up',
    body: `Hi [Name], I just read your article/post on [topic] — genuinely one of the most useful things I've read on [subject]. I'm a student exploring [Domain] for my career and I'd love to ask you a few questions if you ever have 10 minutes.`,
    tip: 'This is the softest open. No internship ask upfront — just genuine appreciation. The internship ask comes after they respond.',
  },
  {
    id: 18,
    title: 'Peer-to-Peer DM',
    persona: 'Alumni & Peers',
    body: `Hi [Name], I saw you graduated from [College] last year and landed at [Company] — that's exactly the path I'm trying to build. I'm in [Year] year now and would love to hear how you approached the internship search. Would you be open to a quick chat?`,
    tip: 'Recent grads (1–3 years out) are the most likely to respond. They remember what the search felt like and want to help.',
  },
  {
    id: 19,
    title: 'The Bold DM',
    persona: 'Direct Ask',
    body: `Hi [Name], I want to intern at [Company] this summer. I've done my research, I know what your team works on, and I genuinely think I can contribute. Would you be the right person to speak to, or can you point me in the right direction?`,
    tip: 'This only works when you can back it up. Have your research ready — company priorities, team work, a specific angle. The boldness earns a response; the substance earns a call.',
  },
  {
    id: 20,
    title: 'The Last Resort DM',
    persona: 'Follow-Up',
    body: `Hi [Name], I tried reaching you by email but it may have bounced. I'm [Your Name], a [Year] student at [College] looking for a summer internship at [Company]. Would you be open to connecting here instead?`,
    tip: 'Use this when you\'ve already tried email and got no response. It signals persistence without desperation — and gives them a simpler channel to respond through.',
  },
]

const PERSONAS: PersonaKey[] = ['All', 'HR / Recruiter', 'Founder', 'Alumni & Peers', 'Network', 'Direct Ask', 'Follow-Up', 'Creative']

const PERSONA_COLORS: Record<PersonaKey, { color: string; bg: string; border: string }> = {
  'All':           { color: '#93BBFF', bg: 'rgba(79,124,255,0.12)',  border: 'rgba(79,124,255,0.3)' },
  'HR / Recruiter':{ color: '#7dd3fc', bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.3)' },
  'Founder':       { color: '#c4b5fd', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
  'Alumni & Peers':{ color: '#86efac', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)'  },
  'Network':       { color: '#fda4af', bg: 'rgba(244,63,94,0.10)',  border: 'rgba(244,63,94,0.28)' },
  'Direct Ask':    { color: '#fcd34d', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  'Follow-Up':     { color: '#fdba74', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
  'Creative':      { color: '#f0abfc', bg: 'rgba(217,70,239,0.10)', border: 'rgba(217,70,239,0.28)'},
}

function buildScriptText(s: Script) {
  return `LinkedIn Script ${String(s.id).padStart(2, '0')} — ${s.title}\n\n${s.body}`
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function LinkedInScriptsPage() {
  const [copiedId, setCopiedId]     = useState<string | null>(null)
  const [copiedAll, setCopiedAll]   = useState(false)
  const [emailUnlocked, setEmailUnlocked] = useState(false)
  const [fullyUnlocked, setFullyUnlocked] = useState(false)
  const [showPopup, setShowPopup]       = useState(false)
  const [popupEmailOption, setPopupEmailOption] = useState(true)
  const [persona, setPersona]           = useState<PersonaKey>('All')

  useEffect(() => {
    const emailUnlockedVal = localStorage.getItem('linkedinScriptsEmailUnlocked') === 'true'
    const fullyUnlockedVal = localStorage.getItem('resourcePackUnlocked') === 'true'
    setEmailUnlocked(emailUnlockedVal)
    setFullyUnlocked(fullyUnlockedVal)

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
            setEmailUnlocked(false)
          }
        })
        .catch(() => {})
    }
  }, [])

  // Email unlocks first 4 scripts; beyond that, paid only
  const EMAIL_UNLOCK_COUNT = 4
  const visibleCount = fullyUnlocked ? Infinity : emailUnlocked ? EMAIL_UNLOCK_COUNT : 0

  const openPopup = (globalIdx: number) => {
    // Show email option only if the script can be email-unlocked and email not yet submitted
    setPopupEmailOption(globalIdx < EMAIL_UNLOCK_COUNT && !emailUnlocked)
    setShowPopup(true)
  }

  const filteredScripts = persona === 'All'
    ? LINKEDIN_SCRIPTS
    : LINKEDIN_SCRIPTS.filter(s => s.persona === persona)

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyAll = () => {
    if (!fullyUnlocked) { openPopup(EMAIL_UNLOCK_COUNT); return }
    const all = LINKEDIN_SCRIPTS.map(buildScriptText).join('\n\n' + '─'.repeat(60) + '\n\n')
    navigator.clipboard.writeText(all).catch(() => {})
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const bannerText = fullyUnlocked
    ? 'All 20 scripts unlocked ✓'
    : emailUnlocked
    ? '4 of 20 unlocked · Unlock all 20 →'
    : 'Enter email to unlock 4 scripts free ↓'

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}

        /* Script cards */
        .script-card{
          background:#111827;
          border:1px solid rgba(255,255,255,0.07);
          border-radius:24px;
          padding:36px 44px;
          transition:border-color 0.25s,box-shadow 0.25s;
          position:relative;
          overflow:hidden;
        }
        .script-card:hover:not(.locked){
          border-color:rgba(79,124,255,0.22);
          box-shadow:0 8px 48px rgba(79,124,255,0.06);
        }
        .script-card.locked{
          background:#0e1520;
          border-color:rgba(255,255,255,0.04);
        }

        /* Large watermark number */
        .script-watermark{
          position:absolute;
          right:36px;
          top:50%;
          transform:translateY(-50%);
          font-family:'DM Serif Display',serif;
          font-size:120px;
          color:rgba(255,255,255,0.04);
          pointer-events:none;
          user-select:none;
          line-height:1;
        }

        /* Script number (inline) */
        .script-num{
          font-family:'DM Serif Display',serif;
          font-size:44px;
          line-height:1;
          color:rgba(79,124,255,0.22);
          flex-shrink:0;
          width:52px;
          text-align:center;
          padding-top:2px;
        }
        .script-num.locked-num{color:rgba(255,255,255,0.06)}

        /* Script body */
        .script-body{
          background:rgba(255,255,255,0.04);
          border-radius:14px;
          padding:22px 26px;
          font-family:'Courier New',Courier,monospace;
          font-size:14px;
          line-height:1.85;
          color:rgba(255,255,255,0.82);
          white-space:pre-wrap;
          word-break:break-word;
          border:1px solid rgba(255,255,255,0.06);
          transition:filter 0.4s ease;
          margin-top:20px;
        }
        .script-body.blurred{filter:blur(6px);user-select:none;pointer-events:none}

        /* Pro tip row */
        .tip-row{
          display:flex;
          align-items:flex-start;
          gap:12px;
          margin-top:18px;
          padding:14px 18px;
          background:rgba(79,124,255,0.05);
          border:1px solid rgba(79,124,255,0.12);
          border-radius:12px;
        }
        .tip-label{
          font-size:10px;
          font-weight:800;
          letter-spacing:2px;
          text-transform:uppercase;
          color:rgba(79,124,255,0.6);
          flex-shrink:0;
          padding-top:1px;
          min-width:34px;
        }
        .tip-text{
          font-size:14px;
          color:rgba(255,255,255,0.5);
          line-height:1.7;
        }

        /* Lock overlay */
        .lock-overlay{
          position:absolute;
          inset:0;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:10px;
          cursor:pointer;
          border-radius:14px;
          background:rgba(11,11,15,0.4);
          backdrop-filter:blur(2px);
        }

        /* Copy button */
        .copy-btn{
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:8px 18px;
          border-radius:10px;
          border:1px solid rgba(255,255,255,0.12);
          background:rgba(255,255,255,0.05);
          color:rgba(255,255,255,0.55);
          font-size:12px;
          font-weight:700;
          cursor:pointer;
          transition:all 0.15s;
          font-family:'DM Sans',sans-serif;
          flex-shrink:0;
          letter-spacing:0.3px;
        }
        .copy-btn:hover{background:rgba(79,124,255,0.15);border-color:rgba(79,124,255,0.35);color:#93BBFF}
        .copy-btn.copied{background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.35);color:#6ee7b7}

        /* Persona tabs */
        .persona-tab{
          padding:8px 18px;
          border-radius:100px;
          font-size:13px;
          font-weight:700;
          cursor:pointer;
          border:1px solid transparent;
          transition:all 0.15s;
          white-space:nowrap;
          background:transparent;
          color:rgba(255,255,255,0.4);
          font-family:'DM Sans',sans-serif;
        }
        .persona-tab:hover:not(.active){background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.65)}

        /* Section header */
        .section-header{
          font-size:11px;
          font-weight:800;
          letter-spacing:2.5px;
          text-transform:uppercase;
          color:rgba(255,255,255,0.22);
          display:flex;
          align-items:center;
          gap:12px;
          margin-bottom:24px;
        }
        .section-header::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.06)}

        /* Scrollbar hide */
        .filter-scroll::-webkit-scrollbar{display:none}
        @media(max-width:640px){
          .top-bar-title{display:none}
          .script-card{padding:28px 24px}
          .script-watermark{font-size:80px;right:16px}
        }
      `}</style>

      <UnlockPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onEmailUnlock={() => setEmailUnlocked(true)}
        resourceName="LinkedIn Scripts"
        localStorageKey="linkedinScripts"
        showEmailOption={popupEmailOption}
        emailAlreadySubmitted={emailUnlocked}
      />

      {/* ── TOP BAR ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5, flexShrink: 0 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <span className="top-bar-title" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>LinkedIn DM Scripts — 20 Templates</span>
        <button
          onClick={copyAll}
          style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 8, border: `1px solid ${copiedAll ? 'rgba(16,185,129,0.35)' : fullyUnlocked ? 'rgba(79,124,255,0.35)' : 'rgba(245,158,11,0.3)'}`, background: copiedAll ? 'rgba(16,185,129,0.12)' : fullyUnlocked ? 'rgba(79,124,255,0.1)' : 'rgba(245,158,11,0.08)', color: copiedAll ? '#6ee7b7' : fullyUnlocked ? '#93BBFF' : '#fcd34d', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' }}
        >
          {copiedAll ? 'Copied ✓' : fullyUnlocked ? 'Copy All 20' : 'Unlock to Copy All'}
        </button>
      </div>

      {/* ── HERO ── */}
      <section style={{ padding: '72px 24px 52px', textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.28)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#93BBFF', textTransform: 'uppercase', marginBottom: 24 }}>
          Free Resource
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(36px,5.5vw,58px)', fontWeight: 400, letterSpacing: -1, lineHeight: 1.05, marginBottom: 20 }}>
          LinkedIn DM Scripts
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.85, maxWidth: 520, margin: '0 auto 32px' }}>
          20 proven DM templates to reach HRs, founders, alumni, and hiring managers — personalised by persona, designed to get replies.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          {[
            { label: '20 DM Scripts', color: '#93BBFF', bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.25)' },
            { label: '8 Personas', color: '#7dd3fc', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.25)' },
            { label: 'Pro Tips Included', color: '#fcd34d', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
          ].map(p => (
            <span key={p.label} style={{ padding: '8px 20px', borderRadius: 100, background: p.bg, border: `1px solid ${p.border}`, color: p.color, fontSize: 13, fontWeight: 700 }}>{p.label}</span>
          ))}
        </div>
        <div
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRadius: 100, background: fullyUnlocked ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.06)', border: `1px solid ${fullyUnlocked ? 'rgba(16,185,129,0.22)' : 'rgba(245,158,11,0.2)'}`, cursor: fullyUnlocked ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, color: fullyUnlocked ? '#6ee7b7' : '#fcd34d' }}
          onClick={() => { if (!fullyUnlocked) openPopup(0) }}
        >
          {bannerText}
        </div>
      </section>

      {/* ── PERSONA FILTER ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
        <div className="section-header">Filter by persona</div>
        <div className="filter-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {PERSONAS.map(p => {
            const c = PERSONA_COLORS[p]
            const isActive = persona === p
            return (
              <button
                key={p}
                className={`persona-tab${isActive ? ' active' : ''}`}
                onClick={() => setPersona(p)}
                style={isActive ? { background: c.bg, border: `1px solid ${c.border}`, color: c.color } : {}}
              >
                {p}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── SCRIPTS ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {filteredScripts.map((s) => {
          const globalIdx = LINKEDIN_SCRIPTS.indexOf(s)
          const isLocked  = globalIdx >= visibleCount
          const copyId    = `script-${s.id}`
          const wasCopied = copiedId === copyId
          const pc        = PERSONA_COLORS[s.persona]

          return (
            <div key={s.id} className={`script-card${isLocked ? ' locked' : ''}`}>
              <span className="script-watermark">{String(s.id).padStart(2, '0')}</span>

              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                <span className={`script-num${isLocked ? ' locked-num' : ''}`}>
                  {String(s.id).padStart(2, '0')}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 100, background: pc.bg, border: `1px solid ${pc.border}`, color: pc.color, fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>
                      {s.persona}
                    </span>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: isLocked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.9)', letterSpacing: -0.3 }}>
                      {s.title}
                    </h2>
                  </div>
                </div>
                {!isLocked && (
                  <button
                    className={`copy-btn${wasCopied ? ' copied' : ''}`}
                    onClick={() => copy(buildScriptText(s), copyId)}
                    style={{ marginTop: 2 }}
                  >
                    {wasCopied ? 'Copied ✓' : 'Copy'}
                  </button>
                )}
              </div>

              {/* Script body */}
              <div style={{ position: 'relative' }}>
                <div className={`script-body${isLocked ? ' blurred' : ''}`}>{s.body}</div>
                {isLocked && (
                  <div className="lock-overlay" onClick={() => openPopup(globalIdx)}>
                    <span style={{ fontSize: 24 }}>🔒</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
                      {globalIdx < EMAIL_UNLOCK_COUNT && !emailUnlocked
                        ? 'Enter your email to unlock 4 scripts free'
                        : 'Unlock all 20 scripts via Summer Program or Cohort'}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); openPopup(globalIdx) }}
                      style={{ padding: '8px 22px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#fcd34d', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                    >
                      {globalIdx < EMAIL_UNLOCK_COUNT && !emailUnlocked ? 'Unlock Free →' : 'Get Access →'}
                    </button>
                  </div>
                )}
              </div>

              {/* Pro tip */}
              {!isLocked && (
                <div className="tip-row">
                  <span className="tip-label">Tip</span>
                  <span className="tip-text">{s.tip}</span>
                </div>
              )}
            </div>
          )
        })}

        {/* Empty state for filtered results */}
        {filteredScripts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>
            No scripts in this category
          </div>
        )}
      </div>

      {/* ── BOTTOM CTA ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '72px 24px 88px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(24px,4vw,36px)', fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 16 }}>
            Scripts get you in the door.<br />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Strategy gets you placed.</span>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.85, marginBottom: 36 }}>
            Pair these scripts with the full Cold Email Pack and an off-campus strategy that actually works.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/resources/cold-email-pack"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 100, background: 'rgba(79,124,255,0.12)', border: '1.5px solid rgba(79,124,255,0.35)', color: '#93BBFF', fontWeight: 700, fontSize: 14 }}
            >
              Cold Email Pack →
            </a>
            <a
              href="/summer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 100, background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: 'white', fontWeight: 700, fontSize: 14, boxShadow: '0 0 28px rgba(245,158,11,0.3)' }}
            >
              Join Summer Program — ₹699 →
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
