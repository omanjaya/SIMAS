import { useState, useEffect } from 'react';
import { analyticsService } from '@/lib/api/analytics';

export function useAttendanceTrends(filters: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getAttendanceTrends(filters);
        setData(result.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, loading, error, refetch: () => {} };
}

export function useOvertimeAnalysis(filters: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getOvertimeAnalysis(filters);
        setData(result.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, loading, error, refetch: () => {} };
}

export function useLeaveBalanceForecast(year: number, department?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getLeaveBalanceForecast(year, department);
        setData(result.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, department]);

  return { data, loading, error, refetch: () => {} };
}

export function usePayrollCostAnalysis(filters: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getPayrollCostAnalysis(filters);
        setData(result.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, loading, error, refetch: () => {} };
}