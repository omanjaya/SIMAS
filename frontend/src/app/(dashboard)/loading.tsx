// src/app/(dashboard)/loading.tsx
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
}