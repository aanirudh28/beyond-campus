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
    const post_id = searchParams.get('post_id')
    const approvedParam = searchParams.get('approved')

    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
    }

    let query = supabase
      .from('feed_replies')
      .select('*')
      .eq('post_id', post_id)

    // Default: approved only. admin can pass approved=false or approved=all
    if (approvedParam === 'false') {
      query = query.eq('is_approved', false)
    } else if (approvedParam === 'all') {
      // no filter
    } else {
      query = query.eq('is_approved', true)
    }

    query = query.order('created_at', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('[feed/replies GET] error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ replies: data || [] })
  } catch (err) {
    console.error('[feed/replies GET] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { post_id, content, degree, college_tier } = body

    if (!post_id || !content) {
      return NextResponse.json({ error: 'post_id and content are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('feed_replies')
      .insert({
        post_id,
        content,
        degree: degree || null,
        college_tier: college_tier || null,
        is_approved: false,
      })
      .select()
      .single()

    if (error) {
      console.error('[feed/replies POST] error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reply: data }, { status: 201 })
  } catch (err) {
    console.error('[feed/replies POST] unexpected error:', err)
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
      .from('feed_replies')
      .update({ is_approved: approved })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[feed/replies PATCH] error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reply: data })
  } catch (err) {
    console.error('[feed/replies PATCH] unexpected error:', err)
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
      .from('feed_replies')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[feed/replies DELETE] error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[feed/replies DELETE] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
