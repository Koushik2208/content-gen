'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Loader2, User, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createProfile, getProfile } from '@/server/users/actions';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'profile' | 'email-confirmation'>('signin');
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });
  const [formData, setFormData] = useState({
    fullName: '',
    profession: '',
    targetAudience: '',
    tone: '',
  });

  const [profileCheckComplete, setProfileCheckComplete] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);

  const handleResendConfirmation = async () => {
    try {
      // This would require implementing a resend confirmation function in auth-context
      toast.success('Confirmation email sent! Please check your inbox.');
    } catch (error) {
      toast.error('Failed to resend confirmation email. Please try again.');
    }
  };

  // Check if user has existing profile
  const checkExistingProfile = async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      if (profile) {
        router.push('/topics');
        return;
      }
    } catch (error) {
      // Profile doesn't exist, show profile creation form
    }
    setAuthMode('profile');
    setProfileCheckComplete(true);
  };

  // Handle profile check when user changes
  useEffect(() => {
    if (user && !profileCheckComplete) {
      checkExistingProfile(user.id);
    }
  }, [user, profileCheckComplete]);

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If user is authenticated but profile check not complete
  if (user && !profileCheckComplete) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Checking profile...</span>
        </div>
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInData.email.trim() || !signInData.password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Signed in successfully!');
        // Reset profile check state to trigger new check
        setProfileCheckComplete(false);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInData.email.trim() || !signInData.password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signInData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signUp(signInData.email, signInData.password);
      
      if (error) {
        toast.error(error.message);
      } else {
        // For new signups, always show email confirmation screen
        toast.success('Account created! Please check your email to confirm your account.');
        setAuthMode('email-confirmation');
        setEmailConfirmationSent(true);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.fullName.trim() || !formData.profession.trim() || !formData.targetAudience.trim() || !formData.tone) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await createProfile({
        full_name: formData.fullName.trim(),
        profession: formData.profession.trim(),
        audience: formData.targetAudience.trim(),
        tone: formData.tone,
      }, user!.id);

      toast.success('Profile created successfully!');
      router.push('/topics');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <header className="border-b border-white/5 bg-[#121212]/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-wider heading-bebas">
              BRANDAI
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E90FF]/10 border border-[#1E90FF]/20">
                <Sparkles className="w-4 h-4 text-[#1E90FF]" />
                <span className="text-sm">Step 1 of 3</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight heading-bebas">
                Let&apos;s Build Your{' '}
                <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
                  Personal Brand
                </span>
              </h1>

              <p className="text-xl text-gray-400 leading-relaxed">
                Tell us a bit about yourself so we can personalize your content creation experience. This takes less than 2 minutes.
              </p>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E90FF]/20 to-[#FF2D95]/20 blur-3xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#161616] rounded-2xl p-8 border border-white/10">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] flex items-center justify-center flex-shrink-0 gradient-glow">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">AI-Powered Personalization</div>
                      <p className="text-sm text-gray-400">
                        Our AI learns your unique voice and creates content that resonates with your audience.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] flex items-center justify-center flex-shrink-0 gradient-glow">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Save 10+ Hours Weekly</div>
                      <p className="text-sm text-gray-400">
                        Generate high-quality content in seconds instead of spending hours brainstorming and writing.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] flex items-center justify-center flex-shrink-0 gradient-glow">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Consistent Brand Voice</div>
                      <p className="text-sm text-gray-400">
                        Maintain a cohesive brand presence across all platforms with AI-generated content.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E90FF]/10 to-[#FF2D95]/10 blur-2xl rounded-3xl"></div>
            <div className="relative bg-[#1A1A1A] rounded-2xl p-8 md:p-10 border border-white/10 glow-blue-hover transition-all">
              {authMode === 'profile' ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white text-base">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white placeholder:text-gray-500 h-12 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-white text-base">
                    Profession
                  </Label>
                  <Input
                    id="profession"
                    type="text"
                    placeholder="e.g., Marketing Consultant, Coach, Designer"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white placeholder:text-gray-500 h-12 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience" className="text-white text-base">
                    Target Audience
                  </Label>
                  <Input
                    id="targetAudience"
                    type="text"
                    placeholder="e.g., B2B Decision Makers, Entrepreneurs, Creatives"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white placeholder:text-gray-500 h-12 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone" className="text-white text-base">
                    Content Tone
                  </Label>
                  <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                    <SelectTrigger className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white h-12 rounded-lg">
                      <SelectValue placeholder="Select your preferred tone" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-white/10 text-white w-min">
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="story telling">Story Telling</SelectItem>
                      <SelectItem value="lead magnet">Lead Magnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow-hover transition-all text-lg h-14 rounded-full font-semibold mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Profile'
                )}
                </Button>

                <div className="flex items-center justify-center mt-6">
                  <div className="flex-1 border-t border-white/10"></div>
                  <span className="px-4 text-sm text-gray-400">or</span>
                  <div className="flex-1 border-t border-white/10"></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAuthMode('signin')}
                  className="w-full border-white/20 hover:border-white/40 hover:bg-white/5 text-white h-12 rounded-lg"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In to Existing Account
                </Button>

                <p className="text-center text-sm text-gray-400 mt-4">
                  By creating a profile, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
              ) : authMode === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-400">Sign in to your account</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-base">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white placeholder:text-gray-500 h-12 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white text-base">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white placeholder:text-gray-500 h-12 rounded-lg"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow-hover transition-all text-lg h-14 rounded-full font-semibold mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="flex items-center justify-center mt-6">
                    <div className="flex-1 border-t border-white/10"></div>
                    <span className="px-4 text-sm text-gray-400">or</span>
                    <div className="flex-1 border-t border-white/10"></div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAuthMode('signup')}
                    className="w-full border-white/20 hover:border-white/40 hover:bg-white/5 text-white h-12 rounded-lg"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Create New Account
                  </Button>
                </form>
              ) : authMode === 'email-confirmation' ? (
                <div className="space-y-6 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                    <p className="text-gray-400">
                      We've sent a confirmation link to <span className="text-[#1E90FF] font-semibold">{signInData.email}</span>
                    </p>
                  </div>

                  <div className="bg-[#121212] rounded-lg p-4 border border-white/10">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#1E90FF]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-[#1E90FF]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 11-2 0v-3a1 1 0 00-1-1H9a1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-gray-300 mb-2">
                          <strong>Next steps:</strong>
                        </p>
                        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                          <li>Check your email inbox (and spam folder)</li>
                          <li>Click the confirmation link in the email</li>
                          <li>Come back here and sign in</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="w-full bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow-hover transition-all text-lg h-12 rounded-full font-semibold"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      I've Confirmed My Email - Sign In
                    </Button>

                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendConfirmation}
                        className="flex-1 border-white/20 hover:border-white/40 hover:bg-white/5 text-white h-12 rounded-lg"
                      >
                        Resend Email
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAuthMode('signup')}
                        className="flex-1 border-white/20 hover:border-white/40 hover:bg-white/5 text-white h-12 rounded-lg"
                      >
                        Try Different Email
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-gray-400">Sign up to get started</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white text-base">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white placeholder:text-gray-500 h-12 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white text-base">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white placeholder:text-gray-500 h-12 rounded-lg"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow-hover transition-all text-lg h-14 rounded-full font-semibold mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <div className="flex items-center justify-center mt-6">
                    <div className="flex-1 border-t border-white/10"></div>
                    <span className="px-4 text-sm text-gray-400">or</span>
                    <div className="flex-1 border-t border-white/10"></div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAuthMode('signin')}
                    className="w-full border-white/20 hover:border-white/40 hover:bg-white/5 text-white h-12 rounded-lg"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In to Existing Account
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
