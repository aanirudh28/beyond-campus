import { createClient } from '@supabase/supabase-js'
import { CASEBOOKS, type DownloadCounts } from '@/lib/casebooks'
import ConsultingClient from './ConsultingClient'

// Regenerate hourly. The counts don't need to be live to the second, and this
// keeps the page static for crawlers and fast for students (no DB hit per view).
export const revalidate = 3600

// Real counts out of `resource_downloads` (populated by /api/track-download
// since Apr 2026). Uses head-only exact counts so Postgres does the counting
// and we transfer no rows. Fails soft: if Supabase or the env vars are missing
// — e.g. a local build with dummy keys — the page renders without the counts
// rather than 500ing.
async function getDownloadCounts(): Promise<DownloadCounts> {
  const empty: DownloadCounts = { total: {}, week: {} }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || key === 'dummy') return empty

  try {
    const svc = createClient(url, key)
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

    const results = await Promise.all(
      CASEBOOKS.flatMap(c => [
        svc.from('resource_downloads')
          .select('*', { count: 'exact', head: true })
          .eq('resource_name', c.name),
        svc.from('resource_downloads')
          .select('*', { count: 'exact', head: true })
          .eq('resource_name', c.name)
          .gte('downloaded_at', weekAgo),
      ])
    )

    const counts: DownloadCounts = { total: {}, week: {} }
    CASEBOOKS.forEach((c, i) => {
      counts.total[c.slug] = results[i * 2].count ?? 0
      counts.week[c.slug] = results[i * 2 + 1].count ?? 0
    })
    return counts
  } catch {
    return empty
  }
}

export default async function ConsultingResourcesPage() {
  const counts = await getDownloadCounts()
  return <ConsultingClient counts={counts} />
}
