// src/components/auth/auth-guard.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { hasPermission } from '@/lib/utils/access-control';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'employee';
  fallbackPath?: string;
  redirectToLogin?: boolean;
}

export default function AuthGuard({ 
  children, 
  requiredRole,
  fallbackPath = '/login',
  redirectToLogin = true 
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        if (redirectToLogin) {
          router.push(fallbackPath);
        }
        return;
      }

      // Check role-based access if required
      if (requiredRole && user?.role !== requiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, fallbackPath, redirectToLogin]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Memeriksa otorisasi...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and we're not redirecting, show access denied
  if (!isAuthenticated && !redirectToLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Akses Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Anda harus login untuk mengakses halaman ini.</p>
            <Button onClick={() => router.push('/login')}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authenticated but wrong role, show unauthorized
  if (isAuthenticated && requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Tidak Diizinkan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If all checks pass, render the children
  return <>{children}</>;
}