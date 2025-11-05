'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title?: string;
  rightContent?: React.ReactNode;
}

export function PageHeader({ title, rightContent }: PageHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#121212]/95 backdrop-blur-sm">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* Desktop Layout - Single Row */}
        <div className="hidden sm:flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-wider heading-bebas">
            {title || 'BRANDAI'}
          </Link>
          
          <div className="flex items-center gap-3">
            {rightContent}
            {user && (
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
                      <p className="font-medium text-white text-sm truncate">{user.email}</p>
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
            )}
          </div>
        </div>

        {/* Mobile Layout - Two Rows */}
        <div className="flex sm:hidden flex-col gap-3">
          {/* First Row: Title and Avatar */}
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-wider heading-bebas">
              {title || 'BRANDAI'}
            </Link>
            
            {user && (
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
                      <p className="font-medium text-white text-sm truncate">{user.email}</p>
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
            )}
          </div>
          
          {/* Second Row: Buttons */}
          {rightContent && (
            <div className="flex items-center gap-2 w-full">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}