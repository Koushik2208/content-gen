import './globals.css';
import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import localFont from 'next/font/local';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

const greatVibes = localFont({
  src: './fonts/GreatVibes-Regular.ttf',
  variable: '--font-great-vibes',
});

export const metadata: Metadata = {
  title: 'Personal Branding Content Generator | Build Your Brand with AI',
  description: 'Create consistent, high-quality personal branding content effortlessly with AI. Save 10+ hours weekly and grow your audience.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
      </head>
      <body className={`${manrope.variable} ${greatVibes.variable}`}>
        <AuthProvider>
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
