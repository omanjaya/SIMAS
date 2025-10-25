// src/hooks/use-employees.ts
import { useApi } from './use-api';
import { employeeService } from '@/lib/api/employees';
import { Employee } from '@/types/employees';
import { useCallback, useState } from 'react';

export function useEmployees(filters?: {
  status?: string;
  department?: string;
  search?: string;
  page?: number;
  per_page?: number;
}) {
  const { data, loading, error, refetch } = useApi(
    () => employeeService.getEmployees(filters),
    [filters]
  );

  return {
    employees: data?.data || [],
    pagination: {
      current_page: data?.current_page || 1,
      last_page: data?.last_page || 1,
      per_page: data?.per_page || 10,
      total: data?.total || 0,
    },
    loading,
    error,
    refetch,
  };
}

export function useEmployee(id: number) {
  const { data, loading, error, refetch } = useApi(
    () => employeeService.getById(id),
    [id]
  );

  return {
    employee: data,
    loading,
    error,
    refetch,
  };
}

export function useCreateEmployee() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createEmployee = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await employeeService.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create employee'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createEmployee,
    loading,
    error,
  };
}

export function useUpdateEmployee() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateEmployee = useCallback(async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await employeeService.update(id, data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update employee'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateEmployee,
    loading,
    error,
  };
}

export function useDeactivateEmployee() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deactivateEmployee = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await employeeService.deactivate(id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to deactivate employee'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deactivateEmployee,
    loading,
    error,
  };
}