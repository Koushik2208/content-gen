'use server'

import { createServerClient } from '@/lib/supabaseClient'

export async function schedulePost(data: {
  content: string
  platform: string
  scheduledAt: Date
  template_id?: string
  user_id: string
}) {
  const supabase = createServerClient()
  
  // Validate scheduled date is in the future
  const now = new Date()
  if (data.scheduledAt <= now) {
    throw new Error('Scheduled date must be in the future')
  }
  
  // Validate required fields
  if (!data.content || !data.content.trim()) {
    throw new Error('Content is required')
  }
  
  if (!data.platform || !data.platform.trim()) {
    throw new Error('Platform is required')
  }
  
  if (!data.user_id) {
    throw new Error('User ID is required')
  }
  
  const { data: result, error } = await supabase
    .from('scheduled_posts')
    .insert({
      content: data.content,
      platform: data.platform,
      scheduled_at: data.scheduledAt.toISOString(),
      status: 'scheduled',
      template_id: data.template_id,
      user_id: data.user_id
    })
    .select()
    .single()
  
  if (error) throw error
  return result
}

export async function getScheduledPosts(user_id: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('user_id', user_id)
    .order('scheduled_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function updateScheduledPost(id: string, updates: any) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('scheduled_posts')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteScheduledPost(id: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('scheduled_posts')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
