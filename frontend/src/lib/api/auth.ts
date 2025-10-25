// src/lib/api/auth.ts
import apiClient from './client';
import { User } from '@/types/auth';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface RegisterResponse {
  message: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/login', credentials);
    const { token, user } = response.data;
    
    // Store token in localStorage
    apiClient.setToken(token);
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token regardless of server response
      apiClient.clearAuth();
    }
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/dashboard/users', userData);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/profile', data);
    return response.data;
  },

  async changePassword(data: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>('/profile/password', data);
    return response.data;
  },
};