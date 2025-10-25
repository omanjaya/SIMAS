// src/lib/api/school-calendar.ts
import { BaseService } from './base-service';
import { SchoolCalendar, SchoolCalendarFormData } from '@/types/school-calendar';
import apiClient from './client';

interface SchoolCalendarPaginatedResponse {
  data: SchoolCalendar[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

class SchoolCalendarService extends BaseService<SchoolCalendar, SchoolCalendarFormData> {
  constructor() {
    super('/school-calendars');
  }

  async getEvents(filters?: {
    start_date?: string;
    end_date?: string;
    event_type?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<SchoolCalendarPaginatedResponse> {
    const response = await apiClient.get<SchoolCalendarPaginatedResponse>(this.basePath, { params: filters });
    return response.data;
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<SchoolCalendar[]> {
    const response = await apiClient.get<SchoolCalendar[]>(`${this.basePath}?start_date=${startDate}&end_date=${endDate}`);
    return response.data;
  }

  async getUpcomingEvents(limit: number = 10): Promise<SchoolCalendar[]> {
    const response = await apiClient.get<SchoolCalendar[]>(`${this.basePath}?limit=${limit}&upcoming=true`);
    return response.data;
  }

  async toggleStatus(id: number, isActive: boolean): Promise<SchoolCalendar> {
    const response = await apiClient.patch<SchoolCalendar>(`${this.basePath}/${id}`, { is_active: isActive });
    return response.data;
  }

  async getEventsByType(eventType: string): Promise<SchoolCalendar[]> {
    const response = await apiClient.get<SchoolCalendar[]>(`${this.basePath}?event_type=${eventType}`);
    return response.data;
  }
}

export const schoolCalendarService = new SchoolCalendarService();