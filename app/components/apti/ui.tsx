import { ReactNode } from 'react'

export const GRAD = 'linear-gradient(135deg, #4F7CFF, #7B61FF)'
export const COLORS = {
  bg: '#0B0B0F',
  card: '#111827',
  hair: 'rgba(255,255,255,0.08)',
  muted: 'rgba(255,255,255,0.55)',
  muted2: 'rgba(255,255,255,0.35)',
  correct: '#34D399',
  wrong: '#F87171',
  stretch: '#FBBF24',
}

// Renders the tiny markdown subset the question bank uses (**bold** only) —
// no HTML injection surface.
export function MiniMd({ text }: { text: string }) {
  const parts = text.split('**')
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} style={{ color: '#fff' }}>{part}</strong> : <span key={i}>{part}</span>))}
    </>
  )
}

export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.hair}`,
      borderRadius: 16, padding: 20, ...style,
    }}>
      {children}
    </div>
  )
}

export function PrimaryBtn({ children, onClick, disabled, style }: {
  children: ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? 'rgba(255,255,255,0.08)' : GRAD,
        color: disabled ? COLORS.muted2 : '#fff',
        border: 'none', borderRadius: 12, padding: '14px 22px',
        fontWeight: 700, fontSize: 16, fontFamily: 'inherit',
        cursor: disabled ? 'default' : 'pointer', width: '100%',
        transition: 'opacity 150ms ease-out', ...style,
      }}
    >
      {children}
    </button>
  )
}

export function GhostBtn({ children, onClick, style }: {
  children: ReactNode; onClick?: () => void; style?: React.CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent', color: COLORS.muted,
        border: `1px solid ${COLORS.hair}`, borderRadius: 12, padding: '12px 18px',
        fontWeight: 600, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
        transition: 'color 150ms ease-out', ...style,
      }}
    >
      {children}
    </button>
  )
}

export function Mono({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <span style={{ fontFamily: 'var(--mono)', ...style }}>{children}</span>
}

export const DOMAIN_LABELS: Record<string, string> = {
  quant: 'Quant',
  logical: 'Logical',
  verbal: 'Verbal',
  di: 'DI',
  business: 'Business',
}
