import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllGuides } from '@/lib/guides'
import { PageShell, SiteNav, SiteFooter, HeroGlow } from '@/app/components/SiteChrome'

export const metadata: Metadata = {
  title: 'Career Guides for Off-Campus Job Hunting in India | Beyond Campus',
  description:
    'In-depth, no-fluff guides for non-tech students hunting off-campus: cold emails that get replies, breaking into consulting without an IIM, Founder\'s Office roles, and the full internship playbook.',
  alternates: { canonical: 'https://www.beyond-campus.in/guides' },
  openGraph: {
    title: 'Career Guides for Off-Campus Job Hunting in India',
    description:
      'No-fluff guides: cold emails that get replies, consulting without an IIM, Founder\'s Office roles, the full off-campus playbook.',
    url: 'https://www.beyond-campus.in/guides',
  },
}

export default function GuidesPage() {
  const guides = getAllGuides()

  return (
    <PageShell>
      <SiteNav links={[{ label: 'Jobs', href: '/jobs' }, { label: 'Guides', href: '/guides' }]} />
      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 40px' }}>
        <HeroGlow />
        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
          <div className="mono-label" style={{ marginBottom: 18 }}>
            FIELD-TESTED · NO FLUFF
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
            Guides for the <em>off-campus</em> job hunt
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.75, maxWidth: 620 }}>
            Everything here is the actual playbook we run with students — the same systems behind
            offers at EY, Blinkit, Times of India and dozens of startups. No recycled LinkedIn
            advice.
          </p>
        </div>
      </section>

      <section style={{ padding: '24px 24px 60px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {guides.map(g => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="bc-card"
              style={{ display: 'block', padding: '26px 28px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
                <span className="mono-label" style={{ fontSize: 11 }}>{g.category}</span>
                <span className="mono-label" style={{ fontSize: 11 }}>{g.readMinutes} MIN READ</span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(20px, 3vw, 26px)',
                  fontWeight: 400,
                  lineHeight: 1.25,
                  color: '#fff',
                  margin: '0 0 10px',
                }}
              >
                {g.title}
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
                {g.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </PageShell>
  )
}
