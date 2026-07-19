'use client'

import type { ChapterMeta } from '@/lib/life/types'
import { chapterHue } from './chapterTheme'

export default function ChapterIntro({
  meta,
  marketLabel,
  onBegin,
}: {
  meta: ChapterMeta
  marketLabel?: string
  onBegin: () => void
}) {
  const hue = chapterHue(meta.index)
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px',
        maxWidth: 560,
        margin: '0 auto',
      }}
    >
      <div
        className="mono-label"
        style={{ marginBottom: 18, animation: 'lifeFadeUp 0.5s ease both' }}
      >
        CHAPTER {meta.index + 1} OF 6 · AGE {meta.ageFrom}–{meta.ageTo} · {meta.yearFrom}–
        {meta.yearTo}
        {marketLabel ? ` · ${marketLabel}` : ''}
      </div>
      <h2
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(38px, 9vw, 56px)',
          letterSpacing: -1,
          lineHeight: 1.05,
          margin: '0 0 20px',
          background: `linear-gradient(120deg, ${hue.accent}, var(--fg))`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'lifeFadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both',
          animationDelay: '0.25s',
        }}
      >
        {meta.title.charAt(0) + meta.title.slice(1).toLowerCase()}
      </h2>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: 'var(--muted)',
          margin: '0 0 32px',
          maxWidth: 440,
          animation: 'lifeFadeUp 0.6s ease both',
          animationDelay: '0.55s',
        }}
      >
        {meta.intro}
      </p>
      <button
        className="btn-primary"
        onClick={onBegin}
        style={{
          minWidth: 200,
          justifyContent: 'center',
          animation: 'lifeFadeUp 0.5s ease both',
          animationDelay: '0.85s',
        }}
      >
        <span>Live it</span>
      </button>
    </div>
  )
}
