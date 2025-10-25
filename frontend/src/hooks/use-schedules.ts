// src/hooks/use-schedules.ts
import { useApi } from './use-api';
import { scheduleService } from '@/lib/api/schedules';
import { useCallback, useState } from 'react';

export function useSchedules() {
  const { data, loading, error, refetch } = useApi(
    () => scheduleService.getAll(),
    []
  );

  return {
    schedules: data || [],
    loading,
    error,
    refetch,
  };
}

export function useEmployeeSchedules(employeeId: number) {
  const { data, loading, error, refetch } = useApi(
    () => scheduleService.getSchedulesByEmployee(employeeId),
    [employeeId]
  );

  return {
    schedules: data || [],
    loading,
    error,
    refetch,
  };
}

export function useSchedule(id: number) {
  const { data, loading, error, refetch } = useApi(
    () => scheduleService.getById(id),
    [id]
  );

  return {
    schedule: data,
    loading,
    error,
    refetch,
  };
}

export function useCreateSchedule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSchedule = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await scheduleService.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create schedule'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createSchedule,
    loading,
    error,
  };
}