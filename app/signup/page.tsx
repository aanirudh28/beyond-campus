'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import OAuthButtons from '@/app/components/tracker/OAuthButtons'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async () => {
    if (!name || !email || !password) { setError('Please fill in all the fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      await supabase.from('tracker_profiles').upsert(
        { user_id: data.session.user.id, email, name },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )
      router.push('/tracker')
    } else {
      // email confirmation is enabled on the project
      setNeedsConfirmation(true)
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 15, outline: 'none', width: '100%',
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; } input::placeholder { color: rgba(255,255,255,0.3); }`}</style>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-block', padding: '8px 20px', background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', borderRadius: 100, fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: 1 }}>
            BEYOND CAMPUS
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '16px 0 6px', letterSpacing: -0.5 }}>Track every application 🎯</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>Free job tracker. Never miss a follow-up again.</p>
        </div>

        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32 }}>
          {needsConfirmation ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Check your inbox</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                We sent a confirmation link to <span style={{ color: '#93BBFF' }}>{email}</span>. Click it, then log in to start tracking.
              </p>
            </div>
          ) : (
            <>
              <OAuthButtons next="/tracker" />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignup()} style={inputStyle} />
              </div>

              {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 14 }}>{error}</p>}

              <button
                onClick={handleSignup}
                disabled={loading}
                style={{ width: '100%', padding: 14, borderRadius: 12, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? '⏳ Creating account...' : 'Create free account →'}
              </button>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 24 }}>
          Already have an account? <a href="/login" style={{ color: '#93BBFF', textDecoration: 'none' }}>Log in →</a>
        </p>

      </div>
    </main>
  )
}
