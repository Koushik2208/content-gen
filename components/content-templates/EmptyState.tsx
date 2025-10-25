'use client';

import { Button } from '@/components/ui/button';
import { FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E90FF]/20 to-[#FF2D95]/20 blur-3xl rounded-full"></div>
          <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#161616] flex items-center justify-center border border-white/10">
            <FileText className="w-12 h-12 text-[#1E90FF]" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white heading-bebas">
            No Templates Found Yet
          </h3>
          <p className="text-gray-400 leading-relaxed">
            Generate templates based on your topics to start refining your ideas and creating engaging content.
          </p>
        </div>

        <Link href="/topics">
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow transition-all rounded-full px-8"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Templates
          </Button>
        </Link>
      </div>
    </div>
  );
}
