'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const faqs = [
  {
    question: "How does ContentGenPro create personalized content?",
    answer: "During setup, you provide information about your industry, target audience, and content goals. Based on your preferences, the platform generates content tailored to your brand positioning and style. You can further customize any content to match your exact voice and messaging."
  },
  {
    question: "Can I customize the generated content?",
    answer: "Absolutely! Every piece of generated content serves as a starting point. You can edit, modify, or completely rewrite any content to match your exact needs. You have full control over content length, tone, hashtags, and call-to-actions. Save your edits as templates for future use."
  },
  {
    question: "What types of content can I create?",
    answer: "ContentGenPro supports LinkedIn posts, Instagram captions, Twitter/X posts, and Instagram carousel slides. Each content type is optimized for its specific platform. You can download carousel images ready for Instagram posting, and copy captions for direct use on your social media platforms."
  },
  {
    question: "How much time will this actually save me?",
    answer: "Our users report saving 10+ hours per week on average. Instead of spending hours brainstorming topics and writing content, you can generate weeks of content in minutes. The time saved allows you to focus on engaging with your audience and growing your business."
  },
  {
    question: "How do I download Instagram carousel images?",
    answer: "When viewing an Instagram template in the content templates section, you'll see a 'Download Carousel' button. Click it to download all carousel slides as separate PNG files, perfectly sized for Instagram (1080x1080px). The images maintain all styling including fonts, colors, and drop shadows."
  },
  {
    question: "What if the content doesn't match my style?",
    answer: "You can edit any generated content to match your exact style and voice. The platform provides a starting point that you can customize. Over time, you'll build a library of templates that reflect your preferred content style and messaging."
  },
  {
    question: "Can I organize my content?",
    answer: "Yes! ContentGenPro allows you to organize your content by topics and templates. You can create topics, generate content for each topic, and save your favorite content as reusable templates. This helps you maintain consistency and build a content library over time."
  },
  {
    question: "Is my data secure and private?",
    answer: "Data security is our top priority. We use enterprise-grade encryption and never share your content with third parties. Your content ideas, generated posts, and business information remain completely private and secure."
  },
  {
    question: "Do I need to connect my social media accounts?",
    answer: "No, you don't need to connect your social media accounts. You can generate content, download images, and copy captions to use on any platform. This gives you full control over when and where you publish your content."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer email support and a detailed knowledge base to help you get the most out of ContentGenPro. Our support team is here to assist with any questions about using the platform and creating great content."
  }
];

export function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-[#0F0F0F]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 heading-bebas text-white">
            Frequently Asked
            <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
              {' '}Questions
            </span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Get answers to common questions about ContentGen Pro and how it can transform your content strategy.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#2A2A2A] rounded-xl border border-gray-700 overflow-hidden hover:border-[#1E90FF]/50 transition-colors"
              style={{ 
                animation: `fadeInUp 0.6s ease-out ${index * 50}ms forwards`, 
                opacity: 0 
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-[#1A1A1A]/50 transition-colors"
                aria-expanded={openFaq === index}
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openFaq === index ? (
                    <Minus className="w-5 h-5 text-[#1E90FF]" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {openFaq === index && (
                <div className="px-8 pb-6">
                  <div className="border-t border-gray-700 pt-6">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold mb-4 heading-bebas text-white">
              Still Have Questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Our support team is here to help you succeed with ContentGen Pro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white px-6 py-3 rounded-full font-semibold gradient-glow transition-all duration-300">
                  Start Free Trial
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border border-gray-600 text-gray-300 px-6 py-3 rounded-full font-semibold hover:border-[#1E90FF] hover:text-[#1E90FF] transition-colors"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}