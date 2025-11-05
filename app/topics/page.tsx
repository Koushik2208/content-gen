"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  Plus,
} from "lucide-react";
import { TopicCard } from "@/components/topics/TopicCard";
import { GenerateTopicsButton } from "@/components/topics/GenerateTopicsButton";
import { AddTopicDialog } from "@/components/topics/AddTopicDialog";
import { useAuth } from "@/lib/auth-context";
import { getProfile } from "@/server/users/actions";
import { getTopics } from "@/server/ai/actions";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import { PageHeader } from "@/components/shared/PageHeader";

type TopicStatus = "draft" | "templates_generated" | "approved" | "rejected" | "done";

interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  createdAt: string;
  description?: string;
}

export default function TopicsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileCheckComplete, setProfileCheckComplete] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const topicCount = topics.length;
  const maxTopics = 10;

  // Check if user has profile
  const checkUserProfile = async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      if (!profile) {
        toast.error("Please complete your profile first");
        router.push("/onboarding");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking profile:", error);
      toast.error("Please complete your profile first");
      router.push("/onboarding");
      return false;
    }
  };

  // Load topics from API
  // Load topics from API
  const loadTopics = async (userId: string) => {
    try {
      setLoading(true);
      console.log("Loading topics for user:", userId);

      // Use client-side Supabase instead of server action
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from("content_topics")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      console.log("Client query result:", { data, error });

      if (error) {
        throw error;
      }

      // Transform API data to match component interface
      const transformedTopics: Topic[] = (data || []).map((topic: any) => ({
        id: topic.id,
        name: topic.topic,
        status: topic.status,
        createdAt: new Date(topic.created_at).toISOString().split("T")[0],
        description: `AI-generated topic: ${topic.topic}`,
      }));

      console.log("Transformed topics:", transformedTopics);
      setTopics(transformedTopics);
    } catch (error) {
      console.error("Error loading topics:", error);
      toast.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  // Refresh topics after generation
  const handleTopicsGenerated = async () => {
    console.log("handleTopicsGenerated called");
    if (user) {
      console.log("Refreshing topics for user:", user.id);
      await loadTopics(user.id);
    }
  };

  // Handle authentication and profile check
  useEffect(() => {
    const initializePage = async () => {
      if (authLoading) return;

      if (!user) {
        router.push("/");
        return;
      }

      const hasProfile = await checkUserProfile(user.id);
      if (hasProfile) {
        await loadTopics(user.id);
        setProfileCheckComplete(true);
      }
    };

    if (user && !profileCheckComplete) {
      initializePage();
    }
  }, [user?.id, authLoading]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Show loading while checking profile and loading topics
  if (!profileCheckComplete || loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading topics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <PageHeader rightContent={null} />

      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold heading-bebas">
              Topics
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl">
              Manage your topics. Click an Idea to generate templates, or open Ready topics to use templates.
            </p>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                disabled={topicCount >= maxTopics}
                className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your Own Topic
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="inline-flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1E90FF]"></div>
                {topics.filter((t) => t.status === "draft").length} Idea
              </span>
              <span className="inline-flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                {topics.filter((t) => t.status === "approved" || t.status === "templates_generated").length} Ready
              </span>
              <span className="inline-flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                {topics.filter((t) => t.status === "done").length} Published
              </span>
              <span className="inline-flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {topics.filter((t) => t.status === "rejected").length} Archived
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic) => (
              <TopicCard 
                key={topic.id} 
                topic={topic} 
                onTopicUpdate={handleTopicsGenerated}
              />
            ))}
          </div>

          <GenerateTopicsButton
            currentCount={topicCount}
            maxCount={maxTopics}
            onTopicsGenerated={handleTopicsGenerated}
          />
          {user && (
            <AddTopicDialog
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              onTopicAdded={handleTopicsGenerated}
              userId={user.id}
              currentCount={topicCount}
              maxCount={maxTopics}
            />
          )}
        </div>
      </main>
    </div>
  );
}
