'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { EmployeeForm } from '@/components/employee/employee-form';
import { useCreateEmployee } from '@/hooks/use-employees';
import { EmployeeFormData } from '@/types/employees';
import { toast } from 'sonner';

export default function NewEmployeePage() {
  const router = useRouter();
  const { createEmployee, loading, error } = useCreateEmployee();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateEmployee = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createEmployee(data);
      toast.success('Employee created successfully');
      router.push('/users');
    } catch (err) {
      console.error('Failed to create employee:', err);
      toast.error('Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold">Tambah Pegawai Baru</h1>
          <p className="text-muted-foreground">
            Tambahkan pegawai baru ke sistem secara individu
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Pegawai</CardTitle>
          <CardDescription>
            Masukkan informasi lengkap pegawai baru di bawah ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm 
            onSubmit={handleCreateEmployee}
            onCancel={() => router.back()}
            loading={isSubmitting || loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
