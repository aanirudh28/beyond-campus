// WhatsApp-status-sized brag cards, drawn locally on a canvas — nothing
// leaves the device unless the student shares it (doc 11: never auto-post).
import { trackAptiEvent } from './track'
import type { SetSummary } from './SetPlayer'

function cardCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; serif: string; mono: string } | null {
  const size = 1080
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#0B0B0F'
  ctx.fillRect(0, 0, size, size)
  const glow = ctx.createRadialGradient(size / 2, 240, 60, size / 2, 240, 620)
  glow.addColorStop(0, 'rgba(79,124,255,0.28)')
  glow.addColorStop(0.55, 'rgba(123,97,255,0.10)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)

  const serif = getComputedStyle(document.body).getPropertyValue('--serif') || 'Georgia, serif'
  const mono = getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = `500 26px ${mono}`
  ctx.fillText('B E Y O N D   C A M P U S   ·   A P T I', 540, 130)
  return { canvas, ctx, serif, mono }
}

function gradFill(ctx: CanvasRenderingContext2D): CanvasGradient {
  const grad = ctx.createLinearGradient(280, 0, 800, 0)
  grad.addColorStop(0, '#4F7CFF')
  grad.addColorStop(1, '#7B61FF')
  return grad
}

async function shareCanvas(canvas: HTMLCanvasElement, filename: string, text: string) {
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return
    } catch { /* user cancelled — fall through to download */ }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = file.name
  a.click()
  URL.revokeObjectURL(a.href)
}

export async function shareResultCard(s: SetSummary) {
  const c = cardCanvas()
  if (!c) return
  const { canvas, ctx, serif, mono } = c
  trackAptiEvent('share_card_generated', { kind: 'streak', streak: s.streak })

  ctx.font = '120px serif'
  ctx.fillText('🔥', 540, 330)
  ctx.fillStyle = gradFill(ctx)
  ctx.font = `400 150px ${serif}`
  ctx.fillText(`Day ${s.streak}`, 540, 510)
  ctx.fillStyle = '#ffffff'
  ctx.font = `400 54px ${serif}`
  ctx.fillText('of daily aptitude practice', 540, 590)
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `600 44px ${mono}`
  ctx.fillText(`${s.correct}/${s.total} correct today`, 540, 700)

  const deltas = Object.entries(s.ratingDeltas).filter(([, d]) => d !== 0)
  if (deltas.length > 0) {
    ctx.fillStyle = '#34D399'
    ctx.font = `600 38px ${mono}`
    const line = deltas.slice(0, 3).map(([dom, d]) =>
      `${dom.charAt(0).toUpperCase() + dom.slice(1)} ${d > 0 ? '▲+' : '▼'}${Math.abs(d)}`).join('   ')
    ctx.fillText(line, 540, 775)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = `500 30px ${mono}`
  ctx.fillText('beyond-campus.in/practice', 540, 960)

  await shareCanvas(canvas, `apti-day-${s.streak}.png`, `Day ${s.streak} of daily aptitude practice 🔥`)
}

function fmtClock(ms: number): string {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// The Wordle loop (doc 11): same 3 questions for everyone, so the card is a
// direct, fair "can you beat me?" — the link opens today's same challenge.
export async function shareChallengeCard(opts: {
  correct: number
  total: number
  totalTimeMs?: number
  topPct?: number
}) {
  const c = cardCanvas()
  if (!c) return
  const { canvas, ctx, serif, mono } = c
  trackAptiEvent('share_card_generated', { kind: 'challenge', topPct: opts.topPct ?? null })

  ctx.font = '110px serif'
  ctx.fillText('⚡', 540, 320)
  ctx.fillStyle = '#ffffff'
  ctx.font = `400 58px ${serif}`
  ctx.fillText("Today's Daily Challenge", 540, 430)

  ctx.fillStyle = gradFill(ctx)
  ctx.font = `400 170px ${serif}`
  const time = opts.totalTimeMs ? ` in ${fmtClock(opts.totalTimeMs)}` : ''
  ctx.fillText(`${opts.correct}/${opts.total}${time}`, 540, 620)

  if (typeof opts.topPct === 'number') {
    ctx.fillStyle = '#34D399'
    ctx.font = `600 46px ${mono}`
    ctx.fillText(`top ${opts.topPct}% today`, 540, 710)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `400 42px ${serif}`
  ctx.fillText('Same 3 questions for every student.', 540, 820)
  ctx.fillText('Think you can beat me?', 540, 875)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = `500 30px ${mono}`
  ctx.fillText('beyond-campus.in/aptitude', 540, 970)

  const text = `Today's aptitude challenge: ${opts.correct}/${opts.total}${time}${typeof opts.topPct === 'number' ? ` — top ${opts.topPct}%` : ''} ⚡ Same 3 questions for everyone: beyond-campus.in/aptitude`
  await shareCanvas(canvas, 'apti-challenge.png', text)
}
