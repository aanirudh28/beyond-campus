'use client'

import Link from 'next/link'
import { COLORS } from './ui'

const ITEMS = [
  { key: 'today', href: '/practice', glyph: '◉', label: 'Today' },
  { key: 'map', href: '/practice/map', glyph: '▦', label: 'Map' },
  { key: 'stats', href: '/practice/stats', glyph: '∿', label: 'Stats' },
] as const

export type NavKey = (typeof ITEMS)[number]['key']

// Fixed bottom pill nav for the practice app (hidden inside the set player —
// solving is a full-focus surface).
export default function AptiNav({ active }: { active: NavKey }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 4, padding: 6, borderRadius: 100, zIndex: 50,
      background: 'rgba(11,11,15,0.85)', backdropFilter: 'blur(14px)',
      border: `1px solid ${COLORS.hair}`, boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    }}>
      {ITEMS.map((item) => {
        const isActive = item.key === active
        return (
          <Link
            key={item.key}
            href={item.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 100,
              background: isActive ? 'rgba(79,124,255,0.16)' : 'transparent',
              color: isActive ? '#fff' : COLORS.muted2,
              fontSize: 13.5, fontWeight: 600,
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            <span style={{ fontSize: 14, color: isActive ? COLORS.blueSoft : 'inherit' }}>{item.glyph}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
