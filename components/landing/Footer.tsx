import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="text-2xl font-bold tracking-wider mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              BRANDAI
            </div>
            <p className="text-gray-400 max-w-md mb-6">
              Build your personal brand effortlessly with AI-powered content creation. Save time, grow your audience, and transform your online presence.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#1E90FF]/20 flex items-center justify-center transition-colors group"
              >
                <Twitter className="w-5 h-5 group-hover:text-[#1E90FF] transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#1E90FF]/20 flex items-center justify-center transition-colors group"
              >
                <Linkedin className="w-5 h-5 group-hover:text-[#1E90FF] transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#1E90FF]/20 flex items-center justify-center transition-colors group"
              >
                <Github className="w-5 h-5 group-hover:text-[#1E90FF] transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#1E90FF]/20 flex items-center justify-center transition-colors group"
              >
                <Mail className="w-5 h-5 group-hover:text-[#1E90FF] transition-colors" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="hover:text-[#1E90FF] transition-colors">Features</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#1E90FF] transition-colors">Pricing</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#1E90FF] transition-colors">Use Cases</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#1E90FF] transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="hover:text-[#1E90FF] transition-colors">About</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#1E90FF] transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#1E90FF] transition-colors">Privacy</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#1E90FF] transition-colors">Terms</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 BrandAI. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Made with AI for creators worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
