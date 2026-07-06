'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

export const GRAD = 'linear-gradient(135deg, #4F7CFF, #7B61FF)'
export const COLORS = {
  bg: '#0B0B0F',
  card: 'rgba(255,255,255,0.03)',
  cardSolid: '#111827',
  hair: 'rgba(255,255,255,0.08)',
  muted: 'rgba(255,255,255,0.55)',
  muted2: 'rgba(255,255,255,0.35)',
  blue: '#4F7CFF',
  blueSoft: '#93BBFF',
  purple: '#7B61FF',
  correct: '#34D399',
  correctBg: 'rgba(52,211,153,0.10)',
  wrong: '#F87171',
  wrongBg: 'rgba(248,113,113,0.10)',
  stretch: '#FBBF24',
  stretchBg: 'rgba(251,191,36,0.10)',
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

export function Mono({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <span style={{ fontFamily: 'var(--mono)', ...style }}>{children}</span>
}

export function Chip({ children, color = COLORS.muted, bg = 'rgba(255,255,255,0.05)', style }: {
  children: ReactNode; color?: string; bg?: string; style?: React.CSSProperties
}) {
  return (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 500, letterSpacing: 2,
      textTransform: 'uppercase', color, background: bg,
      padding: '5px 10px', borderRadius: 100, whiteSpace: 'nowrap', ...style,
    }}>
      {children}
    </span>
  )
}

export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.hair}`,
      borderRadius: 18, padding: 22, backdropFilter: 'blur(8px)', ...style,
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
        background: disabled ? 'rgba(255,255,255,0.07)' : GRAD,
        color: disabled ? COLORS.muted2 : '#fff',
        border: 'none', borderRadius: 100, padding: '16px 28px',
        fontWeight: 700, fontSize: 16, fontFamily: 'inherit', letterSpacing: 0.2,
        cursor: disabled ? 'default' : 'pointer', width: '100%',
        boxShadow: disabled ? 'none' : '0 0 30px rgba(79,124,255,0.35)',
        transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// Animated count-up for rating numbers — the "number goes up" moment matters.
export function useCountUp(target: number, from?: number, durationMs = 700): number {
  const [value, setValue] = useState(from ?? target)
  const raf = useRef(0)
  useEffect(() => {
    const start = from ?? target
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(start + (target - start) * eased))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, from, durationMs])
  return value
}

export function CountUpNumber({ to, from, style }: { to: number; from?: number; style?: React.CSSProperties }) {
  const v = useCountUp(to, from)
  return <Mono style={style}>{v}</Mono>
}

// Animated SVG accuracy ring for the completion screen.
export function AccuracyRing({ correct, total, size = 128 }: { correct: number; total: number; size?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 150); return () => clearTimeout(t) }, [])
  const pct = total > 0 ? correct / total : 0
  const r = (size - 12) / 2
  const c = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={9} />
        <defs>
          <linearGradient id="apti-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F7CFF" />
            <stop offset="100%" stopColor="#7B61FF" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#apti-ring)" strokeWidth={9} strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={mounted ? c * (1 - pct) : c}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.2, 0.6, 0.2, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Mono style={{ fontSize: 28, fontWeight: 600 }}>{correct}<span style={{ color: COLORS.muted2, fontSize: 18 }}>/{total}</span></Mono>
        <span style={{ fontSize: 11, color: COLORS.muted2, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>correct</span>
      </div>
    </div>
  )
}

export const DOMAIN_LABELS: Record<string, string> = {
  quant: 'Quant',
  logical: 'Logical',
  verbal: 'Verbal',
  di: 'DI',
  business: 'Business',
}

// Shared keyframes for the practice surfaces (house pattern: <style> tags).
export function AptiStyles() {
  return (
    <style>{`
      @keyframes apti-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes apti-sheet { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes apti-pop { 0% { transform: scale(0.85); opacity: 0; } 60% { transform: scale(1.04); } 100% { transform: scale(1); opacity: 1; } }
      @keyframes apti-glow { 0%, 100% { box-shadow: 0 0 24px rgba(79,124,255,0.18); } 50% { box-shadow: 0 0 40px rgba(123,97,255,0.32); } }
      @keyframes apti-flame { 0%, 100% { transform: scale(1) rotate(-2deg); } 50% { transform: scale(1.12) rotate(2deg); } }
      .apti-in { animation: apti-in 0.45s cubic-bezier(0.2, 0.6, 0.2, 1) both; }
      .apti-sheet { animation: apti-sheet 0.35s cubic-bezier(0.2, 0.6, 0.2, 1) both; }
      .apti-pop { animation: apti-pop 0.4s cubic-bezier(0.2, 0.6, 0.2, 1) both; }
      .apti-option:hover:not(:disabled) { border-color: rgba(79,124,255,0.5) !important; transform: translateY(-1px); }
      .apti-option { transition: border-color 0.15s, background 0.15s, transform 0.15s, opacity 0.3s; }
      .apti-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 44px rgba(79,124,255,0.5); }
    `}</style>
  )
}
