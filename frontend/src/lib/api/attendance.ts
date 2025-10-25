// src/lib/api/attendance.ts
import { BaseService } from './base-service';
import { Attendance, ClockInOutData } from '@/types/attendance';
import apiClient from './client';

interface AttendancePaginatedResponse {
  data: Attendance[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface LeaveData {
  annual: number;
  sick: number;
  official_duty: number;
  permission: number;
  total: number;
}

export interface MonthlySummaryResponse {
  success: boolean;
  data: {
    month: number;
    year: number;
    summary: {
      total_days: number;
      working_days: number;
      weekends: number;
      present: number;
      absent: number;
      late: number;
      on_time: number;
      leaves: LeaveData;
      attendance_rate: number;
    };
    daily: Array<{
      date: string;
      day_of_week: number;
      day_name: string;
      has_attendance: boolean;
      status: string;
      leave_type: string | null;
      clock_in_time: string | null;
      clock_out_time: string | null;
    }>;
  };
}

class AttendanceService extends BaseService<Attendance, ClockInOutData> {
  constructor() {
    super('/attendances');
  }

  async getAttendances(filters?: {
    date?: string;
    employee_id?: number;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<AttendancePaginatedResponse> {
    const response = await apiClient.get<AttendancePaginatedResponse>(this.basePath, { params: filters });
    return response.data;
  }

  async getAttendanceByEmployee(employeeId: number, startDate?: string, endDate?: string): Promise<Attendance[]> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await apiClient.get<Attendance[]>(`${this.basePath}?employee_id=${employeeId}`, { params });
    return response.data;
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    const response = await apiClient.get<Attendance[]>(`${this.basePath}?date=${date}`);
    return response.data;
  }

  async clockIn(data: ClockInOutData): Promise<Attendance> {
    const response = await apiClient.post<Attendance>('/clock-in', data);
    return response.data;
  }

  async clockOut(data: ClockInOutData): Promise<Attendance> {
    const response = await apiClient.post<Attendance>('/clock-out', data);
    return response.data;
  }

  async getTodayAttendance(employeeId: number): Promise<Attendance | null> {
    try {
      const response = await apiClient.get<Attendance>(`${this.basePath}/today/${employeeId}`);
      return response.data;
    } catch (error) {
      // If no attendance record for today, return null
      return null;
    }
  }

  async list(params?: { page?: number; per_page?: number }): Promise<AttendancePaginatedResponse> {
    const response = await apiClient.get<AttendancePaginatedResponse>('/my/attendance', { params });
    return response.data;
  }

  async monthlySummary(
    month: number,
    year?: number
  ): Promise<MonthlySummaryResponse['data']> {
    const response = await apiClient.get<MonthlySummaryResponse>(
      `/my/attendance/summary/${month}`,
      { params: { year } }
    );
    return response.data.data;
  }
}

export const attendanceService = new AttendanceService();