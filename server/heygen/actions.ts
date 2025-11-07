'use server'

import { createServerClient } from '@/lib/supabaseClient'

// Removed generateAIVideo, waitForCompletion, getUserAIPreferences, getXContentForTopic, apiCallWithRetry, and constants
// - Now using API routes with client-side polling (see /app/api/heygen/generate/route.ts)

// Cancel/abort stuck video generation
export async function cancelStuckVideo(topicId: string, userId: string) {
  const supabase = createServerClient()

  try {
    const { data: existingVideo, error: fetchError } = await supabase
      .from('ai_videos')
      .select('id, status, created_at, video_id')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !existingVideo) {
      throw new Error('Video not found')
    }

    if (existingVideo.status !== 'generating') {
      throw new Error(`Video is not in generating status (current: ${existingVideo.status})`)
    }

    // Mark as failed so it can be regenerated
    const { error: updateError } = await supabase
      .from('ai_videos')
      .update({
        status: 'failed',
        error_message: 'Cancelled by user - video was stuck in generating status',
      })
      .eq('id', existingVideo.id)

    if (updateError) throw updateError

    console.log(`[${new Date().toISOString()}] Cancelled stuck video for topic ${topicId}, video_id: ${existingVideo.video_id}`)
    return { success: true, message: 'Video generation cancelled successfully' }
  } catch (error: any) {
    console.error('Error cancelling video:', error)
    throw new Error(error.message || 'Failed to cancel video')
  }
}

// These helpers remain for UI to read/update preferences
export async function getAIPreferences(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('ai_preferences')
    .select('heygen_avatar_id, heygen_voice_id')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return data || { heygen_avatar_id: null, heygen_voice_id: null }
}

export async function updateAIPreferences(
  userId: string,
  preferences: { heygen_avatar_id?: string; heygen_voice_id?: string }
) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('ai_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

