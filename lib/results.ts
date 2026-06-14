// The results wall — real placed students. Add a new entry + photo in
// public/results/ and it appears on /results automatically.
// Photos: square webp, processed from founder's student-results intake folder.

export interface StudentResult {
  slug: string
  name: string
  photo?: string   // omit to fall back to an initials avatar
  college?: string
  company: string
  companyLogo?: string   // path under /public — rendered as white monochrome
  logoH?: number         // render height for the logo, px
  role: string
  location?: string
  quote?: string   // only ever the student's own/approved words
  daysToOffer?: number
  badge?: string   // overrides the default 'PLACED' badge text, e.g. '2 OFFERS'
  linkedin?: string
  domain: 'consulting' | 'finance' | 'marketing' | 'bd' | 'operations' | 'other'
}

export const RESULTS: StudentResult[] = [
  {
    slug: 'ayushi',
    name: 'Ayushi',
    photo: '/results/ayushi.webp',
    college: 'Delhi University',
    company: 'Citi',
    companyLogo: '/logos/citi.svg',
    logoH: 22,
    role: 'Commercial Banking',
    quote: 'Thank you for your constant support in my job hunting journey. Really grateful.',
    domain: 'finance',
  },
  {
    slug: 'ayush',
    name: 'Ayush',
    photo: '/results/ayush.webp',
    company: 'Highspring',
    companyLogo: '/logos/highspring.png',
    logoH: 30,
    role: 'Associate Analyst',
    location: 'Gurgaon',
    quote: 'Anirudh and Sanya were super supportive in the entire process. They were prompt to respond. Thankful to them for being there during the entire journey.',
    domain: 'consulting',
  },
  {
    slug: 'karnveer',
    name: 'Karnveer Bhalla',
    photo: '/results/karnveer.webp',
    college: 'Christ University',
    company: 'Client Associates',
    companyLogo: '/logos/client-associates.png',
    logoH: 30,
    role: 'Junior Banker',
    location: 'Gurgaon',
    quote: 'Thanks. All because of your help.',
    daysToOffer: 12,
    linkedin: 'https://www.linkedin.com/in/karnveer-bhalla/',
    domain: 'finance',
  },
  {
    slug: 'susmita',
    name: 'Susmita B',
    photo: '/results/susmita.webp',
    college: 'St. Aloysius University',
    company: 'Gain.pro',
    companyLogo: '/logos/gainpro.png',
    logoH: 22,
    role: 'Analyst — PE Intelligence',
    location: 'Bangalore',
    quote: "Anirudh and Sanya both were very helpful, and I couldn't have asked for better support. From day 1, I got immense help — from my resume till the interview.",
    linkedin: 'https://www.linkedin.com/in/susmita-b-022439277/',
    domain: 'finance',
  },
  {
    slug: 'adya',
    name: 'Adya Pandey',
    photo: '/results/adya.webp',
    college: 'LSR, Delhi',
    company: 'EY & Times of India',
    companyLogo: '/logos/ey-timesofindia.png',
    logoH: 44,
    role: "Founder's Office",
    location: 'Delhi NCR',
    quote: "Giving so much advice and being kind and helpful to someone you don't even know at all is something I would have never expected outta that crazy app LinkedIn. But it has made me believe a lot in people, and how far they can lead someone with just their words. Thank you so much!",
    badge: '2 OFFERS',
    linkedin: 'https://www.linkedin.com/in/adya-pandey-662223300/',
    domain: 'other',
  },
  {
    slug: 'aagman',
    name: 'Aagman',
    photo: '/results/aagman.webp',
    company: 'Blinkit',
    companyLogo: '/logos/blinkit.png',
    logoH: 22,
    role: 'Category Team',
    quote: 'Again, thank you so much! I tailored my message just the way Anirudh told me and reached out to alumni for internal referrals.',
    domain: 'operations',
  },
  {
    slug: 'nida',
    name: 'Nida Tanweer',
    photo: '/results/nida.webp',
    college: 'LSR, Delhi',
    company: 'Macquarie Group',
    companyLogo: '/logos/macquarie.png',
    logoH: 38,
    role: 'Corporate Actions Team',
    location: 'Gurgaon',
    quote: "I'm really thankful to Sanya for guiding me throughout my off-campus job hunt. Her support and guidance helped me navigate the process with confidence and stay on track during a challenging journey.",
    linkedin: 'https://www.linkedin.com/in/nida-tanweer-617b2b269/',
    domain: 'finance',
  },
]
