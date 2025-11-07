import { NextResponse } from 'next/server'

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY
const BASE_URL = 'https://api.heygen.com'

// Retry helper for 5xx errors
async function apiCallWithRetry(fn: () => Promise<Response>, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fn()
      if (!response.ok) {
        const status = response.status
        if ((status >= 500 && status < 600) || status === 502) {
          if (attempt < maxRetries) {
            const wait = Math.pow(2, attempt) * 1000
            console.log(`Retry ${attempt}/${maxRetries} in ${wait / 1000}s...`)
            await new Promise((r) => setTimeout(r, wait))
            continue
          }
        }
      }
      return response
    } catch (error: any) {
      if (attempt === maxRetries) throw error
      const wait = Math.pow(2, attempt) * 1000
      console.log(`Retry ${attempt}/${maxRetries} in ${wait / 1000}s...`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  throw new Error('Max retries exceeded')
}

export async function GET() {
  try {
    if (!HEYGEN_API_KEY) {
      return NextResponse.json(
        { error: 'HeyGen API key not configured' },
        { status: 500 }
      )
    }

    const response = await apiCallWithRetry(() =>
      fetch(`${BASE_URL}/v2/voices`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-api-key': HEYGEN_API_KEY,
        },
      })
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('HeyGen voices API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch voices from HeyGen', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('HeyGen voices response:', JSON.stringify(data).substring(0, 500))
    
    // Handle response structure: {error: null, data: {voices: [...]}}
    let voicesArray: any[] = []
    if (data.data && data.data.voices && Array.isArray(data.data.voices)) {
      voicesArray = data.data.voices
    } else if (data.data && Array.isArray(data.data)) {
      voicesArray = data.data
    } else if (data.voices && Array.isArray(data.voices)) {
      voicesArray = data.voices
    } else if (Array.isArray(data)) {
      voicesArray = data
    }
    
    // Extract voice_id, name, and language from response
    const voices = voicesArray.map((voice: any) => ({
      id: voice.voice_id || voice.id,
      name: voice.name || 'Unknown Voice',
      language: voice.language || 'en',
    }))

    console.log('Parsed voices:', voices.length)
    return NextResponse.json({ voices }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error: any) {
    console.error('Error fetching voices:', error)
    return NextResponse.json(
      { error: 'Unexpected error fetching voices', details: error.message },
      { status: 500 }
    )
  }
}

