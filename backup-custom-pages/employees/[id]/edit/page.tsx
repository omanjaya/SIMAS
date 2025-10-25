// src/app/(dashboard)/employees/[id]/edit/page.tsx
'use client';

import { EmployeeForm } from '@/components/employee/employee-form';
import { useEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function EditEmployeePage() {
  const { id } = useParams();
  const { employee, loading: employeeLoading, error } = useEmployee(Number(id));
  const { updateEmployee, loading: updateLoading } = useUpdateEmployee();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await updateEmployee(Number(id), data);
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });
      router.push('/dashboard/employees');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update employee',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/employees');
  };

  if (employeeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        <p>Employee not found: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Employee</h1>
        <p className="text-muted-foreground">
          Update the details for {employee.first_name} {employee.last_name}
        </p>
      </div>
      <EmployeeForm 
        employee={employee} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={updateLoading} 
      />
    </div>
  );
}