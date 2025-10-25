// src/types/auth.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'employee';
  phone?: string;
  address?: string;
  last_login_at?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}