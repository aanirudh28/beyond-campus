import { FAQS } from './faqs'

export const metadata = {
  title: '₹299 Career Toolkit — Cold Email Templates, LinkedIn Scripts, Tracker Pro | Beyond Campus',
  description:
    'Everything for the off-campus hunt in one ₹299 pack: proven cold email templates, LinkedIn outreach scripts, resume guide, and Job Tracker Pro with unlimited AI.',
  alternates: { canonical: 'https://www.beyond-campus.in/resources/career-toolkit' },
  openGraph: {
    title: '₹299 Career Toolkit — Templates, Scripts & Tracker Pro | Beyond Campus',
    description:
      'Cold email templates, LinkedIn scripts, resume guide, and Job Tracker Pro — one ₹299 pack.',
    url: 'https://www.beyond-campus.in/resources/career-toolkit',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function CareerToolkitLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  )
}
