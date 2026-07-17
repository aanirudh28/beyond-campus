'use client'

import { useEffect, useRef, useState } from 'react'
import type { Stats } from '@/lib/life/types'
import { chapterHue } from './chapterTheme'

// The years between chapters used to pass invisibly — appraisals, savings,
// wear and tear all applied off-screen. The montage shows the ledger.
// Display copy only: nothing here touches the content graph or engine.

const TRANSITIONS: Record<number, string> = {
  1: 'The offer letters stop feeling like miracles. Rent does not.',
  2: 'Batchmates start getting engaged, promoted, or both. The clock gets louder.',
  3: 'Your back has started sending invoices. So have your parents’ doctors.',
  4: 'The market turns. Somewhere, a spreadsheet decides who stays.',
  5: 'The years move faster now. Sundays matter more than salaries.',
}

export interface MontageData {
  fromYear: number
  toYear: number
  before: Stats
  after: Stats
  enteringChapter: number // 1-5, the chapter about to begin
  batchmate?: { name: string; line: string } | null // the rival's years, passing in parallel
}

function ledgerLines(d: MontageData): string[] {
  const lines: string[] = []
  const { before, after } = d
  const salaryFrom = before.salary
  const salaryTo = after.salary
  if (salaryFrom > 0 && salaryTo > 0 && Math.abs(salaryTo - salaryFrom) >= 0.3) {
    lines.push(
      salaryTo > salaryFrom
        ? `The appraisal cycles do their quiet work. ₹${salaryFrom.toFixed(1)} → ₹${salaryTo.toFixed(1)} LPA.`
        : `The paycheck shrinks to ₹${salaryTo.toFixed(1)} LPA. Nobody calls it a demotion out loud.`,
    )
  }
  const savingsDelta = after.savings - before.savings
  if (savingsDelta >= 0.5) {
    lines.push(`₹${savingsDelta.toFixed(1)}L banked while you weren’t looking.`)
  } else if (savingsDelta <= -0.5) {
    lines.push(`The account thins by ₹${Math.abs(savingsDelta).toFixed(1)}L.`)
  }
  const burnDelta = after.burnout - before.burnout
  if (burnDelta >= 4) lines.push('The tiredness compounds too.')
  else if (burnDelta <= -4) lines.push('Some rest finds you, for once.')
  const famDelta = after.family - before.family
  if (famDelta <= -4) lines.push('The calls home get shorter.')
  return lines.slice(0, 3)
}

function useYearRoll(from: number, to: number, ms = 1200) {
  const [year, setYear] = useState(from)
  useEffect(() => {
    if (from === to) return // useState(from) already shows the right year
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms)
      const eased = 1 - Math.pow(1 - p, 2)
      setYear(Math.round(from + (to - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [from, to, ms])
  return year
}

export default function Montage({ data, onDone }: { data: MontageData; onDone: () => void }) {
  const year = useYearRoll(data.fromYear, data.toYear)
  const lines = useRef(ledgerLines(data)).current
  const flavor = TRANSITIONS[data.enteringChapter]
  const hue = chapterHue(data.enteringChapter)
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    onDone()
  }

  // Auto-advance ~1.2s after the last line has landed.
  useEffect(() => {
    const total =
      1400 + (lines.length + (flavor ? 1 : 0) + (data.batchmate ? 1 : 0)) * 550 + 1400
    const t = setTimeout(finish, total)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      onClick={finish}
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
        cursor: 'pointer',
        animation: 'lifeFadeUp 0.5s ease both',
      }}
    >
      <div className="mono-label" style={{ marginBottom: 14 }}>
        THE YEARS PASS
      </div>
      <div
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(52px, 14vw, 84px)',
          letterSpacing: -2,
          lineHeight: 1,
          marginBottom: 30,
          color: hue.accent,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {year}
      </div>
      <div style={{ display: 'grid', gap: 14, maxWidth: 420 }}>
        {lines.map((line, i) => (
          <p
            key={line}
            style={{
              fontSize: 15.5,
              lineHeight: 1.6,
              color: 'var(--muted)',
              margin: 0,
              animation: 'lifeFadeUp 0.5s ease both',
              animationDelay: `${1.3 + i * 0.55}s`,
            }}
          >
            {line}
          </p>
        ))}
        {flavor && (
          <p
            style={{
              fontSize: 15.5,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.85)',
              fontStyle: 'italic',
              fontFamily: 'var(--serif)',
              margin: '6px 0 0',
              animation: 'lifeFadeUp 0.55s ease both',
              animationDelay: `${1.3 + lines.length * 0.55}s`,
            }}
          >
            {flavor}
          </p>
        )}
        {data.batchmate && (
          <div
            style={{
              marginTop: 10,
              paddingTop: 14,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              animation: 'lifeFadeUp 0.55s ease both',
              animationDelay: `${1.3 + (lines.length + (flavor ? 1 : 0)) * 0.55}s`,
            }}
          >
            <div className="mono-label" style={{ fontSize: 9.5, marginBottom: 8, color: 'var(--muted-2)' }}>
              MEANWHILE, {data.batchmate.name.toUpperCase()} FROM YOUR SECTION
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
              {data.batchmate.line}
            </p>
          </div>
        )}
      </div>
      <div
        className="mono-label"
        style={{
          marginTop: 40,
          fontSize: 9.5,
          color: 'var(--muted-2)',
          animation: 'lifeFadeUp 0.5s ease both',
          animationDelay: '2s',
        }}
      >
        TAP TO CONTINUE
      </div>
    </div>
  )
}
