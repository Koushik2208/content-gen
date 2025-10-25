'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarouselPreviewProps {
  slides: string[];
  isEditing?: boolean;
}

export function CarouselPreview({ slides, isEditing }: CarouselPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const parseSlideContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    return {
      title: lines[0] || '',
      body: lines.slice(1).join('\n') || ''
    };
  };

  const { title, body } = parseSlideContent(slides[currentSlide]);
  const isFirstSlide = currentSlide === 0;

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div className="relative bg-gray-50 rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200">
        <div className="relative aspect-square">
          <div className="absolute top-0 left-0 w-full h-32">
            {currentSlide % 2 === 0 ? (
              <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
                <path
                  d="M0,40 Q100,10 200,40 T400,40 L400,0 L0,0 Z"
                  fill="url(#gradient1)"
                  opacity="0.6"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            ) : (
              <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
                <path
                  d="M0,40 Q100,10 200,40 T400,40 L400,0 L0,0 Z"
                  fill="url(#gradient2)"
                  opacity="0.6"
                />
                <defs>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>

          <div className="absolute bottom-0 right-0 w-full h-40">
            {currentSlide % 2 === 0 ? (
              <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
                <path
                  d="M400,120 Q300,90 200,120 T0,120 L0,160 L400,160 Z"
                  fill="url(#gradient3)"
                  opacity="0.5"
                />
                <defs>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
            ) : (
              <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
                <path
                  d="M400,120 Q300,90 200,120 T0,120 L0,160 L400,160 Z"
                  fill="url(#gradient4)"
                  opacity="0.5"
                />
                <defs>
                  <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>

          <div className="relative z-10 h-full flex flex-col p-8">
            <div className="flex justify-between items-start mb-8">
              {!isFirstSlide && (
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-800 bg-white">
                  <span className="text-sm font-bold text-gray-800">{String(currentSlide).padStart(2, '0')}</span>
                </div>
              )}
              <div className="ml-auto">
                <span className="text-sm font-medium text-gray-800">2023</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6 px-4">
              {isFirstSlide && (
                <div className="mb-4">
                  <p className="text-xs font-semibold tracking-wider text-gray-700 uppercase">
                    {body.split('\n')[0] || 'THE POWER OF BRANDING'}
                  </p>
                </div>
              )}

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {title}
              </h2>

              {!isFirstSlide && body && (
                <p className="text-base text-gray-700 leading-relaxed max-w-md">
                  {body}
                </p>
              )}
            </div>

          </div>

          {!isEditing && slides.length > 1 && (
            <>
              <Button
                onClick={goToPrevious}
                size="icon"
                variant="ghost"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg border-2 border-gray-800 z-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={goToNext}
                size="icon"
                variant="ghost"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg border-2 border-gray-800 z-20"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => !isEditing && goToSlide(index)}
                disabled={isEditing}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-gray-800 shadow-lg'
                    : 'w-1 bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-400 font-medium">
          Swipe to preview all {slides.length} slides
        </p>
      </div>
    </div>
  );
}
