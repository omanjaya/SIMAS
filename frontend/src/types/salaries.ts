// src/types/salaries.ts
export interface Salary {
  id: number;
  employee_id: number;
  employee?: {
    first_name: string;
    last_name: string;
    employee_code: string;
    position: string;
  };
  base_salary: number;
  salary_type: 'hourly' | 'monthly';
  hourly_rate?: number;
  monthly_hours?: number;
  overtime_rate?: number;
  bonuses?: number;
  deductions?: number;
  allowances?: Record<string, any>;
  tax_components?: Record<string, any>;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
  pay_grade?: string;
  notes?: string;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface SalaryFormData {
  employee_id: number;
  base_salary: number;
  salary_type: 'hourly' | 'monthly';
  hourly_rate?: number;
  monthly_hours?: number;
  overtime_rate?: number;
  bonuses?: number;
  deductions?: number;
  allowances?: Record<string, any>;
  tax_components?: Record<string, any>;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
  pay_grade?: string;
  notes?: string;
  updated_by?: number;
}