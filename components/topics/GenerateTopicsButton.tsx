'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { generateTopics } from '@/server/ai/actions';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface GenerateTopicsButtonProps {
  currentCount: number;
  maxCount: number;
  onTopicsGenerated?: () => void;
}

export function GenerateTopicsButton({ currentCount, maxCount, onTopicsGenerated }: GenerateTopicsButtonProps) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [count, setCount] = useState<string>('1');
  const hasReachedLimit = currentCount >= maxCount;

  const handleGenerateTopics = async () => {
    if (!user) {
      toast.error('Please sign in to generate topics');
      return;
    }

    const remaining = maxCount - currentCount;
    const selectedCount = parseInt(count);
    // Limit to max 3 topics at once
    const maxPerGeneration = 3;
    const topicsToGenerate = Math.min(selectedCount, remaining, maxPerGeneration);

    if (topicsToGenerate <= 0) {
      toast.error(`You have reached the maximum of ${maxCount} topics.`);
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating topics for user:', user.id);
      const result = await generateTopics(user.id, topicsToGenerate);
      console.log('Generation result:', result);
      toast.success(`Generated ${topicsToGenerate} topic${topicsToGenerate === 1 ? '' : 's'} successfully!`);
      onTopicsGenerated?.(); // Refresh the topics list
    } catch (error) {
      console.error('Error generating topics:', error);
      toast.error('Failed to generate topics. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasReachedLimit) {
    return (
      <div className="mt-8 bg-[#1A1A1A] rounded-2xl p-8 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Topic Limit Reached
            </h3>
            <p className="text-gray-400 leading-relaxed">
              You have reached the maximum of {maxCount} topics. To generate new topics, please complete or archive some of your existing topics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E90FF]/10 to-[#FF2D95]/10 blur-2xl rounded-3xl"></div>
      <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#161616] rounded-2xl p-8 shadow-2xl border border-white/10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E90FF]/10 border border-[#1E90FF]/20">
            <Sparkles className="w-4 h-4 text-[#1E90FF]" />
            <span className="text-sm">{currentCount} of {maxCount} topics</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold heading-bebas">
            Ready to{' '}
            <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
              Generate More Topics?
            </span>
          </h3>

          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Our AI will analyze your profile and create engaging content topics tailored to your audience.
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="topic-count" className="text-gray-400 text-sm">
                Generate:
              </Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger id="topic-count" className="w-20 bg-[#121212] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  {[1, 2, 3].map((num) => {
                    const remaining = maxCount - currentCount;
                    const maxAllowed = Math.min(num, remaining);
                    return (
                      <SelectItem
                        key={num}
                        value={num.toString()}
                        disabled={maxAllowed < num}
                        className="text-white hover:bg-white/10"
                      >
                        {num}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-400">
                topic{parseInt(count) === 1 ? '' : 's'} at once
              </span>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleGenerateTopics}
            disabled={isGenerating}
            className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow transition-all text-lg px-12 py-7 rounded-full font-semibold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Topics...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {currentCount === 0 ? 'Start Generating' : 'Generate More Topics'}
              </>
            )}
          </Button>

          <p className="text-sm text-gray-500 pt-2">
            {maxCount - currentCount > 0 
              ? `You can generate up to ${Math.min(3, maxCount - currentCount)} more topic${Math.min(3, maxCount - currentCount) === 1 ? '' : 's'} at once`
              : 'You have reached your topic limit'}
          </p>
        </div>
      </div>
    </div>
  );
}
