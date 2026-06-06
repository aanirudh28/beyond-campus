'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type PostType = 'experience' | 'stipend' | 'doubt'
type Stage = 'just_started' | 'active_hunter' | 'interview_stage' | 'placed'
type AspirantTier = 'trial' | 'cohort' | 'mentor'

interface Aspirant {
  number: number
  avatarSeed: string
  stage: Stage
  tier: AspirantTier
  streak: number
  lastMissionDate: string
  totalMissionsCompleted: number
  badges: string[]
  createdAt: string
}

interface StoredPost {
  id: string
  type: PostType
  content: string
  degree: string | null
  college_tier: string | null
  city: string | null
  domain: string | null
  tags: string[]
  created_at: string
  is_approved: boolean
}

interface Post {
  id: string
  type: PostType
  content: string
  degree: string | null
  college_tier: string | null
  city: string | null
  domain: string | null
  tags: string[]
  upvotes: number
  created_at: string
  reply_count?: number
}

interface Reply {
  id: string
  post_id: string
  content: string
  degree: string | null
  college_tier: string | null
  created_at: string
}

interface Win {
  id: string
  aspirantNumber: number
  avatarSeed: string
  role: string
  company: string
  tier: string
  city: string
  whatWorked: string
  created_at: string
  reactions: number
}

interface Mission {
  id: string
  text: string
  emoji: string
  category: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_BASE = 'https://api.dicebear.com/9.x/adventurer-neutral/svg'

const STAGES: Record<Stage, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  just_started:    { label: 'Just Started',    emoji: '🌱', color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)' },
  active_hunter:   { label: 'Active Hunter',   emoji: '🚀', color: '#4F7CFF', bg: 'rgba(79,124,255,0.12)',  border: 'rgba(79,124,255,0.3)' },
  interview_stage: { label: 'Interview Stage', emoji: '🎯', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)',  border: 'rgba(245,158,11,0.32)' },
  placed:          { label: 'Placed',          emoji: '🏆', color: '#fbbf24', bg: 'rgba(251,191,36,0.16)',  border: 'rgba(251,191,36,0.4)' },
}

const TIER_BADGES: Record<AspirantTier, { label: string; color: string; bg: string } | null> = {
  trial:  { label: 'Trial', color: '#93BBFF', bg: 'rgba(79,124,255,0.12)' },
  cohort: { label: 'Cohort ✓', color: '#34d399', bg: 'rgba(52,211,153,0.14)' },
  mentor: { label: 'Mentor ✓', color: '#fbbf24', bg: 'rgba(251,191,36,0.16)' },
}

const DAILY_MISSIONS: Mission[] = [
  { id: 'cold_3',       text: 'Send 3 cold emails to your target list',                       emoji: '✉️',  category: 'Outreach' },
  { id: 'linkedin_5',   text: 'Send 5 LinkedIn requests with personalized notes',             emoji: '🔗',  category: 'Outreach' },
  { id: 'target_10',    text: 'Add 10 new companies to your target list',                     emoji: '🎯',  category: 'Research' },
  { id: 'follow_3',     text: 'Send 3 follow-ups on cold emails from last week',              emoji: '↩️',  category: 'Outreach' },
  { id: 'mentor_q',     text: 'Drop one specific question in the War Room',                   emoji: '❓',  category: 'Community' },
  { id: 'resume_post',  text: 'Share your resume snippet for peer feedback',                  emoji: '📄',  category: 'Feedback' },
  { id: 'interview_30', text: 'Spend 30 minutes on case or interview prep',                   emoji: '📋',  category: 'Prep' },
  { id: 'win_share',    text: "Drop 🔥 on someone else's win on the Wall",                    emoji: '🎉',  category: 'Community' },
  { id: 'linkedin_h',   text: 'Polish your LinkedIn headline — one sharp line',               emoji: '✏️',  category: 'Profile' },
  { id: 'company_3',    text: 'Read 3 recent posts in a company War Room',                    emoji: '🏢',  category: 'Research' },
]

const COMPANY_CHANNELS = [
  { name: 'BCG',              members: 47, color: '#10b981' },
  { name: 'McKinsey',         members: 38, color: '#4F7CFF' },
  { name: 'Bain',             members: 22, color: '#ef4444' },
  { name: 'Big 4',            members: 89, color: '#7B61FF' },
  { name: 'Razorpay',         members: 31, color: '#06b6d4' },
  { name: 'Swiggy',           members: 24, color: '#f59e0b' },
  { name: 'Zepto',            members: 19, color: '#ec4899' },
  { name: 'Cred',             members: 17, color: '#8b5cf6' },
  { name: 'Goldman Sachs',    members: 14, color: '#fbbf24' },
  { name: "Founder's Office", members: 56, color: '#34d399' },
]

const MOCK_WINS: Win[] = [
  { id: 'w1', aspirantNumber: 4823, avatarSeed: 'win_4823_xa', role: 'BD Intern',           company: 'Razorpay',             tier: 'BCom · Tier 3', city: 'Delhi',     whatWorked: 'Cold-emailed the founder directly with a 3-line pitch — got a reply in 6 hours.', created_at: new Date(Date.now() - 30 * 60000).toISOString(),         reactions: 47 },
  { id: 'w2', aspirantNumber: 5102, avatarSeed: 'win_5102_yb', role: 'Analyst',             company: 'Big 4',                tier: 'BBA · Tier 2', city: 'Bangalore', whatWorked: 'Rewrote my resume around outcomes (not duties). Replies tripled in week 2.',      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),       reactions: 31 },
  { id: 'w3', aspirantNumber: 4711, avatarSeed: 'win_4711_zc', role: 'Marketing Intern',    company: 'Zepto',                tier: 'BBA · Tier 3', city: 'Mumbai',    whatWorked: 'Mentor intro to a hiring manager. Skipped the application queue.',                 created_at: new Date(Date.now() - 5 * 3600000).toISOString(),       reactions: 22 },
  { id: 'w4', aspirantNumber: 4509, avatarSeed: 'win_4509_wd', role: "Founder's Office",    company: 'Series B Fintech',     tier: 'BBA · Tier 2', city: 'Pune',      whatWorked: 'Followed up 4 times over 3 weeks before they replied. Persistence > talent.',     created_at: new Date(Date.now() - 8 * 3600000).toISOString(),       reactions: 38 },
  { id: 'w5', aspirantNumber: 4632, avatarSeed: 'win_4632_ve', role: 'Consulting Intern',   company: 'Boutique Firm',        tier: 'MBA · Tier 2', city: 'Delhi',     whatWorked: 'Switched my target from finance to consulting mid-cohort. Sharper positioning won.', created_at: new Date(Date.now() - 24 * 3600000).toISOString(),      reactions: 19 },
  { id: 'w6', aspirantNumber: 5421, avatarSeed: 'win_5421_uf', role: 'Finance Intern',      company: 'Fast-Growing Fintech', tier: 'BCom · Tier 2', city: 'Bangalore', whatWorked: 'Researched the team deeply before reaching out. Mentioned their last project.',    created_at: new Date(Date.now() - 36 * 3600000).toISOString(),      reactions: 27 },
]

// Recent active Aspirants to populate the Pulse avatar bar
const ACTIVE_ASPIRANTS = [
  { number: 4521, seed: 'aspirant_4521_ab', stage: 'active_hunter' as Stage },
  { number: 5102, seed: 'win_5102_yb',     stage: 'interview_stage' as Stage },
  { number: 4823, seed: 'win_4823_xa',     stage: 'placed' as Stage },
  { number: 4632, seed: 'win_4632_ve',     stage: 'placed' as Stage },
  { number: 4711, seed: 'win_4711_zc',     stage: 'placed' as Stage },
  { number: 4509, seed: 'win_4509_wd',     stage: 'placed' as Stage },
  { number: 5421, seed: 'win_5421_uf',     stage: 'placed' as Stage },
]

const TYPE_CONFIG: Record<PostType, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  experience: { label: 'Experience', emoji: '📖', color: '#4F7CFF', bg: 'rgba(79,124,255,0.12)',  border: 'rgba(79,124,255,0.28)' },
  stipend:    { label: 'Stipend',    emoji: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.28)' },
  doubt:      { label: 'Doubt',      emoji: '❓', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)',  border: 'rgba(245,158,11,0.32)' },
}

const DEGREE_OPTIONS = ['BBA', 'BCom', 'BA', 'BSc', 'BTech', 'MBA', 'Other']
const TIER_OPTIONS   = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4+']
const DOMAIN_OPTIONS = ['Consulting', 'Finance', "Founder's Office", 'Marketing', 'BD', 'Operations', 'Tech', 'HR', 'Other']
const YEAR_OPTIONS   = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post-Graduate']

const PLACEHOLDER_POSTS: Post[] = [
  { id: 'p1', type: 'experience', content: "Got a Founder's Office offer after 3 rounds — a task, a case discussion, and a founder call. No technical questions at all. Just thinking and communication.", degree: 'BBA', college_tier: 'Tier 2', city: 'Delhi',  domain: "Founder's Office", tags: ["Founder's Office", 'Interview'], upvotes: 47, created_at: new Date(Date.now() - 2 * 3600000).toISOString(), reply_count: 8 },
  { id: 'p2', type: 'stipend',    content: 'BD intern at a fintech startup — ₹12,000/month + ₹3,000 travel allowance. Remote for first month, hybrid after that.',                                                                          degree: 'BCom', college_tier: 'Tier 3', city: 'Mumbai', domain: 'BD',                tags: ['BD', 'Stipend', 'Fintech'], upvotes: 31, created_at: new Date(Date.now() - 5 * 3600000).toISOString(), reply_count: 3 },
  { id: 'p3', type: 'doubt',      content: "Has anyone gotten a Big 4 HR to reply via LinkedIn DM? Cold emails haven't worked for me in 3 weeks.",                                                                                            degree: 'BBA', college_tier: 'Tier 2', city: 'Pune',   domain: 'Consulting',        tags: ['Big 4', 'Cold Outreach'],    upvotes: 22, created_at: new Date(Date.now() - 8 * 3600000).toISOString(), reply_count: 14 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avatarUrl(seed: string, size = 80): string {
  return `${AVATAR_BASE}?seed=${encodeURIComponent(seed)}&size=${size}`
}

function todayStr(): string {
  return new Date().toDateString()
}

function getAspirant(): Aspirant | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('aspirant_v1')
    if (!raw) return null
    return JSON.parse(raw) as Aspirant
  } catch { return null }
}

function saveAspirant(a: Aspirant) {
  if (typeof window === 'undefined') return
  localStorage.setItem('aspirant_v1', JSON.stringify(a))
}

function claimAspirant(): Aspirant {
  const number = 4000 + Math.floor(Math.random() * 2000)
  const seed = `aspirant_${number}_${Math.random().toString(36).slice(2, 8)}`
  const aspirant: Aspirant = {
    number, avatarSeed: seed,
    stage: 'just_started',
    tier: 'trial',
    streak: 0,
    lastMissionDate: '',
    totalMissionsCompleted: 0,
    badges: [],
    createdAt: new Date().toISOString(),
  }
  saveAspirant(aspirant)
  return aspirant
}

function rerollAvatar(a: Aspirant): Aspirant {
  const updated = { ...a, avatarSeed: `${a.avatarSeed}_${Math.random().toString(36).slice(2, 5)}` }
  saveAspirant(updated)
  return updated
}

function completeMission(): Aspirant | null {
  const a = getAspirant()
  if (!a) return null
  const today = todayStr()
  if (a.lastMissionDate === today) return a
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  const newStreak = a.lastMissionDate === yesterday ? a.streak + 1 : 1
  const newBadges = new Set(a.badges)
  if (a.totalMissionsCompleted === 0) newBadges.add('first_mission')
  if (newStreak >= 5)  newBadges.add('streak_5')
  if (newStreak >= 10) newBadges.add('streak_10')
  if (newStreak >= 30) newBadges.add('streak_30')
  const updated: Aspirant = {
    ...a,
    streak: newStreak,
    lastMissionDate: today,
    totalMissionsCompleted: a.totalMissionsCompleted + 1,
    badges: Array.from(newBadges),
  }
  saveAspirant(updated)
  return updated
}

function pickTodayMission(streak: number): Mission {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return DAILY_MISSIONS[(dayOfYear + streak) % DAILY_MISSIONS.length]
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function getFingerprint(): string {
  if (typeof window === 'undefined') return 'server'
  let fp = localStorage.getItem('feedFingerprint')
  if (!fp) { fp = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('feedFingerprint', fp) }
  return fp
}

function getUpvotedSet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try { const raw = localStorage.getItem('feedUpvoted'); return raw ? new Set(JSON.parse(raw) as string[]) : new Set() } catch { return new Set() }
}

function saveUpvotedSet(s: Set<string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('feedUpvoted', JSON.stringify([...s]))
}

function getReactedWinsSet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try { const raw = localStorage.getItem('winsReacted'); return raw ? new Set(JSON.parse(raw) as string[]) : new Set() } catch { return new Set() }
}

function saveReactedWinsSet(s: Set<string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('winsReacted', JSON.stringify([...s]))
}

function getMyPosts(): StoredPost[] {
  if (typeof window === 'undefined') return []
  try { const raw = localStorage.getItem('feedMyPosts'); return raw ? JSON.parse(raw) as StoredPost[] : [] } catch { return [] }
}

function saveMyPost(post: StoredPost) {
  if (typeof window === 'undefined') return
  const existing = getMyPosts().filter(p => p.id !== post.id)
  localStorage.setItem('feedMyPosts', JSON.stringify([post, ...existing]))
}

// Seed a deterministic avatar for legacy posts that don't have an aspirant attached
function seedFromPostId(id: string): string {
  return `post_${id}`
}

// ─── Avatar Component ────────────────────────────────────────────────────────

interface AvatarProps {
  seed: string
  size: number
  ring?: string
  badge?: string
}
function Avatar({ seed, size, ring, badge }: AvatarProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <img
        src={avatarUrl(seed, size * 2)}
        alt=""
        width={size}
        height={size}
        style={{
          width: size, height: size, borderRadius: '50%',
          background: '#1f2937', display: 'block',
          boxShadow: ring ? `0 0 0 2px ${ring}, 0 0 16px ${ring}33` : '0 0 0 1px rgba(255,255,255,0.05)',
        }}
      />
      {badge && (
        <span style={{
          position: 'absolute', bottom: -2, right: -2,
          fontSize: Math.max(10, size * 0.32), lineHeight: 1,
          background: '#0B0B0F',
          borderRadius: '50%',
          width: Math.max(16, size * 0.4), height: Math.max(16, size * 0.4),
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #0B0B0F',
        }}>{badge}</span>
      )}
    </div>
  )
}

function AspirantTag({ aspirant, size = 'sm' }: { aspirant: Aspirant; size?: 'sm' | 'md' }) {
  const stageCfg = STAGES[aspirant.stage]
  const tierCfg  = TIER_BADGES[aspirant.tier]
  const avatarSize = size === 'md' ? 36 : 28
  const isPlaced = aspirant.stage === 'placed'
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Avatar seed={aspirant.avatarSeed} size={avatarSize} ring={stageCfg.color + '66'} badge={isPlaced ? '🏆' : undefined} />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.2 }}>
          <span style={{ fontWeight: 800, color: 'white', fontSize: size === 'md' ? 15 : 13 }}>@{aspirant.number}</span>
          {tierCfg && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 100, color: tierCfg.color, background: tierCfg.bg, letterSpacing: 0.3 }}>
              {tierCfg.label}
            </span>
          )}
          {aspirant.streak > 0 && (
            <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              🔥 {aspirant.streak}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: stageCfg.color, fontWeight: 600, marginTop: 1 }}>
          {stageCfg.emoji} {stageCfg.label}
        </div>
      </div>
    </div>
  )
}

// ─── Pulse Strip ─────────────────────────────────────────────────────────────

function PulseStrip({ postCount, winCount, onlineCount }: { postCount: number; winCount: number; onlineCount: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      padding: '16px 22px',
      background: 'linear-gradient(90deg, rgba(79,124,255,0.08), rgba(16,185,129,0.05), rgba(251,191,36,0.06))',
      border: '1px solid rgba(79,124,255,0.18)',
      borderRadius: 16,
      marginBottom: 24,
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingRight: 16, borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse-dot 1.6s ease-in-out infinite' }} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#34d399', textTransform: 'uppercase' }}>Live</span>
      </div>
      <PulseStat label="Aspirants online" value={onlineCount} color="#34d399" />
      <PulseStat label="Posts this week"  value={postCount}   color="#4F7CFF" />
      <PulseStat label="Wins this month"  value={winCount}    color="#fbbf24" />
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {ACTIVE_ASPIRANTS.slice(0, 6).map((a, i) => (
          <div key={a.number} style={{ marginLeft: i === 0 ? 0 : -10, position: 'relative', zIndex: ACTIVE_ASPIRANTS.length - i }}>
            <Avatar seed={a.seed} size={32} ring={STAGES[a.stage].color + '88'} />
          </div>
        ))}
        <span style={{ marginLeft: 12, fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>active now</span>
      </div>
    </div>
  )
}

function PulseStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: -0.5 }}>{value}</span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{label}</span>
    </div>
  )
}

// ─── Mission Card ────────────────────────────────────────────────────────────

function MissionCard({ aspirant, onComplete }: { aspirant: Aspirant; onComplete: () => void }) {
  const mission = pickTodayMission(aspirant.streak)
  const doneToday = aspirant.lastMissionDate === todayStr()

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(79,124,255,0.1) 0%, rgba(123,97,255,0.04) 100%)',
      border: '1px solid rgba(79,124,255,0.32)',
      borderRadius: 20,
      padding: '24px 26px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'radial-gradient(circle, rgba(79,124,255,0.2), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2.5, color: '#93BBFF', textTransform: 'uppercase' }}>Today's Mission · {mission.category}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(251,191,36,0.14)', border: '1px solid rgba(251,191,36,0.32)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>
              🔥 {aspirant.streak} {aspirant.streak === 1 ? 'day' : 'days'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              {aspirant.totalMissionsCompleted} done total
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, flexShrink: 0,
          }}>{mission.emoji}</div>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, color: 'white', lineHeight: 1.3, margin: 0 }}>
            {mission.text}
          </h3>
        </div>
        <button
          onClick={onComplete}
          disabled={doneToday}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 100,
            background: doneToday ? 'rgba(52,211,153,0.18)' : 'linear-gradient(135deg, #4F7CFF, #7B61FF)',
            border: doneToday ? '1px solid rgba(52,211,153,0.4)' : 'none',
            color: doneToday ? '#6ee7b7' : 'white',
            fontSize: 14, fontWeight: 800,
            cursor: doneToday ? 'default' : 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s',
          }}
        >
          {doneToday ? '✓ Done today — streak locked in' : 'Mark complete ✓'}
        </button>
        {!doneToday && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 12, lineHeight: 1.6 }}>
            Marking complete protects your streak. Skip a day and it resets to 0.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Wins Wall ───────────────────────────────────────────────────────────────

function WinsWall({ wins, reacted, onReact }: { wins: Win[]; reacted: Set<string>; onReact: (id: string) => void }) {
  return (
    <div style={{
      background: '#111827',
      border: '1px solid rgba(251,191,36,0.18)',
      borderRadius: 20,
      padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(251,191,36,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏆</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Wins Wall</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Recent offers · live</div>
          </div>
        </div>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24', animation: 'pulse-dot 1.8s ease-in-out infinite', display: 'inline-block' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {wins.map(w => (
          <WinCard key={w.id} win={w} reacted={reacted.has(w.id)} onReact={() => onReact(w.id)} />
        ))}
      </div>
    </div>
  )
}

function WinCard({ win, reacted, onReact }: { win: Win; reacted: boolean; onReact: () => void }) {
  const baseCount = win.reactions
  return (
    <div style={{
      padding: '14px 14px 12px',
      background: 'rgba(251,191,36,0.04)',
      border: '1px solid rgba(251,191,36,0.14)',
      borderRadius: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <Avatar seed={win.avatarSeed} size={36} ring="rgba(251,191,36,0.4)" badge="🏆" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>@{win.aspirantNumber}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>· {timeAgo(win.created_at)}</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{win.tier} · {win.city}</div>
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
          Just landed a{' '}
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>{win.role}</span>{' '}
          at <span style={{ color: 'white', fontWeight: 700 }}>{win.company}</span>
        </span>
      </div>
      {win.whatWorked && (
        <div style={{
          padding: '10px 12px', marginBottom: 12,
          background: 'rgba(255,255,255,0.025)', borderRadius: 10,
          borderLeft: '2px solid rgba(251,191,36,0.4)',
          fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, fontStyle: 'italic',
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: '#fbbf24', textTransform: 'uppercase', marginRight: 8 }}>What worked</span>
          {win.whatWorked}
        </div>
      )}
      <button
        onClick={onReact}
        disabled={reacted}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 100,
          background: reacted ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${reacted ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)'}`,
          color: reacted ? '#fbbf24' : 'rgba(255,255,255,0.55)',
          fontSize: 12, fontWeight: 700,
          cursor: reacted ? 'default' : 'pointer',
          fontFamily: 'inherit', transition: 'all 0.2s',
        }}
      >
        🔥 {reacted ? baseCount + 1 : baseCount}
      </button>
    </div>
  )
}

// ─── Company Channels ────────────────────────────────────────────────────────

function CompanyChannels({ active, onPick }: { active: string | null; onPick: (name: string | null) => void }) {
  return (
    <div style={{
      background: '#111827',
      border: '1px solid rgba(79,124,255,0.16)',
      borderRadius: 20,
      padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Company War Rooms</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Concentrated intel per target</div>
        </div>
        {active && (
          <button onClick={() => onPick(null)} style={{ background: 'none', border: 'none', color: '#93BBFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Clear ×
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {COMPANY_CHANNELS.map(c => {
          const isActive = active === c.name
          return (
            <button
              key={c.name}
              onClick={() => onPick(isActive ? null : c.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: isActive ? c.color + '20' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? c.color + '55' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? 'white' : 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{c.members} hunting</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── War Room Post Card ──────────────────────────────────────────────────────

interface PostCardProps {
  post: Post
  upvoted: boolean
  onUpvoteChange: (id: string) => void
  isPlaceholder?: boolean
  isPending?: boolean
}

function PostCard({ post, upvoted, onUpvoteChange, isPlaceholder, isPending }: PostCardProps) {
  const [showReplies, setShowReplies]   = useState(false)
  const [replies, setReplies]           = useState<Reply[]>([])
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [replyText, setReplyText]       = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [replySuccess, setReplySuccess] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes)
  const [localUpvoted, setLocalUpvoted] = useState(upvoted)
  const [upvoteLoading, setUpvoteLoading] = useState(false)
  const [expanded, setExpanded]         = useState(false)

  const cfg = TYPE_CONFIG[post.type]
  const seed = seedFromPostId(post.id)
  const aspirantNum = 4000 + (parseInt(post.id.replace(/\D/g, '').slice(-3) || '521', 10) % 2000)
  const isLong = post.content.length > 240

  const handleUpvote = async () => {
    if (isPlaceholder || upvoteLoading) return
    setUpvoteLoading(true)
    const fp = getFingerprint()
    const optimisticUpvoted = !localUpvoted
    setLocalUpvoted(optimisticUpvoted)
    setLocalUpvotes(localUpvoted ? localUpvotes - 1 : localUpvotes + 1)
    try {
      const res = await fetch('/api/feed/upvote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id, fingerprint: fp }),
      })
      const json = await res.json()
      if (typeof json.upvotes === 'number') {
        setLocalUpvotes(json.upvotes); setLocalUpvoted(json.upvoted)
        const set = getUpvotedSet()
        if (json.upvoted) set.add(post.id); else set.delete(post.id)
        saveUpvotedSet(set)
      }
    } catch {
      setLocalUpvoted(!optimisticUpvoted); setLocalUpvotes(post.upvotes)
    }
    setUpvoteLoading(false)
    onUpvoteChange(post.id)
  }

  const toggleReplies = async () => {
    if (isPlaceholder) { setShowReplies(v => !v); return }
    if (!showReplies) {
      setShowReplies(true)
      if (replies.length === 0) {
        setRepliesLoading(true)
        try { const res = await fetch(`/api/feed/replies?post_id=${post.id}`); const json = await res.json(); if (json.replies) setReplies(json.replies) } catch {}
        setRepliesLoading(false)
      }
    } else { setShowReplies(false) }
  }

  const submitReply = async () => {
    if (!replyText.trim() || replySubmitting) return
    if (isPlaceholder) { setReplySuccess(true); setReplyText(''); setTimeout(() => setReplySuccess(false), 3000); return }
    setReplySubmitting(true)
    try {
      await fetch('/api/feed/replies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id, content: replyText.trim() }),
      })
      setReplySuccess(true); setReplyText(''); setTimeout(() => setReplySuccess(false), 3500)
    } catch {}
    setReplySubmitting(false)
  }

  return (
    <article style={{
      padding: '18px 20px 14px',
      background: '#111827',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      transition: 'border-color 0.2s',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <Avatar seed={seed} size={40} ring={cfg.color + '44'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: 'white', fontSize: 13.5 }}>@{aspirantNum}</span>
            {post.degree && (<span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{post.degree}{post.college_tier ? ` · ${post.college_tier}` : ''}{post.city ? ` · ${post.city}` : ''}</span>)}
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>· {timeAgo(post.created_at)}</span>
          </div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, letterSpacing: 0.5 }}>
              {cfg.emoji} {cfg.label.toUpperCase()}
            </span>
            {isPending && (
              <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                ⏳ Under Review
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <p style={{
        fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: expanded || !isLong ? 999 : 4,
        WebkitBoxOrient: 'vertical' as never,
        margin: '0 0 10px',
      }}>
        {post.content}
      </p>
      {isLong && (
        <button onClick={() => setExpanded(v => !v)} style={{ background: 'none', border: 'none', color: '#93BBFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '0 0 12px', fontFamily: 'inherit' }}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {post.tags.map(tag => (
            <span key={tag} style={{ padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={handleUpvote} disabled={upvoteLoading || isPlaceholder} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 100,
          background: localUpvoted ? 'rgba(79,124,255,0.15)' : 'transparent',
          border: `1px solid ${localUpvoted ? 'rgba(79,124,255,0.32)' : 'transparent'}`,
          color: localUpvoted ? '#93BBFF' : 'rgba(255,255,255,0.5)',
          fontSize: 13, fontWeight: 700,
          cursor: isPlaceholder ? 'default' : 'pointer', fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}>
          <span style={{ fontSize: 14 }}>▲</span> {localUpvotes}
        </button>
        <button onClick={toggleReplies} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 100,
          background: showReplies ? 'rgba(79,124,255,0.1)' : 'transparent',
          border: '1px solid transparent',
          color: showReplies ? '#93BBFF' : 'rgba(255,255,255,0.5)',
          fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}>
          💬 {post.reply_count ?? 0}
        </button>
      </div>

      {/* Replies */}
      {showReplies && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {repliesLoading && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Loading replies...</div>}
          {!repliesLoading && replies.length === 0 && !isPlaceholder && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', padding: '4px 0 12px' }}>No replies yet. Be the first.</div>
          )}
          {replies.map(r => {
            const rSeed = `reply_${r.id}`
            const rNum = 4000 + (parseInt(r.id.replace(/\D/g, '').slice(-3) || '101', 10) % 2000)
            return (
              <div key={r.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                <Avatar seed={rSeed} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, color: 'white' }}>@{rNum}</span>
                    {r.degree ? ` · ${r.degree}` : ''}
                    {' · '}{timeAgo(r.created_at)}
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, margin: 0 }}>{r.content}</p>
                </div>
              </div>
            )
          })}
          {replySuccess ? (
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 13, color: '#6ee7b7', fontWeight: 600, marginTop: 10 }}>
              ✓ Reply submitted! It'll appear after review.
            </div>
          ) : (
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Drop a quick reply..."
                style={{ flex: 1, padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <button onClick={submitReply} disabled={!replyText.trim() || replySubmitting} style={{
                padding: '9px 16px', borderRadius: 10,
                background: replyText.trim() ? 'rgba(79,124,255,0.85)' : 'rgba(255,255,255,0.06)',
                border: 'none',
                color: replyText.trim() ? 'white' : 'rgba(255,255,255,0.35)',
                fontSize: 12, fontWeight: 800, cursor: replyText.trim() ? 'pointer' : 'default', fontFamily: 'inherit',
              }}>
                {replySubmitting ? '...' : 'Reply'}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '18px 20px', marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'skel 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 12, width: 120, borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 8, animation: 'skel 1.5s ease-in-out infinite' }} />
          <div style={{ height: 10, width: 80, borderRadius: 4, background: 'rgba(255,255,255,0.05)', animation: 'skel 1.5s ease-in-out infinite 0.1s' }} />
        </div>
      </div>
      <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.05)', marginBottom: 8, animation: 'skel 1.5s ease-in-out infinite' }} />
      <div style={{ height: 12, width: '88%', borderRadius: 4, background: 'rgba(255,255,255,0.05)', marginBottom: 8, animation: 'skel 1.5s ease-in-out infinite 0.1s' }} />
      <div style={{ height: 12, width: '64%', borderRadius: 4, background: 'rgba(255,255,255,0.05)', animation: 'skel 1.5s ease-in-out infinite 0.2s' }} />
    </div>
  )
}

// ─── Submit Modal (preserved largely from existing) ──────────────────────────

interface SubmitModalProps {
  mode: 'experience' | 'doubt'
  onClose: () => void
  onPosted: () => void
}
function SubmitModal({ mode, onClose, onPosted }: SubmitModalProps) {
  const isDoubt = mode === 'doubt'
  const [step, setStep]       = useState(1)
  const [postType, setPostType] = useState<PostType>(isDoubt ? 'doubt' : 'experience')
  const [content, setContent] = useState('')
  const [degree, setDegree]   = useState('')
  const [tier, setTier]       = useState('')
  const [city, setCity]       = useState('')
  const [year, setYear]       = useState('')
  const [domain, setDomain]   = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [submitError, setSubmitError] = useState('')

  const canProceed = content.trim().length >= 20

  const handleSubmit = async () => {
    if (!canProceed || submitting) return
    setSubmitting(true); setSubmitError('')
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      const res = await fetch('/api/feed/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: postType, content: content.trim(), degree: degree || null, college_tier: tier || null, city: city.trim() || null, year_of_study: year || null, domain: domain || null, tags }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      const json = await res.json()
      saveMyPost({
        id: json.post?.id || `local_${Date.now()}`,
        type: postType, content: content.trim(),
        degree: degree || null, college_tier: tier || null, city: city.trim() || null,
        domain: domain || null, tags,
        created_at: new Date().toISOString(), is_approved: false,
      })
      onPosted(); setSubmitted(true)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#111827', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.08)',
        width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
        position: 'relative', padding: '32px 32px 28px',
        animation: 'modalIn 0.22s ease both',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 4 }}>×</button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: -0.5 }}>Submitted!</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
              Your post is under review and will go live shortly. Find it in My Posts.
            </p>
            <button onClick={onClose} style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Back to War Room
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: isDoubt ? '#f59e0b' : '#4F7CFF', textTransform: 'uppercase', marginBottom: 8 }}>
                {isDoubt ? '❓ Ask a Question' : '✍️ Share Experience'}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: -0.5, margin: 0 }}>
                {isDoubt ? 'Ask the community' : 'Share your story'}
              </h2>
            </div>
            {!isDoubt && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                {[1, 2].map(s => (
                  <div key={s} style={{ height: 3, flex: 1, borderRadius: 10, background: step >= s ? '#4F7CFF' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                ))}
              </div>
            )}
            {(step === 1 || isDoubt) && (
              <div>
                {!isDoubt && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {(['experience', 'stipend'] as const).map(t => (
                      <button key={t} onClick={() => setPostType(t)} style={{
                        flex: 1, padding: '10px 12px', borderRadius: 10,
                        border: `1.5px solid ${postType === t ? TYPE_CONFIG[t].border : 'rgba(255,255,255,0.1)'}`,
                        background: postType === t ? TYPE_CONFIG[t].bg : 'transparent',
                        color: postType === t ? TYPE_CONFIG[t].color : 'rgba(255,255,255,0.5)',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                      }}>
                        {TYPE_CONFIG[t].emoji} {TYPE_CONFIG[t].label}
                      </button>
                    ))}
                  </div>
                )}
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                  {isDoubt ? 'Your question' : postType === 'stipend' ? 'Stipend details' : 'What happened?'}
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={isDoubt ? "e.g. Has anyone gotten a Big 4 HR to reply on LinkedIn?" : postType === 'stipend' ? "e.g. BD intern at a Series B startup — ₹12,000/month + ₹2,000 travel..." : "e.g. Got a Founder's Office offer after 3 rounds. Here's what happened..."}
                  rows={5}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, marginBottom: 4, boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: 11, color: content.length >= 20 ? 'rgba(16,185,129,0.7)' : 'rgba(255,255,255,0.2)', textAlign: 'right', marginBottom: 16 }}>
                  {content.length} chars {content.length < 20 ? '(min 20)' : '✓'}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Domain</label>
                  <select value={domain} onChange={e => setDomain(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: domain ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
                    <option value="">Select domain (optional)</option>
                    {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Tags (comma separated)</label>
                  <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="e.g. Big 4, Cold Outreach, Fintech" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                {submitError && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>{submitError}</div>
                )}
                <button onClick={isDoubt ? handleSubmit : () => canProceed && setStep(2)} disabled={!canProceed || submitting} style={{
                  width: '100%', padding: '14px', borderRadius: 14,
                  background: canProceed ? (isDoubt ? 'rgba(245,158,11,0.85)' : 'linear-gradient(135deg,#4F7CFF,#7B61FF)') : 'rgba(255,255,255,0.07)',
                  border: 'none', color: canProceed ? 'white' : 'rgba(255,255,255,0.3)',
                  fontSize: 14, fontWeight: 800, cursor: canProceed ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all 0.2s',
                }}>
                  {isDoubt ? (submitting ? 'Submitting...' : 'Submit Question →') : 'Next: Add your details →'}
                </button>
              </div>
            )}
            {!isDoubt && step === 2 && (
              <div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20, lineHeight: 1.6 }}>
                  These stay anonymous — only degree, tier, and city show. No names, no colleges.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Degree</label>
                    <select value={degree} onChange={e => setDegree(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: degree ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
                      <option value="">Select</option>
                      {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>College Tier</label>
                    <select value={tier} onChange={e => setTier(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: tier ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
                      <option value="">Select</option>
                      {TIER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>City</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Delhi" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Year</label>
                    <select value={year} onChange={e => setYear(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: year ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
                      <option value="">Select</option>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                {submitError && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>{submitError}</div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ padding: '13px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
                  <button onClick={handleSubmit} disabled={submitting} style={{ flex: 1, padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', border: 'none', color: 'white', fontSize: 14, fontWeight: 800, cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                    {submitting ? 'Submitting...' : 'Submit Post →'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Aspirant Claim Hero ─────────────────────────────────────────────────────

function ClaimHero({ onClaim }: { onClaim: () => void }) {
  const sampleSeed = `preview_${Math.floor(Math.random() * 100)}`
  return (
    <div style={{
      padding: '40px 32px',
      background: 'linear-gradient(160deg, rgba(79,124,255,0.12) 0%, rgba(123,97,255,0.05) 100%)',
      border: '1px solid rgba(79,124,255,0.32)',
      borderRadius: 24,
      marginBottom: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, background: 'radial-gradient(circle, rgba(79,124,255,0.2), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ marginLeft: i === 0 ? 0 : -14 }}>
              <Avatar seed={`${sampleSeed}_${i}`} size={56} ring="rgba(79,124,255,0.5)" />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'white', lineHeight: 1.2, marginBottom: 8, letterSpacing: -0.5 }}>
            Claim your Aspirant identity
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: 18 }}>
            Get a unique number, a character, a daily mission, and a streak. Anonymous to the world, identifiable inside. <strong style={{ color: 'white' }}>Read freely either way</strong> — but to post, react, and run a streak, you need an Aspirant.
          </p>
          <button onClick={onClaim} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 26px', borderRadius: 100,
            background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)',
            border: 'none', color: 'white', fontSize: 14, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 0 28px rgba(79,124,255,0.4)',
          }}>
            🎲 Claim my Aspirant →
          </button>
        </div>
      </div>
    </div>
  )
}

function AspirantWelcomeBack({ aspirant, onReroll, onChangeStage }: { aspirant: Aspirant; onReroll: () => void; onChangeStage: (s: Stage) => void }) {
  const stageCfg = STAGES[aspirant.stage]
  const tierCfg  = TIER_BADGES[aspirant.tier]
  const [showStage, setShowStage] = useState(false)
  return (
    <div style={{
      padding: '20px 24px',
      background: '#111827',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      marginBottom: 24,
      display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
    }}>
      <Avatar seed={aspirant.avatarSeed} size={64} ring={stageCfg.color + '66'} badge={aspirant.stage === 'placed' ? '🏆' : undefined} />
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Welcome back</span>
          {tierCfg && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, color: tierCfg.color, background: tierCfg.bg, letterSpacing: 0.3 }}>{tierCfg.label}</span>
          )}
        </div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'white', lineHeight: 1.2, letterSpacing: -0.5, marginTop: 2 }}>
          @{aspirant.number}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowStage(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 100,
              background: stageCfg.bg, border: `1px solid ${stageCfg.border}`,
              color: stageCfg.color, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {stageCfg.emoji} {stageCfg.label} <span style={{ opacity: 0.6 }}>▾</span>
          </button>
          <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>🔥 {aspirant.streak}-day streak</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{aspirant.totalMissionsCompleted} missions done</span>
        </div>
        {showStage && (
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {(Object.keys(STAGES) as Stage[]).map(s => {
              const sc = STAGES[s]
              const active = s === aspirant.stage
              return (
                <button key={s} onClick={() => { onChangeStage(s); setShowStage(false) }} style={{
                  padding: '4px 10px', borderRadius: 100,
                  background: active ? sc.bg : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? sc.border : 'rgba(255,255,255,0.08)'}`,
                  color: active ? sc.color : 'rgba(255,255,255,0.55)',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {sc.emoji} {sc.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
      <button onClick={onReroll} style={{ padding: '8px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
        🎲 Reroll avatar
      </button>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [aspirant, setAspirant]         = useState<Aspirant | null>(null)
  const [posts, setPosts]               = useState<Post[]>(PLACEHOLDER_POSTS)
  const [loading, setLoading]           = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeSort, setActiveSort]     = useState<'popular' | 'recent' | 'discussed'>('popular')
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [upvotedSet, setUpvotedSet]     = useState<Set<string>>(new Set())
  const [reactedWins, setReactedWins]   = useState<Set<string>>(new Set())
  const [scrollY, setScrollY]           = useState(0)
  const [modal, setModal]               = useState<'experience' | 'doubt' | null>(null)
  const [myPosts, setMyPosts]           = useState<StoredPost[]>([])
  const [claimCelebrate, setClaimCelebrate] = useState(false)

  const refreshMyPosts = () => setMyPosts(getMyPosts())

  useEffect(() => {
    setAspirant(getAspirant())
    setUpvotedSet(getUpvotedSet())
    setReactedWins(getReactedWinsSet())
    setMyPosts(getMyPosts())
  }, [])

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const fetchPosts = useCallback(async () => {
    if (activeFilter === 'My Posts') { setLoading(false); return }
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('sort', activeSort); params.set('limit', '40')
      if (activeFilter === 'Experiences') params.set('type', 'experience')
      else if (activeFilter === 'Stipends') params.set('type', 'stipend')
      else if (activeFilter === 'Doubts') params.set('type', 'doubt')
      const res = await fetch(`/api/feed/posts?${params.toString()}`)
      const json = await res.json()
      if (json.posts && Array.isArray(json.posts)) {
        let result: Post[] = json.posts.length > 0 ? json.posts : PLACEHOLDER_POSTS
        if (activeChannel) {
          result = result.filter(p => p.tags?.some(t => t.toLowerCase().includes(activeChannel.toLowerCase())) || p.content.toLowerCase().includes(activeChannel.toLowerCase()))
          if (result.length === 0) result = []
        }
        setPosts(result)
      } else {
        setPosts(PLACEHOLDER_POSTS)
      }
    } catch {
      setPosts(PLACEHOLDER_POSTS)
    }
    setLoading(false)
  }, [activeFilter, activeSort, activeChannel])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleClaim = () => {
    const a = claimAspirant()
    setAspirant(a)
    setClaimCelebrate(true)
    setTimeout(() => setClaimCelebrate(false), 3500)
  }

  const handleReroll = () => {
    if (!aspirant) return
    setAspirant(rerollAvatar(aspirant))
  }

  const handleChangeStage = (s: Stage) => {
    if (!aspirant) return
    const updated = { ...aspirant, stage: s }
    saveAspirant(updated)
    setAspirant(updated)
  }

  const handleCompleteMission = () => {
    const updated = completeMission()
    if (updated) setAspirant(updated)
  }

  const handleReactWin = (winId: string) => {
    if (reactedWins.has(winId)) return
    const next = new Set(reactedWins); next.add(winId)
    setReactedWins(next); saveReactedWinsSet(next)
  }

  const handleUpvoteRefresh = useCallback(() => {
    setUpvotedSet(getUpvotedSet())
  }, [])

  const isPlaceholder = (id: string) => ['p1', 'p2', 'p3'].includes(id)
  const FILTER_TABS = ['All', 'Experiences', 'Stipends', 'Doubts', ...(aspirant ? ['My Posts'] : [])]
  const SORT_OPTIONS: { key: 'popular' | 'recent' | 'discussed'; label: string }[] = [
    { key: 'popular',   label: 'Top' },
    { key: 'recent',    label: 'Recent' },
    { key: 'discussed', label: 'Discussed' },
  ]

  const postCount = posts.length
  const winCount  = MOCK_WINS.length
  const onlineCount = 23 + (new Date().getMinutes() % 17)  // pseudo-live

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: "'DM Sans', 'Inter', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        input, textarea, select { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        select option { background: #1f2937; color: white; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        @keyframes skel { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes modalIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:0.55} 50%{transform:scale(1.55);opacity:1} }
        @keyframes confetti { 0%{transform:translateY(-30px) rotate(0)} 100%{transform:translateY(120vh) rotate(720deg)} }

        .layout-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr); gap: 24px; }
        @media (max-width: 980px) {
          .layout-grid { grid-template-columns: 1fr; }
        }

        .filter-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .filter-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrollY > 40 ? '14px 32px' : '20px 32px',
        background: scrollY > 40 ? 'rgba(11,11,15,0.88)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s', gap: 16, flexWrap: 'wrap',
      }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <a href="/community" style={{ padding: '7px 14px', fontSize: 13, fontWeight: 700, color: '#93BBFF', background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100 }}>Mission Control</a>
          <a href="/free" style={{ padding: '7px 14px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Resources</a>
          <a href="/cohort" style={{ padding: '8px 18px', fontSize: 13, fontWeight: 700, borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white' }}>Join Cohort</a>
          {aspirant && <AspirantTag aspirant={aspirant} />}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '120px 24px 40px', maxWidth: 1200, margin: '0 auto', animation: 'fadeUp 0.6s ease both' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 800, color: '#93BBFF', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 22 }}>
            Mission Control
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(36px,5vw,60px)', lineHeight: 1.08, letterSpacing: -1.5, fontWeight: 400, marginBottom: 16 }}>
            The off-campus hunter's daily HQ
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            Live activity. Daily missions. Real wins. Mentor presence. Anonymous to the world, identifiable inside.
          </p>
        </div>

        <PulseStrip postCount={postCount} winCount={winCount} onlineCount={onlineCount} />

        {!aspirant ? (
          <ClaimHero onClaim={handleClaim} />
        ) : (
          <AspirantWelcomeBack aspirant={aspirant} onReroll={handleReroll} onChangeStage={handleChangeStage} />
        )}

        {aspirant && (
          <MissionCard aspirant={aspirant} onComplete={handleCompleteMission} />
        )}
      </section>

      {/* MAIN GRID */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px 80px' }}>
        <div className="layout-grid">
          {/* LEFT: War Room */}
          <div>
            {/* War Room header + tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(79,124,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💬</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: -0.3 }}>The War Room</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                    {activeChannel ? `Filtered: ${activeChannel}` : 'All posts · live'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setModal('experience')}
                  disabled={!aspirant}
                  title={aspirant ? '' : 'Claim your Aspirant to post'}
                  style={{
                    padding: '8px 16px', borderRadius: 100,
                    background: aspirant ? 'linear-gradient(135deg,#4F7CFF,#7B61FF)' : 'rgba(255,255,255,0.04)',
                    border: aspirant ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    color: aspirant ? 'white' : 'rgba(255,255,255,0.35)',
                    fontSize: 13, fontWeight: 700, cursor: aspirant ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  }}
                >
                  ✍️ Share
                </button>
                <button
                  onClick={() => setModal('doubt')}
                  disabled={!aspirant}
                  title={aspirant ? '' : 'Claim your Aspirant to post'}
                  style={{
                    padding: '8px 16px', borderRadius: 100,
                    background: aspirant ? 'rgba(245,158,11,0.14)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${aspirant ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    color: aspirant ? '#f59e0b' : 'rgba(255,255,255,0.35)',
                    fontSize: 13, fontWeight: 700, cursor: aspirant ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  }}
                >
                  ❓ Ask
                </button>
              </div>
            </div>

            {/* Filter tabs + sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              <div className="filter-scroll" style={{ display: 'flex', gap: 6, flex: 1 }}>
                {FILTER_TABS.map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)} style={{
                    whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: 100,
                    border: `1px solid ${activeFilter === f ? '#4F7CFF' : 'rgba(255,255,255,0.08)'}`,
                    background: activeFilter === f ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.02)',
                    color: activeFilter === f ? '#93BBFF' : 'rgba(255,255,255,0.55)',
                    fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  }}>
                    {f}
                  </button>
                ))}
              </div>
              <select value={activeSort} onChange={e => setActiveSort(e.target.value as 'popular' | 'recent' | 'discussed')} style={{ padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', fontSize: 12, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                {SORT_OPTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>

            {/* Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeFilter === 'My Posts' ? (
                myPosts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>No posts yet</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', maxWidth: 320, margin: '0 auto' }}>Posts you submit show up here — including ones still under review.</p>
                  </div>
                ) : myPosts.map(stored => {
                  const post: Post = { ...stored, upvotes: 0, reply_count: 0 }
                  return <PostCard key={stored.id} post={post} upvoted={false} onUpvoteChange={() => {}} isPending={!stored.is_approved} />
                })
              ) : loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              ) : posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>No posts match</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', maxWidth: 320, margin: '0 auto' }}>Try a different channel or filter.</p>
                </div>
              ) : posts.map(post => (
                <PostCard key={post.id} post={post} upvoted={upvotedSet.has(post.id)} onUpvoteChange={handleUpvoteRefresh} isPlaceholder={isPlaceholder(post.id)} />
              ))}
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <WinsWall wins={MOCK_WINS} reacted={reactedWins} onReact={handleReactWin} />
            <CompanyChannels active={activeChannel} onPick={setActiveChannel} />
          </aside>
        </div>
      </section>

      {/* CLAIM CELEBRATE */}
      {claimCelebrate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 7) % 100}%`,
              top: 0,
              width: 8, height: 12,
              background: ['#4F7CFF', '#7B61FF', '#fbbf24', '#10b981', '#ec4899'][i % 5],
              borderRadius: 2,
              animation: `confetti ${1.5 + (i % 5) * 0.2}s ease-in ${(i % 8) * 0.1}s forwards`,
            }} />
          ))}
        </div>
      )}

      {/* MODALS */}
      {modal && <SubmitModal mode={modal} onClose={() => setModal(null)} onPosted={refreshMyPosts} />}
    </main>
  )
}
