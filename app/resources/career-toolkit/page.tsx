'use client'

import { useState, useEffect } from 'react'

// ──────────────────────── TYPES ────────────────────────
type SkillEntry = { skill: string; why: string }
type SkillMap = { core: SkillEntry[]; tools: SkillEntry[]; proofOfWork: SkillEntry[]; bonus: SkillEntry[] }
type LearningResource = { label: string; url: string }
type RoleData = { skillMap: SkillMap; learningResources: LearningResource[] }
type Project = {
  id: string; title: string; description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'; time: string
  context: string; steps: string[]; output: string; showcase: string
  resumeBullet: string; linkedinPost: string
}
type Role = { id: string; title: string; domain: string; emoji: string; projects: number; skills: number }

// ──────────────────────── ROLES ────────────────────────
const roles: Role[] = [
  { id: 'business-analyst', title: 'Business Analyst Intern', domain: 'Consulting', emoji: '📊', projects: 4, skills: 12 },
  { id: 'strategy-intern', title: 'Strategy Intern', domain: 'Consulting', emoji: '♟️', projects: 3, skills: 10 },
  { id: 'consulting-big4', title: 'Big 4 Consulting Intern', domain: 'Consulting', emoji: '🏢', projects: 4, skills: 14 },
  { id: 'finance-intern', title: 'Finance Intern', domain: 'Finance', emoji: '💰', projects: 4, skills: 12 },
  { id: 'fpa-intern', title: 'FP&A Intern', domain: 'Finance', emoji: '📈', projects: 3, skills: 10 },
  { id: 'investment-research', title: 'Investment Research Intern', domain: 'Finance', emoji: '🔍', projects: 3, skills: 11 },
  { id: 'founders-office', title: "Founder's Office Intern", domain: "Founder's Office", emoji: '🚀', projects: 4, skills: 13 },
  { id: 'chief-of-staff', title: 'Chief of Staff (Entry)', domain: "Founder's Office", emoji: '⚡', projects: 3, skills: 11 },
  { id: 'marketing-intern', title: 'Marketing Intern', domain: 'Marketing', emoji: '📣', projects: 5, skills: 14 },
  { id: 'content-social', title: 'Content & Social Media Intern', domain: 'Marketing', emoji: '✍️', projects: 4, skills: 12 },
  { id: 'growth-marketing', title: 'Growth Marketing Intern', domain: 'Marketing', emoji: '📊', projects: 3, skills: 13 },
  { id: 'bd-intern', title: 'Business Development Intern', domain: 'BD', emoji: '🤝', projects: 4, skills: 11 },
  { id: 'partnerships-intern', title: 'Partnerships Intern', domain: 'BD', emoji: '🔗', projects: 3, skills: 10 },
  { id: 'operations-intern', title: 'Operations Intern', domain: 'Operations', emoji: '⚙️', projects: 4, skills: 12 },
  { id: 'project-management', title: 'Project Management Intern', domain: 'Operations', emoji: '📋', projects: 3, skills: 11 },
]

const domains = ['All', 'Consulting', 'Finance', "Founder's Office", 'Marketing', 'BD', 'Operations']

const domainEmoji: Record<string, string> = {
  'Consulting': '🏢', 'Finance': '💰', "Founder's Office": '🚀', 'Marketing': '📣', 'BD': '🤝', 'Operations': '⚙️'
}

// ──────────────────────── SKILL MAP DATA ────────────────────────
const roleData: Record<string, RoleData> = {
  'marketing-intern': {
    skillMap: {
      core: [
        { skill: 'Market Research', why: 'Every marketing decision starts with understanding the customer' },
        { skill: 'Campaign Thinking', why: 'Ability to plan end-to-end campaigns from brief to execution' },
        { skill: 'Consumer Behaviour Basics', why: 'Understanding why people buy is the foundation of marketing' },
        { skill: 'Brand Awareness', why: 'Know what makes a brand distinct and how to communicate it' },
      ],
      tools: [
        { skill: 'MS Excel / Google Sheets', why: 'For tracking campaign metrics and data analysis' },
        { skill: 'Canva', why: 'Most startups expect interns to create basic design assets' },
        { skill: 'Meta Business Suite', why: 'Running and analyzing Instagram/Facebook ads' },
        { skill: 'Google Analytics (Basic)', why: 'Track website traffic and campaign performance' },
      ],
      proofOfWork: [
        { skill: 'Campaign Portfolio', why: 'Show real or mock campaigns you have planned and executed' },
        { skill: 'Content Calendar', why: 'Demonstrates planning ability and consistency' },
        { skill: 'Competitive Analysis', why: 'Proves you can research and synthesize market information' },
        { skill: 'Engagement Metrics Tracking', why: 'Shows you measure impact, not just output' },
      ],
      bonus: [
        { skill: 'Basic Copywriting', why: 'Writing compelling captions and ad copy is highly valued' },
        { skill: 'SEO Fundamentals', why: 'Growing differentiator even for non-digital marketing roles' },
        { skill: 'Email Marketing Basics', why: 'Mailchimp / email campaigns are common intern tasks' },
        { skill: 'Video Editing (Basic)', why: 'Reels and short-form video is now core to most marketing roles' },
      ]
    },
    learningResources: [
      { label: 'Google Digital Garage — Marketing Fundamentals', url: 'https://learndigital.withgoogle.com/digitalgarage' },
      { label: 'Meta Blueprint — Social Media Marketing', url: 'https://www.facebook.com/business/learn' },
      { label: 'HubSpot Academy — Digital Marketing', url: 'https://academy.hubspot.com' },
    ]
  },
  'business-analyst': {
    skillMap: {
      core: [
        { skill: 'Structured Problem Solving', why: 'Breaking complex problems into logical components' },
        { skill: 'Data Analysis Basics', why: 'Turning raw data into actionable insights' },
        { skill: 'Business Communication', why: 'Presenting findings clearly to non-technical stakeholders' },
        { skill: 'Requirements Gathering', why: 'Understanding what stakeholders actually need vs what they ask for' },
      ],
      tools: [
        { skill: 'MS Excel (Advanced)', why: 'Pivot tables, VLOOKUP, basic dashboards are daily BA tasks' },
        { skill: 'PowerPoint', why: 'Slide decks are how BAs communicate findings' },
        { skill: 'SQL (Basic)', why: 'Growing expectation even for non-technical BA roles' },
        { skill: 'Tableau or Power BI (Basic)', why: 'Data visualization is increasingly expected' },
      ],
      proofOfWork: [
        { skill: 'Case Study Analysis', why: 'Demonstrates structured thinking and business judgment' },
        { skill: 'Process Flow Mapping', why: 'Shows ability to document and improve business processes' },
        { skill: 'Data Dashboard', why: 'Proves you can turn data into visual insights' },
        { skill: 'Business Case Document', why: 'Shows you can justify decisions with data and logic' },
      ],
      bonus: [
        { skill: 'Basic Python (pandas)', why: 'Differentiator for data-heavy BA roles' },
        { skill: 'Agile/Scrum Basics', why: 'Most tech-adjacent companies use agile' },
        { skill: 'Financial Modeling Basics', why: 'Valued in consulting and strategy-adjacent BA roles' },
        { skill: 'User Journey Mapping', why: 'Shows product thinking — valued at startups' },
      ]
    },
    learningResources: [
      { label: 'Google Data Analytics Certificate (Coursera — audit free)', url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
      { label: 'Excel Skills for Business (Coursera — audit free)', url: 'https://www.coursera.org/specializations/excel' },
      { label: 'Business Analysis Fundamentals (Udemy)', url: 'https://www.udemy.com/course/business-analysis-ba/' },
    ]
  },
  'finance-intern': {
    skillMap: {
      core: [
        { skill: 'Financial Statement Analysis', why: 'Reading P&L, balance sheet, and cash flow is day-one expectation' },
        { skill: 'Financial Modeling Basics', why: 'Building models in Excel is core finance intern work' },
        { skill: 'Valuation Fundamentals', why: 'DCF and comparable company analysis basics are expected' },
        { skill: 'Accounting Basics', why: 'Debits, credits, and basic bookkeeping underpin all finance work' },
      ],
      tools: [
        { skill: 'MS Excel (Advanced)', why: 'Non-negotiable — pivot tables, VLOOKUP, financial functions' },
        { skill: 'Tally (Basic)', why: 'Expected at Indian SMEs and accounting firms' },
        { skill: 'Bloomberg (Basic)', why: 'Differentiator for investment and research roles' },
        { skill: 'PowerPoint', why: 'Financial presentations and investor decks' },
      ],
      proofOfWork: [
        { skill: '3-Statement Financial Model', why: 'The gold standard proof of finance capability' },
        { skill: 'Stock Pitch / Investment Memo', why: 'Proves investment thinking and research ability' },
        { skill: 'Industry Analysis Report', why: 'Shows market research and financial synthesis skills' },
        { skill: 'Budget vs Actual Tracker', why: 'Directly relevant to FP&A and corporate finance roles' },
      ],
      bonus: [
        { skill: 'CFA Level 1 (registered or passed)', why: 'Significant differentiator for investment roles' },
        { skill: 'Python for Finance (Basic)', why: 'Growing expectation at data-driven finance firms' },
        { skill: 'SQL (Basic)', why: 'Useful for FP&A and corporate finance analytics' },
        { skill: 'Financial Ratio Analysis', why: 'Quick, learnable, and impressive in interviews' },
      ]
    },
    learningResources: [
      { label: 'CFI Financial Modeling (Free modules)', url: 'https://corporatefinanceinstitute.com' },
      { label: 'Zerodha Varsity — Stock Markets', url: 'https://zerodha.com/varsity/' },
      { label: 'NSE Academy — Financial Markets', url: 'https://www.nseindia.com/learn' },
    ]
  },
  'founders-office': {
    skillMap: {
      core: [
        { skill: 'First-Principles Thinking', why: 'Founders Office requires solving problems without a playbook' },
        { skill: 'Cross-functional Coordination', why: 'You work across every team — sales, product, ops, marketing' },
        { skill: 'Prioritization', why: 'Deciding what matters most with limited time and resources' },
        { skill: 'Executive Communication', why: 'You interface with the founder daily — clarity is critical' },
      ],
      tools: [
        { skill: 'Notion', why: 'Most startups use Notion for documentation and project management' },
        { skill: 'Google Workspace (Advanced)', why: 'Sheets, Docs, Slides — daily tools in any startup' },
        { skill: 'Slack', why: 'Primary communication tool at most startups' },
        { skill: 'Airtable or Linear', why: 'Project tracking tools common in growth-stage startups' },
      ],
      proofOfWork: [
        { skill: 'GTM Strategy Document', why: 'Shows strategic thinking and business judgment' },
        { skill: 'Process Documentation', why: "Building SOPs is core Founder's Office work" },
        { skill: 'Competitive Landscape Map', why: 'Research and synthesis across multiple domains' },
        { skill: 'OKR Framework', why: 'Shows you understand goal-setting and performance tracking' },
      ],
      bonus: [
        { skill: 'Basic Financial Modeling', why: 'Founders often ask for quick unit economics models' },
        { skill: 'Fundraising Basics', why: 'Understanding term sheets and investor relations is valued' },
        { skill: 'Product Sense', why: "Working with product teams is common in Founder's Office" },
        { skill: 'Cold Outreach', why: "Many Founder's Office roles include partnerships and BD work" },
      ]
    },
    learningResources: [
      { label: 'Reforge — Growth & Strategy (some free content)', url: 'https://www.reforge.com' },
      { label: 'First Round Review — Startup Operations', url: 'https://review.firstround.com' },
      { label: "Lenny's Newsletter — Product & Growth", url: 'https://www.lennysnewsletter.com' },
    ]
  },
  'bd-intern': {
    skillMap: {
      core: [
        { skill: 'Relationship Building', why: 'BD is fundamentally about building trust with partners and clients' },
        { skill: 'Negotiation Basics', why: 'Every BD deal involves some form of negotiation' },
        { skill: 'Market Mapping', why: 'Identifying potential partners and clients requires systematic research' },
        { skill: 'Pitch Communication', why: "Presenting your company's value to external stakeholders" },
      ],
      tools: [
        { skill: 'MS Excel / Google Sheets', why: 'Pipeline tracking and partner analysis' },
        { skill: 'LinkedIn Sales Navigator (Basic)', why: 'Prospecting and outreach at most BD roles' },
        { skill: 'CRM Tools (Basic)', why: 'Salesforce, HubSpot, or Zoho — managing the pipeline' },
        { skill: 'PowerPoint', why: 'Partnership decks and proposal presentations' },
      ],
      proofOfWork: [
        { skill: 'Cold Outreach Campaign', why: 'Shows you can prospect, reach out, and convert' },
        { skill: 'Partnership Proposal', why: 'Demonstrates ability to structure a business deal' },
        { skill: 'Market Mapping Document', why: 'Proves systematic research and business judgment' },
        { skill: 'Pipeline Tracker', why: 'Shows process orientation and CRM thinking' },
      ],
      bonus: [
        { skill: 'Basic Contract Understanding', why: 'Reading MoUs and agreements is expected at senior BD roles' },
        { skill: 'Public Speaking', why: 'BD requires presenting to external audiences regularly' },
        { skill: 'Industry Knowledge (specific)', why: 'Deep knowledge of one industry creates immediate credibility' },
        { skill: 'Social Selling', why: 'LinkedIn-based outreach is becoming core to modern BD' },
      ]
    },
    learningResources: [
      { label: 'HubSpot Sales Training (Free)', url: 'https://academy.hubspot.com/courses/sales-training' },
      { label: 'LinkedIn Sales Navigator Training', url: 'https://business.linkedin.com/sales-solutions/training' },
      { label: 'Coursera — Successful Negotiation (Free audit)', url: 'https://www.coursera.org/learn/negotiation' },
    ]
  },
  'operations-intern': {
    skillMap: {
      core: [
        { skill: 'Process Thinking', why: 'Operations is fundamentally about making processes better' },
        { skill: 'Data-Driven Decision Making', why: 'Every ops decision should be backed by numbers' },
        { skill: 'Stakeholder Management', why: 'Ops touches every team — managing relationships is critical' },
        { skill: 'Problem Solving Under Constraints', why: "Ops problems rarely have perfect solutions — trade-offs matter" },
      ],
      tools: [
        { skill: 'MS Excel (Advanced)', why: 'Operations data lives in spreadsheets — pivot tables are essential' },
        { skill: 'Google Sheets', why: 'Real-time collaboration on ops dashboards and trackers' },
        { skill: 'Notion or Asana', why: 'Project and task management for ops workflows' },
        { skill: 'SQL (Basic)', why: 'Querying operational data is increasingly expected' },
      ],
      proofOfWork: [
        { skill: 'Process Improvement Project', why: 'Before/after process maps with quantified improvement' },
        { skill: 'Operations Dashboard', why: 'Tracking metrics that matter for an operations function' },
        { skill: 'SOP Document', why: 'Standard Operating Procedures — core ops deliverable' },
        { skill: 'Root Cause Analysis', why: 'Finding why something broke and how to fix it permanently' },
      ],
      bonus: [
        { skill: 'Lean / Six Sigma Basics', why: 'Process improvement methodology valued at large companies' },
        { skill: 'Supply Chain Fundamentals', why: 'Relevant for e-commerce and manufacturing ops roles' },
        { skill: 'Vendor Management Basics', why: 'Negotiating and managing vendors is common ops work' },
        { skill: 'Basic Python for Automation', why: 'Automating repetitive ops tasks is a strong differentiator' },
      ]
    },
    learningResources: [
      { label: 'Google Project Management Certificate (Coursera — audit free)', url: 'https://www.coursera.org/professional-certificates/google-project-management' },
      { label: 'Lean Six Sigma Intro (free resources)', url: 'https://www.sixsigmaonline.org' },
      { label: 'Excel for Operations Management', url: 'https://www.udemy.com/course/excel-for-operations-management/' },
    ]
  },
  'fpa-intern': {
    skillMap: {
      core: [
        { skill: 'Financial Planning Basics', why: 'Building annual budgets and forecasts is core FP&A work' },
        { skill: 'Variance Analysis', why: 'Comparing budget vs actual and explaining the difference' },
        { skill: 'Business Partnering', why: 'FP&A works with every department to understand their financials' },
        { skill: 'Forecasting', why: 'Predicting future financial performance from historical data' },
      ],
      tools: [
        { skill: 'MS Excel (Advanced)', why: 'Complex financial models, scenario analysis, sensitivity tables' },
        { skill: 'PowerPoint', why: 'Monthly business review decks for leadership' },
        { skill: 'Power BI or Tableau (Basic)', why: 'Financial dashboards for leadership visibility' },
        { skill: 'SAP or Oracle (Basic)', why: 'ERP systems used at large corporates for financial data' },
      ],
      proofOfWork: [
        { skill: 'Budget Model', why: 'A complete annual budget model with assumptions and scenarios' },
        { skill: 'Variance Analysis Report', why: 'Explaining why actuals differ from plan' },
        { skill: 'Financial Dashboard', why: 'Visual summary of key financial metrics for leadership' },
        { skill: '3-Year Financial Forecast', why: 'Long-range planning is core FP&A capability' },
      ],
      bonus: [
        { skill: 'SQL for Financial Data', why: 'Pulling financial data from databases without IT help' },
        { skill: 'Python for Financial Automation', why: 'Automating reporting processes saves significant time' },
        { skill: 'IFRS/Ind AS Basics', why: 'Accounting standards knowledge valued at large companies' },
        { skill: 'Unit Economics', why: 'CAC, LTV, payback period — critical for startup FP&A' },
      ]
    },
    learningResources: [
      { label: 'CFI FP&A Certification (free modules)', url: 'https://corporatefinanceinstitute.com/certifications/fpa/' },
      { label: 'FP&A Trends — Free Resources', url: 'https://www.fpanda.com' },
      { label: 'Wall Street Prep — Free Financial Modeling', url: 'https://www.wallstreetprep.com/knowledge/financial-modeling/' },
    ]
  },
  'content-social': {
    skillMap: {
      core: [
        { skill: 'Content Strategy', why: 'Planning what to create, for whom, and why — before creating anything' },
        { skill: 'Copywriting', why: 'Writing captions, posts, and scripts that stop the scroll' },
        { skill: 'Platform Algorithms', why: 'Understanding how Instagram, LinkedIn, YouTube rank content' },
        { skill: 'Audience Research', why: 'Creating content that resonates requires knowing your audience deeply' },
      ],
      tools: [
        { skill: 'Canva (Advanced)', why: 'Designing posts, carousels, stories, and thumbnails' },
        { skill: 'CapCut or Adobe Premiere Rush', why: 'Short-form video editing for Reels and YouTube Shorts' },
        { skill: 'Later or Buffer', why: 'Scheduling and analytics for social media content' },
        { skill: 'Google Analytics', why: 'Tracking traffic from social media to website' },
      ],
      proofOfWork: [
        { skill: 'Content Portfolio', why: '10-20 pieces of actual content you have created and published' },
        { skill: 'Content Calendar (1 Month)', why: 'Demonstrates planning, consistency, and strategic thinking' },
        { skill: 'Engagement Analysis', why: 'Showing you track and learn from performance data' },
        { skill: 'Brand Voice Guide', why: 'Documenting how a brand should communicate across platforms' },
      ],
      bonus: [
        { skill: 'SEO for Content', why: 'Writing content that ranks on Google extends your reach' },
        { skill: 'Newsletter Writing', why: 'Email newsletters are making a comeback — rare skill among interns' },
        { skill: 'Podcast Editing (Basic)', why: 'Audio content is growing — rare skill that stands out' },
        { skill: 'UGC Strategy', why: 'User-generated content is high ROI — brands want interns who understand it' },
      ]
    },
    learningResources: [
      { label: 'HubSpot Content Marketing Certification (Free)', url: 'https://academy.hubspot.com/courses/content-marketing' },
      { label: 'Canva Design School (Free)', url: 'https://www.canva.com/learn/' },
      { label: 'Copyblogger — Free Copywriting Resources', url: 'https://copyblogger.com' },
    ]
  },
  'investment-research': {
    skillMap: {
      core: [
        { skill: 'Equity Research Basics', why: 'Analyzing companies from an investment perspective' },
        { skill: 'Financial Statement Analysis', why: 'Reading annual reports and quarterly results is daily work' },
        { skill: 'Industry Analysis', why: 'Understanding competitive dynamics and growth drivers of sectors' },
        { skill: 'Investment Thesis Writing', why: 'Articulating why a stock is a buy/sell/hold clearly' },
      ],
      tools: [
        { skill: 'MS Excel (Advanced)', why: 'DCF models, comparable analysis, sensitivity tables' },
        { skill: 'Bloomberg Terminal (Basic)', why: 'Industry standard for investment research data' },
        { skill: 'Screener.in or Tickertape', why: 'Free Indian market research tools used by analysts' },
        { skill: 'PowerPoint', why: 'Equity research reports and investment memos' },
      ],
      proofOfWork: [
        { skill: 'Stock Pitch Deck', why: 'The gold standard proof of investment research capability' },
        { skill: 'DCF Valuation Model', why: 'Shows quantitative finance skills' },
        { skill: 'Sector Report', why: 'Deep analysis of an entire industry — impressive and shareable' },
        { skill: 'Investment Memo (1-pager)', why: 'Concise, well-reasoned investment thesis on a company' },
      ],
      bonus: [
        { skill: 'CFA Level 1 (registered)', why: 'Significant credibility signal for investment roles' },
        { skill: 'Options and Derivatives Basics', why: 'Valued at hedge funds and prop trading firms' },
        { skill: 'Macroeconomics', why: 'Top-down investment analysis requires macro understanding' },
        { skill: 'Python for Finance', why: 'Quantitative analysis using pandas and numpy' },
      ]
    },
    learningResources: [
      { label: 'Zerodha Varsity — Complete Stock Markets', url: 'https://zerodha.com/varsity/' },
      { label: 'CFI Investment Banking (Free modules)', url: 'https://corporatefinanceinstitute.com' },
      { label: 'Damodaran Online — Free Valuation Resources', url: 'http://pages.stern.nyu.edu/~adamodar/' },
    ]
  },
  'strategy-intern': {
    skillMap: {
      core: [
        { skill: 'Strategic Frameworks', why: "SWOT, Porter's 5 Forces, BCG Matrix — expected in strategy interviews" },
        { skill: 'Market Sizing', why: 'TAM/SAM/SOM analysis is core to any strategy role' },
        { skill: 'Hypothesis-Driven Problem Solving', why: 'The consulting approach to breaking down complex problems' },
        { skill: 'Executive Storytelling', why: 'Presenting strategic recommendations clearly to leadership' },
      ],
      tools: [
        { skill: 'PowerPoint (Advanced)', why: 'Strategy decks are the primary deliverable' },
        { skill: 'MS Excel', why: 'Market sizing models and financial analysis' },
        { skill: 'Miro or Figma (Basic)', why: 'Strategy mapping and visual frameworks' },
        { skill: 'Research Tools (Statista, IBEF)', why: 'Finding credible market data for strategy work' },
      ],
      proofOfWork: [
        { skill: 'Strategy Case Study', why: 'Analysis of a real business strategy decision' },
        { skill: 'Market Entry Analysis', why: 'Should a company enter X market? Full analysis.' },
        { skill: 'Competitive Positioning Map', why: 'Visual mapping of competitors by key dimensions' },
        { skill: '5-Slide Strategy Deck', why: 'Demonstrates ability to synthesize and communicate strategy' },
      ],
      bonus: [
        { skill: 'Case Interview Preparation', why: 'Strategy roles at consulting firms require case interview skills' },
        { skill: 'M&A Basics', why: 'Mergers and acquisitions context is valued in corporate strategy' },
        { skill: 'OKR Framework', why: 'Translating strategy into measurable goals' },
        { skill: 'Design Thinking', why: 'Human-centered strategy approach increasingly valued' },
      ]
    },
    learningResources: [
      { label: 'McKinsey Insights — Free Articles', url: 'https://www.mckinsey.com/insights' },
      { label: 'Case in Point — Consulting Case Prep', url: 'https://www.caseinterview.com' },
      { label: 'Coursera — Business Strategy (audit free)', url: 'https://www.coursera.org/learn/business-strategy' },
    ]
  },
  'consulting-big4': {
    skillMap: {
      core: [
        { skill: 'Case Interview Skills', why: 'Big 4 consulting interviews are case-based — non-negotiable' },
        { skill: 'Structured Communication', why: 'MECE thinking and pyramid principle for all communication' },
        { skill: 'Client Management Basics', why: 'Understanding how to manage client expectations and relationships' },
        { skill: 'Data Interpretation', why: 'Turning data into insights and recommendations quickly' },
      ],
      tools: [
        { skill: 'PowerPoint (Advanced)', why: 'Consulting decks are the primary client deliverable' },
        { skill: 'MS Excel (Advanced)', why: 'Data analysis, financial modeling, and client reporting' },
        { skill: 'MS Word', why: 'Detailed reports and proposals for some practice areas' },
        { skill: 'Alteryx or Tableau (Basic)', why: 'Data analytics tools used by Big 4 advisory teams' },
      ],
      proofOfWork: [
        { skill: 'Case Competition Entry', why: 'Direct proof of consulting skills — even without winning' },
        { skill: 'Consulting Deck (5-7 slides)', why: 'A well-structured problem-solution deck for a real business issue' },
        { skill: 'Market Entry Report', why: 'Classic consulting deliverable showing structured analysis' },
        { skill: 'Process Improvement Analysis', why: 'Operations consulting work — very common at Big 4' },
      ],
      bonus: [
        { skill: 'Industry Specialization', why: 'Deep knowledge of one sector (BFSI, retail, healthcare) is valued' },
        { skill: 'Digital Transformation Basics', why: 'Most Big 4 consulting is increasingly tech-adjacent' },
        { skill: 'Change Management Basics', why: 'EY, KPMG, Deloitte all have change management practices' },
        { skill: 'Risk & Compliance Fundamentals', why: 'Big 4 audit and advisory roles require compliance basics' },
      ]
    },
    learningResources: [
      { label: 'Case in Point — Free Case Interview Resources', url: 'https://www.caseinterview.com' },
      { label: 'PrepLounge — Free Consulting Resources', url: 'https://www.preplounge.com' },
      { label: 'Big 4 Careers Official Pages — Deloitte, EY, KPMG, PwC', url: 'https://www2.deloitte.com/global/en/careers.html' },
    ]
  },
  'chief-of-staff': {
    skillMap: {
      core: [
        { skill: 'Executive Judgment', why: 'Deciding what escalates to the founder vs what you handle' },
        { skill: 'Project Management', why: 'Running multiple workstreams simultaneously without dropping any' },
        { skill: 'Information Synthesis', why: 'Condensing complex updates into clear, actionable summaries' },
        { skill: 'Strategic Prioritization', why: 'Helping the founder focus on the highest-leverage activities' },
      ],
      tools: [
        { skill: 'Notion (Advanced)', why: 'Building and managing the company OS — wikis, trackers, databases' },
        { skill: 'Google Workspace', why: 'Calendar management, docs, sheets — daily tools' },
        { skill: 'Slack + Loom', why: 'Async communication tools used at most startups' },
        { skill: 'Linear or Asana', why: 'Project tracking across multiple teams' },
      ],
      proofOfWork: [
        { skill: 'Company Wiki / SOP Library', why: 'Building documentation systems is core CoS work' },
        { skill: 'Meeting Cadence Design', why: 'Structuring how a team communicates and makes decisions' },
        { skill: 'OKR Implementation', why: 'Setting up goal tracking for a team or company' },
        { skill: 'Executive Weekly Report', why: 'Synthesizing key metrics and updates for leadership' },
      ],
      bonus: [
        { skill: 'Fundraising Basics', why: 'CoS often supports the founder in investor relations' },
        { skill: 'Hiring Process Design', why: 'Many CoS roles involve building the recruitment funnel' },
        { skill: 'Board Meeting Preparation', why: 'Preparing materials for board meetings is common CoS work' },
        { skill: 'Financial Literacy', why: 'Understanding unit economics and runway is expected at this level' },
      ]
    },
    learningResources: [
      { label: 'Chief of Staff Network — Free Resources', url: 'https://chiefofstaff.network' },
      { label: 'First Round Review — Operations & Scaling', url: 'https://review.firstround.com' },
      { label: "Lenny's Newsletter — Startup Operations", url: 'https://www.lennysnewsletter.com' },
    ]
  },
  'growth-marketing': {
    skillMap: {
      core: [
        { skill: 'Growth Loops Thinking', why: 'Understanding how products grow through acquisition, activation, retention' },
        { skill: 'A/B Testing Basics', why: 'Running experiments to improve conversion rates' },
        { skill: 'Funnel Analysis', why: 'Identifying where users drop off and why' },
        { skill: 'Data-Driven Marketing', why: 'Every growth decision should be backed by data' },
      ],
      tools: [
        { skill: 'Google Analytics (Advanced)', why: 'The primary tool for tracking website traffic and conversion' },
        { skill: 'Meta Ads Manager', why: 'Running performance marketing campaigns on Facebook/Instagram' },
        { skill: 'Google Ads (Basic)', why: 'Search and display advertising fundamentals' },
        { skill: 'Mixpanel or Amplitude (Basic)', why: 'Product analytics tools used by growth teams' },
      ],
      proofOfWork: [
        { skill: 'Paid Campaign Analysis', why: 'Running or analyzing a real/mock paid campaign with metrics' },
        { skill: 'Conversion Funnel Audit', why: 'Identifying drop-off points and recommending improvements' },
        { skill: 'Growth Experiment Design', why: 'Designing an A/B test with hypothesis and success metrics' },
        { skill: 'SEO Audit', why: 'Technical and content SEO analysis for a website' },
      ],
      bonus: [
        { skill: 'SQL for Marketing Analytics', why: 'Pulling marketing data without depending on the data team' },
        { skill: 'Email Automation', why: 'Building drip campaigns in Mailchimp or Klaviyo' },
        { skill: 'Influencer Marketing Basics', why: 'High ROI channel for D2C brands — growing expectation' },
        { skill: 'Referral Program Design', why: 'Viral growth mechanics are valued at product-led growth companies' },
      ]
    },
    learningResources: [
      { label: 'Reforge Growth Series (some free content)', url: 'https://www.reforge.com' },
      { label: 'Google Analytics Academy (Free)', url: 'https://analytics.google.com/analytics/academy/' },
      { label: 'CXL Institute — Free Growth Marketing Courses', url: 'https://cxl.com/institute/' },
    ]
  },
  'partnerships-intern': {
    skillMap: {
      core: [
        { skill: 'Partnership Strategy', why: 'Understanding what makes a good partner and how to structure deals' },
        { skill: 'Relationship Management', why: 'Maintaining long-term relationships with external stakeholders' },
        { skill: 'Deal Structuring Basics', why: 'Revenue share, co-marketing, integration partnerships — each has structure' },
        { skill: 'Prospecting', why: 'Identifying the right partners to approach' },
      ],
      tools: [
        { skill: 'LinkedIn (Advanced)', why: 'Primary tool for finding and reaching partnership contacts' },
        { skill: 'CRM Tools', why: 'Tracking partnership pipeline and relationship history' },
        { skill: 'Google Sheets', why: 'Partnership trackers, contact lists, deal terms' },
        { skill: 'Notion', why: 'Partnership SOPs and documentation' },
      ],
      proofOfWork: [
        { skill: 'Partnership Proposal Deck', why: 'A structured proposal for a specific partnership opportunity' },
        { skill: 'Partner Landscape Map', why: 'Mapping potential partners in a specific ecosystem' },
        { skill: 'Cold Outreach Campaign', why: 'Reaching out to partners and tracking results' },
        { skill: 'Partnership One-Pager', why: 'A concise document explaining the value of partnering with your company' },
      ],
      bonus: [
        { skill: 'Contract Basics', why: 'Understanding MoUs and partnership agreements' },
        { skill: 'Co-marketing Campaign Design', why: 'Joint campaigns with partners are a common deliverable' },
        { skill: 'API/Integration Basics', why: 'Tech partnerships often involve integration discussions' },
        { skill: 'Channel Sales', why: 'Understanding how partners resell or distribute your product' },
      ]
    },
    learningResources: [
      { label: 'Partnership Leaders — Free Resources', url: 'https://partnershipleaders.com' },
      { label: 'HubSpot Partner Program Training', url: 'https://academy.hubspot.com' },
      { label: 'Coursera — Successful Negotiation (audit free)', url: 'https://www.coursera.org/learn/negotiation' },
    ]
  },
  'project-management': {
    skillMap: {
      core: [
        { skill: 'Project Planning', why: 'Defining scope, timeline, resources, and milestones before execution' },
        { skill: 'Risk Management Basics', why: 'Identifying what could go wrong and building contingencies' },
        { skill: 'Stakeholder Communication', why: 'Keeping all parties informed and aligned throughout a project' },
        { skill: 'Scope Management', why: 'Preventing scope creep and managing change requests' },
      ],
      tools: [
        { skill: 'Asana or Jira', why: 'Most companies use one of these for project tracking' },
        { skill: 'MS Project or Smartsheet', why: 'Traditional PM tools used at larger organizations' },
        { skill: 'Google Sheets', why: 'Simple project trackers and Gantt charts' },
        { skill: 'Miro', why: 'Visual project planning and retrospectives' },
      ],
      proofOfWork: [
        { skill: 'Project Plan with Gantt Chart', why: 'Structured timeline with dependencies and milestones' },
        { skill: 'Project Post-Mortem', why: 'Analyzing what went well and what to improve after a project' },
        { skill: 'Risk Register', why: 'Documenting risks, probability, impact, and mitigation' },
        { skill: 'RACI Matrix', why: 'Responsibility assignment for a complex multi-team project' },
      ],
      bonus: [
        { skill: 'Agile/Scrum Certification (free)', why: 'Scrum Master basics are valued even for non-tech PM roles' },
        { skill: 'PMP Fundamentals', why: 'Understanding PMI framework signals serious PM intent' },
        { skill: 'Change Management', why: 'Managing people through project-driven change' },
        { skill: 'Budget Management', why: 'Tracking project costs against budget is core PM responsibility' },
      ]
    },
    learningResources: [
      { label: 'Google Project Management Certificate (audit free)', url: 'https://www.coursera.org/professional-certificates/google-project-management' },
      { label: 'PMI Free Resources', url: 'https://www.pmi.org/learning/library' },
      { label: 'Asana Academy (Free)', url: 'https://academy.asana.com' },
    ]
  },
}

// ──────────────────────── PROJECT DATA ────────────────────────
const projectData: Record<string, Project[]> = {
  'marketing-intern': [
    {
      id: 'mock-instagram-campaign',
      title: 'Build a Mock Instagram Campaign for a D2C Brand',
      description: 'Plan and execute a complete Instagram campaign for a real D2C brand of your choice.',
      difficulty: 'Beginner', time: '3-4 hours',
      context: "D2C brands live and die by their Instagram presence. Every marketing intern at a D2C startup will be expected to manage content, plan campaigns, and track engagement. This project proves you can do it before day one.",
      steps: [
        'Choose a real D2C brand in India (Sugar Cosmetics, Mamaearth, Bombay Shaving Co., etc.)',
        "Research their current Instagram — what are they posting, what performs well, what's missing?",
        'Define a campaign objective (e.g. "Increase engagement by 20% in 30 days")',
        'Identify their target audience — age, interests, pain points, aspirations',
        'Create a 5-post content calendar for 2 weeks — theme, caption, visual direction, posting time for each',
        'Write all 5 captions (real, polished, brand-appropriate)',
        'Create 2-3 actual post designs using Canva',
        'Define 3 KPIs you would track and explain why',
        'Write a 1-page campaign brief summarizing everything',
      ],
      output: 'A complete campaign brief (1 page) + 2-3 Canva designs + 5 written captions + content calendar. Package as PDF.',
      showcase: 'Upload the PDF to Google Drive and link it on your resume under Projects. Share individual posts on LinkedIn with a caption explaining your process.',
      resumeBullet: 'Developed a 2-week mock Instagram campaign for [Brand], including audience research, content calendar, 5 post designs, and KPI framework — packaged as a campaign brief',
      linkedinPost: "Just completed a mock Instagram campaign for [Brand] as a personal project.\n\nHere's what I built:\n→ Full audience research\n→ 2-week content calendar\n→ 5 post designs in Canva\n→ Caption writing\n→ KPI framework\n\nThe biggest learning: [your insight here]\n\nHappy to share the full brief with anyone interested. Drop a comment! 👇\n\n#Marketing #D2C #MarketingIntern #BeyondCampus",
    },
    {
      id: 'competitor-analysis-mkt',
      title: 'Competitive Analysis — Pick an Industry, Map the Players',
      description: 'Build a structured competitor analysis for a brand or industry of your choice.',
      difficulty: 'Beginner', time: '2-3 hours',
      context: "Market research and competitive analysis is the first thing most marketing interns are asked to do. This project builds exactly that muscle — and the output is something you can show in every interview.",
      steps: [
        "Pick an industry you're genuinely interested in (EdTech, D2C skincare, Fintech, Food delivery, etc.)",
        'Identify 5 major players in that industry',
        'For each company, research: target audience, pricing, key marketing channels, recent campaigns, social media presence, differentiation',
        'Build a comparison table in Excel or Google Sheets covering all 5 companies across 8-10 parameters',
        'Identify 3 gaps or opportunities that none of them are addressing well',
        'Write a 1-page "So What?" summary — what does this mean for a brand trying to enter this space?',
      ],
      output: 'A structured Excel/Sheets comparison table + 1-page insight summary. Clean, professional formatting.',
      showcase: 'Screenshot the table and summary, upload as PDF, link on resume. Also great LinkedIn content — share your key finding as a post.',
      resumeBullet: 'Conducted competitive analysis across 5 [industry] brands, mapping positioning, pricing, and marketing channels — identified 3 market gaps in a structured insight report',
      linkedinPost: "I spent 3 hours mapping the [industry] market in India.\n\nHere's what I found:\n→ [Finding 1]\n→ [Finding 2]\n→ [Finding 3]\n\nThe most underrated opportunity: [your insight]\n\nFull analysis available — comment \"send\" and I'll share it.\n\n#Marketing #MarketResearch #[Industry]",
    },
    {
      id: 'email-campaign-mkt',
      title: 'Design a 3-Email Welcome Sequence for a Brand',
      description: 'Write and design a complete email onboarding sequence for a real or hypothetical brand.',
      difficulty: 'Intermediate', time: '3-4 hours',
      context: 'Email marketing has the highest ROI of any marketing channel. Most startups have terrible onboarding emails. This project proves you understand customer journeys and can write compelling copy.',
      steps: [
        'Choose a brand (real or hypothetical) — ideally a D2C or SaaS product',
        'Define the customer: who just signed up, what do they want, what are they worried about?',
        'Plan 3 emails: Email 1 (Welcome + immediate value), Email 2 (Educate + build trust), Email 3 (Convert)',
        'Write the subject line, preview text, and full body copy for all 3 emails',
        "Use Canva or Mailchimp's free template builder to design the emails visually",
        'Define the sending schedule (Day 0, Day 3, Day 7 — and why)',
        'Write a brief explaining your strategy and expected open/click rates',
      ],
      output: '3 fully written emails with subject lines + visual designs + strategic brief.',
      showcase: 'Screenshot the emails, compile into PDF, link on resume and LinkedIn.',
      resumeBullet: 'Designed a 3-email welcome sequence for [Brand], including copywriting, visual design, and send schedule — targeting [X]% open rate based on industry benchmarks',
      linkedinPost: "Most welcome emails are terrible.\n\nI designed what a good 3-email sequence looks like for [Brand].\n\nEmail 1: [hook]\nEmail 2: [hook]\nEmail 3: [hook]\n\nKey principle I followed: [your insight]\n\nDrop a comment if you want to see the full sequence 👇",
    },
    {
      id: 'social-media-audit-mkt',
      title: "Social Media Audit — Find What a Brand is Doing Wrong",
      description: "Audit a real brand's social media presence and write an actionable improvement report.",
      difficulty: 'Intermediate', time: '2-3 hours',
      context: "Marketing interns are often asked to audit content performance and suggest improvements. This project is the most directly transferable to day-one intern work.",
      steps: [
        "Choose a brand with an active Instagram/LinkedIn presence",
        "Analyze their last 30 posts: what types perform best, what flops, what's consistent",
        "Check posting frequency, caption quality, hashtag strategy, engagement rate, response to comments",
        'Benchmark against 2 competitors doing it better',
        'Identify 5 specific improvements with examples of what to do instead',
        'Write a 1-2 page audit report with screenshots and data',
      ],
      output: 'A structured audit report (1-2 pages) with screenshots, data, and 5 actionable recommendations.',
      showcase: 'Extremely shareable LinkedIn content. Post your key finding as a carousel. Link the full report on your resume.',
      resumeBullet: 'Conducted social media audit for [Brand] across 30 posts, benchmarked against competitors, and developed 5 actionable recommendations to improve engagement rate',
      linkedinPost: "I audited [Brand]'s Instagram so you don't have to.\n\nHere's what they're doing wrong:\n→ [Issue 1]\n→ [Issue 2]\n→ [Issue 3]\n\nAnd here's exactly how to fix it:\n→ [Fix 1]\n→ [Fix 2]\n→ [Fix 3]\n\nFull audit report in comments 👇\n\n#Marketing #SocialMedia #ContentStrategy",
    },
    {
      id: 'gtm-strategy-mkt',
      title: 'Build a Go-To-Market Strategy for a New Product',
      description: 'Create a complete GTM strategy for a new product launch — real or hypothetical.',
      difficulty: 'Advanced', time: '5-6 hours',
      context: 'GTM strategy is what separates junior marketers from strategic ones. This project demonstrates business thinking, not just execution — and will stand out in consulting and Founder\'s Office interviews too.',
      steps: [
        'Choose a product to launch — real upcoming product or hypothetical in a space you understand',
        'Define the target customer segment with specifics (demographics, psychographics, jobs-to-be-done)',
        'Define the value proposition — what problem does it solve, how is it different, why now?',
        'Map the customer journey from awareness to purchase',
        'Choose 3 marketing channels and justify why each one for this product',
        'Plan the launch timeline — pre-launch, launch week, post-launch',
        'Define success metrics and how you would track them',
        'Compile into a 3-5 slide GTM deck',
      ],
      output: 'A 3-5 slide GTM strategy deck (PowerPoint or Canva). Professional, visual, concise.',
      showcase: 'Interview gold. Bring the deck to every marketing/Founder\'s Office interview. Link on resume and share on LinkedIn.',
      resumeBullet: 'Developed a go-to-market strategy for [Product], covering customer segmentation, value proposition, channel selection, launch timeline, and success metrics — compiled into a 5-slide strategy deck',
      linkedinPost: "I built a full go-to-market strategy for [Product] as a personal project.\n\nHere's the 30-second version:\n\nTarget customer: [who]\nCore problem: [what]\nWhy now: [why]\nTop 3 channels: [which]\nLaunch in: [timeline]\n\nFull 5-slide deck available — comment \"GTM\" and I'll send it over.\n\n#Marketing #GTM #Strategy #ProductMarketing",
    },
  ],
  'business-analyst': [
    {
      id: 'excel-dashboard-ba',
      title: 'Build a Business Performance Dashboard in Excel',
      description: 'Create a real Excel dashboard tracking key business metrics for a hypothetical company.',
      difficulty: 'Beginner', time: '3-4 hours',
      context: 'The first task most BA interns get is "build me a dashboard." This project proves you can do it before you walk in the door.',
      steps: [
        'Choose a business type (e-commerce, SaaS, restaurant chain, etc.)',
        'Define 8-10 KPIs that matter for that business (revenue, CAC, churn, AOV, etc.)',
        'Create a sample dataset with 3 months of realistic data',
        'Build pivot tables summarizing the data by week and month',
        'Create 3 charts: revenue trend, KPI comparison, and one custom insight',
        'Build a summary tab with key numbers highlighted using conditional formatting',
        'Add a "So What?" section: what do these numbers tell the business?',
      ],
      output: 'A clean Excel file with raw data tab, pivot tables, charts, and summary dashboard.',
      showcase: 'Screenshot the dashboard, share on LinkedIn as an image. Link the file on Google Drive in your resume.',
      resumeBullet: 'Built a business performance dashboard in Excel tracking 10 KPIs for a hypothetical e-commerce business, including pivot tables, trend charts, and an executive summary',
      linkedinPost: "Built a business performance dashboard in Excel from scratch today.\n\nTracked 10 KPIs for a mock e-commerce business:\n→ Revenue trend\n→ Customer acquisition cost\n→ Monthly churn rate\n→ Average order value\n\nBiggest insight from the data: [your finding]\n\nFile available — comment \"dashboard\" and I'll share it.\n\n#BusinessAnalyst #Excel #DataAnalysis",
    },
    {
      id: 'process-improvement-ba',
      title: 'Map and Improve a Business Process',
      description: 'Document a real business process and propose measurable improvements.',
      difficulty: 'Intermediate', time: '3-4 hours',
      context: 'Process improvement is core BA work. This project shows you can identify inefficiencies and propose solutions — exactly what companies hire BAs to do.',
      steps: [
        'Choose a process you can research (college admission, food delivery complaints, hotel check-in, etc.)',
        'Map the current process as a flowchart — every step, every decision point',
        'Identify at least 3 inefficiencies or pain points',
        'Propose an improved process with inefficiencies removed',
        'Map the improved process as a second flowchart',
        'Quantify the improvement: "reduces steps from 12 to 8, saving X minutes per customer"',
        'Write a 1-page process improvement proposal',
      ],
      output: 'Two process flowcharts (before/after) + 1-page improvement proposal with quantified impact.',
      showcase: 'Extremely strong resume project. Present in any BA interview when asked about process improvement.',
      resumeBullet: 'Mapped and redesigned [process] for [company type], identifying 3 inefficiencies and proposing improvements that reduce steps by 33% and save approximately [X] minutes per transaction',
      linkedinPost: "I mapped out [process] from start to finish and found 3 things that shouldn't exist.\n\nProblem 1: [issue] → Fix: [solution]\nProblem 2: [issue] → Fix: [solution]\nProblem 3: [issue] → Fix: [solution]\n\nResult: Process reduced from [X] steps to [Y] steps.\n\nFull before/after flowchart in comments 👇\n\n#BusinessAnalyst #ProcessImprovement",
    },
    {
      id: 'market-sizing-ba',
      title: 'Market Sizing Exercise — How Big is This Market?',
      description: 'Calculate the market size for a real product category using a structured bottom-up approach.',
      difficulty: 'Beginner', time: '2 hours',
      context: 'Market sizing is asked in almost every BA and consulting interview. This project gives you a real, practiced answer you can reference confidently.',
      steps: [
        'Choose a market to size (e.g. online education in India, food delivery in Tier-2 cities, EV market)',
        'Define the market clearly — who is the customer, what is the product, what geography?',
        'Use a bottom-up approach: start with population, filter down to target segment, estimate penetration and spend',
        'Calculate TAM, SAM, SOM',
        'Cross-check with top-down: find a published market size and see if your estimate is in the right range',
        'Document all assumptions clearly',
        'Present as a one-page structured calculation',
      ],
      output: 'A structured market sizing document with TAM/SAM/SOM calculations, assumptions, and cross-check.',
      showcase: 'Bring this to interviews. "Tell me about a market you\'ve sized" is a common BA question.',
      resumeBullet: 'Conducted market sizing analysis for [market] using bottom-up methodology, estimating TAM of [X], SAM of [Y], and SOM of [Z] with documented assumptions',
      linkedinPost: "How big is the [market] in India?\n\nI sized it. Here's what I found:\n\nTAM: [X]\nSAM: [Y]\nSOM: [Z]\n\nKey assumption that drove the number: [assumption]\n\nWould love to hear if you'd approach this differently 👇\n\n#BusinessAnalyst #MarketSizing #Strategy",
    },
    {
      id: 'business-case-ba',
      title: 'Write a Business Case for a Real Decision',
      description: 'Build a complete business case document for a real business decision.',
      difficulty: 'Advanced', time: '4-5 hours',
      context: 'Business cases are how organizations justify investments and decisions. Writing one from scratch is advanced BA work that most interns have never done.',
      steps: [
        'Choose a real business decision to justify (e.g. should a restaurant chain expand to a new city? should an EdTech company add live classes?)',
        'Define the problem and the proposed solution clearly',
        'Analyze alternatives: at least 3 options including "do nothing"',
        'Financial analysis: estimate costs, revenues, and ROI for the recommended option',
        'Risk analysis: what could go wrong, probability, and mitigation',
        'Implementation plan: high-level timeline and key milestones',
        'Recommendation: clear, justified, actionable',
      ],
      output: 'A complete business case document (3-5 pages) with problem statement, alternatives, financials, risks, and recommendation.',
      showcase: 'This is the most impressive project a BA candidate can show. Use it as your primary interview artifact.',
      resumeBullet: 'Developed a business case for [decision] at [company type], including alternatives analysis, financial modeling (ROI: [X]%), risk assessment, and implementation roadmap',
      linkedinPost: "I built a business case for [decision] from scratch.\n\nHere's the structure I used:\n1. Problem definition\n2. Three alternatives\n3. Financial analysis (ROI)\n4. Risk assessment\n5. Recommendation\n\nConclusion: [your recommendation and why]\n\nDocument available — DM me \"business case\" and I'll share it.\n\n#BusinessAnalyst #Strategy #BusinessCase",
    },
  ],
  'finance-intern': [
    {
      id: 'financial-model-fi',
      title: 'Build a 3-Statement Financial Model from Scratch',
      description: 'Create a fully linked income statement, balance sheet, and cash flow model in Excel.',
      difficulty: 'Intermediate', time: '4-5 hours',
      context: 'A 3-statement model is the gold standard of finance capability. If you can build one cleanly, you can do most finance intern work on day one.',
      steps: [
        'Choose a public Indian company (Zomato, Nykaa, Delhivery, etc.) — use their annual report for data',
        'Build the Income Statement — revenue, COGS, gross profit, EBITDA, net income',
        'Build the Balance Sheet — assets, liabilities, equity (ensure it balances)',
        'Build the Cash Flow Statement — operations, investing, financing activities',
        'Link all three statements so they flow automatically',
        'Add simple assumptions section — revenue growth rate, margin assumptions',
        'Build a 3-year forecast using your assumptions',
        'Add a summary dashboard tab with key financial ratios',
      ],
      output: 'A clean, fully linked 3-statement Excel model with historical data + 3-year forecast + ratio dashboard.',
      showcase: 'This is the most powerful finance project you can show. Send the file in interviews. Link it on LinkedIn.',
      resumeBullet: 'Built a 3-statement financial model for [Company] in Excel, linking income statement, balance sheet, and cash flow with a 3-year forecast based on documented assumptions',
      linkedinPost: "Built my first 3-statement financial model from scratch today.\n\nCompany: [Company]\n\nWhat I modeled:\n→ Income statement (3 years historical + 3 year forecast)\n→ Fully linked balance sheet\n→ Cash flow statement\n→ Key ratio dashboard\n\nBiggest learning: [insight about the company's financials]\n\nModel available for download — comment \"model\" below.\n\n#Finance #FinancialModeling #Excel",
    },
    {
      id: 'stock-pitch-fi',
      title: 'Write a Stock Pitch — Buy, Sell, or Hold?',
      description: 'Research a listed company and write a structured investment recommendation.',
      difficulty: 'Intermediate', time: '3-4 hours',
      context: 'Stock pitches are asked in finance, investment banking, and research interviews. They demonstrate financial analysis, business judgment, and communication skills simultaneously.',
      steps: [
        'Choose a listed Indian company you find interesting',
        'Read their latest annual report and last 4 quarterly results',
        'Understand the business: what do they do, how do they make money, who are the customers',
        'Analyze the financials: revenue growth, margins, debt, cash flow trends',
        'Assess the valuation: P/E, EV/EBITDA compared to peers',
        'Identify 3 key investment thesis points (why buy/sell)',
        'Identify 3 key risks',
        'Make a clear recommendation with a 12-month target price',
        'Compile into a 1-2 page investment memo or 5-slide pitch deck',
      ],
      output: 'A 1-2 page investment memo OR a 5-slide pitch deck with company overview, thesis, financials, valuation, and recommendation.',
      showcase: 'Bring this to every finance and investment interview. "Walk me through a stock pitch" is almost guaranteed.',
      resumeBullet: 'Prepared investment research memo on [Company], analyzing financial performance, peer valuation, and growth drivers — recommending [Buy/Hold/Sell] with [X]% upside to target price',
      linkedinPost: "I pitched [Company] — here's my 60-second investment thesis:\n\nWhat they do: [one line]\nWhy I'm bullish/bearish: [reason]\nKey risk: [risk]\nTarget price: [X] (vs current [Y] = [Z]% upside)\n\nFull 5-slide pitch deck available — comment \"pitch\" and I'll send it.\n\n#Finance #Investing #StockPitch",
    },
    {
      id: 'industry-report-fi',
      title: 'Write a Sector Analysis Report',
      description: 'Research and write a structured analysis of an entire industry or sector.',
      difficulty: 'Beginner', time: '3-4 hours',
      context: 'Sector analysis is standard work for finance and research interns. This project proves you can synthesize complex information into clear, actionable insights.',
      steps: [
        'Choose a sector (BFSI, retail, FMCG, pharma, EdTech, etc.)',
        'Research sector size, growth rate, and key trends',
        'Map the major players — market share, positioning, recent performance',
        'Analyze key drivers: what makes companies in this sector succeed or fail?',
        'Identify 3 key risks facing the sector',
        'Identify 2-3 most interesting companies in the sector and why',
        'Write a 2-3 page sector report with an executive summary',
      ],
      output: 'A structured 2-3 page sector analysis report with executive summary, company profiles, and outlook.',
      showcase: 'Great for LinkedIn (share your key finding as a post). Link the full report on resume.',
      resumeBullet: 'Authored a sector analysis report on the [sector] industry, covering market dynamics, competitive landscape, key risks, and investment outlook across [X] major players',
      linkedinPost: "I spent a weekend analyzing the [sector] sector in India.\n\nHere are my 5 key findings:\n1. [Finding]\n2. [Finding]\n3. [Finding]\n4. [Finding]\n5. [Finding]\n\nMost underrated company in the space: [company] — here's why: [reason]\n\nFull report in comments 👇\n\n#Finance #Research #[Sector]",
    },
    {
      id: 'budget-tracker-fi',
      title: 'Build a Budget vs Actual Tracker for a Business',
      description: 'Create a monthly budget tracking model that compares planned vs actual performance.',
      difficulty: 'Beginner', time: '2-3 hours',
      context: 'Budget vs actual analysis is the most common FP&A task. This project directly simulates what finance interns do in their first week.',
      steps: [
        'Choose a business type (restaurant, startup, retail store)',
        'Define 10-12 budget line items (revenue, COGS, salaries, rent, marketing, etc.)',
        'Create "budget" numbers for 3 months (planned)',
        'Create "actual" numbers with realistic variances (some over, some under budget)',
        'Build variance analysis: absolute variance and percentage variance for each line item',
        'Add conditional formatting: red for negative variance, green for positive',
        'Write a 1-paragraph "commentary" explaining the key variances',
      ],
      output: 'A clean Excel budget vs actual model with variance analysis and written commentary.',
      showcase: 'Screenshot and share on LinkedIn. This directly shows FP&A and corporate finance capability.',
      resumeBullet: 'Built a monthly budget vs actual tracker for a hypothetical [business type], tracking 12 P&L line items with variance analysis and management commentary',
      linkedinPost: "Built a Budget vs Actual tracker in Excel today — the most common FP&A deliverable most interns have never made.\n\nHere's what it includes:\n→ 12 P&L line items\n→ Monthly budget vs actual\n→ Absolute and % variance\n→ Conditional formatting\n→ Management commentary\n\nTemplate available — comment \"budget\" and I'll share it.\n\n#Finance #FPA #Excel",
    },
  ],
  'founders-office': [
    {
      id: 'gtm-founders',
      title: 'Build a Go-To-Market Strategy for a Startup',
      description: 'Create a complete GTM strategy for a real or hypothetical early-stage startup.',
      difficulty: 'Advanced', time: '5-6 hours',
      context: "GTM strategy is the most common Founder's Office deliverable. Founders need someone who can think holistically across product, marketing, and sales — this project proves exactly that.",
      steps: [
        'Choose a startup idea or a real early-stage company',
        'Define the ICP (Ideal Customer Profile) with specificity',
        'Map the competitive landscape — who else is solving this?',
        'Define the value proposition in one clear sentence',
        'Choose the primary growth channel and justify why',
        'Plan the first 90 days of GTM execution — what happens in weeks 1, 2, 4, 8, 12?',
        'Define success metrics for each phase',
        'Build a simple unit economics model: CAC, LTV, payback period',
        'Compile into a 5-7 slide deck',
      ],
      output: 'A 5-7 slide GTM strategy deck + unit economics model in Excel.',
      showcase: "Bring this to every Founder's Office interview. It demonstrates exactly the thinking they want.",
      resumeBullet: 'Developed a go-to-market strategy for [startup], including ICP definition, competitive analysis, channel selection, 90-day execution plan, and unit economics model',
      linkedinPost: "I built a full GTM strategy for a [type] startup.\n\nHere's the one-minute version:\n\nICP: [who exactly]\nProblem: [specific pain]\nWhy us: [differentiation]\nPrimary channel: [channel + why]\nYear 1 target: [metric]\n\nUnit economics: CAC [X], LTV [Y], payback [Z] months\n\nFull deck available — comment \"GTM\" 👇\n\n#StartupStrategy #GTM #FoundersOffice",
    },
    {
      id: 'company-wiki-fo',
      title: 'Build a Company Operating System in Notion',
      description: 'Design and build a complete company OS — wiki, tracker, and meeting structure.',
      difficulty: 'Beginner', time: '3-4 hours',
      context: 'Most early-stage startups have zero documentation. Building systems is core Founder\'s Office work. This project shows you can create structure out of chaos.',
      steps: [
        'Set up a Notion workspace for a hypothetical 10-person startup',
        'Build a Company Wiki: vision, mission, values, team directory, org chart',
        'Build a Projects Tracker: current projects, owners, deadlines, status',
        'Build a Meeting Structure: weekly all-hands template, 1-1 template, retrospective template',
        'Build an OKR Tracker: company OKRs for the quarter with key results',
        'Build an Onboarding Checklist for new hires',
        'Make it visually clean and easy to navigate',
      ],
      output: 'A complete Notion workspace with 6 sections — shareable via public Notion link.',
      showcase: 'Share the public Notion link in your resume and LinkedIn. This is immediately impressive to any startup founder.',
      resumeBullet: 'Designed a complete company operating system in Notion for a hypothetical 10-person startup, including wiki, project tracker, OKR framework, meeting templates, and onboarding checklist',
      linkedinPost: "Most early-stage startups have zero documentation.\n\nI built a complete company OS in Notion — for free.\n\nWhat's inside:\n→ Company wiki (vision, values, team)\n→ Projects tracker\n→ OKR framework\n→ Meeting templates\n→ New hire onboarding\n\nPublic link in comments — duplicate it for your own startup or team 👇\n\n#Notion #StartupOps #FoundersOffice",
    },
    {
      id: 'competitive-landscape-fo',
      title: 'Map a Competitive Landscape for a Startup',
      description: 'Build a comprehensive competitive analysis for a startup in any sector.',
      difficulty: 'Intermediate', time: '3-4 hours',
      context: 'Founders constantly need to understand their competitive position. A well-structured competitive map is something most Founder\'s Office interns are asked to build in week one.',
      steps: [
        'Choose a startup sector (FinTech, EdTech, D2C health, SaaS, etc.)',
        'Identify 8-10 players: direct competitors, indirect competitors, adjacent players',
        'Research each player: funding stage, business model, target customer, key features, pricing, recent news',
        'Build a positioning map: plot companies on 2 key dimensions (e.g. price vs comprehensiveness)',
        'Identify white spaces — where is no one playing?',
        'Write a 1-page strategic summary: who is winning, why, and what the opportunity is',
        'Package as a PDF with the positioning map as the hero visual',
      ],
      output: 'A competitive landscape PDF with company profiles, positioning map, and strategic summary.',
      showcase: 'This is something you can literally hand to any founder in an interview. It demonstrates immediate value.',
      resumeBullet: 'Built a competitive landscape analysis for the [sector] startup ecosystem, mapping 10 players across positioning, business model, and funding stage — identifying 2 strategic white spaces',
      linkedinPost: "I mapped the entire [sector] startup ecosystem in India.\n\n10 players. Here's how they're positioned:\n\n[Player 1]: [position]\n[Player 2]: [position]\n[Player 3]: [position]\n\nThe white space nobody is filling: [opportunity]\n\nFull competitive map in comments 👇\n\n#Startups #Strategy #FoundersOffice",
    },
    {
      id: 'okr-framework-fo',
      title: 'Design an OKR Framework for a Startup Team',
      description: 'Build a complete OKR (Objectives and Key Results) system for a 10-person startup.',
      difficulty: 'Intermediate', time: '2-3 hours',
      context: 'OKRs are how high-performance startups set and track goals. Building one from scratch shows strategic thinking and systems design — both critical for Founder\'s Office.',
      steps: [
        'Choose a hypothetical startup (or use a real one you follow)',
        'Define 3 company-level OKRs for the quarter — ambitious but achievable',
        'For each OKR, define 3-4 measurable Key Results',
        'Break down into team OKRs for 3 functions (marketing, sales, product/ops)',
        'Show how team OKRs ladder up to company OKRs',
        'Build a tracking template in Notion or Google Sheets',
        'Write a 1-page guide on how to run the weekly OKR check-in',
      ],
      output: 'A complete OKR document with company + team OKRs + tracking template + check-in guide.',
      showcase: 'Share the framework on LinkedIn. Bring it to Founder\'s Office and ops interviews.',
      resumeBullet: 'Designed a quarterly OKR framework for a hypothetical startup, including 3 company-level objectives, team-level key results, and a tracking system with weekly check-in protocol',
      linkedinPost: "Most startup teams set goals wrong.\n\nHere's the OKR framework I built for a hypothetical 10-person startup:\n\nCompany OKR 1: [objective] → KR: [metric]\nCompany OKR 2: [objective] → KR: [metric]\nCompany OKR 3: [objective] → KR: [metric]\n\nRule I followed: every KR must be measurable and owner-assigned.\n\nFull framework in comments 👇\n\n#OKRs #StartupStrategy #FoundersOffice",
    },
  ],
  'bd-intern': [
    {
      id: 'cold-outreach-bd',
      title: 'Run a Cold Outreach Campaign — 20 Prospects, Track Results',
      description: 'Build a prospect list, write outreach messages, send them, and track results.',
      difficulty: 'Beginner', time: '3-4 hours',
      context: 'BD interns are expected to prospect and reach out from day one. This project proves you can do exactly that — and shows you track results like a professional.',
      steps: [
        'Choose a hypothetical product or service to sell (or use Beyond Campus as the example)',
        'Define the ideal customer profile — who would benefit most?',
        'Build a list of 20 real prospects using LinkedIn (companies or individuals)',
        'Write a personalized cold email or LinkedIn DM for each prospect (use a template but customize)',
        'Send all 20 outreach messages over 2-3 days',
        'Track in a spreadsheet: name, company, sent date, response (yes/no/maybe), notes',
        'After 1 week: calculate reply rate, analyze what worked and what didn\'t',
        'Write a 1-page retrospective: what you learned and what you\'d do differently',
      ],
      output: 'A prospect tracker spreadsheet (20 rows) + response analysis + retrospective document.',
      showcase: 'This is real work experience. In interviews: "I ran a 20-person outreach campaign with X% reply rate" is a powerful answer to any BD question.',
      resumeBullet: 'Executed a 20-prospect cold outreach campaign for [product/company], achieving [X]% reply rate — tracked in CRM and documented learnings in a retrospective report',
      linkedinPost: "I ran a cold outreach experiment this week.\n\n20 messages sent. Here's what happened:\n\nReply rate: [X]%\nPositive responses: [Y]\nWhat worked: [insight]\nWhat flopped: [insight]\n\nThe one change that made the biggest difference: [change]\n\nFull retrospective in comments 👇\n\n#BD #ColdOutreach #SalesStrategy",
    },
    {
      id: 'partnership-proposal-bd',
      title: 'Write a Partnership Proposal for Two Real Companies',
      description: 'Identify two companies that should partner and write a structured partnership proposal.',
      difficulty: 'Intermediate', time: '3-4 hours',
      context: 'Partnership proposals are core BD deliverables. This project proves you can identify opportunities, structure deals, and communicate value to external stakeholders.',
      steps: [
        'Identify two real companies that would benefit from partnering (e.g. a fintech app + a salary platform, a D2C brand + a logistics company)',
        'Define the partnership type: co-marketing, integration, distribution, revenue share',
        'Analyze the value for each partner — why should they do this?',
        'Define the terms of the partnership at a high level',
        'Identify potential challenges and how to address them',
        'Write the proposal as a 2-3 page document OR a 4-slide deck',
        'Include a simple financial model: what does each partner gain in numbers?',
      ],
      output: 'A 2-3 page partnership proposal OR 4-slide deck with value analysis, terms, and financial impact.',
      showcase: 'Bring this to every BD interview. "Walk me through a partnership you\'d structure" is a common question.',
      resumeBullet: 'Developed a partnership proposal for [Company A] + [Company B], structuring a [type] partnership with projected [metric] benefit for each party',
      linkedinPost: "I think [Company A] and [Company B] should partner.\n\nHere's the partnership I designed:\n\nType: [partnership type]\nValue for [A]: [benefit]\nValue for [B]: [benefit]\nEstimated impact: [metric]\n\nWhy they haven't done this yet: [your theory]\n\nFull proposal in comments — would love your thoughts 👇\n\n#BusinessDevelopment #Partnerships #Strategy",
    },
    {
      id: 'market-mapping-bd',
      title: 'Build a Partner/Client Landscape Map',
      description: 'Systematically map potential partners or clients in a specific ecosystem.',
      difficulty: 'Beginner', time: '2-3 hours',
      context: 'Market mapping is often the first BD task an intern gets. It requires research, organization, and judgment about who matters — all core BD skills.',
      steps: [
        'Choose an ecosystem to map (e.g. all EdTech platforms in India, all D2C beauty brands, all Series A FinTechs)',
        'Define the criteria for inclusion in your map',
        'Research and list 30-50 companies/people in the ecosystem',
        'For each: note company name, size, relevant contact, why they\'re a potential partner/client, how to reach them',
        'Categorize by priority: Tier 1 (best fit), Tier 2 (good fit), Tier 3 (possible fit)',
        'Build in Google Sheets with clean formatting',
        'Write a 1-paragraph "who to approach first and why" recommendation',
      ],
      output: 'A Google Sheets market map with 30-50 entries, categorized by tier, with outreach recommendation.',
      showcase: 'This is immediately useful in any BD role. Show it in interviews as proof of research and prioritization skills.',
      resumeBullet: 'Built a partner landscape map for the [ecosystem] sector, identifying 40+ potential partners categorized by strategic fit — enabling prioritized outreach to Tier 1 targets',
      linkedinPost: "Spent 2 hours mapping the [ecosystem] in India.\n\nHere's what I found:\n\nTotal players identified: [X]\nTier 1 targets (best fit): [Y]\nMost underrated company in the space: [company] — [reason]\n\nFull map available — comment \"map\" and I'll share the sheet.\n\n#BusinessDevelopment #MarketResearch #BD",
    },
    {
      id: 'pipeline-tracker-bd',
      title: 'Build a BD Pipeline Tracker in Google Sheets',
      description: 'Create a professional CRM-style pipeline tracker for a hypothetical BD function.',
      difficulty: 'Beginner', time: '2 hours',
      context: 'Managing a BD pipeline is core to the role. This project proves you understand the BD process from prospecting to closing and can organize it professionally.',
      steps: [
        'Define the BD pipeline stages: Prospect → Contacted → Interested → Proposal Sent → Negotiating → Closed Won/Lost',
        'Create a Google Sheet with columns: Company, Contact Name, Contact Email, Stage, Last Activity, Next Action, Expected Close Date, Deal Value, Notes',
        'Populate with 15 hypothetical prospects at different stages',
        'Add conditional formatting: color-code by stage',
        'Add a summary dashboard tab: total pipeline value, conversion by stage, average deal cycle',
        "Add a \"This Week's Actions\" section: what needs to happen next for each active deal",
      ],
      output: 'A professional Google Sheets pipeline tracker with 15 mock deals + summary dashboard.',
      showcase: 'Share as a screenshot on LinkedIn. This directly demonstrates BD process knowledge.',
      resumeBullet: 'Built a BD pipeline tracker in Google Sheets simulating [X] active deals across 6 stages, with conversion metrics dashboard and weekly action planning',
      linkedinPost: "Built a BD pipeline tracker in Google Sheets — no Salesforce needed.\n\nWhat's inside:\n→ 6-stage pipeline\n→ 15 mock deals\n→ Conversion metrics\n→ Weekly action planner\n\nTemplate available — comment \"pipeline\" and I'll share it.\n\n#BusinessDevelopment #BD #CRM",
    },
  ],
  'operations-intern': [
    {
      id: 'process-sop-ops',
      title: 'Write an SOP for a Business Process',
      description: 'Document a real business process as a Standard Operating Procedure.',
      difficulty: 'Beginner', time: '2-3 hours',
      context: 'SOPs are core operations deliverables. Writing a good SOP requires you to understand a process deeply enough to document it for someone who has never done it before.',
      steps: [
        'Choose a process to document (customer complaint handling, vendor onboarding, monthly reporting, etc.)',
        'Interview someone who does this process (or research thoroughly)',
        'Map every step in order — be exhaustive',
        'Identify decision points: if X happens, do Y',
        'Note tools, templates, and resources needed at each step',
        'Add common mistakes and how to avoid them',
        'Format professionally: numbered steps, clear headings, version number, owner',
      ],
      output: 'A professional SOP document (2-4 pages) with step-by-step instructions, decision trees, and resources.',
      showcase: 'Share on LinkedIn as an example of your process documentation skills.',
      resumeBullet: 'Developed a Standard Operating Procedure for [process] at [company type], documenting [X] steps with decision trees and reducing process ambiguity for new team members',
      linkedinPost: "Most processes break because nobody wrote them down.\n\nI wrote an SOP for [process] — here's the structure I used:\n\n1. Process overview (what, who, when)\n2. Step-by-step instructions\n3. Decision trees for exceptions\n4. Common mistakes to avoid\n5. Tools and templates\n\nDocument available — comment \"SOP\" and I'll share it.\n\n#Operations #ProcessDesign #SOP",
    },
    {
      id: 'ops-dashboard-ops',
      title: 'Build an Operations Dashboard for a D2C Brand',
      description: 'Create a comprehensive operations metrics dashboard tracking key performance indicators.',
      difficulty: 'Intermediate', time: '3-4 hours',
      context: 'Operations interns are often asked to build and maintain dashboards. This project proves you know which metrics matter and can present them clearly.',
      steps: [
        'Choose a D2C or e-commerce business type',
        'Define 10-12 key operations metrics (order fulfillment rate, return rate, average delivery time, inventory turnover, etc.)',
        'Create realistic sample data for 3 months',
        'Build the dashboard in Google Sheets or Excel with charts for each key metric',
        'Add a weekly trend view and a monthly summary',
        'Use conditional formatting to highlight metrics outside target range',
        'Write a 1-paragraph operations commentary: what do these numbers say about the business?',
      ],
      output: 'A clean operations dashboard with 10+ metrics, trend charts, and management commentary.',
      showcase: 'Screenshot and share on LinkedIn. Link the file on your resume.',
      resumeBullet: 'Built an operations metrics dashboard for a hypothetical D2C brand tracking 12 KPIs including fulfillment rate, return rate, and inventory turnover — with monthly trend analysis and management commentary',
      linkedinPost: "Built an operations dashboard for a D2C brand from scratch today.\n\nMetrics I tracked:\n→ Order fulfillment rate\n→ Return rate\n→ Average delivery time\n→ Inventory turnover\n\nBiggest operational issue I found in the mock data: [finding]\n\nTemplate available — comment \"ops\" and I'll share it.\n\n#Operations #Ecommerce #D2C",
    },
    {
      id: 'vendor-analysis-ops',
      title: 'Vendor Evaluation and Selection Analysis',
      description: 'Build a structured framework for evaluating and selecting between vendors.',
      difficulty: 'Intermediate', time: '2-3 hours',
      context: 'Vendor management is core operations work at any company. This project demonstrates procurement thinking, decision frameworks, and analytical skills.',
      steps: [
        'Choose a procurement decision (e.g. choosing a logistics partner, a packaging vendor, a software tool)',
        'Identify 4-5 real or hypothetical vendors to evaluate',
        'Define 8-10 evaluation criteria (price, reliability, scalability, support, etc.)',
        'Assign weights to each criterion based on importance',
        'Score each vendor on each criterion (1-5 scale)',
        'Calculate weighted scores and rank the vendors',
        'Write a 1-page recommendation with justification',
      ],
      output: 'A vendor evaluation matrix in Excel/Sheets + 1-page recommendation document.',
      showcase: 'This demonstrates structured decision-making — a key ops skill. Great for interviews.',
      resumeBullet: 'Developed a vendor evaluation framework for [procurement decision], scoring 5 vendors across 8 weighted criteria — recommending [vendor] with a total weighted score of [X]/50',
      linkedinPost: "How do you choose between 5 vendors when everyone looks similar on paper?\n\nI built a weighted scoring framework.\n\nHere's how it works:\n1. Define criteria (I used 8)\n2. Weight by importance\n3. Score each vendor\n4. Calculate weighted total\n5. Recommendation writes itself\n\nTemplate available — comment \"vendor\" and I'll share it.\n\n#Operations #Procurement #DecisionMaking",
    },
    {
      id: 'root-cause-ops',
      title: 'Root Cause Analysis — Find Why Something Broke',
      description: 'Apply root cause analysis methodology to a real or hypothetical operational failure.',
      difficulty: 'Advanced', time: '2-3 hours',
      context: 'Root cause analysis is how ops teams fix recurring problems instead of just treating symptoms. This project shows advanced operational thinking.',
      steps: [
        'Choose an operational problem (high return rates, frequent delivery delays, customer complaints, etc.)',
        'Document the problem clearly: what happened, when, how often, what impact',
        'Use the 5 Whys method: ask "why" 5 times to get to the root cause',
        'Use a Fishbone (Ishikawa) diagram to map all potential causes',
        'Identify the true root cause(s) — not just symptoms',
        'Propose 3 solutions with effort vs impact analysis',
        'Recommend the best solution and a 30-day implementation plan',
      ],
      output: 'A root cause analysis document with 5 Whys, fishbone diagram, and solution recommendation.',
      showcase: 'Present this in any operations interview when asked about problem solving.',
      resumeBullet: 'Conducted root cause analysis for [operational problem] using 5 Whys and Fishbone methodology — identifying [root cause] and proposing [solution] with estimated [X]% improvement',
      linkedinPost: "Here's how I would solve [operational problem] for a D2C brand.\n\nI used root cause analysis:\n\nSurface problem: [symptom]\nWhy? → [cause 1]\nWhy? → [cause 2]\nWhy? → [cause 3]\nWhy? → [cause 4]\nRoot cause: [actual root cause]\n\nSolution: [recommendation]\n\nFull analysis in comments 👇\n\n#Operations #RootCauseAnalysis #ProblemSolving",
    },
  ],
  'strategy-intern': [
    {
      id: 'market-entry-si',
      title: 'Market Entry Analysis — Should This Company Expand?',
      description: 'Analyze whether a real company should enter a new market, city, or product category.',
      difficulty: 'Intermediate', time: '3-4 hours',
      context: "Market entry analysis is the most classic strategy deliverable. Every strategy intern is asked some version of this question. This project gives you a real, practiced answer.",
      steps: [
        'Choose a real company and a market entry decision (e.g. should Swiggy enter grocery delivery in Tier-2 cities?)',
        'Define the opportunity: market size, growth rate, competitive landscape',
        'Analyze the company\'s current strengths and capabilities',
        'Assess the 3 key risks of entering this market',
        'Define what "success" looks like in Year 1 and Year 3',
        'Evaluate 3 strategic options: enter aggressively, enter cautiously, or don\'t enter',
        'Make a clear recommendation with rationale',
        'Compile into a 4-5 slide strategy deck',
      ],
      output: 'A 4-5 slide market entry strategy deck with opportunity analysis, risk assessment, and recommendation.',
      showcase: "Bring this to every strategy and consulting interview. 'Walk me through a market entry analysis' is almost guaranteed.",
      resumeBullet: 'Developed a market entry analysis for [Company] expanding into [market], evaluating opportunity size, competitive dynamics, and strategic fit — recommending [option] with projected [metric] in Year 1',
      linkedinPost: "Should [Company] enter [market]?\n\nI analyzed it. Here's my recommendation:\n\nOpportunity: [size + why now]\nBiggest risk: [risk]\nCompetitive moat: [advantage]\nMy call: [recommendation + why]\n\nFull 5-slide deck in comments — would love pushback 👇\n\n#Strategy #MarketEntry #BusinessStrategy",
    },
    {
      id: 'strategy-deck-si',
      title: 'Build a 5-Slide Strategy Deck for a Real Business Problem',
      description: 'Create a consulting-style strategy deck solving a real business challenge.',
      difficulty: 'Advanced', time: '4-5 hours',
      context: "Strategy decks are the primary deliverable in any strategy role. This project proves you can structure a problem, analyze it rigorously, and communicate clearly — the entire strategy job in one artifact.",
      steps: [
        'Choose a real business problem (e.g. "Why is [brand] losing market share?" or "How should [company] respond to [competitor]?")',
        'Slide 1: Problem statement — define the issue precisely with data',
        'Slide 2: Root cause analysis — what is actually driving this problem?',
        'Slide 3: Strategic options — at least 3, with pros/cons of each',
        'Slide 4: Recommendation — your preferred option with clear rationale',
        'Slide 5: Implementation — what are the first 3 steps, by when, who owns them?',
        'Design it cleanly in PowerPoint or Canva — each slide must have a single clear takeaway',
      ],
      output: 'A 5-slide consulting-style strategy deck. Professional design, clear structure, actionable recommendation.',
      showcase: "This is the single best artifact for a strategy interview. Present it as your 'one project I'm proud of'.",
      resumeBullet: "Built a 5-slide strategy deck analyzing [business problem] for [company type], structuring the problem with root cause analysis, evaluating 3 strategic options, and recommending [solution]",
      linkedinPost: "I built a consulting-style strategy deck for [business problem].\n\nHere's the structure:\n\nSlide 1: The real problem (not the surface issue)\nSlide 2: Why it's happening\nSlide 3: Three strategic options\nSlide 4: My recommendation\nSlide 5: First 90 days\n\nConclusion: [your recommendation in one sentence]\n\nFull deck available — comment 'deck' 👇\n\n#Strategy #Consulting #BusinessStrategy",
    },
    {
      id: 'competitive-map-si',
      title: 'Competitive Positioning Map for an Industry',
      description: 'Visually map how companies in an industry are positioned relative to each other.',
      difficulty: 'Beginner', time: '2 hours',
      context: "Competitive positioning maps are standard strategy tools. This project is quick, visual, and highly shareable — great for building your LinkedIn presence while proving strategic thinking.",
      steps: [
        'Choose an industry you know well or want to learn (edtech, quick commerce, SaaS, fintech, etc.)',
        'Identify 8-10 major players',
        'Choose 2 positioning dimensions that matter most (e.g. price vs quality, breadth vs depth, enterprise vs consumer)',
        'Place each company on the 2x2 matrix',
        'Write 1-2 sentences explaining each company\'s position',
        'Identify the white space — where is no one playing?',
        'Add a "So What?" takeaway: what does this mean for a new entrant or an incumbent?',
      ],
      output: 'A competitive positioning map (visual) + 1-page written analysis with strategic implications.',
      showcase: "Post on LinkedIn as an image. Extremely high engagement content. Link in resume as a strategy artifact.",
      resumeBullet: 'Created a competitive positioning map for the [industry] sector, analyzing 8 players across [dimension 1] and [dimension 2] — identifying a white space opportunity in [segment]',
      linkedinPost: "I mapped the [industry] competitive landscape.\n\nHere's how the major players are positioned:\n\n[Quadrant 1]: [players] — [positioning]\n[Quadrant 2]: [players] — [positioning]\n[Quadrant 3]: [players] — [positioning]\n\nThe white space no one is filling: [opportunity]\n\nFull map in comments — curious what you'd add 👇\n\n#Strategy #CompetitiveAnalysis #[Industry]",
    },
  ],
  'consulting-big4': [
    {
      id: 'practice-case-c4',
      title: 'Solve a Full Business Case from Scratch',
      description: 'Work through a complete consulting case using the structured MECE framework.',
      difficulty: 'Intermediate', time: '2-3 hours',
      context: "Big 4 consulting interviews are case-based. This project forces you to apply the exact thinking pattern you'll need — and produces a written artifact you can review before interviews.",
      steps: [
        'Choose a case prompt (e.g. "Your client is a hospital chain seeing declining profitability. How would you approach this?")',
        'Clarify the problem: what does success look like, what is the timeline, what is the scope?',
        'Build a MECE issue tree: break the problem into 3-4 mutually exclusive, collectively exhaustive branches',
        'Identify the 3 most important questions to answer and why',
        'For each question, determine what data you would collect',
        'Synthesize: what is your hypothesis for the root cause?',
        'Recommend: what are your top 3 actionable recommendations?',
        'Write it up as a structured 1-2 page case analysis',
      ],
      output: "A 1-2 page written case solution with issue tree, hypothesis, and 3 recommendations.",
      showcase: "Practice this multiple times with different prompts. Keep the best one in your portfolio.",
      resumeBullet: 'Completed a structured business case analysis for [problem type], building a MECE issue tree and developing 3 recommendations using hypothesis-driven problem solving',
      linkedinPost: "I practiced a business case this week — wrote up my full solution.\n\nCase: [brief prompt]\n\nMy issue tree:\n→ Branch 1: [issue]\n→ Branch 2: [issue]\n→ Branch 3: [issue]\n\nRoot cause I identified: [insight]\nTop recommendation: [recommendation]\n\nFull case write-up in comments — feedback welcome 👇\n\n#Consulting #CaseStudy #Big4",
    },
    {
      id: 'consulting-deck-c4',
      title: 'Build a 5-Slide Consulting Problem-Solution Deck',
      description: 'Create a client-ready consulting deck for a real business problem.',
      difficulty: 'Beginner', time: '2-3 hours',
      context: "Consulting decks are the primary client deliverable at every Big 4 firm. This project proves you can communicate in the language consultants use — structured, visual, and concise.",
      steps: [
        'Choose a business problem (operations inefficiency, market share loss, cost reduction, digital transformation)',
        'Slide 1: Situation — what is happening and why it matters (with data)',
        'Slide 2: Complication — what has changed or what is the specific challenge',
        'Slide 3: Analysis — 3 key findings from your analysis',
        'Slide 4: Recommendation — your top recommendation with rationale',
        'Slide 5: Next steps — 3 immediate actions with owners and timelines',
        'Use the "So What?" test: every slide must answer why the reader should care',
        'Design it cleanly — one key message per slide, minimal text',
      ],
      output: 'A 5-slide consulting deck using the SCR (Situation-Complication-Resolution) framework.',
      showcase: "Bring this to every consulting interview. 'Show me a piece of work you're proud of' — this is your answer.",
      resumeBullet: 'Built a 5-slide consulting deck for [business problem] using the SCR framework, with data-backed findings and 3 actionable recommendations',
      linkedinPost: "Most strategy slides are busy and unclear.\n\nHere's the 5-slide consulting deck structure I used for [business problem]:\n\nSlide 1: What's happening (data)\nSlide 2: Why it matters\nSlide 3: What I found\nSlide 4: What to do\nSlide 5: Who does what, by when\n\nKey rule: one message per slide. That's it.\n\nFull deck in comments 👇\n\n#Consulting #Strategy #Big4",
    },
    {
      id: 'process-efficiency-c4',
      title: 'Process Efficiency Analysis for an Operations Problem',
      description: 'Identify and quantify inefficiencies in a business process and propose improvements.',
      difficulty: 'Intermediate', time: '3-4 hours',
      context: "Operations consulting is a major practice area at all Big 4 firms. This project proves you can think analytically about how businesses run and articulate improvements clearly.",
      steps: [
        'Choose a business operation to analyze (hospital patient intake, restaurant order fulfillment, e-commerce returns processing)',
        'Map the current process end-to-end using a flowchart',
        'Identify every step that: takes too long, requires manual effort, creates errors, or adds no value',
        'Quantify the inefficiency where possible: "Step X takes 20 minutes but could take 5"',
        'Prioritize improvements using an effort vs impact 2x2 matrix',
        'Propose 3-5 specific improvements with expected outcomes',
        'Estimate total efficiency gain if all improvements are implemented',
        'Present as a 2-page analysis report',
      ],
      output: 'A 2-page process efficiency report with current-state map, inefficiency analysis, improvement proposals, and expected ROI.',
      showcase: "Use this in any operations consulting interview. 'Walk me through a process improvement' — this is your prepared answer.",
      resumeBullet: 'Conducted a process efficiency analysis for [operation type], identifying [X] inefficiencies and proposing improvements estimated to reduce process time by [Y]% and cost by [Z]%',
      linkedinPost: "I analyzed [business process] and found [X] steps that shouldn't exist.\n\nHere's the efficiency breakdown:\n\nCurrent process: [X] steps, [Y] minutes\nAfter improvements: [A] steps, [B] minutes\nTime saved per transaction: [C] minutes\nAnnual impact at scale: [metric]\n\nFull analysis in comments 👇\n\n#Consulting #OperationsConsulting #ProcessImprovement",
    },
    {
      id: 'market-entry-c4',
      title: 'Market Entry Assessment — Full Consulting Report',
      description: 'Write a complete consulting-style market entry assessment for a real company.',
      difficulty: 'Advanced', time: '5-6 hours',
      context: "Market entry assessments are a staple of strategy consulting at Big 4 firms. This is the most comprehensive project in this toolkit — and the most impressive if done well.",
      steps: [
        'Choose a company and a market they might enter (e.g. Amazon entering grocery delivery in India, or a hospital chain entering diagnostics)',
        'Executive Summary: your recommendation in 3 sentences',
        'Market Analysis: size, growth rate, key trends, customer segments',
        'Competitive Landscape: who is already there, their strengths and weaknesses',
        'Entry Options: at least 3 strategic options for how to enter',
        'Financial Assessment: rough P&L for Year 1, Year 3 for your recommended option',
        'Risk Assessment: top 3 risks with mitigation strategies',
        'Recommendation & Implementation: your recommended option + first 90 days',
        'Format as a 6-8 page report or 8-10 slide deck',
      ],
      output: 'A 6-8 page market entry report OR 8-10 slide deck covering all 8 sections.',
      showcase: "This is the most impressive project a consulting candidate can produce. Use it as your primary interview artifact.",
      resumeBullet: 'Authored a market entry assessment for [Company] entering [market], covering market analysis, competitive landscape, 3 entry options, financial projections, and implementation roadmap — recommending [option]',
      linkedinPost: "I spent 6 hours building a full market entry assessment for [Company] entering [market].\n\nHere's what I found:\n\nMarket size: [X]\nKey competitors: [Y]\nMy recommendation: [enter/don't enter] — because [reason]\nBiggest risk: [risk]\n\nFull 8-page report available — comment 'entry' and I'll share it.\n\n#Consulting #Strategy #MarketEntry #Big4",
    },
  ],
  'fpa-intern': [
    {
      id: 'annual-budget-fpa',
      title: 'Build a Complete Annual Budget Model',
      description: 'Create a full-year budget model with revenue forecast, cost structure, and scenario analysis.',
      difficulty: 'Intermediate', time: '4-5 hours',
      context: "Building the annual budget is the central FP&A task. This project simulates exactly what FP&A interns do in their first month — and proves you understand the full P&L.",
      steps: [
        'Choose a business type (SaaS startup, D2C brand, retail chain)',
        'Define the revenue model: how does the business make money? (subscriptions, transactions, units sold)',
        'Build revenue assumptions: price, volume growth, seasonality',
        'Build cost structure: COGS, salaries, marketing, rent, G&A — for 12 months',
        'Link revenues and costs to calculate EBITDA month by month',
        'Add scenario analysis: base case, bull case (20% better), bear case (20% worse)',
        'Build a summary P&L dashboard',
        'Write a 1-page budget narrative: key assumptions and strategic priorities',
      ],
      output: 'A 12-month budget model with P&L, scenario analysis, and budget narrative.',
      showcase: "Screenshot the model and share on LinkedIn. This is the most directly relevant FP&A project you can show.",
      resumeBullet: 'Built a full-year budget model for a hypothetical [business type], including revenue forecast, cost structure, 3-scenario analysis, and executive P&L dashboard',
      linkedinPost: "Built a 12-month budget model from scratch today.\n\nWhat's inside:\n→ Revenue model with assumptions\n→ Full cost structure (COGS, opex, etc.)\n→ Monthly EBITDA\n→ 3 scenarios (base, bull, bear)\n→ Summary dashboard\n\nKey insight from building it: [your insight]\n\nTemplate available — comment 'budget' and I'll share it.\n\n#Finance #FPA #Budgeting #Excel",
    },
    {
      id: 'variance-analysis-fpa',
      title: 'Build a Monthly Variance Analysis Report',
      description: 'Create a professional variance analysis comparing budget vs actual with management commentary.',
      difficulty: 'Beginner', time: '2-3 hours',
      context: "Variance analysis is the most common recurring deliverable in FP&A. Every month, FP&A teams explain why actuals differ from plan. This project proves you can do it.",
      steps: [
        'Create a budget for 3 P&L line items across 3 months (make up realistic numbers)',
        'Create "actual" numbers with realistic variances — some favorable, some unfavorable',
        'Calculate absolute variance (actual minus budget) and percentage variance for each line',
        'Apply conditional formatting: favorable variance in green, unfavorable in red',
        'Write a 3-paragraph management commentary: what drove the top-line variance, the cost variance, and what it means for the full year',
        'Add a "bridges" chart: a waterfall chart showing what drove the EBITDA variance',
      ],
      output: 'A variance analysis Excel model with commentary and waterfall bridge chart.',
      showcase: "Screenshot and share on LinkedIn. This is directly what FP&A professionals produce every month.",
      resumeBullet: 'Built a monthly variance analysis model comparing budget vs actuals across [X] P&L lines, including favorable/unfavorable analysis and management commentary explaining key drivers',
      linkedinPost: "The most common FP&A deliverable is monthly variance analysis.\n\nHere's the structure I used:\n\n1. Budget vs actual table (all P&L lines)\n2. Absolute + % variance\n3. Favorable/unfavorable highlighting\n4. EBITDA bridge (waterfall chart)\n5. Management commentary (3 paragraphs)\n\nKey takeaway from building this: [your insight]\n\nTemplate available — comment 'variance' 👇\n\n#Finance #FPA #VarianceAnalysis",
    },
    {
      id: 'revenue-forecast-fpa',
      title: 'Build a 3-Year Revenue Forecast Model',
      description: 'Create a driver-based 3-year revenue forecast for a growth-stage company.',
      difficulty: 'Advanced', time: '4-5 hours',
      context: "Long-range planning is a core FP&A capability. This project proves you can forecast from first principles using drivers — not just extrapolating historical numbers.",
      steps: [
        'Choose a growth-stage company type (EdTech subscription, D2C brand, SaaS platform)',
        'Define the revenue drivers: for a subscription business, drivers are new subscribers, churn rate, and ARPU',
        'Build a driver-based model: each revenue line flows from specific assumptions, not arbitrary growth rates',
        'Forecast 3 years by making explicit assumptions for each driver',
        'Add a sensitivity table: what happens to Year 3 revenue if churn is 5% vs 15%?',
        'Add a cohort analysis: how do customers acquired in Year 1 contribute in Years 2 and 3?',
        'Build a one-page summary with key assumptions and Year 3 targets',
      ],
      output: 'A 3-year driver-based revenue forecast with sensitivity analysis and cohort view.',
      showcase: "This demonstrates advanced FP&A thinking. Bring it to every senior finance interview.",
      resumeBullet: 'Built a driver-based 3-year revenue forecast for a hypothetical [company type], modeling [X] revenue drivers with sensitivity analysis across key assumptions and cohort-level retention',
      linkedinPost: "Most revenue forecasts are just 'last year + growth rate.'\n\nThat's not how FP&A should work.\n\nHere's the driver-based model I built:\n\nRevenue driver 1: [driver] → assumed [X]\nRevenue driver 2: [driver] → assumed [Y]\nRevenue driver 3: [driver] → assumed [Z]\n\nYear 3 revenue: [outcome]\nKey sensitivity: if [driver] changes by 10%, revenue changes by [impact]\n\nModel available — comment 'forecast' 👇\n\n#Finance #FPA #RevenueForecasting",
    },
  ],
  'content-social': [
    {
      id: 'content-calendar-cs',
      title: 'Build a 30-Day Content Calendar for a Brand',
      description: 'Plan a full month of content for a real brand across Instagram and LinkedIn.',
      difficulty: 'Beginner', time: '2-3 hours',
      context: "Content calendars are the first thing every content intern is asked to build. This project proves you can plan strategically, not just create randomly.",
      steps: [
        'Choose a brand — ideally one you genuinely find interesting',
        'Define 4-5 content pillars: the recurring themes you\'ll post about',
        'Plan 20 posts across 30 days: date, platform, content pillar, format (carousel, video, image, text), caption hook',
        'Ensure variety: 40% educational, 30% engaging, 20% promotional, 10% behind-the-scenes',
        'Write full captions for 5 of the posts',
        'Build the calendar in a clean Google Sheets format',
        'Add a "content objective" column: what is each post trying to achieve?',
      ],
      output: 'A 30-day content calendar in Google Sheets with 20 planned posts, 5 full captions, and content objectives.',
      showcase: "Share a screenshot on LinkedIn. This immediately proves planning and strategic thinking to any content/marketing interviewer.",
      resumeBullet: 'Developed a 30-day content calendar for [Brand] across Instagram and LinkedIn, planning 20 posts across 5 content pillars with captions and engagement objectives',
      linkedinPost: "Built a 30-day content calendar for [Brand] as a personal project.\n\nHere's the content mix I used:\n→ 40% educational\n→ 30% engaging\n→ 20% promotional\n→ 10% behind-the-scenes\n\nThe content pillar I think they're most missing: [pillar]\n\nFull calendar in comments — feel free to steal the template 👇\n\n#ContentStrategy #SocialMedia #ContentCreation",
    },
    {
      id: 'brand-voice-cs',
      title: 'Write a Brand Voice & Tone Guide',
      description: 'Create a comprehensive brand voice guide for a real company that lacks one.',
      difficulty: 'Intermediate', time: '3 hours',
      context: "Brand voice guides are documents most companies need but few have built properly. Creating one proves strategic content thinking — not just execution.",
      steps: [
        'Choose a brand to write the guide for (ideally one without a clear consistent voice)',
        'Research their existing content: what do they sound like now? what\'s inconsistent?',
        'Define 3-4 core voice attributes (e.g. "Direct but warm", "Expert but approachable")',
        'For each attribute: write a definition, a "we are this" example, and a "we are not this" counter-example',
        'Define tone variations: how does the voice shift for product launch vs customer complaint vs thought leadership?',
        'Create a "do and don\'t" language guide: specific words to use and avoid',
        'Format as a clean 3-4 page brand guide document',
      ],
      output: 'A 3-4 page brand voice and tone guide with examples, counter-examples, and do/don\'t language rules.',
      showcase: "This proves strategic content thinking. Share it on LinkedIn and tag the brand — you might get noticed.",
      resumeBullet: 'Developed a brand voice and tone guide for [Brand], defining 4 core voice attributes with examples, tone variations by context, and a do/don\'t language reference',
      linkedinPost: "[Brand] doesn't have a consistent voice. So I wrote one for them.\n\nHere are the 4 brand voice attributes I defined:\n\n1. [Attribute]: [what it means for the brand]\n2. [Attribute]: [what it means for the brand]\n3. [Attribute]: [what it means for the brand]\n4. [Attribute]: [what it means for the brand]\n\nFull brand voice guide in comments 👇\n\n#ContentStrategy #BrandVoice #CopywritIng",
    },
    {
      id: 'linkedin-content-cs',
      title: 'Write a 10-Post LinkedIn Content Series',
      description: 'Create a complete LinkedIn content series that builds authority in a niche.',
      difficulty: 'Intermediate', time: '3-4 hours',
      context: "LinkedIn content creation is now a core skill for content interns — especially at B2B companies, professional services, and EdTech brands. This project builds real copywriting muscle.",
      steps: [
        'Choose a topic you know well (internship strategy, personal finance basics, marketing for D2C brands, etc.)',
        'Define your ideal reader: who is this series for?',
        'Plan 10 posts: each with a specific angle, a hook, and a key insight',
        'Write all 10 full posts — include hook, 3-5 content points, and a CTA',
        'Design 2-3 carousel posts in Canva to complement the text posts',
        'Create a posting schedule: which post goes out when and why',
        'Write a 1-paragraph series strategy: what is the narrative arc across all 10 posts?',
      ],
      output: '10 fully written LinkedIn posts + 2-3 Canva carousels + posting schedule + series strategy.',
      showcase: "Actually post the series. Real engagement data on your resume is more powerful than any mock project.",
      resumeBullet: 'Created a 10-post LinkedIn content series on [topic], including full post copy, 3 Canva carousels, and a strategic posting schedule — achieving [X] impressions and [Y] followers gained',
      linkedinPost: "I wrote a 10-post LinkedIn content series on [topic].\n\nHere's the structure I used:\n\nPosts 1-3: Problem framing (why this matters)\nPosts 4-7: Core insights (the meat)\nPosts 8-9: Case studies (proof it works)\nPost 10: CTA + community invite\n\nKey hook formula I used: [formula]\n\nFirst post in comments — happy to share the full series 👇\n\n#LinkedIn #ContentCreation #ContentStrategy",
    },
    {
      id: 'video-scripts-cs',
      title: 'Write a 5-Reel Script Series for a Brand',
      description: 'Create production-ready short-form video scripts for a brand\'s Instagram Reels.',
      difficulty: 'Beginner', time: '2-3 hours',
      context: "Short-form video is now the highest-reach content format. Most content interns are asked to write scripts but have never done it. This project proves you understand the format.",
      steps: [
        'Choose a brand to create Reels for',
        'Study 5 high-performing Reels in their niche: what do the best ones have in common?',
        'Plan 5 Reel concepts: each with a hook, format (talking head / text-only / trending audio / tutorial), and key message',
        'Write a full production script for each: on-screen text, voiceover/caption, b-roll description, audio direction',
        'Keep each script under 30 seconds when read aloud',
        'Add a brief note on why each Reel will perform (what emotion or value does it create?)',
      ],
      output: '5 production-ready Reel scripts with on-screen text, caption, b-roll notes, and performance rationale.',
      showcase: "If you can actually film or animate one, do it. Raw engagement from a real Reel beats any PDF.",
      resumeBullet: 'Developed a 5-Reel script series for [Brand], including production direction, on-screen text, captions, and format rationale — designed for [specific content objective]',
      linkedinPost: "Most short-form videos fail because of a weak hook.\n\nI wrote 5 Reel scripts for [Brand] — here's the hook I used for each:\n\nReel 1: [hook]\nReel 2: [hook]\nReel 3: [hook]\nReel 4: [hook]\nReel 5: [hook]\n\nRule I followed: if the hook doesn't stop someone mid-scroll, rewrite it.\n\nFull scripts in comments 👇\n\n#Reels #ContentCreation #ShortFormVideo",
    },
  ],
  'investment-research': [
    {
      id: 'stock-pitch-ir',
      title: 'Write a Stock Pitch Deck — Full Investment Thesis',
      description: 'Research a listed company and build a complete 5-slide investment pitch.',
      difficulty: 'Intermediate', time: '3-4 hours',
      context: "Stock pitches are the primary proof of investment research capability. If you can walk someone through a well-researched pitch confidently, you can do most investment research intern work on day one.",
      steps: [
        'Choose a listed Indian company you find genuinely interesting',
        'Read the last 2 annual reports and 4 quarterly earnings calls / results',
        'Slide 1: Company Overview — what they do, key metrics, market position',
        'Slide 2: Investment Thesis — 3 specific reasons why this stock is a Buy/Sell/Hold',
        'Slide 3: Financial Analysis — 3-year revenue growth, margins, ROCE, debt profile',
        'Slide 4: Valuation — P/E and EV/EBITDA vs sector peers, your target price and upside',
        'Slide 5: Key Risks — the 3 things that could make your thesis wrong',
        'Conclude with a clear Buy/Hold/Sell with conviction level',
      ],
      output: 'A 5-slide investment pitch deck with full thesis, financial analysis, valuation, and risk section.',
      showcase: "Bring this to every finance and investment interview. Practice presenting it in under 5 minutes.",
      resumeBullet: 'Authored a 5-slide investment pitch on [Company] with thesis, financial analysis, peer valuation, and risk assessment — recommending [Buy/Hold/Sell] with [X]% upside to 12-month target price',
      linkedinPost: "My investment thesis on [Company] in 60 seconds:\n\nBusiness: [one line]\nWhy I'm bullish: [3 bullet reasons]\nKey risk: [risk]\nValuation: [X]x P/E vs [Y]x peer average\nTarget price: ₹[X] — [Z]% upside\n\nWould love pushback from anyone who follows this sector 👇\n\n#Investing #StockPitch #EquityResearch",
    },
    {
      id: 'dcf-valuation-ir',
      title: 'Build a DCF Valuation Model in Excel',
      description: 'Create a complete discounted cash flow valuation for a listed company.',
      difficulty: 'Advanced', time: '4-5 hours',
      context: "DCF modeling is the foundational quantitative skill for investment research. Building one from scratch — even if imperfect — demonstrates more capability than any theoretical explanation.",
      steps: [
        'Choose a listed company — ideally one with predictable cash flows (not a loss-making startup)',
        'Pull 3 years of historical financials from the annual report or screener.in',
        'Build revenue projections for 5 years using driver-based assumptions',
        'Calculate EBIT, apply tax rate, add back D&A, subtract capex and working capital changes to get Free Cash Flow',
        'Estimate the WACC: cost of equity (CAPM) + cost of debt, weighted by capital structure',
        'Calculate terminal value using the Gordon Growth Model',
        'Discount all cash flows to present value',
        'Calculate implied share price and compare to current market price',
        'Build a sensitivity table: how does the implied price change with different WACC and growth assumptions?',
      ],
      output: 'A complete DCF model in Excel with revenue projections, FCF calculation, WACC, terminal value, and sensitivity table.',
      showcase: "Send the model in every investment research application. Add a summary page showing your key assumptions.",
      resumeBullet: 'Built a 5-year DCF valuation model for [Company] in Excel, calculating WACC, FCF projections, and terminal value — implying a [X]% [premium/discount] to current market price',
      linkedinPost: "Built my first DCF model for [Company] from scratch.\n\nKey outputs:\n→ WACC: [X]%\n→ Terminal growth rate assumed: [Y]%\n→ Implied share price: ₹[Z]\n→ Current price: ₹[A] → [premium/discount] of [B]%\n\nBiggest learning: [insight about the company or the modeling process]\n\nModel available — comment 'DCF' and I'll share it.\n\n#Finance #Valuation #DCF #InvestmentResearch",
    },
    {
      id: 'sector-report-ir',
      title: 'Write a Sector Deep Dive Report',
      description: 'Research and write a comprehensive analysis of a listed sector in India.',
      difficulty: 'Beginner', time: '3-4 hours',
      context: "Sector research is the foundation of all investment analysis. Understanding an industry deeply before analyzing individual companies is how the best analysts think.",
      steps: [
        'Choose a sector to research (BFSI, pharma, FMCG, auto, IT, consumer retail, etc.)',
        'Understand the macro: how big is the sector, how fast is it growing, what is driving growth?',
        'Map the value chain: who are the key players at each stage?',
        'Identify the 3 biggest themes currently playing out in this sector',
        'Profile 3-4 listed companies: financials, positioning, recent performance',
        'Compare them on 4-5 key financial metrics (revenue growth, EBITDA margin, ROCE, PE)',
        'Write a 2-3 page sector report with an executive summary and your top stock pick from the sector',
      ],
      output: 'A 2-3 page sector deep dive report with industry overview, competitive map, company profiles, and stock recommendation.',
      showcase: "Post the executive summary as a LinkedIn post. Link the full report. High signal content for finance roles.",
      resumeBullet: 'Authored a sector deep dive on the [sector] industry in India, analyzing macro drivers, value chain dynamics, and 4 listed companies — recommending [Company] as the top pick based on [rationale]',
      linkedinPost: "I spent the weekend deep-diving the [sector] sector in India.\n\nHere's what every finance student should know about it:\n\n1. Market size: [X] growing at [Y]%\n2. Key tailwind: [driver]\n3. Biggest risk: [risk]\n4. Top pick: [Company] — [one-line thesis]\n\nFull sector report in comments 👇\n\n#Finance #SectorResearch #InvestmentResearch #[Sector]",
    },
  ],
  'growth-marketing': [
    {
      id: 'paid-campaign-gm',
      title: 'Analyze a Paid Campaign — Build the Post-Campaign Report',
      description: 'Simulate a paid marketing campaign, analyze results, and write a performance report.',
      difficulty: 'Intermediate', time: '3 hours',
      context: "Growth marketing interns are expected to analyze campaign performance and make optimization recommendations on day one. This project proves you understand the metrics and can draw insights from them.",
      steps: [
        'Choose a product or service to run a hypothetical Meta Ads campaign for',
        'Define the campaign objective: awareness, traffic, or conversions',
        'Set up a mock campaign structure: 2 ad sets, 3 ad creatives per set',
        'Create realistic mock performance data: impressions, clicks, CTR, CPM, CPC, conversions, ROAS',
        'Analyze which ad set performed better and why',
        'Identify 3 optimization recommendations for the next campaign cycle',
        'Build the analysis in Google Sheets with charts',
        'Write a 1-page post-campaign report with headline metrics and recommendations',
      ],
      output: 'A Google Sheets campaign analysis with performance data, charts, and a 1-page post-campaign report.',
      showcase: "Share the report as a LinkedIn post. This directly proves marketing analytics capability.",
      resumeBullet: 'Analyzed a mock Meta Ads campaign for [product type], comparing [X] ad variations across [Y] audiences — identifying the top-performing creative and generating 3 optimization recommendations',
      linkedinPost: "Ran a mock Meta Ads experiment and analyzed the results.\n\nCampaign goal: [objective]\n\nTop-performing ad: [description]\nWhy it won: [insight]\nKey metric: [CTR/ROAS/CPL]\n\n3 optimizations I'd make in the next cycle:\n1. [optimization]\n2. [optimization]\n3. [optimization]\n\nFull post-campaign report in comments 👇\n\n#GrowthMarketing #MetaAds #DigitalMarketing",
    },
    {
      id: 'funnel-audit-gm',
      title: 'Conversion Funnel Audit for a Real Website',
      description: 'Audit a real website\'s conversion funnel and identify where users drop off.',
      difficulty: 'Beginner', time: '2 hours',
      context: "Funnel analysis is core to growth marketing. This project proves you understand user psychology and can identify conversion opportunities — without needing access to real analytics data.",
      steps: [
        'Choose a real website with a clear conversion goal (e-commerce purchase, SaaS sign-up, booking, etc.)',
        'Map the full conversion funnel: Awareness → Interest → Consideration → Intent → Purchase',
        'Go through each step as a user — where does it feel confusing, slow, or uncertain?',
        'Identify 5 specific friction points that likely cause drop-off',
        'For each friction point: what would you test to fix it? (CTA copy, page layout, social proof, etc.)',
        'Prioritize by: how easy is the fix × how much drop-off it likely causes',
        'Write a 1-page funnel audit with friction map and 5 A/B test recommendations',
      ],
      output: 'A conversion funnel map + 1-page audit report with 5 prioritized A/B test recommendations.',
      showcase: "This is extremely shareable. Post the key finding on LinkedIn. Tag the brand — sometimes they respond.",
      resumeBullet: 'Conducted a conversion funnel audit for [website], mapping [X]-step user journey, identifying 5 friction points, and generating A/B test recommendations prioritized by effort vs impact',
      linkedinPost: "I audited [website]'s conversion funnel today.\n\n[X] steps from landing to purchase. Here's where they're losing people:\n\nStep [X]: [friction point] → Fix: [recommendation]\nStep [Y]: [friction point] → Fix: [recommendation]\nStep [Z]: [friction point] → Fix: [recommendation]\n\nEstimated conversion uplift if all 3 are fixed: [X]%\n\nFull audit in comments 👇\n\n#GrowthMarketing #CRO #ConversionOptimization",
    },
    {
      id: 'seo-audit-gm',
      title: 'SEO Content Gap Analysis for a Brand',
      description: 'Find the SEO content gaps for a real brand and propose a 3-month content plan to fill them.',
      difficulty: 'Intermediate', time: '3 hours',
      context: "SEO is increasingly expected even for non-technical growth marketing roles. This project proves you understand organic growth and can build a content strategy from keyword data.",
      steps: [
        'Choose a brand with a blog or content hub (EdTech, D2C, SaaS, etc.)',
        'Identify their top 5 existing ranking keywords using free tools (Ubersuggest, Ahrefs free, Google Search Console)',
        'Identify 10 keywords they should be ranking for but aren\'t — high search volume, relevant to their product',
        'For each gap keyword: what content would fill it? (blog post, landing page, comparison page, etc.)',
        'Map the content gap: keyword, search volume, difficulty, content type, why it matters for this brand',
        'Prioritize the top 5 gaps to address first',
        'Build a 3-month content plan: what to create in Month 1, 2, and 3',
      ],
      output: 'A content gap analysis (10 keywords) + 3-month SEO content plan with prioritized topics.',
      showcase: "This demonstrates growth thinking and content strategy simultaneously. Strong for any marketing role.",
      resumeBullet: 'Conducted an SEO content gap analysis for [Brand], identifying 10 high-value keyword gaps and developing a 3-month content roadmap to capture estimated [X] monthly organic visits',
      linkedinPost: "[Brand] is missing [X] in monthly organic traffic. Here's why.\n\nI did an SEO content gap analysis and found these 5 keywords they should own but don't:\n\n1. '[keyword]' — [X] monthly searches\n2. '[keyword]' — [X] monthly searches\n3. '[keyword]' — [X] monthly searches\n4. '[keyword]' — [X] monthly searches\n5. '[keyword]' — [X] monthly searches\n\nFull gap analysis + 3-month content plan in comments 👇\n\n#SEO #GrowthMarketing #ContentStrategy",
    },
  ],
  'partnerships-intern': [
    {
      id: 'partner-map-pi',
      title: 'Build a Partner Ecosystem Map',
      description: 'Systematically identify and categorize potential partners for a company in a specific sector.',
      difficulty: 'Beginner', time: '2-3 hours',
      context: "Ecosystem mapping is the foundational research task for any partnerships role. This project proves you can think strategically about who the right partners are — not just list companies randomly.",
      steps: [
        'Choose a company and its partnership goal (e.g. a FinTech wanting to expand distribution through HR platforms)',
        'Define 3 partnership categories: distribution partners, technology partners, co-marketing partners',
        'For each category: identify 10-15 potential companies',
        'For each company: assess strategic fit, audience overlap, deal structure likely to appeal to them',
        'Prioritize: Tier 1 (must approach), Tier 2 (strong fit), Tier 3 (opportunistic)',
        'Identify the right contact at each Tier 1 company using LinkedIn',
        'Write a "partnership strategy" page: which category to prioritize first and why',
      ],
      output: 'A Google Sheets partner map with 30-40 companies across 3 categories, tiered by priority, with strategy rationale.',
      showcase: "This is directly useful in any partnerships interview. Demonstrate you can think about ecosystem strategy, not just execute.",
      resumeBullet: 'Built a partner ecosystem map for [Company], identifying 35+ potential partners across 3 categories and tiered by strategic fit — enabling prioritized outreach to [X] Tier 1 targets',
      linkedinPost: "How do you find the right partners when you're starting from scratch?\n\nI built a partner ecosystem map for [Company].\n\nHere's the framework I used:\n\nStep 1: Define 3 partnership categories\nStep 2: Map 10-15 companies per category\nStep 3: Score by strategic fit\nStep 4: Prioritize Tier 1 targets\nStep 5: Identify contacts\n\nFull map + framework in comments 👇\n\n#Partnerships #BusinessDevelopment #Strategy",
    },
    {
      id: 'co-marketing-pi',
      title: 'Design a Co-Marketing Campaign Between Two Brands',
      description: 'Plan a complete co-marketing campaign that creates value for both partner brands.',
      difficulty: 'Intermediate', time: '3 hours',
      context: "Co-marketing campaigns are one of the most common outputs from partnerships teams. This project proves you understand how to create mutual value — not just pitch one-sided deals.",
      steps: [
        'Choose two brands with overlapping audiences but non-competing products (e.g. a fitness app + a nutrition brand)',
        'Define the campaign objective: lead generation, brand awareness, or customer acquisition?',
        'Design the campaign mechanics: what is the offer, how does each brand benefit, what does each contribute?',
        'Plan the campaign timeline: 4 weeks, week by week',
        'Define the content: what each brand creates, where it\'s distributed, and how it cross-promotes',
        'Set success metrics: what does "success" look like for each brand in numbers?',
        'Compile into a partnership brief: a 2-page document you could send to either brand',
      ],
      output: 'A 2-page co-marketing campaign brief with campaign mechanics, timeline, content plan, and success metrics.',
      showcase: "Bring this to every partnerships and BD interview. It demonstrates deal-thinking and creative execution simultaneously.",
      resumeBullet: 'Designed a co-marketing campaign for [Brand A] × [Brand B], structuring a [X]-week campaign with shared content, cross-promotion, and projected [metric] for each partner',
      linkedinPost: "[Brand A] × [Brand B] should collaborate.\n\nHere's the co-marketing campaign I designed:\n\nCampaign idea: [concept]\nDuration: [X] weeks\nWhat [Brand A] brings: [contribution]\nWhat [Brand B] brings: [contribution]\nEstimated reach: [X] combined audiences\n\nFull campaign brief in comments — would love to know if you'd improve anything 👇\n\n#Partnerships #CoMarketing #BrandCollaboration",
    },
    {
      id: 'partnership-onepager-pi',
      title: 'Write a Partnership One-Pager for an Outreach Campaign',
      description: 'Create a concise, compelling one-page document pitching a specific partnership.',
      difficulty: 'Beginner', time: '1-2 hours',
      context: "When you reach out to potential partners, you need a document that explains the value of the partnership in under 60 seconds. This one-pager is that document.",
      steps: [
        'Choose a company you want to pitch a partnership to',
        'Define the partnership type: referral, co-marketing, integration, or distribution',
        'Section 1: Who We Are — 3 lines about your company and what makes you relevant to them',
        'Section 2: What We\'re Proposing — the specific partnership in plain language',
        'Section 3: What\'s In It For You — the specific benefits for the partner company (in their terms)',
        'Section 4: What We Bring — what you\'re contributing (audience, tech, content, revenue share)',
        'Section 5: Next Steps — one clear ask with a deadline',
        'Design it in Canva — clean, branded, professional',
      ],
      output: 'A designed 1-page partnership document in Canva (PDF export), ready to attach to cold outreach.',
      showcase: "Use this as an actual outreach tool. A real reply from a real company is the best showcase.",
      resumeBullet: 'Created a partnership one-pager for [type of partnership] between [Company] and [partner category], used in outreach campaign achieving [X]% positive response rate',
      linkedinPost: "A partnership one-pager is the most underrated BD tool.\n\nHere's the 5-section structure I used:\n\n1. Who we are (3 lines)\n2. What we're proposing\n3. What's in it for you\n4. What we bring\n5. The ask\n\nThe key: write everything from the partner's perspective, not yours.\n\nMy template in comments — free to use 👇\n\n#Partnerships #BD #BusinessDevelopment",
    },
  ],
  'chief-of-staff': [
    {
      id: 'exec-dashboard-cos',
      title: 'Build a Weekly Executive Dashboard in Notion',
      description: 'Create a weekly dashboard that gives a founder or CEO full visibility in 5 minutes.',
      difficulty: 'Beginner', time: '2-3 hours',
      context: "The Chief of Staff's most important recurring deliverable is keeping leadership informed. This project proves you can synthesize information across functions and present it clearly.",
      steps: [
        'Set up a Notion page for a hypothetical startup\'s weekly executive dashboard',
        'Section 1: Company Health — 4-5 key metrics with trend arrows (revenue, burn, team size, NPS)',
        'Section 2: What\'s Going Well — 3 bullets of positive progress this week',
        'Section 3: Key Decisions Needed — 2-3 items requiring founder attention',
        'Section 4: Blockers — what is slowing things down, and what does each team need to unblock',
        'Section 5: Next Week Priorities — top 3 company priorities for the coming week',
        'Design it so it takes under 5 minutes to read and 15 minutes to fill in weekly',
      ],
      output: 'A Notion executive dashboard template with 5 sections — shareable via public link.',
      showcase: "Share the public Notion link in your resume. This is immediately impressive to any founder hiring a CoS.",
      resumeBullet: 'Designed a weekly executive dashboard template in Notion covering company health metrics, key decisions, blockers, and priorities — reducing leadership sync time by enabling async visibility',
      linkedinPost: "A good Chief of Staff keeps leadership informed without constant meetings.\n\nI built a 5-section weekly executive dashboard in Notion:\n\n1. Company health metrics\n2. What's going well\n3. Decisions needed\n4. Blockers\n5. Next week priorities\n\nRule: it should take under 5 minutes to read.\n\nPublic template in comments — free to duplicate 👇\n\n#ChiefOfStaff #StartupOps #FoundersOffice",
    },
    {
      id: 'meeting-cadence-cos',
      title: 'Design a Company Meeting Cadence and Templates',
      description: 'Build a complete meeting system for a 10-20 person startup — cadence, templates, and norms.',
      difficulty: 'Intermediate', time: '2-3 hours',
      context: "One of the first things a CoS is asked to do is fix how the company runs its meetings. Most early-stage startups have too many meetings with too little structure. This project shows you can solve that.",
      steps: [
        'Define the 4-5 recurring meetings a 15-person startup needs: all-hands, team standups, 1-1s, leadership sync, retrospective',
        'For each meeting: define the frequency, duration, attendees, and objective',
        'Build a meeting template for each type: what sections must be covered, in what order',
        'Write a "meeting norms" document: what makes a meeting productive vs wasteful at this company',
        'Build a weekly calendar showing when each meeting occurs and its time block',
        'Design the all-hands template in Notion: agenda, metrics review, announcements, Q&A',
        'Write a 1-page "how to use this system" guide for new team members',
      ],
      output: 'A complete meeting system in Notion: 5 meeting templates + norms doc + weekly calendar + onboarding guide.',
      showcase: "Share on LinkedIn. Any founder who sees this knows immediately what a good CoS looks like.",
      resumeBullet: 'Designed a complete meeting cadence system for a hypothetical 15-person startup, including 5 meeting templates, communication norms, and a weekly calendar — reducing meeting time by [X]%',
      linkedinPost: "Most startup meetings are a waste of time.\n\nI designed a complete meeting system for a 15-person startup:\n\n→ 5 recurring meeting types with templates\n→ Norms doc (what makes meetings productive)\n→ Weekly calendar\n→ All-hands agenda format\n\nTotal meeting time in the system: 4.5 hours per week per person. That's it.\n\nFull Notion template in comments 👇\n\n#ChiefOfStaff #StartupOps #MeetingCulture",
    },
    {
      id: 'onboarding-playbook-cos',
      title: 'Build a New Hire Onboarding Playbook',
      description: 'Create a complete 30-day onboarding system for a new employee at a startup.',
      difficulty: 'Beginner', time: '2-3 hours',
      context: "Most startups have terrible onboarding — new hires are lost for the first month. Building an onboarding system is core CoS work that has immediate, visible impact.",
      steps: [
        'Define the goal: what should a new hire know, feel, and be able to do after 30 days?',
        'Build the Day 1 checklist: accounts to set up, people to meet, tools to learn',
        'Build the Week 1 plan: what does the new hire do each day in their first 5 days?',
        'Build the 30-day roadmap: weekly milestones for the first month',
        'Create a "Company Essentials" section: mission, values, key terminology, org chart',
        'Create a "Key People" section: who are the go-to people for different questions?',
        'Add a 30-day check-in template: what does the manager review with the new hire at day 30?',
      ],
      output: 'A complete 30-day onboarding playbook in Notion with checklist, weekly plan, company essentials, and 30-day check-in.',
      showcase: "Share the Notion link in your resume. For CoS and ops roles, this is exactly the kind of systems work they want.",
      resumeBullet: 'Built a 30-day new hire onboarding playbook for a startup, including Day 1 checklist, weekly milestones, company essentials guide, and 30-day check-in template — reducing time-to-productivity for new team members',
      linkedinPost: "Most startups have terrible onboarding.\n\nI built a 30-day onboarding playbook for a hypothetical startup.\n\nWhat's inside:\n→ Day 1 checklist (accounts, tools, people)\n→ Week 1 day-by-day plan\n→ 30-day milestone roadmap\n→ Company essentials (mission, values, org chart)\n→ 30-day check-in template\n\nPublic Notion link in comments — free to duplicate 👇\n\n#ChiefOfStaff #Onboarding #StartupOps",
    },
  ],
  'project-management': [
    {
      id: 'project-plan-pm',
      title: 'Build a Full Project Plan with Gantt Chart',
      description: 'Create a complete project plan for a real or hypothetical project, including Gantt chart.',
      difficulty: 'Intermediate', time: '3-4 hours',
      context: "A project plan with a Gantt chart is the foundational project management deliverable. Every PM intern is expected to be able to build one. This project proves you can do it before day one.",
      steps: [
        'Choose a project to plan (product launch, office relocation, marketing campaign, event)',
        'Define the project scope: what is in scope, what is explicitly out of scope',
        'Identify all tasks and group them into 4-5 phases',
        'For each task: estimate duration, identify dependencies (what must finish before this can start)',
        'Build the Gantt chart in Google Sheets or Excel: tasks on rows, weeks on columns, bars for duration',
        'Identify the critical path: the sequence of tasks that determines the project end date',
        'Assign a responsible owner to each task',
        'Add key milestones and add a risk flag to high-risk tasks',
      ],
      output: 'A complete project plan with work breakdown structure, Gantt chart, critical path identified, and task ownership.',
      showcase: "This is the most concrete PM artifact you can show. Every interviewer who asks 'can you build a project plan?' has their answer.",
      resumeBullet: 'Developed a complete project plan for [project type], including work breakdown structure, Gantt chart with [X] tasks across [Y] phases, critical path analysis, and risk flagging',
      linkedinPost: "Built a full project plan with Gantt chart from scratch today.\n\nProject: [project name/type]\nPhases: [X]\nTotal tasks: [Y]\nProject duration: [Z] weeks\n\nBiggest learning: [insight about dependencies or critical path]\n\nThe critical path was surprising: [what it was]\n\nTemplate available — comment 'gantt' and I'll share it.\n\n#ProjectManagement #GanttChart #PM",
    },
    {
      id: 'risk-register-pm',
      title: 'Build a Risk Register and Mitigation Plan',
      description: 'Identify, assess, and plan mitigations for all risks in a hypothetical project.',
      difficulty: 'Beginner', time: '2 hours',
      context: "Risk management is a core PM skill that most interns have never formally practiced. A well-built risk register shows structured thinking and professional maturity.",
      steps: [
        'Choose a project context (new product launch, construction project, software implementation)',
        'Brainstorm at least 12 potential risks across categories: technical, timeline, resources, external, stakeholder',
        'For each risk: write a clear description of what could go wrong',
        'Score each risk on probability (1-5) and impact (1-5)',
        'Calculate risk score: probability × impact',
        'Prioritize into High / Medium / Low categories',
        'For each High risk: write a specific mitigation action (what will you do to reduce probability or impact?)',
        'Assign a risk owner for each High and Medium risk',
      ],
      output: 'A risk register in Google Sheets with 12+ risks, scored, categorized, and with mitigation plans for all High risks.',
      showcase: "This proves you think proactively, not reactively — a key PM trait. Bring it to interviews.",
      resumeBullet: 'Developed a risk register for a [project type] with [X] identified risks scored by probability and impact, including mitigation plans for [Y] High risks with assigned owners',
      linkedinPost: "Most projects fail because nobody thought about what could go wrong.\n\nI built a risk register for a [project type].\n\nTop 3 risks I identified:\n\n1. [Risk]: Probability [X], Impact [Y] → Mitigation: [action]\n2. [Risk]: Probability [X], Impact [Y] → Mitigation: [action]\n3. [Risk]: Probability [X], Impact [Y] → Mitigation: [action]\n\nTemplate available — comment 'risk' and I'll share it.\n\n#ProjectManagement #RiskManagement #PM",
    },
    {
      id: 'sprint-retro-pm',
      title: 'Plan and Document a Complete Sprint Cycle',
      description: 'Design a sprint planning session and retrospective for an agile team.',
      difficulty: 'Intermediate', time: '2-3 hours',
      context: "Agile/Scrum is now used by most companies — even non-tech ones. Understanding and documenting a sprint cycle proves you can work in modern team environments from day one.",
      steps: [
        'Choose a hypothetical team and sprint goal (e.g. a product team building a checkout flow)',
        'Write the sprint planning document: goal, duration (2 weeks), team capacity, and user stories',
        'Break the sprint goal into 6-8 user stories with acceptance criteria',
        'Estimate story points for each user story',
        'Create a sprint backlog: all stories ranked by priority',
        'Write a daily standup template: what each team member answers each day',
        'Document the sprint review: what was completed, what was not, demo plan',
        'Run the retrospective: What went well? What to improve? Action items?',
      ],
      output: 'A complete sprint documentation package: planning doc, user stories, sprint backlog, standup template, review doc, and retrospective.',
      showcase: "This proves agile fluency — increasingly valued even in non-tech PM roles. Use it in any PM or operations interview.",
      resumeBullet: 'Planned and documented a complete 2-week sprint cycle for a hypothetical product team, including 8 user stories with story points, sprint backlog, daily standup template, and retrospective',
      linkedinPost: "Most people say they've 'worked in agile' without being able to explain what a sprint actually looks like.\n\nHere's the complete sprint cycle I documented:\n\nSprint planning → Sprint execution → Sprint review → Retrospective\n\nMost important document: the retrospective action items. That's where the team actually improves.\n\nFull sprint documentation package in comments 👇\n\n#ProjectManagement #Agile #Scrum",
    },
  ],
}

// ──────────────────────── DIFFICULTY COLORS ────────────────────────
const difficultyStyle = {
  Beginner: { color: '#6ee7b7', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  Intermediate: { color: '#fcd34d', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  Advanced: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
}

const skillCats = [
  { key: 'core' as const, label: 'Core Skills', color: '#4F7CFF', icon: '🔵' },
  { key: 'tools' as const, label: 'Tools & Software', color: '#10b981', icon: '🟢' },
  { key: 'proofOfWork' as const, label: 'Proof-of-Work Skills', color: '#f59e0b', icon: '🟡' },
  { key: 'bonus' as const, label: 'Bonus Differentiators', color: '#7B61FF', icon: '🟣' },
]

// ──────────────────────── MAIN PAGE ────────────────────────
export default function CareerToolkitPage() {
  const [domainFilter, setDomainFilter] = useState('All')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'bullets'>('skills')
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const d = params.get('domain')
    if (d && domains.includes(d)) setDomainFilter(d)
  }, [])

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredRoles = domainFilter === 'All' ? roles : roles.filter(r => r.domain === domainFilter)
  const currentRole = roles.find(r => r.id === selectedRole)
  const currentData = selectedRole ? roleData[selectedRole] : null
  const currentProjects = selectedRole ? (projectData[selectedRole] || []) : []

  const handleRoleClick = (id: string) => {
    if (selectedRole === id) {
      setSelectedRole(null)
    } else {
      setSelectedRole(id)
      setActiveTab('skills')
      setExpandedProject(null)
    }
  }

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes panelIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .role-card{background:#111827;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px;cursor:pointer;transition:border-color 0.2s,box-shadow 0.2s,transform 0.2s;animation:fadeUp 0.4s ease both}
        .role-card:hover{border-color:rgba(79,124,255,0.5);box-shadow:0 8px 32px rgba(79,124,255,0.12);transform:translateY(-2px)}
        .role-card.active{border-color:#4F7CFF;box-shadow:0 8px 32px rgba(79,124,255,0.2)}
        .domain-tab{padding:8px 16px;border-radius:100px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.45);font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.15s;font-family:"DM Sans",sans-serif}
        .domain-tab:hover{border-color:rgba(255,255,255,0.25);color:rgba(255,255,255,0.75)}
        .domain-tab.active{background:rgba(79,124,255,0.15);border-color:rgba(79,124,255,0.4);color:#93BBFF}
        .toolkit-panel{animation:panelIn 0.3s ease}
        .panel-tab{padding:9px 18px;border-radius:100px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.5);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s;font-family:"DM Sans",sans-serif;white-space:nowrap}
        .panel-tab.active{background:rgba(79,124,255,0.2);border-color:rgba(79,124,255,0.5);color:#93BBFF}
        .skill-pill-wrap{position:relative;display:inline-block}
        .skill-pill{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:100px;font-size:13px;font-weight:600;cursor:default;border:1px solid;transition:transform 0.1s}
        .skill-pill:hover{transform:translateY(-1px)}
        .skill-tip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#1f2937;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:9px 13px;font-size:12px;color:rgba(255,255,255,0.8);line-height:1.55;width:210px;pointer-events:none;opacity:0;transition:opacity 0.15s;z-index:50;white-space:normal}
        .skill-tip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1f2937}
        .skill-pill-wrap:hover .skill-tip{opacity:1}
        .code-block{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;font-family:'Courier New',monospace;font-size:13px;line-height:1.75;color:rgba(255,255,255,0.85);white-space:pre-wrap;word-break:break-word}
        .copy-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.6);font-size:11px;font-weight:700;cursor:pointer;transition:all 0.15s;font-family:"DM Sans",sans-serif;flex-shrink:0}
        .copy-btn:hover{background:rgba(79,124,255,0.15);border-color:rgba(79,124,255,0.35);color:#93BBFF}
        .copy-btn.copied{background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.35);color:#6ee7b7}
        .project-card{border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden;transition:border-color 0.2s}
        .project-card:hover{border-color:rgba(79,124,255,0.25)}
        .project-card.open{border-color:rgba(79,124,255,0.3);background:rgba(79,124,255,0.02)}
        .bullet-card{background:#111827;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px 20px;transition:border-color 0.2s}
        .bullet-card:hover{border-color:rgba(79,124,255,0.25)}
        .filter-scroll::-webkit-scrollbar{display:none}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
        @media(max-width:768px){
          .roles-grid{grid-template-columns:1fr 1fr !important}
          .skills-grid{grid-template-columns:1fr 1fr !important}
        }
        @media(max-width:480px){
          .roles-grid{grid-template-columns:1fr !important}
          .skills-grid{grid-template-columns:1fr !important}
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, padding: '3px 10px', borderRadius: 100, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', textTransform: 'uppercase' }}>
            100% Free
          </span>
          <a href="/free" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← All Resources
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>

        {/* HERO */}
        <div style={{ padding: '64px 0 48px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
            CAREER TOOLKIT
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 18, maxWidth: 760, margin: '0 auto 18px' }}>
            Know exactly what to build —<br />
            <span style={{ color: '#4F7CFF' }}>for the role you want</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}>
            Select your target role. Get a skill map, real project playbooks, and resume bullets — ready to copy.
          </p>
          {/* Stat pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: '15+ Roles Covered', color: '#93BBFF', bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.25)' },
              { label: '50+ Project Playbooks', color: '#6ee7b7', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
              { label: 'Copy-paste Resume Bullets', color: '#fcd34d', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
            ].map(s => (
              <span key={s.label} style={{ padding: '8px 18px', borderRadius: 100, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 13, fontWeight: 700 }}>{s.label}</span>
            ))}
          </div>
        </div>

        {/* DOMAIN FILTER */}
        <div className="filter-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 28 }}>
          {domains.map(d => (
            <button key={d} className={`domain-tab${domainFilter === d ? ' active' : ''}`} onClick={() => { setDomainFilter(d); setSelectedRole(null) }}>
              {d !== 'All' && domainEmoji[d] ? `${domainEmoji[d]} ` : ''}{d}
            </button>
          ))}
        </div>

        {/* ROLE CARDS */}
        <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
          {filteredRoles.map((role, i) => (
            <div
              key={role.id}
              className={`role-card${selectedRole === role.id ? ' active' : ''}`}
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => handleRoleClick(role.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, rgba(79,124,255,0.25), rgba(123,97,255,0.25))', border: '1px solid rgba(79,124,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {role.emoji}
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, padding: '3px 9px', borderRadius: 100, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', textTransform: 'uppercase' }}>
                  FREE
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 8 }}>{role.title}</div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  {role.domain}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                {role.projects} projects · {role.skills} skills
              </div>
            </div>
          ))}
        </div>

        {/* TOOLKIT PANEL */}
        {selectedRole && currentData && currentRole && (
          <div className="toolkit-panel" style={{ background: '#0f1624', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 20, overflow: 'hidden', marginBottom: 48 }}>
            {/* Panel header */}
            <div style={{ padding: '24px 28px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Selected Role</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{currentRole.title}</div>
                </div>
                <button onClick={() => setSelectedRole(null)} style={{ padding: '7px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ✕ Close
                </button>
              </div>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16 }} className="filter-scroll">
                {([
                  { key: 'skills' as const, label: '🗺️ Skill Map' },
                  { key: 'projects' as const, label: '🛠️ Project Playbooks' },
                  { key: 'bullets' as const, label: '📄 Resume Bullets' },
                ] as const).map(t => (
                  <button key={t.key} className={`panel-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '28px' }}>

              {/* ── TAB 1: SKILL MAP ── */}
              {activeTab === 'skills' && (
                <div>
                  <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                    {skillCats.map(cat => {
                      const skills = currentData.skillMap[cat.key]
                      return (
                        <div key={cat.key} style={{ background: `rgba(${cat.color === '#4F7CFF' ? '79,124,255' : cat.color === '#10b981' ? '16,185,129' : cat.color === '#f59e0b' ? '245,158,11' : '123,97,255'},0.05)`, border: `1px solid rgba(${cat.color === '#4F7CFF' ? '79,124,255' : cat.color === '#10b981' ? '16,185,129' : cat.color === '#f59e0b' ? '245,158,11' : '123,97,255'},0.2)`, borderRadius: 12, padding: 18 }}>
                          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: cat.color, textTransform: 'uppercase', marginBottom: 14 }}>
                            {cat.icon} {cat.label}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {skills.map((s, si) => (
                              <div key={si} className="skill-pill-wrap">
                                <div className="skill-pill" style={{ background: `rgba(${cat.color === '#4F7CFF' ? '79,124,255' : cat.color === '#10b981' ? '16,185,129' : cat.color === '#f59e0b' ? '245,158,11' : '123,97,255'},0.1)`, borderColor: `rgba(${cat.color === '#4F7CFF' ? '79,124,255' : cat.color === '#10b981' ? '16,185,129' : cat.color === '#f59e0b' ? '245,158,11' : '123,97,255'},0.2)`, color: cat.color }}>
                                  {s.skill} <span style={{ fontSize: 10, opacity: 0.6 }}>ⓘ</span>
                                </div>
                                <div className="skill-tip">
                                  <strong style={{ color: 'white' }}>Why this matters:</strong><br />{s.why}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Learning resources strip */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>How to learn these</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {currentData.learningResources.map((r, ri) => (
                        <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.2)', color: '#93BBFF', fontSize: 12, fontWeight: 600, transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,124,255,0.15)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(79,124,255,0.08)')}
                        >
                          {r.label} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: PROJECT PLAYBOOKS ── */}
              {activeTab === 'projects' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {currentProjects.map(project => {
                    const isOpen = expandedProject === project.id
                    const ds = difficultyStyle[project.difficulty]
                    return (
                      <div key={project.id} className={`project-card${isOpen ? ' open' : ''}`}>
                        {/* Collapsed header */}
                        <div
                          style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', flexWrap: 'wrap' }}
                          onClick={() => setExpandedProject(isOpen ? null : project.id)}
                        >
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: ds.bg, border: `1px solid ${ds.border}`, color: ds.color, fontWeight: 700 }}>
                              {project.difficulty}
                            </span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                              ⏱ {project.time}
                            </span>
                          </div>
                          <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 2 }}>{project.title}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{project.description}</div>
                          </div>
                          <span style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(79,124,255,0.35)', background: 'rgba(79,124,255,0.08)', color: '#93BBFF', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            {isOpen ? '▲ Hide' : '▼ See Playbook'}
                          </span>
                        </div>

                        {/* Expanded content */}
                        {isOpen && (
                          <div style={{ padding: '0 20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

                              {/* Context */}
                              <div>
                                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 8 }}>Context</div>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75 }}>{project.context}</p>
                              </div>

                              {/* Steps */}
                              <div>
                                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 12 }}>Step-by-Step</div>
                                <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  {project.steps.map((step, si) => (
                                    <li key={si} style={{ display: 'flex', gap: 12, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
                                      <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#93BBFF', marginTop: 2 }}>
                                        {si + 1}
                                      </span>
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>

                              {/* Output */}
                              <div>
                                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 8 }}>Expected Output</div>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>{project.output}</p>
                              </div>

                              {/* Showcase */}
                              <div>
                                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#93BBFF', textTransform: 'uppercase', marginBottom: 8 }}>How to Showcase</div>
                                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>{project.showcase}</p>
                              </div>

                              {/* Resume bullet */}
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#4F7CFF', textTransform: 'uppercase' }}>Resume Bullet</div>
                                  <button className={`copy-btn${copiedId === `resume-${project.id}` ? ' copied' : ''}`} onClick={() => copy(project.resumeBullet, `resume-${project.id}`)}>
                                    {copiedId === `resume-${project.id}` ? '✓ Copied' : 'Copy'}
                                  </button>
                                </div>
                                <div className="code-block">{project.resumeBullet}</div>
                              </div>

                              {/* LinkedIn post */}
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#7B61FF', textTransform: 'uppercase' }}>LinkedIn Post Template</div>
                                  <button className={`copy-btn${copiedId === `li-${project.id}` ? ' copied' : ''}`} onClick={() => copy(project.linkedinPost, `li-${project.id}`)}>
                                    {copiedId === `li-${project.id}` ? '✓ Copied' : 'Copy'}
                                  </button>
                                </div>
                                <div className="code-block" style={{ background: 'rgba(123,97,255,0.04)', borderColor: 'rgba(123,97,255,0.15)' }}>{project.linkedinPost}</div>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {currentProjects.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No projects yet for this role.</div>
                  )}
                </div>
              )}

              {/* ── TAB 3: RESUME BULLETS ── */}
              {activeTab === 'bullets' && (
                <div>
                  {/* Amber notice */}
                  <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#fcd34d', lineHeight: 1.6 }}>
                    ⚠️ These are templates. Replace <strong>[Brand]</strong>, <strong>[X%]</strong>, and bracketed specifics with your actual details before using.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {currentProjects.map(project => (
                      <div key={project.id} className="bullet-card">
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                          {project.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <p style={{ flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, margin: 0 }}>{project.resumeBullet}</p>
                          <button className={`copy-btn${copiedId === `bullet-${project.id}` ? ' copied' : ''}`} onClick={() => copy(project.resumeBullet, `bullet-${project.id}`)}>
                            {copiedId === `bullet-${project.id}` ? '✓ Copied' : 'Copy →'}
                          </button>
                        </div>
                      </div>
                    ))}
                    {currentProjects.length === 0 && (
                      <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No bullets yet for this role.</div>
                    )}
                  </div>

                  {/* CTA */}
                  <div style={{ marginTop: 28, background: 'linear-gradient(135deg,rgba(79,124,255,0.08),rgba(123,97,255,0.08))', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 16, padding: '24px', position: 'relative' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 6 }}>Want your resume reviewed with these projects included?</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Get personalized feedback on how to present these projects on your specific resume.</div>
                    <a href="/book" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 22px', borderRadius: 10, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', fontWeight: 700, fontSize: 14 }}>
                      Book a Session — ₹299 →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HOW IT WORKS */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 8 }}>How It Works</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Three steps. Real projects. Real results.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { step: '01', icon: '🎯', title: 'Pick your target role', desc: 'Choose from 15 internship roles across consulting, finance, marketing, BD, and operations.' },
              { step: '02', icon: '🛠️', title: 'Build 2-3 projects', desc: 'Follow the step-by-step playbooks. Each project takes 2-6 hours and produces a real portfolio piece.' },
              { step: '03', icon: '📄', title: 'Add to resume & LinkedIn', desc: 'Copy the ready-made resume bullets and LinkedIn post templates. Your profile immediately stands out.' },
            ].map(s => (
              <div key={s.step} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#4F7CFF', letterSpacing: 2, marginBottom: 12 }}>{s.step}</div>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div style={{ background: 'linear-gradient(135deg,rgba(79,124,255,0.08),rgba(123,97,255,0.06))', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 20, padding: 'clamp(28px,5vw,48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(79,124,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#4F7CFF', textTransform: 'uppercase', marginBottom: 12 }}>Ready to use these projects?</div>
          <h2 style={{ fontSize: 'clamp(20px,3.5vw,30px)', fontWeight: 800, letterSpacing: -0.75, color: 'white', marginBottom: 14, lineHeight: 1.2 }}>
            Projects get you ready.<br />Strategy gets you placed.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 28px' }}>
            The Career Toolkit builds your foundation. The Summer Internship Program gets you in front of the right companies to actually use it — with personalized strategy, mentor support, and warm introductions.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/summer" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 4px 20px rgba(79,124,255,0.35)' }}>
              Join Summer Program — ₹699 →
            </a>
            <a href="/book" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 24px', borderRadius: 12, border: '1.5px solid rgba(79,124,255,0.4)', background: 'rgba(79,124,255,0.08)', color: '#93BBFF', fontWeight: 700, fontSize: 15 }}>
              Book a 1:1 Session — ₹299
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}
