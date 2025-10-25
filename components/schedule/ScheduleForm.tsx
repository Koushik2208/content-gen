'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Clock, Send } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
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

interface ScheduleFormProps {
  templates: ContentTemplate[];
  scheduledTemplateIds: string[];
  topics: Array<{id: string, topic: string}>;
  onSchedule: (data: { templateId: string; date: Date; time: string }) => void;
}

export function ScheduleForm({ templates, scheduledTemplateIds, topics, onSchedule }: ScheduleFormProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Get unique platforms from templates
  const platforms = Array.from(new Set(templates.map(t => t.platform))).sort();
  
  // Filter templates based on selected topic and platform
  const filteredTemplates = templates.filter(template => {
    // Topic matching: if 'all' is selected, show all templates
    // If a specific topic is selected, only show templates that have that topic_id
    // Handle both null and undefined topic_id values
    const topicMatch = selectedTopicId === 'all' || 
      (template.topic_id && template.topic_id !== null && template.topic_id === selectedTopicId);
    
    const platformMatch = selectedPlatform === 'all' || template.platform === selectedPlatform;
    
    return topicMatch && platformMatch;
  });

  const selectedTemplate = filteredTemplates.find(t => t.id === selectedTemplateId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId || !selectedDate) return;

    onSchedule({
      templateId: selectedTemplateId,
      date: selectedDate,
      time: selectedTime,
    });

    setSelectedTemplateId('');
    setSelectedDate(undefined);
    setSelectedTime('09:00');
  };

  const isFormValid = selectedTemplateId && selectedDate && selectedTime;

  return (
    <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#161616] border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Create Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Filter by Topic</Label>
              <Select value={selectedTopicId} onValueChange={(value) => {
                setSelectedTopicId(value);
                setSelectedTemplateId(''); // Reset template selection when filter changes
              }}>
                <SelectTrigger className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white">
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

            <div className="space-y-2">
              <Label className="text-white">Filter by Platform</Label>
              <Select value={selectedPlatform} onValueChange={(value) => {
                setSelectedPlatform(value);
                setSelectedTemplateId(''); // Reset template selection when filter changes
              }}>
                <SelectTrigger className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  <SelectItem value="all" className="text-white hover:bg-white/10">
                    All Platforms
                  </SelectItem>
                  {platforms.map((platform) => (
                    <SelectItem 
                      key={platform} 
                      value={platform}
                      className="text-white hover:bg-white/10"
                    >
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template" className="text-white">Select Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger
                id="template"
                className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white"
              >
                <SelectValue placeholder="Choose a template to schedule" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => {
                    const isScheduled = scheduledTemplateIds.includes(template.id);
                    return (
                      <SelectItem
                        key={template.id}
                        value={template.id}
                        disabled={isScheduled}
                        className="text-white hover:bg-white/5 focus:bg-white/5 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="flex-1 truncate">{template.title}</span>
                          <span className="text-xs text-gray-500">{template.platform}</span>
                          {isScheduled && (
                            <span className="text-xs text-amber-500">Already Scheduled</span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })
                ) : (
                  <div className="p-2 text-sm text-gray-400 text-center">
                    No templates found for selected filters
                  </div>
                )}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-sm text-gray-400">
                Platform: <span className="text-white">{selectedTemplate.platform}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white">Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-[#121212] border-white/10 hover:border-[#1E90FF] hover:bg-[#121212] text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-white/10" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Time</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select 
                    value={selectedTime.split(':')[0] || '09'} 
                    onValueChange={(hour) => {
                      const minutes = selectedTime.split(':')[1] || '00';
                      setSelectedTime(`${hour}:${minutes}`);
                    }}
                  >
                    <SelectTrigger className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Hour" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-white/10">
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={hour} className="text-white hover:bg-white/10">
                            {hour}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-white">:</span>
                <div className="flex-1">
                  <Select 
                    value={selectedTime.split(':')[1] || '00'} 
                    onValueChange={(minutes) => {
                      const hour = selectedTime.split(':')[0] || '09';
                      setSelectedTime(`${hour}:${minutes}`);
                    }}
                  >
                    <SelectTrigger className="bg-[#121212] border-white/10 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-white/10">
                      {['00', '15', '30', '45'].map((minute) => (
                        <SelectItem key={minute} value={minute} className="text-white hover:bg-white/10">
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isFormValid}
            className="w-full bg-gradient-to-r from-[#1E90FF] to-[#FF2D95] hover:from-[#1E90FF]/90 hover:to-[#FF2D95]/90 text-white gradient-glow transition-all rounded-full py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 mr-2" />
            Schedule Post
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
