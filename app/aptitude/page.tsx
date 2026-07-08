import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicTopics, DOMAIN_LABELS } from '@/lib/apti-public'
import { PageShell, SiteNav, SiteFooter, HeroGlow } from '@/app/components/SiteChrome'

// refreshed hourly so newly seeded topics appear without a redeploy
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Free Aptitude Practice for Placements | Apti by Beyond Campus',
  description:
    'Adaptive aptitude preparation for placement tests — quant, logical, verbal and DI. A daily 10-question set at your level, an honest rating that moves every session, company readiness scores and timed mocks. Free forever, built for Indian students.',
  keywords: [
    'aptitude questions for placements',
    'free aptitude practice',
    'aptitude test preparation online',
    'deloitte aptitude test',
    'SHL practice test',
    'aptitude test for BBA students',
    'placement aptitude preparation',
    'quantitative aptitude practice',
    'logical reasoning practice free',
  ],
  alternates: { canonical: 'https://www.beyond-campus.in/aptitude' },
  openGraph: {
    title: 'Apti — Free Aptitude Practice for Placements',
    description:
      'Stop grinding random question banks. 10 adaptive questions a day, a rating that tells the truth, and a readiness score for every company you\'re targeting. Free forever.',
    url: 'https://www.beyond-campus.in/aptitude',
    siteName: 'Beyond Campus',
    type: 'website',
  },
}

const FEATURES = [
  {
    emoji: '🎯',
    title: '10 questions a day, at your level',
    desc: 'Every set is built for you: questions you should be getting ~75% right, two you got wrong before, and one stretch. Twelve focused minutes beats a panicked weekend before the test.',
  },
  {
    emoji: '📈',
    title: 'A rating that tells the truth',
    desc: 'Your Apti Rating works like chess Elo — every answer moves it, up or down. No fake progress bars. When it crosses a company\'s benchmark, you\'re actually ready, not just done with a syllabus.',
  },
  {
    emoji: '↺',
    title: 'The Redemption Queue',
    desc: 'Every question that beats you comes back — in 1 day, then 3, then 7, then 21. Beat it twice and it\'s redeemed. This is spaced repetition doing the remembering so you don\'t have to.',
  },
  {
    emoji: '🗺',
    title: 'An honest mastery map',
    desc: 'Sixty skills, each coloured by what you\'ve actually earned — Learning, Familiar, Proficient, Mastered. Skills go Rusty if you neglect them. The map reshapes around the companies you\'re targeting.',
  },
  {
    emoji: '⏱',
    title: 'Mocks that start at 15 minutes',
    desc: 'Nobody likes mocks, so yours starts small: a 15-minute checkpoint, not a 60-minute exam. Every mock ends in a fix plan — what went wrong, why, and exactly what to drill.',
  },
  {
    emoji: '🏢',
    title: '"Am I ready for Deloitte?"',
    desc: 'One honest number per target company, weighted by what their test actually emphasises. Watch it climb week by week — and know the three things that move it fastest.',
  },
  {
    emoji: '🧠',
    title: 'Analytics that coach you',
    desc: 'Most students think they have a maths problem. The data usually says otherwise: misreads, traps, time pressure. We tag every error and show you why you miss — then fix that, specifically.',
  },
]

const FAQS = [
  {
    q: 'Is it really free?',
    a: 'Yes — every question, every explanation, every mock, every analytics view, the mastery map, readiness scores. Free forever, no exceptions. The only metered thing is the AI Tutor (ask it to re-explain a question or find the flaw in your reasoning) — 5 chats a month free, unlimited with the ₹299 one-time Resource Pack.',
  },
  {
    q: 'How is this different from IndiaBix or random PDF question banks?',
    a: 'Those give you 10,000 questions and no idea which ones matter. Apti is adaptive: it finds your level in 8 questions, serves practice at the edge of your ability, brings back your mistakes on a schedule, and turns it all into one honest rating. It\'s the difference between a gym with a trainer and a warehouse full of weights.',
  },
  {
    q: 'Who is this built for?',
    a: 'Indian students preparing for placement and off-campus aptitude tests — especially BBA, BCom and other non-tech students targeting consulting, finance, marketing and business roles, where the aptitude round is the first gate at companies like Deloitte, EY, ICICI and HUL.',
  },
  {
    q: 'What does it cover?',
    a: 'Quantitative aptitude (percentages, ratios, profit & loss, and the rest), logical reasoning (series, coding-decoding, arrangements), verbal ability and data interpretation — the standard fresher test syllabus, including vendor styles like SHL and AMCAT.',
  },
  {
    q: 'How do I start?',
    a: 'Sign in with Google or LinkedIn, answer 8 diagnostic questions, and you\'ll have your starting rating and your first focus area in under two minutes. Day one starts immediately after.',
  },
]

const PREVIEW_OPTIONS = [
  { key: 'A', text: '5% profit', state: 'correct' },
  { key: 'B', text: '15% profit', state: 'chosen' },
  { key: 'C', text: '5% loss', state: '' },
  { key: 'D', text: 'No profit, no loss', state: '' },
]

export default async function AptitudeLanding() {
  // fail-soft: builds without DB env render the page with the browser hidden
  const topics = await getPublicTopics()
  const byDomain = new Map<string, typeof topics>()
  for (const t of topics) {
    const list = byDomain.get(t.domain) ?? []
    list.push(t)
    byDomain.set(t.domain, list)
  }

  return (
    <PageShell>
      <style>{`
        details > summary { list-style: none; cursor: pointer; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] .faq-arrow { transform: rotate(180deg); }
      `}</style>
      <SiteNav cta={{ label: 'Start free →', href: '/login?next=/practice' }} />

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '150px 24px 40px' }}>
        <HeroGlow />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <span data-reveal style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '6px 16px', borderRadius: 100, background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.35)', color: '#93BBFF', marginBottom: 22 }}>
            Free forever · Adaptive · Built for placement tests
          </span>
          <h1 data-reveal style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(34px, 6vw, 58px)', lineHeight: 1.12, margin: '0 0 18px', letterSpacing: -1 }}>
            The aptitude round shouldn&apos;t be the thing that stops you.
          </h1>
          <p data-reveal style={{ color: 'var(--muted)', fontSize: 'clamp(15px, 2.3vw, 18px)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 30px' }}>
            Ten adaptive questions a day. A rating that moves like chess Elo. Your mistakes,
            brought back until you beat them. And an honest readiness score for every company
            on your list.
          </p>
          <div data-reveal>
            <Link href="/login?next=/practice" className="btn-primary" style={{ padding: '16px 36px', fontSize: 16 }}>
              <span>Start free — find your level in 8 questions →</span>
            </Link>
            <p style={{ color: 'var(--muted-2)', fontSize: 12.5, marginTop: 16 }}>
              Sign in with Google or LinkedIn · 12 minutes a day · No credit card, ever
            </p>
          </div>
        </div>
      </section>

      {/* Product preview: solving surface + rating strip */}
      <section style={{ padding: '0 24px 64px' }}>
        <div data-reveal style={{ maxWidth: 1000, margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* question card */}
          <div className="bc-card" style={{ padding: '18px 18px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="mono-label" style={{ fontSize: 10.5 }}>Percentages · Q3 of 10</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--muted)' }}>0:41</span>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', margin: '0 0 14px' }}>
              A shopkeeper marks up 40% and offers a 25% discount. His overall profit is:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PREVIEW_OPTIONS.map(o => (
                <div key={o.key} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, fontSize: 13,
                  background: o.state === 'correct' ? 'rgba(52,211,153,0.1)' : o.state === 'chosen' ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${o.state === 'correct' ? 'rgba(52,211,153,0.4)' : o.state === 'chosen' ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  color: o.state === 'correct' ? '#34D399' : o.state === 'chosen' ? '#F87171' : 'rgba(255,255,255,0.7)',
                }}>
                  <span style={{ fontWeight: 700 }}>{o.key}</span> {o.text}
                  {o.state === 'correct' && <span style={{ marginLeft: 'auto' }}>✓</span>}
                  {o.state === 'chosen' && <span style={{ marginLeft: 'auto' }}>you</span>}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'rgba(251,191,36,0.9)', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '9px 12px', margin: '12px 0 0' }}>
              The trap: you did 40 − 25. Percentages on different bases never subtract — 1.4 × 0.75 = 1.05.
            </p>
          </div>
          {/* rating / readiness card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="bc-card" style={{ padding: '18px 18px 16px', flex: 1 }}>
              <span className="mono-label" style={{ fontSize: 10.5 }}>Apti Rating</span>
              <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                {[['Quant', '1287', '▲ 12'], ['Logical', '1194', '▲ 8'], ['Verbal', '1226', '▲ 3']].map(([d, r, w]) => (
                  <div key={d}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 600, display: 'block' }}>{r}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>{d}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 12, color: '#34D399', marginTop: 2 }}>{w}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted-2)', margin: '12px 0 0', lineHeight: 1.5 }}>Moves every session. Up or down. That&apos;s the point.</p>
            </div>
            <div className="bc-card" style={{ padding: '18px 18px 16px', flex: 1 }}>
              <span className="mono-label" style={{ fontSize: 10.5 }}>Readiness</span>
              {[['Deloitte', 62], ['ICICI Bank', 71], ['HUL', 48]].map(([name, score]) => (
                <div key={name as string} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                  <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)', width: 88 }}>{name}</span>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${score}%`, background: 'linear-gradient(90deg, #4F7CFF, #7B61FF)', borderRadius: 100 }} />
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}>{score}</span>
                </div>
              ))}
              <p style={{ fontSize: 12, color: 'var(--muted-2)', margin: '12px 0 0', lineHeight: 1.5 }}>One honest number per target company.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 24px 70px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(26px, 4vw, 38px)', textAlign: 'center', margin: '0 0 40px', letterSpacing: -0.5 }}>
            Practice that actually knows you
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 18 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="bc-card" data-reveal style={{ padding: '26px 24px', transitionDelay: `${i * 0.05}s` }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.emoji}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by topic — the doorway into the SEO hub pages */}
      {topics.length > 0 && (
        <section style={{ padding: '0 24px 70px' }}>
          <div data-reveal style={{ maxWidth: 1000, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px, 4vw, 34px)', textAlign: 'center', margin: '0 0 28px', letterSpacing: -0.5 }}>
              Browse by topic
            </h2>
            {[...byDomain.entries()].map(([domain, list]) => (
              <div key={domain} style={{ marginBottom: 22 }}>
                <p className="mono-label" style={{ fontSize: 11, margin: '0 0 10px' }}>
                  {DOMAIN_LABELS[domain] ?? domain}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {list.map(t => (
                    <Link key={t.slug} href={`/aptitude/${t.slug}`} className="bc-card" style={{ fontSize: 14, padding: '10px 18px', borderRadius: 100, color: 'rgba(255,255,255,0.8)' }}>
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pitch */}
      <section style={{ padding: '0 24px 70px', textAlign: 'center' }}>
        <div data-reveal className="bc-card" style={{
          maxWidth: 720, margin: '0 auto', padding: '36px 28px',
          background: 'linear-gradient(135deg, rgba(79,124,255,0.1), rgba(123,97,255,0.1))',
          borderColor: 'rgba(79,124,255,0.3)',
        }}>
          <p style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(19px, 3vw, 24px)', lineHeight: 1.5, margin: '0 0 10px' }}>
            &ldquo;Most students don&apos;t fail aptitude tests because they&apos;re bad at maths.
            They fail because they practised randomly and never found out <em>why</em> they miss.&rdquo;
          </p>
          <p style={{ color: 'var(--muted-2)', fontSize: 13.5, margin: 0 }}>
            — the idea Apti is built on
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '0 24px 70px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px, 4vw, 32px)', textAlign: 'center', margin: '0 0 28px', letterSpacing: -0.5 }}>
            Questions, answered
          </h2>
          <div data-reveal style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map(faq => (
              <details key={faq.q} className="bc-card" style={{ padding: '18px 22px' }}>
                <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 700 }}>
                  {faq.q}
                  <span className="faq-arrow" style={{ color: 'var(--muted-2)', fontSize: 11, transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
                </summary>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.75, margin: '12px 0 0' }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '0 24px 90px', textAlign: 'center' }}>
        <div data-reveal style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(26px, 4.5vw, 40px)', margin: '0 0 14px', letterSpacing: -0.5 }}>
            Your first test is closer than it feels.
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 15.5, margin: '0 0 28px' }}>
            Eight questions from now, you&apos;ll know your level, your gaps, and exactly where to start.
          </p>
          <Link href="/login?next=/practice" className="btn-primary" style={{ padding: '16px 38px', fontSize: 16 }}>
            <span>Find my level →</span>
          </Link>
          <p style={{ color: 'var(--muted-2)', fontSize: 13.5, marginTop: 18 }}>
            Applying off-campus too?{' '}
            <Link href="/job-tracker" style={{ color: 'var(--blue-soft)' }}>
              Track every application with the free Job Tracker →
            </Link>
          </p>
        </div>
      </section>

      <SiteFooter tagline="Free adaptive aptitude practice for Indian placement tests — every question, every explanation, forever." />
    </PageShell>
  )
}
