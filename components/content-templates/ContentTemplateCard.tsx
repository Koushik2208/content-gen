'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Copy, Download, Eye } from 'lucide-react';
import { TemplateViewDialog } from './TemplateViewDialog';
// Define ContentTemplate interface locally
interface ContentTemplate {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
  carouselSlides?: string[];
}
import { CarouselPreview } from './CarouselPreview';
import { useToast } from '@/hooks/use-toast';

interface ContentTemplateCardProps {
  template: ContentTemplate;
  onSave: (id: string, updates: { title: string; content: string }) => Promise<void>;
  onStatusUpdate?: (id: string, status: string) => Promise<void>;
}

export function ContentTemplateCard({ template, onSave, onStatusUpdate }: ContentTemplateCardProps) {
  const { toast } = useToast();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isCarousel = template.platform === 'Instagram' && template.carouselSlides && template.carouselSlides.length > 0;

  // Editing handled inside modal

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template.content);
      toast({
        title: 'Copied!',
        description: 'Content copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    published: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const platformColors: Record<string, string> = {
    LinkedIn: 'bg-[#0A66C2]/20 text-[#0A66C2] border-[#0A66C2]/30',
    Twitter: 'bg-[#1DA1F2]/20 text-[#1DA1F2] border-[#1DA1F2]/30',
    Instagram: 'bg-[#E4405F]/20 text-[#E4405F] border-[#E4405F]/30',
    YouTube: 'bg-[#FF0000]/20 text-[#FF0000] border-[#FF0000]/30',
    default: 'bg-[#1E90FF]/20 text-[#1E90FF] border-[#1E90FF]/30',
  };

  return (
    <Card className="relative bg-[#1A1A1A] border border-white/10 shadow-lg hover:shadow-2xl hover:shadow-[#1E90FF]/10 transition-all duration-300 group h-[400px] flex flex-col rounded-2xl before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-24 before:h-2 before:bg-white/10 before:rounded-b-md">
      <CardHeader className="space-y-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-white leading-tight flex-1">
            {template.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${platformColors[template.platform] || platformColors.default} border font-medium`}>
            {template.platform}
          </Badge>
          <Badge className={`${statusColors[template.status]} border font-medium capitalize`}>
            {template.status}
          </Badge>
        </div>

        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs rounded-full bg-white/5 text-gray-400 border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden min-h-0">
        {isCarousel ? (
          <div className="pointer-events-none select-none">
            <CarouselPreview slides={(template.carouselSlides || []).slice(0, 3)} isEditing={false} />
          </div>
        ) : (
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-6">
            {template.content}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-white/5 pt-4 flex-shrink-0">
        <div className="flex items-center gap-2 w-full">
            <Button
              onClick={() => setIsViewOpen(true)}
              variant="outline"
              className="flex-1 border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button
            onClick={() => setIsEditOpen(true)}
              variant="outline"
              className="flex-1 border-white/20 hover:border-[#1E90FF]/50 hover:bg-[#1E90FF]/10 rounded-full group-hover:border-[#1E90FF]/30 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            {isCarousel ? (
              <Button
                onClick={() => {
                  toast({
                    title: 'Coming Soon',
                    description: 'PNG download feature will be available soon',
                  });
                }}
                variant="outline"
                className="flex-1 border-white/20 hover:border-[#E4405F]/50 hover:bg-[#E4405F]/10 rounded-full transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            ) : (
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 border-white/20 hover:border-[#1E90FF]/50 hover:bg-[#1E90FF]/10 rounded-full transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
          )}
        </div>
      </CardFooter>

      {/* View/Edit Modals */}
      <TemplateViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        template={template}
        mode="view"
        onSave={onSave}
        onStatusUpdate={onStatusUpdate}
      />
      <TemplateViewDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        template={template}
        mode="edit"
        onSave={onSave}
        onStatusUpdate={onStatusUpdate}
      />
    </Card>
  );
}
