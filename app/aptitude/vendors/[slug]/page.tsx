import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { VENDORS, vendorBySlug, companiesUsingVendor } from '@/lib/apti-vendors'
import { getPublicTopics } from '@/lib/apti-public'
import { PageShell, SiteNav, SiteFooter, HeroGlow } from '@/app/components/SiteChrome'

// Public vendor decoder (doc 14 #29): the test platform explained and made
// practiceable. Highest fresher search intent of the whole SEO surface
// ("AMCAT syllabus", "eLitmus preparation", "SHL practice test").
export const revalidate = 3600

const SITE = 'https://www.beyond-campus.in'
const YEAR = new Date().getFullYear()

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const vendor = vendorBySlug(slug)
  if (!vendor) return { title: 'Test Vendor Prep | Beyond Campus' }
  return {
    title: `${vendor.name} Test Pattern ${YEAR}: Format, Sections & Free Practice | Apti`,
    description: `${vendor.name} (${vendor.maker}) decoded: ${vendor.formatLine} What to drill, the quirks that trip students, and free adaptive practice.`,
    alternates: { canonical: `${SITE}/aptitude/vendors/${vendor.slug}` },
    openGraph: {
      title: `${vendor.name} Test — Pattern & Prep`,
      description: `How the ${vendor.name} test actually works and the skills that move your score. Free practice, honest readiness number.`,
      url: `${SITE}/aptitude/vendors/${vendor.slug}`,
      siteName: 'Beyond Campus',
      type: 'website',
    },
  }
}

export default async function VendorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const vendor = vendorBySlug(slug)
  if (!vendor) notFound()

  const topics = await getPublicTopics()
  const topicOfSkill = new Map(topics.flatMap((t) => t.skills.map((s) => [s.slug, t] as const)))
  const skillName = new Map(topics.flatMap((t) => t.skills.map((s) => [s.slug, s.name] as const)))
  const drill = vendor.drillSkills.map((sSlug) => ({
    slug: sSlug,
    name: skillName.get(sSlug) ?? sSlug.replace(/-/g, ' '),
    topic: topicOfSkill.get(sSlug) ?? null,
  }))
  const companies = companiesUsingVendor(vendor)
  const others = VENDORS.filter((v) => v.slug !== vendor.slug)

  return (
    <PageShell>
      <SiteNav cta={{ label: 'Start free →', href: '/login?next=/practice' }} />

      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 28px' }}>
        <HeroGlow />
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <p className="mono-label" style={{ marginBottom: 14, fontSize: 11 }}>
            <Link href="/aptitude" style={{ color: 'var(--blue-soft)' }}>Aptitude</Link>
            {' '}· Test vendor
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: -0.8 }}>
            The {vendor.name} test, decoded
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15.5, lineHeight: 1.7, margin: '0 0 6px' }}>
            {vendor.tagline}
          </p>
          <p style={{ color: 'var(--muted-2)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            {vendor.formatLine} <span style={{ color: 'var(--muted)' }}>Built by {vendor.maker}.</span>
          </p>
        </div>
      </section>

      <section style={{ padding: '0 24px 32px' }}>
        <div data-reveal style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            ['Scoring', vendor.scoring],
            ['Adaptive', vendor.adaptive ? 'Yes — no going back' : 'No — you can review'],
            ['Negative marking', vendor.negativeMarking],
          ].map(([k, v]) => (
            <div key={k} className="bc-card" style={{ padding: '14px 16px' }}>
              <p className="mono-label" style={{ fontSize: 10.5, margin: '0 0 6px' }}>{k}</p>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 24px 36px' }}>
        <div data-reveal style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 16px', letterSpacing: -0.4 }}>
            How it actually works
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {vendor.quirks.map((q, i) => (
              <div key={i} className="bc-card" style={{ display: 'flex', gap: 14, padding: '14px 16px', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--blue-soft)', lineHeight: 1.5, minWidth: 18 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 14.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.8)' }}>{q}</span>
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--muted-2)', fontSize: 13, lineHeight: 1.6, margin: '12px 0 0' }}>
            Pattern marked estimated until verified by student reports. Faced the {vendor.name} test?{' '}
            <Link href="/practice" style={{ color: 'var(--blue-soft)' }}>Tell us what you saw.</Link>
          </p>
        </div>
      </section>

      <section style={{ padding: '0 24px 36px' }}>
        <div data-reveal style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 16px', letterSpacing: -0.4 }}>
            What to drill for {vendor.name}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {drill.map((d) => d.topic ? (
              <Link key={d.slug} href={`/aptitude/${d.topic.slug}`} className="bc-card" style={{ fontSize: 13.5, padding: '9px 16px', borderRadius: 100, color: 'rgba(255,255,255,0.85)' }}>
                {d.name}
              </Link>
            ) : (
              <span key={d.slug} style={{ fontSize: 13.5, padding: '9px 16px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}>
                {d.name}
              </span>
            ))}
          </div>
          <Link href="/login?next=/practice" className="btn-primary" style={{ marginTop: 18, padding: '14px 30px', fontSize: 15 }}>
            <span>Practice these at your level →</span>
          </Link>
        </div>
      </section>

      {companies.length > 0 && (
        <section style={{ padding: '0 24px 40px' }}>
          <div data-reveal style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 24, margin: '0 0 12px', letterSpacing: -0.4 }}>
              Companies that use {vendor.name}
            </h2>
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

      <section style={{ padding: '0 24px 70px' }}>
        <div data-reveal style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 22, margin: '0 0 12px', letterSpacing: -0.4 }}>Other test vendors</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {others.map((v) => (
              <Link key={v.slug} href={`/aptitude/vendors/${v.slug}`} className="bc-card" style={{ fontSize: 14, padding: '10px 18px', borderRadius: 100, color: 'rgba(255,255,255,0.8)' }}>
                {v.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter tagline="Free adaptive aptitude practice for Indian placement tests — every question, every explanation, forever." />
    </PageShell>
  )
}
