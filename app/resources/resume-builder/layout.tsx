export const metadata = {
  title: 'Free Resume Builder for Students — LSE Format with ATS Score | Beyond Campus',
  description: 'Build a professional ATS-optimized resume for free. LSE format, live preview, real-time ATS score checker. Built for BBA, BCom, MBA students targeting business roles off-campus in India.',
  alternates: { canonical: 'https://www.beyond-campus.in/resources/resume-builder' },
  openGraph: {
    title: 'Free Resume Builder — LSE Format with ATS Scorer | Beyond Campus',
    description: 'Build your resume in the LSE format for free. Live preview, ATS score, domain-specific tips.',
    url: 'https://www.beyond-campus.in/resources/resume-builder',
  },
}

export default function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
