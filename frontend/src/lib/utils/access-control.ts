// src/lib/utils/access-control.ts

import { User } from '@/types/auth';

// Define role-based access levels
export type Role = 'admin' | 'teacher' | 'employee';

// Define resource-based permissions
export interface Permissions {
  [key: string]: Role[];
}

// Define resource permissions matrix
const PERMISSIONS: Permissions = {
  // Admin-only resources
  '/users': ['admin'],
  '/users/new': ['admin'],
  '/users/[id]': ['admin'],
  '/users/[id]/edit': ['admin'],
  '/users/bulk-import': ['admin'],
  '/users/import-history': ['admin'],
  '/users/import-history/[id]': ['admin'],
  '/periods': ['admin'],
  '/periods/new': ['admin'],
  '/schedules': ['admin'],
  '/schedules/new': ['admin'],
  '/leave-requests': ['admin'],
  '/bulk-import': ['admin'],
  '/settings': ['admin'],
  '/audit-logs': ['admin'],
  '/developers/api-keys': ['admin'],
  '/developers/events-&-logs': ['admin'],
  '/developers/webhooks': ['admin'],
  '/developers/webhooks/[id]': ['admin'],
  '/developers/overview': ['admin'],
  '/school-calendar/new': ['admin'],
  
  // Teacher-accessible resources
  '/attendance': ['admin', 'teacher', 'employee'],
  '/school-calendar': ['admin', 'teacher', 'employee'],
  '/reports': ['admin', 'teacher', 'employee'],
};

// Check if user has permission for a specific resource
export const hasPermission = (user: User | null, resource: string): boolean => {
  if (!user) return false;
  
  const requiredRoles = PERMISSIONS[resource];
  if (!requiredRoles) {
    // If no specific permission is defined, allow access (default to open)
    return true;
  }
  
  return requiredRoles.includes(user.role);
};

// Check if user has a specific role
export const hasRole = (user: User | null, role: Role): boolean => {
  if (!user) return false;
  return user.role === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (user: User | null, roles: Role[]): boolean => {
  if (!user) return false;
  return roles.some(role => user.role === role);
};

// Get available routes for user based on role
export const getUserRoutes = (user: User | null): string[] => {
  if (!user) return [];
  
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => roles.includes(user.role))
    .map(([route, _]) => route);
};
