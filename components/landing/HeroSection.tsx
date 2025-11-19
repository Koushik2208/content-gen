'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { VideoModal } from './VideoModal';

export function HeroSection() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  // Replace this with your actual HeyGen video URL
  // Option 1: Set NEXT_PUBLIC_DEMO_VIDEO_URL in your .env.local file
  // Option 2: Replace the empty string below with your video URL directly
  const demoVideoUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || '';

  const handleWatchDemo = () => {
    if (demoVideoUrl) {
      setIsVideoModalOpen(true);
    } else {
      // Fallback: You can replace this with a toast notification
      alert('Demo video URL not configured. Please set NEXT_PUBLIC_DEMO_VIDEO_URL in your .env.local file or update the demoVideoUrl variable in HeroSection.tsx');
    }
  };
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F]">
      {/* Background blobs – same colours as the original hero */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#1E90FF]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF2D95]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* ─────── LEFT COLUMN ─────── */}
          <div className="space-y-8">
            {/* Social-proof pills */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-[#1E90FF]/10 px-4 py-2 rounded-full border border-[#1E90FF]/20">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Generate in Seconds</span>
              </div>
              <div className="flex items-center gap-2 bg-[#1E90FF]/10 px-4 py-2 rounded-full border border-[#1E90FF]/20">
                <Sparkles className="w-4 h-4 text-[#1E90FF]" />
                <span className="text-sm text-gray-300">3 Platforms Supported</span>
              </div>
              <div className="flex items-center gap-2 bg-[#1E90FF]/10 px-4 py-2 rounded-full border border-[#1E90FF]/20">
                <TrendingUp className="w-4 h-4 text-[#FF2D95]" />
                <span className="text-sm text-gray-300">Ready to Publish</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight heading-bebas">
              <span className="text-white">Create</span>
              <br />
              <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
                Publish-Ready Content
              </span>
              <br />
              <span className="text-white">In Minutes</span>
            </h1>

            {/* Problem Statement */}
            <div className="bg-[#1A1A1A] border-l-4 border-[#1E90FF] p-4 rounded-lg mb-6">
              <p className="text-gray-300 text-sm">
                <span className="text-white font-semibold">The Problem:</span> Creating consistent, 
                engaging social media content takes hours. You struggle with writer's block, finding 
                the right topics, and formatting content for different platforms.
              </p>
            </div>

            {/* Sub-heading */}
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
              Stop spending hours brainstorming content ideas. Generate personalized social media 
              posts, captions, and Instagram carousel images in minutes. Ready to copy, download, 
              and publish.
            </p>

            {/* Key benefits */}
            <div className="grid sm:grid-cols-3 gap-4 py-6">
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-[#1E90FF] mb-1">10+</div>
                <div className="text-sm text-gray-400">Hours Saved Weekly</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-[#FF2D95] mb-1">3</div>
                <div className="text-sm text-gray-400">Platforms Supported</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-yellow-400 mb-1">60s</div>
                <div className="text-sm text-gray-400">Content Generated</div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow transition-all text-lg px-8 py-6 rounded-full font-semibold"
                >
                  Start Creating Content
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                onClick={handleWatchDemo}
                className="w-full sm:w-auto border-white/20 hover:border-[#FF2D95]/50 hover:bg-[#FF2D95]/10 text-lg px-8 py-6 rounded-full group flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 group-hover:text-[#FF2D95] transition-colors" />
                Watch Demo (2 min)
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 text-sm text-gray-400">
              <span>No Credit Card Required</span>
              <span>7-Day Free Trial</span>
              <span>Cancel Anytime</span>
            </div>
          </div>

          {/* ─────── RIGHT COLUMN – MOCK DASHBOARD ─────── */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-2xl p-8 shadow-2xl border border-[#1E90FF]/20">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] rounded-lg"></div>
                  <span className="font-semibold text-white">Content Dashboard</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Content cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#1E90FF]/20">
                  <div className="w-full h-24 bg-gradient-to-br from-[#1E90FF]/20 to-transparent rounded mb-3"></div>
                  <div className="h-3 bg-gray-600 rounded mb-2"></div>
                  <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                </div>
                <div className="bg-[#0F0F0F] rounded-lg p-4 border border-[#1E90FF]/20">
                  <div className="w-full h-24 bg-gradient-to-br from-[#FF2D95]/20 to-transparent rounded mb-3"></div>
                  <div className="h-3 bg-gray-600 rounded mb-2"></div>
                  <div className="h-2 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center pt-4 border-t border-[#1E90FF]/20">
                <span className="text-sm text-gray-400">Generated Today</span>
                <span className="text-[#1E90FF] font-semibold">24 Posts</span>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-[#1E90FF] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              Smart Content
            </div>
            <div className="absolute -bottom-4 -left-4 bg-[#FF2D95] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              Real-time
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {demoVideoUrl && (
        <VideoModal
          open={isVideoModalOpen}
          onOpenChange={setIsVideoModalOpen}
          videoUrl={demoVideoUrl}
          title="See ContentGenPro in Action"
          description="Watch how we transform content creation from hours to minutes"
        />
      )}
    </section>
  );
}