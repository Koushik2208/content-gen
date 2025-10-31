'use server'

import OpenAI from 'openai'
import { createServerClient } from '@/lib/supabaseClient'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface UserProfile {
  profession: string
  audience: string
  tone: string
}

export async function generateTopics(userProfile: UserProfile, userId: string): Promise<string[]> {
  try {
    const prompt = `Generate exactly 5 content topics for a ${userProfile.profession} targeting ${userProfile.audience} with a ${userProfile.tone} tone. 
    Return only the topics, one per line, without numbering or bullet points.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a content strategy expert. Generate exactly 5 engaging, relevant topics that would resonate with the target audience."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    const topicsText = completion.choices[0]?.message?.content || ''
    const topics = topicsText.split('\n').filter(topic => topic.trim()).slice(0, 5)

    // Save topics to database
    const supabase = createServerClient()
    const topicsToSave = topics.map(topic => ({
      user_id: userId,
      topic: topic.trim(),
      status: 'draft'
    }))

    console.log('Saving topics to database:', topicsToSave);

    const { data: insertedData, error } = await supabase
      .from('content_topics')
      .insert(topicsToSave)
      .select()

    console.log('Database insert result:', { insertedData, error });

    if (error) {
      console.error('Error saving topics to database:', error)
      throw new Error('Failed to save topics to database')
    }

    return topics
  } catch (error) {
    console.error('Error generating topics:', error)
    throw new Error('Failed to generate topics')
  }
}

export async function generateContentTemplate(topic: string, userId: string, topicId: string, platform: string): Promise<{
  title: string
  content: string
  tags: string[]
}> {
  try {
    // Get user profile to use preferences
    const supabase = createServerClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('profession, audience, tone')
      .eq('user_id', userId)
      .single()

    const userContext = profile 
      ? `Target Audience: ${profile.audience}, Content Tone: ${profile.tone}${profile.profession ? `, Profession: ${profile.profession}` : ''}`
      : ''

    const platformGuidelines = {
      instagram: "Instagram: Create carousel-ready posts with hook, 2-3 mini-insights, and CTA. Use emojis naturally, keep text concise but valuable, include 3-5 hashtags. Structure as: Title/Hook (Slide 1), Slide 2, Slide 3, CTA slide.",
      linkedin: "LinkedIn: Professional, business-focused, longer form, industry insights, networking",
      x: "X (Twitter): Concise, trending, hashtags, conversational, real-time engagement"
    }

    const prompt = platform === 'instagram' 
      ? `Create a carousel-ready Instagram post for the topic: "${topic}"
      
      ${userContext ? `User Preferences: ${userContext}\n\n` : ''}
      Structure the post as follows:
      1. Hook/Title (Slide 1) - Grab attention with an engaging opening
      2. Slide 2 - First mini-insight or example (actionable, valuable)
      3. Slide 3 - Second mini-insight or example (actionable, valuable)  
      4. Slide 4 - Third mini-insight or example (actionable, valuable)
      5. CTA Slide - Simple call-to-action to encourage engagement
      
      Guidelines:
      - Use emojis naturally throughout
      - Keep text concise but valuable (not too short, not too long)
      - Make each slide provide actual value
      - Include 3-5 relevant hashtags at the end
      - Make it engaging and shareable
      ${profile?.tone ? `- Maintain a ${profile.tone} tone throughout` : ''}
      ${profile?.audience ? `- Write specifically for ${profile.audience}` : ''}
      
      Format the response as:
      TITLE: [Hook/Title for Slide 1]
      CONTENT: [Complete carousel post with all slides]
      TAGS: [tag1, tag2, tag3, tag4, tag5]`
      : `Create a content template for the topic: "${topic}" for ${platform.toUpperCase()}
      
      ${userContext ? `User Preferences: ${userContext}\n\n` : ''}
      Platform Guidelines: ${platformGuidelines[platform as keyof typeof platformGuidelines]}
      
      Generate:
      1. A compelling title (max 60 characters)
      2. Engaging content optimized for ${platform} (follow platform guidelines)
      3. 3-5 relevant hashtags/tags for ${platform}
      ${profile?.tone ? `4. Content must maintain a ${profile.tone} tone` : ''}
      ${profile?.audience ? `5. Content must resonate with ${profile.audience}` : ''}
      
      Format the response as:
      TITLE: [title here]
      CONTENT: [content here]
      TAGS: [tag1, tag2, tag3, tag4, tag5]`

    const systemMessage = platform === 'instagram'
      ? `You are a professional Instagram content creator specializing in carousel posts. Create engaging, carousel-ready content with hooks, valuable insights, and strong CTAs. Focus on providing real value in each slide while maintaining Instagram's visual and engaging style.${profile?.tone ? ` Always maintain a ${profile.tone} tone.` : ''}${profile?.audience ? ` Write specifically for ${profile.audience}.` : ''}`
      : `You are a professional content creator specializing in ${platform}. Create engaging, platform-optimized content that drives engagement.${profile?.tone ? ` Always maintain a ${profile.tone} tone.` : ''}${profile?.audience ? ` Write specifically for ${profile.audience}.` : ''}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: platform === 'instagram' ? 1000 : 800,
      temperature: 0.7
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // Parse the response
    const titleMatch = response.match(/TITLE:\s*(.+)/i)
    const contentMatch = response.match(/CONTENT:\s*([\s\S]+?)(?=TAGS:|$)/i)
    const tagsMatch = response.match(/TAGS:\s*(.+)/i)

    const title = titleMatch?.[1]?.trim() || `Content about ${topic}`
    const content = contentMatch?.[1]?.trim() || `Content about ${topic}`
    const tags = tagsMatch?.[1]?.split(',').map(tag => tag.trim()).filter(tag => tag) || []

    // Save template to database
    const { data, error } = await supabase
      .from('content_templates')
      .insert({
        user_id: userId,
        topic_id: topicId,
        title,
        content,
        tags,
        platform,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving template to database:', error)
      throw new Error('Failed to save template to database')
    }

    return {
      title,
      content,
      tags
    }
  } catch (error) {
    console.error('Error generating content template:', error)
    throw new Error('Failed to generate content template')
  }
}

export async function generateContentForAllPlatforms(topic: string, userId: string, topicId: string): Promise<{
  instagram: { title: string; content: string; tags: string[] }
  linkedin: { title: string; content: string; tags: string[] }
  x: { title: string; content: string; tags: string[] }
}> {
  const platforms = ['instagram', 'linkedin', 'x'] as const
  const results: any = {}
  const failedPlatforms: string[] = []

  for (const platform of platforms) {
    try {
      const template = await generateContentTemplate(topic, userId, topicId, platform)
      results[platform] = template
    } catch (error) {
      console.error(`Error generating content for ${platform}:`, {
        error: error instanceof Error ? error.message : error,
        topic,
        userId,
        topicId,
        platform,
        timestamp: new Date().toISOString()
      })
      
      failedPlatforms.push(platform)
      
      // Create fallback content
      results[platform] = {
        title: `Content about ${topic}`,
        content: `This is content about ${topic} optimized for ${platform}.`,
        tags: [topic.toLowerCase().replace(/\s+/g, '')]
      }
    }
  }

  // Log summary of failed platforms
  if (failedPlatforms.length > 0) {
    console.warn(`Content generation failed for platforms: ${failedPlatforms.join(', ')}. Using fallback content.`)
  }

  return results
}
