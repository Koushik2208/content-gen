import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1E90FF]/20 to-[#FF2D95]/20 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden border border-white/10 glow-blue">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E90FF]/10 via-transparent to-[#FF2D95]/10 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E90FF]/20 border border-[#1E90FF]/30 mb-6">
              <Sparkles className="w-4 h-4 text-[#1E90FF]" />
              <span className="text-sm">Limited Time Offer</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 heading-bebas">
              Ready To Transform Your{' '}
              <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
                Content Creation?
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are building powerful personal brands with personalized content. Start your free trial today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboarding">
                <Button size="lg" className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow transition-all text-lg px-12 py-7 rounded-full font-semibold">
                  Start Free Trial
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 hover:border-white/50 hover:bg-white/5 text-lg px-12 py-7 rounded-full"
              >
                Schedule Demo
              </Button>
            </div>

            <p className="text-sm text-gray-400 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
