// src/lib/api/periods.ts
import { BaseService } from './base-service';
import { Period, PeriodFormData } from '@/types/periods';
import apiClient from './client';

interface PeriodPaginatedResponse {
  data: Period[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

class PeriodService extends BaseService<Period, PeriodFormData> {
  constructor() {
    super('/periods');
  }

  async getPeriods(filters?: {
    is_active?: boolean;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PeriodPaginatedResponse> {
    const response = await apiClient.get<PeriodPaginatedResponse>(this.basePath, { params: filters });
    return response.data;
  }

  async getActivePeriods(): Promise<Period[]> {
    const response = await apiClient.get<Period[]>(`${this.basePath}?is_active=true`);
    return response.data;
  }

  async toggleStatus(id: number, isActive: boolean): Promise<Period> {
    const response = await apiClient.patch<Period>(`${this.basePath}/${id}`, { is_active: isActive });
    return response.data;
  }
}

export const periodService = new PeriodService();