import type { Metadata } from 'next'
import Link from 'next/link'
import Tool from './Tool'

const URL = 'https://www.beyond-campus.in/read-receipts'

export const metadata: Metadata = {
  title: 'Free Email Tracker for Gmail: Know When Your Email Is Opened | Beyond Campus',
  description:
    'A free email tracker for Gmail. See the exact moment someone opens your email and how many times, with no Chrome extension and no credit card. Works on personal Gmail, and the recipient never has to approve. Built for cold emails and job applications.',
  keywords: [
    'free email tracker',
    'free email tracker gmail',
    'email tracker for gmail',
    'email read receipts',
    'free email read receipts',
    'know when your email is opened',
    'gmail read receipts',
    'read receipt gmail',
    'how to know if someone read your email',
    'email tracker without extension',
    'free mailtrack alternative',
    'email tracking for cold emails',
    'did they open my email',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Free Email Tracker for Gmail: Know When Your Email Is Opened',
    description:
      'See the moment someone opens your email and how many times. Free, no extension, works on personal Gmail.',
    url: URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Email Tracker for Gmail: Know When Your Email Is Opened',
    description: 'See the moment someone opens your email and how many times. Free, no extension needed.',
  },
}

const STEPS: [string, string][] = [
  ['Write your email', 'Type your email in the composer above, just like you would in Gmail.'],
  ['Copy and paste into Gmail', 'One click copies it with an invisible tracker attached. Paste into a Gmail compose window and send as normal.'],
  ['See every open', 'The moment the recipient opens it, your dashboard shows the time, and how many times they came back to it.'],
]

const FEATURES: [string, string][] = [
  ['Real-time open alerts', 'Know the exact moment your email is read, not days later.'],
  ['Open counts', 'See how many times someone reopened your email, a strong sign of real interest.'],
  ['Works with your Gmail', 'Send from your own address. Nothing changes for the person receiving it.'],
  ['No extension to install', 'No Chrome add-on, no permissions to grant. Just copy and paste.'],
  ['Invisible to the recipient', 'The tracker is a tiny hidden image. The reader sees a normal email.'],
  ['Unlimited and free', 'Track as many emails as you want. No credit card, no limits.'],
]

const FAQ: [string, string][] = [
  ['How do I know if someone has read my email?', 'Write your email in the composer, copy it, and paste it into Gmail before sending. A tiny invisible image is attached. When the recipient opens your email, that image loads and we record the open, so your dashboard shows exactly when it was read.'],
  ['Is this email read receipt tool really free?', 'Yes. You can track unlimited emails for free. No credit card, no trial that expires.'],
  ['Do I need to install a Chrome extension?', 'No. Unlike most email trackers, there is nothing to install. You compose here, copy the email, and paste it into Gmail. That is the whole setup.'],
  ['Does it work with Gmail?', 'Yes, it is built for Gmail. Compose your email here, copy it, and paste it into a normal Gmail compose window, then send.'],
  ['Can I see how many times my email was opened?', 'Yes. Your dashboard shows both when the email was first opened and how many times it has been reopened, which tells you how much attention it is getting.'],
  ['Can the recipient tell the email is being tracked?', 'No. The tracker is a single invisible pixel inside the email. The person receiving it just sees a normal message.'],
  ['Can I use this for cold emails and job applications?', 'That is exactly what it is built for. Knowing when a recruiter or hiring manager opens your cold email tells you when your message is landing, and the perfect time to follow up.'],
]

export default function ReadReceiptsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Beyond Campus Read Receipts',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: URL,
        description: 'Free email read receipt tracker. Know when your email is opened and how many times, straight from Gmail. No extension required.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  }

  const label = { fontSize: 13, fontWeight: 700, color: '#93BBFF', letterSpacing: 1, textTransform: 'uppercase' as const }

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif", padding: '32px 20px 90px' }}>
      <style>{`*,*::before,*::after{box-sizing:border-box} a{text-decoration:none} input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.3)}`}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ maxWidth: 620, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Link href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20 }}>Beyond<span style={{ color: '#4F7CFF' }}>Campus</span></Link>

        {/* SEO hero (server-rendered, crawlable) */}
        <header>
          <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#93BBFF', textTransform: 'uppercase', marginBottom: 14 }}>Free · No extension</div>
          <h1 style={{ fontSize: 'clamp(30px,6vw,46px)', fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.08, marginBottom: 12 }}>Free email tracker for Gmail: know when your email is opened</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
            See the exact moment someone opens your email, and how many times they come back to it. No Chrome extension, no credit card, and it works on a personal Gmail account, so the recipient never has to approve anything. Built for cold emails and job applications.
          </p>
        </header>

        {/* The tool */}
        <Tool />

        {/* How it works */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>How it works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
            {STEPS.map(([t, d], i) => (
              <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{t}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 14 }}>Why students use it</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
            {FEATURES.map(([t, d]) => (
              <div key={t} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4, color: '#93BBFF' }}>{t}</div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 14 }}>Frequently asked questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ.map(([q, a]) => (
              <details key={q} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 18px' }}>
                <summary style={{ fontWeight: 700, fontSize: 15, cursor: 'pointer', listStyle: 'none' }}>{q}</summary>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '10px 0 0' }}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related guide (internal SEO) */}
        <section>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
            New to this? Read the full guide:{' '}
            <Link href="/guides/how-to-know-if-someone-read-your-email" style={{ color: '#93BBFF', fontWeight: 600 }}>How to know if someone read your email in Gmail →</Link>
          </p>
        </section>

        {/* Cross-links (internal SEO) */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 22 }}>
          <div style={{ ...label, marginBottom: 12 }}>More free tools for your job hunt</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              ['/job-tracker', '🎯 Job Tracker'],
              ['/resources/cold-email-pack', '✉️ Cold Email Pack'],
              ['/aptitude', '🧮 Aptitude Practice'],
              ['/resources/resume-roast', '🔥 Resume Roast'],
            ].map(([href, text]) => (
              <Link key={href} href={href} style={{ padding: '8px 16px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>{text}</Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
