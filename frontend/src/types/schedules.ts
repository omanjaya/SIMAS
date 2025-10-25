// src/types/schedules.ts
export interface TeacherSchedule {
  id: number;
  employee_id: number;
  period_id: number;
  subject: string;
  class_name: string;
  room_number?: string;
  date?: string;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  is_recurring: boolean;
  schedule_type: 'class' | 'meeting' | 'duty' | 'exam_supervision';
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherScheduleFormData {
  employee_id: number;
  period_id: number;
  subject: string;
  class_name: string;
  room_number?: string;
  date?: string;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  is_recurring: boolean;
  schedule_type: 'class' | 'meeting' | 'duty' | 'exam_supervision';
  notes?: string;
  is_active: boolean;
}