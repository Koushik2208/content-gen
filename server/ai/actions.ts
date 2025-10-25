'use server'

import { createServerClient } from '@/lib/supabaseClient'
import { generateTopics as generateTopicsWithOpenAI } from './openai-actions'
import { log } from 'console'

export async function generateTopics(userId: string): Promise<string[]> {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const supabase = createServerClient()

    // Get user profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('profession, audience, tone')
      .eq('user_id', userId)
      .single()

    if (error || !profile) {
      throw new Error('User profile not found. Please complete onboarding first.')
    }

    // Generate topics using OpenAI (no automatic template generation)
    const topics = await generateTopicsWithOpenAI(profile, userId)
    
    return topics
  } catch (error) {
    console.error('Error in generateTopics:', error)
    throw new Error('Failed to generate topics')
  }
}

export async function generateContentTemplate(topic: string, userId: string, topicId: string, platform: string): Promise<{
  title: string
  content: string
  tags: string[]
}> {
  try {
    if (!userId || !topicId || !platform) {
      throw new Error('Missing required parameters: userId, topicId, and platform are required')
    }

    const { generateContentTemplate: generateWithOpenAI } = await import('./openai-actions')
    return await generateWithOpenAI(topic, userId, topicId, platform)
  } catch (error) {
    console.error('Error in generateContentTemplate:', error)
    throw new Error('Failed to generate content template')
  }
}

export async function generateContentForAllPlatforms(topic: string, userId: string, topicId: string): Promise<{
  instagram: { title: string; content: string; tags: string[] }
  linkedin: { title: string; content: string; tags: string[] }
  x: { title: string; content: string; tags: string[] }
}> {
  try {
    const { generateContentForAllPlatforms: generateWithOpenAI } = await import('./openai-actions')
    return await generateWithOpenAI(topic, userId, topicId)
  } catch (error) {
    console.error('Error in generateContentForAllPlatforms:', error)
    throw new Error('Failed to generate content for all platforms')
  }
}

export async function getContentTemplates(topicId?: string) {
  const supabase = createServerClient()
  
  let query = supabase
    .from('content_templates')
    .select('*')
  
  if (topicId) {
    query = query.eq('topic_id', topicId)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function updateContentTemplate(id: string, updates: any) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('content_templates')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}

export async function createContentTemplate(content: string, title: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('content_templates')
    .insert({
      title,
      content,
      status: 'draft'
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getTopics(userId: string) {
  const supabase = createServerClient()
  
  if (!userId) {
    throw new Error('User ID is required')
  }
  
  console.log('getTopics called with userId:', userId);
  
  // Get topics for this specific user with proper RLS bypass
  const { data, error } = await supabase
    .from('content_topics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  console.log('getTopics query result:', { data, error });
  
  if (error) {
    console.error('Database error:', error);
    throw error;
  }
  
  return data || []
}

export async function updateTopicStatus(topicId: string, status: 'draft' | 'approved' | 'rejected' | 'done') {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('content_topics')
    .update({ status })
    .eq('id', topicId)
  
  if (error) throw error
}

export async function getTopicsByStatus(userId: string, status: 'draft' | 'approved' | 'rejected' | 'done') {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('content_topics')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getActiveTopics(userId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('content_topics')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['draft', 'approved', 'done'])
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getTopicCount(userId: string): Promise<number> {
  const supabase = createServerClient()
  
  const { count, error } = await supabase
    .from('content_topics')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  if (error) throw error
  return count || 0
}

export async function approveTopicAndGenerateTemplates(topicId: string, userId: string) {
  const supabase = createServerClient()
  
  try {
    // Update topic status to templates_generated
    const { error: updateError } = await supabase
      .from('content_topics')
      .update({ status: 'templates_generated' })
      .eq('id', topicId)
      .eq('user_id', userId)
    
    if (updateError) throw updateError
    
    // Get the topic details
    const { data: topic, error: topicError } = await supabase
      .from('content_topics')
      .select('topic')
      .eq('id', topicId)
      .single()
    
    if (topicError || !topic) throw new Error('Topic not found')
    
    // Generate templates for all platforms
    const { generateContentForAllPlatforms } = await import('./openai-actions')
    await generateContentForAllPlatforms(topic.topic, userId, topicId)
    
    return { success: true, topicId }
  } catch (error) {
    console.error('Error approving topic and generating templates:', error)
    throw new Error('Failed to approve topic and generate templates')
  }
}
