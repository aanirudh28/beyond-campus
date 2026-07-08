import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicTopics, getSeoQuestionsForTopic, DOMAIN_LABELS } from '@/lib/apti-public'
import { COMPANIES } from '@/lib/apti-companies'
import PublicQuestion from '@/app/components/apti/PublicQuestion'
import { PageShell, SiteNav, SiteFooter, HeroGlow } from '@/app/components/SiteChrome'
import { AptiStyles } from '@/app/components/apti/ui'

// Public topic hub (doc 11 §1): what it is, the skills inside, real sample
// questions with layered explanations, and which companies test it.
// ISR: rendered on demand, refreshed hourly as the founder curates questions.
export const revalidate = 3600

const SITE = 'https://www.beyond-campus.in'

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic: slug } = await params
  const topic = (await getPublicTopics()).find((t) => t.slug === slug)
  if (!topic) return { title: 'Aptitude Practice | Beyond Campus' }
  return {
    title: `${topic.name} Aptitude Questions, Shortcuts & Traps | Apti by Beyond Campus`,
    description: `Free ${topic.name.toLowerCase()} practice for placement tests: solved sample questions, the traps most students hit, shortcut methods, and adaptive daily practice. Built for Indian students.`,
    alternates: { canonical: `${SITE}/aptitude/${topic.slug}` },
    openGraph: {
      title: `${topic.name} — Aptitude Practice`,
      description: `Sample questions with full explanations, common traps, and shortcuts for ${topic.name.toLowerCase()}. Free forever.`,
      url: `${SITE}/aptitude/${topic.slug}`,
      siteName: 'Beyond Campus',
      type: 'website',
    },
  }
}

export default async function TopicHub({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: slug } = await params
  const topics = await getPublicTopics()
  const topic = topics.find((t) => t.slug === slug)
  if (!topic) notFound()

  const samples = await getSeoQuestionsForTopic(topic.slug, 3)
  const skillSlugs = new Set(topic.skills.map((s) => s.slug))
  const companies = COMPANIES.filter((c) =>
    Object.keys(c.skillWeights).some((w) => skillSlugs.has(w))
  ).slice(0, 8)
  const siblings = topics.filter((t) => t.domain === topic.domain && t.slug !== topic.slug).slice(0, 6)

  return (
    <PageShell>
      <AptiStyles />
      <SiteNav cta={{ label: 'Start free →', href: '/login?next=/practice' }} />

      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 24px' }}>
        <HeroGlow />
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <p className="mono-label" style={{ marginBottom: 14, fontSize: 11 }}>
            <Link href="/aptitude" style={{ color: 'var(--blue-soft)' }}>Aptitude</Link>
            {' '}· {DOMAIN_LABELS[topic.domain] ?? topic.domain}
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: -0.8 }}>
            {topic.name}: questions, shortcuts, and the traps that cost marks
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15.5, lineHeight: 1.7, margin: '0 0 20px' }}>
            Everything below is real content from Apti&apos;s question bank — try the samples, read the
            layered solutions, then let the adaptive engine meet you at your level.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {topic.skills.map((s) => (
              <span key={s.slug} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.25)', color: 'rgba(255,255,255,0.8)' }}>
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* sample questions */}
      <section style={{ padding: '0 24px 44px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 16px', letterSpacing: -0.4 }}>
            Try {samples.length > 0 ? samples.length : 'the'} real question{samples.length === 1 ? '' : 's'} — free, no signup
          </h2>
          {samples.length > 0 ? (
            samples.map((q) => <PublicQuestion key={q.seoSlug} q={q} />)
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.7 }}>
              Sample questions for this topic are being curated — inside the app, adaptive {topic.name.toLowerCase()} practice is already live.
            </p>
          )}
          <Link href="/login?next=/practice" className="btn-primary" style={{ marginTop: 8, padding: '14px 30px', fontSize: 15 }}>
            <span>Practice {topic.name.toLowerCase()} at your level →</span>
          </Link>
        </div>
      </section>

      {/* which companies test this */}
      {companies.length > 0 && (
        <section style={{ padding: '0 24px 44px' }}>
          <div data-reveal style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 24, margin: '0 0 6px', letterSpacing: -0.4 }}>
              Companies that test {topic.name.toLowerCase()}
            </h2>
            <p style={{ color: 'var(--muted-2)', fontSize: 13.5, margin: '0 0 14px' }}>Patterns marked estimated until verified by student reports.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {companies.map((c) => (
                <Link key={c.slug} href={`/aptitude/companies/${c.slug}`} className="bc-card" style={{ fontSize: 14, fontWeight: 600, padding: '10px 18px', borderRadius: 100, color: 'rgba(255,255,255,0.9)' }}>
                  {c.name} →
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* sibling topics */}
      {siblings.length > 0 && (
        <section style={{ padding: '0 24px 70px' }}>
          <div data-reveal style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 24, margin: '0 0 14px', letterSpacing: -0.4 }}>
              More {DOMAIN_LABELS[topic.domain]?.toLowerCase() ?? topic.domain}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {siblings.map((t) => (
                <Link key={t.slug} href={`/aptitude/${t.slug}`} className="bc-card" style={{ fontSize: 14, padding: '10px 18px', borderRadius: 100, color: 'rgba(255,255,255,0.8)' }}>
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter tagline="Free adaptive aptitude practice for Indian placement tests — every question, every explanation, forever." />
    </PageShell>
  )
}
