import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does the AI understand my brand voice?',
    answer: 'Our AI analyzes your existing content, writing style, and preferences to learn your unique voice. The more you use it, the better it gets at matching your tone and style perfectly.',
  },
  {
    question: 'Can I edit the AI-generated content?',
    answer: 'Absolutely! Every piece of content is fully editable. Think of AI as your starting point - you have complete control to refine, adjust, and personalize everything before publishing.',
  },
  {
    question: 'What types of content can I create?',
    answer: 'Create social media posts, blog articles, email newsletters, LinkedIn content, Twitter threads, and more. BrandAI adapts to any platform or content format you need.',
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Yes! Start with our free plan to explore all features. No credit card required. Upgrade anytime when you are ready to scale your content creation.',
  },
  {
    question: 'How is this different from ChatGPT?',
    answer: 'BrandAI is specifically designed for personal branding and content creation. It learns your unique voice, maintains consistency across platforms, and includes brand-specific features that generic AI tools do not offer.',
  },
  {
    question: 'Can I use this for multiple brands?',
    answer: 'Yes! Our Pro and Enterprise plans support multiple brand profiles, each with its own voice, style, and content preferences.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF2D95]/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 heading-bebas">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about BrandAI.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-[#1A1A1A] border border-white/10 rounded-lg px-6 hover:border-[#1E90FF]/30 transition-all"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#1E90FF] py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 leading-relaxed pb-6 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
