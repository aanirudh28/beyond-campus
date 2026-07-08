import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSeoQuestionBySlug, DOMAIN_LABELS } from '@/lib/apti-public'
import PublicQuestion from '@/app/components/apti/PublicQuestion'
import { PageShell, SiteNav, SiteFooter, HeroGlow } from '@/app/components/SiteChrome'
import { AptiStyles } from '@/app/components/apti/ui'

// One public page per founder-curated question (doc 11 §4): the LeetCode-
// discuss long-tail play. Full layered explanation is public by design.
export const revalidate = 3600

const SITE = 'https://www.beyond-campus.in'
const strip = (s: string) => s.replace(/\*\*/g, '')

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const q = await getSeoQuestionBySlug(slug)
  if (!q) return { title: 'Aptitude Question | Beyond Campus' }
  const stem = strip(q.stemMd).replace(/\s+/g, ' ').trim()
  return {
    title: `${stem.slice(0, 60)}${stem.length > 60 ? '…' : ''} | Aptitude Solved`,
    description: `${q.skillName} aptitude question solved step by step — with the trap most students hit and the shortcut method. Free adaptive practice on Apti.`,
    alternates: { canonical: `${SITE}/aptitude/q/${q.seoSlug}` },
    openGraph: {
      title: `Solved: ${stem.slice(0, 80)}`,
      description: `Step-by-step solution, common trap, and shortcut for this ${q.skillName.toLowerCase()} question.`,
      url: `${SITE}/aptitude/q/${q.seoSlug}`,
      siteName: 'Beyond Campus',
      type: 'article',
    },
  }
}

export default async function QuestionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const q = await getSeoQuestionBySlug(slug)
  if (!q) notFound()

  const stem = strip(q.stemMd).replace(/\s+/g, ' ').trim()
  const answerText = q.answerKeys && q.answerKeys.length > 0
    ? q.options.find((o) => q.answerKeys!.includes(o.key))?.text ?? q.answerKeys.join(', ')
    : String(q.answerValue ?? '')

  // Quiz schema: legitimate here — a real question with a real accepted answer
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    about: { '@type': 'Thing', name: `${q.skillName} aptitude` },
    hasPart: [{
      '@type': 'Question',
      eduQuestionType: 'Multiple choice',
      text: stem,
      acceptedAnswer: { '@type': 'Answer', text: answerText },
      suggestedAnswer: q.options
        .filter((o) => !(q.answerKeys ?? []).includes(o.key))
        .map((o) => ({ '@type': 'Answer', text: o.text })),
    }],
  }

  return (
    <PageShell>
      <AptiStyles />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav cta={{ label: 'Start free →', href: '/login?next=/practice' }} />

      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 20px' }}>
        <HeroGlow />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <p className="mono-label" style={{ marginBottom: 14, fontSize: 11 }}>
            <Link href="/aptitude" style={{ color: 'var(--blue-soft)' }}>Aptitude</Link>
            {' '}·{' '}
            <Link href={`/aptitude/${q.topicSlug}`} style={{ color: 'var(--blue-soft)' }}>{q.topicName}</Link>
            {' '}· {DOMAIN_LABELS[q.domain] ?? q.domain}
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px, 4vw, 34px)', lineHeight: 1.3, margin: '0 0 10px', letterSpacing: -0.5 }}>
            {stem}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
            Try it first — the solution, the trap, and the shortcut reveal after you pick.
          </p>
        </div>
      </section>

      <section style={{ padding: '8px 24px 60px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <PublicQuestion q={q} />
          <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
            <Link href={`/aptitude/${q.topicSlug}`} className="bc-card" style={{ fontSize: 14, padding: '10px 18px', borderRadius: 100, color: 'rgba(255,255,255,0.8)' }}>
              More {q.topicName.toLowerCase()} →
            </Link>
            <Link href="/aptitude" className="bc-card" style={{ fontSize: 14, padding: '10px 18px', borderRadius: 100, color: 'rgba(255,255,255,0.8)' }}>
              What is Apti? →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter tagline="Free adaptive aptitude practice for Indian placement tests — every question, every explanation, forever." />
    </PageShell>
  )
}
