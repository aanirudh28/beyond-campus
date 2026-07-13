'use client'

import { useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { Card, ChoiceRecord, GameState, Profile } from '@/lib/life/types'
import {
  advanceChapter,
  ageAtCard,
  applyChoice,
  buildLifeReport,
  createInitialState,
  dealChapter,
  ghostForkIndices,
  selectEnding,
  simulateGhost,
} from '@/lib/life/engine'
import { CHAPTERS, CONTENT_VERSION } from '@/lib/life/content/chapters'
import { ENDINGS, getEnding } from '@/lib/life/content/endings'
import StatBar from '@/app/components/life/StatBar'
import DecisionCard from '@/app/components/life/DecisionCard'
import ChapterIntro from '@/app/components/life/ChapterIntro'
import EndingScreen, { type EndingResult, type GhostView } from '@/app/components/life/EndingScreen'

type Phase = 'coldopen' | 'intro' | 'cards' | 'finale' | 'ending'

const SAVE_KEY = 'bc20_run'
const SAVE_TTL_MS = 24 * 60 * 60 * 1000

interface SavedRun {
  v: number
  seed: number
  profile: Profile
  runId: string | null
  token: string | null
  history: ChoiceRecord[]
  ts: number
}

function parseSaveRaw(raw: string): SavedRun | null {
  try {
    if (!raw) return null
    const saved: SavedRun = JSON.parse(raw)
    if (saved.v !== CONTENT_VERSION) return null
    if (Date.now() - saved.ts > SAVE_TTL_MS) return null
    if (!saved.history?.length || !saved.profile || typeof saved.seed !== 'number') return null
    return saved
  } catch {
    return null
  }
}

// Challenge link: ?l=<seed>.<stream>.<city>.<ambition> replays a friend's exact deck.
function parseChallengeParam(search: string): { seed: number; profile: Profile } | null {
  try {
    const l = new URLSearchParams(search).get('l')
    if (!l) return null
    const [seedStr, s, c, a] = l.split('.')
    const seed = Number(seedStr)
    if (
      !Number.isInteger(seed) ||
      seed < 0 ||
      !['bba', 'bcom', 'other'].includes(s) ||
      !['metro', 'tier2', 'tier3'].includes(c) ||
      !['money', 'stability', 'impact'].includes(a)
    ) {
      return null
    }
    return { seed, profile: { stream: s, city: c, ambition: a } as Profile }
  } catch {
    return null
  }
}

const COLLECTION_KEY = 'bc20_endings'

function recordDiscovery(endingId: string): { discovered: number; endingIsNew: boolean } {
  try {
    const seen: string[] = JSON.parse(localStorage.getItem(COLLECTION_KEY) || '[]')
    const fresh = !seen.includes(endingId)
    const next = fresh ? [...seen, endingId] : seen
    if (fresh) localStorage.setItem(COLLECTION_KEY, JSON.stringify(next))
    return { discovered: next.length, endingIsNew: fresh }
  } catch {
    return { discovered: 0, endingIsNew: false }
  }
}

const emptySubscribe = () => () => {}

// Walk the saved choices back through the deterministic deal. Any drift
// (content changed, tampering) returns null and the save is discarded.
function rebuildFromSave(saved: SavedRun): { state: GameState; cards: Card[]; cardIndex: number } | null {
  let state = createInitialState(saved.profile, saved.seed)
  let i = 0
  while (state.chapter < CHAPTERS.length) {
    const cards = dealChapter(state)
    let idx = 0
    for (; idx < cards.length; idx++) {
      const h = saved.history[i]
      if (!h || h.cardId !== cards[idx].id) break
      const option = cards[idx].options.find((o) => o.id === h.optionId)
      if (!option) return null
      state = applyChoice(state, cards[idx], option)
      i++
    }
    if (i < saved.history.length && idx < cards.length && saved.history[i].cardId !== cards[idx].id) return null
    if (idx < cards.length) return { state, cards, cardIndex: idx }
    state = advanceChapter(state)
  }
  return null // save covers a finished run
}

function buildGhosts(finalState: GameState): GhostView[] {
  const views: GhostView[] = []
  for (const fi of ghostForkIndices(finalState.history)) {
    const ghost = simulateGhost(finalState.seed, finalState.profile, finalState.history, fi)
    if (!ghost) continue
    const sameEnding = ghost.endingId === selectEnding(finalState)
    const delta = Math.round(ghost.stats.savings - finalState.stats.savings)
    if (sameEnding && Math.abs(delta) < 5) continue // the road converged, not worth showing
    const meta = CHAPTERS[ghost.forkChapter]
    const ending = getEnding(ghost.endingId)
    views.push({
      ageLine: `Around age ${meta.ageFrom}-${meta.ageTo}, you chose`,
      takenLabel: ghost.takenLabel,
      otherLabel: ghost.otherLabel,
      endingName: ending.name,
      emoji: ending.emoji,
      savingsDelta: delta,
    })
  }
  return views
}

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
  // External snapshots (URL + localStorage) read without effects, so the
  // server render stays empty and the client render is authoritative.
  const search = useSyncExternalStore(
    emptySubscribe,
    () => window.location.search,
    () => '',
  )
  const savedRaw = useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return localStorage.getItem(SAVE_KEY) ?? ''
      } catch {
        return ''
      }
    },
    () => '',
  )
  const challenge = useMemo(() => parseChallengeParam(search), [search])
  const [saveDismissed, setSaveDismissed] = useState(false)
  const resumable = useMemo(
    () => (challenge || saveDismissed || phase !== 'coldopen' ? null : parseSaveRaw(savedRaw)),
    [challenge, saveDismissed, savedRaw, phase],
  )

  function persist(next: GameState) {
    try {
      const saved: SavedRun = {
        v: CONTENT_VERSION,
        seed: next.seed,
        profile: next.profile,
        runId: runRef.current.runId,
        token: runRef.current.token,
        history: next.history,
        ts: Date.now(),
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(saved))
    } catch {}
  }

  function clearSave() {
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch {}
  }

  function resume(saved: SavedRun) {
    const rebuilt = rebuildFromSave(saved)
    if (!rebuilt) {
      clearSave()
      setSaveDismissed(true)
      return
    }
    runRef.current = { runId: saved.runId, token: saved.token }
    setState(rebuilt.state)
    setCards(rebuilt.cards)
    setCardIndex(rebuilt.cardIndex)
    setNarrations({})
    setSceneReady({})
    fetchScene(rebuilt.state.chapter, saved.history)
    setPhase(rebuilt.cardIndex === 0 ? 'intro' : 'cards')
    window.scrollTo(0, 0)
  }

  function fetchScene(chapter: number, choices: ChoiceRecord[]) {
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
  }

  async function start() {
    if (starting) return
    if (!challenge && (!stream || !city || !ambition)) return
    setStarting(true)
    const profile: Profile = challenge
      ? challenge.profile
      : { stream: stream!, city: city!, ambition: ambition! }
    let seed = challenge ? challenge.seed : Math.floor(Math.random() * 2 ** 31)
    try {
      const res = await fetch('/api/life/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challenge ? { profile, seed } : { profile }),
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
    clearSave()
    const { runId, token } = runRef.current
    const { profile, seed } = finalState
    const extras = {
      trail: finalState.trail,
      ghosts: buildGhosts(finalState),
      challengeUrl: `https://www.beyond-campus.in/20years/play?l=${seed}.${profile.stream}.${profile.city}.${profile.ambition}`,
    }
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
            ...extras,
            ...recordDiscovery(data.ending.id),
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
      ...extras,
      ...recordDiscovery(ending.id),
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
      persist(next)
      window.scrollTo(0, 0)
      return
    }
    next = advanceChapter(next)
    if (next.chapter < CHAPTERS.length) {
      setState(next)
      setCards(dealChapter(next))
      setCardIndex(0)
      persist(next)
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
    clearSave()
    setSaveDismissed(true)
    try {
      // Drop any ?l= challenge param so "live a different life" is truly fresh.
      window.history.replaceState(null, '', window.location.pathname)
    } catch {}
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

          {challenge && (
            <div
              className="bc-card"
              style={{
                padding: '14px 18px',
                marginBottom: 26,
                border: '1px solid rgba(79,124,255,0.4)',
              }}
            >
              <span className="mono-label" style={{ color: 'var(--blue-soft)' }}>
                ⚔ CHALLENGE RUN
              </span>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: '8px 0 0', lineHeight: 1.6 }}>
                A friend sent you their exact life: same cards, same twists, same luck. Only the
                choices are yours. Beat their ending.
              </p>
            </div>
          )}

          {!challenge && resumable && (
            <div
              className="bc-card"
              style={{ padding: '16px 18px', marginBottom: 26, border: '1px solid rgba(79,124,255,0.4)' }}
            >
              <p style={{ fontSize: 14.5, color: 'var(--fg)', fontWeight: 600, margin: '0 0 10px' }}>
                You left a life half-lived ({resumable.history.length} choices in).
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: 14 }}
                  onClick={() => resume(resumable)}
                >
                  <span>Continue that life →</span>
                </button>
                <button
                  style={{
                    padding: '10px 18px',
                    borderRadius: 100,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'transparent',
                    color: 'var(--muted)',
                    fontSize: 13.5,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    clearSave()
                    setSaveDismissed(true)
                  }}
                >
                  Start over
                </button>
              </div>
            </div>
          )}

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
              ['YOUR DEGREE', STREAMS, challenge ? challenge.profile.stream : stream, setStream],
              ['YOUR CITY', CITIES, challenge ? challenge.profile.city : city, setCity],
              ['WHAT PULLS YOU', AMBITIONS, challenge ? challenge.profile.ambition : ambition, setAmbition],
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
                    style={{ ...chip(value === o.id), opacity: challenge && value !== o.id ? 0.35 : 1 }}
                    disabled={!!challenge}
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
            disabled={(!challenge && (!stream || !city || !ambition)) || starting}
            style={{
              marginTop: 16,
              minWidth: 240,
              justifyContent: 'center',
              opacity: challenge || (stream && city && ambition) ? 1 : 0.5,
            }}
          >
            <span>{starting ? 'Opening 2026…' : challenge ? 'Live their life →' : 'Begin the 20 years →'}</span>
          </button>
          <p style={{ fontSize: 12.5, color: 'var(--muted-2)', marginTop: 16 }}>
            Free. No signup. Around 15 minutes. Your ending is one of {ENDINGS.length}.
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
