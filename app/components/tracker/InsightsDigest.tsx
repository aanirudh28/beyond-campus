'use client'

import { useEffect, useState } from 'react'

interface Digest {
  headline: string
  insights: { title: string; detail: string; metric: string }[]
  next_week_focus: string
}

export default function InsightsDigest({
  isPro,
  appCount,
  onUpgradeClick,
}: {
  isPro: boolean
  appCount: number
  onUpgradeClick: () => void
}) {
  const [digest, setDigest] = useState<Digest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (appCount < 3) return
    let cancelled = false
    fetch('/api/tracker/insights')
      .then(r => r.json())
      .then(d => { if (!cancelled && d.headline) setDigest(d) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [appCount])

  if (appCount < 3 || (!loading && !digest)) return null

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '18px 20px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🧠</span>
        <h3 style={{ color: 'white', fontSize: 15, fontWeight: 800, margin: 0 }}>This week&apos;s insight</h3>
        <span style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 700, color: '#93BBFF', background: 'rgba(79,124,255,0.12)', padding: '3px 9px', borderRadius: 100 }}>AI</span>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13.5 }}>Reading your pipeline...</div>
      ) : digest && (
        <>
          <p style={{ color: 'white', fontSize: 16, fontWeight: 700, lineHeight: 1.45, margin: '0 0 12px', fontFamily: "'DM Serif Display', serif" }}>
            &ldquo;{digest.headline}&rdquo;
          </p>

          {isPro ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {digest.insights?.map((ins, i) => (
                  <div key={i} style={{ background: 'rgba(11,11,15,0.5)', borderRadius: 13, padding: '12px 14px' }}>
                    <div style={{ color: '#93BBFF', fontSize: 16, fontWeight: 800 }}>{ins.metric}</div>
                    <div style={{ color: 'white', fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>{ins.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.5, marginTop: 3 }}>{ins.detail}</div>
                  </div>
                ))}
              </div>
              {digest.next_week_focus && (
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '12px 0 0' }}>
                  🎯 <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>Next week:</span> {digest.next_week_focus}
                </p>
              )}
            </>
          ) : (
            <button
              onClick={onUpgradeClick}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 11, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              🔒 See the 3 insights behind this → Pro
            </button>
          )}
        </>
      )}
    </div>
  )
}
