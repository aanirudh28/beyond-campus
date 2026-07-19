'use client'

import type { GameState } from '@/lib/life/types'
import type { DiaryChapter } from '@/lib/life/diary'
import { selectEnding } from '@/lib/life/engine'
import { getEnding } from '@/lib/life/content/endings'
import { chapterHue } from './chapterTheme'

// The "Your Life So Far" sheet: tap the stat bar mid-run and see the life
// you are actually carrying — who you are in words, what the numbers say,
// and the diary of every choice so far. The sim's memory, made visible.

export default function LifeSoFar({
  state,
  facts,
  diary,
  onClose,
}: {
  state: GameState
  facts: string[]
  diary: DiaryChapter[]
  onClose: () => void
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(5,5,8,0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'center',
        overflowY: 'auto',
        animation: 'lifeFadeUp 0.25s ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          margin: '56px 16px 32px',
          height: 'fit-content',
          background: '#101017',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24,
          padding: '26px 22px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="mono-label">YOUR LIFE SO FAR · AGE {state.age}</span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'transparent',
              color: 'var(--muted)',
              borderRadius: 100,
              width: 30,
              height: 30,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '12px 0 16px' }}>
          {facts.map((fact) => (
            <span
              key={fact}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10.5,
                letterSpacing: 1,
                padding: '5px 12px',
                borderRadius: 100,
                border: '1px solid rgba(122,183,255,0.3)',
                color: 'var(--blue-soft)',
              }}
            >
              {fact.toUpperCase()}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            marginBottom: 22,
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: 1,
          }}
        >
          <div style={{ padding: '10px 14px', border: '1px solid var(--hair)', borderRadius: 12 }}>
            <div style={{ color: 'var(--muted-2)', fontSize: 9, marginBottom: 4 }}>EARNING</div>
            <div style={{ color: 'var(--fg)', fontSize: 15 }}>
              {state.stats.salary > 0 ? `₹${state.stats.salary.toFixed(1)} LPA` : 'Nothing yet'}
            </div>
          </div>
          <div style={{ padding: '10px 14px', border: '1px solid var(--hair)', borderRadius: 12 }}>
            <div style={{ color: 'var(--muted-2)', fontSize: 9, marginBottom: 4 }}>KEPT</div>
            <div style={{ color: 'var(--fg)', fontSize: 15 }}>
              {state.stats.savings < 0 ? '-' : ''}₹{Math.abs(state.stats.savings).toFixed(1)} lakhs
            </div>
          </div>
        </div>

        {state.chapter >= 3 &&
          (() => {
            // The compass: run the real ending matcher on the life as it
            // stands. Precisely true, and precisely changeable.
            const heading = getEnding(selectEnding(state))
            return (
              <div
                style={{
                  padding: '12px 14px',
                  border: '1px solid rgba(255,198,92,0.3)',
                  borderRadius: 12,
                  marginBottom: 22,
                }}
              >
                <div className="mono-label" style={{ fontSize: 9, color: 'var(--muted-2)', marginBottom: 5 }}>
                  IF THE YEARS STOPPED TODAY
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--fg)' }}>
                  {heading.emoji} {heading.name}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 4 }}>
                  The remaining years can still change this.
                </div>
              </div>
            )
          })()}

        <div className="mono-label" style={{ marginBottom: 12 }}>
          THE DIARY
        </div>
        {diary.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
            Nothing written yet. The first choice starts the ink.
          </p>
        )}
        {diary.map((chapter) => {
          const hue = chapterHue(chapter.index)
          return (
            <div key={chapter.index} style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: 2,
                  color: hue.accent,
                  marginBottom: 8,
                }}
              >
                {chapter.title} · {chapter.ageFrom}–{chapter.ageTo}
              </div>
              {chapter.entries.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft: `2px solid ${entry.pivotal ? hue.accent : 'rgba(255,255,255,0.1)'}`,
                    padding: '2px 0 10px 12px',
                    marginBottom: 4,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                    {entry.chose}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--serif)',
                      fontStyle: 'italic',
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      color: 'var(--muted)',
                      marginTop: 3,
                    }}
                  >
                    {entry.outcome}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
