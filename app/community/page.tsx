'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type PostType = 'experience' | 'stipend' | 'doubt'

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

// ─── Constants ────────────────────────────────────────────────────────────────

const PLACEHOLDER_POSTS: Post[] = [
  {
    id: 'p1',
    type: 'experience',
    content: "Got a Founder's Office offer after 3 rounds — a task, a case discussion, and a founder call. No technical questions at all. Just thinking and communication.",
    degree: 'BBA',
    college_tier: 'Tier 2',
    city: 'Delhi',
    domain: "Founder's Office",
    tags: ["Founder's Office", 'Interview'],
    upvotes: 47,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    reply_count: 8,
  },
  {
    id: 'p2',
    type: 'stipend',
    content: 'BD intern at a fintech startup — ₹12,000/month + ₹3,000 travel allowance. Remote for first month, hybrid after that.',
    degree: 'BCom',
    college_tier: 'Tier 3',
    city: 'Mumbai',
    domain: 'BD',
    tags: ['BD', 'Stipend', 'Fintech'],
    upvotes: 31,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    reply_count: 3,
  },
  {
    id: 'p3',
    type: 'doubt',
    content: "Has anyone gotten a Big 4 HR to reply via LinkedIn DM? Cold emails haven't worked for me in 3 weeks.",
    degree: 'BBA',
    college_tier: 'Tier 2',
    city: 'Pune',
    domain: 'Consulting',
    tags: ['Big 4', 'Cold Outreach'],
    upvotes: 22,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    reply_count: 14,
  },
]

const TYPE_CONFIG: Record<PostType, { label: string; color: string; borderColor: string; bg: string }> = {
  experience: { label: 'Experience', color: '#4F7CFF', borderColor: '#4F7CFF', bg: 'rgba(79,124,255,0.12)' },
  stipend:    { label: 'Stipend',    color: '#10b981', borderColor: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  doubt:      { label: 'Doubt',      color: '#f59e0b', borderColor: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
}

const DEGREE_OPTIONS    = ['BBA', 'BCom', 'BA', 'BSc', 'BTech', 'MBA', 'Other']
const TIER_OPTIONS      = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4+']
const DOMAIN_OPTIONS    = ['Consulting', 'Finance', "Founder's Office", 'Marketing', 'BD', 'Operations', 'Tech', 'HR', 'Other']
const YEAR_OPTIONS      = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post-Graduate']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFingerprint(): string {
  if (typeof window === 'undefined') return 'server'
  let fp = localStorage.getItem('feedFingerprint')
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('feedFingerprint', fp)
  }
  return fp
}

function getUpvotedSet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem('feedUpvoted')
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveUpvotedSet(s: Set<string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('feedUpvoted', JSON.stringify([...s]))
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      background: '#111827',
      borderRadius: 20,
      padding: 24,
      borderLeft: '4px solid rgba(255,255,255,0.06)',
      marginBottom: 0,
      breakInside: 'avoid',
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 80, height: 22, borderRadius: 100, background: 'rgba(255,255,255,0.07)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 60, height: 22, borderRadius: 100, background: 'rgba(255,255,255,0.05)', animation: 'skeletonPulse 1.5s ease-in-out infinite 0.2s' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 14, borderRadius: 8, background: 'rgba(255,255,255,0.07)', marginBottom: 8, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 14, borderRadius: 8, background: 'rgba(255,255,255,0.07)', marginBottom: 8, width: '90%', animation: 'skeletonPulse 1.5s ease-in-out infinite 0.1s' }} />
        <div style={{ height: 14, borderRadius: 8, background: 'rgba(255,255,255,0.07)', width: '75%', animation: 'skeletonPulse 1.5s ease-in-out infinite 0.2s' }} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <div style={{ width: 55, height: 20, borderRadius: 100, background: 'rgba(255,255,255,0.05)', animation: 'skeletonPulse 1.5s ease-in-out infinite 0.3s' }} />
        <div style={{ width: 70, height: 20, borderRadius: 100, background: 'rgba(255,255,255,0.05)', animation: 'skeletonPulse 1.5s ease-in-out infinite 0.4s' }} />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 48, height: 20, borderRadius: 8, background: 'rgba(255,255,255,0.05)', animation: 'skeletonPulse 1.5s ease-in-out infinite 0.5s' }} />
        <div style={{ width: 64, height: 20, borderRadius: 8, background: 'rgba(255,255,255,0.05)', animation: 'skeletonPulse 1.5s ease-in-out infinite 0.6s' }} />
      </div>
    </div>
  )
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 24px' }}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ margin: '0 auto 24px', display: 'block', opacity: 0.35 }}>
        <circle cx="40" cy="40" r="38" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <path d="M24 32 Q40 20 56 32 Q56 48 40 56 Q24 48 24 32Z" stroke="rgba(79,124,255,0.5)" strokeWidth="1.5" fill="none" />
        <circle cx="40" cy="40" r="4" fill="rgba(79,124,255,0.4)" />
        <path d="M32 44 Q36 52 40 56" stroke="rgba(79,124,255,0.3)" strokeWidth="1" fill="none" />
        <path d="M48 44 Q44 52 40 56" stroke="rgba(79,124,255,0.3)" strokeWidth="1" fill="none" />
      </svg>
      <p style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
        No posts yet
      </p>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', maxWidth: 320, margin: '0 auto' }}>
        {filter === 'All'
          ? 'Be the first to share your experience or ask a question.'
          : `No posts in "${filter}" yet. Try a different filter or be the first to share.`}
      </p>
    </div>
  )
}

// ─── Post Card ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post
  upvoted: boolean
  onUpvote: (id: string) => void
  isPlaceholder?: boolean
}

function PostCard({ post, upvoted, onUpvote, isPlaceholder }: PostCardProps) {
  const [expanded, setExpanded]       = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies]         = useState<Reply[]>([])
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [replyText, setReplyText]     = useState('')
  const [replyDegree, setReplyDegree] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [replySuccess, setReplySuccess] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes)
  const [localUpvoted, setLocalUpvoted] = useState(upvoted)
  const [upvoteLoading, setUpvoteLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const cfg = TYPE_CONFIG[post.type]
  const isLong = post.content.length > 220

  const toggleReplies = async () => {
    if (isPlaceholder) {
      setShowReplies(v => !v)
      return
    }
    if (!showReplies) {
      setShowReplies(true)
      if (replies.length === 0) {
        setRepliesLoading(true)
        try {
          const res = await fetch(`/api/feed/replies?post_id=${post.id}`)
          const json = await res.json()
          if (json.replies) setReplies(json.replies)
        } catch {}
        setRepliesLoading(false)
      }
    } else {
      setShowReplies(false)
    }
  }

  const handleUpvote = async () => {
    if (isPlaceholder || upvoteLoading) return
    setUpvoteLoading(true)
    const fp = getFingerprint()
    const optimisticUpvoted = !localUpvoted
    const optimisticCount   = localUpvoted ? localUpvotes - 1 : localUpvotes + 1
    setLocalUpvoted(optimisticUpvoted)
    setLocalUpvotes(optimisticCount)

    try {
      const res = await fetch('/api/feed/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id, fingerprint: fp }),
      })
      const json = await res.json()
      if (typeof json.upvotes === 'number') {
        setLocalUpvotes(json.upvotes)
        setLocalUpvoted(json.upvoted)
        const set = getUpvotedSet()
        if (json.upvoted) set.add(post.id)
        else set.delete(post.id)
        saveUpvotedSet(set)
      }
    } catch {
      // Revert on error
      setLocalUpvoted(!optimisticUpvoted)
      setLocalUpvotes(post.upvotes)
    }

    setUpvoteLoading(false)
    onUpvote(post.id)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/community`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const submitReply = async () => {
    if (!replyText.trim() || replySubmitting) return
    if (isPlaceholder) {
      setReplySuccess(true)
      setReplyText('')
      setTimeout(() => setReplySuccess(false), 3000)
      return
    }
    setReplySubmitting(true)
    try {
      await fetch('/api/feed/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          content: replyText.trim(),
          degree: replyDegree || null,
        }),
      })
      setReplySuccess(true)
      setReplyText('')
      setReplyDegree('')
      setReplyTier('')
      setTimeout(() => setReplySuccess(false), 4000)
    } catch {}
    setReplySubmitting(false)
  }

  return (
    <div style={{
      background: '#111827',
      borderRadius: 20,
      padding: '20px 20px 16px',
      borderLeft: `4px solid ${cfg.borderColor}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      breakInside: 'avoid',
      marginBottom: 20,
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header: type badge + time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
          color: cfg.color, background: cfg.bg, letterSpacing: 0.5,
        }}>
          {post.type === 'experience' ? '📖' : post.type === 'stipend' ? '💰' : '❓'} {cfg.label.toUpperCase()}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{timeAgo(post.created_at)}</span>
      </div>

      {/* Author */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
        {post.degree && <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{post.degree}</span>}
        {post.degree && post.college_tier && <span style={{ opacity: 0.4 }}>·</span>}
        {post.college_tier && <span>{post.college_tier}</span>}
        {post.city && <><span style={{ opacity: 0.4 }}>·</span><span>{post.city}</span></>}
      </div>

      {/* Content */}
      <div style={{ marginBottom: 14 }}>
        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.82)',
          lineHeight: 1.75,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: expanded || !isLong ? 999 : 4,
          WebkitBoxOrient: 'vertical' as any,
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {post.content}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ background: 'none', border: 'none', color: '#4F7CFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 0 0', fontFamily: 'inherit' }}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {post.tags.map(tag => (
            <span key={tag} style={{
              padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Upvote */}
        <button
          onClick={handleUpvote}
          disabled={upvoteLoading || isPlaceholder}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: localUpvoted ? 'rgba(79,124,255,0.15)' : 'none',
            border: localUpvoted ? '1px solid rgba(79,124,255,0.3)' : '1px solid transparent',
            borderRadius: 8, padding: '5px 10px', cursor: isPlaceholder ? 'default' : 'pointer',
            color: localUpvoted ? '#4F7CFF' : 'rgba(255,255,255,0.45)',
            fontSize: 13, fontWeight: 600, transition: 'all 0.2s', fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 15 }}>▲</span>
          <span>{localUpvotes}</span>
        </button>

        {/* Replies toggle */}
        <button
          onClick={toggleReplies}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: showReplies ? 'rgba(79,124,255,0.1)' : 'none',
            border: '1px solid transparent',
            borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
            color: showReplies ? '#93BBFF' : 'rgba(255,255,255,0.4)',
            fontSize: 13, fontWeight: 600, transition: 'all 0.2s', fontFamily: 'inherit',
          }}
        >
          <span>💬</span>
          <span>{post.reply_count ?? 0} {showReplies ? '↑' : ''}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: '1px solid transparent',
            borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
            color: copied ? '#10b981' : 'rgba(255,255,255,0.35)',
            fontSize: 13, fontWeight: 600, transition: 'all 0.2s', fontFamily: 'inherit', marginLeft: 'auto',
          }}
        >
          {copied ? '✓ Copied' : '↗ Share'}
        </button>
      </div>

      {/* Replies section */}
      {showReplies && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {repliesLoading && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', padding: '8px 0' }}>Loading replies...</div>
          )}

          {!repliesLoading && replies.length === 0 && !isPlaceholder && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', padding: '4px 0 12px' }}>No replies yet. Be the first!</div>
          )}

          {replies.map(r => (
            <div key={r.id} style={{
              padding: '10px 14px', marginBottom: 8, borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
                {[r.degree].filter(Boolean).join(' · ')}{r.degree ? ' · ' : ''}{timeAgo(r.created_at)}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, margin: 0 }}>{r.content}</p>
            </div>
          ))}

          {/* Reply input */}
          {replySuccess ? (
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 13, color: '#6ee7b7', fontWeight: 600 }}>
              ✓ Reply submitted! It'll appear after review.
            </div>
          ) : (
            <div style={{ marginTop: 4 }}>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontSize: 13, resize: 'vertical', outline: 'none',
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 8,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <select
                  value={replyDegree}
                  onChange={e => setReplyDegree(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: replyDegree ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)', fontSize: 12, outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="">Degree (optional)</option>
                  {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button
                  onClick={submitReply}
                  disabled={!replyText.trim() || replySubmitting}
                  style={{
                    padding: '6px 16px', borderRadius: 8, background: replyText.trim() ? 'rgba(79,124,255,0.8)' : 'rgba(255,255,255,0.07)',
                    border: 'none', color: replyText.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                    fontSize: 12, fontWeight: 700, cursor: replyText.trim() ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}
                >
                  {replySubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>Anonymous · goes live after review</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Submission Modals ────────────────────────────────────────────────────────

interface SubmitModalProps {
  mode: 'experience' | 'doubt'
  onClose: () => void
}

function SubmitModal({ mode, onClose }: SubmitModalProps) {
  const isDoubt = mode === 'doubt'

  // Step 1
  const [step, setStep]       = useState(1)
  const [postType, setPostType] = useState<'experience' | 'stipend' | 'doubt'>(isDoubt ? 'doubt' : 'experience')
  const [content, setContent]   = useState('')
  const [degree, setDegree]     = useState('')
  const [tier, setTier]         = useState('')
  const [city, setCity]         = useState('')
  const [year, setYear]         = useState('')
  const [domain, setDomain]     = useState('')
  const [tagsInput, setTagsInput] = useState('')

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Email notification
  const [notifEmail, setNotifEmail] = useState('')
  const [notifSent, setNotifSent]   = useState(false)

  const canProceed = content.trim().length >= 20

  const handleSubmit = async () => {
    if (!canProceed || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      const res = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: postType,
          content: content.trim(),
          degree: degree || null,
          college_tier: tier || null,
          city: city.trim() || null,
          year_of_study: year || null,
          domain: domain || null,
          tags,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const handleNotifEmail = async () => {
    if (!notifEmail.trim()) return
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notifEmail.trim(), source: 'Feed Post Notification' }),
      })
    } catch {}
    setNotifSent(true)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: '#111827', borderRadius: 28,
        border: '1px solid rgba(255,255,255,0.09)',
        width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto',
        position: 'relative', padding: '32px 32px 28px',
        animation: 'modalIn 0.22s ease both',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 4 }}
        >×</button>

        {submitted ? (
          /* Success State */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: -0.5 }}>
              Submitted!
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
              Your post is under review and will go live shortly. Thanks for contributing to the community!
            </p>
            {/* Email notification opt-in */}
            {!notifSent ? (
              <div style={{ background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 16, padding: '20px 20px 16px', marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12, fontWeight: 600 }}>
                  Get notified when someone replies to your post?
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={notifEmail}
                    onChange={e => setNotifEmail(e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit', minWidth: 0 }}
                  />
                  <button
                    onClick={handleNotifEmail}
                    style={{ padding: '9px 16px', borderRadius: 10, background: 'rgba(79,124,255,0.7)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                  >
                    Notify me
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 600, margin: 0 }}>✓ You'll be notified!</p>
              </div>
            )}
            <button
              onClick={onClose}
              style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Back to Feed
            </button>
          </div>
        ) : (
          <>
            {/* Modal header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: isDoubt ? '#f59e0b' : '#4F7CFF', textTransform: 'uppercase', marginBottom: 8 }}>
                {isDoubt ? '❓ Ask a Doubt' : '✍️ Share Experience'}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: -0.5, margin: 0 }}>
                {isDoubt ? 'Ask the community' : 'Share your story'}
              </h2>
              {!isDoubt && (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6, marginBottom: 0 }}>
                  100% anonymous · Goes live after quick review
                </p>
              )}
            </div>

            {/* Step indicator for experience (2 steps) */}
            {!isDoubt && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                {[1, 2].map(s => (
                  <div key={s} style={{
                    height: 3, flex: 1, borderRadius: 10,
                    background: step >= s ? '#4F7CFF' : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
            )}

            {/* Step 1 / Doubt form */}
            {(step === 1 || isDoubt) && (
              <div>
                {/* Post type selector (experience only) */}
                {!isDoubt && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {(['experience', 'stipend'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setPostType(t)}
                        style={{
                          flex: 1, padding: '9px 12px', borderRadius: 10,
                          border: `1.5px solid ${postType === t ? TYPE_CONFIG[t].borderColor : 'rgba(255,255,255,0.1)'}`,
                          background: postType === t ? TYPE_CONFIG[t].bg : 'transparent',
                          color: postType === t ? TYPE_CONFIG[t].color : 'rgba(255,255,255,0.5)',
                          fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                        }}
                      >
                        {t === 'experience' ? '📖 Experience' : '💰 Stipend'}
                      </button>
                    ))}
                  </div>
                )}

                {/* Content */}
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                  {isDoubt ? 'Your question' : postType === 'stipend' ? 'Stipend details' : 'What happened?'}
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={
                    isDoubt
                      ? "e.g. Has anyone gotten a reply from Big 4 HR on LinkedIn?"
                      : postType === 'stipend'
                      ? "e.g. BD intern at a Series B startup — ₹12,000/month + ₹2,000 travel..."
                      : "e.g. Got a Founder's Office offer after 3 rounds. Here's what happened..."
                  }
                  rows={5}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white', fontSize: 14, resize: 'vertical', outline: 'none',
                    fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, marginBottom: 4,
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ fontSize: 11, color: content.length >= 20 ? 'rgba(16,185,129,0.7)' : 'rgba(255,255,255,0.2)', textAlign: 'right', marginBottom: 16 }}>
                  {content.length} chars {content.length < 20 ? `(min 20)` : '✓'}
                </div>

                {/* Domain */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Domain</label>
                  <select
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: domain ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                  >
                    <option value="">Select domain (optional)</option>
                    {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Tags */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="e.g. Big 4, Cold Outreach, Fintech"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>

                {submitError && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                    {submitError}
                  </div>
                )}

                <button
                  onClick={isDoubt ? handleSubmit : () => canProceed && setStep(2)}
                  disabled={!canProceed || submitting}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 14,
                    background: canProceed ? (isDoubt ? 'rgba(245,158,11,0.85)' : 'linear-gradient(135deg,#4F7CFF,#7B61FF)') : 'rgba(255,255,255,0.07)',
                    border: 'none', color: canProceed ? 'white' : 'rgba(255,255,255,0.3)',
                    fontSize: 14, fontWeight: 800, cursor: canProceed ? 'pointer' : 'default',
                    fontFamily: 'inherit', transition: 'all 0.2s',
                  }}
                >
                  {isDoubt
                    ? (submitting ? 'Submitting...' : 'Submit Question →')
                    : 'Next: Add your details →'}
                </button>
              </div>
            )}

            {/* Step 2: Author details (experience only) */}
            {!isDoubt && step === 2 && (
              <div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20, lineHeight: 1.6 }}>
                  These stay anonymous — we only show degree, tier, and city on your post (no name, no college name).
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Degree</label>
                    <select
                      value={degree}
                      onChange={e => setDegree(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: degree ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                    >
                      <option value="">Select</option>
                      {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>College Tier</label>
                    <select
                      value={tier}
                      onChange={e => setTier(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: tier ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                    >
                      <option value="">Select</option>
                      {TIER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Delhi"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Year</label>
                    <select
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: year ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                    >
                      <option value="">Select</option>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {submitError && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                    {submitError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{ padding: '13px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      flex: 1, padding: '13px', borderRadius: 14,
                      background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)',
                      border: 'none', color: 'white', fontSize: 14, fontWeight: 800,
                      cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Post →'}
                  </button>
                </div>
                <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>
                  All fields optional · 100% anonymous · reviewed before going live
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [posts, setPosts]               = useState<Post[]>(PLACEHOLDER_POSTS)
  const [loading, setLoading]           = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeSort, setActiveSort]     = useState<'popular' | 'recent' | 'discussed'>('popular')
  const [upvotedSet, setUpvotedSet]     = useState<Set<string>>(new Set())
  const [scrollY, setScrollY]           = useState(0)
  const [modal, setModal]               = useState<'experience' | 'doubt' | null>(null)

  // Load upvoted set from localStorage on mount
  useEffect(() => {
    setUpvotedSet(getUpvotedSet())
  }, [])

  // Scroll tracking for sticky bar
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('sort', activeSort)
      params.set('limit', '40')

      // Map filter to API params
      if (activeFilter === '🎯 Interviews' || activeFilter === 'Interviews') {
        params.set('type', 'experience')
      } else if (activeFilter === '💰 Stipends' || activeFilter === 'Stipends') {
        params.set('type', 'stipend')
      } else if (activeFilter === '❓ Doubts' || activeFilter === 'Doubts') {
        params.set('type', 'doubt')
      } else if (!['All'].includes(activeFilter)) {
        // Domain filter
        params.set('domain', activeFilter)
      }

      const res = await fetch(`/api/feed/posts?${params.toString()}`)
      const json = await res.json()
      if (json.posts && Array.isArray(json.posts)) {
        setPosts(json.posts.length > 0 ? json.posts : PLACEHOLDER_POSTS)
      } else {
        setPosts(PLACEHOLDER_POSTS)
      }
    } catch {
      setPosts(PLACEHOLDER_POSTS)
    }
    setLoading(false)
  }, [activeFilter, activeSort])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleUpvoteRefresh = useCallback((id: string) => {
    setUpvotedSet(getUpvotedSet())
  }, [])

  const isPlaceholder = (id: string) => id.startsWith('p') && ['p1', 'p2', 'p3'].includes(id)

  const FILTER_PILLS = ['All', '🎯 Interviews', '💰 Stipends', '❓ Doubts', 'Consulting', 'Finance', "Founder's Office", 'Marketing', 'BD', 'Operations']
  const SORT_OPTIONS: { key: 'popular' | 'recent' | 'discussed'; label: string }[] = [
    { key: 'popular', label: 'Most Popular' },
    { key: 'recent', label: 'Most Recent' },
    { key: 'discussed', label: 'Most Discussed' },
  ]

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: "'DM Sans', 'Inter', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        input, textarea, select { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        select option { background: #1f2937; color: white; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        @keyframes skeletonPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes modalIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }

        .filter-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .filter-scroll::-webkit-scrollbar { display: none; }

        .feed-columns { columns: 2; column-gap: 20px; }
        @media(max-width: 700px) {
          .feed-columns { columns: 1; }
        }

        .sticky-submit-bar-top { display: flex; }
        .sticky-submit-bar-bottom { display: none; }
        @media(max-width: 700px) {
          .sticky-submit-bar-top { display: none !important; }
          .sticky-submit-bar-bottom { display: flex !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrollY > 40 ? '14px 40px' : '20px 40px',
        background: scrollY > 40 ? 'rgba(11,11,15,0.85)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s',
      }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <a href="/community" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#93BBFF', background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100 }}>The Feed</a>
          <a href="/free" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>Resources</a>
          <a href="/cohort" style={{ padding: '9px 20px', fontSize: 13, fontWeight: 700, borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', border: 'none' }}>Join Cohort</a>
        </div>
      </nav>

      {/* STICKY SUBMIT BAR — Top (desktop, shows after scroll) */}
      {scrollY > 300 && (
        <div
          className="sticky-submit-bar-top"
          style={{
            position: 'fixed', top: 60, left: 0, right: 0, zIndex: 90,
            background: 'rgba(11,11,15,0.92)', backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            justifyContent: 'center', gap: 12, padding: '10px 20px',
          }}
        >
          <button
            onClick={() => setModal('experience')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ✍️ Share Experience
          </button>
          <button
            onClick={() => setModal('doubt')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ❓ Ask a Doubt
          </button>
        </div>
      )}

      {/* HERO */}
      <section style={{ padding: '140px 24px 60px', maxWidth: 900, margin: '0 auto', textAlign: 'center', animation: 'fadeUp 0.7s ease both' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, color: '#93BBFF', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 28 }}>
          THE FEED
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(40px,6vw,72px)', lineHeight: 1.08, letterSpacing: -2, fontWeight: 400, marginBottom: 20 }}>
          Real experiences.<br />
          <span style={{ background: 'linear-gradient(135deg,#4F7CFF,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Anonymous. Honest.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 40px', fontWeight: 400 }}>
          Interview stories, stipend data, doubts, and answers — straight from students navigating off-campus hiring.
        </p>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 100, fontSize: 13, fontWeight: 600, color: '#6ee7b7' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'glow-pulse 2s ease-in-out infinite' }} />
            Anonymous & moderated
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 100, fontSize: 13, fontWeight: 600, color: '#93BBFF' }}>
            📖 Real student posts only
          </div>
        </div>

        {/* Submit buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setModal('experience')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 24px rgba(79,124,255,0.35)' }}
          >
            ✍️ Share Experience
          </button>
          <button
            onClick={() => setModal('doubt')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 100, background: 'rgba(245,158,11,0.12)', border: '1.5px solid rgba(245,158,11,0.35)', color: '#f59e0b', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ❓ Ask a Doubt
          </button>
        </div>
      </section>

      {/* FILTERS */}
      <div style={{ position: 'sticky', top: scrollY > 300 ? 102 : 60, zIndex: 80, background: '#0B0B0F', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 0', transition: 'top 0.3s' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'nowrap' }}>
          {/* Filter pills */}
          <div className="filter-scroll" style={{ display: 'flex', gap: 8, flex: 1 }}>
            {FILTER_PILLS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  whiteSpace: 'nowrap', padding: '7px 16px', borderRadius: 100,
                  border: `1px solid ${activeFilter === f ? '#4F7CFF' : 'rgba(255,255,255,0.1)'}`,
                  background: activeFilter === f ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.03)',
                  color: activeFilter === f ? '#93BBFF' : 'rgba(255,255,255,0.5)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', flexShrink: 0,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div style={{ flexShrink: 0 }}>
            <select
              value={activeSort}
              onChange={e => setActiveSort(e.target.value as 'popular' | 'recent' | 'discussed')}
              style={{ padding: '7px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              {SORT_OPTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* FEED */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
        {loading ? (
          <div className="feed-columns">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div className="feed-columns">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                upvoted={upvotedSet.has(post.id)}
                onUpvote={handleUpvoteRefresh}
                isPlaceholder={isPlaceholder(post.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM CTA */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', background: 'linear-gradient(135deg,rgba(79,124,255,0.04),rgba(16,185,129,0.02))' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#4F7CFF', textTransform: 'uppercase', marginBottom: 16 }}>The Feed</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(28px,4vw,44px)', letterSpacing: -1, fontWeight: 400, marginBottom: 16, lineHeight: 1.15 }}>
            Your story could help someone land their first internship
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 36 }}>
            Anonymous. Takes 2 minutes. Makes a real difference.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setModal('experience')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 24px rgba(79,124,255,0.3)' }}
            >
              ✍️ Share Your Experience
            </button>
            <button
              onClick={() => setModal('doubt')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 100, background: 'transparent', border: '1.5px solid rgba(245,158,11,0.4)', color: '#f59e0b', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ❓ Ask a Question
            </button>
          </div>
        </div>
      </section>

      {/* MOBILE STICKY SUBMIT BAR — fixed bottom */}
      <div
        className="sticky-submit-bar-bottom"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
          background: 'rgba(11,11,15,0.97)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 16px', gap: 10,
        }}
      >
        <button
          onClick={() => setModal('experience')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 14, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          ✍️ Share
        </button>
        <button
          onClick={() => setModal('doubt')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 14, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          ❓ Ask
        </button>
      </div>

      {/* MODALS */}
      {modal && <SubmitModal mode={modal} onClose={() => setModal(null)} />}
    </main>
  )
}
