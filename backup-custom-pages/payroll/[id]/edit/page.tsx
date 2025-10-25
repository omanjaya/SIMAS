// src/app/(dashboard)/payroll/[id]/edit/page.tsx
'use client';

import { SalaryForm } from '@/components/salary/salary-form';
import { useSalary, useUpdateSalary } from '@/hooks/use-salaries';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function EditSalaryPage() {
  const { id } = useParams();
  const { salary, loading: salaryLoading, error } = useSalary(Number(id));
  const { updateSalary, loading: updateLoading } = useUpdateSalary();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await updateSalary(Number(id), data);
      toast({
        title: 'Success',
        description: 'Salary updated successfully',
      });
      router.push('/dashboard/payroll');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update salary',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/payroll');
  };

  if (salaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !salary) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        <p>Salary not found: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Salary</h1>
        <p className="text-muted-foreground">
          Update the salary details for employee ID {salary.employee_id}
        </p>
      </div>
      <SalaryForm 
        salary={salary} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={updateLoading} 
      />
    </div>
  );
}