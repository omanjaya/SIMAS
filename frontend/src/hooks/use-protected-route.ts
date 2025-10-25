// src/hooks/use-protected-route.ts
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useProtectedRoute(requiredRole?: 'admin' | 'teacher' | 'employee', fallbackUrl: string = '/login') {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push(fallbackUrl);
        return;
      }

      // If a specific role is required, check if the user has that role
      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        switch(user?.role) {
          case 'admin':
            router.push('/dashboard');
            break;
          case 'teacher':
            router.push('/attendance');
            break;
          case 'employee':
            router.push('/attendance');
            break;
          default:
            router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, user, router, fallbackUrl]);

  return { user, isAuthenticated, isLoading };
}
