# 11 — Growth & SEO

## Naming

Recommendation: **"Apti" as the product surface, Beyond Campus as the brand** —
"Apti by Beyond Campus." Short, ownable, students already say "apti round"
colloquially (real search behavior: "apti questions for deloitte"). URL stays
beyond-campus.in/aptitude (domain authority compounds into the cohort site —
a separate domain would restart SEO from zero). Revisit a standalone domain
only if the product outgrows the brand.

## SEO architecture (the compounding asset)

All public pages server-rendered, interlinked, with 2–3 interactive sample
questions embedded (answerable without signup — the answer reveal IS the
conversion surface: "want the trap analysis on YOUR mistakes?").

1. **Topic hubs** `/aptitude/percentages` — what it is, formula card, shortcut
   sheet, 3 sample Qs with full layered explanations, common traps list,
   "estimated time to master," links to subtopic pages + relevant companies.
   ~60 pages. Targets "percentage aptitude questions," "percentage shortcuts."
2. **Company pages** `/aptitude/companies/deloitte` (doc 08) — targets
   "deloitte aptitude test pattern 2026," highest commercial intent. ~40 pages.
3. **Vendor decoder pages** `/aptitude/tests/shl` — "SHL test questions,"
   "AMCAT syllabus," "cut-e practice." Almost zero quality competition. ~8 pages.
4. **Question pages** `/aptitude/q/[slug]` — one page per *approved-for-SEO*
   question (curated subset, ~500 initially) with the full layered explanation.
   The LeetCode-discuss long-tail play: "shopkeeper marks up 40% discount 25%"
   queries. Canonicals + noindex on near-duplicates (respect the canonical-bug
   lessons from the jobs SEO work).
5. **Guides** — "aptitude preparation for BBA students," "placement test prep
   in 6 weeks," "negative marking strategy." ~15 cornerstone articles in the
   existing guides voice (no em dashes, no "non-target" framing, never close
   MBB doors — knowledge/analyst roles exist).

Every page: JSON-LD (Quiz/FAQ schema where legitimate), fast (static +
revalidate), internal links topic↔company↔question triangle.

## Distribution loops (ranked by expected yield for this audience)

1. **WhatsApp** (the real social network of tier-2/3 campuses):
   - Share cards (see below) sized for WhatsApp status
   - "Question of the day" broadcast channel; forwards carry a deep link
   - Study circles are WhatsApp-native by design (doc 09)
   - Fits existing distribution-strategy plan (WhatsApp drop + intern workflows)
2. **College ambassadors / TPO loop:** free college dashboard (participation,
   avg rating, mock turnout) for TPOs → TPO promotes Monthly Placement
   Readiness Test as "official practice" → whole cohorts sign up at once.
   Ambassador kit: poster PDFs, WhatsApp copy, a college-code link that
   attributes signups (extends the planned TPO outreach + 2-intern plan).
3. **Share cards** (image-gen at share time, house style, dark + gradient):
   rating milestone, streak milestone, readiness score, daily-challenge result
   ("solved in 3:41 — top 12% today. Can you beat me?" + link that opens the
   SAME 5 questions — the Wordle loop). Never auto-post; one-tap to WhatsApp/
   LinkedIn.
4. **LinkedIn:** milestone cards are inherently LinkedIn-shaped for this
   audience ("Day 50 of aptitude prep — Quant rating 1450"). Founder content
   engine: weekly "trap of the week" posts pulled straight from the trap_map
   library (content already written, zero marginal effort).
5. **Reels/Shorts** (per existing 2026 distribution plan): 30-second "trap"
   videos — show the wrong answer everyone picks, reveal why. The trap_map
   library is literally a Reels script backlog of 2,000 items.
6. **SEO** (above) — slowest, compounds hardest.

## Launch sequence

Soft-launch to the existing base first (tracker users + roast leads + nurture
list — thousands of warm emails already in-system; one nurture sequence slot):
"we built the aptitude platform we wished existed — free, actually free."
They seed percentiles, question stats, and the first 20 user-reported company
patterns before any public push. Then ambassadors + WhatsApp + a Product Hunt-
style LinkedIn founder post with the origin story.

## Growth guardrails

No dark patterns: no fake "3 friends joined," no contact-list scraping, no
share-to-unlock content (share unlocks only cosmetic/convenience things like
an extra streak freeze). The product's generosity IS the brand; every growth
tactic must survive the question "would a student respect this?"
