export const metadata = {
  title: 'Beyond Campus Community: Job Hunt With People Who Get It',
  description:
    'Join the Beyond Campus community: accountability, curated openings, and peers from tier-2/3 colleges chasing the same off-campus consulting, finance and startup roles as you.',
  alternates: { canonical: 'https://www.beyond-campus.in/community' },
  openGraph: {
    title: 'Beyond Campus Community: Job Hunt With People Who Get It',
    description:
      'Accountability, curated openings, and peers chasing the same off-campus roles as you.',
    url: 'https://www.beyond-campus.in/community',
  },
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
