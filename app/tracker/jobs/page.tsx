'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { todayStr, addDays } from '@/app/components/tracker/types'

interface FeedJob {
  id: string
  company: string
  role: string
  location: string | null
  job_url: string
  jd_summary: string | null
  domain: string
  published_at: string
}

const DOMAIN_LABELS: Record<string, string> = {
  all: 'All',
  consulting: 'Consulting',
  finance: 'Finance',
  marketing: 'Marketing',
  bd: 'Sales / BD',
  operations: 'Operations',
  founders_office: "Founder's Office",
  other: 'Other',
}

function postedAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export default function JobsFeedPage() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<FeedJob[]>([])
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState<string | null>(null)
  const [domain, setDomain] = useState('all')
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?next=/tracker/jobs'); return }
      const [{ data: published }, { data: mine }] = await Promise.all([
        supabase.from('jobs').select('id, company, role, location, job_url, jd_summary, domain, published_at').order('published_at', { ascending: false }).limit(200),
        supabase.from('applications').select('job_url').not('job_url', 'is', null),
      ])
      setJobs(published || [])
      setSavedUrls(new Set((mine || []).map(a => a.job_url as string)))
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async (job: FeedJob) => {
    setSaving(job.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?next=/tracker/jobs'); return }
    const { error } = await supabase.from('applications').insert({
      user_id: user.id,
      company: job.company,
      role: job.role,
      location: job.location,
      job_url: job.job_url,
      jd_text: job.jd_summary,
      source: 'career_page',
      status: 'saved',
      follow_up_date: addDays(todayStr(), 5),
    })
    if (!error) setSavedUrls(prev => new Set(prev).add(job.job_url))
    setSaving(null)
  }

  const visible = jobs.filter(j =>
    (domain === 'all' || j.domain === domain) &&
    (!search.trim() || `${j.company} ${j.role} ${j.location || ''}`.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', fontFamily: "'DM Sans', sans-serif", padding: '0 0 80px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        @media (max-width: 640px) { input { font-size: 16px !important; } }
      `}</style>

      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,11,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/tracker" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>← Board</Link>
          <h1 style={{ color: 'white', fontSize: 17, fontWeight: 800, margin: 0 }}>💼 Fresh Openings</h1>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: '#00D2FF', background: 'rgba(0,210,255,0.1)', padding: '4px 10px', borderRadius: 100 }}>
            Curated for freshers
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 24px 0' }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 18px' }}>
          Hand-picked non-tech roles open to freshers — updated daily. Save one and it lands on your board with a follow-up reminder already set.
        </p>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDomain(key)}
              style={{
                padding: '8px 14px', borderRadius: 100, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                background: domain === key ? 'rgba(79,124,255,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${domain === key ? '#4F7CFF' : 'rgba(255,255,255,0.1)'}`,
                color: domain === key ? '#93BBFF' : 'rgba(255,255,255,0.5)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search company, role, city..."
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 14, outline: 'none', marginBottom: 20 }}
        />

        {/* Feed */}
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', padding: 40 }}>Loading fresh openings...</p>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔭</div>
            {jobs.length === 0
              ? 'New openings land here daily — check back tomorrow.'
              : 'Nothing matches that filter. Try another domain or clear the search.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visible.map(job => {
              const saved = savedUrls.has(job.job_url)
              return (
                <div key={job.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: 15.5 }}>{job.company}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#93BBFF', background: 'rgba(79,124,255,0.1)', padding: '3px 9px', borderRadius: 100 }}>
                          {DOMAIN_LABELS[job.domain] || job.domain}
                        </span>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)' }}>{postedAgo(job.published_at)}</span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 600, marginTop: 4 }}>{job.role}</div>
                      {(job.location || job.jd_summary) && (
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12.5, lineHeight: 1.55, marginTop: 4 }}>
                          {job.location && <span>📍 {job.location}{job.jd_summary ? ' · ' : ''}</span>}
                          {job.jd_summary}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                      <a href={job.job_url} target="_blank" rel="noopener noreferrer" style={{ padding: '9px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
                        View ↗
                      </a>
                      <button
                        onClick={() => !saved && handleSave(job)}
                        disabled={saved || saving === job.id}
                        style={{
                          padding: '9px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                          cursor: saved ? 'default' : 'pointer',
                          background: saved ? 'rgba(16,185,129,0.12)' : 'linear-gradient(135deg, #4F7CFF, #7B61FF)',
                          border: saved ? '1px solid rgba(16,185,129,0.4)' : 'none',
                          color: saved ? '#6ee7b7' : 'white',
                          opacity: saving === job.id ? 0.7 : 1,
                        }}
                      >
                        {saved ? '✓ On your board' : saving === job.id ? 'Saving...' : '+ Save to board'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
