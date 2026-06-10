'use client'

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
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'rgba(11,11,15,0.45)' }}>
        <div style={{ fontSize: 28 }}>🔒</div>
        <button
          onClick={onUpgradeClick}
          style={{ padding: '11px 22px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 13.5, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(79,124,255,0.4)' }}
        >
          {label} · ₹299
        </button>
      </div>
    </div>
  )
}
