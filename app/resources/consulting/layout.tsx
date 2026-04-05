export const metadata = {
  title: 'Free Consulting Casebooks — IIM, ISB, BITSoM Download | Beyond Campus',
  description: 'Download free consulting casebooks from IIM-A, IIM-B, IIM-C, IIM-L, ISB, BITSoM. Plus SRCC Guestimates book. Free PDF downloads, no sign-up required.',
  alternates: { canonical: 'https://www.beyond-campus.in/resources/consulting' },
  openGraph: {
    title: 'Free Consulting Casebooks — IIM, ISB, BITSoM | Beyond Campus',
    description: 'Free PDF downloads of IIM-A, IIM-B, IIM-C, IIM-L, ISB casebooks and SRCC Guestimates. No sign-up.',
    url: 'https://www.beyond-campus.in/resources/consulting',
  },
}

export default function ConsultingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
