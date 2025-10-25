// src/lib/api/salaries.ts
import { BaseService } from './base-service';
import { Salary, SalaryFormData } from '@/types/salaries';
import apiClient from './client';

class SalaryService extends BaseService<Salary, SalaryFormData> {
  constructor() {
    super('/salaries');
  }

  async getSalaryByEmployee(employeeId: number): Promise<Salary[]> {
    const response = await apiClient.get<Salary[]>(`${this.basePath}?employee_id=${employeeId}`);
    return response.data;
  }

  async getCurrentSalary(employeeId: number): Promise<Salary | null> {
    try {
      const response = await apiClient.get<Salary>(`${this.basePath}/current/${employeeId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async toggleStatus(id: number, isActive: boolean): Promise<Salary> {
    const response = await apiClient.patch<Salary>(`${this.basePath}/${id}`, { is_active: isActive });
    return response.data;
  }

  async calculatePayroll(employeeId: number, month: number, year: number): Promise<any> {
    const response = await apiClient.get<any>(`${this.basePath}/calculate/${employeeId}?month=${month}&year=${year}`);
    return response.data;
  }

  async exportPayroll(month: number, year: number): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/payroll/export?month=${month}&year=${year}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const salaryService = new SalaryService();