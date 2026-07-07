// Fire-and-forget product events from client components (doc 06 §3).
// Never blocks navigation; failures are silently dropped.
export function trackAptiEvent(name: string, props?: Record<string, unknown>) {
  try {
    fetch('/api/apti/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, props: props ?? {} }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignore — analytics must never break the product
  }
}
