import { Card } from '@/components/ui/card';
import { Clock, TrendingUp, Zap } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Save 10+ Hours Weekly',
    description: 'Automate your content creation process and reclaim your time. Focus on what matters most while AI handles the heavy lifting.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Audience',
    description: 'Create consistent, high-quality content that resonates with your target audience and drives real engagement.',
  },
  {
    icon: Zap,
    title: 'Generate Content Instantly',
    description: 'Transform your ideas into polished posts, articles, and social content in seconds, not hours.',
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 heading-bebas">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
              BrandAI
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to build a powerful personal brand and grow your online presence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="bg-[#1A1A1A] border-white/10 p-8 hover:border-[#1E90FF]/30 glow-blue-hover transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E90FF]/20 to-[#FF2D95]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-[#1E90FF]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
