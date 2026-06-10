'use client'

import { useEffect, useState } from 'react'
import { Icon } from './ui'

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
    <div style={{
      background: 'linear-gradient(135deg, rgba(123,97,255,0.07), rgba(255,255,255,0.02))',
      border: '1px solid rgba(123,97,255,0.22)',
      borderRadius: 20, padding: '18px 20px', marginBottom: 24,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 9, background: 'rgba(123,97,255,0.18)', color: '#c4b5fd' }}>
          <Icon name="brain" size={14} />
        </span>
        <h3 style={{ color: 'white', fontSize: 15, fontWeight: 800, margin: 0, letterSpacing: -0.2 }}>This week&apos;s insight</h3>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, color: '#93BBFF', background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.2)', padding: '3px 9px', borderRadius: 100 }}>
          <Icon name="sparkles" size={11} /> AI
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'rgba(255,255,255,0.3)', fontSize: 13.5 }}>
          <span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#7B61FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Reading your pipeline...
        </div>
      ) : digest && (
        <>
          <p style={{ color: 'white', fontSize: 16.5, fontWeight: 700, lineHeight: 1.45, margin: '0 0 12px', fontFamily: "'DM Serif Display', serif" }}>
            &ldquo;{digest.headline}&rdquo;
          </p>

          {isPro ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {digest.insights?.map((ins, i) => (
                  <div key={i} style={{ background: 'rgba(11,11,15,0.55)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 13, padding: '12px 14px', animation: 'cardIn 0.35s ease both', animationDelay: `${i * 60}ms` }}>
                    <div style={{ color: '#93BBFF', fontSize: 17, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{ins.metric}</div>
                    <div style={{ color: 'white', fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>{ins.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.5, marginTop: 3 }}>{ins.detail}</div>
                  </div>
                ))}
              </div>
              {digest.next_week_focus && (
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '12px 0 0' }}>
                  <span style={{ color: '#93BBFF', marginTop: 1 }}><Icon name="target" size={14} /></span>
                  <span><span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>Next week:</span> {digest.next_week_focus}</span>
                </p>
              )}
            </>
          ) : (
            <button
              onClick={onUpgradeClick}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 11, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              <Icon name="lock" size={13} /> See the 3 insights behind this → Pro
            </button>
          )}
        </>
      )}
    </div>
  )
}
