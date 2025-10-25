// src/hooks/use-attendance.ts
import { useApi } from './use-api';
import { attendanceService } from '@/lib/api/attendance';
import { useCallback, useState } from 'react';

export function useEmployeeAttendance(employeeId: number, startDate?: string, endDate?: string) {
  const { data, loading, error, refetch } = useApi(
    () => attendanceService.getAttendanceByEmployee(employeeId, startDate, endDate),
    [employeeId, startDate, endDate]
  );

  return {
    attendance: data || [],
    loading,
    error,
    refetch,
  };
}

export function useAttendance(id: number) {
  const { data, loading, error, refetch } = useApi(
    () => attendanceService.getById(id),
    [id]
  );

  return {
    attendanceRecord: data,
    loading,
    error,
    refetch,
  };
}

export function useClockIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clockIn = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await attendanceService.clockIn(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clock in'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    clockIn,
    loading,
    error,
  };
}

export function useClockOut() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clockOut = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await attendanceService.clockOut(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clock out'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    clockOut,
    loading,
    error,
  };
}

export function useTodayAttendance(employeeId: number) {
  const { data, loading, error, refetch } = useApi(
    () => attendanceService.getTodayAttendance(employeeId),
    [employeeId]
  );

  return {
    todayAttendance: data,
    loading,
    error,
    refetch,
  };
}