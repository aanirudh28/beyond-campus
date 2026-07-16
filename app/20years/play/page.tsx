'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
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
import { buildGhostSummaries } from '@/lib/life/ghosts'
import { flushBeacon, setLifeRunId, trackLife } from '@/lib/life/track'
import { CHAPTERS, CONTENT_VERSION } from '@/lib/life/content/chapters'
import { ENDINGS, getEnding } from '@/lib/life/content/endings'
import StatBar from '@/app/components/life/StatBar'
import DecisionCard from '@/app/components/life/DecisionCard'
import ChapterIntro from '@/app/components/life/ChapterIntro'
import Montage, { type MontageData } from '@/app/components/life/Montage'
import EndingScreen, { type EndingResult } from '@/app/components/life/EndingScreen'
import { chapterHue } from '@/app/components/life/chapterTheme'

type Phase = 'coldopen' | 'intro' | 'cards' | 'montage' | 'finale' | 'ending'

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

// Challenge link: ?l=<seed>.<stream>.<city>.<ambition>&c=<parentRunId>
// replays a friend's exact deck and records the lineage (doc 07 §2).
function parseChallengeParam(
  search: string,
): { seed: number; profile: Profile; parentRunId: string | null } | null {
  try {
    const params = new URLSearchParams(search)
    const l = params.get('l')
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
    const parent = params.get('c')
    return {
      seed,
      profile: { stream: s, city: c, ambition: a } as Profile,
      parentRunId: parent && /^[0-9a-f-]{36}$/i.test(parent) ? parent : null,
    }
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
  const [scoreName, setScoreName] = useState('')
  const [starting, setStarting] = useState(false)

  const [state, setState] = useState<GameState | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [cardIndex, setCardIndex] = useState(0)
  const [montage, setMontage] = useState<MontageData | null>(null)
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
    setLifeRunId(saved.runId)
    bindAbandonBeacon()
    abandonRef.current = {
      chapter: rebuilt.state.chapter,
      cardsAnswered: rebuilt.state.history.length,
    }
    setState(rebuilt.state)
    setCards(rebuilt.cards)
    setCardIndex(rebuilt.cardIndex)
    setNarrations({})
    setSceneReady({})
    fetchScene(rebuilt.state.chapter, saved.history)
    setPhase(rebuilt.cardIndex === 0 ? 'intro' : 'cards')
    window.scrollTo(0, 0)
  }

  async function fetchScene(chapter: number, choices: ChoiceRecord[]) {
    const { token } = runRef.current
    if (!token) {
      setSceneReady((r) => ({ ...r, [chapter]: true }))
      return
    }
    // One retry (doc 05 §8); each attempt gets its own short window so the
    // chapter screen never blocks long. Authored base text is the floor.
    const attempt = async (timeoutMs: number): Promise<Record<string, string> | null> => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      try {
        const res = await fetch('/api/life/scene', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, chapter, choices }),
          signal: controller.signal,
        })
        if (!res.ok) return null
        const data = await res.json()
        const narrations = data?.narrations ?? {}
        return Object.keys(narrations).length ? narrations : null
      } catch {
        return null
      } finally {
        clearTimeout(timer)
      }
    }
    const narrations = (await attempt(5000)) ?? (await attempt(3500)) ?? {}
    setNarrations((n) => ({ ...n, [chapter]: narrations }))
    setSceneReady((r) => ({ ...r, [chapter]: true }))
  }

  const abandonRef = useRef<{ chapter: number; cardsAnswered: number } | null>(null)
  const abandonBound = useRef(false)

  function bindAbandonBeacon() {
    if (abandonBound.current) return
    abandonBound.current = true
    window.addEventListener('pagehide', () => {
      const snapshot = abandonRef.current
      if (snapshot) {
        trackLife('run_abandoned', snapshot)
        abandonRef.current = null // bfcache restores re-arm via the next choice
      }
      flushBeacon()
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
        body: JSON.stringify(
          challenge
            ? { profile, seed, parentRunId: challenge.parentRunId, name: scoreName }
            : { profile },
        ),
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
    setLifeRunId(runRef.current.runId)
    trackLife('profile_completed', { ...profile })
    bindAbandonBeacon()
    abandonRef.current = { chapter: 0, cardsAnswered: 0 }
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
    // The reveal is theater: even if the API answers instantly, hold the
    // weighing-of-the-ledger beat before showing the ending.
    const t0 = Date.now()
    const reveal = () => {
      const wait = Math.max(0, 3400 - (Date.now() - t0))
      setTimeout(() => setPhase('ending'), wait)
    }
    abandonRef.current = null
    const { runId, token } = runRef.current
    const { profile, seed } = finalState
    const lifeParam = `${seed}.${profile.stream}.${profile.city}.${profile.ambition}`
    // Challenge runs fetch the original life for the head-to-head verdict,
    // concurrently with the ending call (the reveal theater absorbs both).
    const parentPromise: Promise<{ ending?: { name: string; emoji: string }; stats?: { savings?: number } } | null> =
      challenge?.parentRunId
        ? fetch(`/api/life/${challenge.parentRunId}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        : Promise.resolve(null)
    const parent = await parentPromise
    const originalSavings = Math.round(Number(parent?.stats?.savings) || 0)
    const extras = {
      trail: finalState.trail,
      ghosts: buildGhostSummaries(finalState),
      challengeUrl: `https://www.beyond-campus.in/20years/play?l=${lifeParam}${runId ? `&c=${runId}` : ''}`,
      headToHead: parent?.ending
        ? {
            originalEnding: parent.ending.name,
            originalEmoji: parent.ending.emoji,
            originalSavings,
            mySavings: Math.round(finalState.stats.savings),
            won: finalState.stats.savings >= originalSavings,
          }
        : undefined,
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
            savingsPercentile: data.savingsPercentile ?? null,
            stats: data.stats,
            report: data.report,
            shareUrl: data.shareUrl ?? null,
            ...extras,
            ...recordDiscovery(data.ending.id),
          })
          reveal()
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
    reveal()
  }

  function onResolved(option: Card['options'][number]) {
    if (!state) return
    const card = cards[cardIndex]
    let next = applyChoice(state, card, option)
    trackLife('card_answered', { cardId: card.id, optionId: option.id, chapter: state.chapter })
    abandonRef.current = { chapter: state.chapter, cardsAnswered: next.history.length }
    if (cardIndex + 1 < cards.length) {
      setState(next)
      setCardIndex(cardIndex + 1)
      persist(next)
      window.scrollTo(0, 0)
      return
    }
    const finishedChapter = next.chapter
    trackLife('chapter_completed', { chapter: finishedChapter })
    const before = next.stats
    next = advanceChapter(next)
    if (next.chapter < CHAPTERS.length) {
      setState(next)
      setCards(dealChapter(next))
      setCardIndex(0)
      persist(next)
      fetchScene(next.chapter, next.history)
      // The years between chapters used to pass invisibly — now they get
      // a beat. The montage also absorbs the AI scene-loading wait.
      setMontage({
        fromYear: CHAPTERS[finishedChapter].yearFrom,
        toYear: CHAPTERS[next.chapter].yearFrom,
        before,
        after: next.stats,
        enteringChapter: next.chapter,
      })
      setPhase('montage')
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
    setMontage(null)
    setResult(null)
    abandonRef.current = null
    setLifeRunId(null)
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
    <main className="life-run" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <style>{`
        @keyframes lifeCardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes lifeFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes lifeFadeDim {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lifeChipPop {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes lifeDeltaFloat {
          0% { opacity: 0; transform: translateY(3px); }
          18% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-14px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .life-run *, .life-run { animation-duration: 0.01ms !important; animation-delay: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* The screen ages with the player: a low ambient glow whose color
          shifts each chapter, dawn blue at 21 through warm gold at 45. */}
      {state && phase !== 'coldopen' && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: '-30vh',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '130vw',
            height: '62vh',
            borderRadius: '50%',
            background: chapterHue(Math.min(state.chapter, CHAPTERS.length - 1)).glow,
            filter: 'blur(90px)',
            transition: 'background 1.6s ease',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

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
              <input
                type="text"
                value={scoreName}
                onChange={(e) => setScoreName(e.target.value.slice(0, 24))}
                placeholder="Your name, for their scoreboard"
                style={{
                  marginTop: 12,
                  width: '100%',
                  maxWidth: 300,
                  padding: '10px 16px',
                  borderRadius: 100,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--fg)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  textAlign: 'center',
                }}
              />
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

      {phase === 'montage' && montage && (
        <Montage
          data={montage}
          onDone={() => {
            setMontage(null)
            setPhase('intro')
            window.scrollTo(0, 0)
          }}
        />
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

      {phase === 'finale' && <FinaleTheater choiceCount={state?.history.length ?? 0} />}

      {phase === 'ending' && result && <EndingScreen result={result} onReplay={replay} />}
    </main>
  )
}

// Pure theater before the reveal: the ending is already decided, but the
// ledger deserves a moment of suspense — names flicker past like a slot
// machine deciding what to call your twenty years.
function FinaleTheater({ choiceCount }: { choiceCount: number }) {
  const [nameIdx, setNameIdx] = useState(0)
  // A deterministic spread of names — the wheel is theater, not chance.
  const names = useMemo(
    () => ENDINGS.filter((_, i) => i % 3 === 0).map((e) => `${e.emoji} ${e.name}`),
    [],
  )
  useEffect(() => {
    let i = 0
    let delay = 130
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      i += 1
      delay = Math.min(360, delay * 1.13) // the wheel slows as it settles
      setNameIdx(i % names.length)
      timer = setTimeout(tick, delay)
    }
    timer = setTimeout(tick, delay)
    return () => clearTimeout(timer)
  }, [names])
  return (
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
      <div className="mono-label" style={{ marginBottom: 20, animation: 'lifeFadeUp 0.5s ease both' }}>
        2050
      </div>
      <h2
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 32,
          margin: '0 0 12px',
          animation: 'lifeFadeUp 0.6s ease both',
          animationDelay: '0.3s',
        }}
      >
        Twenty years. {choiceCount} choices.
      </h2>
      <p
        style={{
          color: 'var(--muted)',
          fontSize: 15,
          margin: '0 0 36px',
          animation: 'lifeFadeUp 0.6s ease both',
          animationDelay: '0.7s',
        }}
      >
        Weighing the ledger, finding its name…
      </p>
      <div
        className="mono-label"
        style={{
          fontSize: 13,
          color: 'var(--blue-soft)',
          minHeight: 20,
          animation: 'lifeFadeUp 0.5s ease both',
          animationDelay: '1.2s',
        }}
      >
        {names[nameIdx]}
      </div>
    </div>
  )
}
