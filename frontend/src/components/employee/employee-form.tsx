// src/components/employee/employee-form.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee, EmployeeFormData } from '@/types/employees';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';

const employeeSchema = z.object({
  employee_code: z.string().min(1, 'Employee code is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  hire_date: z.string().min(1, 'Hire date is required'),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'intern']),
  salary: z.number().optional(),
  salary_type: z.enum(['hourly', 'monthly']),
  emergency_contact: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated']),
});

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function EmployeeForm({ employee, onSubmit, onCancel, loading }: EmployeeFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee || {
      employee_code: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      date_of_birth: '',
      gender: 'male',
      position: '',
      department: '',
      hire_date: new Date().toISOString().split('T')[0],
      employment_type: 'full-time',
      salary: 0,
      salary_type: 'monthly',
      emergency_contact: '',
      status: 'active',
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // You might want to handle the file upload differently based on your backend
    }
  };

  const watchedSalaryType = watch('salary_type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
          <CardDescription>
            {employee 
              ? 'Update the employee information below' 
              : 'Enter the employee details to create a new employee record'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_code">Employee Code *</Label>
              <Input
                id="employee_code"
                {...register('employee_code')}
                placeholder="EMP001"
              />
              {errors.employee_code && (
                <p className="text-sm text-destructive">{errors.employee_code.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={watch('status')} 
                onValueChange={(value) => setValue('status', value as 'active' | 'inactive' | 'terminated')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Enter last name"
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="name@company.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                {...register('emergency_contact')}
                placeholder="Emergency contact"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register('date_of_birth')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={watch('gender')} 
                onValueChange={(value) => setValue('gender', value as 'male' | 'female' | undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                {...register('position')}
                placeholder="Job position"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                {...register('department')}
                placeholder="Department"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date *</Label>
              <Input
                id="hire_date"
                type="date"
                {...register('hire_date')}
              />
              {errors.hire_date && (
                <p className="text-sm text-destructive">{errors.hire_date.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type *</Label>
              <Select 
                value={watch('employment_type')} 
                onValueChange={(value) => setValue('employment_type', value as 'full-time' | 'part-time' | 'contract' | 'intern')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
              {errors.employment_type && (
                <p className="text-sm text-destructive">{errors.employment_type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="salary">
                {watchedSalaryType === 'hourly' ? 'Hourly Rate' : 'Monthly Salary'}
                {watchedSalaryType ? '*' : ''}
              </Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                {...register('salary', { valueAsNumber: true })}
                placeholder={`Enter ${watchedSalaryType === 'hourly' ? 'hourly rate' : 'monthly salary'}`}
              />
              {errors.salary && (
                <p className="text-sm text-destructive">{errors.salary.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile_image">Profile Image</Label>
              <Input
                id="profile_image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter address"
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
                  {employee ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                employee ? 'Update Employee' : 'Create Employee'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}