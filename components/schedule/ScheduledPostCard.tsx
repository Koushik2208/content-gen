'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ScheduledPost } from '@/app/schedule/page';

interface ScheduledPostCardProps {
  post: ScheduledPost;
  onDelete: (id: string) => void;
}

export function ScheduledPostCard({ post, onDelete }: ScheduledPostCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const statusColors = {
    scheduled: 'bg-[#1E90FF]/20 text-[#1E90FF] border-[#1E90FF]/30',
    published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const platformColors: Record<string, string> = {
    LinkedIn: 'bg-[#0A66C2]/20 text-[#0A66C2] border-[#0A66C2]/30',
    Twitter: 'bg-[#1DA1F2]/20 text-[#1DA1F2] border-[#1DA1F2]/30',
    Instagram: 'bg-[#E4405F]/20 text-[#E4405F] border-[#E4405F]/30',
    YouTube: 'bg-[#FF0000]/20 text-[#FF0000] border-[#FF0000]/30',
    default: 'bg-[#1E90FF]/20 text-[#1E90FF] border-[#1E90FF]/30',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDelete = () => {
    onDelete(post.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="bg-[#1A1A1A] border-none shadow-lg hover:shadow-2xl hover:shadow-[#1E90FF]/10 transition-all duration-300 group">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-semibold text-white leading-tight flex-1">
              {post.templateTitle}
            </h3>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              size="icon"
              variant="ghost"
              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${platformColors[post.platform] || platformColors.default} border font-medium`}>
              {post.platform}
            </Badge>
            <Badge className={`${statusColors[post.status]} border font-medium capitalize`}>
              {post.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-gray-400 leading-relaxed whitespace-pre-wrap line-clamp-3">
            {post.content}
          </div>

          <div className="flex items-center gap-6 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4 text-[#1E90FF]" />
              <span>{formatDate(post.scheduledDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4 text-[#FF2D95]" />
              <span>{formatTime(post.scheduledTime)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-white/5 pt-4">
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="outline"
            className="w-full border-white/20 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove from Schedule
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#1A1A1A] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Scheduled Post?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to remove "{post.templateTitle}" from your schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/20 hover:bg-white/5 text-white rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
