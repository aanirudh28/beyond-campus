'use client'

import { useState } from 'react'
import Link from 'next/link'

// Interactive sample question for public SEO pages (doc 11): answerable
// without signup — the reveal IS the conversion surface. Receives a
// founder-designated public question; its answer shipping in the page is by
// design, never a leak of the wider bank.

export interface PublicQuestionProps {
  stemMd: string
  options: { key: string; text: string; trap: string | null }[]
  answerKeys: string[] | null
  solutionMd: string
  shortcutMd: string | null
  trapExplanations: Record<string, string>
  skillName: string
  benchmarkSec: number
}

const strip = (s: string) => s.replace(/\*\*/g, '')

export default function PublicQuestion({ q }: { q: PublicQuestionProps }) {
  const [chosen, setChosen] = useState<string | null>(null)
  const revealed = chosen !== null
  const correct = revealed && (q.answerKeys ?? []).includes(chosen)
  const chosenTrap = revealed && !correct
    ? q.options.find((o) => o.key === chosen)?.trap ?? null
    : null
  const trapText = chosenTrap ? q.trapExplanations[chosenTrap] ?? null : null

  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18, padding: '20px 20px 18px', marginBottom: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
          {q.skillName}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          par {q.benchmarkSec}s
        </span>
      </div>
      <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.9)', margin: '0 0 14px', whiteSpace: 'pre-wrap' }}>
        {strip(q.stemMd)}
      </p>

      <div style={{ display: 'grid', gap: 8 }}>
        {q.options.map((o) => {
          const isAnswer = revealed && (q.answerKeys ?? []).includes(o.key)
          const isMiss = revealed && chosen === o.key && !isAnswer
          return (
            <button
              key={o.key}
              onClick={() => { if (!revealed) setChosen(o.key) }}
              disabled={revealed}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                padding: '11px 14px', borderRadius: 12, fontSize: 14.5, fontFamily: 'inherit',
                color: 'white', cursor: revealed ? 'default' : 'pointer', width: '100%',
                background: isAnswer ? 'rgba(52,211,153,0.1)' : isMiss ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isAnswer ? 'rgba(52,211,153,0.5)' : isMiss ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.09)'}`,
                opacity: revealed && !isAnswer && !isMiss ? 0.5 : 1,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>
                {isAnswer ? '✓' : isMiss ? '✕' : o.key}
              </span>
              <span style={{ lineHeight: 1.5 }}>{o.text}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: correct ? '#34D399' : '#F87171', margin: '0 0 10px' }}>
            {correct ? '✓ Correct.' : '✕ Not this one.'}
          </p>
          {trapText && (
            <div style={{ padding: '11px 14px', borderRadius: 10, marginBottom: 10, background: 'rgba(251,191,36,0.07)', borderLeft: '3px solid #FBBF24' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#FBBF24', margin: '0 0 5px' }}>The trap you hit</p>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{strip(trapText)}</p>
            </div>
          )}
          <div style={{ padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 5px' }}>Solution</p>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.8)', margin: 0, whiteSpace: 'pre-wrap' }}>{strip(q.solutionMd)}</p>
            {q.shortcutMd && (
              <p style={{ fontSize: 13, lineHeight: 1.6, color: '#b4a6ff', margin: '8px 0 0' }}>★ Fast way: {strip(q.shortcutMd)}</p>
            )}
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '12px 0 0' }}>
            Want this feedback on <em>your</em> weak spots — every question, adapted to your level?{' '}
            <Link href="/login?next=/practice" style={{ color: '#93BBFF', fontWeight: 600 }}>
              Find your level in 8 questions →
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
