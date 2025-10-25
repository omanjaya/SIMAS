import apiClient from './client';

// ============ INTERFACES ============

export interface AttendanceCorrection {
  id: number;
  attendance_id: number;
  employee_id: number;
  requested_by: number;
  reviewed_by: number | null;
  correction_type: 'clock_in' | 'clock_out' | 'both';
  original_clock_in_time: string | null;
  original_clock_out_time: string | null;
  new_clock_in_time: string | null;
  new_clock_out_time: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  requested_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  attendance?: {
    id: number;
    clock_in_time: string;
    clock_out_time: string | null;
    status: string;
  };
  employee?: {
    id: number;
    full_name: string;
    employee_code: string;
  };
  requestedBy?: {
    id: number;
    name: string;
    email: string;
  };
  reviewedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface CreateCorrectionData {
  attendance_id: number;
  correction_type: 'clock_in' | 'clock_out' | 'both';
  new_clock_in_time?: string;
  new_clock_out_time?: string;
  reason: string;
}

export interface ListCorrectionsResponse {
  success: boolean;
  data: {
    current_page: number;
    data: AttendanceCorrection[];
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CorrectionResponse {
  success: boolean;
  message?: string;
  data: AttendanceCorrection;
}

export interface DeleteCorrectionResponse {
  success: boolean;
  message: string;
}

// ============ SERVICE CLASS ============

class AttendanceCorrectionService {
  /**
   * List all corrections (with optional filters)
   */
  async list(params?: {
    status?: 'pending' | 'approved' | 'rejected';
    per_page?: number;
    page?: number;
  }): Promise<ListCorrectionsResponse['data']> {
    const response = await apiClient.get<ListCorrectionsResponse>(
      '/my/attendance-corrections',
      { params }
    );
    return response.data.data;
  }

  /**
   * Get specific correction by ID
   */
  async getById(id: number): Promise<AttendanceCorrection> {
    const response = await apiClient.get<CorrectionResponse>(
      `/my/attendance-corrections/${id}`
    );
    return response.data.data;
  }

  /**
   * Create new correction request
   */
  async create(data: CreateCorrectionData): Promise<CorrectionResponse> {
    const response = await apiClient.post<CorrectionResponse>(
      '/my/attendance-corrections',
      data
    );
    return response.data;
  }

  /**
   * Delete pending correction
   */
  async delete(id: number): Promise<DeleteCorrectionResponse> {
    const response = await apiClient.delete<DeleteCorrectionResponse>(
      `/my/attendance-corrections/${id}`
    );
    return response.data;
  }

  /**
   * Get pending corrections count
   */
  async getPendingCount(): Promise<number> {
    const response = await this.list({ status: 'pending', per_page: 1 });
    return response.total;
  }
}

// ============ EXPORT ============

export const attendanceCorrectionService = new AttendanceCorrectionService();
export default attendanceCorrectionService;
