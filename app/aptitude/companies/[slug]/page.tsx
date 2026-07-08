import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { COMPANIES } from '@/lib/apti-companies'
import { getPublicTopics } from '@/lib/apti-public'

// Public company prep page (doc 08/11): the test pattern, what to drill and
// in what order, honesty labels on unverified patterns. Highest commercial
// intent of the SEO surface ("deloitte aptitude test pattern 2026").
export const revalidate = 3600

const SITE = 'https://www.beyond-campus.in'
const YEAR = new Date().getFullYear()

const TIER_LABELS: Record<string, string> = {
  big4: 'Big 4 & professional services',
  consulting: 'Consulting',
  banking: 'Banking & finance',
  fmcg: 'FMCG & sales',
  newage: 'New-age & startups',
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const company = COMPANIES.find((c) => c.slug === slug)
  if (!company) return { title: 'Company Aptitude Prep | Beyond Campus' }
  return {
    title: `${company.name} Aptitude Test Pattern ${YEAR}: Syllabus, Cutoffs & Practice | Apti`,
    description: `${company.name} aptitude round explained: ${company.sectionsLine}. Vendor: ${company.vendor}. The exact skills to drill, with free adaptive practice and a live readiness score.`,
    alternates: { canonical: `${SITE}/aptitude/companies/${company.slug}` },
    openGraph: {
      title: `${company.name} Aptitude Test — Pattern & Prep`,
      description: `What the ${company.name} test actually looks like and the skills that move your score. Free practice, honest readiness number.`,
      url: `${SITE}/aptitude/companies/${company.slug}`,
      siteName: 'Beyond Campus',
      type: 'website',
    },
  }
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const company = COMPANIES.find((c) => c.slug === slug)
  if (!company) notFound()

  const topics = await getPublicTopics()
  const skillName = new Map(topics.flatMap((t) => t.skills.map((s) => [s.slug, s.name] as const)))
  const topicOfSkill = new Map(topics.flatMap((t) => t.skills.map((s) => [s.slug, t] as const)))

  const weighted = Object.entries(company.skillWeights)
    .sort((a, b) => b[1] - a[1])
    .map(([wSlug, weight]) => ({
      slug: wSlug,
      weight,
      name: skillName.get(wSlug) ?? wSlug.replace(/-/g, ' '),
      topic: topicOfSkill.get(wSlug) ?? null,
    }))
  const relatedTopics = [...new Map(weighted.flatMap((w) => (w.topic ? [[w.topic.slug, w.topic] as const] : []))).values()].slice(0, 8)
  const peers = COMPANIES.filter((c) => c.tier === company.tier && c.slug !== company.slug).slice(0, 6)

  const drillGroups = [
    { title: 'Heavily tested — start here', color: '#F87171', items: weighted.filter((w) => w.weight >= 3) },
    { title: 'Regular', color: '#FBBF24', items: weighted.filter((w) => w.weight === 2) },
    { title: 'Appears', color: '#93BBFF', items: weighted.filter((w) => w.weight === 1) },
  ].filter((g) => g.items.length > 0)

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', color: 'white', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap'); * { box-sizing: border-box; }`}</style>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none', fontFamily: "'DM Serif Display', serif", fontSize: 21, color: 'white', letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </Link>
        <Link href="/login?next=/practice" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Log in →</Link>
      </nav>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 28px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#93BBFF', margin: '0 0 12px' }}>
          <Link href="/aptitude" style={{ color: '#93BBFF', textDecoration: 'none' }}>Aptitude</Link>
          {' '}· {TIER_LABELS[company.tier] ?? company.tier}
        </p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: -0.8 }}>
          The {company.name} aptitude round, decoded
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
          {company.sectionsLine}. Test vendor: <strong style={{ color: 'white' }}>{company.vendor}</strong>.
          {' '}{company.negativeMarking ? 'Negative marking applies — accuracy beats attempts.' : 'No negative marking reported — attempt everything.'}
        </p>
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            ['Season', company.season],
            ['Cutoff intel', company.cutoffNote],
            ['Pattern confidence', company.confidence === 'estimated' ? 'Estimated — verified as student reports come in' : company.confidence],
          ].map(([k, v]) => (
            <div key={k} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 6px' }}>{k}</p>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 36px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, margin: '0 0 16px', letterSpacing: -0.4 }}>
          What to drill, in order
        </h2>
        {drillGroups.map((g) => (
          <div key={g.title} style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: g.color, margin: '0 0 10px' }}>{g.title}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.items.map((w) => w.topic ? (
                <Link key={w.slug} href={`/aptitude/${w.topic.slug}`} style={{ fontSize: 13.5, padding: '8px 15px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: `1px solid ${g.color}40`, color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                  {w.name}
                </Link>
              ) : (
                <span key={w.slug} style={{ fontSize: 13.5, padding: '8px 15px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: `1px solid ${g.color}40`, color: 'rgba(255,255,255,0.85)' }}>
                  {w.name}
                </span>
              ))}
            </div>
          </div>
        ))}
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, margin: '4px 0 0' }}>
          Tap any skill to see sample questions and traps. Inside the app, your{' '}
          <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{company.name} readiness score</strong> weights
          exactly these skills against your live ratings.
        </p>
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 44px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(123,97,255,0.08))', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 20, padding: '26px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 21, lineHeight: 1.4, margin: '0 0 14px' }}>
            &ldquo;Am I ready for {company.name}?&rdquo; — get one honest number, updated with every question you solve.
          </p>
          <Link href="/login?next=/practice/companies" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Get my {company.name} readiness score →
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12.5, margin: '12px 0 0' }}>Free forever · 8-question diagnostic · no credit card</p>
        </div>
      </section>

      {(relatedTopics.length > 0 || peers.length > 0) && (
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 60px' }}>
          {relatedTopics.length > 0 && (
            <>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, margin: '0 0 12px', letterSpacing: -0.4 }}>Topics behind this test</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
                {relatedTopics.map((t) => (
                  <Link key={t.slug} href={`/aptitude/${t.slug}`} style={{ fontSize: 14, padding: '10px 18px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
                    {t.name}
                  </Link>
                ))}
              </div>
            </>
          )}
          {peers.length > 0 && (
            <>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, margin: '0 0 12px', letterSpacing: -0.4 }}>Also preparing for</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {peers.map((c) => (
                  <Link key={c.slug} href={`/aptitude/companies/${c.slug}`} style={{ fontSize: 14, fontWeight: 600, padding: '10px 18px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                    {c.name} →
                  </Link>
                ))}
              </div>
            </>
          )}
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
