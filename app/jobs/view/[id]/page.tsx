import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { domainInfo, getPublishedJob, getPublishedJobs, timeAgo } from '@/lib/jobsPublic'
import { PageShell, SiteNav, SiteFooter, HeroGlow } from '@/app/components/SiteChrome'
import { JobCard, JobsCta } from '../../ui'

export const revalidate = 1800

export function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const job = await getPublishedJob((await params).id)
  if (!job) return { title: 'Job not found | Beyond Campus' }
  const info = domainInfo(job.domain)
  const url = `https://www.beyond-campus.in/jobs/view/${job.id}`
  const title = `${job.role} at ${job.company}${job.location ? `, ${job.location}` : ''} | Beyond Campus Jobs`
  const description =
    job.jd_summary ||
    `${job.role} opening at ${job.company}: entry-level ${info?.label || 'business'} role for freshers in India, verified from the official career page.`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  }
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const job = await getPublishedJob((await params).id)
  if (!job) notFound()

  const info = domainInfo(job.domain)
  const related = (await getPublishedJobs(job.domain, 6)).filter(j => j.id !== job.id).slice(0, 4)
  const datePosted = job.posted_at || job.published_at
  const validThrough = job.published_at
    ? new Date(new Date(job.published_at).getTime() + 45 * 86400000).toISOString()
    : undefined

  const isRemote = /remote/i.test(job.location || '')
  const jobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.role,
    description: `<p>${job.jd_summary || `${job.role} role at ${job.company}.`}</p><p>Entry-level ${info?.label || 'business'} role open to freshers and candidates with 0-2 years of experience in India. Apply directly on the company's official career page.</p>`,
    datePosted,
    ...(validThrough ? { validThrough } : {}),
    hiringOrganization: { '@type': 'Organization', name: job.company },
    ...(isRemote
      ? {
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: { '@type': 'Country', name: 'India' },
        }
      : {
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              ...(job.location ? { addressLocality: job.location } : {}),
              addressCountry: 'IN',
            },
          },
        }),
    directApply: false,
  }

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      <SiteNav links={[{ label: 'Jobs', href: '/jobs' }, { label: 'Guides', href: '/guides' }]} />
      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 32px' }}>
        <HeroGlow />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <nav style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            <Link href="/jobs" style={{ color: 'var(--blue-soft)' }}>
              Jobs
            </Link>
            {info ? (
              <>
                {' / '}
                <Link href={`/jobs/${info.slug}`} style={{ color: 'var(--blue-soft)' }}>
                  {info.label}
                </Link>
              </>
            ) : null}
          </nav>
          <div className="mono-label" style={{ marginBottom: 16 }}>
            {timeAgo(job.published_at).toUpperCase()} · VERIFIED FROM OFFICIAL CAREER PAGE
          </div>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(30px, 5vw, 48px)',
              lineHeight: 1.12,
              letterSpacing: -1,
              fontWeight: 400,
              marginBottom: 14,
            }}
          >
            {job.role}
          </h1>
          <p style={{ fontSize: 17, color: 'var(--blue-soft)', marginBottom: 24 }}>
            {job.company}
            {job.location ? <span style={{ color: 'var(--muted)' }}> · {job.location}</span> : null}
            {info ? <span style={{ color: 'var(--muted)' }}> · {info.label}</span> : null}
          </p>
          {job.jd_summary ? (
            <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.78)', lineHeight: 1.8, marginBottom: 28, maxWidth: 640 }}>
              {job.jd_summary}
            </p>
          ) : null}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ padding: '14px 30px', fontSize: 15 }}
            >
              <span>Apply on company site →</span>
            </a>
            <Link
              href="/signup"
              className="bc-card"
              style={{ padding: '14px 30px', fontSize: 15, borderRadius: 999, color: '#fff' }}
            >
              Save to Job Tracker (free)
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 24px 60px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="bc-card" style={{ padding: '28px 28px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              How to actually convert this application
            </h2>
            <ul style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
              <li>
                Don&apos;t just apply and pray. Find the hiring manager or a team member at{' '}
                {job.company} on LinkedIn and send a short, specific message the same day.
              </li>
              <li>
                Tailor the top third of your resume to the role title. Not sure it&apos;s strong?{' '}
                <Link href="/resources/resume-roast" style={{ color: 'var(--blue-soft)' }}>
                  Get a free AI resume roast
                </Link>{' '}
                first.
              </li>
              <li>
                Follow up after 5-7 days. Most freshers never do, and it&apos;s the cheapest edge you
                have. The{' '}
                <Link href="/job-tracker" style={{ color: 'var(--blue-soft)' }}>
                  free Job Tracker
                </Link>{' '}
                reminds you automatically.
              </li>
            </ul>
          </div>

          {related.length > 0 ? (
            <div style={{ marginTop: 40 }}>
              <h2 className="mono-label" style={{ marginBottom: 18 }}>
                MORE {info ? info.label.toUpperCase() : ''} ROLES
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {related.map(j => (
                  <JobCard key={j.id} job={j} />
                ))}
              </div>
            </div>
          ) : null}

          <JobsCta />
        </div>
      </section>
      <SiteFooter />
    </PageShell>
  )
}
