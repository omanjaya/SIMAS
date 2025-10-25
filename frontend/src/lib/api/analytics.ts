import apiClient from './client';

export const analyticsService = {
  async getAttendanceTrends(filters: any) {
    const params = new URLSearchParams({
      start_date: filters.startDate.toISOString().split('T')[0],
      end_date: filters.endDate.toISOString().split('T')[0],
      ...(filters.department && { department: filters.department }),
      group_by: filters.groupBy,
    });
    const response = await apiClient.get(`/analytics/attendance-trends?${params}`);
    return response.data;
  },

  async getOvertimeAnalysis(filters: any) {
    const params = new URLSearchParams({
      start_date: filters.startDate.toISOString().split('T')[0],
      end_date: filters.endDate.toISOString().split('T')[0],
      ...(filters.department && { department: filters.department }),
      ...(filters.employee_id && { employee_id: filters.employee_id.toString() }),
    });
    const response = await apiClient.get(`/analytics/overtime?${params}`);
    return response.data;
  },

  async getLeaveBalanceForecast(year: number, department?: string) {
    const params = new URLSearchParams({
      year: year.toString(),
      ...(department && { department }),
    });
    const response = await apiClient.get(`/analytics/leave-forecast?${params}`);
    return response.data;
  },

  async getPayrollCostAnalysis(filters: any) {
    const params = new URLSearchParams({
      start_date: filters.startDate.toISOString().split('T')[0],
      end_date: filters.endDate.toISOString().split('T')[0],
      ...(filters.department && { department: filters.department }),
      group_by: filters.groupBy,
    });
    const response = await apiClient.get(`/analytics/payroll-cost?${params}`);
    return response.data;
  },
};