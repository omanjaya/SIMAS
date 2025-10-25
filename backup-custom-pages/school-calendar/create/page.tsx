// src/app/(dashboard)/school-calendar/create/page.tsx
'use client';

import { EventForm } from '@/components/school-calendar/event-form';
import { useCreateCalendarEvent } from '@/hooks/use-school-calendar';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
  const { createEvent, loading } = useCreateCalendarEvent();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await createEvent(data);
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
      router.push('/dashboard/school-calendar');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/school-calendar');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Event</h1>
        <p className="text-muted-foreground">
          Add a new event to the school calendar
        </p>
      </div>
      <EventForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={loading} 
      />
    </div>
  );
}