'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, UserCircle, Mail, Briefcase, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getProfile, updateProfileByUserId } from '@/server/users/actions';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<{
    id: string;
    full_name: string;
    profession: string;
    audience: string;
    tone: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    profession: '',
    targetAudience: '',
    tone: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const profileData = await getProfile(user.id);
        console.log('🔍 Profile data loaded from database:', profileData);
        
        if (profileData) {
          setProfile(profileData);
          const formDataToSet = {
            fullName: profileData.full_name || '',
            profession: profileData.profession || '',
            targetAudience: profileData.audience || '',
            tone: profileData.tone || '',
          };
          setFormData(formDataToSet);
          console.log('🔍 FormData set from loaded profile:', formDataToSet);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;

    // Only save if we're in editing mode
    if (!isEditing) {
      return;
    }

    // Client-side validation
    if (!formData.fullName.trim() || !formData.profession.trim() || !formData.targetAudience.trim() || !formData.tone) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);

    try {
      await updateProfileByUserId(user.id, {
        full_name: formData.fullName.trim(),
        profession: formData.profession.trim(),
        audience: formData.targetAudience.trim(),
        tone: formData.tone,
      });

      // Reload profile to get updated data
      const updatedProfile = await getProfile(user.id);
      console.log('🔍 Profile data from database after update:', updatedProfile);
      if (updatedProfile) {
        setProfile(updatedProfile);
        // Update formData with the saved values to ensure sync
        setFormData({
          fullName: updatedProfile.full_name || '',
          profession: updatedProfile.profession || '',
          targetAudience: updatedProfile.audience || '',
          tone: updatedProfile.tone || '',
        });
        console.log('🔍 FormData updated after save:', {
          fullName: updatedProfile.full_name || '',
          profession: updatedProfile.profession || '',
          targetAudience: updatedProfile.audience || '',
          tone: updatedProfile.tone || '',
        });
      }

      setIsEditing(false);
      toast.success('Profile updated successfully! Your new preferences will be used for future content generation.');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      const resetData = {
        fullName: profile.full_name || '',
        profession: profile.profession || '',
        targetAudience: profile.audience || '',
        tone: profile.tone || '',
      };
      setFormData(resetData);
      console.log('🔍 FormData reset on cancel:', resetData);
    }
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔍 Edit button clicked, setting isEditing to true');
    setIsEditing(true);
  };

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <PageHeader
        rightContent={
          <Link href="/topics">
            <Button variant="outline" className="border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        }
      />

      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold heading-bebas">
              Your{' '}
              <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
                Profile
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
              Manage your personal information and content preferences. These settings will be used for all future AI-generated content.
            </p>
          </div>

          {!profile ? (
            <div className="bg-[#1A1A1A] rounded-2xl p-12 text-center border border-white/10">
              <UserCircle className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Profile Found</h3>
              <p className="text-gray-400 mb-6">
                Please complete your onboarding to create your profile.
              </p>
              <Link href="/onboarding">
                <Button className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white rounded-full">
                  Complete Onboarding
                </Button>
              </Link>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E90FF]/10 to-[#FF2D95]/10 blur-2xl rounded-3xl"></div>
              <div className="relative bg-[#1A1A1A] rounded-2xl p-8 md:p-10 border border-white/10">
                <form onSubmit={handleSave} className="space-y-8">
                  {/* Avatar and Email Section */}
                  <div className="flex flex-col items-center space-y-4 pb-6 border-b border-white/10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {profile.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span className="text-white text-sm">{user.email}</span>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
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
                        disabled={!isEditing}
                        className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white placeholder:text-gray-500 h-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={!isEditing}
                        className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white placeholder:text-gray-500 h-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={!isEditing}
                        className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white placeholder:text-gray-500 h-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tone" className="text-white text-base">
                        Content Tone
                      </Label>
                      <Select 
                        value={formData.tone} 
                        onValueChange={(value) => setFormData({ ...formData, tone: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white h-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                          <SelectValue placeholder="Select your preferred tone" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
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
                  </div>

                  {/* Action Buttons */}
                  {!isEditing ? (
                    <div className="pt-4">
                      <Button
                        type="button"
                        onClick={handleEditClick}
                        className="w-full bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white rounded-full h-12 font-semibold"
                      >
                        Edit Preferences
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow-hover transition-all h-12 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                        className="border-white/20 hover:border-white/40 hover:bg-white/5 text-white h-12 rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

