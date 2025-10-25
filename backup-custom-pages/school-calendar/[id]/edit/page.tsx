// src/app/(dashboard)/school-calendar/[id]/edit/page.tsx
'use client';

import { EventForm } from '@/components/school-calendar/event-form';
import { useCalendarEvent, useUpdateCalendarEvent } from '@/hooks/use-school-calendar';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function EditEventPage() {
  const { id } = useParams();
  const { event, loading: eventLoading, error } = useCalendarEvent(Number(id));
  const { updateEvent, loading: updateLoading } = useUpdateCalendarEvent();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await updateEvent(Number(id), data);
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
      router.push('/dashboard/school-calendar');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/school-calendar');
  };

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        <p>Event not found: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground">
          Update the details for {event.title}
        </p>
      </div>
      <EventForm 
        event={event} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={updateLoading} 
      />
    </div>
  );
}