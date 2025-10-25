// src/app/(dashboard)/schedules/create/page.tsx
'use client';

import { ScheduleForm } from '@/components/schedule/schedule-form';
import { useCreateSchedule } from '@/hooks/use-schedules';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function CreateSchedulePage() {
  const { createSchedule, loading } = useCreateSchedule();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await createSchedule(data);
      toast({
        title: 'Success',
        description: 'Schedule created successfully',
      });
      router.push('/dashboard/schedules');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create schedule',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/schedules');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Schedule</h1>
        <p className="text-muted-foreground">
          Assign a new teaching schedule or duty
        </p>
      </div>
      <ScheduleForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={loading} 
      />
    </div>
  );
}