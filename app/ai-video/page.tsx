"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Video, RefreshCw, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { VideoCard } from "@/components/ai-video/VideoCard";
import { createClient } from "@supabase/supabase-js";

interface AIVideo {
  id: string;
  topic_id: string;
  topic_name: string;
  video_id: string;
  video_url: string | null;
  status: "generating" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface ReadyTopic {
  id: string;
  topic_id: string;
  topic_name: string;
  status: "ready";
}

interface Avatar {
  id: string;
  name: string;
}

interface Voice {
  id: string;
  name: string;
  language: string;
}

type VideoItem = AIVideo | ReadyTopic;

export default function AIVideoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [videos, setVideos] = useState<AIVideo[]>([]);
  const [readyTopics, setReadyTopics] = useState<ReadyTopic[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVideos = async (showSpinner = false) => {
    if (!user?.id) return;

    try {
      if (showSpinner) {
        setLoading(true);
      }

      const response = await fetch(`/api/ai-videos?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error("Failed to load videos:", error);
      toast.error("Failed to load videos. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchReadyTopics = async () => {
    if (!user?.id) return;

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get all videos to find topics that don't have videos
      const { data: existingVideos } = await supabase
        .from('ai_videos')
        .select('topic_id')
        .eq('user_id', user.id);

      const videoTopicIds = new Set((existingVideos || []).map(v => v.topic_id));

      // Get topics that are ready for generation (templates_generated or approved)
      // and don't have videos yet
      const { data: topics, error } = await supabase
        .from('content_topics')
        .select('id, topic')
        .eq('user_id', user.id)
        .in('status', ['templates_generated', 'approved'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out topics that already have videos
      const ready = (topics || [])
        .filter(topic => !videoTopicIds.has(topic.id))
        .map(topic => ({
          id: `ready-${topic.id}`,
          topic_id: topic.id,
          topic_name: topic.topic,
          status: 'ready' as const,
        }));

      setReadyTopics(ready);
    } catch (error) {
      console.error("Failed to load ready topics:", error);
    }
  };

  const fetchAvatars = async () => {
    // Use the same avatar from Node.js script
    setAvatars([{
      id: "Aditya_public_1",
      name: "Aditya (Transparent Ready)",
    }]);
  };

  const fetchVoices = async () => {
    // Use the same voice from Node.js script
    setVoices([{
      id: "f38a635bee7a4d1f9b0a654a31d050d2",
      name: "Default Voice",
      language: "en",
    }]);
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchVideos(true);
      fetchReadyTopics();
      fetchAvatars();
      fetchVoices();
    }
  }, [user?.id, authLoading]);

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await Promise.all([
      fetchVideos(),
      fetchReadyTopics(),
    ]);
  };

  // Filter out ready topics that already have videos (even if generating)
  const videoTopicIds = new Set(videos.map(v => v.topic_id));
  const filteredReadyTopics = readyTopics.filter(topic => !videoTopicIds.has(topic.topic_id));
  
  // Deduplicate by id to prevent React key warnings
  const seenIds = new Set<string>();
  const uniqueVideos = videos.filter(video => {
    if (seenIds.has(video.id)) {
      console.warn(`Duplicate video id found: ${video.id}`);
      return false;
    }
    seenIds.add(video.id);
    return true;
  });
  
  const uniqueReadyTopics = filteredReadyTopics.filter(topic => {
    if (seenIds.has(topic.id)) {
      console.warn(`Duplicate ready topic id found: ${topic.id}`);
      return false;
    }
    seenIds.add(topic.id);
    return true;
  });
  
  const allItems: VideoItem[] = [
    ...uniqueVideos,
    ...uniqueReadyTopics,
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <PageHeader
        rightContent={
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold heading-bebas">
              AI Avatar{" "}
              <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
                Videos
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl">
              View and manage your AI-generated avatar videos. Videos are created from your X platform content templates.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="inline-flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1E90FF]"></div>
                {videos.filter((v) => v.status === "generating").length} Generating
              </span>
              <span className="inline-flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                {videos.filter((v) => v.status === "completed").length} Ready
              </span>
              <span className="inline-flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {videos.filter((v) => v.status === "failed").length} Failed
              </span>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="ml-auto border-white/20 hover:border-[#1E90FF]/50 hover:bg-[#1E90FF]/10 rounded-full"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>

          {allItems.length === 0 ? (
            <div className="bg-[#1A1A1A] rounded-2xl p-12 text-center shadow-lg">
              <Video className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Videos Yet</h3>
              <p className="text-gray-400">
                Generate your first AI avatar video from a topic to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allItems.map((item) => (
                <VideoCard 
                  key={item.id} 
                  video={item} 
                  onRefresh={handleRefresh}
                  avatars={avatars}
                  voices={voices}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

