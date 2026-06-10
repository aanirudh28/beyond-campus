'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function OAuthButtons({ next = '/tracker' }: { next?: string }) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const supabase = createClient()

  const handleOAuth = async (provider: 'google' | 'linkedin_oidc') => {
    setLoadingProvider(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (error) setLoadingProvider(null)
  }

  const btnStyle: React.CSSProperties = {
    width: '100%', padding: 13, borderRadius: 12, background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontWeight: 600, fontSize: 14,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button onClick={() => handleOAuth('google')} disabled={!!loadingProvider} style={{ ...btnStyle, opacity: loadingProvider && loadingProvider !== 'google' ? 0.5 : 1 }}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        {loadingProvider === 'google' ? 'Redirecting...' : 'Continue with Google'}
      </button>
      <button onClick={() => handleOAuth('linkedin_oidc')} disabled={!!loadingProvider} style={{ ...btnStyle, opacity: loadingProvider && loadingProvider !== 'linkedin_oidc' ? 0.5 : 1 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>
        </svg>
        {loadingProvider === 'linkedin_oidc' ? 'Redirecting...' : 'Continue with LinkedIn'}
      </button>
    </div>
  )
}
