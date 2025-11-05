'use client';

import { Button } from '@/components/ui/button';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const testimonials = [
  {
    name: "Sarah Chen",
    title: "Marketing Director",
    company: "TechFlow Solutions",
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
    content: "ContentGen Pro has completely transformed my LinkedIn presence. I've gone from posting sporadically to consistent daily content that actually engages my audience. My connection requests have increased by 300%.",
    rating: 5,
    results: "300% more connection requests"
  },
  {
    name: "Marcus Thompson",
    title: "Sales Manager",
    company: "Growth Dynamics",
    image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400",
    content: "I was spending 2-3 hours every week just thinking about what to post. Now I generate a week's worth of content in 15 minutes. The quality is outstanding and perfectly matches my voice.",
    rating: 5,
    results: "Saves 10+ hours weekly"
  },
  {
    name: "Dr. Emily Rodriguez",
    title: "Healthcare Consultant",
    company: "MedTech Advisors",
    image: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=400",
    content: "The AI understands my industry perfectly. Every post feels authentic to my expertise in healthcare. I've attracted 3 new clients directly from my LinkedIn content in the past month.",
    rating: 5,
    results: "3 new clients acquired"
  },
  {
    name: "Alex Park",
    title: "Startup Founder",
    company: "InnovateLab",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
    content: "As a busy founder, content creation was always on the back burner. ContentGen Pro makes it so easy that I actually enjoy posting now. My personal brand has never been stronger.",
    rating: 5,
    results: "10x more post engagement"
  },
  {
    name: "Jennifer Walsh",
    title: "Business Coach",
    company: "Success Strategies",
    image: "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400",
    content: "The content variety is incredible. From thought leadership to behind-the-scenes posts, it helps me show different sides of my expertise. My audience engagement has tripled.",
    rating: 5,
    results: "3x audience engagement"
  },
  {
    name: "David Kim",
    title: "Financial Advisor",
    company: "WealthPath Group",
    image: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400",
    content: "Complex financial topics made simple and engaging. The AI helps me break down complicated concepts into digestible content that my clients actually want to read and share.",
    rating: 5,
    results: "50% more client referrals"
  }
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 heading-bebas text-white">
            Success Stories From
            <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
              {' '}Real Users
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of professionals who've accelerated their personal brand growth 
            and seen measurable business results with ContentGen Pro.
          </p>

          {/* Overall Stats */}
          <div className="flex justify-center flex-wrap gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1E90FF] mb-1">4.9/5</div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FF2D95] mb-1">10K+</div>
              <div className="text-sm text-gray-400">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">1M+</div>
              <div className="text-sm text-gray-400">Posts Generated</div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#2A2A2A] rounded-2xl p-8 border border-gray-700 hover:bg-gradient-to-br hover:from-[#2A2A2A] hover:to-[#0F0F0F] transition-all duration-300 hover:shadow-xl hover:shadow-[#1E90FF]/10"
              style={{ animation: `fadeInUp 0.6s ease-out ${index * 100}ms forwards`, opacity: 0 }}
            >
              {/* Quote + Stars */}
              <div className="flex justify-between items-start mb-6">
                <Quote className="w-8 h-8 text-[#1E90FF] opacity-50" />
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-300 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Results Badge */}
              <div className="bg-[#0F0F0F] rounded-lg p-3 mb-6 border border-[#1E90FF]/20">
                <div className="text-sm text-gray-400 mb-1">Key Result:</div>
                <div className="text-[#1E90FF] font-semibold">{testimonial.results}</div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <div className="text-white font-semibold">{testimonial.name}</div>
                  <div className="text-gray-400 text-sm">{testimonial.title}</div>
                  <div className="text-gray-500 text-xs">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators + CTA */}
        <div className="mt-16 text-center">
          <div className="bg-[#2A2A2A] rounded-2xl p-8 inline-block w-full max-w-5xl mx-auto border border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">98%</div>
                <div className="text-sm text-gray-400">User Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">500%</div>
                <div className="text-sm text-gray-400">Average ROI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">15min</div>
                <div className="text-sm text-gray-400">Weekly Time Investment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">3x</div>
                <div className="text-sm text-gray-400">Engagement Increase</div>
              </div>
            </div>
          </div>

          <Link href="/onboarding" className="inline-block mt-8">
            <Button className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white px-8 py-4 rounded-full font-semibold text-lg gradient-glow transition-all duration-300">
              Join These Success Stories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}