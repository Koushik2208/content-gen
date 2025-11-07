"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { improveTopicWithFeedback } from "@/server/ai/actions";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface ImproveTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicId: string;
  currentTopic: string;
  currentTargetAudience?: string | null;
  currentTone?: string | null;
  onTopicImproved?: () => void;
}

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

export function ImproveTopicDialog({
  open,
  onOpenChange,
  topicId,
  currentTopic,
  currentTargetAudience,
  currentTone,
  onTopicImproved,
}: ImproveTopicDialogProps) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [targetAudienceOption, setTargetAudienceOption] = useState<string>("");
  const [targetAudienceCustom, setTargetAudienceCustom] = useState("");
  const [toneOption, setToneOption] = useState<string>("");
  const [toneCustom, setToneCustom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with current values if they exist
  useEffect(() => {
    if (open) {
      if (currentTargetAudience) {
        const isCustom = !["developers", "entrepreneurs", "marketing professionals", "small business owners", "creatives"].includes(currentTargetAudience);
        if (isCustom) {
          setTargetAudienceOption("custom");
          setTargetAudienceCustom(currentTargetAudience);
        } else {
          setTargetAudienceOption(currentTargetAudience);
          setTargetAudienceCustom("");
        }
      } else {
        setTargetAudienceOption("");
        setTargetAudienceCustom("");
      }

      if (currentTone) {
        const isCustom = !toneOptions.includes(currentTone);
        if (isCustom) {
          setToneOption("custom");
          setToneCustom(currentTone);
        } else {
          setToneOption(currentTone);
          setToneCustom("");
        }
      } else {
        setToneOption("");
        setToneCustom("");
      }
      setFeedback("");
    }
  }, [open, currentTargetAudience, currentTone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Please sign in to improve topics");
      return;
    }

    const finalTargetAudience = targetAudienceOption === "custom" 
      ? targetAudienceCustom.trim() || undefined 
      : targetAudienceOption || undefined;
    
    const finalTone = toneOption === "custom" 
      ? toneCustom.trim() || undefined 
      : toneOption || undefined;

    // Check if at least one field is provided
    const hasFeedback = feedback.trim().length > 0;
    const hasTargetAudience = !!finalTargetAudience;
    const hasTone = !!finalTone;
    const hasAnyChange = hasFeedback || hasTargetAudience || hasTone;

    if (!hasAnyChange) {
      toast.error("Please provide feedback, target audience, or tone to improve the topic");
      return;
    }

    setIsSubmitting(true);

    try {
      await improveTopicWithFeedback(topicId, user.id, feedback.trim() || undefined, finalTargetAudience, finalTone);
      
      toast.success("Topic improved successfully!");
      onOpenChange(false);
      onTopicImproved?.();
    } catch (error: any) {
      console.error("Error improving topic:", error);
      toast.error(error.message || "Failed to improve topic. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden bg-[#1A1A1A] border-white/10 text-white sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Improve Topic</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1 pb-2 scrollbar-hide">
          <div className="space-y-2">
            <Label className="text-white">Current Topic</Label>
            <div className="p-3 bg-[#121212] rounded-lg border border-white/10 text-gray-300">
              {currentTopic}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-white">
              Feedback
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., Make it more specific, focus on beginners, add a call-to-action element..."
              className="bg-[#121212] border-white/10 focus:border-[#1E90FF] text-white min-h-[100px] resize-none"
            />
            <p className="text-xs text-gray-500">Optional: Provide feedback on how to improve this topic. You can only improve a topic once.</p>
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
            <p className="text-xs text-gray-500">Optional: Specify target audience for this topic.</p>
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
            <p className="text-xs text-gray-500">Optional: Specify tone for this topic.</p>
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
              disabled={
                isSubmitting || 
                (!feedback.trim() && 
                 !targetAudienceOption && 
                 !toneOption)
              }
              className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Improving...
                </>
              ) : (
                "Improve Topic"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

