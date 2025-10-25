// src/components/auth/role-guard.tsx
'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import { hasRole, hasAnyRole } from '@/lib/utils/access-control';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('admin' | 'teacher' | 'employee')[];
  fallback?: ReactNode;
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleGuardProps) {
  const { user } = useAuth();
  const hasAccess = user && hasAnyRole(user, allowedRoles);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}