'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#121212]/95 backdrop-blur-sm border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            CONTENTGENPRO
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#benefits" className="text-sm hover:text-[#1E90FF] transition-colors">
              Benefits
            </a>
            <a href="#how-it-works" className="text-sm hover:text-[#1E90FF] transition-colors">
              How It Works
            </a>
            <a href="#testimonials" className="text-sm hover:text-[#1E90FF] transition-colors">
              Testimonials
            </a>
            <a href="#faq" className="text-sm hover:text-[#1E90FF] transition-colors">
              FAQ
            </a>
          </nav>

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/topics">
                <Button variant="outline" className="border-white/20 hover:border-white/40 hover:bg-white/5 text-white">
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] text-white text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#1A1A1A] border-white/10" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white text-sm">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="text-white hover:bg-white/10" onClick={() => router.push('/topics')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-white/10" onClick={() => router.push('/content-templates')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Templates</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-white/10" onClick={() => router.push('/profile')}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="text-white hover:bg-white/10" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href="/onboarding">
              <Button className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow-hover transition-all rounded-full font-semibold">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
