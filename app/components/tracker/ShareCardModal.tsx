'use client'

import { useRef, useState } from 'react'
import { Application } from './types'
import { computeStreak } from './StreakWidget'
import { GRAD, Icon } from './ui'

export default function ShareCardModal({
  applications,
  name,
  onClose,
}: {
  applications: Application[]
  name: string | null
  onClose: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  const applied = applications.filter(a => a.status !== 'saved').length
  const interviews = applications.filter(a => ['interview', 'offer'].includes(a.status)).length
  const offers = applications.filter(a => a.status === 'offer').length
  const streak = computeStreak(applications)

  const headline =
    offers > 0 ? `${offers} offer${offers > 1 ? 's' : ''} in the bag. 🏆`
    : interviews > 0 ? `${applied} applications. ${interviews} interview${interviews > 1 ? 's' : ''}. Still going.`
    : `${applied} application${applied === 1 ? '' : 's'} out the door. No excuses.`

  const handleDownload = async () => {
    if (!cardRef.current) return
    setGenerating(true)
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(cardRef.current, { backgroundColor: '#0B0B0F', scale: 2 })
    const dataUrl = canvas.toDataURL('image/png')

    // Web Share API with file support (mobile), else download
    try {
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'beyond-campus-stats.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My job hunt stats' })
        setGenerating(false)
        return
      }
    } catch { /* fall through to download */ }

    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'beyond-campus-stats.png'
    a.click()
    setGenerating(false)
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'overlayIn 0.2s ease both' }}>
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: none; } }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, animation: 'modalIn 0.25s cubic-bezier(0.32, 0.72, 0, 1) both' }}>

        {/* The card itself — rendered live, captured by html2canvas */}
        <div
          ref={cardRef}
          style={{ background: '#0B0B0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 28, padding: '40px 34px', position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}
        >
          <div style={{ position: 'absolute', top: -80, right: -80, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,97,255,0.35), transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,124,255,0.25), transparent 70%)' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', borderRadius: 100, fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: 1.2, marginBottom: 24 }}>
              MY JOB HUNT
            </div>

            <h2 style={{ color: 'white', fontSize: 30, fontWeight: 800, lineHeight: 1.2, margin: '0 0 28px', letterSpacing: -0.5, fontFamily: "'DM Serif Display', serif" }}>
              {headline}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              {[
                [String(applied), 'Applications'],
                [String(interviews), 'Interviews'],
                [streak > 0 ? `${streak}🔥` : '💪', streak > 0 ? 'Day streak' : 'Grinding'],
                [String(offers), 'Offers'],
              ].map(([num, label]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 18px' }}>
                  <div style={{ color: 'white', fontSize: 26, fontWeight: 800 }}>{num}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600 }}>{name || 'Off-campus hustler'}</span>
              <span style={{ color: '#93BBFF', fontSize: 12.5, fontWeight: 700 }}>beyond-campus.in/tracker</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            onClick={handleDownload}
            disabled={generating}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 13, background: GRAD, color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: generating ? 'wait' : 'pointer', opacity: generating ? 0.8 : 1, boxShadow: '0 6px 20px rgba(79,124,255,0.3)' }}
          >
            <Icon name={generating ? 'clock' : 'download'} size={15} />
            {generating ? 'Generating...' : 'Share / Download'}
          </button>
          <button onClick={onClose} style={{ padding: '14px 20px', borderRadius: 13, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
