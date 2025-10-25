// src/components/salary/salary-form.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Salary, SalaryFormData } from '@/types/salaries';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';

const salarySchema = z.object({
  employee_id: z.number().min(1, 'Employee is required'),
  base_salary: z.number().min(0, 'Base salary must be a positive number'),
  allowances: z.number().min(0, 'Allowances must be a positive number').optional(),
  deductions: z.number().min(0, 'Deductions must be a positive number').optional(),
  net_salary: z.number().min(0, 'Net salary must be a positive number'),
  salary_type: z.enum(['hourly', 'monthly']),
  payment_method: z.string(),
  pay_period: z.string(),
  effective_date: z.string().min(1, 'Effective date is required'),
  is_active: z.boolean().default(true),
});

interface SalaryFormProps {
  salary?: Salary;
  onSubmit: (data: SalaryFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function SalaryForm({ salary, onSubmit, onCancel, loading }: SalaryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      employee_id: salary?.employee_id || 0,
      base_salary: salary?.base_salary || 0,
      allowances: salary?.allowances || 0,
      deductions: salary?.deductions || 0,
      net_salary: salary?.net_salary || 0,
      salary_type: salary?.salary_type || 'monthly',
      payment_method: salary?.payment_method || 'bank_transfer',
      pay_period: salary?.pay_period || 'monthly',
      effective_date: salary?.effective_date || new Date().toISOString().split('T')[0],
      is_active: salary?.is_active !== undefined ? salary.is_active : true,
    }
  });

  // Reset the form when salary prop changes
  useEffect(() => {
    reset({
      employee_id: salary?.employee_id || 0,
      base_salary: salary?.base_salary || 0,
      allowances: salary?.allowances || 0,
      deductions: salary?.deductions || 0,
      net_salary: salary?.net_salary || 0,
      salary_type: salary?.salary_type || 'monthly',
      payment_method: salary?.payment_method || 'bank_transfer',
      pay_period: salary?.pay_period || 'monthly',
      effective_date: salary?.effective_date || new Date().toISOString().split('T')[0],
      is_active: salary?.is_active !== undefined ? salary.is_active : true,
    });
  }, [salary, reset]);

  // Calculate net salary whenever base_salary, allowances, or deductions change
  useEffect(() => {
    const baseSalary = watch('base_salary') || 0;
    const allowances = watch('allowances') || 0;
    const deductions = watch('deductions') || 0;
    const netSalary = baseSalary + allowances - deductions;
    
    setValue('net_salary', netSalary);
  }, [watch('base_salary'), watch('allowances'), watch('deductions'), setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{salary ? 'Edit Salary' : 'Add New Salary'}</CardTitle>
          <CardDescription>
            {salary 
              ? 'Update the salary details below' 
              : 'Enter the salary details for this employee'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee *</Label>
            <Input
              id="employee_id"
              type="number"
              {...register('employee_id', { valueAsNumber: true })}
              placeholder="Enter employee ID"
            />
            {errors.employee_id && (
              <p className="text-sm text-destructive">{errors.employee_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_salary">Base Salary *</Label>
              <Input
                id="base_salary"
                type="number"
                step="0.01"
                {...register('base_salary', { valueAsNumber: true })}
                placeholder="Enter base salary"
              />
              {errors.base_salary && (
                <p className="text-sm text-destructive">{errors.base_salary.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary_type">Salary Type *</Label>
              <Select 
                value={watch('salary_type')} 
                onValueChange={(value) => setValue('salary_type', value as 'hourly' | 'monthly')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              {errors.salary_type && (
                <p className="text-sm text-destructive">{errors.salary_type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allowances">Allowances</Label>
              <Input
                id="allowances"
                type="number"
                step="0.01"
                {...register('allowances', { valueAsNumber: true })}
                placeholder="Enter allowances"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deductions">Deductions</Label>
              <Input
                id="deductions"
                type="number"
                step="0.01"
                {...register('deductions', { valueAsNumber: true })}
                placeholder="Enter deductions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="net_salary">Net Salary *</Label>
              <Input
                id="net_salary"
                type="number"
                step="0.01"
                value={watch('net_salary')?.toFixed(2) || '0.00'}
                disabled
                placeholder="Net salary (calculated)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select 
                value={watch('payment_method')} 
                onValueChange={(value) => setValue('payment_method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pay_period">Pay Period</Label>
              <Select 
                value={watch('pay_period')} 
                onValueChange={(value) => setValue('pay_period', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effective_date">Effective Date *</Label>
              <Input
                id="effective_date"
                type="date"
                {...register('effective_date')}
              />
              {errors.effective_date && (
                <p className="text-sm text-destructive">{errors.effective_date.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="is_active">Salary is Active</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register('is_active')}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {salary ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                salary ? 'Update Salary' : 'Create Salary'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}