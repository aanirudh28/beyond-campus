import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorDescription = searchParams.get('error_description')

  // destination comes from ?next= or the cookie set just before the OAuth hop
  const cookieNext = request.cookies.get('oauth_next')?.value
  const next = searchParams.get('next') ?? (cookieNext ? decodeURIComponent(cookieNext) : '/tracker')

  if (errorDescription) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('tracker_profiles').upsert(
          {
            user_id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          },
          { onConflict: 'user_id', ignoreDuplicates: true }
        )
      }
      // only allow same-origin relative redirects
      const safeNext = next.startsWith('/') ? next : '/tracker'
      const response = NextResponse.redirect(`${origin}${safeNext}`)
      response.cookies.delete('oauth_next')
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Could not sign you in. Please try again.')}`)
}
