// src/types/attendance.ts
export interface Attendance {
  id: number;
  employee_id: number;
  employee?: {
    first_name: string;
    last_name: string;
    employee_code: string;
  };
  period_id?: number;
  check_in_time: string;
  check_out_time?: string;
  attendance_type: 'manual' | 'face_recognition' | 'rfid';
  check_in_location?: string;
  check_out_location?: string;
  check_in_image_path?: string;
  check_out_image_path?: string;
  confidence_score?: number;
  biometric_data?: any;
  status: 'present' | 'late' | 'half_day' | 'absent';
  is_late: boolean;
  is_early_departure: boolean;
  overtime_minutes: number;
  undertime_minutes: number;
  notes?: string;
  verified_by?: number;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClockInOutData {
  employee_id: number;
  period_id?: number;
  attendance_type: 'manual' | 'face_recognition' | 'rfid';
  check_in_location?: string;
  check_out_location?: string;
  confidence_score?: number;
  biometric_data?: any;
}