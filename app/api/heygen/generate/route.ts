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

    // Fetch topic name from content_topics table
    const supabase = createServerClient();
    const { data: topic, error: topicError } = await supabase
      .from('content_topics')
      .select('topic')
      .eq('id', topicId)
      .eq('user_id', userId)
      .single();

    if (topicError || !topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Create a simple demo script with the topic name
    const script = `Hey there, today we are going to talk about ${topic.topic}.`; 

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

    // Create or update the ai_videos record with generating status
    const { error: dbError } = await supabase
      .from('ai_videos')
      .upsert({
        user_id: userId,
        topic_id: topicId,
        video_id: videoId,
        status: 'generating',
        video_url: null,
        error_message: null,
        completed_at: null,
      }, {
        onConflict: 'user_id,topic_id',
      });

    if (dbError) {
      console.error('Error saving video to database:', dbError);
      // Don't fail the request, but log the error
    }

    return NextResponse.json({ videoId }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/heygen/generate:', error);
    return NextResponse.json(
      { error: 'Unexpected error', message: error.message },
      { status: 500 }
    );
  }
}