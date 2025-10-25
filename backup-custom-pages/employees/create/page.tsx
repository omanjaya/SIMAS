// src/app/(dashboard)/employees/create/page.tsx
'use client';

import { EmployeeForm } from '@/components/employee/employee-form';
import { useCreateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function CreateEmployeePage() {
  const { createEmployee, loading } = useCreateEmployee();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await createEmployee(data);
      toast({
        title: 'Success',
        description: 'Employee created successfully',
      });
      router.push('/dashboard/employees');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create employee',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/employees');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Employee</h1>
        <p className="text-muted-foreground">
          Add a new employee to the system
        </p>
      </div>
      <EmployeeForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={loading} 
      />
    </div>
  );
}