'use client'

import type { ChapterMeta } from '@/lib/life/types'

export default function ChapterIntro({
  meta,
  ready,
  onBegin,
}: {
  meta: ChapterMeta
  ready: boolean
  onBegin: () => void
}) {
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
        animation: 'lifeCardIn 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div className="mono-label" style={{ marginBottom: 18 }}>
        CHAPTER {meta.index + 1} OF 6 · AGE {meta.ageFrom}–{meta.ageTo} · {meta.yearFrom}–
        {meta.yearTo}
      </div>
      <h2
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(38px, 9vw, 56px)',
          letterSpacing: -1,
          lineHeight: 1.05,
          margin: '0 0 20px',
          background: 'var(--grad)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
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
        }}
      >
        {meta.intro}
      </p>
      <button
        className="btn-primary"
        onClick={onBegin}
        disabled={!ready}
        style={{ opacity: ready ? 1 : 0.55, minWidth: 200, justifyContent: 'center' }}
      >
        <span>{ready ? 'Live it' : 'The years are loading…'}</span>
      </button>
    </div>
  )
}
