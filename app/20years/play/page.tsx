'use client'

import { useCallback, useRef, useState } from 'react'
import type { Card, ChoiceRecord, GameState, Profile } from '@/lib/life/types'
import {
  advanceChapter,
  ageAtCard,
  applyChoice,
  buildLifeReport,
  createInitialState,
  dealChapter,
  selectEnding,
} from '@/lib/life/engine'
import { CHAPTERS } from '@/lib/life/content/chapters'
import { getEnding } from '@/lib/life/content/endings'
import StatBar from '@/app/components/life/StatBar'
import DecisionCard from '@/app/components/life/DecisionCard'
import ChapterIntro from '@/app/components/life/ChapterIntro'
import EndingScreen, { type EndingResult } from '@/app/components/life/EndingScreen'

type Phase = 'coldopen' | 'intro' | 'cards' | 'finale' | 'ending'

const STREAMS = [
  { id: 'bba', label: 'BBA / BMS' },
  { id: 'bcom', label: 'BCom' },
  { id: 'other', label: 'Other degree' },
] as const
const CITIES = [
  { id: 'metro', label: 'Metro city' },
  { id: 'tier2', label: 'Tier-2 city' },
  { id: 'tier3', label: 'Small town' },
] as const
const AMBITIONS = [
  { id: 'money', label: 'Money' },
  { id: 'stability', label: 'Stability' },
  { id: 'impact', label: 'Impact' },
] as const

export default function PlayPage() {
  const [phase, setPhase] = useState<Phase>('coldopen')
  const [stream, setStream] = useState<Profile['stream'] | null>(null)
  const [city, setCity] = useState<Profile['city'] | null>(null)
  const [ambition, setAmbition] = useState<Profile['ambition'] | null>(null)
  const [starting, setStarting] = useState(false)

  const [state, setState] = useState<GameState | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [cardIndex, setCardIndex] = useState(0)
  const [result, setResult] = useState<EndingResult | null>(null)

  const runRef = useRef<{ runId: string | null; token: string | null }>({
    runId: null,
    token: null,
  })
  const [narrations, setNarrations] = useState<Record<number, Record<string, string>>>({})
  const [sceneReady, setSceneReady] = useState<Record<number, boolean>>({})

  const fetchScene = useCallback((chapter: number, choices: ChoiceRecord[]) => {
    const { token } = runRef.current
    if (!token) {
      setSceneReady((r) => ({ ...r, [chapter]: true }))
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    fetch('/api/life/scene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, chapter, choices }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : { narrations: {} }))
      .catch(() => ({ narrations: {} }))
      .then((data) => {
        clearTimeout(timer)
        setNarrations((n) => ({ ...n, [chapter]: data?.narrations ?? {} }))
        setSceneReady((r) => ({ ...r, [chapter]: true }))
      })
  }, [])

  async function start() {
    if (!stream || !city || !ambition || starting) return
    setStarting(true)
    const profile: Profile = { stream, city, ambition }
    let seed = Math.floor(Math.random() * 2 ** 31)
    try {
      const res = await fetch('/api/life/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      if (res.ok) {
        const data = await res.json()
        seed = data.seed
        runRef.current = { runId: data.runId, token: data.token }
      } else {
        runRef.current = { runId: null, token: null }
      }
    } catch {
      runRef.current = { runId: null, token: null }
    }
    const initial = createInitialState(profile, seed)
    setState(initial)
    setCards(dealChapter(initial))
    setCardIndex(0)
    setNarrations({})
    setSceneReady({})
    fetchScene(0, [])
    setPhase('intro')
    setStarting(false)
    window.scrollTo(0, 0)
  }

  async function finale(finalState: GameState) {
    setPhase('finale')
    window.scrollTo(0, 0)
    const { runId, token } = runRef.current
    if (token) {
      try {
        const res = await fetch('/api/life/ending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, choices: finalState.history }),
        })
        if (res.ok) {
          const data = await res.json()
          setResult({
            runId,
            ending: data.ending,
            epilogue: data.epilogue,
            oneLiner: data.oneLiner,
            rarity: data.rarity,
            stats: data.stats,
            report: data.report,
            shareUrl: data.shareUrl ?? null,
          })
          setPhase('ending')
          return
        }
      } catch {}
    }
    // Offline / degraded: the deterministic engine can conclude the life alone.
    const ending = getEnding(selectEnding(finalState))
    setResult({
      runId: null,
      ending,
      epilogue: `${ending.blurb}\n\nTwenty years, thirty-odd choices, one ledger. The simulation ends here. The real version starts wherever you are sitting right now, and it plays for keeps.`,
      oneLiner: ending.blurb.split('. ')[0] + '.',
      rarity: ending.baselineRarity,
      stats: finalState.stats,
      report: buildLifeReport(finalState),
      shareUrl: null,
    })
    setPhase('ending')
  }

  function onResolved(option: Card['options'][number]) {
    if (!state) return
    const card = cards[cardIndex]
    let next = applyChoice(state, card, option)
    if (cardIndex + 1 < cards.length) {
      setState(next)
      setCardIndex(cardIndex + 1)
      window.scrollTo(0, 0)
      return
    }
    next = advanceChapter(next)
    if (next.chapter < CHAPTERS.length) {
      setState(next)
      setCards(dealChapter(next))
      setCardIndex(0)
      fetchScene(next.chapter, next.history)
      setPhase('intro')
      window.scrollTo(0, 0)
    } else {
      setState(next)
      finale(next)
    }
  }

  function replay() {
    setState(null)
    setCards([])
    setCardIndex(0)
    setResult(null)
    runRef.current = { runId: null, token: null }
    setNarrations({})
    setSceneReady({})
    setPhase('coldopen')
    window.scrollTo(0, 0)
  }

  const chip = (active: boolean): React.CSSProperties => ({
    padding: '12px 20px',
    borderRadius: 100,
    border: active ? '1px solid rgba(79,124,255,0.7)' : '1px solid rgba(255,255,255,0.14)',
    background: active ? 'rgba(79,124,255,0.14)' : 'rgba(255,255,255,0.03)',
    color: 'var(--fg)',
    fontSize: 14.5,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
  })

  const meta = state ? CHAPTERS[Math.min(state.chapter, CHAPTERS.length - 1)] : CHAPTERS[0]
  const pos = state ? ageAtCard(Math.min(state.chapter, 5), cardIndex, cards.length || 1) : null

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <style>{`
        @keyframes lifeCardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {phase !== 'coldopen' && phase !== 'ending' && state && (
        <StatBar stats={state.stats} age={pos?.age ?? meta.ageFrom} year={pos?.year ?? meta.yearFrom} />
      )}

      {phase === 'coldopen' && (
        <div
          style={{
            maxWidth: 560,
            margin: '0 auto',
            padding: '64px 24px 80px',
            textAlign: 'center',
            animation: 'lifeCardIn 0.6s ease',
          }}
        >
          <div className="mono-label" style={{ marginBottom: 18 }}>
            20 YEARS IN 60 MINUTES
          </div>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(36px, 9vw, 54px)',
              letterSpacing: -1,
              lineHeight: 1.08,
              margin: '0 0 14px',
            }}
          >
            Before the years begin,
            <br />
            <em style={{ color: 'var(--blue-soft)' }}>who are you at 21?</em>
          </h1>
          <p style={{ fontSize: 15.5, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 40px' }}>
            Three questions. Then the next twenty years of your career happen to you, one choice at
            a time.
          </p>

          {(
            [
              ['YOUR DEGREE', STREAMS, stream, setStream],
              ['YOUR CITY', CITIES, city, setCity],
              ['WHAT PULLS YOU', AMBITIONS, ambition, setAmbition],
            ] as const
          ).map(([label, options, value, setter]) => (
            <div key={label} style={{ marginBottom: 28 }}>
              <div className="mono-label" style={{ marginBottom: 12 }}>
                {label}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {options.map((o) => (
                  <button
                    key={o.id}
                    style={chip(value === o.id)}
                    onClick={() => (setter as (v: string) => void)(o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            className="btn-primary"
            onClick={start}
            disabled={!stream || !city || !ambition || starting}
            style={{
              marginTop: 16,
              minWidth: 240,
              justifyContent: 'center',
              opacity: stream && city && ambition ? 1 : 0.5,
            }}
          >
            <span>{starting ? 'Opening 2026…' : 'Begin the 20 years →'}</span>
          </button>
          <p style={{ fontSize: 12.5, color: 'var(--muted-2)', marginTop: 16 }}>
            Free. No signup. Around 15 minutes. Your ending is one of 30.
          </p>
        </div>
      )}

      {phase === 'intro' && state && (
        <ChapterIntro
          meta={meta}
          ready={sceneReady[state.chapter] === true}
          onBegin={() => {
            setPhase('cards')
            window.scrollTo(0, 0)
          }}
        />
      )}

      {phase === 'cards' && state && cards[cardIndex] && (
        <div style={{ padding: '28px 16px 64px' }}>
          <div
            className="mono-label"
            style={{ textAlign: 'center', marginBottom: 16, fontSize: 10 }}
          >
            CHAPTER {state.chapter + 1} · {meta.title} · {cardIndex + 1} / {cards.length}
          </div>
          <DecisionCard
            key={cards[cardIndex].id}
            card={cards[cardIndex]}
            narration={narrations[state.chapter]?.[cards[cardIndex].id]}
            age={pos?.age ?? meta.ageFrom}
            year={pos?.year ?? meta.yearFrom}
            onResolved={onResolved}
          />
        </div>
      )}

      {phase === 'finale' && (
        <div
          style={{
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 24,
          }}
        >
          <div className="mono-label" style={{ marginBottom: 20 }}>
            2050
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 32, margin: '0 0 12px' }}>
            Compiling your ledger…
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>
            Twenty years of choices, weighed and named.
          </p>
        </div>
      )}

      {phase === 'ending' && result && <EndingScreen result={result} onReplay={replay} />}
    </main>
  )
}
