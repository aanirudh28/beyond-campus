export type AppStatus = 'saved' | 'applied' | 'replied' | 'interview' | 'offer' | 'rejected'
export type AppSource = 'linkedin' | 'cold_email' | 'portal' | 'referral' | 'career_page' | 'other'

export interface Application {
  id: string
  user_id: string
  company: string
  role: string
  location: string | null
  job_url: string | null
  jd_text: string | null
  source: AppSource
  status: AppStatus
  applied_at: string | null
  follow_up_date: string | null
  follow_up_count: number
  contact_name: string | null
  contact_email: string | null
  notes: string | null
  salary_range: string | null
  sort_order: number
  status_changed_at: string
  created_at: string
  updated_at: string
}

export interface TrackerProfile {
  user_id: string
  email: string
  name: string | null
  is_pro: boolean
  weekly_goal: number
  email_reminders_enabled: boolean
}

export const STATUSES: { key: AppStatus; label: string; color: string; emoji: string }[] = [
  { key: 'saved', label: 'Saved', color: '#93BBFF', emoji: '🔖' },
  { key: 'applied', label: 'Applied', color: '#4F7CFF', emoji: '📨' },
  { key: 'replied', label: 'Replied', color: '#00D2FF', emoji: '💬' },
  { key: 'interview', label: 'Interview', color: '#f59e0b', emoji: '🎙️' },
  { key: 'offer', label: 'Offer', color: '#10b981', emoji: '🎉' },
  { key: 'rejected', label: 'Rejected', color: '#ef4444', emoji: '✕' },
]

export const SOURCES: { key: AppSource; label: string }[] = [
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'cold_email', label: 'Cold Email' },
  { key: 'portal', label: 'Job Portal' },
  { key: 'referral', label: 'Referral' },
  { key: 'career_page', label: 'Career Page' },
  { key: 'other', label: 'Other' },
]

export const statusMeta = (s: AppStatus) => STATUSES.find(x => x.key === s)!
export const sourceLabel = (s: AppSource) => SOURCES.find(x => x.key === s)?.label || 'Other'

export const FREE_APP_CAP = 25
export const FREE_AI_CAP = 5

export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
