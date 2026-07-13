// Subtle haptic feedback for the life-sim's weighted moments.
// Silent no-op wherever the Vibration API is absent (desktop, iOS Safari).
export function buzz(ms = 20) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(ms)
    }
  } catch {}
}
