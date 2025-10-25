// src/hooks/use-periods.ts
import { useApi } from './use-api';
import { periodService } from '@/lib/api/periods';
import { useCallback, useState } from 'react';

export function usePeriods() {
  const { data, loading, error, refetch } = useApi(
    () => periodService.getAll(),
    []
  );

  return {
    periods: data || [],
    loading,
    error,
    refetch,
  };
}

export function useActivePeriods() {
  const { data, loading, error, refetch } = useApi(
    () => periodService.getActivePeriods(),
    []
  );

  return {
    activePeriods: data || [],
    loading,
    error,
    refetch,
  };
}

export function usePeriod(id: number) {
  const { data, loading, error, refetch } = useApi(
    () => periodService.getById(id),
    [id]
  );

  return {
    period: data,
    loading,
    error,
    refetch,
  };
}

export function useCreatePeriod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPeriod = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await periodService.create(data);
      refetchPeriods(); // Global function to refetch periods
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create period'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPeriod,
    loading,
    error,
  };
}

// Global refetch function for periods
let refetchPeriods: () => void = () => {};

export function setPeriodsRefetch(refetch: () => void) {
  refetchPeriods = refetch;
}