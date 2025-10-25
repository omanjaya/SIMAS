// src/app/(dashboard)/leave-requests/[id]/approve/page.tsx
'use client';

import { LeaveRequestForm } from '@/components/leave-request/leave-request-form';
import { useLeaveRequest, useApproveLeaveRequest } from '@/hooks/use-leave-requests';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function ApproveLeaveRequestPage() {
  const { id } = useParams();
  const { leaveRequest, loading: requestLoading, error } = useLeaveRequest(Number(id));
  const { approveLeaveRequest, loading: approveLoading } = useApproveLeaveRequest();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await approveLeaveRequest(Number(id), { ...data, status: 'approved' });
      toast({
        title: 'Success',
        description: 'Leave request approved successfully',
      });
      router.push('/dashboard/leave-requests');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve leave request',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/leave-requests');
  };

  if (requestLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !leaveRequest) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        <p>Leave request not found: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Approve Leave Request</h1>
        <p className="text-muted-foreground">
          Review and approve the leave request for {leaveRequest.employee?.first_name} {leaveRequest.employee?.last_name}
        </p>
      </div>
      <LeaveRequestForm 
        leaveRequest={leaveRequest} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={approveLoading} 
      />
    </div>
  );
}