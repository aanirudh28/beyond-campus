import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JOB_DOMAINS, domainBySlug, getPublishedJobs } from '@/lib/jobsPublic'
import { PageShell, SiteNav, SiteFooter, HeroGlow } from '@/app/components/SiteChrome'
import { DomainChips, JobCard, JobsCta } from '../ui'

export const revalidate = 1800

export function generateStaticParams() {
  return JOB_DOMAINS.map(d => ({ domain: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>
}): Promise<Metadata> {
  const info = domainBySlug((await params).domain)
  if (!info) return {}
  const url = `https://www.beyond-campus.in/jobs/${info.slug}`
  return {
    title: `${info.title} — Updated Daily | Beyond Campus`,
    description: `${info.blurb} Hand-screened from official company career pages — entry-level and India-eligible only.`,
    alternates: { canonical: url },
    openGraph: { title: info.title, description: info.blurb, url },
  }
}

export default async function JobsDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const info = domainBySlug((await params).domain)
  if (!info) notFound()
  const jobs = await getPublishedJobs(info.domain)

  return (
    <PageShell>
      <SiteNav />
      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 40px' }}>
        <HeroGlow />
        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
          <div className="mono-label" style={{ marginBottom: 18 }}>
            CURATED DAILY · {jobs.length} OPEN {info.label.toUpperCase()} ROLES
          </div>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: -1.5,
              fontWeight: 400,
              marginBottom: 18,
            }}
          >
            {info.title}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.75, maxWidth: 640, marginBottom: 28 }}>
            {info.blurb} Every listing is verified from the company&apos;s official career page and
            screened by a human — no expired links, no fake &quot;fresher&quot; roles asking for 5 years of
            experience.
          </p>
          <DomainChips active={info.slug} />
        </div>
      </section>

      <section style={{ padding: '24px 24px 60px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {jobs.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>
              No open {info.label} roles right now — new ones are curated daily, so check back
              soon. Meanwhile, browse all open roles on the main jobs page.
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
