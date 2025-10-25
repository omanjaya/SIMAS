// src/lib/api/employees.ts
import { BaseService } from './base-service';
import { Employee, EmployeeFormData } from '@/types/employees';
import apiClient from './client';

interface EmployeeStats {
  total_active: number;
  total_active_trend: number;
  total_teachers: number;
  total_teachers_trend: number;
  total_staff: number;
  total_staff_trend: number;
  on_leave_today: number;
  on_leave_today_trend: number;
  last_updated: string;
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterOptionsResponse {
  positions: FilterOption[];
  departments: FilterOption[];
  statuses?: string[];
}

class EmployeeService extends BaseService<Employee, EmployeeFormData> {
  constructor() {
    super('/employees');
  }

  async getById(id: number): Promise<Employee> {
    const response = await apiClient.get<{ data: Employee }>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  async create(data: EmployeeFormData): Promise<Employee> {
    const response = await apiClient.post<{ data: Employee }>(this.basePath, data);
    return response.data.data;
  }

  async getEmployees(filters?: {
    status?: string;
    department?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: Employee[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }> {
    const response = await apiClient.get<{ 
      data: Employee[]; 
      current_page: number; 
      last_page: number; 
      per_page: number; 
      total: number 
    }>(this.basePath, { params: filters });
    return response.data;
  }

  async getStats(): Promise<EmployeeStats> {
    const response = await apiClient.get<{ data: EmployeeStats }>(`${this.basePath}/stats`);
    return response.data.data;
  }

  async getFilterOptions(): Promise<FilterOptionsResponse> {
    const response = await apiClient.get<{ data: FilterOptionsResponse }>(`${this.basePath}/filter-options`);
    return response.data.data;
  }

  async checkDuplicates(emails: string[]): Promise<string[]> {
    const response = await apiClient.post<{
      success: boolean;
      data: { duplicates: string[] };
    }>(`${this.basePath}/check-duplicates`, { emails });
    return response.data.data.duplicates;
  }

  async checkDuplicateCodes(codes: string[]): Promise<string[]> {
    const response = await apiClient.post<{
      success: boolean;
      data: { duplicates: string[] };
    }>(`${this.basePath}/check-duplicate-codes`, { codes });
    return response.data.data.duplicates;
  }

  async update(id: number, data: Partial<EmployeeFormData>): Promise<Employee> {
    const response = await apiClient.put<{ data: Employee }>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  async activate(id: number): Promise<Employee> {
    const response = await apiClient.patch<{
      success: boolean;
      data: Employee;
    }>(`${this.basePath}/${id}/activate`);
    return response.data.data;
  }

  async deactivate(id: number): Promise<Employee> {
    const response = await apiClient.patch<{
      success: boolean;
      data: Employee;
    }>(`${this.basePath}/${id}/deactivate`);
    return response.data.data;
  }
}

export const employeeService = new EmployeeService();
