// src/hooks/use-salaries.ts
import { useApi } from './use-api';
import { salaryService } from '@/lib/api/salaries';
import { useCallback, useState } from 'react';

export function useEmployeeSalaries(employeeId: number) {
  const { data, loading, error, refetch } = useApi(
    () => salaryService.getSalaryByEmployee(employeeId),
    [employeeId]
  );

  return {
    salaries: data || [],
    loading,
    error,
    refetch,
  };
}

export function useCurrentSalary(employeeId: number) {
  const { data, loading, error, refetch } = useApi(
    () => salaryService.getCurrentSalary(employeeId),
    [employeeId]
  );

  return {
    currentSalary: data,
    loading,
    error,
    refetch,
  };
}

export function useSalary(id: number) {
  const { data, loading, error, refetch } = useApi(
    () => salaryService.getById(id),
    [id]
  );

  return {
    salary: data,
    loading,
    error,
    refetch,
  };
}

export function useCalculatePayroll() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<any>(null);

  const calculatePayroll = useCallback(async (employeeId: number, month: number, year: number) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await salaryService.calculatePayroll(employeeId, month, year);
      setResult(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to calculate payroll'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    calculatePayroll,
    payrollResult: result,
    loading,
    error,
  };
}

export function useCreateSalary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSalary = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await salaryService.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create salary'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createSalary,
    loading,
    error,
  };
}

export function useUpdateSalary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateSalary = useCallback(async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await salaryService.update(id, data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update salary'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateSalary,
    loading,
    error,
  };
}

export function useExportPayroll() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportPayroll = useCallback(async (month: number, year: number) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await salaryService.exportPayroll(month, year);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${year}_${month}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return blob;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to export payroll'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exportPayroll,
    loading,
    error,
  };
}