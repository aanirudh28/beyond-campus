import crypto from 'crypto'

// Run tokens: `${runId}.${issuedAt}.${hmac}` signed with CRON_SECRET
// (same secret pattern as the nurture unsubscribe links). Node-only —
// never import from client components.

const TOKEN_TTL_MS = 4 * 60 * 60 * 1000

function sign(runId: string, iat: number) {
  return crypto
    .createHmac('sha256', process.env.CRON_SECRET!)
    .update(`${runId}.${iat}`)
    .digest('hex')
}

export function issueRunToken(runId: string): string {
  const iat = Date.now()
  return `${runId}.${iat}.${sign(runId, iat)}`
}

// Returns the runId when valid, null otherwise.
export function verifyRunToken(token: unknown): string | null {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [runId, iatStr, sig] = parts
  const iat = Number(iatStr)
  if (!runId || !Number.isFinite(iat)) return null
  if (Date.now() - iat > TOKEN_TTL_MS) return null
  const expected = sign(runId, iat)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  return runId
}
