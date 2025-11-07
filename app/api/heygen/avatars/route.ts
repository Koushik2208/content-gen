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
      fetch(`${BASE_URL}/v2/avatars`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-api-key': HEYGEN_API_KEY,
        },
      })
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('HeyGen avatars API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch avatars from HeyGen', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('HeyGen avatars response:', JSON.stringify(data).substring(0, 500))
    
    // Handle response structure: {error: null, data: {avatars: [...]}}
    let avatarsArray: any[] = []
    if (data.data && data.data.avatars && Array.isArray(data.data.avatars)) {
      avatarsArray = data.data.avatars
    } else if (data.data && Array.isArray(data.data)) {
      avatarsArray = data.data
    } else if (data.avatars && Array.isArray(data.avatars)) {
      avatarsArray = data.avatars
    } else if (Array.isArray(data)) {
      avatarsArray = data
    }
    
    // Extract avatar_id and avatar_name from response
    const avatars = avatarsArray.map((avatar: any) => ({
      id: avatar.avatar_id || avatar.id,
      name: avatar.avatar_name || avatar.name || 'Unknown Avatar',
    }))

    console.log('Parsed avatars:', avatars.length)
    return NextResponse.json({ avatars }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error: any) {
    console.error('Error fetching avatars:', error)
    return NextResponse.json(
      { error: 'Unexpected error fetching avatars', details: error.message },
      { status: 500 }
    )
  }
}

