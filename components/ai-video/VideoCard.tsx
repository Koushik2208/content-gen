"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Video, Download, Loader2, AlertCircle, RefreshCw, Play, X } from "lucide-react";
import { format } from "date-fns";
import { cancelStuckVideo } from "@/server/heygen/actions";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface AIVideo {
  id: string;
  topic_id: string;
  topic_name: string;
  video_id?: string;
  video_url?: string | null;
  status: "generating" | "completed" | "failed" | "ready";
  error_message?: string | null;
  created_at?: string;
  completed_at?: string | null;
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

interface VideoCardProps {
  video: AIVideo;
  onRefresh: () => void;
  avatars?: Avatar[];
  voices?: Voice[];
}

export function VideoCard({ video, onRefresh, avatars = [], voices = [] }: VideoCardProps) {
  const { user } = useAuth();
  // Auto-select the default avatar and voice if available
  const defaultAvatarId = avatars.length > 0 ? avatars[0].id : "";
  const defaultVoiceId = voices.length > 0 ? voices[0].id : "";
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(defaultAvatarId);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(defaultVoiceId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Update selections when avatars/voices load
  useEffect(() => {
    if (defaultAvatarId && !selectedAvatarId) {
      setSelectedAvatarId(defaultAvatarId);
    }
    if (defaultVoiceId && !selectedVoiceId) {
      setSelectedVoiceId(defaultVoiceId);
    }
  }, [defaultAvatarId, defaultVoiceId, selectedAvatarId, selectedVoiceId]);

  const statusConfig = {
    generating: {
      label: "Generating",
      color: "bg-[#1E90FF]/20 text-[#1E90FF] border-[#1E90FF]/30",
      icon: Loader2,
    },
    completed: {
      label: "Ready",
      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: Video,
    },
    failed: {
      label: "Failed",
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      icon: AlertCircle,
    },
    ready: {
      label: "Ready to Generate",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      icon: Video,
    },
  };

  const config = statusConfig[video.status];
  const IconComponent = config.icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Unknown date";
    }
  };

  const handleDownload = () => {
    if (video.video_url) {
      window.open(video.video_url, "_blank");
    }
  };

 // Replace handleGenerate function in VideoCard.tsx

const handleGenerate = async () => {
  if (isGenerating) return;
  if (!user?.id) {
    toast.error("Please log in to generate videos");
    return;
  }
  if (!selectedAvatarId || !selectedVoiceId) {
    toast.error("Please select both an avatar and a voice");
    return;
  }

  setIsGenerating(true);
  try {
    // Step 1: Start generation (non-blocking)
    const startResponse = await fetch('/api/heygen/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicId: video.topic_id,
        userId: user.id,
        avatarId: selectedAvatarId,
        voiceId: selectedVoiceId,
      }),
    });

    if (!startResponse.ok) {
      const errorData = await startResponse.json();
      throw new Error(errorData.error || 'Failed to start video generation');
    }

    const { videoId } = await startResponse.json();
    toast.success("Video generation started!");
    onRefresh(); // Refresh to show generating status

    // Step 2: Poll status on client side (like Node.js script)
    const startTime = Date.now();
    const maxWaitMs = 5 * 60 * 1000; // 5 minutes max

    while (Date.now() - startTime < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, 6000)); // Wait 6s

      const statusResponse = await fetch(`/api/heygen/status?videoId=${videoId}`);
      if (!statusResponse.ok) {
        console.error('Status check failed, will retry...');
        continue;
      }

      const { status, video_url, error } = await statusResponse.json();

      if (status === 'completed' && video_url) {
        // Update database via API
        const updateResponse = await fetch('/api/ai-videos/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicId: video.topic_id,
            userId: user.id,
            status: 'completed',
            videoUrl: video_url,
            videoId: videoId, // Pass videoId for proper record creation/update
          }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          console.error('Failed to update video in database:', errorData);
          toast.error("Video generated but failed to save to database");
        } else {
          toast.success("Video generation completed!");
        }
        onRefresh();
        return;
      }

      if (status === 'failed') {
        const updateResponse = await fetch('/api/ai-videos/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicId: video.topic_id,
            userId: user.id,
            status: 'failed',
            errorMessage: error?.message || 'Generation failed',
            videoId: videoId, // Pass videoId for proper record creation/update
          }),
        });

        if (!updateResponse.ok) {
          console.error('Failed to update video status in database');
        }
        toast.error("Video generation failed");
        onRefresh();
        return;
      }

      // Still generating, continue polling
      console.log(`Status: ${status}, waiting...`);
    }

    // Timeout
    toast.error("Video generation timed out");
    onRefresh();
  } catch (error: any) {
    console.error("Failed to generate video:", error);
    toast.error(error.message || "Failed to generate video. Please try again.");
  } finally {
    setIsGenerating(false);
  }
};

  const handleCancel = async () => {
    if (!user?.id || isCancelling) {
      return;
    }

    setIsCancelling(true);
    try {
      await cancelStuckVideo(video.topic_id, user.id);
      toast.success("Video generation cancelled. You can now regenerate.");
      onRefresh();
    } catch (error: any) {
      console.error("Failed to cancel video:", error);
      toast.error(error.message || "Failed to cancel video. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const showGenerateUI = video.status === "failed" || video.status === "ready";

  return (
    <Card className="relative bg-[#1A1A1A] border border-white/10 shadow-lg hover:shadow-2xl hover:shadow-[#1E90FF]/10 transition-all duration-300 group h-full flex flex-col">
      <CardHeader className="space-y-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-white leading-tight flex-1 group-hover:text-[#1E90FF] transition-colors">
            {video.topic_name}
          </h3>
          {video.status === "generating" && (
            <Loader2 className="w-5 h-5 text-[#1E90FF] animate-spin flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`${config.color} border font-medium`}>
            <IconComponent className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center min-h-[200px]">
        {video.status === "generating" ? (
          <div className="text-center space-y-3">
            <Loader2 className="w-12 h-12 mx-auto text-[#1E90FF] animate-spin" />
            <p className="text-sm text-gray-400">Video is being generated...</p>
            <p className="text-xs text-gray-500">This may take a few minutes</p>
          </div>
        ) : video.status === "completed" && video.video_url ? (
          <div className="w-full">
            <video
              src={video.video_url}
              controls
              className="w-full rounded-lg bg-black"
              style={{ maxHeight: "300px" }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : video.status === "failed" ? (
          <div className="text-center space-y-3">
            <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
            <p className="text-sm text-red-400">Generation failed</p>
            {video.error_message && (
              <p className="text-xs text-gray-500 max-w-xs mx-auto">{video.error_message}</p>
            )}
          </div>
        ) : video.status === "ready" ? (
          <div className="text-center space-y-3">
            <Video className="w-12 h-12 mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">Ready to generate video</p>
            <p className="text-xs text-gray-500">Select avatar and voice below</p>
          </div>
        ) : (
          <div className="text-center">
            <Video className="w-12 h-12 mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">No preview available</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-white/5 pt-4 flex-shrink-0 flex-col gap-3">
        {video.created_at && (
          <div className="text-xs text-gray-500 w-full text-center">
            Created {formatDate(video.created_at)}
          </div>
        )}
        
        {showGenerateUI && avatars.length > 0 && voices.length > 0 && (
          <div className="w-full space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Avatar</Label>
              <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
                <SelectTrigger className="bg-[#121212] border-white/10 text-white text-sm h-9">
                  <SelectValue placeholder="Select avatar" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  {avatars.map((avatar) => (
                    <SelectItem
                      key={avatar.id}
                      value={avatar.id}
                      className="text-white hover:bg-white/10"
                    >
                      {avatar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Voice</Label>
              <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                <SelectTrigger className="bg-[#121212] border-white/10 text-white text-sm h-9">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  {voices.map((voice) => (
                    <SelectItem
                      key={voice.id}
                      value={voice.id}
                      className="text-white hover:bg-white/10"
                    >
                      {voice.name} ({voice.language})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedAvatarId || !selectedVoiceId}
              className="w-full bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white rounded-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </div>
        )}

        {!showGenerateUI && (
          <div className="flex items-center gap-2 w-full">
            {video.status === "completed" && video.video_url ? (
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 border-white/20 hover:border-[#1E90FF]/50 hover:bg-[#1E90FF]/10 rounded-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            ) : video.status === "generating" ? (
              <>
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  className="flex-1 border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  variant="outline"
                  className="border-red-500/40 hover:border-red-500/60 hover:bg-red-500/10 text-red-400 rounded-full"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  )}
                </Button>
              </>
            ) : null}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

