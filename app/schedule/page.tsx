'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ScheduleForm } from '@/components/schedule/ScheduleForm';
import { ScheduledPostCard } from '@/components/schedule/ScheduledPostCard';
import { getContentTemplates } from '@/server/ai/actions';
import { PageHeader } from '@/components/shared/PageHeader';

// Define ContentTemplate interface locally
interface ContentTemplate {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: string;
  platform: string;
  topic_id?: string;
  createdAt: string;
  updatedAt: string;
  carouselSlides?: string[];
}
import { schedulePost, getScheduledPosts, deleteScheduledPost } from '@/server/scheduling/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@supabase/supabase-js';

export interface ScheduledPost {
  id: string;
  templateId: string;
  templateTitle: string;
  platform: string;
  content: string;
  scheduledAt: string;
  status: 'scheduled' | 'published' | 'failed';
  createdAt: string;
}

export default function SchedulePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [topics, setTopics] = useState<Array<{id: string, topic: string}>>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const { toast } = useToast();
  const initialized = useRef(false);

  useEffect(() => {
    if (user && !initialized.current) {
      initialized.current = true;
      loadTemplates();
      loadTopics();
      loadScheduledPosts();
    }
  }, [user]);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use client-side Supabase query for templates
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Debug: Log raw template data from database
      console.log('Raw template data from database:', data?.map(t => ({
        id: t.id,
        title: t.title,
        topic_id: t.topic_id,
        platform: t.platform
      })));

      // Transform data to match ContentTemplate interface
      const transformedTemplates: ContentTemplate[] = (data || []).map((template: any) => ({
        id: template.id,
        title: template.title,
        content: template.content,
        tags: template.tags || [],
        status: template.status,
        platform: template.platform,
        topic_id: template.topic_id,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
        carouselSlides: template.carousel_slides || []
      }));
      
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const loadTopics = useCallback(async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('content_topics')
        .select('id, topic')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  }, [user?.id]);

  const loadScheduledPosts = useCallback(async () => {
    try {
      setIsLoadingPosts(true);
      
      // Use client-side Supabase query for scheduled posts
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // First get scheduled posts
      const { data: postsData, error: postsError } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user!.id)
        .order('scheduled_at', { ascending: true });
      
      if (postsError) throw postsError;
      
      // Get template titles for posts that have template_id
      const templateIds = postsData?.filter(post => post.template_id).map(post => post.template_id) || [];
      let templateTitles: Record<string, string> = {};
      
      if (templateIds.length > 0) {
        const { data: templatesData, error: templatesError } = await supabase
          .from('content_templates')
          .select('id, title')
          .in('id', templateIds);
        
        if (!templatesError && templatesData) {
          templateTitles = templatesData.reduce((acc, template) => {
            acc[template.id] = template.title;
            return acc;
          }, {} as Record<string, string>);
        }
      }
      
      // Transform data to match ScheduledPost interface
      const transformedPosts: ScheduledPost[] = (postsData || []).map((post: any) => ({
        id: post.id,
        templateId: post.template_id || '',
        templateTitle: post.template_id ? (templateTitles[post.template_id] || 'Template Not Found') : 'No Template',
        platform: post.platform,
        content: post.content,
        scheduledAt: post.scheduled_at,
        status: post.status,
        createdAt: post.created_at
      }));
      
      setScheduledPosts(transformedPosts);
    } catch (error) {
      console.error('Failed to load scheduled posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scheduled posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPosts(false);
    }
  }, [user?.id, toast]);

  const handleSchedule = async (data: { templateId: string; date: Date; time: string }) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please sign in to schedule posts.',
        variant: 'destructive',
      });
      return;
    }

    const template = templates.find(t => t.id === data.templateId);
    if (!template) {
      toast({
        title: 'Error',
        description: 'Template not found.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Combine date and time
      const scheduledDateTime = new Date(data.date);
      const [hours, minutes] = data.time.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      // Get content from template
      const content = template.carouselSlides && template.carouselSlides.length > 0 
        ? template.carouselSlides[0] 
        : template.content;
      
      console.log('Template content:', { 
        content, 
        carouselSlides: template.carouselSlides, 
        regularContent: template.content 
      });

      // Use server action to schedule post
      await schedulePost({
        content: content || 'No content available',
        platform: template.platform,
        scheduledAt: scheduledDateTime,
        template_id: data.templateId,
        user_id: user.id
      });

      // Reload scheduled posts to get the updated list
      await loadScheduledPosts();
      
      toast({
        title: 'Success',
        description: 'Post scheduled successfully.',
      });
    } catch (error) {
      console.error('Failed to schedule post:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScheduledPost(id);
      
      // Update local state
      setScheduledPosts(prev => prev.filter(post => post.id !== id));
      
      toast({
        title: 'Post Deleted',
        description: 'Scheduled post has been removed.',
      });
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const scheduledTemplateIds = scheduledPosts.map(post => post.templateId);

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

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <PageHeader
        rightContent={
          <Link href="/content-templates">
            <Button variant="outline" className="border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          </Link>
        }
      />

      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold heading-bebas">
              Schedule{' '}
              <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
                Your Posts
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
              Plan your content calendar by scheduling posts across all your platforms. Stay consistent and grow your audience.
            </p>
          </div>

          {isLoading || isLoadingPosts ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 mx-auto text-[#1E90FF] animate-spin" />
                <p className="text-gray-400">
                  {isLoading ? 'Loading templates...' : 'Loading scheduled posts...'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-[#1E90FF]" />
                  <h2 className="text-3xl font-bold heading-bebas">Schedule New Post</h2>
                </div>
                <ScheduleForm
                  templates={templates}
                  scheduledTemplateIds={scheduledTemplateIds}
                  topics={topics}
                  onSchedule={handleSchedule}
                />
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold heading-bebas mb-2">Scheduled Posts</h2>
                  <p className="text-gray-400">
                    {scheduledPosts.length} {scheduledPosts.length === 1 ? 'post' : 'posts'} scheduled
                  </p>
                </div>

                {scheduledPosts.length === 0 ? (
                  <div className="bg-[#1A1A1A] rounded-2xl p-12 text-center shadow-lg">
                    <Calendar className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Scheduled Posts</h3>
                    <p className="text-gray-400">
                      Schedule your first post using the form above to start building your content calendar.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {scheduledPosts.map((post) => (
                      <ScheduledPostCard
                        key={post.id}
                        post={post}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
