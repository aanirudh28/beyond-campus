import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '20 Years in 60 Minutes — live your career before it happens | Beyond Campus',
  description:
    'A career life-simulator for Indian students. Start as a final-year BBA/BCom student, make 35 choices, live to 45, and meet one of 32 endings. Free, no signup, brutally honest.',
  openGraph: {
    title: '20 Years in 60 Minutes',
    description:
      'Live the next 20 years of your career in 20 minutes. 35 choices. 32 endings. Which one are you headed for?',
    type: 'website',
  },
}

export default function TwentyYearsLayout({ children }: { children: ReactNode }) {
  return children
}
