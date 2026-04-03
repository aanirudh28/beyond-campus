import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { post_id, fingerprint } = body

    if (!post_id || !fingerprint) {
      return NextResponse.json({ error: 'post_id and fingerprint are required' }, { status: 400 })
    }

    // Check if an upvote row exists for this (post_id, fingerprint) pair
    const { data: existingRow, error: checkError } = await supabase
      .from('feed_upvotes')
      .select('id')
      .eq('post_id', post_id)
      .eq('fingerprint', fingerprint)
      .maybeSingle()

    if (checkError) {
      console.error('[feed/upvote] check error:', checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existingRow) {
      // Already upvoted — remove the upvote
      const { error: deleteError } = await supabase
        .from('feed_upvotes')
        .delete()
        .eq('id', existingRow.id)

      if (deleteError) {
        console.error('[feed/upvote] delete error:', deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      // Decrement upvotes on the post (floor at 0)
      const { data: postData, error: fetchError } = await supabase
        .from('feed_posts')
        .select('upvotes')
        .eq('id', post_id)
        .single()

      if (fetchError) {
        console.error('[feed/upvote] fetch post error:', fetchError)
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
      }

      const newCount = Math.max(0, (postData.upvotes || 0) - 1)

      const { error: updateError } = await supabase
        .from('feed_posts')
        .update({ upvotes: newCount })
        .eq('id', post_id)

      if (updateError) {
        console.error('[feed/upvote] update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ upvoted: false, upvotes: newCount })
    } else {
      // Not yet upvoted — add the upvote
      const { error: insertError } = await supabase
        .from('feed_upvotes')
        .insert({ post_id, fingerprint })

      if (insertError) {
        console.error('[feed/upvote] insert error:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      // Increment upvotes on the post
      const { data: postData, error: fetchError } = await supabase
        .from('feed_posts')
        .select('upvotes')
        .eq('id', post_id)
        .single()

      if (fetchError) {
        console.error('[feed/upvote] fetch post error:', fetchError)
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
      }

      const newCount = (postData.upvotes || 0) + 1

      const { error: updateError } = await supabase
        .from('feed_posts')
        .update({ upvotes: newCount })
        .eq('id', post_id)

      if (updateError) {
        console.error('[feed/upvote] update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ upvoted: true, upvotes: newCount })
    }
  } catch (err) {
    console.error('[feed/upvote] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
