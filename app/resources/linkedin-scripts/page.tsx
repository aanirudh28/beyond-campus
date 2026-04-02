'use client'

import { useState, useEffect } from 'react'
import UnlockPopup from '../../components/UnlockPopup'

type Script = {
  id: number
  title: string
  body: string
}

const LINKEDIN_SCRIPTS: Script[] = [
  { id: 1,  title: 'Cold HR DM',                    body: `Hi [Name], I came across [Company] while researching summer internship opportunities in [Domain]. I'm a [Year] [Degree] student at [College] — genuinely interested in your team specifically because [one reason]. Would you be open to a quick 10-minute call? Happy to share my resume.` },
  { id: 2,  title: 'Founder DM',                    body: `Hi [Name], been following [Company] since [milestone] — what you're building in [space] is genuinely exciting. I'm looking for a summer internship where I can do real work at a company that's moving fast. Any chance there's room for someone like me on the team?` },
  { id: 3,  title: 'Alumni DM',                     body: `Hi [Name], I noticed you went to [College] — I'm currently in [Year] year there. I've been targeting [Company] for my summer internship and your experience there stood out. Would you be open to a 10-minute call? Any perspective you can share would mean a lot.` },
  { id: 4,  title: 'Second Degree Connection',      body: `Hi [Name], [Mutual connection] suggested I reach out. I'm a [Degree] student at [College] looking for a summer internship in [Domain]. Would love to learn about your experience at [Company] and whether there might be an opening.` },
  { id: 5,  title: 'Post Engagement DM',            body: `Hi [Name], I've been following your posts on [topic] for a while — your perspective on [specific post] really resonated. I'm exploring summer internships in [Domain] and [Company] is high on my list. Would you be open to a quick chat?` },
  { id: 6,  title: 'After Connecting',              body: `Hi [Name], thanks for connecting! I reached out because I've been targeting [Company] for a summer internship in [Domain]. Would you be open to sharing any insight about the team or pointing me toward the right person to speak to?` },
  { id: 7,  title: 'The One-Liner DM',              body: `Hi [Name] — [Year] [Degree] student at [College], looking for a summer internship at [Company]. Worth a 10-minute call?` },
  { id: 8,  title: 'The Specific Ask',              body: `Hi [Name], I'm [Your Name] from [College]. I've been researching [Company]'s [team/product/market] and I have a few specific questions I think only someone with your experience could answer. Would you have 10 minutes this week?` },
  { id: 9,  title: 'The Career Pivot DM',           body: `Hi [Name], your journey from [background] to [Domain] at [Company] is exactly the path I'm trying to build. I'm a [Year] student at [College] trying to make a similar move. Would you be open to sharing how you got there?` },
  { id: 10, title: 'The Event Follow-Up',           body: `Hi [Name], I attended [event/webinar] where you spoke on [topic] — your point about [specific thing] really stuck with me. I'm looking for a summer internship in [Domain] and [Company] is high on my list. Would love to connect properly.` },
  { id: 11, title: 'The Referral Ask',              body: `Hi [Name], I'll be direct — I'm looking for a summer internship at [Company] and I was hoping you'd be open to either a referral or pointing me toward the right person. I've done [one relevant thing]. Happy to share my resume.` },
  { id: 12, title: "The 'I've Done My Research' DM", body: `Hi [Name], I've spent the last month researching [Company] — your [product/approach/market] is something I genuinely find fascinating. I'm a [Year] student at [College] looking for a summer internship where I can go deep on [area]. Any chance we could chat?` },
  { id: 13, title: 'The Mutual Interest DM',        body: `Hi [Name], I noticed we're both interested in [topic/industry] — your work at [Company] on [specific thing] caught my attention. I'm a student exploring this space for my summer internship. Would you have 10 minutes to share your perspective?` },
  { id: 14, title: 'The City Connection',           body: `Hi [Name], I noticed you're based in [City] — I'll be there this summer. I've been targeting [Company] for my internship search and your profile came up. Would you be open to a coffee or quick call?` },
  { id: 15, title: "The 'No Opening' DM",           body: `Hi [Name], I know [Company] may not have a formal internship opening — but I wanted to reach out anyway. I'm a [Year] student at [College] willing to work on a project basis if that's what makes sense. Any chance there's a way to contribute this summer?` },
  { id: 16, title: 'The Follow-Up DM',              body: `Hi [Name], I sent a connection request last week along with a note about a summer internship at [Company]. Just wanted to follow up — still very interested and happy to share more about my background.` },
  { id: 17, title: 'The Gratitude DM',              body: `Hi [Name], I just read your article/post on [topic] — genuinely one of the most useful things I've read on [subject]. I'm a student exploring [Domain] for my career and I'd love to ask you a few questions if you ever have 10 minutes.` },
  { id: 18, title: 'Peer-to-Peer DM',               body: `Hi [Name], I saw you graduated from [College] last year and landed at [Company] — that's exactly the path I'm trying to build. I'm in [Year] year now and would love to hear how you approached the internship search. Would you be open to a quick chat?` },
  { id: 19, title: 'The Bold DM',                   body: `Hi [Name], I want to intern at [Company] this summer. I've done my research, I know what your team works on, and I genuinely think I can contribute. Would you be the right person to speak to, or can you point me in the right direction?` },
  { id: 20, title: 'The Last Resort DM',            body: `Hi [Name], I tried reaching you by email but it may have bounced. I'm [Your Name], a [Year] student at [College] looking for a summer internship at [Company]. Would you be open to connecting here instead?` },
]

function buildScriptText(s: Script) {
  return `LinkedIn Script ${String(s.id).padStart(2,'0')} — ${s.title}\n\n${s.body}`
}

export default function LinkedInScriptsPage() {
  const [copiedId, setCopiedId]   = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [emailUnlocked, setEmailUnlocked]   = useState(false)
  const [fullyUnlocked, setFullyUnlocked]   = useState(false)
  const [showPopup, setShowPopup]           = useState(false)

  useEffect(() => {
    setEmailUnlocked(localStorage.getItem('linkedinScriptsEmailUnlocked') === 'true')
    setFullyUnlocked(localStorage.getItem('resourcePackUnlocked') === 'true')
  }, [])

  const visibleCount = fullyUnlocked ? Infinity : emailUnlocked ? 4 : 2

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyAll = () => {
    if (!fullyUnlocked) { setShowPopup(true); return }
    const all = LINKEDIN_SCRIPTS.map(buildScriptText).join('\n\n' + '─'.repeat(60) + '\n\n')
    navigator.clipboard.writeText(all).catch(() => {})
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const bannerText = fullyUnlocked
    ? 'All 20 scripts unlocked ✓'
    : emailUnlocked
    ? '4 of 20 unlocked · Get all 20 scripts for ₹199 →'
    : 'Showing 2 of 20 scripts · Enter email to unlock 2 more free ↓'

  return (
    <main style={{ background:'#0B0B0F', color:'#fff', minHeight:'100vh', fontFamily:"'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        .script-card{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;transition:border-color 0.2s,box-shadow 0.2s}
        .script-card:hover{border-color:rgba(14,165,233,0.3);box-shadow:0 8px 32px rgba(14,165,233,0.07)}
        .copy-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:"DM Sans",sans-serif;flex-shrink:0}
        .copy-btn:hover{background:rgba(14,165,233,0.15);border-color:rgba(14,165,233,0.35);color:#7dd3fc}
        .copy-btn.copied{background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.35);color:#6ee7b7}
        .code-block{background:rgba(255,255,255,0.04);border-radius:10px;padding:16px 18px;font-family:'Courier New',Courier,monospace;font-size:13px;line-height:1.75;color:rgba(255,255,255,0.85);white-space:pre-wrap;word-break:break-word;border:1px solid rgba(255,255,255,0.06);transition:filter 0.5s ease}
        .code-block.blurred{filter:blur(5px);user-select:none;pointer-events:none}
        .lock-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;border-radius:10px}
        .filter-scroll::-webkit-scrollbar{display:none}
        @media(max-width:640px){.top-bar-title{display:none}}
      `}</style>

      <UnlockPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onEmailUnlock={() => setEmailUnlocked(true)}
        resourceName="LinkedIn Scripts"
        localStorageKey="linkedinScripts"
        showEmailOption={true}
        emailAlreadySubmitted={emailUnlocked}
      />

      {/* TOP BAR */}
      <div style={{ position:'sticky', top:0, zIndex:100, background:'rgba(11,11,15,0.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 24px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
        <a href="/" style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, letterSpacing:-0.5, flexShrink:0 }}>
          Beyond<span style={{ color:'#4F7CFF' }}>Campus</span>
        </a>
        <span className="top-bar-title" style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.45)', textAlign:'center' }}>LinkedIn Scripts — 20 DM Templates</span>
        <button
          onClick={copyAll}
          style={{ flexShrink:0, padding:'8px 16px', borderRadius:8, border:`1px solid ${copiedAll ? 'rgba(16,185,129,0.35)' : fullyUnlocked ? 'rgba(14,165,233,0.35)' : 'rgba(245,158,11,0.3)'}`, background: copiedAll ? 'rgba(16,185,129,0.15)' : fullyUnlocked ? 'rgba(14,165,233,0.12)' : 'rgba(245,158,11,0.08)', color: copiedAll ? '#6ee7b7' : fullyUnlocked ? '#7dd3fc' : '#fcd34d', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' }}
        >
          {copiedAll ? 'Copied ✓' : fullyUnlocked ? 'Copy All' : 'Unlock to Copy All'}
        </button>
      </div>

      {/* HERO */}
      <section style={{ padding:'64px 24px 48px', textAlign:'center', maxWidth:680, margin:'0 auto' }}>
        <div style={{ display:'inline-flex', padding:'4px 14px', background:'rgba(14,165,233,0.1)', border:'1px solid rgba(14,165,233,0.3)', borderRadius:100, fontSize:11, fontWeight:700, letterSpacing:1.5, color:'#7dd3fc', textTransform:'uppercase', marginBottom:20 }}>
          Free Resource
        </div>
        <h1 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:800, letterSpacing:-1.5, lineHeight:1.05, marginBottom:16 }}>
          LinkedIn DM Scripts
        </h1>
        <p style={{ fontSize:17, color:'rgba(255,255,255,0.55)', lineHeight:1.8, marginBottom:28, maxWidth:520, margin:'0 auto 28px' }}>
          20 proven LinkedIn DM scripts to reach HRs, founders, alumni, and hiring managers — and actually get replies.
        </p>
        <div style={{ display:'flex', justifyContent:'center', gap:10, flexWrap:'wrap', marginBottom:24 }}>
          {[
            { label:'20 DM Scripts', color:'#7dd3fc', bg:'rgba(14,165,233,0.1)', border:'rgba(14,165,233,0.25)' },
            { label:'10 Personas', color:'#93BBFF', bg:'rgba(79,124,255,0.1)', border:'rgba(79,124,255,0.25)' },
            { label:'Copy & Paste', color:'#fcd34d', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.25)' },
          ].map(p => (
            <span key={p.label} style={{ padding:'8px 18px', borderRadius:100, background:p.bg, border:`1px solid ${p.border}`, color:p.color, fontSize:13, fontWeight:700 }}>{p.label}</span>
          ))}
        </div>
        {/* Counter / Banner */}
        <div
          style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:100, background: fullyUnlocked ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.06)', border:`1px solid ${fullyUnlocked ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.2)'}`, cursor: fullyUnlocked ? 'default' : 'pointer', fontSize:13, fontWeight:600, color: fullyUnlocked ? '#6ee7b7' : '#fcd34d' }}
          onClick={() => { if (!fullyUnlocked) setShowPopup(true) }}
        >
          {bannerText}
        </div>
      </section>

      {/* CONTENT */}
      <div style={{ maxWidth:860, margin:'0 auto', padding:'16px 24px 100px', display:'flex', flexDirection:'column', gap:16 }}>
        {LINKEDIN_SCRIPTS.map((s, idx) => {
          const isLocked = idx >= visibleCount
          const copyId = `script-${s.id}`
          const wasCopied = copiedId === copyId

          return (
            <div key={s.id} className="script-card">
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:14 }}>
                <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.2)', fontVariantNumeric:'tabular-nums', flexShrink:0, marginTop:2 }}>
                  {String(s.id).padStart(2,'0')}
                </span>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'3px 10px', borderRadius:100, background:'rgba(14,165,233,0.12)', border:'1px solid rgba(14,165,233,0.28)', color:'#7dd3fc' }}>
                      LinkedIn Script
                    </span>
                    <span style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.75)' }}>{s.title}</span>
                  </div>
                </div>
                {!isLocked && (
                  <button className={`copy-btn${wasCopied ? ' copied' : ''}`} onClick={() => copy(buildScriptText(s), copyId)}>
                    {wasCopied ? 'Copied ✓' : 'Copy'}
                  </button>
                )}
              </div>

              <div style={{ position:'relative' }}>
                <div className={`code-block${isLocked ? ' blurred' : ''}`}>{s.body}</div>
                {isLocked && (
                  <div className="lock-overlay" onClick={() => setShowPopup(true)}>
                    <span style={{ fontSize:22 }}>🔒</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.7)', textAlign:'center' }}>
                      {emailUnlocked ? 'Unlock all 20 scripts for ₹199' : 'Enter email to unlock 2 more free'}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); setShowPopup(true) }}
                      style={{ padding:'6px 18px', borderRadius:100, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.35)', color:'#fcd34d', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}
                    >
                      {emailUnlocked ? 'Get Access — ₹199 →' : 'Unlock Free →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* BOTTOM CTA */}
      <section style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'64px 24px 80px', textAlign:'center' }}>
        <div style={{ maxWidth:560, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(22px,4vw,34px)', fontWeight:800, letterSpacing:-1, lineHeight:1.15, marginBottom:14 }}>
            Scripts get you in the door.<br />Strategy gets you placed.
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.8, marginBottom:32 }}>
            Pair these scripts with the full Cold Email Pack and an off-campus strategy that actually works.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/resources/cold-email-pack" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 26px', borderRadius:100, background:'rgba(79,124,255,0.12)', border:'1.5px solid rgba(79,124,255,0.35)', color:'#93BBFF', fontWeight:700, fontSize:14 }}>
              Cold Email Pack →
            </a>
            <a href="/summer" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 26px', borderRadius:100, background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'white', fontWeight:700, fontSize:14, boxShadow:'0 0 28px rgba(245,158,11,0.3)' }}>
              Join Summer Program — ₹599 →
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
