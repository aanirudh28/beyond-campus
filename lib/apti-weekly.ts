// Weekly "wrong-answer autopsy" email builder (docs/aptitude/06 §2).
// Pure — takes pre-fetched rows, returns subject + body HTML for emailShell.
// Runnable under `node --test` (scripts/apti-weekly.test.ts).

export interface WrongHighlight {
  stemMd: string
  skillName: string
  trapExplanation: string | null
}

export interface WeeklyInput {
  setsCompleted: number
  startRatings: Record<string, number>   // earliest ratings_at_start this week
  ratings: Record<string, number>        // current profile ratings
  errorMix: Record<string, number>       // error_type -> count, this week's misses
  wrongCount: number
  attemptCount: number
  wrongHighlights: WrongHighlight[]      // up to 3, most instructive first
  weakestSkill: { name: string; accuracy: number } | null
}

const DOMAIN_LABELS: Record<string, string> = {
  quant: 'Quant', logical: 'Logical', verbal: 'Verbal', di: 'DI', business: 'Business',
}

const COACH_LINES: Record<string, string> = {
  concept: 'Most of your misses were method gaps. That is the easiest kind to fix: one solution read slowly beats ten questions rushed.',
  calc: 'Your methods are right — the arithmetic is leaking. Slow the last two steps by five seconds; that is where the marks are.',
  misread: 'You are not missing maths, you are missing words. Underline what the question actually asks before touching the numbers.',
  trap: 'You keep meeting the test-writer where they want you. Before locking an answer that feels instant, ask what mistake it was designed to catch.',
  time: 'Speed pressure is deciding your answers. Attempt one fewer question and bank the accuracy — that trade wins on almost every real test.',
}
const COACH_FALLBACK = 'Clean week. The next rating jump comes from stretch questions — take the hard one instead of the comfortable one.'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const stripMd = (s: string) => s.replace(/\*\*/g, '')

export function dominantError(errorMix: Record<string, number>): string | null {
  let best: string | null = null
  let bestN = 0
  for (const [k, n] of Object.entries(errorMix)) {
    if (n > bestN) { best = k; bestN = n }
  }
  return best
}

export function buildWeeklyAutopsy(input: WeeklyInput): { subject: string; body: string } {
  // rating movement across domains practiced this week
  const deltas: { domain: string; delta: number; now: number }[] = []
  for (const [domain, now] of Object.entries(input.ratings)) {
    const start = input.startRatings[domain]
    if (typeof start === 'number' && typeof now === 'number') {
      deltas.push({ domain, delta: now - start, now })
    }
  }
  const totalDelta = deltas.reduce((a, d) => a + d.delta, 0)
  const deltaStr = `${totalDelta >= 0 ? '+' : ''}${totalDelta}`

  const subject = input.wrongCount > 0
    ? `Your week in aptitude: ${deltaStr} rating, and the ${input.wrongCount === 1 ? 'miss' : 'misses'} worth stealing back`
    : `Your week in aptitude: ${deltaStr} rating, zero unforced errors`

  const ratingRows = deltas.map((d) => `
    <tr>
      <td style="padding: 9px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.7);">${DOMAIN_LABELS[d.domain] ?? d.domain}</td>
      <td style="padding: 9px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: right; font-family: monospace; color: white;">${d.now}</td>
      <td style="padding: 9px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: right; font-family: monospace; color: ${d.delta > 0 ? '#34D399' : d.delta < 0 ? '#F87171' : 'rgba(255,255,255,0.4)'};">${d.delta > 0 ? '▲ +' : d.delta < 0 ? '▼ ' : '· '}${Math.abs(d.delta)}</td>
    </tr>`).join('')

  const highlights = input.wrongHighlights.slice(0, 3).map((w, i) => `
    <div style="background: rgba(255,255,255,0.03); border-left: 3px solid #FBBF24; border-radius: 10px; padding: 13px 16px; margin: 0 0 10px;">
      <p style="color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 6px;">Miss ${i + 1} · ${esc(w.skillName)}</p>
      <p style="color: rgba(255,255,255,0.8); font-size: 13.5px; line-height: 1.6; margin: 0;">${esc(stripMd(w.stemMd)).slice(0, 220)}</p>
      ${w.trapExplanation ? `<p style="color: #FBBF24; font-size: 12.5px; line-height: 1.6; margin: 8px 0 0;">The trap: ${esc(stripMd(w.trapExplanation))}</p>` : ''}
    </div>`).join('')

  const mixParts = Object.entries(input.errorMix)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${n}× ${k === 'calc' ? 'calc slip' : k}`)
    .join(' · ')

  const dominant = dominantError(input.errorMix)
  const coach = dominant ? COACH_LINES[dominant] ?? COACH_FALLBACK : COACH_FALLBACK

  const planLine = input.weakestSkill
    ? `${Math.max(5, Math.min(7, input.setsCompleted + 1))} daily sets, with extra reps on <strong style="color: white;">${esc(input.weakestSkill.name)}</strong> (${input.weakestSkill.accuracy}% this week — your biggest single lever).`
    : `${Math.max(5, Math.min(7, input.setsCompleted + 1))} daily sets. Consistency is the whole plan.`

  const body = `
    <h1 style="font-size: 22px; margin: 0 0 6px;">Your week, honestly 🔬</h1>
    <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7; margin: 0 0 18px;">${input.setsCompleted} set${input.setsCompleted === 1 ? '' : 's'} · ${input.attemptCount} questions · ${input.wrongCount} miss${input.wrongCount === 1 ? '' : 'es'}</p>
    ${ratingRows ? `<table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.03); border-radius: 12px; overflow: hidden; margin-bottom: 20px;">${ratingRows}</table>` : ''}
    ${highlights ? `<p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7; margin: 0 0 10px;">The misses that teach the most — can you solve them now?</p>${highlights}` : ''}
    ${mixParts ? `<p style="color: rgba(255,255,255,0.6); font-size: 13.5px; line-height: 1.7; margin: 14px 0 0;">Error mix: ${mixParts}.</p>` : ''}
    <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.7; font-style: italic; margin: 14px 0 0;">${coach}</p>
    <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7; margin: 14px 0 0;">Next week: ${planLine}</p>`

  return { subject, body }
}
