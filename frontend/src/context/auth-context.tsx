// src/context/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { User } from '@/types/auth';
import apiClient from '@/lib/api/client';
import { authService } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check on public routes
    const publicRoutes = ['/login', '/signup', '/'];
    if (publicRoutes.includes(pathname)) {
      setIsLoading(false);
      return;
    }

    // Check if user is already authenticated on mount
    checkAuthStatus();
  }, [pathname]);

  const checkAuthStatus = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error: any) {
      // If there's a 401 error, it means token is invalid/expired, which is expected when not logged in
      // For other errors, we might want to log them for debugging
      if (error?.response?.status !== 401) {
        console.error('Error checking auth status:', error);
      }
      // Clear any existing auth data
      apiClient.clearAuth();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const register = async (data: { name: string; email: string; password: string; password_confirmation: string }) => {
    try {
      await authService.register(data);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}