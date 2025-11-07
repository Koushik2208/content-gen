"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AddTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTopicAdded: () => void;
  userId: string;
  currentCount: number;
  maxCount: number;
}

export function AddTopicDialog({
  open,
  onOpenChange,
  onTopicAdded,
  userId,
  currentCount,
  maxCount,
}: AddTopicDialogProps) {
  const [topic, setTopic] = useState("");
  const [targetAudienceOption, setTargetAudienceOption] = useState<string>("");
  const [targetAudienceCustom, setTargetAudienceCustom] = useState("");
  const [toneOption, setToneOption] = useState<string>("");
  const [toneCustom, setToneCustom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toneOptions = [
    "professional",
    "casual",
    "authoritative",
    "conversational",
    "inspirational",
    "educational",
    "story telling",
    "lead magnet",
  ];

  const hasReachedLimit = currentCount >= maxCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasReachedLimit) {
      toast.error(`You have reached the maximum of ${maxCount} topics.`);
      return;
    }

    if (!topic.trim()) {
      toast.error("Please enter a topic title");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const finalTargetAudience = targetAudienceOption === "custom" 
        ? targetAudienceCustom.trim() || null 
        : targetAudienceOption || null;
      
      const finalTone = toneOption === "custom" 
        ? toneCustom.trim() || null 
        : toneOption || null;

      const { error } = await supabase.from("content_topics").insert({
        user_id: userId,
        topic: topic.trim(),
        status: "draft",
        target_audience: finalTargetAudience,
        tone: finalTone,
      });

      if (error) throw error;

      toast.success("Topic added successfully!");
      setTopic("");
      setTargetAudienceOption("");
      setTargetAudienceCustom("");
      setToneOption("");
      setToneCustom("");
      onOpenChange(false);
      onTopicAdded();
    } catch (error) {
      console.error("Error adding topic:", error);
      toast.error("Failed to add topic. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1A1A1A] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Add Your Own Topic</DialogTitle>
        </DialogHeader>

        {hasReachedLimit ? (
          <div className="py-4">
            <p className="text-gray-400">
              You have reached the maximum of {maxCount} topics. Please archive or complete some topics before adding new ones.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-white">
                Topic Title *
              </Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to Build a Personal Brand on LinkedIn"
                className="bg-[#121212] border-white/10 focus:border-[#1E90FF] text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience" className="text-white">
                Target Audience
              </Label>
              <Select value={targetAudienceOption} onValueChange={setTargetAudienceOption}>
                <SelectTrigger id="audience" className="bg-[#121212] border-white/10 focus:border-[#1E90FF] text-white">
                  <SelectValue placeholder="Select or type custom" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  <SelectItem value="developers" className="text-white hover:bg-white/10">Developers</SelectItem>
                  <SelectItem value="entrepreneurs" className="text-white hover:bg-white/10">Entrepreneurs</SelectItem>
                  <SelectItem value="marketing professionals" className="text-white hover:bg-white/10">Marketing Professionals</SelectItem>
                  <SelectItem value="small business owners" className="text-white hover:bg-white/10">Small Business Owners</SelectItem>
                  <SelectItem value="creatives" className="text-white hover:bg-white/10">Creatives</SelectItem>
                  <SelectItem value="custom" className="text-white hover:bg-white/10">Custom (type your own)</SelectItem>
                </SelectContent>
              </Select>
              {targetAudienceOption === "custom" && (
                <Input
                  value={targetAudienceCustom}
                  onChange={(e) => setTargetAudienceCustom(e.target.value)}
                  placeholder="e.g., Aspiring entrepreneurs and small business owners"
                  className="bg-[#121212] border-white/10 focus:border-[#1E90FF] text-white mt-2"
                />
              )}
              <p className="text-xs text-gray-500">Optional: Specify target audience for this topic. Otherwise, your profile defaults will be used.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone" className="text-white">
                Content Tone
              </Label>
              <Select value={toneOption} onValueChange={setToneOption}>
                <SelectTrigger id="tone" className="bg-[#121212] border-white/10 focus:border-[#1E90FF] text-white">
                  <SelectValue placeholder="Select or type custom" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  {toneOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-white/10 capitalize">
                      {option}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="text-white hover:bg-white/10">Custom (type your own)</SelectItem>
                </SelectContent>
              </Select>
              {toneOption === "custom" && (
                <Input
                  value={toneCustom}
                  onChange={(e) => setToneCustom(e.target.value)}
                  placeholder="e.g., Professional yet approachable"
                  className="bg-[#121212] border-white/10 focus:border-[#1E90FF] text-white mt-2"
                />
              )}
              <p className="text-xs text-gray-500">Optional: Specify tone for this topic. Otherwise, your profile defaults will be used.</p>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Topic"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

