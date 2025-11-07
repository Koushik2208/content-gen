"use client";

import { Clock, CheckCircle2, XCircle, FileText, ArrowRight, Video, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { approveTopicAndGenerateTemplates } from "@/server/ai/actions";
// Removed - using API route instead
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@supabase/supabase-js";
import { ImproveTopicDialog } from "./ImproveTopicDialog";

type TopicStatus = "draft" | "templates_generated" | "approved" | "rejected" | "done";

interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  createdAt: string;
  description?: string;
  has_been_improved?: boolean;
  target_audience?: string | null;
  tone?: string | null;
}

interface TopicCardProps {
  topic: Topic;
  onTopicUpdate?: () => void;
}

const statusConfig = {
  draft: {
    icon: FileText,
    label: "Idea",
    color: "bg-[#1E90FF]/20 text-[#1E90FF] border-[#1E90FF]/30",
    iconColor: "text-[#1E90FF]",
    clickable: true,
  },
  templates_generated: {
    icon: ArrowRight,
    label: "Ready",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    iconColor: "text-orange-400",
    clickable: true,
  },
  approved: {
    icon: CheckCircle2,
    label: "Ready",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    iconColor: "text-emerald-400",
    clickable: true,
  },
  rejected: {
    icon: XCircle,
    label: "Archived",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    iconColor: "text-red-400",
    clickable: false,
  },
  done: {
    icon: CheckCircle2,
    label: "Published",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    iconColor: "text-gray-400",
    clickable: false,
  },
};

export function TopicCard({ topic, onTopicUpdate }: TopicCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState<'none' | 'generating' | 'completed' | 'failed'>("none");
  const [isImproveDialogOpen, setIsImproveDialogOpen] = useState(false);
  const config = statusConfig[topic.status];
  const IconComponent = config.icon;

  const checkVideoStatusForTopic = useCallback(async () => {
    if (!user?.id) return;

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from("ai_videos")
        .select("status")
        .eq("user_id", user.id)
        .eq("topic_id", topic.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setVideoStatus("none");
      } else {
        setVideoStatus(data.status);
      }
    } catch (error) {
      console.error("Failed to load video status for topic", topic.id, error);
      setVideoStatus("none");
    }
  }, [topic.id, user?.id]);

  useEffect(() => {
    checkVideoStatusForTopic();
  }, [checkVideoStatusForTopic]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleTopicClick = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }

    if (topic.status === "draft") {
      // Generate templates for draft topics
      setIsGenerating(true);
      try {
        await approveTopicAndGenerateTemplates(topic.id, user.id);
        toast.success("Templates generated successfully! Click to view.");
        onTopicUpdate?.(); // Refresh topics list
      } catch (error) {
        console.error("Error generating templates:", error);
        toast.error("Failed to generate templates. Please try again.");
      } finally {
        setIsGenerating(false);
        checkVideoStatusForTopic();
      }
    } else if (topic.status === "templates_generated" || topic.status === "approved") {
      // Navigate to templates for topics with templates
      router.push(`/content-templates?topic=${topic.id}`);
    }
  };

  const handleGenerateVideo = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }

    if (topic.status !== "templates_generated" && topic.status !== "approved") {
      toast.error("Please generate templates first");
      return;
    }

    setIsGeneratingVideo(true);
    try {
      // Use the same defaults as the AI video page
      const response = await fetch('/api/heygen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          userId: user.id,
          avatarId: "Aditya_public_1", // Same as AI video page
          voiceId: "f38a635bee7a4d1f9b0a654a31d050d2", // Same as AI video page
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start video generation');
      }

      toast.success("Video generation started! Check AI Videos page for progress.");
      router.push("/ai-video");
    } catch (error: any) {
      console.error("Error generating video:", error);
      toast.error(error.message || "Failed to generate video. Please try again.");
    } finally {
      setIsGeneratingVideo(false);
      checkVideoStatusForTopic();
    }
  };

  const CardContent = (
    <div
      className={`
        relative rounded-2xl p-6 border border-gray-700 bg-[#1A1A1A]
        hover:border-[#1E90FF]/50 transition-all duration-300 min-h-[280px] sm:min-h-[260px] flex flex-col group
        ${(config.clickable && !isGenerating) ? "cursor-pointer hover:-translate-y-1" : ""}
        ${isGenerating ? "opacity-75" : ""}
      `}
      onClick={config.clickable && !isGenerating ? handleTopicClick : undefined}
    >
        <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#1E90FF] transition-colors leading-tight">
            {topic.name}
          </h3>
        </div>
        {isGenerating ? (
          <div className="w-5 h-5 animate-spin border-2 border-[#1E90FF] border-t-transparent rounded-full" />
        ) : (
          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
        )}
      </div>

      {topic.description && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {topic.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className={`${config.color} border font-medium`}>{config.label}</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {formatDate(topic.createdAt)}
        </div>
      </div>

      <div className="mt-auto pt-2 space-y-2">
        {(topic.status === "templates_generated" || topic.status === "approved") && videoStatus === "none" && (
          <Button
            onClick={handleGenerateVideo}
            disabled={isGeneratingVideo}
            size="sm"
            variant="outline"
            className="w-full border-white/20 hover:border-[#FF2D95]/50 hover:bg-[#FF2D95]/10 rounded-full text-xs"
          >
            {isGeneratingVideo ? (
              <>
                <div className="w-3 h-3 animate-spin border-2 border-[#FF2D95] border-t-transparent rounded-full mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Video className="w-3 h-3 mr-2" />
                Generate Video
              </>
            )}
          </Button>
        )}

        {(topic.status === "templates_generated" || topic.status === "approved") && videoStatus === "completed" && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              router.push("/ai-video");
            }}
            size="sm"
            variant="outline"
            className="w-full border-white/20 hover:border-[#1E90FF]/50 hover:bg-[#1E90FF]/10 rounded-full text-xs"
          >
            <Video className="w-3 h-3 mr-2" />
            View Video
          </Button>
        )}

        {(topic.status === "templates_generated" || topic.status === "approved") && videoStatus === "failed" && (
          <Button
            onClick={handleGenerateVideo}
            disabled={isGeneratingVideo}
            size="sm"
            variant="outline"
            className="w-full border-red-500/40 hover:border-red-500/60 hover:bg-red-500/10 rounded-full text-xs text-red-400"
          >
            {isGeneratingVideo ? (
              <>
                <div className="w-3 h-3 animate-spin border-2 border-red-400 border-t-transparent rounded-full mr-2" />
                Regenerating...
              </>
            ) : (
              <>
                <Video className="w-3 h-3 mr-2" />
                Regenerate Video
              </>
            )}
          </Button>
        )}

        {!topic.has_been_improved && topic.status === "draft" && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setIsImproveDialogOpen(true);
            }}
            size="sm"
            variant="outline"
            className="w-full border-white/20 hover:border-[#FF2D95]/50 hover:bg-[#FF2D95]/10 rounded-full text-xs"
          >
            <Sparkles className="w-3 h-3 mr-2" />
            Improve Topic
          </Button>
        )}
      </div>

      {config.clickable && !isGenerating && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1E90FF]/5 to-[#FF2D95]/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </div>
  );

  return (
    <>
      {CardContent}
      <ImproveTopicDialog
        open={isImproveDialogOpen}
        onOpenChange={setIsImproveDialogOpen}
        topicId={topic.id}
        currentTopic={topic.name}
        currentTargetAudience={topic.target_audience}
        currentTone={topic.tone}
        onTopicImproved={() => {
          onTopicUpdate?.();
        }}
      />
    </>
  );
}
