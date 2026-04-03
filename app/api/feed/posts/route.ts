import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: Request) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get('type')
    const domain = searchParams.get('domain')
    const sort = searchParams.get('sort') || 'popular'
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const approvedParam = searchParams.get('approved')

    // Default: only approved posts unless 'approved=false' explicitly requested
    let isApproved: boolean | null = true
    if (approvedParam === 'false') isApproved = false
    else if (approvedParam === 'true') isApproved = true
    // if approvedParam is 'all', return all (admin use)
    if (approvedParam === 'all') isApproved = null

    let query = supabase.from('feed_posts').select('*')

    if (isApproved !== null) {
      query = query.eq('is_approved', isApproved)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (domain) {
      query = query.eq('domain', domain)
    }

    if (sort === 'popular') {
      query = query.order('upvotes', { ascending: false })
    } else if (sort === 'recent') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'discussed') {
      // Approximate discussed by upvotes (reply count not stored separately, use upvotes as proxy)
      query = query.order('upvotes', { ascending: false })
    } else {
      query = query.order('upvotes', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('[feed/posts GET] error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ posts: data || [] })
  } catch (err) {
    console.error('[feed/posts GET] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { type, content, degree, college_tier, city, year_of_study, domain, tags } = body

    if (!type || !content) {
      return NextResponse.json({ error: 'type and content are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        type,
        content,
        degree: degree || null,
        college_tier: college_tier || null,
        city: city || null,
        year_of_study: year_of_study || null,
        domain: domain || null,
        tags: tags || [],
        is_approved: false,
        upvotes: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('[feed/posts POST] error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ post: data }, { status: 201 })
  } catch (err) {
    console.error('[feed/posts POST] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id, approved } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('feed_posts')
      .update({ is_approved: approved })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[feed/posts PATCH] error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ post: data })
  } catch (err) {
    console.error('[feed/posts PATCH] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('feed_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[feed/posts DELETE] error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[feed/posts DELETE] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
