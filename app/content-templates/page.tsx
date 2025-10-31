'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ContentTemplateCard } from '@/components/content-templates/ContentTemplateCard';
import { EmptyState } from '@/components/content-templates/EmptyState';
import { getContentTemplates, updateContentTemplate } from '@/server/ai/actions';

// Define ContentTemplate interface locally
interface ContentTemplate {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
}
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';

export default function ContentTemplatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState<Array<{id: string, topic: string, status: string}>>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [selectedTopicStatus, setSelectedTopicStatus] = useState<string>('');
  const { toast } = useToast();
  const initialized = useRef(false);
  
  // Get topic ID from query parameters
  const topicId = searchParams.get('topic');

  const loadTopics = useCallback(async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('content_topics')
        .select('id, topic, status')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  }, [user?.id]);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use client-side Supabase query for templates
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      let query = supabase
        .from('content_templates')
        .select('*')
        .eq('user_id', user!.id);
      
      // Filter by topic if selectedTopicId is provided and not "all"
      const filterTopicId = selectedTopicId || topicId;
      if (filterTopicId && filterTopicId !== 'all') {
        query = query.eq('topic_id', filterTopicId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform data to match ContentTemplate interface
      const transformedTemplates: ContentTemplate[] = (data || []).map((template: any) => ({
        id: template.id,
        title: template.title,
        content: template.content,
        tags: template.tags || [],
        status: template.status,
        platform: template.platform,
        createdAt: template.created_at,
        updatedAt: template.updated_at
      }));
      
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content templates. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedTopicId, topicId, toast]);

  useEffect(() => {
    if (user && !initialized.current) {
      initialized.current = true;
      loadTopics();
      // Set initial topic from URL parameter
      if (topicId) {
        setSelectedTopicId(topicId);
      }
    }
  }, [user?.id, topicId, loadTopics]);

  useEffect(() => {
    if (user && initialized.current) {
      loadTemplates();
    }
  }, [user?.id, selectedTopicId, loadTemplates]);

  // Update selected topic status when topic is selected
  useEffect(() => {
    if (selectedTopicId && selectedTopicId !== 'all') {
      const selectedTopic = topics.find(topic => topic.id === selectedTopicId);
      if (selectedTopic) {
        setSelectedTopicStatus(selectedTopic.status);
      }
    } else {
      setSelectedTopicStatus('');
    }
  }, [selectedTopicId, topics]);

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

  const handleSave = async (id: string, updates: { title: string; content: string }) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { error } = await supabase
        .from('content_templates')
        .update({
          title: updates.title,
          content: updates.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user!.id);
      
      if (error) {
        throw error;
      }
      
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === id ? { ...template, ...updates } : template
        )
      );
      
      toast({
        title: 'Success',
        description: 'Template updated successfully.',
      });
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { error } = await supabase
        .from('content_templates')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user!.id);
      
      if (error) throw error;
      
      // Update local state
      setTemplates(prev =>
        prev.map((template) =>
          template.id === id ? { ...template, status } : template
        )
      );
      
      toast({
        title: 'Success',
        description: 'Template status updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update template status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTopicStatusUpdate = async (topicId: string, status: string) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { error } = await supabase
        .from('content_topics')
        .update({ status })
        .eq('id', topicId)
        .eq('user_id', user!.id);
      
      if (error) throw error;
      
      // Update local state
      setTopics(prev =>
        prev.map((topic) =>
          topic.id === topicId ? { ...topic, status } : topic
        )
      );
      
      toast({
        title: 'Success',
        description: 'Topic status updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update topic status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update topic status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <PageHeader
        rightContent={
          <div className="flex items-center gap-3">
            <Link href="/schedule">
              <Button className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white rounded-full">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Posts
              </Button>
            </Link>
            <Link href="/topics">
              <Button variant="ghost" className="border border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Topics
              </Button>
            </Link>
          </div>
        }
      />

      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            {topicId && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  📋 Showing templates for selected topic
                </p>
              </div>
            )}
            <h1 className="text-5xl md:text-6xl font-bold heading-bebas">
              Your{' '}
              <span className="bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] bg-clip-text text-transparent">
                Content Templates
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
              Refine and publish the ideas your AI crafted for you. Edit titles and content to match your voice perfectly.
            </p>
            
            {/* Topic Filter and Status */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-300">Filter by Topic:</label>
                <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                  <SelectTrigger className="w-64 bg-[#1A1A1A] border-white/10 text-white">
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-white/10">
                    <SelectItem value="all" className="text-white hover:bg-white/10">
                      All Topics
                    </SelectItem>
                    {topics.map((topic) => (
                      <SelectItem 
                        key={topic.id} 
                        value={topic.id}
                        className="text-white hover:bg-white/10"
                      >
                        {topic.topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedTopicId && selectedTopicId !== 'all' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-300">Topic Status:</label>
                  <Select 
                    value={selectedTopicStatus} 
                    onValueChange={(value) => handleTopicStatusUpdate(selectedTopicId, value)}
                  >
                    <SelectTrigger className="w-40 bg-[#1A1A1A] border-white/10 text-white">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-white/10">
                      <SelectItem value="draft" className="text-white hover:bg-white/10">Draft</SelectItem>
                      <SelectItem value="templates_generated" className="text-white hover:bg-white/10">Templates Ready</SelectItem>
                      <SelectItem value="approved" className="text-white hover:bg-white/10">Approved</SelectItem>
                      <SelectItem value="rejected" className="text-white hover:bg-white/10">Rejected</SelectItem>
                      <SelectItem value="done" className="text-white hover:bg-white/10">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 mx-auto text-[#1E90FF] animate-spin" />
                <p className="text-gray-400">Loading templates...</p>
              </div>
            </div>
          ) : templates.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {templates.map((template) => (
                <ContentTemplateCard
                  key={template.id}
                  template={template}
                  onSave={handleSave}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
