'use client'

import Link from 'next/link'

// App-grade bottom tab bar: five named tabs, thumb-sized targets, crisp SVG
// icons, safe-area aware. Full width with a hairline top border — a real tab
// bar, not a floating pill.

function Icon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? 'url(#apti-nav-grad)' : 'rgba(255,255,255,0.45)'
  const common = {
    width: 23, height: 23, viewBox: '0 0 24 24', fill: 'none',
    stroke, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'today':
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M8 3v4M16 3v4M3.5 10h17" />
          <path d="M9.5 14.5l1.8 1.8 3.4-3.4" />
        </svg>
      )
    case 'map':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6.6" height="6.6" rx="1.6" />
          <rect x="13.4" y="4" width="6.6" height="6.6" rx="1.6" />
          <rect x="4" y="13.4" width="6.6" height="6.6" rx="1.6" />
          <rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.6" />
        </svg>
      )
    case 'mocks':
      return (
        <svg {...common}>
          <circle cx="12" cy="13.5" r="7" />
          <path d="M12 10.5v3l2.3 2.3M10 3.5h4M12 3.5v3" />
        </svg>
      )
    case 'ready':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.2" />
          <circle cx="12" cy="12" r="4.4" />
          <circle cx="12" cy="12" r="0.9" fill={stroke} />
        </svg>
      )
    case 'stats':
      return (
        <svg {...common}>
          <path d="M5 20V12.5M12 20V5.5M19 20v-5" />
        </svg>
      )
    default:
      return null
  }
}

const ITEMS = [
  { key: 'today', href: '/practice', label: 'Today' },
  { key: 'map', href: '/practice/map', label: 'Map' },
  { key: 'mocks', href: '/practice/mocks', label: 'Mocks' },
  { key: 'ready', href: '/practice/companies', label: 'Ready' },
  { key: 'stats', href: '/practice/stats', label: 'Stats' },
] as const

export type NavKey = (typeof ITEMS)[number]['key']

// 'none' renders the bar with no tab lit — for surfaces that live between
// tabs (history, session review).
export default function AptiNav({ active }: { active: NavKey | 'none' }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(11,11,15,0.92)',
      backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {/* shared gradient for active icons */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <linearGradient id="apti-nav-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F7CFF" />
            <stop offset="100%" stopColor="#7B61FF" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        maxWidth: 560, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
      }}>
        {ITEMS.map((item) => {
          const isActive = item.key === active
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 4px 9px', position: 'relative',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'color 0.2s',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', top: 0, width: 26, height: 3, borderRadius: '0 0 3px 3px',
                  background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)',
                }} />
              )}
              <Icon name={item.key} active={isActive} />
              <span style={{
                fontSize: 11, fontWeight: isActive ? 700 : 500, letterSpacing: 0.3,
                color: isActive ? '#93BBFF' : 'rgba(255,255,255,0.5)',
              }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
