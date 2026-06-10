// Thin wrapper around GA4 gtag — safe to call anywhere (no-ops on server / if GA blocked)
type GtagWindow = Window & { gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void }

export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const w = window as GtagWindow
  if (typeof w.gtag === 'function') {
    w.gtag('event', event, params)
  }
}
