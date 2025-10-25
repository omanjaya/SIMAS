// src/types/leave-requests.ts
export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee?: {
    first_name: string;
    last_name: string;
    employee_code: string;
  };
  leave_type: 'sick' | 'annual' | 'emergency' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  is_paid: boolean;
  attachments?: string[];
  admin_notes?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequestFormData {
  employee_id: number;
  leave_type: 'sick' | 'annual' | 'emergency' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
  start_date: string;
  end_date: string;
  reason: string;
  is_paid: boolean;
  attachments?: string[];
}

export interface LeaveRequestApprovalData {
  status: 'approved' | 'rejected';
  admin_notes?: string;
  rejection_reason?: string;
}