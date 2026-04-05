'use client'

import { useState, useEffect } from 'react'
import UnlockPopup from '../../components/UnlockPopup'

type Template = {
  id: number
  category: string
  subject?: string
  body: string
  isSubjectLine?: boolean
}

const TEMPLATES: Template[] = [
  // ── HR & Talent Acquisition ──────────────────────────────────────────────
  {
    id: 1, category: 'HR & Talent Acquisition',
    subject: 'Summer Internship — [Name] | [Domain] | [College]',
    body: `Hi [Name],\n\nI'm [Your Name], a [Year] student at [College] looking for a summer internship in [Domain].\n\nI've been following [Company] closely — particularly [specific thing: their recent campaign / product / expansion / hire] — and I think my background in [relevant skill] could contribute meaningfully to your team.\n\nResume attached. Would you have 10 minutes this week?\n\n[Your Name]\n[LinkedIn] · [Phone]`,
  },
  {
    id: 2, category: 'HR & Talent Acquisition',
    subject: '[Role] Internship Interest — [Name] | [College] | Summer 2025',
    body: `Hi [Name],\n\nI came across [Company] while researching [domain] opportunities for this summer and your team immediately stood out.\n\nI'm a [Year] [Degree] student at [College] with hands-on experience in [specific skill — financial modeling / content strategy / market research]. I'm particularly drawn to [Company] because of [one specific genuine reason].\n\nI'd love to explore whether there's an internship opening this summer. Resume attached — happy to share more if useful.\n\n[Your Name]\n[LinkedIn] · [Phone]`,
  },
  {
    id: 3, category: 'HR & Talent Acquisition',
    subject: 'Quick question about internships at [Company]',
    body: `Hi [Name],\n\nI've spent the last few weeks researching [industry] companies for my summer internship search — and [Company] keeps coming up for all the right reasons.\n\nI'm [Your Name], studying [Degree] at [College]. My interest in [Company] specifically comes from [one very specific reason — a product feature, a news article, a campaign they ran].\n\nAre there internship openings this summer, or is there someone else I should reach out to?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 4, category: 'HR & Talent Acquisition',
    subject: '[Name] | [Degree] | [College] — Internship Interest',
    body: `Hi [Name],\n\nA few things about me that might be relevant:\n— [Specific achievement: Led a team of X / Managed a budget of X / Grew X by Y%]\n— [Relevant skill or project]\n— Currently looking for a summer internship in [Domain]\n\nI've been targeting [Company] specifically because [one specific reason].\n\nResume attached. Worth a conversation?\n\n[Your Name]\n[LinkedIn] · [Phone]`,
  },
  {
    id: 5, category: 'HR & Talent Acquisition',
    subject: '[Mutual Name] suggested I reach out — [Domain] Internship',
    body: `Hi [Name],\n\n[Mutual connection] suggested I get in touch with you regarding internship opportunities at [Company].\n\nI'm [Your Name], a [Year] [Degree] student at [College] with a strong interest in [Domain]. [One line about relevant experience or skill].\n\nWould you be open to a quick 10-minute call this week?\n\n[Your Name]\n[LinkedIn] · [Phone]`,
  },
  {
    id: 6, category: 'HR & Talent Acquisition',
    subject: 'Your talk on [topic] — and a quick ask',
    body: `Hi [Name],\n\nI came across your [LinkedIn post / interview / talk] on [topic] last week — your point about [specific thing they said] stuck with me.\n\nI'm [Your Name], a [Year] student at [College] exploring summer internship opportunities in [Domain]. [Company] has been on my shortlist and your perspective on [topic] made me even more interested.\n\nIs there an internship opening, or could you point me in the right direction?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 7, category: 'HR & Talent Acquisition',
    subject: "[Company]'s [recent milestone] caught my attention",
    body: `Hi [Name],\n\nI read about [Company]'s [funding round / product launch / expansion / award] last month — congratulations to the team.\n\nI'm [Your Name], studying [Degree] at [College], and I'm actively looking for a summer internship at a company that's in growth mode. [Company] fits that description exactly.\n\nI'd love to contribute to the momentum. Is there space for an intern this summer?\n\n[Your Name]\n[LinkedIn] · [Phone]`,
  },
  {
    id: 8, category: 'HR & Talent Acquisition',
    subject: "Noticed something about [Company]'s [area] — and I'd love to help",
    body: `Hi [Name],\n\nI've been following [Company] for a while. One thing I noticed: [specific, genuine observation about something they could improve — their social presence, a gap in their content, a market they haven't entered].\n\nI'm [Your Name], a [Year] [Degree] student at [College] with experience in [relevant area]. I'd love to work on something like this as part of a summer internship.\n\nWorth a conversation?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 9, category: 'HR & Talent Acquisition',
    subject: 'Internship — [Name] | [College]',
    body: `Hi [Name],\n\n[Your Name], [Year] year [Degree] at [College].\n\nLooking for a summer internship in [Domain]. Interested in [Company] specifically because [one line].\n\nResume attached. 10 minutes this week?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 10, category: 'HR & Talent Acquisition',
    subject: "Summer Internship — Even if there's no formal opening",
    body: `Hi [Name],\n\nI understand [Company] may not have a formal internship program — but I wanted to reach out anyway.\n\nI'm [Your Name], a [Year] [Degree] student at [College] with strong interest in [Domain]. I'm willing to work on a project basis, part-time, or in whatever capacity makes sense for your team.\n\nIf there's any way to contribute this summer, I'd love to explore it.\n\n[Your Name]\n[LinkedIn] · [Phone]`,
  },

  // ── Founders & Leadership ────────────────────────────────────────────────
  {
    id: 11, category: 'Founders & Leadership',
    subject: 'Building something special at [Company] — [Name] here',
    body: `Hi [Founder Name],\n\nI've been following [Company] since [specific milestone — launch, funding, product]. What you're building in [space] is genuinely exciting — especially [one specific thing].\n\nI'm [Your Name], a [Year] [Degree] student looking for a summer internship where I can do real work at a company that's actually moving. I'm not looking for a big brand name — I'm looking for impact.\n\nIf there's room for someone like me on the team this summer, I'd love to talk.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 12, category: 'Founders & Leadership',
    subject: 'I want to help build [Company] this summer',
    body: `Hi [Name],\n\n[Company] has been on my list since I came across [specific thing — article, product, LinkedIn post].\n\nI'm [Your Name], studying [Degree] at [College]. I work fast, I don't need hand-holding, and I genuinely care about the problem [Company] is solving.\n\nI'm looking for a summer internship — even if it's not a formal role. What does your team need most right now?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 13, category: 'Founders & Leadership',
    subject: "A thought on [Company]'s [area] — and a quick ask",
    body: `Hi [Name],\n\nI've been thinking about [Company]'s approach to [specific area — pricing, distribution, target market, content] and had an observation: [specific, genuine insight — 2-3 sentences max].\n\nI'm sharing this because I'm genuinely interested in the space — and I'm also looking for a summer internship at a company where I can think like this every day.\n\nAny chance we could chat for 15 minutes?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 14, category: 'Founders & Leadership',
    subject: "Your mission at [Company] — this is why I'm reaching out",
    body: `Hi [Name],\n\n[Company]'s mission to [their stated mission] is something I care about personally — [one sentence on why it connects to you].\n\nI'm [Your Name], a [Year] student at [College] exploring summer internships. I want to spend this summer at a company whose work I believe in — not just one with a recognizable name.\n\n[Company] is at the top of my list. Is there space for an intern this summer?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 15, category: 'Founders & Leadership',
    subject: 'Summer intern — [Name] | [College]',
    body: `Hi [Name],\n\n[Your Name], [Year] [Degree] at [College].\n\nI want to intern at [Company] this summer. I've done [one relevant thing]. I'm available from [date] to [date].\n\nIs there an opening, or is there someone else I should speak to?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 16, category: 'Founders & Leadership',
    subject: 'What I could work on at [Company] this summer',
    body: `Hi [Name],\n\nI've been thinking about this: if I were interning at [Company] this summer, here's what I'd want to work on — [specific project idea relevant to their business: a market they could enter, a campaign they could run, a process they could improve].\n\nI'm [Your Name], a [Year] [Degree] student at [College]. I'd love to actually do this work — not just pitch it.\n\nWorth a conversation?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 17, category: 'Founders & Leadership',
    subject: 'Willing to work for equity/stipend — [Name] | [College]',
    body: `Hi [Name],\n\nI know early-stage companies don't always have intern budgets. I'm open to a small stipend or even equity credit if the work is meaningful and the learning is real.\n\nI'm [Your Name], a [Year] [Degree] student at [College] with [one relevant skill or project]. I've been following [Company] for [X months] and I'm genuinely excited about what you're building.\n\nIf you have a problem I could work on this summer, I'd love to hear it.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 18, category: 'Founders & Leadership',
    subject: 'Following up on our LinkedIn connection — [Name]',
    body: `Hi [Name],\n\nThanks for connecting on LinkedIn last week. I wanted to follow up properly.\n\nI'm [Your Name], studying [Degree] at [College] and actively looking for a summer internship in [Domain]. [Company] has been at the top of my list for [specific reason].\n\nWould you be open to a quick call to explore if there's a fit?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 19, category: 'Founders & Leadership',
    subject: 'What sets [Company] apart — and why I want to work there',
    body: `Hi [Name],\n\nI've spent the last month researching companies in [space] — [Company], [Competitor 1], and [Competitor 2]. After looking at all three closely, [Company] stands out because [specific genuine reason].\n\nI'm [Your Name], studying [Degree] at [College]. I'd like to spend my summer at the company I genuinely believe is winning — and that's [Company].\n\nIs there room for an intern this summer?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 20, category: 'Founders & Leadership',
    subject: 'Making this easy — [Name] | Internship | [College]',
    body: `Hi [Name],\n\nI know you get a lot of these emails. So let me make this quick:\n\n— Who I am: [Your Name], [Year] [Degree] at [College]\n— What I want: A summer internship in [Domain] at [Company]\n— Why [Company]: [One specific reason]\n— What I bring: [One specific skill or achievement]\n— What I'm asking: 10 minutes of your time\n\nResume attached. Worth it?\n\n[Your Name]\n[LinkedIn]`,
  },

  // ── Alumni & Network ─────────────────────────────────────────────────────
  {
    id: 21, category: 'Alumni & Network',
    subject: 'Fellow [College] student — internship at [Company]?',
    body: `Hi [Name],\n\nI came across your profile on LinkedIn and noticed you studied at [College] — I'm currently in my [Year] year there studying [Degree].\n\nI've been targeting [Company] for my summer internship search and your experience there immediately stood out. Would you be open to a quick 10-minute call to share your perspective on the team and culture?\n\nI'd really appreciate any guidance — and if you think it could be a good fit, any advice on the best way to apply.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 22, category: 'Alumni & Network',
    subject: '[City] + [College] connection — quick ask about [Company]',
    body: `Hi [Name],\n\nI noticed you're based in [City] and went to [College] — I'm a current [Year] year student there and I'm in [City] this summer.\n\nI've been targeting [Company] for an internship and your profile came up in my research. Would you be open to a quick coffee or call? I'd love to learn about your path and get your take on [Company].\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 23, category: 'Alumni & Network',
    subject: '[Department/Club] at [College] — reaching out about [Company]',
    body: `Hi [Name],\n\nI'm a [Year] year student in [Department] at [College] — I saw you were also part of [department/club/society] when you were here.\n\nI'm actively looking for a summer internship in [Domain] and [Company] is high on my list. Given your experience there, I'd love to get your honest take — what's the team like, what does the work actually involve, and any advice on the best way to get in?\n\n10 minutes would be incredibly helpful.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 24, category: 'Alumni & Network',
    subject: 'How you made the switch to [Domain] — [Name] from [College]',
    body: `Hi [Name],\n\nYour career path really stood out to me — going from [background] to [Domain] at [Company] is exactly the kind of move I'm trying to make.\n\nI'm a [Year] [Degree] student at [College] with a background in [your area] trying to break into [Domain]. Would you be open to sharing how you made that transition? And if there's any opportunity at [Company] this summer, I'd love to be pointed in the right direction.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 25, category: 'Alumni & Network',
    subject: 'Senior from [College] — advice on breaking into [Domain]',
    body: `Hi [Name],\n\nI'm [Your Name], a [Year] year student at [College]. I've been following your work at [Company] on LinkedIn for a few months now — your posts on [topic] are genuinely useful.\n\nI'm building my career in [Domain] and [Company] is a company I'm seriously targeting. Would you be open to a quick 10-minute call? I'd love to learn from your experience — not just about [Company] but about how you approached the off-campus search generally.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 26, category: 'Alumni & Network',
    subject: 'Would you be comfortable with a referral? — [Name] | [College]',
    body: `Hi [Name],\n\nI hope this message finds you well. I came across your profile while researching [Company] — you've been there for [X time] and your work in [area] stood out.\n\nI'm [Your Name], a [Year] [Degree] student at [College] actively looking for a summer internship in [Domain]. I've done [one relevant thing]. I genuinely believe I could contribute to [Company]'s team.\n\nWould you be comfortable referring me, or at least pointing me toward the right person to speak to? I know that's a big ask — but I wanted to be direct rather than beat around the bush.\n\nEither way, thank you for reading this far.\n\n[Your Name]\n[LinkedIn] · Resume attached`,
  },
  {
    id: 27, category: 'Alumni & Network',
    subject: 'Your advice helped — following up with an ask',
    body: `Hi [Name],\n\nA few weeks ago I came across your post/article on [topic] — it actually changed how I approached [specific thing].\n\nI'm [Your Name], a [Year] student at [College] currently building toward a career in [Domain]. [Company] is high on my summer internship list and I noticed you work there.\n\nWould you be open to a 10-minute chat? I have specific questions about [Company] and [Domain] that I think only someone with your experience could answer.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 28, category: 'Alumni & Network',
    subject: 'A long shot — but worth trying | [Name] | [College]',
    body: `Hi [Name],\n\nI'll be honest — this is a cold email from a student you've never met. But here's why I'm sending it anyway:\n\nI've been targeting [Company] for my summer internship for three months. I've done my research, I know what your team works on, and I genuinely believe I could contribute.\n\nI'm [Your Name], studying [Degree] at [College]. My relevant experience: [one specific thing]. My ask: 10 minutes of your time.\n\nIf the answer is no, I completely understand. But I'd rather ask directly than wonder.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 29, category: 'Alumni & Network',
    subject: '[Year] batch — [College] | Quick ask about [Company]',
    body: `Hi [Name],\n\nI noticed we're from the same [college/city/batch] — small world.\n\nI'm currently in [Year] year at [College] and actively building toward a career in [Domain]. [Company] has been at the top of my list and I saw you work there.\n\nWould you be open to a quick chat? Even 10 minutes would be incredibly valuable — I have specific questions about the team and how to best position my application.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 30, category: 'Alumni & Network',
    subject: 'Paying it forward — could you help? | [Name] | [College]',
    body: `Hi [Name],\n\nI'm sure someone helped you figure out the off-campus search at some point. I'm hoping you'd be willing to do the same for me.\n\nI'm [Your Name], a [Year] [Degree] student at [College] actively looking for a summer internship in [Domain]. [Company] is my top choice and I saw you work there.\n\n10 minutes of your perspective would mean more than you know.\n\n[Your Name]\n[LinkedIn]`,
  },

  // ── Domain Specific ──────────────────────────────────────────────────────
  {
    id: 31, category: 'Domain Specific',
    subject: '[Name] | [Degree] | [College] — Consulting Internship Interest',
    body: `Dear [Name],\n\nI am writing to express my interest in a summer consulting internship at [Firm].\n\nI am currently in my [Year] year of [Degree] at [College]. My interest in consulting has been shaped by [specific experience — case competition, consulting project, course]. I am particularly drawn to [Firm]'s work in [practice area/industry] and believe my skills in [analysis/research/structured thinking] would translate well to your team.\n\nI would welcome the opportunity to discuss how I can contribute. My resume is attached.\n\nRegards,\n[Your Name]\n[LinkedIn] · [Phone] · [College]`,
  },
  {
    id: 32, category: 'Domain Specific',
    subject: 'Summer Internship Interest — [Name] | [College]',
    body: `Hi [Name],\n\nI've been researching boutique consulting firms for my summer internship and [Firm] consistently stands out — particularly your work in [industry/area].\n\nI'm [Your Name], studying [Degree] at [College]. I've developed strong skills in [research/analysis/client communication] through [specific experience]. I'm looking for an internship where I'll be doing real consulting work from day one — not just PowerPoints.\n\nWould you be open to a brief conversation?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 33, category: 'Domain Specific',
    subject: 'Finance Internship — [Name] | [College] | Summer 2025',
    body: `Hi [Name],\n\nI'm [Your Name], a [Year] [Degree] student at [College] with a strong foundation in financial analysis and a genuine interest in [Company]'s work in [fintech area/investment thesis/financial product].\n\nMy experience includes [specific: financial modeling course / CFA Level 1 / internship / competition]. I am comfortable with [Excel / financial modeling / valuation] and am looking for an internship where I can apply these skills in a fast-paced environment.\n\nI would love to explore whether there is a summer opening. Resume attached.\n\n[Your Name]\n[LinkedIn] · [Phone]`,
  },
  {
    id: 34, category: 'Domain Specific',
    subject: 'FP&A / Finance Internship — [Name] | [College]',
    body: `Hi [Name],\n\nI am a [Year] year [Degree] student at [College] interested in a summer internship in [Company]'s finance or FP&A team.\n\nI have developed a strong foundation in [financial modeling / budgeting / forecasting / Excel] through [specific experience]. I am drawn to [Company] specifically because [one genuine reason — size, industry, growth stage].\n\nWould there be an opportunity to connect this week?\n\n[Your Name]\n[LinkedIn] · [Phone]`,
  },
  {
    id: 35, category: 'Domain Specific',
    subject: "Founder's Office Internship — [Name] | [College]",
    body: `Hi [Name],\n\nI've been following [Company] closely and I'm genuinely excited about what you're building. I noticed [Company] has / is known for having a Founder's Office — I'd love to be part of it this summer.\n\nI'm [Your Name], studying [Degree] at [College]. I'm the kind of person who takes ownership, works across functions, and doesn't need a defined job description to add value. I've [one specific example of initiative].\n\nIs there space for someone like me this summer?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 36, category: 'Domain Specific',
    subject: 'Marketing Internship — [Name] | [College] | Summer 2025',
    body: `Hi [Name],\n\nI've been following [Company]'s marketing closely — especially [specific: their Instagram strategy / recent campaign / content approach]. [One genuine observation about their marketing — something you liked or something you'd do differently].\n\nI'm [Your Name], a [Year] [Degree] student at [College] with hands-on experience in [content/social/analytics/campaigns]. I'd love to bring that energy to your team this summer.\n\nIs there an opening, or someone else I should speak to?\n\n[Your Name]\n[LinkedIn] · [Portfolio if applicable]`,
  },
  {
    id: 37, category: 'Domain Specific',
    subject: 'BD Internship Interest — [Name] | [College]',
    body: `Hi [Name],\n\nI'm [Your Name], a [Year] [Degree] student at [College] looking for a summer internship in business development.\n\nI'm drawn to BD because [one genuine reason — you like building relationships, identifying opportunities, the mix of strategy and execution]. I've developed [relevant skill: communication / research / cold outreach / negotiation] through [experience].\n\n[Company]'s BD function is particularly interesting to me because [specific reason].\n\nWould you be open to a 10-minute call?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 38, category: 'Domain Specific',
    subject: 'Operations Internship — [Name] | [College] | Summer 2025',
    body: `Hi [Name],\n\nI'm [Your Name], studying [Degree] at [College], looking for a summer internship in operations at a fast-growing company.\n\nI'm drawn to ops because [genuine reason — you like solving systems problems, improving processes, the mix of analysis and execution]. I've [one relevant experience].\n\n[Company]'s scale and pace is exactly the environment I'm looking for. Is there an opening this summer?\n\n[Your Name]\n[LinkedIn] · [Phone]`,
  },
  {
    id: 39, category: 'Domain Specific',
    subject: 'Research/Analyst Internship — [Name] | [College]',
    body: `Hi [Name],\n\nI'm [Your Name], a [Year] [Degree] student at [College] with a strong background in research and analysis.\n\nI've [one specific example: completed a research paper on X / built a market analysis for Y / won a case competition on Z]. I'm looking for a summer internship where research is central to the work — not an afterthought.\n\n[Company]'s work in [area] is exactly the kind of environment I'm looking for. Would you have 10 minutes this week?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 40, category: 'Domain Specific',
    subject: 'Summer Intern — [Name] | Ready to work | [College]',
    body: `Hi [Name],\n\nI'll keep this brief. I want to intern at [Company] this summer.\n\nI'm [Your Name], [Year] [Degree] at [College]. I work fast, I'm generalist enough to contribute across functions, and I care about the problem [Company] is solving.\n\nI don't need a defined role. What does your team need most right now?\n\n[Your Name]\n[LinkedIn]`,
  },

  // ── Follow-Ups ───────────────────────────────────────────────────────────
  {
    id: 41, category: 'Follow-Ups',
    subject: 'Re: [Original subject]',
    body: `Hi [Name],\n\nJust following up on my note from last week about a summer internship at [Company].\n\nStill very interested — happy to share more about my background or answer any questions.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 42, category: 'Follow-Ups',
    subject: 'Re: [Original subject]',
    body: `Hi [Name],\n\nOne more follow-up — I know inboxes get busy.\n\nI'm [Your Name] from [College] — I reached out about a summer internship at [Company] about 10 days ago. Still very interested and happy to make this as easy as possible for you.\n\nIs there a better person to speak to, or a better time to reach out?\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 43, category: 'Follow-Ups',
    subject: 'Re: [Original subject] — Last note',
    body: `Hi [Name],\n\nThis is my last follow-up — I promise.\n\nIf the timing isn't right or there's no opening, I completely understand. I'd love to stay connected for future opportunities.\n\nWishing you and the [Company] team all the best.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 44, category: 'Follow-Ups',
    subject: 'Checking in — [Name] | [College]',
    body: `Hi [Name],\n\nI reached out a few weeks ago about a summer internship at [Company]. I know things get busy — just wanted to check if the timing is better now or if there's been any development on the internship front.\n\nStill very interested. Resume still attached.\n\n[Your Name]\n[LinkedIn]`,
  },
  {
    id: 45, category: 'Follow-Ups',
    subject: 'Thank you — and one more ask',
    body: `Hi [Name],\n\nThank you for letting me know about the internship — I really appreciate the response.\n\nIf any future openings come up — this summer or beyond — I'd love to be considered. I'll keep following [Company]'s work in the meantime.\n\nAnd if you ever have 10 minutes for a quick chat about the industry or your career path, I'd genuinely love to learn from your experience.\n\n[Your Name]\n[LinkedIn]`,
  },

  // ── Subject Lines ────────────────────────────────────────────────────────
  {
    id: 46, category: 'Subject Lines', isSubjectLine: true,
    body: '[Mutual Name] said I should reach out — [Your Name] | [College]',
  },
  {
    id: 47, category: 'Subject Lines', isSubjectLine: true,
    body: "Impressed by [Company]'s [specific thing] — internship inquiry",
  },
  {
    id: 48, category: 'Subject Lines', isSubjectLine: true,
    body: '[Year] student at [College] | Strong interest in [Company] | Summer 2025',
  },
  {
    id: 49, category: 'Subject Lines', isSubjectLine: true,
    body: 'Worth 10 minutes? — [Name] | [Domain] | [College]',
  },
  {
    id: 50, category: 'Subject Lines', isSubjectLine: true,
    body: "[Company] is my first choice — here's why | [Your Name]",
  },
]

const FILTERS = ['All', 'HR & Talent Acquisition', 'Founders & Leadership', 'Alumni & Network', 'Domain Specific', 'Follow-Ups', 'Subject Lines']

const CATEGORY_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  'HR & Talent Acquisition': { bg: 'rgba(79,124,255,0.12)', border: 'rgba(79,124,255,0.28)', color: '#93BBFF' },
  'Founders & Leadership':   { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.28)', color: '#d8b4fe' },
  'Alumni & Network':        { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.28)', color: '#6ee7b7' },
  'Domain Specific':         { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)', color: '#fcd34d' },
  'Follow-Ups':              { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.28)', color: '#f9a8d4' },
  'Subject Lines':           { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.28)', color: '#c7d2fe' },
}

function buildCopyText(t: Template) {
  if (t.isSubjectLine) return `Subject Line Formula #${t.id}:\n${t.body}`
  let out = `Template ${String(t.id).padStart(2, '0')} — ${t.category}\n`
  if (t.subject) out += `Subject: ${t.subject}\n\n`
  out += t.body
  return out
}

export default function ColdEmailPackPage() {
  const [activeFilter, setActiveFilter]   = useState('All')
  const [copiedId, setCopiedId]           = useState<string | null>(null)
  const [copiedAll, setCopiedAll]         = useState(false)
  const [emailUnlocked, setEmailUnlocked] = useState(false)
  const [fullyUnlocked, setFullyUnlocked] = useState(false)
  const [showPopup, setShowPopup]         = useState(false)

  useEffect(() => {
    const emailUnlockedVal = localStorage.getItem('coldEmailPackEmailUnlocked') === 'true'
    const fullyUnlockedVal = localStorage.getItem('resourcePackUnlocked') === 'true'
    setEmailUnlocked(emailUnlockedVal)
    setFullyUnlocked(fullyUnlockedVal)

    if (!fullyUnlockedVal) {
      const savedEmail = localStorage.getItem('userEmail')
      if (savedEmail) {
        fetch('/api/check-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: savedEmail }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.hasAccess) {
              localStorage.setItem('resourcePackUnlocked', 'true')
              setFullyUnlocked(true)
            }
          })
          .catch(() => {})
      }
    }
  }, [])

  const visibleCount = fullyUnlocked ? Infinity : emailUnlocked ? 4 : 2

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyAll = () => {
    if (!fullyUnlocked) { setShowPopup(true); return }
    const allText = TEMPLATES.map(buildCopyText).join('\n\n' + '─'.repeat(60) + '\n\n')
    navigator.clipboard.writeText(allText).catch(() => {})
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const visibleTemplates = activeFilter === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeFilter)

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        .filter-scroll::-webkit-scrollbar{display:none}
        .template-card{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;transition:border-color 0.2s,box-shadow 0.2s}
        .template-card:hover{border-color:rgba(79,124,255,0.3);box-shadow:0 8px 32px rgba(79,124,255,0.08)}
        .copy-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:"DM Sans",sans-serif}
        .copy-btn:hover{background:rgba(79,124,255,0.15);border-color:rgba(79,124,255,0.35);color:#93BBFF}
        .copy-btn.copied{background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.35);color:#6ee7b7}
        .filter-pill{padding:8px 16px;border-radius:100px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.45);font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.15s;font-family:"DM Sans",sans-serif}
        .filter-pill:hover{border-color:rgba(255,255,255,0.25);color:rgba(255,255,255,0.75)}
        .filter-pill.active{background:rgba(79,124,255,0.15);border-color:rgba(79,124,255,0.4);color:#93BBFF}
        .code-block{background:rgba(255,255,255,0.04);border-radius:10px;padding:16px 18px;font-family:'Courier New',Courier,monospace;font-size:13px;line-height:1.75;color:rgba(255,255,255,0.85);white-space:pre-wrap;word-break:break-word;margin-top:14px;border:1px solid rgba(255,255,255,0.06);transition:filter 0.5s ease}
        .code-block.blurred{filter:blur(4px);user-select:none;pointer-events:none}
        .section-divider{display:flex;align-items:center;gap:16px;margin:40px 0 28px}
        .section-divider-line{flex:1;height:1px;background:rgba(255,255,255,0.07)}
        .lock-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;border-radius:10px}
        .unlock-banner{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;background:rgba(79,124,255,0.06);border:1px solid rgba(79,124,255,0.18);border-radius:10px;padding:10px 16px;margin-bottom:16px}
        .unlock-banner-btn{padding:5px 14px;border-radius:100px;background:rgba(79,124,255,0.12);border:1px solid rgba(79,124,255,0.3);color:#93BBFF;font-size:12px;font-weight:700;cursor:pointer;font-family:"DM Sans",sans-serif;flex-shrink:0}
        .unlock-banner-btn:hover{background:rgba(79,124,255,0.2)}
        @media(max-width:640px){
          .top-bar-title{display:none}
          .stat-pills{flex-wrap:wrap}
        }
      `}</style>

      <UnlockPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onEmailUnlock={() => setEmailUnlocked(true)}
        resourceName="Cold Email Pack"
        localStorageKey="coldEmailPack"
        showEmailOption={true}
        emailAlreadySubmitted={emailUnlocked}
      />

      {/* STICKY TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5, flexShrink: 0 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <span className="top-bar-title" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>Cold Email Pack — 50 Templates</span>
        <button
          onClick={copyAll}
          style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 8, border: `1px solid ${copiedAll ? 'rgba(16,185,129,0.35)' : 'rgba(79,124,255,0.25)'}`, background: copiedAll ? 'rgba(16,185,129,0.15)' : 'rgba(79,124,255,0.06)', color: copiedAll ? '#6ee7b7' : '#93BBFF', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' }}
        >
          {copiedAll ? 'Copied ✓' : fullyUnlocked ? 'Copy All 50' : 'Unlock to Copy All'}
        </button>
      </div>

      {/* HERO */}
      <section style={{ padding: '64px 24px 48px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#93BBFF', textTransform: 'uppercase', marginBottom: 20 }}>
          Free Resource
        </div>
        <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, marginBottom: 16 }}>
          The Cold Email Pack
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
          50 proven templates used by students to get replies from HRs, founders, and hiring managers at top companies — off campus.
        </p>
        <div className="stat-pills" style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { label: '50 Email Templates', color: '#4F7CFF', bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.25)' },
            { label: '7 Categories', color: '#fcd34d', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
            { label: 'Copy-paste ready', color: '#6ee7b7', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
          ].map(p => (
            <span key={p.label} style={{ padding: '8px 18px', borderRadius: 100, background: p.bg, border: `1px solid ${p.border}`, color: p.color, fontSize: 13, fontWeight: 700 }}>{p.label}</span>
          ))}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          {fullyUnlocked ? (
            <span style={{ color: '#10b981', fontWeight: 600 }}>All 50 templates unlocked ✓</span>
          ) : emailUnlocked ? (
            <span>
              Showing 4 per category ·{' '}
              <button onClick={() => setShowPopup(true)} style={{ background: 'none', border: 'none', color: '#4F7CFF', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'DM Sans',sans-serif", textDecoration: 'underline', padding: 0 }}>
                Get all 50 for ₹199 →
              </button>
            </span>
          ) : (
            <span>
              Showing 2 per category ·{' '}
              <button onClick={() => setShowPopup(true)} style={{ background: 'none', border: 'none', color: '#4F7CFF', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'DM Sans',sans-serif", textDecoration: 'underline', padding: 0 }}>
                Unlock more free →
              </button>
            </span>
          )}
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <div style={{ position: 'sticky', top: 52, zIndex: 90, background: 'rgba(11,11,15,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px' }}>
        <div className="filter-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 0', WebkitOverflowScrolling: 'touch' }}>
          {FILTERS.map(f => (
            <button key={f} className={`filter-pill${activeFilter === f ? ' active' : ''}`} onClick={() => setActiveFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
        {visibleTemplates.length > 0 && (() => {
          const groups: Record<string, Template[]> = {}
          visibleTemplates.forEach(t => {
            if (!groups[t.category]) groups[t.category] = []
            groups[t.category].push(t)
          })

          return Object.entries(groups).map(([cat, items]) => {
            const catColor = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['HR & Talent Acquisition']
            const shown = visibleCount === Infinity ? items.length : Math.min(visibleCount, items.length)
            const locked = items.length - shown

            return (
              <div key={cat}>
                {activeFilter === 'All' && (
                  <div className="section-divider">
                    <div className="section-divider-line" />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: catColor.color, whiteSpace: 'nowrap' }}>{cat}</span>
                    <div className="section-divider-line" />
                  </div>
                )}
                {locked > 0 && (
                  <div className="unlock-banner">
                    {emailUnlocked ? (
                      <>
                        <span style={{ fontSize: 13, color: '#93BBFF', fontWeight: 600 }}>
                          Showing {shown} of {items.length} · Unlock all 50 for ₹199
                        </span>
                        <button className="unlock-banner-btn" onClick={() => setShowPopup(true)}>Unlock All →</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 13, color: '#93BBFF', fontWeight: 600 }}>
                          🔒 Showing {shown} of {items.length} · Enter email to unlock {Math.min(4, items.length) - shown} more free
                        </span>
                        <button className="unlock-banner-btn" onClick={() => setShowPopup(true)}>Unlock Free →</button>
                      </>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {items.map((t, idx) => {
                    const isLocked = visibleCount !== Infinity && idx >= visibleCount
                    const copyId = `template-${t.id}`
                    const wasCopied = copiedId === copyId
                    const copyText = buildCopyText(t)

                    return (
                      <div key={t.id} className="template-card">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginTop: 2 }}>
                            {String(t.id).padStart(2, '0')}
                          </span>
                          <div style={{ flex: 1 }}>
                            {!t.isSubjectLine && (
                              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: t.subject ? 10 : 0 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, background: catColor.bg, border: `1px solid ${catColor.border}`, color: catColor.color }}>
                                  {t.category}
                                </span>
                              </div>
                            )}
                            {t.isSubjectLine && (
                              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, background: catColor.bg, border: `1px solid ${catColor.border}`, color: catColor.color }}>
                                Subject Line Formula
                              </span>
                            )}
                          </div>
                          {!isLocked && (
                            <button className={`copy-btn${wasCopied ? ' copied' : ''}`} onClick={() => copy(copyText, copyId)}>
                              {wasCopied ? 'Copied ✓' : 'Copy'}
                            </button>
                          )}
                        </div>

                        {t.subject && (
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', marginTop: 12, marginLeft: 28, lineHeight: 1.5 }}>
                            Subject: {t.subject}
                          </div>
                        )}

                        <div style={{ position: 'relative' }}>
                          {t.isSubjectLine ? (
                            <div style={{ marginTop: 14, marginLeft: 28 }}>
                              <div className={`code-block${isLocked ? ' blurred' : ''}`} style={{ fontSize: 14, fontFamily: "'Courier New',Courier,monospace" }}>
                                {t.body}
                              </div>
                            </div>
                          ) : (
                            <div className={`code-block${isLocked ? ' blurred' : ''}`} style={{ marginLeft: 0, marginTop: t.subject ? 10 : 14 }}>
                              {t.body}
                            </div>
                          )}
                          {isLocked && (
                            <div className="lock-overlay" onClick={() => setShowPopup(true)}>
                              <span style={{ fontSize: 22 }}>🔒</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                                {emailUnlocked ? 'Unlock all 50 for ₹199' : 'Enter email to unlock 2 more free'}
                              </span>
                              <button
                                style={{ padding: '6px 18px', borderRadius: 100, background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.35)', color: '#93BBFF', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                                onClick={e => { e.stopPropagation(); setShowPopup(true) }}
                              >
                                {emailUnlocked ? 'Unlock All →' : 'Get Access →'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        })()}

        {/* LinkedIn Scripts crosslink */}
        <div style={{ marginTop: 56, padding: 24, background: 'linear-gradient(135deg,rgba(14,165,233,0.08),rgba(99,102,241,0.05))', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#7dd3fc', textTransform: 'uppercase', marginBottom: 8 }}>Also Available</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>20 LinkedIn DM Scripts</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>Message templates for HRs, founders, alumni, and more.</div>
          </div>
          <a href="/resources/linkedin-scripts" style={{ padding: '12px 22px', borderRadius: 12, background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)', color: '#7dd3fc', fontWeight: 700, fontSize: 14, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>
            View Scripts →
          </a>
        </div>
      </div>

      {/* BOTTOM CTA */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '64px 24px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#93BBFF', textTransform: 'uppercase', marginBottom: 20 }}>
            Go Further
          </div>
          <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, marginBottom: 16 }}>
            Templates get you started.<br />Strategy gets you placed.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 36 }}>
            The Cold Email Pack is the tool. The Beyond Campus cohort is the system — personalized strategy, mentor support, and warm introductions.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/cohort" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 0 32px rgba(79,124,255,0.3)', transition: 'all 0.2s' }}>
              Join the Cohort — ₹999 →
            </a>
            <a href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 100, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: 15, transition: 'all 0.2s' }}>
              Book a Session — ₹299
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
