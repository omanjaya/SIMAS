// src/components/schedule/schedule-form.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeacherSchedule, TeacherScheduleFormData } from '@/types/schedules';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEmployees } from '@/hooks/use-employees';
import { usePeriods } from '@/hooks/use-periods';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';

const scheduleSchema = z.object({
  employee_id: z.number().min(1, 'Teacher is required'),
  period_id: z.number().min(1, 'Period is required'),
  subject: z.string().min(1, 'Subject is required'),
  class_name: z.string().min(1, 'Class name is required'),
  room_number: z.string(),
  date: z.string().optional(),
  day_of_week: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  is_recurring: z.boolean(),
  schedule_type: z.enum(['class', 'meeting', 'duty', 'exam_supervision']),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

interface ScheduleFormProps {
  schedule?: TeacherSchedule;
  onSubmit: (data: TeacherScheduleFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ScheduleForm({ schedule, onSubmit, onCancel, loading }: ScheduleFormProps) {
  const { employees, loading: employeesLoading } = useEmployees({});
  const { periods, loading: periodsLoading } = usePeriods();
  const [isRecurring, setIsRecurring] = useState(schedule?.is_recurring || false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TeacherScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      employee_id: schedule?.employee_id || 0,
      period_id: schedule?.period_id || 0,
      subject: schedule?.subject || '',
      class_name: schedule?.class_name || '',
      room_number: schedule?.room_number || '',
      date: schedule?.date || '',
      day_of_week: schedule?.day_of_week || 'monday',
      is_recurring: schedule?.is_recurring || false,
      schedule_type: schedule?.schedule_type || 'class',
      notes: schedule?.notes || '',
      is_active: schedule?.is_active !== undefined ? schedule.is_active : true,
    }
  });

  // Update the isRecurring state when the form field changes
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.is_recurring !== undefined) {
        setIsRecurring(value.is_recurring);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Reset the form when schedule prop changes
  useEffect(() => {
    reset({
      employee_id: schedule?.employee_id || 0,
      period_id: schedule?.period_id || 0,
      subject: schedule?.subject || '',
      class_name: schedule?.class_name || '',
      room_number: schedule?.room_number || '',
      date: !schedule?.is_recurring ? schedule?.date : undefined,
      day_of_week: schedule?.day_of_week || 'monday',
      is_recurring: schedule?.is_recurring || false,
      schedule_type: schedule?.schedule_type || 'class',
      notes: schedule?.notes || '',
      is_active: schedule?.is_active !== undefined ? schedule.is_active : true,
    });
    setIsRecurring(schedule?.is_recurring || false);
  }, [schedule, reset]);

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{schedule ? 'Edit Schedule' : 'Add New Schedule'}</CardTitle>
          <CardDescription>
            {schedule 
              ? 'Update the schedule details below' 
              : 'Enter the schedule details to assign a new class or duty'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Teacher *</Label>
              <Select 
                value={watch('employee_id')?.toString()} 
                onValueChange={(value) => setValue('employee_id', parseInt(value))}
              >
                <SelectTrigger disabled={employeesLoading}>
                  <SelectValue placeholder={employeesLoading ? "Loading teachers..." : "Select teacher"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employee_id && (
                <p className="text-sm text-destructive">{errors.employee_id.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="period_id">Period *</Label>
              <Select 
                value={watch('period_id')?.toString()} 
                onValueChange={(value) => setValue('period_id', parseInt(value))}
              >
                <SelectTrigger disabled={periodsLoading}>
                  <SelectValue placeholder={periodsLoading ? "Loading periods..." : "Select period"} />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period.id} value={period.id.toString()}>
                      {period.name} ({period.start_time} - {period.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.period_id && (
                <p className="text-sm text-destructive">{errors.period_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                {...register('subject')}
                placeholder="Enter subject name"
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="class_name">Class Name *</Label>
              <Input
                id="class_name"
                {...register('class_name')}
                placeholder="Enter class name"
              />
              {errors.class_name && (
                <p className="text-sm text-destructive">{errors.class_name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_number">Room Number</Label>
              <Input
                id="room_number"
                {...register('room_number')}
                placeholder="Enter room number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schedule_type">Schedule Type *</Label>
              <Select 
                value={watch('schedule_type')} 
                onValueChange={(value) => setValue('schedule_type', value as 'class' | 'meeting' | 'duty' | 'exam_supervision')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="duty">Duty</SelectItem>
                  <SelectItem value="exam_supervision">Exam Supervision</SelectItem>
                </SelectContent>
              </Select>
              {errors.schedule_type && (
                <p className="text-sm text-destructive">{errors.schedule_type.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_recurring"
                {...register('is_recurring')}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <Label htmlFor="is_recurring">Recurring Schedule</Label>
            </div>
          </div>

          {isRecurring ? (
            <div className="space-y-2">
              <Label htmlFor="day_of_week">Day of Week *</Label>
              <Select 
                value={watch('day_of_week')} 
                onValueChange={(value) => setValue('day_of_week', value as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map(day => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.day_of_week && (
                <p className="text-sm text-destructive">{errors.day_of_week.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                {...register('is_active')}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <Label htmlFor="is_active">Schedule is Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {schedule ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                schedule ? 'Update Schedule' : 'Create Schedule'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}