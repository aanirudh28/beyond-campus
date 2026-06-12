import Link from 'next/link'
import { JOB_DOMAINS, domainInfo, timeAgo, type PublicJob } from '@/lib/jobsPublic'

/* Server-rendered building blocks for the public /jobs SEO pages. */

export function DomainChips({ active }: { active?: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      <Link
        href="/jobs"
        className="bc-card"
        style={{
          padding: '8px 18px',
          borderRadius: 999,
          fontSize: 13.5,
          color: !active ? '#fff' : 'var(--muted)',
          borderColor: !active ? 'var(--blue)' : undefined,
        }}
      >
        All roles
      </Link>
      {JOB_DOMAINS.map(d => (
        <Link
          key={d.slug}
          href={`/jobs/${d.slug}`}
          className="bc-card"
          style={{
            padding: '8px 18px',
            borderRadius: 999,
            fontSize: 13.5,
            color: active === d.slug ? '#fff' : 'var(--muted)',
            borderColor: active === d.slug ? 'var(--blue)' : undefined,
          }}
        >
          {d.label}
        </Link>
      ))}
    </div>
  )
}

export function JobCard({ job }: { job: PublicJob }) {
  const info = domainInfo(job.domain)
  return (
    <Link
      href={`/jobs/view/${job.id}`}
      className="bc-card"
      style={{ display: 'block', padding: '22px 24px' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'baseline',
          flexWrap: 'wrap',
        }}
      >
        <h3 style={{ fontSize: 17.5, fontWeight: 600, color: '#fff', margin: 0 }}>{job.role}</h3>
        <span className="mono-label" style={{ fontSize: 11 }}>
          {timeAgo(job.published_at)}
        </span>
      </div>
      <div style={{ marginTop: 6, fontSize: 14.5, color: 'var(--blue-soft)' }}>
        {job.company}
        {job.location ? <span style={{ color: 'var(--muted)' }}> · {job.location}</span> : null}
        {info ? <span style={{ color: 'var(--muted)' }}> · {info.label}</span> : null}
      </div>
      {job.jd_summary ? (
        <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, color: 'var(--muted)' }}>
          {job.jd_summary}
        </p>
      ) : null}
    </Link>
  )
}

/** Bottom-of-page conversion block: jobs traffic → tracker signups / roast. */
export function JobsCta() {
  return (
    <section
      className="bc-card"
      style={{ padding: '36px 32px', textAlign: 'center', marginTop: 56 }}
    >
      <h2
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(24px, 3.5vw, 34px)',
          fontWeight: 400,
          marginBottom: 12,
        }}
      >
        Applying is step one. <em>Tracking</em> is how you convert.
      </h2>
      <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 560, margin: '0 auto 24px', lineHeight: 1.7 }}>
        Use the free Beyond Campus Job Tracker to organise every application, get AI-written
        outreach, and never miss a follow-up. New curated openings land in the tracker first.
      </p>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="/signup" className="btn-primary" style={{ padding: '13px 28px', fontSize: 14.5 }}>
          <span>Track your applications free →</span>
        </a>
        <a
          href="/resources/resume-roast"
          className="bc-card"
          style={{ padding: '13px 28px', fontSize: 14.5, borderRadius: 999, color: '#fff' }}
        >
          Get a free resume roast 🔥
        </a>
      </div>
    </section>
  )
}
