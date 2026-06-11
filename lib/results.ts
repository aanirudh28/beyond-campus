// The results wall — real placed students. Add a new entry + photo in
// public/results/ and it appears on /results automatically.
// Photos: square webp, processed from founder's student-results intake folder.

export interface StudentResult {
  slug: string
  name: string
  photo: string
  college?: string
  company: string
  companyLogo?: string   // path under /public — rendered as white monochrome
  logoH?: number         // render height for the logo, px
  role: string
  location?: string
  quote?: string   // only ever the student's own/approved words
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
    role: 'Junior Banker',
    location: 'Gurgaon',
    // quote pending Karnveer's approval — founder has the draft
    linkedin: 'https://www.linkedin.com/in/karnveer-bhalla/',
    domain: 'finance',
  },
]
