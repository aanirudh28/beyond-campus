import type { Metadata } from 'next'
import { getPublishedJobs } from '@/lib/jobsPublic'
import { PageShell, SiteNav, SiteFooter, HeroGlow } from '@/app/components/SiteChrome'
import { DomainChips, JobCard, JobsCta } from './ui'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Curated Fresher Jobs & Internships in India — Non-Tech Roles | Beyond Campus',
  description:
    'Hand-screened jobs and internships for freshers in consulting, finance, marketing, BD, operations and Founder\'s Office. Every role is entry-level, India-eligible, and verified from official company career pages. Updated daily.',
  alternates: { canonical: 'https://www.beyond-campus.in/jobs' },
  openGraph: {
    title: 'Curated Fresher Jobs & Internships in India — Non-Tech Roles',
    description:
      'Hand-screened, entry-level, India-eligible roles in consulting, finance, marketing, BD, ops and Founder\'s Office. Updated daily.',
    url: 'https://www.beyond-campus.in/jobs',
  },
}

export default async function JobsPage() {
  const jobs = await getPublishedJobs()

  return (
    <PageShell>
      <SiteNav />
      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 40px' }}>
        <HeroGlow />
        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
          <div className="mono-label" style={{ marginBottom: 18 }}>
            CURATED DAILY · {jobs.length} OPEN ROLES
          </div>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(34px, 5.5vw, 58px)',
              lineHeight: 1.08,
              letterSpacing: -1.5,
              fontWeight: 400,
              marginBottom: 18,
            }}
          >
            Fresher jobs & internships in India — <em>without the spam</em>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.75, maxWidth: 640, marginBottom: 28 }}>
            Every opening below is pulled from official company career pages, screened for 0–2 year
            non-tech business roles, and approved by a human. Consulting, finance, marketing, BD,
            operations and Founder&apos;s Office — no expired links, no &quot;5+ years experience&quot; bait.
          </p>
          <DomainChips />
        </div>
      </section>

      <section style={{ padding: '24px 24px 60px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {jobs.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>
              New roles are being curated right now — check back tomorrow, or join the tracker to
              get them in your Monday digest.
            </p>
          ) : (
            jobs.map(job => <JobCard key={job.id} job={job} />)
          )}
          <JobsCta />
        </div>
      </section>
      <SiteFooter />
    </PageShell>
  )
}
