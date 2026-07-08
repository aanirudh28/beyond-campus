import type { Metadata } from 'next'
import Link from 'next/link'
import { VENDORS, companiesUsingVendor } from '@/lib/apti-vendors'
import { PageShell, SiteNav, SiteFooter, HeroGlow } from '@/app/components/SiteChrome'

export const revalidate = 3600

const SITE = 'https://www.beyond-campus.in'

export const metadata: Metadata = {
  title: 'Aptitude Test Vendors Decoded: AMCAT, eLitmus, SHL, Mettl, Aon | Apti',
  description:
    'The test platforms behind placement rounds, explained: AMCAT, eLitmus, SHL, Mercer Mettl and Aon cut-e. Format, scoring, negative marking and what to drill for each. Free adaptive practice.',
  alternates: { canonical: `${SITE}/aptitude/vendors` },
  openGraph: {
    title: 'Know Your Test Vendor — AMCAT, eLitmus, SHL, Mettl, Aon',
    description: 'The platform decides the pattern. Decode the test you are actually about to sit.',
    url: `${SITE}/aptitude/vendors`,
    siteName: 'Beyond Campus',
    type: 'website',
  },
}

export default function VendorsIndex() {
  return (
    <PageShell>
      <SiteNav cta={{ label: 'Start free →', href: '/login?next=/practice' }} />

      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 28px' }}>
        <HeroGlow />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <p className="mono-label" style={{ marginBottom: 14, fontSize: 11 }}>
            <Link href="/aptitude" style={{ color: 'var(--blue-soft)' }}>Aptitude</Link>
            {' '}· Test vendors
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: -0.8 }}>
            Know the test before it knows you
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
            The same company can feel like a different test depending on the platform behind it. AMCAT adapts
            and never lets you go back; eLitmus punishes wrong answers; Aon cut-e is over before you settle in.
            Decode the one you are actually about to sit.
          </p>
        </div>
      </section>

      <section style={{ padding: '0 24px 70px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gap: 14 }}>
          {VENDORS.map((v, i) => {
            const companies = companiesUsingVendor(v)
            return (
              <Link key={v.slug} href={`/aptitude/vendors/${v.slug}`} className="bc-card" data-reveal style={{ display: 'block', padding: '22px 24px', transitionDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>{v.name}</h2>
                  <span className="mono-label" style={{ fontSize: 10.5 }}>{v.maker}</span>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, margin: '8px 0 12px' }}>{v.tagline}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted-2)', padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)' }}>
                    {v.adaptive ? 'Adaptive' : 'Fixed'}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted-2)', padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)' }}>
                    Neg. marking: {v.negativeMarking}
                  </span>
                  {companies.length > 0 && (
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--blue-soft)', padding: '4px 10px', borderRadius: 100, background: 'rgba(79,124,255,0.08)' }}>
                      {companies.length} compan{companies.length === 1 ? 'y' : 'ies'} here
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <SiteFooter tagline="Free adaptive aptitude practice for Indian placement tests — every question, every explanation, forever." />
    </PageShell>
  )
}
