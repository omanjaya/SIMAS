// src/hooks/use-leave-requests.ts
import { useApi } from './use-api';
import { leaveRequestService } from '@/lib/api/leave-requests';
import { useCallback, useState } from 'react';

export function useLeaveRequests() {
  const { data, loading, error, refetch } = useApi(
    () => leaveRequestService.getAll(),
    []
  );

  return {
    leaveRequests: data || [],
    loading,
    error,
    refetch,
  };
}

export function useEmployeeLeaveRequests(employeeId: number) {
  const { data, loading, error, refetch } = useApi(
    () => leaveRequestService.getLeaveRequestsByEmployee(employeeId),
    [employeeId]
  );

  return {
    leaveRequests: data || [],
    loading,
    error,
    refetch,
  };
}

export function useLeaveRequest(id: number) {
  const { data, loading, error, refetch } = useApi(
    () => leaveRequestService.getById(id),
    [id]
  );

  return {
    leaveRequest: data,
    loading,
    error,
    refetch,
  };
}

export function useApproveLeaveRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const approveLeaveRequest = useCallback(async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await leaveRequestService.approve(id, data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to approve leave request'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    approveLeaveRequest,
    loading,
    error,
  };
}

export function useRejectLeaveRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const rejectLeaveRequest = useCallback(async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await leaveRequestService.reject(id, data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reject leave request'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rejectLeaveRequest,
    loading,
    error,
  };
}