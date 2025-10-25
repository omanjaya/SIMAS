// src/app/(dashboard)/payroll/create/page.tsx
'use client';

import { SalaryForm } from '@/components/salary/salary-form';
import { useCreateSalary } from '@/hooks/use-salaries';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function CreateSalaryPage() {
  const { createSalary, loading } = useCreateSalary();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await createSalary(data);
      toast({
        title: 'Success',
        description: 'Salary created successfully',
      });
      router.push('/dashboard/payroll');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create salary',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/payroll');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Salary</h1>
        <p className="text-muted-foreground">
          Add salary information for an employee
        </p>
      </div>
      <SalaryForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        loading={loading} 
      />
    </div>
  );
}