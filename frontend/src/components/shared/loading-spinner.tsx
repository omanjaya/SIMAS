// src/components/shared/loading-spinner.tsx
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export function LoadingSpinner({ size = 'md', className = '', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  };

  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-t-2 border-r-2 border-b-2 border-l-transparent',
        sizeClasses[size],
        className
      )}
    />
  );

  if (message) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        {spinner}
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  return spinner;
}