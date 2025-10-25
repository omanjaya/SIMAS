// src/types/school-calendar.ts
export interface SchoolCalendar {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  event_type: 'holiday' | 'event' | 'exam' | 'break' | 'other';
  color?: string;
  is_recurring: boolean;
  recurring_pattern?: 'yearly' | 'monthly' | 'weekly';
  recurring_interval?: number;
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolCalendarFormData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  event_type: 'holiday' | 'event' | 'exam' | 'break' | 'other';
  color?: string;
  is_recurring: boolean;
  recurring_pattern?: 'yearly' | 'monthly' | 'weekly';
  recurring_interval?: number;
  metadata?: Record<string, any>;
  is_active: boolean;
}