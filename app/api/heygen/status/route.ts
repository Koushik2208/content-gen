// app/api/heygen/status/route.ts
import { NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const BASE_URL = 'https://api.heygen.com';

// Helper: Retry on 5xx, 502, 429
async function fetchWithRetry(url: string, options: RequestInit, retries = 4) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    const status = res.status;

    if (status >= 500 || status === 502 || status === 429) {
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s, 8s
      console.log(`HeyGen status 5xx/502/429 → retry ${i + 1}/${retries} in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    return res;
  }
  throw new Error('Max retries exceeded for HeyGen status');
}

export async function GET(request: Request) {
  try {
    if (!HEYGEN_API_KEY) {
      return NextResponse.json(
        { error: 'HeyGen API key not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Missing videoId parameter' },
        { status: 400 }
      );
    }

    const response = await fetchWithRetry(
      `${BASE_URL}/v1/video_status.get?video_id=${videoId}`,
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('HeyGen status error:', response.status, text);
      return NextResponse.json(
        { error: 'Failed to check video status', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      status: data.data?.status,
      video_url: data.data?.video_url,
      error: data.data?.error,
    });
  } catch (error: any) {
    console.error('Error in /api/heygen/status:', error);
    return NextResponse.json(
      { error: 'Unexpected error', message: error.message },
      { status: 500 }
    );
  }
}