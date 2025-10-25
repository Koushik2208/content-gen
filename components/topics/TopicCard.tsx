'use client';

import { Clock, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { approveTopicAndGenerateTemplates } from '@/server/ai/actions';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

type TopicStatus = 'draft' | 'templates_generated' | 'approved' | 'rejected' | 'done';

interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  createdAt: string;
  description?: string;
}

interface TopicCardProps {
  topic: Topic;
  onTopicUpdate?: () => void;
}

const statusConfig = {
  draft: {
    icon: FileText,
    label: 'Draft',
    color: 'bg-[#1E90FF]/20 text-[#1E90FF] border-[#1E90FF]/30',
    iconColor: 'text-[#1E90FF]',
    clickable: true,
  },
  templates_generated: {
    icon: ArrowRight,
    label: 'Templates Ready',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    iconColor: 'text-orange-400',
    clickable: true,
  },
  approved: {
    icon: CheckCircle2,
    label: 'Approved',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    clickable: true,
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    iconColor: 'text-red-400',
    clickable: false,
  },
  done: {
    icon: CheckCircle2,
    label: 'Done',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    iconColor: 'text-gray-400',
    clickable: false,
  },
};

export function TopicCard({ topic, onTopicUpdate }: TopicCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const config = statusConfig[topic.status];
  const IconComponent = config.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleTopicClick = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    if (topic.status === 'draft') {
      // Generate templates for draft topics
      setIsGenerating(true);
      try {
        await approveTopicAndGenerateTemplates(topic.id, user.id);
        toast.success('Templates generated successfully! Click to view.');
        onTopicUpdate?.(); // Refresh topics list
      } catch (error) {
        console.error('Error generating templates:', error);
        toast.error('Failed to generate templates. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    } else if (topic.status === 'templates_generated' || topic.status === 'approved') {
      // Navigate to templates for topics with templates
      router.push(`/content-templates?topic=${topic.id}`);
    }
  };

  const CardContent = (
    <div
      className={`
        relative bg-[#1A1A1A] rounded-xl p-6
        shadow-lg hover:shadow-2xl hover:shadow-[#1E90FF]/10
        transition-all duration-300 h-full
        ${(config.clickable && !isGenerating) ? 'cursor-pointer hover:-translate-y-1' : ''}
        ${isGenerating ? 'opacity-75' : ''}
      `}
      onClick={config.clickable && !isGenerating ? handleTopicClick : undefined}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white leading-tight mb-2">
              {topic.name}
            </h3>
            {topic.description && (
              <p className="text-sm text-gray-400 leading-relaxed">
                {topic.description}
              </p>
            )}
          </div>
          {isGenerating ? (
            <div className="w-5 h-5 flex-shrink-0 animate-spin border-2 border-[#1E90FF] border-t-transparent rounded-full" />
          ) : (
            <IconComponent className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <Badge className={`${config.color} border font-medium`}>
            {isGenerating ? 'Generating...' : config.label}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatDate(topic.createdAt)}
          </div>
        </div>
      </div>

      {config.clickable && !isGenerating && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#1E90FF]/5 to-[#FF2D95]/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </div>
  );

  return CardContent;
}
