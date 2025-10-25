'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  const hasReachedLimit = currentCount >= maxCount;

  const handleGenerateTopics = async () => {
    if (!user) {
      toast.error('Please sign in to generate topics');
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating topics for user:', user.id);
      const result = await generateTopics(user.id);
      console.log('Generation result:', result);
      toast.success('Topics generated successfully!');
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
            Each generation creates 3-5 unique topic ideas.
          </p>

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
            You can generate {maxCount - currentCount} more {maxCount - currentCount === 1 ? 'topic' : 'topics'}
          </p>
        </div>
      </div>
    </div>
  );
}
