"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Save, X, ChevronDown, ChevronUp } from "lucide-react";

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

interface TemplateViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ContentTemplate;
  mode: "view" | "edit";
  onSave: (id: string, updates: { title: string; content: string }) => Promise<void>;
  onStatusUpdate?: (id: string, status: string) => Promise<void>;
}

export function TemplateViewDialog({ open, onOpenChange, template, mode, onSave, onStatusUpdate }: TemplateViewDialogProps) {
  const [isEditing, setIsEditing] = useState(mode === "edit");
  const [editedTitle, setEditedTitle] = useState(template.title);
  const [editedContent, setEditedContent] = useState(template.content);
  const [editedSlides, setEditedSlides] = useState<string[]>(template.carouselSlides || []);
  const [editedStatus, setEditedStatus] = useState(template.status);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const platformType = (template.platform || '').toLowerCase();
  const isInstagram = platformType === 'instagram';
  const isX = platformType === 'x' || platformType === 'twitter';
  const isLinkedIn = platformType === 'linkedin';

  useEffect(() => {
    setIsEditing(mode === "edit");
  }, [mode]);

  useEffect(() => {
    if (open) {
      setEditedTitle(template.title);
      setEditedContent(template.content);
      // Fix 1: Properly initialize slides from either carouselSlides or split content
      const slides = template.carouselSlides && template.carouselSlides.length > 0
        ? template.carouselSlides
        : (template.content || '').split(/\n\n+/).filter(s => s.trim());
      setEditedSlides(slides);
      setEditedStatus(template.status);
    }
  }, [open, template]);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        setShowScrollTop(scrollTop > 20);
        setShowScrollBottom(scrollTop < scrollHeight - clientHeight - 20);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [open, isEditing]);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    scrollContainerRef.current?.scrollTo({ 
      top: scrollContainerRef.current.scrollHeight, 
      behavior: 'smooth' 
    });
  };

  const handleSlideChange = (index: number, value: string) => {
    const next = [...editedSlides];
    next[index] = value;
    setEditedSlides(next);
  };

  // Helper function to clean slide content
  const cleanSlideContent = (content: string): string => {
    return content
      .replace(/^Slide\s+\d+:\s*/i, "")
      .replace(/^CTA Slide:\s*/i, "")
      .trim();
  };

  const handleSave = async () => {
    await onSave(template.id, { title: editedTitle, content: editedContent });
    if (onStatusUpdate && editedStatus !== template.status) {
      await onStatusUpdate(template.id, editedStatus);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden bg-[#1A1A1A] border-white/10 text-white sm:rounded-2xl">
        <DialogHeader className="flex-shrink-0">
          {isEditing ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white text-lg font-semibold"
              placeholder="Template title"
            />
          ) : (
            <DialogTitle className="text-2xl font-semibold">{template.title}</DialogTitle>
          )}
        </DialogHeader>

        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <Badge className="border font-medium">{template.platform}</Badge>
          {isEditing ? (
            <Select value={editedStatus} onValueChange={setEditedStatus}>
              <SelectTrigger className="w-40 bg-[#121212] border-white/10 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10">
                <SelectItem value="draft" className="text-white hover:bg-white/10">Draft</SelectItem>
                <SelectItem value="approved" className="text-white hover:bg-white/10">Approved</SelectItem>
                <SelectItem value="published" className="text-white hover:bg-white/10">Published</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className="border font-medium capitalize">{template.status}</Badge>
          )}
        </div>

        {/* Fix 2: Hidden scrollbar with scroll buttons */}
        <div className="relative flex-1 min-h-0">
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto pr-1 pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isInstagram ? (
              isEditing ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Edit carousel slides:</p>
                  {editedSlides.map((slide, index) => (
                    <div key={index} className="space-y-1">
                      <label className="text-xs text-gray-500">Slide {index + 1}</label>
                      <Textarea
                        value={slide}
                        onChange={(e) => handleSlideChange(index, e.target.value)}
                        className="bg-[#121212] border-white/10 focus:border-[#E4405F] focus:ring-[#E4405F]/20 text-white min-h-[120px] resize-none"
                        placeholder={`Slide ${index + 1} content`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {/* First slide: Title and Hashtags only */}
                      <CarouselItem key="title-slide" className="pl-2 md:pl-4 md:basis-4/5 lg:basis-3/4">
                        <div className="p-1">
                          <div className="bg-white text-[#111] rounded-2xl shadow-2xl border border-gray-200 p-6 min-h-[400px] flex flex-col justify-center">
                            <h3 className="text-3xl font-serif font-semibold leading-snug mb-6 text-[#111]">
                              {template.title}
                            </h3>
                            {template.tags?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {template.tags.map((t) => (
                                  <span key={t} className="text-[#1E90FF] text-base">#{t}</span>
                                ))}
                              </div>
                            ) : null}
                            <div className="pt-4">
                              <span className="text-xs text-gray-400">Swipe to read →</span>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>

                      {/* Content slides */}
                      {(template.carouselSlides && template.carouselSlides.length > 0
                        ? template.carouselSlides
                        : (template.content || '').split(/\n\n+/).filter(s => s.trim())
                      ).map((slide, idx) => (
                        <CarouselItem key={idx} className="pl-2 md:pl-4 md:basis-4/5 lg:basis-3/4">
                          <div className="p-1">
                            <div className="bg-white text-[#111] rounded-2xl shadow-2xl border border-gray-200 p-6 min-h-[400px] flex flex-col">
                              {/* Page number indicator */}
                              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                                <span className="text-xs text-gray-400">
                                  {idx + 1}/{(template.carouselSlides && template.carouselSlides.length > 0
                                    ? template.carouselSlides
                                    : (template.content || '').split(/\n\n+/).filter(s => s.trim())
                                  ).length}
                                </span>
                                <span className="text-xs text-gray-400">Instagram</span>
                              </div>
                              
                              <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-[#222] flex-1 flex items-center justify-center px-4">
                                {cleanSlideContent(slide)}
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0 bg-white/90 hover:bg-white text-[#111] border border-gray-200" />
                    <CarouselNext className="right-0 bg-white/90 hover:bg-white text-[#111] border border-gray-200" />
                  </Carousel>
                </div>
              )
            ) : (
              isEditing ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white min-h-[240px] resize-none"
                  placeholder="Template content"
                />
              ) : isLinkedIn ? (
                <div className="w-full mx-auto">
                  <div className="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200 p-6">
                    <div className="text-gray-900 leading-relaxed whitespace-pre-wrap text-[15px] mb-3">
                      {template.content}
                    </div>
                    {template.tags?.length ? (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                        {template.tags.map((t) => (
                          <span key={t} className="text-[#1E90FF] text-sm">#{t}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : isX ? (
                <div className="w-full mx-auto">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 p-6">
                    <div className="text-gray-900 leading-relaxed whitespace-pre-wrap text-[15px] mb-3">
                      {template.content}
                    </div>
                    {template.tags?.length ? (
                      <div className="flex flex-wrap gap-2 pt-2 border-gray-200">
                        {template.tags.map((t) => (
                          <span key={t} className="text-[#1E90FF] text-sm">#{t}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {template.content}
                </div>
              )
            )}
          </div>

          {/* Fix 2: Subtle scroll buttons */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="absolute top-0 right-2 z-10 p-1.5 rounded-full bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] border border-white/10 transition-all opacity-60 hover:opacity-100"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-4 h-4 text-white" />
            </button>
          )}
          
          {showScrollBottom && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-0 right-2 z-10 p-1.5 rounded-full bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] border border-white/10 transition-all opacity-60 hover:opacity-100"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-white/5 flex-shrink-0 mt-auto">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white rounded-full">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1 border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}