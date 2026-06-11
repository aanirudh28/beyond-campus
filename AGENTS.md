<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Beyond Campus — project brief

Career platform (beyond-campus.in) for non-tech Indian students (BBA/BCom, tier-2/3 colleges) chasing off-campus roles in consulting, finance, marketing, BD, ops, Founder's Office. Founder: Anirudh Agarwal (solo, non-technical — explain things plainly, give exact dashboard links and copy-paste SQL for manual steps).

## Stack & how it connects
- **Next.js 16.2.1** App Router, deployed on **Vercel Hobby** — auto-deploys every push to `master` on GitHub (`aanirudh28/beyond-campus`). No staging; push = production.
- **Supabase** (project ref `jpznmvkngoeoeprrckiv`): Postgres + Auth (email/password + Google + LinkedIn OIDC OAuth). Clients in `lib/supabase/{client,server}.ts`; root `proxy.ts` (Next 16's middleware) guards `/dashboard` and `/tracker`. **No migration tooling** — schema lives in `supabase/tracker-schema.sql` and the founder pastes SQL into the Supabase SQL editor manually.
- **Razorpay**: one-time payments only (no subscriptions). New flows verify HMAC signature (`/api/tracker/verify-pro-purchase`); legacy `/api/save-resource-purchase` is UNVERIFIED (known revenue hole, fix pending).
- **Resend**: all email, from `bookings@beyond-campus.in`. Free tier ≈100/day — nurture capped 70/run, jobs digest 25/run.
- **Anthropic**: `claude-haiku-4-5` for everything AI (roast, extraction, outreach gen, insights, jobs classification). Patterns in `lib/tracker.ts` + `app/api/resume-roast/route.ts`.
- **Vercel crons: HARD LIMIT 2, both used** — `/api/tracker/reminders` 03:30 UTC (also runs the jobs ATS sync) and `/api/nurture` 05:00 UTC (also sends Monday jobs digest). New daily work must chain into one of these, never add a third cron.

## Products & money
- Free: Resume Roast (AI, lead magnet), Job Tracker (`/tracker`, marketing page `/job-tracker`), resume builder, templates pages.
- **₹299 Resource Pack** = templates + LinkedIn scripts + resume guide + **Tracker Pro** (unlimited AI, full analytics). One purchase grants both directions; old ₹199 buyers grandfathered via email match (`syncProEntitlement` in `lib/tracker.ts`).
- ₹549 1:1 strategy session · ₹1,750 Internship Cohort · ₹2,500 Placement Cohort (the core business).
- Tracker free tier: UNLIMITED applications (deliberate), 5 AI generations/month (`ai_generations` count), analytics Pro-gated.

## Key features & where they live
- **Job Tracker**: `app/tracker/` (kanban, AI composer, streaks, analytics) + `app/components/tracker/` + API in `app/api/tracker/`. Client-side Supabase CRUD under RLS (`user_id = auth.uid()`, inserts MUST set user_id explicitly); service-role API routes only for AI/payments/cron/metering — authenticate callers via `getAuthedUser()` in `lib/tracker.ts`, never trust a userId from the body.
- **Jobs Engine**: curated fresher-job feed at `/tracker/jobs`; sources = public ATS APIs (Greenhouse/Lever/Ashby) watchlisted in admin → daily sync → Haiku filter → pending queue → founder approves. Logic in `lib/jobs.ts`, admin API `app/api/admin/jobs/`.
- **Nurture emails**: `app/api/nurture/route.ts` — drip sequences (tracker/roast/leads audiences), dedupe via `nurture_sends`, HMAC unsubscribe keyed on `CRON_SECRET`.
- **Admin**: `/admin`, password-POST pattern to `/api/admin/*` with service role. ⚠️ Password is hardcoded client-side (`beyondcampus2024`) — known critical issue, fix pending; several legacy tables also lack RLS.

## Decisions already made — do not re-propose
- **AI Target List generator was deliberately dropped**: it cannibalizes the cohort's personalized-targeting USP.
- Applications unlimited for free users; monetize only where cost accrues (AI + analytics).
- House UI: dark `#0B0B0F`, gradient `#4F7CFF→#7B61FF`, DM Serif Display (+italic) / DM Sans / Geist Mono via next/font vars, inline styles + `<style>` tags (minimal Tailwind), `'use client'` pages.

## Local quirks
- `.env.local` has ONLY Supabase anon keys + `ANTHROPIC_API_KEY`; service-role/Razorpay/Resend/`CRON_SECRET` exist only on Vercel → local builds need dummies: `SUPABASE_SERVICE_ROLE_KEY=dummy RAZORPAY_KEY_ID=dummy RAZORPAY_KEY_SECRET=dummy RESEND_API_KEY=dummy NEXT_PUBLIC_RAZORPAY_KEY_ID=dummy CRON_SECRET=dummy npm run build`.
- Repo lives in OneDrive → `.next` gets file-locked; `rm -rf .next` before builds when EPERM appears.
- The founder sometimes runs **two Claude windows in parallel** — always check `git log`/`git status` before assuming working-tree state, and don't be surprised if your uncommitted work gets committed by the other window.
- Lint has pre-existing errors in legacy pages; keep YOUR files clean (`npx eslint <paths>`), don't chase the rest.
