"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Save, X, ChevronDown, ChevronUp, Share2, CheckCircle2, Download } from "lucide-react";
import html2canvas from "html2canvas";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
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

  const handleDownloadCarousel = async () => {
    if (!carouselRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      // Get all carousel slide elements
      const slideElements = carouselRef.current.querySelectorAll('[data-carousel-slide]');
      const totalSlides = slideElements.length;

      if (totalSlides === 0) {
        console.error('No slides found');
        setIsDownloading(false);
        return;
      }

      // Instagram recommended dimensions: 1080x1080 (1:1 square format)
      const targetWidth = 1080;
      const targetHeight = 1080;
      const scale = 2; // Higher quality for retina displays

      // Create a temporary container for capturing slides - completely hidden off-screen
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = `${targetWidth}px`;
      tempContainer.style.height = `${targetHeight}px`;
      tempContainer.style.zIndex = '-1';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.opacity = '0';
      tempContainer.style.pointerEvents = 'none';
      document.body.appendChild(tempContainer);

      // Helper function to copy computed styles to inline styles
      const copyStyles = (source: HTMLElement, target: HTMLElement) => {
        const computed = window.getComputedStyle(source);
        const stylesToCopy = [
          'backgroundColor', 'background', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
          'color', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
          'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
          'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
          'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
          'borderRadius', 'boxShadow', 'textShadow', 'opacity',
          'display', 'flexDirection', 'justifyContent', 'alignItems', 'flex',
          'lineHeight', 'textAlign', 'whiteSpace', 'overflow', 'position',
          'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'
        ];
        
        stylesToCopy.forEach(prop => {
          try {
            const value = computed.getPropertyValue(prop);
            if (value && value !== 'none' && value !== 'rgba(0, 0, 0, 0)') {
              target.style.setProperty(prop, value, 'important');
            }
          } catch (e) {
            // Ignore errors for unsupported properties
          }
        });
        
        // Also copy class names to preserve Tailwind classes
        target.className = source.className;
      };

      // Process each slide
      for (let i = 0; i < totalSlides; i++) {
        const slideElement = slideElements[i] as HTMLElement;
        
        // Temporarily make the original element visible and get its computed styles
        const originalDisplay = slideElement.style.display;
        const originalVisibility = slideElement.style.visibility;
        const originalOpacity = slideElement.style.opacity;
        const originalPosition = slideElement.style.position;
        const originalZIndex = slideElement.style.zIndex;
        
        // Make element visible for style computation
        slideElement.style.display = 'block';
        slideElement.style.visibility = 'visible';
        slideElement.style.opacity = '1';
        slideElement.style.position = 'absolute';
        slideElement.style.zIndex = '10000';
        slideElement.style.left = '0';
        slideElement.style.top = '0';
        
        // Get computed styles while visible
        const computedStyle = window.getComputedStyle(slideElement);
        const originalRect = slideElement.getBoundingClientRect();
        const originalWidth = originalRect.width || 400;
        const originalHeight = originalRect.height || 400;
        
        // Calculate scale factor to fill 1080x1080 (use the larger scale to fill the canvas)
        const scaleX = targetWidth / originalWidth;
        const scaleY = targetHeight / originalHeight;
        const scaleFactor = Math.max(scaleX, scaleY); // Use larger scale to fill canvas
        
        // Clone the slide element for capture (deep clone)
        const clonedSlide = slideElement.cloneNode(true) as HTMLElement;
        
        // Copy all computed styles to preserve all styling
        copyStyles(slideElement, clonedSlide);
        
        // Set Instagram dimensions - exactly 1080x1080 to fill canvas
        clonedSlide.style.width = `${targetWidth}px`;
        clonedSlide.style.height = `${targetHeight}px`;
        clonedSlide.style.position = 'relative';
        // Use flexbox for vertical centering like the preview
        clonedSlide.style.display = 'flex';
        clonedSlide.style.flexDirection = 'column';
        clonedSlide.style.justifyContent = 'center';
        clonedSlide.style.alignItems = 'stretch';
        clonedSlide.style.visibility = 'visible';
        clonedSlide.style.opacity = '1';
        clonedSlide.style.margin = '0';
        clonedSlide.style.boxSizing = 'border-box';
        clonedSlide.style.transform = 'scale(1)';
        clonedSlide.style.transformOrigin = 'center center';
        clonedSlide.style.overflow = 'hidden';
        
        // Scale padding proportionally to maintain layout
        const paddingTop = parseFloat(computedStyle.paddingTop) || 32;
        const paddingRight = parseFloat(computedStyle.paddingRight) || 32;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 32;
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 32;
        
        clonedSlide.style.paddingTop = `${Math.round(paddingTop * scaleFactor)}px`;
        clonedSlide.style.paddingRight = `${Math.round(paddingRight * scaleFactor)}px`;
        clonedSlide.style.paddingBottom = `${Math.round(paddingBottom * scaleFactor)}px`;
        clonedSlide.style.paddingLeft = `${Math.round(paddingLeft * scaleFactor)}px`;
        
        // Scale font sizes recursively for all text elements
        const scaleElementStyles = (element: HTMLElement, originalElement: HTMLElement) => {
          const elementComputed = window.getComputedStyle(originalElement);
          const elementFontSize = parseFloat(elementComputed.fontSize);
          if (elementFontSize && elementFontSize > 0) {
            element.style.fontSize = `${Math.round(elementFontSize * scaleFactor)}px`;
          }
          
          // Scale other size-related properties
          const lineHeight = elementComputed.lineHeight;
          if (lineHeight && lineHeight !== 'normal') {
            const lineHeightValue = parseFloat(lineHeight);
            if (!isNaN(lineHeightValue)) {
              element.style.lineHeight = `${Math.round(lineHeightValue * scaleFactor)}px`;
            }
          }
          
          // Recursively scale children
          const children = Array.from(element.children) as HTMLElement[];
          const originalChildren = Array.from(originalElement.children) as HTMLElement[];
          children.forEach((child, idx) => {
            if (originalChildren[idx]) {
              scaleElementStyles(child, originalChildren[idx]);
            }
          });
        };
        
        // Scale all child elements
        const clonedChildren = Array.from(clonedSlide.children) as HTMLElement[];
        const originalChildren = Array.from(slideElement.children) as HTMLElement[];
        clonedChildren.forEach((clonedChild, idx) => {
          if (originalChildren[idx]) {
            scaleElementStyles(clonedChild, originalChildren[idx]);
          }
        });
        
        // Restore original element styles
        slideElement.style.display = originalDisplay;
        slideElement.style.visibility = originalVisibility;
        slideElement.style.opacity = originalOpacity;
        slideElement.style.position = originalPosition;
        slideElement.style.zIndex = originalZIndex;
        slideElement.style.left = '';
        slideElement.style.top = '';
        
        // Append to temporary container
        tempContainer.innerHTML = '';
        tempContainer.appendChild(clonedSlide);
        
        // Wait for rendering, font loading, and image loading
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capture the slide with html2canvas
        const canvas = await html2canvas(clonedSlide, {
          width: targetWidth,
          height: targetHeight,
          scale: scale,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          onclone: (clonedDoc) => {
            // Ensure the cloned element has proper styling
            const clonedElement = clonedDoc.querySelector('[data-carousel-slide]') as HTMLElement;
            if (clonedElement) {
              clonedElement.style.width = `${targetWidth}px`;
              clonedElement.style.height = `${targetHeight}px`;
              clonedElement.style.display = 'block';
              clonedElement.style.visibility = 'visible';
              clonedElement.style.opacity = '1';
              clonedElement.style.position = 'relative';
            }
          }
        });

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${template.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slide_${i === 0 ? 'title' : i}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }, 'image/png', 1.0);

        // Small delay between downloads to avoid browser blocking
        if (i < totalSlides - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Clean up temporary container
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Error downloading carousel:', error);
    } finally {
      setIsDownloading(false);
    }
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
            <DialogTitle className="text-2xl font-semibold">
              {template.title}
            </DialogTitle>
          )}
        </DialogHeader>

        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <Badge className="border font-medium">{template.platform}</Badge>
          {isEditing ? (
            <Select value={editedStatus} onValueChange={setEditedStatus}>
              <SelectTrigger className="w-40 bg-[#121212] border-white/10 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10 w-min">
                <SelectItem
                  value="draft"
                  className="text-white hover:bg-white/10"
                >
                  Draft
                </SelectItem>
                <SelectItem
                  value="approved"
                  className="text-white hover:bg-white/10"
                >
                  Approved
                </SelectItem>
                <SelectItem
                  value="published"
                  className="text-white hover:bg-white/10"
                >
                  Published
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className="border font-medium capitalize">
              {template.status}
            </Badge>
          )}
        </div>

        {/* Fix 2: Hidden scrollbar with scroll buttons */}
        <div className="relative flex-1 min-h-0">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto pr-1 pb-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {isInstagram ? (
              isEditing ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Edit carousel slides:</p>
                  {editedSlides.map((slide, index) => (
                    <div key={index} className="space-y-1">
                      <label className="text-xs text-gray-500">
                        Slide {index + 1}
                      </label>
                      <Textarea
                        value={slide}
                        onChange={(e) =>
                          handleSlideChange(index, e.target.value)
                        }
                        className="bg-[#121212] border-white/10 focus:border-[#E4405F] focus:ring-[#E4405F]/20 text-white min-h-[120px] resize-none"
                        placeholder={`Slide ${index + 1} content`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative" ref={carouselRef}>
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {/* First slide: Title and Hashtags only */}
                      <CarouselItem
                        key="title-slide"
                        className="pl-2 md:pl-4 md:basis-4/5 lg:basis-3/4"
                      >
                        <div className="p-1">
                          <div 
                            data-carousel-slide="0"
                            className="bg-gradient-to-br from-[#D0E8FF] via-[#FFF7F9] to-[#FFD6E8] text-[#111] rounded-3xl shadow-2xl border border-gray-200/50 p-8 min-h-[400px] flex flex-col justify-center"
                          >
                            <h3 className="text-4xl font-semibold leading-snug mb-6 text-[#111] font-greatVibes drop-shadow-[1px_2px_3px_rgba(0,0,0,0.3)]">
                              {template.title}
                            </h3>
                            {template.tags?.length ? (
                              <div className="flex flex-wrap gap-2.5">
                                {template.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="text-[#1E90FF] text-base font-medium hover:text-blue-600 transition-colors drop-shadow-[1px_2px_3px_rgba(0,0,0,0.3)]"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            <div className="pt-6">
                              <span className="text-xs text-gray-500 font-medium tracking-wide">
                                Swipe to read →
                              </span>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>

                      {/* Content slides */}
                      {(template.carouselSlides &&
                      template.carouselSlides.length > 0
                        ? template.carouselSlides
                        : (template.content || "")
                            .split(/\n\n+/)
                            .filter((s) => s.trim())
                      ).map((slide, idx) => (
                        <CarouselItem
                          key={idx}
                          className="pl-2 md:pl-4 md:basis-4/5 lg:basis-3/4"
                        >
                          <div className="p-1">
                            <div 
                              data-carousel-slide={idx + 1}
                              className="bg-white text-[#111] rounded-3xl shadow-2xl border border-gray-200/50 p-8 min-h-[400px] flex flex-col"
                            >
                              {/* Page number indicator */}
                              <div className="flex items-center justify-center mb-4 flex-shrink-0">
                                <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase drop-shadow-[1px_2px_3px_rgba(0,0,0,0.3)]">
                                  {idx + 1}/
                                  {
                                    (template.carouselSlides &&
                                    template.carouselSlides.length > 0
                                      ? template.carouselSlides
                                      : (template.content || "")
                                          .split(/\n\n+/)
                                          .filter((s) => s.trim())
                                    ).length
                                  }
                                </span>
                              </div>

                              <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-[#222] flex-1 flex items-center justify-center px-4 font-medium drop-shadow-[1px_2px_3px_rgba(0,0,0,0.3)]">
                                {cleanSlideContent(slide)}
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0 bg-white/95 hover:bg-white text-[#111] border border-gray-300/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200" />
                    <CarouselNext className="right-0 bg-white/95 hover:bg-white text-[#111] border border-gray-300/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200" />
                  </Carousel>
                </div>
              )
            ) : isEditing ? (
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
                        <span key={t} className="text-[#1E90FF] text-sm">
                          {t}
                        </span>
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
                        <span key={t} className="text-[#1E90FF] text-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                {template.content}
              </div>
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
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white rounded-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : isInstagram && !isEditing ? (
            <div className="w-full flex items-center gap-2">
              <Button
                onClick={handleDownloadCarousel}
                disabled={isDownloading}
                variant="outline"
                className="flex-1 border-[#E4405F]/40 hover:border-[#E4405F]/60 hover:bg-[#E4405F]/10 text-[#E4405F] rounded-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download Carousel'}
              </Button>
              <Button
                onClick={() => {
                  onStatusUpdate?.(template.id, "published");
                  onOpenChange(false);
                }}
                variant="outline"
                className="flex-1 border-emerald-500/40 hover:border-emerald-500/60 hover:bg-emerald-500/10 text-emerald-400 rounded-full"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Done
              </Button>
            </div>
          ) : isX ? (
            <div className="w-full flex items-center gap-2">
              <Button
                onClick={() => {
                  const tweetText = template.content;
                  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    tweetText
                  )}`;
                  window.open(url, "_blank");
                }}
                variant="outline"
                className="flex-1 border-[#1DA1F2]/40 hover:border-[#1DA1F2]/60 hover:bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share on X
              </Button>
              <Button
                onClick={() => {
                  onStatusUpdate?.(template.id, "published");
                  onOpenChange(false);
                }}
                variant="outline"
                className="flex-1 border-emerald-500/40 hover:border-emerald-500/60 hover:bg-emerald-500/10 text-emerald-400 rounded-full"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Done
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}