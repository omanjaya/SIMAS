// src/components/auth/protected-wrapper.tsx
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedWrapperProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'employee';
  fallbackUrl?: string;
}

export function ProtectedWrapper({ 
  children, 
  requiredRole, 
  fallbackUrl = '/login' 
}: ProtectedWrapperProps) {
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
        router.push('/dashboard'); // Redirect to default dashboard if not authorized
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, user, router, fallbackUrl]);

  // Show a loading state while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated or role is not allowed, don't render children
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  // Render children if user is authenticated and has required role (or no role required)
  return <>{children}</>;
}