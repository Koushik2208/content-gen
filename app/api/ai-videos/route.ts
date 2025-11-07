import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('ai_videos')
      .select('id, topic_id, video_id, video_url, status, error_message, created_at, completed_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch ai_videos:', error)
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }

    const topicIds = Array.from(new Set((data || []).map((video) => video.topic_id)))
    let topicNames: Record<string, string> = {}

    if (topicIds.length > 0) {
      const { data: topicsData, error: topicsError } = await supabase
        .from('content_topics')
        .select('id, topic')
        .in('id', topicIds)

      if (!topicsError && topicsData) {
        topicNames = topicsData.reduce((acc, topic) => {
          acc[topic.id] = topic.topic
          return acc
        }, {} as Record<string, string>)
      }
    }

    const videos = (data || []).map((video) => ({
      ...video,
      topic_name: topicNames[video.topic_id] || 'Unknown Topic',
    }))

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error in ai-videos route:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

