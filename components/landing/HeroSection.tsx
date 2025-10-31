'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E90FF]/10 via-transparent to-[#FF2D95]/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1E90FF]/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E90FF]/10 border border-[#1E90FF]/20 mb-4">
            <Sparkles className="w-4 h-4 text-[#1E90FF]" />
            <span className="text-sm">AI-Powered Content Creation</span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight heading-bebas">
            Build Your{' '}
            <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
              Personal Brand
            </span>{' '}
            Effortlessly
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into consistent, high-quality content with AI. Save 10+ hours weekly and grow your audience faster than ever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/onboarding">
              <Button size="lg" className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow transition-all text-lg px-10 py-7 rounded-full font-semibold">
                Start Creating Free
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 hover:border-[#FF2D95]/50 hover:bg-[#FF2D95]/10 text-lg px-10 py-7 rounded-full group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:text-[#FF2D95] transition-colors" />
              Watch Demo
            </Button>
          </div>

          <div className="pt-12 pb-8">
            <div className="relative max-w-4xl mx-auto rounded-xl overflow-hidden glow-blue shadow-2xl">
              <div className="aspect-video relative">
                <Image
                  src="/assets/images/dashboard-preview.png"
                  alt="BRANDAI Dashboard Preview"
                  fill
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
