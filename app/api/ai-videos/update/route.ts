import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topicId, userId, status, videoUrl, errorMessage } = body

    if (!topicId || !userId || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const updateData: any = {
      status,
      error_message: errorMessage || null,
    }

    if (status === 'completed' && videoUrl) {
      updateData.video_url = videoUrl
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('ai_videos')
      .update(updateData)
      .eq('user_id', userId)
      .eq('topic_id', topicId)

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