'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { EmployeeForm } from '@/components/employee/employee-form';
import { useUpdateEmployee } from '@/hooks/use-employees';
import { EmployeeFormData } from '@/types/employees';
import { toast } from 'sonner';
import { employeeService } from '@/lib/api/employees';

export default function EditEmployeePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { updateEmployee, loading, error } = useUpdateEmployee();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setIsLoading(true);
        const employeeData = await employeeService.getById(parseInt(params.id));
        setEmployee(employeeData);
      } catch (err) {
        console.error('Failed to fetch employee:', err);
        toast.error('Failed to load employee data');
        router.push('/users');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchEmployee();
    }
  }, [params.id, router]);

  const handleUpdateEmployee = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateEmployee(parseInt(params.id), data);
      toast.success('Employee updated successfully');
      router.push('/users');
    } catch (err) {
      console.error('Failed to update employee:', err);
      toast.error('Failed to update employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Pegawai</h1>
          <p className="text-muted-foreground">
            Perbarui informasi pegawai
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Pegawai</CardTitle>
          <CardDescription>
            Perbarui informasi pegawai di bawah ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employee && (
            <EmployeeForm 
              employee={employee}
              onSubmit={handleUpdateEmployee}
              onCancel={() => router.back()}
              loading={isSubmitting || loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
