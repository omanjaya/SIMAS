// src/app/(dashboard)/employees/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Eye, UserRoundX, Filter } from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import { useState, useEffect } from 'react';
import { Employee } from '@/types/employees';
import { useToast } from '@/hooks/use-toast';
import { useDeactivateEmployee } from '@/hooks/use-employees';
import Link from 'next/link';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useProtectedRoute } from '@/hooks/use-protected-route';

export default function EmployeesPage() {
  useProtectedRoute('admin');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
    page: 1,
    per_page: 10,
  });
  
  const { employees, pagination, loading, error, refetch } = useEmployees(filters);
  const { deactivateEmployee, loading: deactivating } = useDeactivateEmployee();
  const { toast } = useToast();

  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    let filtered = employees;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(employee => 
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchLower) ||
        employee.employee_code.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower) ||
        (employee.phone && employee.phone.includes(filters.search))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(employee => employee.status === filters.status);
    }

    if (filters.department) {
      filtered = filtered.filter(employee => employee.department === filters.department);
    }

    setFilteredEmployees(filtered);
  }, [employees, filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  const handleDepartmentFilter = (value: string) => {
    setFilters(prev => ({ ...prev, department: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDeactivate = async (id: number) => {
    try {
      await deactivateEmployee(id);
      toast({
        title: 'Success',
        description: 'Employee deactivated successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate employee',
        variant: 'destructive',
      });
    }
  };

  const loadingOrFetching = loading || deactivating;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage employee records and information
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/employees/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>
            Browse and manage all employees in the organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select value={filters.status} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.department} onValueChange={handleDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Academics">Academics</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Employee Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingOrFetching ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="md" className="mr-2" />
                        Loading employees...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-destructive">
                      Error loading employees: {error.message}
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee: Employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="font-medium">
                          {employee.first_name} {employee.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {employee.employee_code}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{employee.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.phone}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {employee.position || '-'}
                      </TableCell>
                      <TableCell className="capitalize">
                        {employee.department || '-'}
                      </TableCell>
                      <TableCell>
                        {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={employee.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/employees/${employee.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/employees/${employee.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {employee.status === 'active' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeactivate(employee.id)}
                              disabled={deactivating}
                            >
                              <UserRoundX className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} employees
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}