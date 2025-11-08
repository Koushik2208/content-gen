'use client';

import React, { useState } from 'react';
import { User, Sparkles, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const steps = [
  {
    number: "01",
    icon: User,
    title: "Personalize Your Profile",
    description: "Tell us about your industry, target audience, and content goals. Get personalized content based on your preferences and brand positioning.",
    details: "Set up takes less than 2 minutes. Choose from 50+ industries and define your ideal client persona."
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Generate Content",
    description: "Create engaging posts, captions, and carousels tailored to your brand and audience preferences with our content generation tools.",
    details: "Get multiple content variations per request. Each post is optimized for maximum engagement on your chosen platform."
  },
  {
    number: "03",
    icon: Download,
    title: "Download & Publish",
    description: "Copy your captions with one click, download Instagram carousel images ready to post (1080x1080px), and schedule your content for later. All content is optimized for each platform.",
    details: "Download carousel images with professional styling. Copy captions directly to your clipboard. Schedule posts to publish at your preferred time."
  }
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1E90FF]/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 heading-bebas">
            From Blank Page to{' '}
            <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
              Viral Content
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Our simple 3-step process gets you from idea to published content in under 5 minutes.
            No design skills or writing experience required.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex space-x-4 bg-[#1A1A1A] rounded-full p-2 border border-white/10">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] text-white gradient-glow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Step {step.number}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] p-4 rounded-2xl gradient-glow">
                {React.createElement(steps[activeStep].icon, { className: "w-8 h-8 text-white" })}
              </div>
              <div className="text-6xl heading-bebas text-gray-700">
                {steps[activeStep].number}
              </div>
            </div>

            <h3 className="text-3xl heading-bebas text-white">
              {steps[activeStep].title}
            </h3>

            <p className="text-xl text-gray-300 leading-relaxed">
              {steps[activeStep].description}
            </p>

            <p className="text-gray-400 leading-relaxed">
              {steps[activeStep].details}
            </p>

            <div className="flex items-center space-x-4 pt-4">
              {activeStep < steps.length - 1 && (
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="flex items-center space-x-2 text-[#1E90FF] hover:text-[#FF2D95] transition-colors font-semibold"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {activeStep === steps.length - 1 && (
                <Link href="/onboarding">
                  <Button className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow-hover transition-all rounded-full font-semibold px-8">
                    Get Started Now
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#161616] rounded-2xl p-8 border border-white/10 glow-blue-hover transition-all">
              {activeStep === 0 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Profile Setup</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Industry</label>
                      <div className="bg-[#121212] rounded-lg p-3 border border-white/10">
                        <span className="text-[#1E90FF]">Marketing & Sales</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Target Audience</label>
                      <div className="bg-[#121212] rounded-lg p-3 border border-white/10">
                        <span className="text-white">B2B Decision Makers</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Content Goals</label>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-[#1E90FF]/20 text-[#1E90FF] px-3 py-1 rounded-full text-sm border border-[#1E90FF]/30">Lead Generation</span>
                        <span className="bg-[#FF2D95]/20 text-[#FF2D95] px-3 py-1 rounded-full text-sm border border-[#FF2D95]/30">Thought Leadership</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Content Generation</h4>
                  <div className="space-y-4">
                    <div className="bg-[#121212] rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Generated Post #1</span>
                        <span className="text-xs bg-[#1E90FF]/20 text-[#1E90FF] px-2 py-1 rounded border border-[#1E90FF]/30">High Engagement</span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">
                        &quot;The biggest mistake B2B marketers make? Focusing on features instead of outcomes.
                        Here&apos;s how to shift your messaging...&quot;
                      </p>
                    </div>
                    <div className="bg-[#121212] rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Generated Post #2</span>
                        <span className="text-xs bg-[#FF2D95]/20 text-[#FF2D95] px-2 py-1 rounded border border-[#FF2D95]/30">Trending Topic</span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">
                        &quot;Just analyzed 1,000+ LinkedIn posts. The ones with the highest engagement all had this in common...&quot;
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Export & Publish</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#121212] rounded-lg border border-white/10">
                      <span className="text-white">LinkedIn Post</span>
                      <button className="bg-[#1E90FF] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1E90FF]/90 transition-all">Copy Caption</button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#121212] rounded-lg border border-white/10">
                      <span className="text-white">Instagram Carousel</span>
                      <button className="bg-[#FF2D95] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#FF2D95]/90 transition-all">Download Images</button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#121212] rounded-lg border border-white/10">
                      <span className="text-white">Twitter Thread</span>
                      <button className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-all">Schedule for Later</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex justify-center items-center space-x-8 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  activeStep === index
                    ? 'bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] text-white gradient-glow'
                    : 'bg-[#1A1A1A] text-gray-400 border border-white/10'
                }`}>
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 transition-all ${
                    activeStep > index ? 'bg-gradient-to-r from-[#1E90FF] to-[#FF2D95]' : 'bg-white/10'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
