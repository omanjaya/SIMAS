// src/lib/api/schedules.ts
import { BaseService } from './base-service';
import { TeacherSchedule, TeacherScheduleFormData } from '@/types/schedules';
import apiClient from './client';

interface SchedulePaginatedResponse {
  data: TeacherSchedule[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

class ScheduleService extends BaseService<TeacherSchedule, TeacherScheduleFormData> {
  constructor() {
    super('/teacher-schedules');
  }

  async getSchedules(filters?: {
    employee_id?: number;
    period_id?: number;
    day_of_week?: string;
    date?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<SchedulePaginatedResponse> {
    const response = await apiClient.get<SchedulePaginatedResponse>(this.basePath, { params: filters });
    return response.data;
  }

  async getSchedulesByEmployee(employeeId: number): Promise<TeacherSchedule[]> {
    const response = await apiClient.get<TeacherSchedule[]>(`${this.basePath}?employee_id=${employeeId}`);
    return response.data;
  }

  async getSchedulesByPeriod(periodId: number): Promise<TeacherSchedule[]> {
    const response = await apiClient.get<TeacherSchedule[]>(`${this.basePath}?period_id=${periodId}`);
    return response.data;
  }

  async getWeeklySchedule(date: string): Promise<TeacherSchedule[]> {
    const response = await apiClient.get<TeacherSchedule[]>(`${this.basePath}?date=${date}`);
    return response.data;
  }

  async toggleStatus(id: number, isActive: boolean): Promise<TeacherSchedule> {
    const response = await apiClient.patch<TeacherSchedule>(`${this.basePath}/${id}`, { is_active: isActive });
    return response.data;
  }
}

export const scheduleService = new ScheduleService();