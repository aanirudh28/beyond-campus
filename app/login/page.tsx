'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import OAuthButtons from '@/app/components/tracker/OAuthButtons'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const [error, setError] = useState(searchParams.get('error') || '')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      if (next.startsWith('/tracker') && data.user) {
        await supabase.from('tracker_profiles').upsert(
          { user_id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || null },
          { onConflict: 'user_id', ignoreDuplicates: true }
        )
      }
      router.push(next.startsWith('/') ? next : '/dashboard')
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; } input::placeholder { color: rgba(255,255,255,0.3); }`}</style>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', padding: '8px 20px', background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', borderRadius: 100, fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: 1 }}>
            BEYOND CAMPUS
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '16px 0 6px', letterSpacing: -0.5 }}>Welcome back 👋</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
            {next.startsWith('/tracker') ? 'Login to your job tracker' : 'Login to your student dashboard'}
          </p>
        </div>

        {/* Form */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32 }}>
          <OAuthButtons next={next} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 15, outline: 'none', width: '100%' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 15, outline: 'none', width: '100%' }}
            />
          </div>

          {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 14 }}>{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: 14, borderRadius: 12, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '⏳ Logging in...' : 'Login →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 24 }}>
          New here? <a href="/signup" style={{ color: '#93BBFF', textDecoration: 'none' }}>Create a free account →</a>
        </p>

      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
