'use client'

import { GRAD, Icon } from './ui'

export default function ProGate({
  isPro,
  onUpgradeClick,
  label = 'Unlock with Pro',
  children,
}: {
  isPro: boolean
  onUpgradeClick: () => void
  label?: string
  children: React.ReactNode
}) {
  if (isPro) return <>{children}</>

  return (
    <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>{children}</div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: 'rgba(11,11,15,0.45)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 16, background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', boxShadow: '0 0 30px rgba(79,124,255,0.25)' }}>
          <Icon name="lock" size={22} strokeWidth={1.8} />
        </div>
        <button
          onClick={onUpgradeClick}
          style={{ padding: '11px 22px', borderRadius: 100, background: GRAD, color: 'white', fontWeight: 700, fontSize: 13.5, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(79,124,255,0.4)' }}
        >
          {label} · ₹299
        </button>
      </div>
    </div>
  )
}
