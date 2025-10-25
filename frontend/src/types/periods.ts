// src/types/periods.ts
export interface Period {
  id: number;
  name: string;
  start_time: string; // Format: HH:MM:SS
  end_time: string; // Format: HH:MM:SS
  code: string;
  description?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PeriodFormData {
  name: string;
  start_time: string;
  end_time: string;
  code: string;
  description?: string;
  order: number;
  is_active: boolean;
}