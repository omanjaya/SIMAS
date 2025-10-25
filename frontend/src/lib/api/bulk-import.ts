// src/lib/api/bulk-import.ts

import { BulkImportResponse, BulkImportHistory } from '@/types/bulk-import';
import apiClient from './client';

export const bulkImportService = {
  // Import employees from CSV file
  importEmployees: async (file: File): Promise<BulkImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: {
          total: number;
          success: number;
          failed: number;
          errors: Array<{ row: number; email: string; message: string; }>;
        };
      }>('/employees/bulk-import', formData);
      // Don't set Content-Type header when using FormData - browser sets it with correct boundary

      const data = response.data.data;

      return {
        total: data.total,
        success: data.success,
        failed: data.failed,
        results: data.errors?.map((error, index) => ({
          id: index + 1,
          employee_code: error.email || `EMP${index + 1}`,
          first_name: '',
          last_name: '',
          email: error.email || '',
          phone: '',
          position: '',
          department: '',
          status: 'error' as const,
          message: error.message || 'Error during import',
          row_number: error.row || 0
        })) || []
      };
    } catch (error: any) {
      console.error('Import error:', error);
      console.error('Response data:', error.response?.data);

      // If backend returned error with data structure
      if (error.response?.data) {
        const errorData = error.response.data;

        // Return the error in the expected format
        return {
          total: errorData.data?.total || 0,
          success: 0,
          failed: errorData.data?.failed || 0,
          results: errorData.data?.errors?.map((err: any, index: number) => ({
            id: index + 1,
            employee_code: '',
            first_name: '',
            last_name: '',
            email: err.email || 'N/A',
            phone: '',
            position: '',
            department: '',
            status: 'error' as const,
            message: err.message || errorData.message || 'Import failed',
            row_number: err.row || 0
          })) || [{
            id: 1,
            employee_code: '',
            first_name: '',
            last_name: '',
            email: 'N/A',
            phone: '',
            position: '',
            department: '',
            status: 'error' as const,
            message: errorData.message || 'Import failed',
            row_number: 1
          }]
        };
      }

      throw error;
    }
  },

  // Get import history
  getImportHistory: async (): Promise<BulkImportHistory[]> => {
    // Currently, this endpoint may not exist in the backend
    // If backend doesn't have this endpoint, we can return empty array or implement it later
    // For now, we'll return an empty array since the backend doesn't have import history endpoint
    return [];
  },

  // Download simplified template (4 columns: full_name, email, hire_date, role)
  downloadTemplate: async (): Promise<Blob> => {
    const response = await apiClient.get<Blob>('/employees/simplified-template', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Check duplicates
  checkDuplicates: async (emails: string[]): Promise<string[]> => {
    const response = await apiClient.post<{
      success: boolean;
      data: { duplicates: string[] };
    }>('/employees/check-duplicates', { emails });
    return response.data.data.duplicates;
  },

  // Export import results to CSV
  exportResultsToCSV: async (results: BulkImportResponse): Promise<Blob> => {
    const csvContent = [
      ['employee_code', 'first_name', 'last_name', 'email', 'status', 'message', 'row_number'],
      ...results.results.map(result => [
        result.employee_code,
        result.first_name,
        result.last_name,
        result.email,
        result.status,
        result.message,
        result.row_number
      ])
    ]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  },

  // Export import history to CSV
  exportHistoryToCSV: async (history: BulkImportHistory[]): Promise<Blob> => {
    const csvContent = [
      ['id', 'filename', 'total_records', 'success_count', 'failed_count', 'status', 'created_at', 'user_name'],
      ...history.map(item => [
        item.id,
        item.filename,
        item.total_records,
        item.success_count,
        item.failed_count,
        item.status,
        item.created_at,
        item.user_name
      ])
    ]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }
};