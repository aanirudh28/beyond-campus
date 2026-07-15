// Client-side event tracker (doc 08 §2). Batched, fire-and-forget, flushed
// by fetch on a short timer and by sendBeacon when the page hides, so
// abandons and share clicks survive tab closes. No PII: enum/id/int props only.

type Props = Record<string, string | number | boolean>

let runId: string | null = null
const queue: { n: string; p?: Props }[] = []
let timer: ReturnType<typeof setTimeout> | null = null
let listenersBound = false

export function setLifeRunId(id: string | null) {
  runId = id
}

function payload() {
  return JSON.stringify({ runId, events: queue.splice(0, queue.length) })
}

function flushFetch() {
  if (!queue.length) return
  try {
    fetch('/api/life/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload(),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}

export function flushBeacon() {
  if (!queue.length) return
  try {
    const body = payload()
    if (!navigator.sendBeacon?.('/api/life/events', new Blob([body], { type: 'application/json' }))) {
      fetch('/api/life/events', { method: 'POST', body, keepalive: true }).catch(() => {})
    }
  } catch {}
}

export function trackLife(n: string, p?: Props) {
  try {
    queue.push(p ? { n, p } : { n })
    if (queue.length >= 20) {
      flushFetch()
      return
    }
    if (!timer) {
      timer = setTimeout(() => {
        timer = null
        flushFetch()
      }, 2500)
    }
    if (!listenersBound && typeof window !== 'undefined') {
      listenersBound = true
      window.addEventListener('pagehide', flushBeacon)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushBeacon()
      })
    }
  } catch {}
}
