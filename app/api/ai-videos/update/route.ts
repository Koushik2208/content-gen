import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topicId, userId, status, videoUrl, errorMessage, videoId } = body

    if (!topicId || !userId || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Check if record exists to get video_id if needed
    const { data: existingVideo } = await supabase
      .from('ai_videos')
      .select('video_id')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .maybeSingle()

    const updateData: any = {
      user_id: userId,
      topic_id: topicId,
      status,
      error_message: errorMessage || null,
    }

    // Use existing video_id or provided one, or create placeholder
    if (existingVideo?.video_id) {
      updateData.video_id = existingVideo.video_id
    } else if (videoId) {
      updateData.video_id = videoId
    } else {
      // If no video_id available, use placeholder (shouldn't happen in normal flow)
      updateData.video_id = 'pending'
    }

    if (status === 'completed' && videoUrl) {
      updateData.video_url = videoUrl
      updateData.completed_at = new Date().toISOString()
    }

    // Use upsert to create or update the record
    const { error } = await supabase
      .from('ai_videos')
      .upsert(updateData, {
        onConflict: 'user_id,topic_id',
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    )
  }
}