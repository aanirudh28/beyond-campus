// Study Circles (docs/aptitude/09 phase 2): the accountability scoreboard.
// Service-role only — a member's streak, weekly sets and rating delta live
// behind RLS on their own rows, so the shared view is assembled server-side.

import { serviceClient } from '@/lib/tracker'
import { istDateString } from '@/lib/apti-engine'

export const MAX_MEMBERS = 8
export const MAX_CIRCLES = 5
const WEEK_MS = 7 * 86_400_000

export interface CircleMember {
  displayName: string
  streak: number
  setsThisWeek: number
  weeklyDelta: number
  isYou: boolean
}
export interface CircleView {
  id: string
  name: string
  inviteCode: string
  memberCount: number
  canPokeToday: boolean
  members: CircleMember[]
}

// Unambiguous invite code (no 0/O/1/I). Uniqueness is enforced by the unique
// index; the caller retries on the rare collision.
export function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}

const sumRatings = (r: Record<string, number> | null | undefined) =>
  Object.values(r ?? {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)

export async function loadCirclesForUser(userId: string): Promise<CircleView[]> {
  const svc = serviceClient()
  const { data: myMemberships } = await svc.from('apti_circle_members')
    .select('circle_id, last_poke_at').eq('user_id', userId)
  const circleIds = (myMemberships ?? []).map((m) => m.circle_id)
  if (circleIds.length === 0) return []

  const [{ data: circles }, { data: members }] = await Promise.all([
    svc.from('apti_circles').select('id, name, invite_code').in('id', circleIds),
    svc.from('apti_circle_members').select('circle_id, user_id, display_name').in('circle_id', circleIds),
  ])
  const memberUserIds = [...new Set((members ?? []).map((m) => m.user_id))]

  const [{ data: profiles }, { data: sets }] = await Promise.all([
    svc.from('apti_profiles').select('user_id, streak, ratings').in('user_id', memberUserIds),
    svc.from('apti_daily_sets')
      .select('user_id, completed_at, ratings_at_start, created_at')
      .in('user_id', memberUserIds).eq('kind', 'daily').not('completed_at', 'is', null)
      .gte('created_at', new Date(Date.now() - WEEK_MS).toISOString())
      .order('created_at', { ascending: true }),
    ])

  const profileByUser = new Map((profiles ?? []).map((p) => [p.user_id, p]))
  // per user this week: completed-set count + earliest ratings snapshot
  const weekByUser = new Map<string, { count: number; startSum: number }>()
  for (const s of sets ?? []) {
    const cur = weekByUser.get(s.user_id)
    if (cur) cur.count++
    else weekByUser.set(s.user_id, { count: 1, startSum: sumRatings(s.ratings_at_start) })
  }

  const today = istDateString()
  const pokeByCircle = new Map((myMemberships ?? []).map((m) => [m.circle_id, m.last_poke_at as string | null]))

  return (circles ?? []).map((c) => {
    const circleMembers = (members ?? []).filter((m) => m.circle_id === c.id)
    const rows: CircleMember[] = circleMembers.map((m) => {
      const p = profileByUser.get(m.user_id)
      const week = weekByUser.get(m.user_id)
      const currentSum = sumRatings(p?.ratings)
      return {
        displayName: m.display_name,
        streak: p?.streak ?? 0,
        setsThisWeek: week?.count ?? 0,
        weeklyDelta: week ? currentSum - week.startSum : 0,
        isYou: m.user_id === userId,
      }
    }).sort((a, b) => b.setsThisWeek - a.setsThisWeek || b.streak - a.streak || b.weeklyDelta - a.weeklyDelta)

    const lastPoke = pokeByCircle.get(c.id)
    const canPokeToday = !lastPoke || istDateString(new Date(lastPoke)) !== today

    return {
      id: c.id, name: c.name, inviteCode: c.invite_code,
      memberCount: circleMembers.length, canPokeToday, members: rows,
    }
  })
}
