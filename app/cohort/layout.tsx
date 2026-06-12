export const metadata = {
  title: 'Placement & Internship Cohorts for Non-Tech Students | Beyond Campus',
  description:
    'Live cohorts that get BBA, BCom and non-tech students off-campus offers in consulting, finance, marketing and Founder\'s Office roles. Internship Cohort ₹1,750 · Placement Cohort ₹2,500.',
  alternates: { canonical: 'https://www.beyond-campus.in/cohort' },
  openGraph: {
    title: 'Placement & Internship Cohorts for Non-Tech Students | Beyond Campus',
    description:
      'Live cohorts that get non-tech students off-campus offers in consulting, finance, marketing and Founder\'s Office roles.',
    url: 'https://www.beyond-campus.in/cohort',
  },
}

export default function CohortLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
