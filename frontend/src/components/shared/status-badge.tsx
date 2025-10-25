// src/components/shared/status-badge.tsx
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  icon?: boolean;
}

export function StatusBadge({ status, variant = 'default', icon = true }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; icon: ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    // General Statuses
    active: {
      label: 'Active',
      icon: <CheckCircle className="h-3 w-3" />,
      variant: 'default'
    },
    inactive: {
      label: 'Inactive',
      icon: <XCircle className="h-3 w-3" />,
      variant: 'secondary'
    },
    pending: {
      label: 'Pending',
      icon: <Clock className="h-3 w-3" />,
      variant: 'secondary'
    },
    approved: {
      label: 'Approved',
      icon: <CheckCircle className="h-3 w-3" />,
      variant: 'default'
    },
    rejected: {
      label: 'Rejected',
      icon: <XCircle className="h-3 w-3" />,
      variant: 'destructive'
    },
    cancelled: {
      label: 'Cancelled',
      icon: <XCircle className="h-3 w-3" />,
      variant: 'outline'
    },
    present: {
      label: 'Present',
      icon: <CheckCircle className="h-3 w-3" />,
      variant: 'default'
    },
    absent: {
      label: 'Absent',
      icon: <XCircle className="h-3 w-3" />,
      variant: 'destructive'
    },
    late: {
      label: 'Late',
      icon: <Clock className="h-3 w-3" />,
      variant: 'secondary'
    },
    half_day: {
      label: 'Half Day',
      icon: <AlertTriangle className="h-3 w-3" />,
      variant: 'secondary'
    },
    // Leave Request Statuses
    sick: {
      label: 'Sick',
      icon: <AlertTriangle className="h-3 w-3" />,
      variant: 'destructive'
    },
    annual: {
      label: 'Annual',
      icon: <CheckCircle className="h-3 w-3" />,
      variant: 'default'
    },
    emergency: {
      label: 'Emergency',
      icon: <AlertTriangle className="h-3 w-3" />,
      variant: 'destructive'
    },
    personal: {
      label: 'Personal',
      icon: <AlertTriangle className="h-3 w-3" />,
      variant: 'secondary'
    },
    maternity: {
      label: 'Maternity',
      icon: <AlertTriangle className="h-3 w-3" />,
      variant: 'secondary'
    },
    paternity: {
      label: 'Paternity',
      icon: <AlertTriangle className="h-3 w-3" />,
      variant: 'secondary'
    },
    unpaid: {
      label: 'Unpaid',
      icon: <XCircle className="h-3 w-3" />,
      variant: 'outline'
    },
    // Employment Types
    'full-time': {
      label: 'Full-time',
      icon: <CheckCircle className="h-3 w-3" />,
      variant: 'default'
    },
    'part-time': {
      label: 'Part-time',
      icon: <Clock className="h-3 w-3" />,
      variant: 'secondary'
    },
    contract: {
      label: 'Contract',
      icon: <AlertTriangle className="h-3 w-3" />,
      variant: 'outline'
    },
    intern: {
      label: 'Intern',
      icon: <AlertTriangle className="h-3 w-3" />,
      variant: 'outline'
    },
    terminated: {
      label: 'Terminated',
      icon: <XCircle className="h-3 w-3" />,
      variant: 'destructive'
    },
  };

  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    icon: <CheckCircle className="h-3 w-3" />,
    variant: variant
  };

  return (
    <Badge variant={config.variant} className="items-center gap-1">
      {icon && config.icon}
      {config.label}
    </Badge>
  );
}