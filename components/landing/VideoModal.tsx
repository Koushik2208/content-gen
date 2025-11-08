'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title?: string;
  description?: string;
}

// Helper function to extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Check if URL is a YouTube URL
function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

export function VideoModal({
  open,
  onOpenChange,
  videoUrl,
  title = 'Watch Demo',
  description = 'See how ContentGenPro transforms your content creation workflow',
}: VideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isYouTube = isYouTubeUrl(videoUrl);
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;
  const embedUrl = youtubeVideoId 
    ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setHasError(false);
      // YouTube iframes load differently, so we can hide loading faster
      if (isYouTube) {
        // Small delay to show loading state briefly
        setTimeout(() => setIsLoading(false), 500);
      }
    } else {
      // Pause video when modal closes
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      // Reset iframe by removing src (stops playback)
      if (iframeRef.current && embedUrl) {
        iframeRef.current.src = '';
      }
    }
  }, [open, isYouTube, embedUrl]);

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full bg-[#1A1A1A] border-[#1E90FF]/20 p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-800">
            <DialogTitle className="text-2xl font-bold text-white heading-bebas">
              {title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* Video Container */}
          <div className="relative bg-black aspect-video w-full">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F]">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-[#1E90FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-400 text-sm">Loading video...</p>
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F]">
                <div className="text-center space-y-4 px-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                    <X className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-gray-400">Failed to load video</p>
                  <p className="text-gray-500 text-sm">Please check the video URL and try again.</p>
                </div>
              </div>
            )}

            {!hasError && isYouTube && embedUrl && (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleIframeLoad}
                title={title}
              />
            )}

            {!hasError && !isYouTube && (
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                controls
                autoPlay
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                onLoadStart={() => setIsLoading(true)}
              >
                <source src={videoUrl} type="video/webm" />
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Footer with gradient accent */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#1E90FF]/10 via-[#FF2D95]/10 to-[#1E90FF]/10 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">
              This video was generated using AI technology
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

