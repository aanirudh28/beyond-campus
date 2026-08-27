import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPANIES, type CompanyPattern } from '@/lib/apti-companies'
import { vendorForCompany } from '@/lib/apti-vendors'
import { PageShell, SiteNav, SiteFooter, HeroGlow } from '@/app/components/SiteChrome'

// Index for the company prep cluster (doc 11). The per-company pages carry the
// commercial intent; this page exists so they are reachable in one click from
// /aptitude instead of only via topic and vendor pages.
export const revalidate = 3600

const SITE = 'https://www.beyond-campus.in'
const YEAR = new Date().getFullYear()

const TIERS: { key: CompanyPattern['tier']; label: string; blurb: string }[] = [
  { key: 'big4', label: 'Big 4 & professional services', blurb: 'Volume hiring, sectional cutoffs, and a quant round that rewards speed on percentages and ratios.' },
  { key: 'consulting', label: 'Consulting', blurb: 'Cognitive batteries plus business judgement, where structure counts as much as arithmetic.' },
  { key: 'banking', label: 'Banking & finance', blurb: 'Interest, ratios and data interpretation under a tight clock, usually on a vendor platform.' },
  { key: 'fmcg', label: 'FMCG & sales', blurb: 'Weighted averages, margins and gamified rounds. Commercial maths in disguise.' },
  { key: 'newage', label: 'New-age & startups', blurb: 'Estimation, unit economics and take-home cases rather than a timed multiple-choice paper.' },
]

export const metadata: Metadata = {
  title: `Company Aptitude Test Patterns ${YEAR}: Deloitte, EY, ICICI, HUL & More | Apti`,
  description:
    `The aptitude round at ${COMPANIES.length} companies hiring freshers, decoded: sections, timing, negative marking, reported cutoffs and the exact skills to drill for each. Free adaptive practice and a live readiness score.`,
  alternates: { canonical: `${SITE}/aptitude/companies` },
  openGraph: {
    title: 'Company Aptitude Test Patterns, Decoded',
    description: 'What the test actually looks like at Deloitte, EY, KPMG, PwC, Accenture, ICICI, HDFC, Axis, HUL and more, and what to drill first.',
    url: `${SITE}/aptitude/companies`,
    siteName: 'Beyond Campus',
    type: 'website',
  },
}

export default function CompaniesIndex() {
  return (
    <PageShell>
      <SiteNav cta={{ label: 'Start free →', href: '/login?next=/practice' }} />

      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 28px' }}>
        <HeroGlow />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <p className="mono-label" style={{ marginBottom: 14, fontSize: 11 }}>
            <Link href="/aptitude" style={{ color: 'var(--blue-soft)' }}>Aptitude</Link>
            {' '}· Company patterns
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: -0.8 }}>
            The test you are actually sitting for
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15.5, lineHeight: 1.7, margin: '0 0 12px' }}>
            Every company runs its aptitude round differently: different sections, different clock, different
            things it quietly cares about. Practising aptitude in general is how students lose the first gate.
            Pick the company you are targeting and drill what it actually tests.
          </p>
          <p style={{ color: 'var(--muted-2)', fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>
            Patterns are compiled from student reports and public hiring material, and stay labelled
            <em> estimated</em> until 25+ reports confirm them. If you have sat one of these, tell us what changed.
          </p>
        </div>
      </section>

      {TIERS.map((tier) => {
        const list = COMPANIES.filter((c) => c.tier === tier.key)
        if (list.length === 0) return null
        return (
          <section key={tier.key} style={{ padding: '0 24px 48px' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <h2 data-reveal style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(21px, 3.4vw, 27px)', margin: '0 0 6px', letterSpacing: -0.4 }}>
                {tier.label}
              </h2>
              <p data-reveal style={{ color: 'var(--muted-2)', fontSize: 13.5, lineHeight: 1.65, margin: '0 0 18px' }}>
                {tier.blurb}
              </p>
              <div style={{ display: 'grid', gap: 14 }}>
                {list.map((c, i) => {
                  const vendor = vendorForCompany(c)
                  return (
                    <Link key={c.slug} href={`/aptitude/companies/${c.slug}`} className="bc-card" data-reveal style={{ display: 'block', padding: '22px 24px', transitionDelay: `${i * 0.05}s` }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>{c.name}</h3>
                        <span className="mono-label" style={{ fontSize: 10.5 }}>{c.season}</span>
                      </div>
                      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, margin: '8px 0 12px' }}>{c.sectionsLine}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted-2)', padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)' }}>
                          {vendor ? vendor.name : c.vendor}
                        </span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted-2)', padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)' }}>
                          {c.negativeMarking ? 'Negative marking' : 'No negative marking'}
                        </span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--blue-soft)', padding: '4px 10px', borderRadius: 100, background: 'rgba(79,124,255,0.08)' }}>
                          {Object.keys(c.skillWeights).length} skills mapped
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}

      <section style={{ padding: '0 24px 70px' }}>
        <div data-reveal className="bc-card" style={{
          maxWidth: 760, margin: '0 auto', padding: '30px 26px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(79,124,255,0.1), rgba(123,97,255,0.1))',
          borderColor: 'rgba(79,124,255,0.3)',
        }}>
          <p style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(18px, 3vw, 23px)', lineHeight: 1.5, margin: '0 0 12px' }}>
            Pick your target, get a readiness number
          </p>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.7, margin: '0 0 18px' }}>
            Apti scores you against the pattern above, not against a generic question bank, so you can see which
            skills are actually costing you the cutoff. Free, with every explanation.
          </p>
          <Link href="/login?next=/practice" className="btn-primary" style={{ padding: '14px 32px', fontSize: 15.5 }}>
            <span>Start free practice →</span>
          </Link>
        </div>
      </section>

      <section style={{ padding: '0 24px 70px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted-2)', fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>
            AMCAT, eLitmus, SHL, Mettl and TCS iON each change what the same test feels like.{' '}
            <Link href="/aptitude/vendors" style={{ color: 'var(--blue-soft)' }}>Decode your test vendor →</Link>
          </p>
        </div>
      </section>

      <SiteFooter tagline="Free adaptive aptitude practice for Indian placement tests — every question, every explanation, forever." />
    </PageShell>
  )
}
