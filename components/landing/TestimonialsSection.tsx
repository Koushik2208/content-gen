import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Consultant',
    content: 'This tool has completely transformed my content strategy. I went from spending 15 hours a week on content to just 3 hours, and the quality has never been better.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Tech Entrepreneur',
    content: 'The AI understands my voice perfectly. My LinkedIn engagement has tripled since I started using BrandAI. Absolutely game-changing.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Business Coach',
    content: 'I was skeptical at first, but BrandAI delivers. The content feels authentic and resonates with my audience. Best investment I made this year.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 heading-bebas">
            Trusted By{' '}
            <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
              Creators
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Join thousands of professionals who are building their brands with AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-[#1A1A1A] border-white/10 p-8 hover:border-[#1E90FF]/30 glow-blue-hover transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FF2D95] text-[#FF2D95]" />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E90FF] to-[#FF2D95] flex items-center justify-center text-white font-bold">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
