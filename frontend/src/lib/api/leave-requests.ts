// src/lib/api/leave-requests.ts
import { BaseService } from './base-service';
import { LeaveRequest, LeaveRequestFormData, LeaveRequestApprovalData } from '@/types/leave-requests';
import apiClient from './client';

interface LeaveRequestPaginatedResponse {
  data: LeaveRequest[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

class LeaveRequestService extends BaseService<LeaveRequest, LeaveRequestFormData> {
  constructor() {
    super('/leave-requests');
  }

  async getLeaveRequests(filters?: {
    status?: string;
    employee_id?: number;
    search?: string;
    page?: number;
    per_page?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<LeaveRequestPaginatedResponse> {
    const response = await apiClient.get<LeaveRequestPaginatedResponse>(this.basePath, { params: filters });
    return response.data;
  }

  async getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]> {
    const response = await apiClient.get<LeaveRequest[]>(`${this.basePath}?employee_id=${employeeId}`);
    return response.data;
  }

  async getLeaveRequestsByStatus(status: string): Promise<LeaveRequest[]> {
    const response = await apiClient.get<LeaveRequest[]>(`${this.basePath}?status=${status}`);
    return response.data;
  }

  async approve(id: number, data: LeaveRequestApprovalData): Promise<LeaveRequest> {
    const response = await apiClient.put<LeaveRequest>(`${this.basePath}/${id}/approve`, data);
    return response.data;
  }

  async reject(id: number, data: LeaveRequestApprovalData): Promise<LeaveRequest> {
    const response = await apiClient.put<LeaveRequest>(`${this.basePath}/${id}/reject`, data);
    return response.data;
  }

  async cancel(id: number): Promise<LeaveRequest> {
    const response = await apiClient.put<LeaveRequest>(`${this.basePath}/${id}/cancel`);
    return response.data;
  }
}

export const leaveRequestService = new LeaveRequestService();