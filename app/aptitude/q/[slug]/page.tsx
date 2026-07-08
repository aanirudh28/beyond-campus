import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSeoQuestionBySlug, DOMAIN_LABELS } from '@/lib/apti-public'
import PublicQuestion from '@/app/components/apti/PublicQuestion'

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
    <main style={{ minHeight: '100vh', background: '#0B0B0F', color: 'white', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap'); * { box-sizing: border-box; }`}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none', fontFamily: "'DM Serif Display', serif", fontSize: 21, color: 'white', letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </Link>
        <Link href="/login?next=/practice" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Log in →</Link>
      </nav>

      <section style={{ maxWidth: 680, margin: '0 auto', padding: '36px 24px 20px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#93BBFF', margin: '0 0 12px' }}>
          <Link href="/aptitude" style={{ color: '#93BBFF', textDecoration: 'none' }}>Aptitude</Link>
          {' '}·{' '}
          <Link href={`/aptitude/${q.topicSlug}`} style={{ color: '#93BBFF', textDecoration: 'none' }}>{q.topicName}</Link>
          {' '}· {DOMAIN_LABELS[q.domain] ?? q.domain}
        </p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(24px, 4vw, 34px)', lineHeight: 1.3, margin: '0 0 8px', letterSpacing: -0.5 }}>
          {stem}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>
          Try it first — the solution, the trap, and the shortcut reveal after you pick.
        </p>
      </section>

      <section style={{ maxWidth: 680, margin: '0 auto', padding: '16px 24px 48px' }}>
        <PublicQuestion q={q} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
          <Link href={`/aptitude/${q.topicSlug}`} style={{ fontSize: 14, padding: '10px 18px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
            More {q.topicName.toLowerCase()} →
          </Link>
          <Link href="/aptitude" style={{ fontSize: 14, padding: '10px 18px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
            What is Apti? →
          </Link>
        </div>
      </section>

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
