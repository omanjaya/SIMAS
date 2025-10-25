// src/components/auth/with-auth.tsx
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';

interface WithAuthProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'employee';
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: { requiredRole?: 'admin' | 'teacher' | 'employee' } = {}
) {
  const WithAuthWrapper = (props: P & WithAuthProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    // Check role if required
    useEffect(() => {
      if (
        !isLoading &&
        isAuthenticated &&
        options.requiredRole &&
        user?.role !== options.requiredRole
      ) {
        // Redirect based on user role
        switch (user?.role) {
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
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    // Role check
    if (options.requiredRole && user?.role !== options.requiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthWrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthWrapper;
}
