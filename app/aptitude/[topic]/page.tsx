import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicTopics, getSeoQuestionsForTopic, DOMAIN_LABELS } from '@/lib/apti-public'
import { COMPANIES } from '@/lib/apti-companies'
import PublicQuestion from '@/app/components/apti/PublicQuestion'

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
    <main style={{ minHeight: '100vh', background: '#0B0B0F', color: 'white', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap'); * { box-sizing: border-box; }`}</style>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none', fontFamily: "'DM Serif Display', serif", fontSize: 21, color: 'white', letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </Link>
        <Link href="/login?next=/practice" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Log in →</Link>
      </nav>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 24px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#93BBFF', margin: '0 0 12px' }}>
          <Link href="/aptitude" style={{ color: '#93BBFF', textDecoration: 'none' }}>Aptitude</Link>
          {' '}· {DOMAIN_LABELS[topic.domain] ?? topic.domain}
        </p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: -0.8 }}>
          {topic.name}: questions, shortcuts, and the traps that cost marks
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
          Everything below is real content from Apti&apos;s question bank — try the samples, read the
          layered solutions, then let the adaptive engine meet you at your level.
        </p>
      </section>

      {/* skills in this topic */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '8px 24px 28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {topic.skills.map((s) => (
            <span key={s.slug} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.25)', color: 'rgba(255,255,255,0.8)' }}>
              {s.name}
            </span>
          ))}
        </div>
      </section>

      {/* sample questions */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 40px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, margin: '0 0 16px', letterSpacing: -0.4 }}>
          Try {samples.length > 0 ? samples.length : 'the'} real question{samples.length === 1 ? '' : 's'} — free, no signup
        </h2>
        {samples.length > 0 ? (
          samples.map((q) => <PublicQuestion key={q.seoSlug} q={q} />)
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14.5, lineHeight: 1.7 }}>
            Sample questions for this topic are being curated — inside the app, adaptive {topic.name.toLowerCase()} practice is already live.
          </p>
        )}
        <Link href="/login?next=/practice" style={{ display: 'inline-block', marginTop: 8, padding: '14px 30px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
          Practice {topic.name.toLowerCase()} at your level →
        </Link>
      </section>

      {/* which companies test this */}
      {companies.length > 0 && (
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 40px' }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: '0 0 6px', letterSpacing: -0.4 }}>
            Companies that test {topic.name.toLowerCase()}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13.5, margin: '0 0 14px' }}>Patterns marked estimated until verified by student reports.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {companies.map((c) => (
              <Link key={c.slug} href={`/aptitude/companies/${c.slug}`} style={{ fontSize: 14, fontWeight: 600, padding: '10px 18px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                {c.name} →
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* sibling topics */}
      {siblings.length > 0 && (
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 60px' }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: '0 0 14px', letterSpacing: -0.4 }}>
            More {DOMAIN_LABELS[topic.domain]?.toLowerCase() ?? topic.domain}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {siblings.map((t) => (
              <Link key={t.slug} href={`/aptitude/${t.slug}`} style={{ fontSize: 14, padding: '10px 18px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
                {t.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>
          <Link href="/aptitude" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Apti</Link>
          {' '}· free adaptive aptitude practice ·{' '}
          <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Beyond Campus</Link>
        </p>
      </footer>
    </main>
  )
}
