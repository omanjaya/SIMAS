// src/types/payroll.ts

export interface PayrollApproval {
  id: number;
  employee_id: number;
  employee?: {
    id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    position?: string;
    department?: string;
  };
  period_year: number;
  period_month: number;
  payroll_data: {
    base_salary: number;
    allowances: number;
    deductions: number;
    net_salary: number;
    attendance_summary?: {
      days_present: number;
      days_absent: number;
      days_late: number;
      total_hours: number;
    };
    salary_breakdown?: Array<{
      component: string;
      amount: number;
      type: 'earning' | 'deduction';
    }>;
  };
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollFormData {
  year: number;
  month: number;
  employee_ids?: number[];
}

export interface PayrollSummary {
  total_employees: number;
  total_gross_payroll: number;
  total_deductions: number;
  total_net_payroll: number;
  approved_payrolls: number;
  pending_payrolls: number;
  rejected_payrolls: number;
  average_salary: number;
}

export interface PayrollFilter {
  status?: 'pending' | 'approved' | 'rejected';
  year?: number;
  month?: number;
  employee_id?: number;
  search?: string;
}