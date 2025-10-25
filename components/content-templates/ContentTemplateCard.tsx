'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Save, X, Copy, Download } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(template.title);
  const [editedContent, setEditedContent] = useState(template.content);
  const [editedSlides, setEditedSlides] = useState(template.carouselSlides || []);
  const [editedStatus, setEditedStatus] = useState(template.status);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const isCarousel = template.platform === 'Instagram' && template.carouselSlides && template.carouselSlides.length > 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(template.id, { title: editedTitle, content: editedContent });
      // Also save status if it changed
      if (onStatusUpdate && editedStatus !== template.status) {
        await onStatusUpdate(template.id, editedStatus);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(template.title);
    setEditedContent(template.content);
    setEditedSlides(template.carouselSlides || []);
    setEditedStatus(template.status);
    setIsEditing(false);
  };

  const handleSlideChange = (index: number, value: string) => {
    const newSlides = [...editedSlides];
    newSlides[index] = value;
    setEditedSlides(newSlides);
  };

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
    <Card className="bg-[#1A1A1A] border-none shadow-lg hover:shadow-2xl hover:shadow-[#1E90FF]/10 transition-all duration-300 group h-[550px] flex flex-col">
      <CardHeader className="space-y-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          {isEditing ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white text-lg font-semibold"
              placeholder="Template title"
            />
          ) : (
            <h3 className="text-xl font-semibold text-white leading-tight flex-1">
              {template.title}
            </h3>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${platformColors[template.platform] || platformColors.default} border font-medium`}>
            {template.platform}
          </Badge>
          {onStatusUpdate && isEditing ? (
            <Select 
              value={editedStatus} 
              onValueChange={setEditedStatus}
            >
              <SelectTrigger className="w-32 bg-[#121212] border-white/10 text-white border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10">
                <SelectItem value="draft" className="text-white hover:bg-white/10">Draft</SelectItem>
                <SelectItem value="approved" className="text-white hover:bg-white/10">Approved</SelectItem>
                <SelectItem value="published" className="text-white hover:bg-white/10">Published</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className={`${statusColors[template.status]} border font-medium capitalize`}>
              {template.status}
            </Badge>
          )}
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

      <CardContent className="flex-1 overflow-y-auto min-h-0">
        {isCarousel ? (
          isEditing ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Edit carousel slides:</p>
              {editedSlides.map((slide, index) => (
                <Textarea
                  key={index}
                  value={slide}
                  onChange={(e) => handleSlideChange(index, e.target.value)}
                  className="bg-[#121212] border-white/10 focus:border-[#E4405F] focus:ring-[#E4405F]/20 text-white min-h-[120px] resize-none"
                  placeholder={`Slide ${index + 1} content`}
                />
              ))}
            </div>
          ) : (
            <CarouselPreview slides={template.carouselSlides || []} isEditing={false} />
          )
        ) : (
          isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white min-h-[200px] resize-none"
              placeholder="Template content"
            />
          ) : template.platform === 'LinkedIn' ? (
            <div className="w-full mx-auto">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200 p-5">
                <div className="text-gray-900 leading-relaxed whitespace-pre-wrap text-sm">
                  {template.content}
                </div>
              </div>
            </div>
          ) : template.platform === 'Twitter' ? (
            <div className="w-full mx-auto">
              <div className="bg-black rounded-2xl overflow-hidden shadow-xl border border-gray-800 p-5">
                <div className="text-white leading-relaxed whitespace-pre-wrap text-sm">
                  {template.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 leading-relaxed whitespace-pre-wrap">
              {template.content}
            </div>
          )
        )}
      </CardContent>

      <CardFooter className="border-t border-white/5 pt-4 flex-shrink-0">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white rounded-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isSaving}
              variant="outline"
              className="flex-1 border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <Button
              onClick={() => setIsEditing(true)}
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
        )}
      </CardFooter>
    </Card>
  );
}
