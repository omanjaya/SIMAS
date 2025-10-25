// src/hooks/use-payroll.ts
import { useState, useEffect, useCallback } from "react";
import { payrollService } from "@/lib/api/payroll";
import { PayrollApproval, PayrollFilter } from "@/types/payroll";

export function usePayrollApprovals(filters?: PayrollFilter) {
  const [approvals, setApprovals] = useState<PayrollApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await payrollService.getAll(filters);
      setApprovals(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch payroll approvals"));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const refetch = useCallback(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  return {
    approvals,
    loading,
    error,
    refetch,
  };
}

export function usePayrollApproval(id: number) {
  const [approval, setApproval] = useState<PayrollApproval | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApproval = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await payrollService.getById(id);
      setApproval(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch payroll approval"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchApproval();
    }
  }, [id, fetchApproval]);

  const refetch = useCallback(() => {
    fetchApproval();
  }, [fetchApproval]);

  return {
    approval,
    loading,
    error,
    refetch,
  };
}

export function useApprovePayroll() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const approvePayroll = useCallback(async (id: number, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await payrollService.approve(id, { notes });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to approve payroll"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    approvePayroll,
    loading,
    error,
  };
}

export function useRejectPayroll() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const rejectPayroll = useCallback(async (id: number, reason: string, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await payrollService.reject(id, { rejection_reason: reason, notes });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to reject payroll"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rejectPayroll,
    loading,
    error,
  };
}

export function useSendPayslip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendPayslip = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await payrollService.sendPayslip(id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send payslip"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sendPayslip,
    loading,
    error,
  };
}

export function usePayrollSummary() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getSummary = useCallback(async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await payrollService.getSummary(year, month);
      setSummary(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch payroll summary"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getSummary,
    summary,
    loading,
    error,
  };
}

export function useExportPayroll() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportPayroll = useCallback(async (year: number, month: number, department?: string) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await payrollService.exportPayroll(year, month, department);
      return blob;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to export payroll"));
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

export function useGenerateBulkPayroll() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateBulkPayroll = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await payrollService.generateBulk(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to generate bulk payroll"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateBulkPayroll,
    loading,
    error,
  };
}