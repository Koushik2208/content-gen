'use client';

import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

const benefits = [
  {
    icon: Clock,
    title: "Save 10+ Hours Weekly",
    description: "Stop spending endless hours brainstorming content. Generate high-quality posts in seconds, freeing up your time for what matters most.",
    color: "text-[#1E90FF]"
  },
  {
    icon: TrendingUp,
    title: "3x Engagement Growth",
    description: "See measurable results with content proven to increase likes, comments, and shares. Our users report 3x higher engagement rates on average.",
    color: "text-[#FF2D95]"
  },
  {
    icon: Zap,
    title: "Instant Content Creation",
    description: "Generate months of content in minutes. From captions to carousel posts, get everything you need to maintain a consistent posting schedule.",
    color: "text-[#1E90FF]"
  }
];

const STAGGER_DELAY = 100; // ms

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 heading-bebas text-white">
            Why Professionals Choose
            <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
              {' '}ContentGenPro
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform your personal brand with personalized content that drives results. 
            Join thousands of professionals who've accelerated their growth with our platform.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group bg-[#2A2A2A] rounded-2xl p-8 border border-gray-700 hover:bg-gradient-to-br hover:from-[#2A2A2A] hover:to-[#0F0F0F] transition-all duration-300 hover:shadow-xl hover:shadow-[#1E90FF]/10"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * STAGGER_DELAY}ms forwards`,
                  opacity: 0
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-[#0F0F0F] group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#1E90FF] transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link href="/onboarding">
            <Button className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white px-8 py-4 rounded-full font-semibold text-lg gradient-glow transition-all duration-300">
              Start Your Free Trial
            </Button>
          </Link>
          <p className="text-gray-400 mt-4">Join 10,000+ professionals already growing their brands</p>
        </div>
      </div>
    </section>
  );
}