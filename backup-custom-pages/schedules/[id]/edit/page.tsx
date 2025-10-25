// src/app/(dashboard)/schedules/[id]/edit/page.tsx
'use client';

import { ScheduleForm } from '@/components/schedule/schedule-form';
import { useSchedule, useUpdateSchedule } from '@/hooks/use-schedules';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function EditSchedulePage() {
  const { id } = useParams();
  const { schedule, loading: scheduleLoading, error } = useSchedule(Number(id));
  const { updateSchedule, loading: updateLoading } = useUpdateSchedule();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await updateSchedule(Number(id), data);
      toast({
        title: 'Success',
        description: 'Schedule updated successfully',
      });
      router.push('/dashboard/schedules');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/schedules');
  };

  if (scheduleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        <p>Schedule not found: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Schedule</h1>
        <p className="text-muted-foreground">
          Update the details for {schedule.subject} in {schedule.class_name}
        </p>
      </div>
      <ScheduleForm 
        schedule={schedule} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={updateLoading} 
      />
    </div>
  );
}