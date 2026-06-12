export const metadata = {
  title: 'Student Results — Real Off-Campus Offers | Beyond Campus',
  description:
    'Real students, real offers: EY, Times of India, Blinkit, Gain.pro and more — landed off-campus by non-tech students from tier-2 and tier-3 colleges using Beyond Campus.',
  alternates: { canonical: 'https://www.beyond-campus.in/results' },
  openGraph: {
    title: 'Student Results — Real Off-Campus Offers | Beyond Campus',
    description:
      'Real students, real offers: EY, Times of India, Blinkit, Gain.pro and more — landed off-campus without campus placements.',
    url: 'https://www.beyond-campus.in/results',
  },
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
