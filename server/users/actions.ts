'use server'

import { createServerClient } from '@/lib/supabaseClient'

export async function createProfile(data: {
  full_name: string
  profession: string
  audience: string
  tone: string
}, userId: string) {
  const supabase = createServerClient()
  
  const { data: result, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      full_name: data.full_name,
      profession: data.profession,
      audience: data.audience,
      tone: data.tone
    })
    .select()
    .single()
  
  if (error) throw error
  return result
}

export async function getProfile(userId: string) {
  const supabase = createServerClient()
  
  if (!userId) {
    throw new Error('User ID is required')
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
  return data
}

export async function updateProfile(id: string, updates: any) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}
