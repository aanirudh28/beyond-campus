'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  GRAD, COLORS, Card, Chip, Mono, MiniMd, PrimaryBtn,
  AccuracyRing, AptiStyles,
} from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'

// The review room: every question you've answered in a session, reopened —
// your pick, the right pick, the trap, the solution, the clock. Works for
// practice sets (?type absent) and submitted mocks (?type=mock).

interface ReviewItem {
  questionId: string
  index: number
  section: string | null
  skillName: string
  domain: string
  type: string
  stemMd: string
  options: { key: string; text: string }[]
  answerKeys: string[] | null
  answerValue: number | null
  tolerance: number | null
  chosenKey: string | null
  chosenValue: number | null
  status: 'correct' | 'wrong' | 'skipped'
  timeMs: number | null
  benchmarkSec: number
  confidence: string | null
  assisted: boolean
  errorType: string | null
  trapExplanation: string | null
  solutionMd: string
  shortcutMd: string | null
  ratingDelta: number | null
}

interface ReviewMeta {
  scope: 'set' | 'mock'
  kind: string
  name: string | null
  date: string
  completed: boolean
  total: number
  attempted: number
  correct: number
}

const KIND_LABEL: Record<string, string> = {
  daily: 'Daily Set',
  topic: 'Skill Drill',
  review: 'Redemption Run',
  comeback: 'Comeback Set',
}

const ERROR_LABELS: Record<string, string> = {
  concept: 'Didn’t know the method',
  calc: 'Calculation slip',
  misread: 'Misread it',
  trap: 'Fell for the trap',
  time: 'Rushed it',
}

const CONFIDENCE_LABELS: Record<string, string> = {
  sure: 'Felt sure',
  thinkso: 'Thought so',
  guessing: 'Guessed',
}

type Filter = 'all' | 'missed' | 'correct'

function StatusDot({ status }: { status: ReviewItem['status'] }) {
  const bg = status === 'correct' ? COLORS.correct : status === 'wrong' ? COLORS.wrong : 'rgba(255,255,255,0.14)'
  return (
    <span style={{
      width: 26, height: 26, minWidth: 26, borderRadius: 9,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: bg, color: status === 'skipped' ? COLORS.muted : '#0B0B0F',
      fontSize: 13, fontWeight: 800, lineHeight: 1,
    }}>
      {status === 'correct' ? '✓' : status === 'wrong' ? '✕' : '–'}
    </span>
  )
}

function MetaChips({ item }: { item: ReviewItem }) {
  const chips: { text: string; color: string; bg: string }[] = []
  if (item.timeMs != null) {
    const sec = Math.round(item.timeMs / 1000)
    const over = sec - item.benchmarkSec
    chips.push(over <= 0
      ? { text: `⚡ ${sec}s · ${-over}s under par`, color: COLORS.correct, bg: COLORS.correctBg }
      : { text: `${sec}s · ${over}s over par`, color: COLORS.stretch, bg: COLORS.stretchBg })
  }
  if (item.confidence) {
    const label = CONFIDENCE_LABELS[item.confidence] ?? item.confidence
    // calibration is the lesson: confident misses and lucky hits get flagged
    const c = item.confidence === 'sure' && item.status === 'wrong'
      ? { text: `${label} — and missed`, color: COLORS.wrong, bg: COLORS.wrongBg }
      : item.confidence === 'guessing' && item.status === 'correct'
        ? { text: 'Guessed right', color: COLORS.stretch, bg: COLORS.stretchBg }
        : { text: label, color: COLORS.muted, bg: 'rgba(255,255,255,0.05)' }
    chips.push(c)
  }
  if (item.errorType) {
    chips.push({ text: ERROR_LABELS[item.errorType] ?? item.errorType, color: COLORS.muted, bg: 'rgba(255,255,255,0.05)' })
  }
  if (item.assisted) {
    chips.push({ text: '💡 Hint used', color: COLORS.stretch, bg: COLORS.stretchBg })
  }
  if (item.ratingDelta != null && item.ratingDelta !== 0) {
    chips.push(item.ratingDelta > 0
      ? { text: `▲ +${item.ratingDelta} rating`, color: COLORS.correct, bg: COLORS.correctBg }
      : { text: `▼ ${item.ratingDelta} rating`, color: COLORS.wrong, bg: COLORS.wrongBg })
  }
  if (chips.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
      {chips.map((c, i) => (
        <span key={i} style={{
          fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 600,
          color: c.color, background: c.bg,
          padding: '5px 11px', borderRadius: 100, whiteSpace: 'nowrap',
        }}>
          {c.text}
        </span>
      ))}
    </div>
  )
}

function OptionRows({ item }: { item: ReviewItem }) {
  if (item.type === 'numeric') {
    const rows = [
      item.status !== 'skipped' && {
        label: 'Your answer',
        value: item.chosenValue ?? '—',
        good: item.status === 'correct',
      },
      { label: 'Correct answer', value: `${item.answerValue}${item.tolerance ? ` (±${item.tolerance})` : ''}`, good: true },
    ].filter(Boolean) as { label: string; value: string | number; good: boolean }[]
    return (
      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        {rows.map((r) => (
          <div key={r.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 14px', borderRadius: 12, fontSize: 14.5,
            background: r.good ? COLORS.correctBg : COLORS.wrongBg,
            border: `1px solid ${r.good ? COLORS.correct : COLORS.wrong}`,
          }}>
            <span style={{ color: COLORS.muted }}>{r.label}</span>
            <Mono style={{ fontWeight: 700, color: r.good ? COLORS.correct : COLORS.wrong }}>{r.value}</Mono>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
      {item.options.map((o) => {
        const isAnswer = item.answerKeys?.includes(o.key)
        const isYourMiss = item.chosenKey === o.key && !isAnswer
        const st = isAnswer
          ? { background: COLORS.correctBg, border: `1px solid ${COLORS.correct}` }
          : isYourMiss
            ? { background: COLORS.wrongBg, border: `1px solid ${COLORS.wrong}` }
            : { background: 'rgba(255,255,255,0.02)', border: `1px solid ${COLORS.hair}`, opacity: 0.5 }
        return (
          <div key={o.key} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 13px', borderRadius: 12, fontSize: 14.5, ...st,
          }}>
            <span style={{
              width: 26, height: 26, minWidth: 26, borderRadius: 8,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
              background: isAnswer ? COLORS.correct : isYourMiss ? COLORS.wrong : 'rgba(255,255,255,0.07)',
              color: isAnswer || isYourMiss ? '#0B0B0F' : COLORS.muted,
            }}>
              {isAnswer ? '✓' : isYourMiss ? '✕' : o.key}
            </span>
            <span style={{ lineHeight: 1.5 }}>{o.text}</span>
            {isAnswer && item.chosenKey === o.key && (
              <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--mono)', color: COLORS.correct, whiteSpace: 'nowrap' }}>your pick</span>
            )}
            {isYourMiss && (
              <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--mono)', color: COLORS.wrong, whiteSpace: 'nowrap' }}>your pick</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function QuestionCard({ item, open, onToggle }: { item: ReviewItem; open: boolean; onToggle: () => void }) {
  return (
    <Card style={{ padding: 0, marginBottom: 10, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 13, width: '100%',
          padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer',
          color: '#fff', fontFamily: 'inherit', textAlign: 'left', fontSize: 14.5,
        }}
      >
        <StatusDot status={item.status} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: 1.5,
            textTransform: 'uppercase', color: COLORS.muted2, marginBottom: 5,
          }}>
            Q{item.index} · {item.skillName}{item.section ? ` · ${item.section}` : ''}
          </span>
          {!open && (
            <span style={{
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', color: COLORS.muted, lineHeight: 1.5, fontSize: 14,
            }}>
              {item.stemMd.replace(/\*\*/g, '')}
            </span>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 2 }}>
          {item.timeMs != null && (
            <Mono style={{ fontSize: 12, color: COLORS.muted2 }}>{Math.round(item.timeMs / 1000)}s</Mono>
          )}
          <span aria-hidden style={{
            color: COLORS.muted2, fontSize: 12, display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
          }}>▼</span>
        </span>
      </button>

      {open && (
        <div className="apti-in" style={{ padding: '2px 18px 20px' }}>
          <div style={{ fontSize: 16.5, lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
            <MiniMd text={item.stemMd} />
          </div>

          <OptionRows item={item} />
          <MetaChips item={item} />

          {item.status === 'skipped' && (
            <p style={{
              fontSize: 13.5, color: COLORS.muted, lineHeight: 1.6, marginBottom: 16,
              padding: '12px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`,
            }}>
              Skipped under the clock — smart move. The solution is still worth sixty seconds now.
            </p>
          )}

          {item.trapExplanation && (
            <div style={{
              padding: '13px 16px', borderRadius: 12, marginBottom: 12,
              background: COLORS.stretchBg, borderLeft: `3px solid ${COLORS.stretch}`,
            }}>
              <p className="mono-label" style={{ color: COLORS.stretch, marginBottom: 6 }}>The trap you hit</p>
              <p style={{ fontSize: 14.5, lineHeight: 1.6 }}><MiniMd text={item.trapExplanation} /></p>
            </div>
          )}

          <div style={{
            padding: '13px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`,
          }}>
            <p className="mono-label" style={{ marginBottom: 6 }}>Solution</p>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
              <MiniMd text={item.solutionMd} />
            </p>
            {item.shortcutMd && (
              <div style={{
                marginTop: 12, padding: '11px 14px', borderRadius: 10,
                background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.25)',
              }}>
                <p className="mono-label" style={{ color: COLORS.purple, marginBottom: 5 }}>★ The fast way</p>
                <p style={{ fontSize: 14.5, lineHeight: 1.6 }}><MiniMd text={item.shortcutMd} /></p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

export default function ReviewPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { id } = use(params)
  const isMock = use(searchParams).type === 'mock'
  const [meta, setMeta] = useState<ReviewMeta | null>(null)
  const [items, setItems] = useState<ReviewItem[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch(`/api/apti/review/${id}${isMock ? '?type=mock' : ''}`)
      .then((r) => {
        if (r.status === 401) { router.push('/login?next=/practice/history'); return null }
        if (r.status === 404) { router.replace('/practice/history'); return null }
        if (!r.ok) throw new Error('load failed')
        return r.json()
      })
      .then((d: { meta: ReviewMeta; items: ReviewItem[] } | null) => {
        if (!d || cancelled) return
        setMeta(d.meta)
        setItems(d.items)
        // land on the misses when there are some — that's what review is for
        const missed = d.items.filter((i) => i.status !== 'correct').length
        if (missed > 0 && missed < d.items.length) setFilter('missed')
      })
      .catch(() => { if (!cancelled) setError('Could not load the review. Refresh to retry.') })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isMock])

  const visible = useMemo(() => items.filter((i) =>
    filter === 'all' ? true : filter === 'correct' ? i.status === 'correct' : i.status !== 'correct'
  ), [items, filter])

  if (error) {
    return (
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
        <p style={{ color: COLORS.muted }}>{error}</p>
      </main>
    )
  }
  if (!meta) {
    return (
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <AptiStyles />
        <div style={{
          width: 36, height: 36, margin: '0 auto 18px', borderRadius: '50%',
          border: '3px solid rgba(79,124,255,0.2)', borderTopColor: COLORS.blue,
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: COLORS.muted2, fontSize: 14 }}>Reopening the session…</p>
      </main>
    )
  }

  const missedCount = items.length - items.filter((i) => i.status === 'correct').length
  const accuracy = items.length > 0 ? meta.correct / items.length : 0
  const dateStr = new Date(meta.date).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata',
  })
  const kindLabel = meta.scope === 'mock' ? meta.name ?? 'Mock' : KIND_LABEL[meta.kind] ?? 'Session'
  const timed = items.filter((i) => i.timeMs != null)
  const avgSec = timed.length > 0
    ? Math.round(timed.reduce((a, i) => a + (i.timeMs ?? 0), 0) / timed.length / 1000)
    : null

  const heading = items.length === 0
    ? <>Nothing to review <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>yet.</em></>
    : missedCount === 0
      ? <>Flawless. <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>Study it anyway.</em></>
      : accuracy >= 0.7
        ? <>Good work. <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>The misses are gold.</em></>
        : <>This is where <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>rating gets made.</em></>

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: items.length },
    { key: 'missed', label: 'Missed', count: missedCount },
    { key: 'correct', label: 'Correct', count: items.length - missedCount },
  ]

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 120px' }}>
      <AptiStyles />

      <header className="apti-in" style={{ marginBottom: 22 }}>
        <p className="mono-label" style={{ marginBottom: 10 }}>
          Review · {kindLabel} · {dateStr}
        </p>
        <h1 style={{
          fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 32,
          letterSpacing: -1, lineHeight: 1.15, marginBottom: 8,
        }}>
          {heading}
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14.5, lineHeight: 1.6 }}>
          {items.length === 0
            ? 'Answer a question in this session and it appears here with its full solution.'
            : missedCount === 0
              ? 'Every solution below still pays — check the clock on your slowest wins.'
              : 'Reread a miss slowly once and it rarely beats you twice. That’s the whole trick.'}
        </p>
      </header>

      {items.length > 0 && (
        <>
          <div className="apti-in" style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 20 }}>
            <AccuracyRing correct={meta.correct} total={items.length} size={104} />
            <div style={{ display: 'grid', gap: 10 }}>
              {avgSec != null && (
                <div>
                  <Mono style={{ fontSize: 20, fontWeight: 600, display: 'block', lineHeight: 1.1 }}>{avgSec}s</Mono>
                  <span style={{ fontSize: 11.5, color: COLORS.muted2 }}>avg per question</span>
                </div>
              )}
              {meta.scope === 'set' && !meta.completed && (
                <Chip color={COLORS.stretch} bg={COLORS.stretchBg}>In progress · {meta.total - meta.attempted} left</Chip>
              )}
              {meta.scope === 'mock' && (
                <div>
                  <Mono style={{ fontSize: 20, fontWeight: 600, display: 'block', lineHeight: 1.1 }}>
                    {items.filter((i) => i.status === 'skipped').length}
                  </Mono>
                  <span style={{ fontSize: 11.5, color: COLORS.muted2 }}>skipped</span>
                </div>
              )}
            </div>
          </div>

          {/* filter pills — sticky so long sets stay navigable */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 20, display: 'flex', gap: 8,
            padding: '12px 0', marginBottom: 8,
            background: 'rgba(11,11,15,0.9)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          }}>
            {FILTERS.map((f) => {
              const active = filter === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  disabled={f.count === 0 && f.key !== 'all'}
                  className="apti-option"
                  style={{
                    padding: '9px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    borderRadius: 100, cursor: f.count === 0 && f.key !== 'all' ? 'default' : 'pointer',
                    background: active ? GRAD : 'rgba(255,255,255,0.04)',
                    color: active ? '#fff' : f.count === 0 && f.key !== 'all' ? COLORS.muted2 : COLORS.muted,
                    border: active ? '1px solid transparent' : `1px solid ${COLORS.hair}`,
                  }}
                >
                  {f.label} <Mono style={{ fontSize: 11.5, opacity: 0.8 }}>{f.count}</Mono>
                </button>
              )
            })}
          </div>

          {visible.map((item) => (
            <QuestionCard
              key={item.questionId}
              item={item}
              open={!!openIds[item.questionId]}
              onToggle={() => setOpenIds((s) => ({ ...s, [item.questionId]: !s[item.questionId] }))}
            />
          ))}

          {meta.scope === 'set' && missedCount > 0 && (
            <p style={{ fontSize: 12.5, color: COLORS.muted2, lineHeight: 1.6, margin: '16px 2px 0' }}>
              ↺ Your misses here are already in the redemption queue — they return in a coming daily set.
            </p>
          )}
        </>
      )}

      <div className="apti-in" style={{ marginTop: 28 }}>
        {meta.scope === 'set' && !meta.completed && (
          <PrimaryBtn onClick={() => router.push(`/practice/set/${id}`)} style={{ marginBottom: 12 }}>
            Resume this set →
          </PrimaryBtn>
        )}
        <Link href="/practice/history" style={{
          display: 'block', textAlign: 'center', padding: '14px', borderRadius: 100,
          background: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.hair}`,
          fontSize: 14.5, fontWeight: 600, marginBottom: 10,
        }}>
          All past sessions →
        </Link>
        <Link href="/practice" style={{ display: 'block', textAlign: 'center', padding: '10px', fontSize: 13.5, color: COLORS.muted2 }}>
          Back to Today
        </Link>
      </div>

      <AptiNav active="none" />
    </main>
  )
}
