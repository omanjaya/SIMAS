// src/lib/api/payroll.ts
import { BaseService } from './base-service';
import { PayrollApproval, PayrollFormData, PayrollSummary, PayrollFilter } from '@/types/payroll';
import apiClient from './client';

class PayrollService extends BaseService<PayrollApproval, any> {
  constructor() {
    super('/payroll-approvals');
  }

  // Get all payroll approvals with filters
  async getAll(filters?: PayrollFilter): Promise<{ data: PayrollApproval[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await apiClient.get(`${this.basePath}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get a single payroll approval
  async getById(id: number): Promise<PayrollApproval> {
    const response = await apiClient.get<PayrollApproval>(`${this.basePath}/${id}`);
    return response.data;
  }

  // Approve a payroll
  async approve(id: number, data: { notes?: string }): Promise<PayrollApproval> {
    const response = await apiClient.post<PayrollApproval>(`${this.basePath}/${id}/approve`, data);
    return response.data;
  }

  // Reject a payroll
  async reject(id: number, data: { rejection_reason: string; notes?: string }): Promise<PayrollApproval> {
    const response = await apiClient.post<PayrollApproval>(`${this.basePath}/${id}/reject`, data);
    return response.data;
  }

  // Generate bulk payroll
  async generateBulk(data: PayrollFormData): Promise<any> {
    const response = await apiClient.post('/payroll/generate-bulk', data);
    return response.data;
  }

  // Get payroll summary
  async getSummary(year: number, month: number): Promise<PayrollSummary> {
    const response = await apiClient.get<PayrollSummary>(`/payroll/summary?year=${year}&month=${month}`);
    return response.data;
  }

  // Send payslip to employee
  async sendPayslip(id: number): Promise<any> {
    const response = await apiClient.post(`${this.basePath}/${id}/send-payslip`);
    return response.data;
  }

  // Bulk approve payrolls
  async bulkApprove(approvalIds: number[], notes?: string): Promise<any> {
    const response = await apiClient.post('/payroll-approvals/bulk-approve', {
      approval_ids: approvalIds,
      notes
    });
    return response.data;
  }

  // Bulk send payslips
  async bulkSendPayslips(approvalIds: number[]): Promise<any> {
    const response = await apiClient.post('/payroll-approvals/bulk-send-payslips', {
      approval_ids: approvalIds
    });
    return response.data;
  }

  // Export payroll data
  async exportPayroll(year: number, month: number, department?: string): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('year', year.toString());
    params.append('month', month.toString());
    
    if (department) {
      params.append('department', department);
    }

    const response = await apiClient.get(`/payroll/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const payrollService = new PayrollService();