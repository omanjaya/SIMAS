// src/types/employees.ts
export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  position?: string;
  department?: string;
  hire_date: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'intern';
  salary?: number;
  salary_type: 'hourly' | 'monthly';
  emergency_contact?: string;
  profile_image?: string;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'suspended';
  user_id?: number;
  created_at: string;
  faceTemplate?: any; // For biometric status
  updated_at: string;
  deleted_at?: string;
}

export interface EmployeeFormData {
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  position?: string;
  department?: string;
  hire_date: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'intern';
  salary?: number;
  salary_type: 'hourly' | 'monthly';
  emergency_contact?: string;
  profile_image?: string;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'suspended';
  user_id?: number;
  faceTemplate?: any; // For biometric status
}