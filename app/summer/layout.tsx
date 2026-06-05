export const metadata = {
  title: 'Internship Program — Beyond Campus',
  description: "A 4-week live program for non-tech students to land their first internship in consulting, finance, Founder's Office, marketing, and BD. ₹1,750.",
  alternates: { canonical: 'https://www.beyond-campus.in/summer' },
  openGraph: {
    title: 'Internship Program — Beyond Campus',
    description: '4 weeks. Live sessions. ₹1,750. Built for non-tech students targeting consulting, finance, and startup roles.',
    url: 'https://www.beyond-campus.in/summer',
  },
}

export default function SummerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
