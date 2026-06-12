import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import { getAllGuides, getGuide } from '@/lib/guides'
import { PageShell, SiteNav, SiteFooter, HeroGlow } from '@/app/components/SiteChrome'

export function generateStaticParams() {
  return getAllGuides().map(g => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const guide = getGuide((await params).slug)
  if (!guide) return {}
  const url = `https://www.beyond-campus.in/guides/${guide.slug}`
  return {
    title: `${guide.seoTitle} | Beyond Campus`,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      title: guide.seoTitle,
      description: guide.description,
      url,
      type: 'article',
    },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug)
  if (!guide) notFound()

  const html = await marked.parse(guide.md)
  const others = getAllGuides().filter(g => g.slug !== guide.slug).slice(0, 3)
  const url = `https://www.beyond-campus.in/guides/${guide.slug}`

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.datePublished,
    dateModified: guide.dateModified,
    mainEntityOfPage: url,
    image: 'https://www.beyond-campus.in/opengraph-image',
    author: {
      '@type': 'Person',
      name: 'Anirudh Agarwal',
      url: 'https://www.beyond-campus.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Beyond Campus',
      url: 'https://www.beyond-campus.in',
      logo: { '@type': 'ImageObject', url: 'https://www.beyond-campus.in/icon.svg' },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Guides', item: 'https://www.beyond-campus.in/guides' },
      { '@type': 'ListItem', position: 2, name: guide.title, item: url },
    ],
  }

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteNav links={[{ label: 'Jobs', href: '/jobs' }, { label: 'Guides', href: '/guides' }]} />
      <article style={{ position: 'relative' }}>
        <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 24px' }}>
          <HeroGlow />
          <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
            <nav style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 22 }}>
              <Link href="/guides" style={{ color: 'var(--blue-soft)' }}>
                Guides
              </Link>
              {' / '}
              {guide.category.toLowerCase()}
            </nav>
            <div className="mono-label" style={{ marginBottom: 16 }}>
              {guide.category} · {guide.readMinutes} MIN READ
            </div>
            <h1
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(30px, 5vw, 46px)',
                lineHeight: 1.14,
                letterSpacing: -1,
                fontWeight: 400,
                marginBottom: 16,
              }}
            >
              {guide.title}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              By Anirudh Agarwal · Updated{' '}
              {new Date(guide.dateModified + 'T00:00:00Z').toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })}
            </p>
          </div>
        </section>

        <section style={{ padding: '8px 24px 60px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div className="guide-prose" dangerouslySetInnerHTML={{ __html: html }} />

            <div className="bc-card" style={{ padding: '30px 30px', marginTop: 48, textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, marginBottom: 10 }}>
                Stop reading. <em>Start applying.</em>
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--muted)', maxWidth: 480, margin: '0 auto 22px', lineHeight: 1.7 }}>
                Browse today&apos;s curated, verified openings (every role is entry-level and
                India-eligible) and track every application free.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/jobs" className="btn-primary" style={{ padding: '12px 26px', fontSize: 14 }}>
                  <span>See today&apos;s openings →</span>
                </Link>
                <Link
                  href="/resources/resume-roast"
                  className="bc-card"
                  style={{ padding: '12px 26px', fontSize: 14, borderRadius: 999, color: '#fff' }}
                >
                  Free resume roast 🔥
                </Link>
              </div>
            </div>

            {others.length > 0 ? (
              <div style={{ marginTop: 48 }}>
                <h2 className="mono-label" style={{ marginBottom: 18 }}>
                  KEEP READING
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {others.map(g => (
                    <Link key={g.slug} href={`/guides/${g.slug}`} className="bc-card" style={{ display: 'block', padding: '20px 24px' }}>
                      <span className="mono-label" style={{ fontSize: 10.5, display: 'block', marginBottom: 8 }}>
                        {g.category}
                      </span>
                      <span style={{ fontSize: 16.5, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{g.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </article>
      <SiteFooter />
    </PageShell>
  )
}
