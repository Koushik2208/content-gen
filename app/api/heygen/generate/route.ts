// app/api/heygen/generate/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseClient';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const BASE_URL = 'https://api.heygen.com';

async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.status >= 500 && res.status < 600) {
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 2000));
      continue;
    }
    return res;
  }
  throw new Error('Max retries exceeded');
}

export async function POST(request: Request) {
  try {
    if (!HEYGEN_API_KEY) {
      return NextResponse.json(
        { error: 'HeyGen API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { topicId, userId, avatarId, voiceId } = body;

    if (!topicId || !userId || !avatarId || !voiceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch X platform content template for this topic
    const supabase = createServerClient();
    const { data: template, error: templateError } = await supabase
      .from('content_templates')
      .select('content')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .eq('platform', 'x')
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'X platform content template not found for this topic' },
        { status: 404 }
      );
    }

    const script = template.content; 

    const payload = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: avatarId,
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: script,
            voice_id: voiceId,
          },
          // No background = transparent
        },
      ],
      dimension: { width: 720, height: 1280 }, // 9:16 mobile
      // format: "webm" → goes in URL, not body
    };

    const response = await fetchWithRetry(
      `${BASE_URL}/v2/video/generate?format=webm`,
      {
        method: 'POST',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('HeyGen generate error:', err);
      return NextResponse.json(
        { error: 'Failed to start generation', details: err },
        { status: response.status }
      );
    }

    const result = await response.json();
    const videoId = result.data?.video_id;

    if (!videoId) {
      return NextResponse.json(
        { error: 'No video_id returned' },
        { status: 500 }
      );
    }

    // Optionally: Save videoId to your DB here
    // await db.aiVideo.update({ where: { topic_id: topicId }, data: { video_id: videoId, status: 'generating' } })

    return NextResponse.json({ videoId }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/heygen/generate:', error);
    return NextResponse.json(
      { error: 'Unexpected error', message: error.message },
      { status: 500 }
    );
  }
}