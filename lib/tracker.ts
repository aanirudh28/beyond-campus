import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createSSRClient } from '@/lib/supabase/server'

export const FREE_AI_CAP = 5

export function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Identify the caller from session cookies. Never trust a userId in the body.
export async function getAuthedUser() {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// One-time pack buyers (resource_purchases / manual_access, email-keyed) get
// Tracker Pro — this grandfathers old ₹199 buyers and links anonymous
// purchases made on /free to accounts created later.
export async function syncProEntitlement(userId: string, email: string): Promise<boolean> {
  const svc = serviceClient()
  const { data: profile } = await svc
    .from('tracker_profiles')
    .select('is_pro')
    .eq('user_id', userId)
    .single()
  if (profile?.is_pro) return true

  const [{ data: manual }, { data: purchase }] = await Promise.all([
    svc.from('manual_access').select('id').eq('email', email).maybeSingle(),
    svc.from('resource_purchases').select('id').eq('email', email).maybeSingle(),
  ])
  if (manual || purchase) {
    await svc.from('tracker_profiles').update({ is_pro: true }).eq('user_id', userId)
    return true
  }
  return false
}

export async function getAiUsage(userId: string) {
  const svc = serviceClient()
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const { count } = await svc
    .from('ai_generations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('kind', 'weekly_insight')
    .gte('created_at', monthStart.toISOString())
  return count || 0
}

export async function recordGeneration(userId: string, kind: string, output: unknown, applicationId?: string | null) {
  await serviceClient().from('ai_generations').insert({
    user_id: userId,
    application_id: applicationId || null,
    kind,
    output,
  })
}

// Strip markdown fences Claude sometimes adds despite instructions
export function parseClaudeJson(text: string) {
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}
