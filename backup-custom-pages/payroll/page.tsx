// src/app/(dashboard)/payroll/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Download, Filter, DollarSign, Calculator, Users, CheckCircle, Edit, Plus } from 'lucide-react';
import { useEmployeeSalaries } from '@/hooks/use-salaries';
import { useEmployees } from '@/hooks/use-employees';
import { useState, useEffect } from 'react';
import { Salary } from '@/types/salaries';
import { Employee } from '@/types/employees';
import { useCalculatePayroll, useExportPayroll } from '@/hooks/use-salaries';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { PayrollDetailModal } from '@/components/payroll/payroll-detail-modal';
import { exportPayrollToCSV } from '@/lib/utils/export-csv';

export default function PayrollPage() {
  useProtectedRoute('admin');
  const [filters, setFilters] = useState({
    search: '',
    employee_id: '',
    pay_grade: '',
    is_active: '',
  });
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const { employees, loading: employeesLoading } = useEmployees({});
  const { calculatePayroll, loading: calculating, payrollResult } = useCalculatePayroll();
  const { exportPayroll, loading: exporting } = useExportPayroll();
  const { toast } = useToast();

  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [payrollData, setPayrollData] = useState<Record<number, any>>({});

  useEffect(() => {
    let filtered = employees;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(employee => 
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchLower) ||
        employee.employee_code.toLowerCase().includes(searchLower) ||
        (employee.position && employee.position.toLowerCase().includes(searchLower)) ||
        (employee.department && employee.department.toLowerCase().includes(searchLower))
      );
    }

    if (filters.employee_id) {
      filtered = filtered.filter(employee => 
        employee.id === parseInt(filters.employee_id)
      );
    }

    if (filters.pay_grade) {
      // This would require salary data to filter by pay grade
    }

    if (filters.is_active) {
      filtered = filtered.filter(employee => 
        employee.status === (filters.is_active === 'active' ? 'active' : 'inactive')
      );
    }

    setFilteredEmployees(filtered);
  }, [employees, filters]);

  useEffect(() => {
    // Calculate payroll for all filtered employees when month/year changes
    filteredEmployees.forEach(employee => {
      calculatePayrollForEmployee(employee.id);
    });
  }, [filteredEmployees, selectedMonth, selectedYear]);

  const calculatePayrollForEmployee = async (employeeId: number) => {
    try {
      const result = await calculatePayroll(employeeId, selectedMonth, selectedYear);
      setPayrollData(prev => ({
        ...prev,
        [employeeId]: result
      }));
    } catch (error) {
      console.error(`Failed to calculate payroll for employee ${employeeId}:`, error);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleEmployeeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, employee_id: value }));
  };

  const handlePayGradeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, pay_grade: value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, is_active: value }));
  };

  const handleExportPayroll = () => {
    const exportData = filteredEmployees.map(emp => ({
      employee_code: emp.employee_code,
      employee_name: `${emp.first_name} ${emp.last_name}`,
      position: emp.position,
      department: emp.department,
      base_salary: payrollData[emp.id]?.base_salary || 0,
      allowances: payrollData[emp.id]?.allowances || 0,
      deductions: payrollData[emp.id]?.deductions || 0,
      net_salary: payrollData[emp.id]?.net_salary || 0,
      days_present: payrollData[emp.id]?.attendance_summary?.days_present || 0,
      days_absent: payrollData[emp.id]?.attendance_summary?.days_absent || 0,
      total_hours: payrollData[emp.id]?.attendance_summary?.total_hours || 0,
    }))

    exportPayrollToCSV(exportData, selectedMonth, selectedYear)

    toast({
      title: 'Success',
      description: 'Payroll exported successfully',
    })
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const loading = employeesLoading || calculating;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage employee salaries and payroll processing
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Select 
              value={selectedMonth.toString()} 
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026, 2027].map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExportPayroll} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            Export Payroll
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Configuration</CardTitle>
          <CardDescription>
            View and manage employee salary information for {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </CardDescription>
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/dashboard/payroll/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Salary
              </Link>
            </Button>
          </div>
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
            <Select value={filters.employee_id} onValueChange={handleEmployeeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Employees</SelectItem>
                {employees.map((employee: Employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.pay_grade} onValueChange={handlePayGradeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by pay grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
                <SelectItem value="A">Grade A</SelectItem>
                <SelectItem value="B">Grade B</SelectItem>
                <SelectItem value="C">Grade C</SelectItem>
                <SelectItem value="D">Grade D</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.is_active} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payroll Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                        Loading payroll data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee: Employee) => {
                    const payroll = payrollData[employee.id];
                    
                    return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee.employee_code}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {employee.position || '-'}
                        </TableCell>
                        <TableCell className="capitalize">
                          {employee.department || '-'}
                        </TableCell>
                        <TableCell>
                          {payroll?.base_salary ? formatCurrency(payroll.base_salary) : '-'}
                        </TableCell>
                        <TableCell>
                          {payroll?.allowances ? formatCurrency(payroll.allowances) : '-'}
                        </TableCell>
                        <TableCell>
                          {payroll?.deductions ? formatCurrency(payroll.deductions) : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {payroll?.net_salary ? formatCurrency(payroll.net_salary) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <PayrollDetailModal
                              employeeId={employee.id}
                              employeeName={`${employee.first_name} ${employee.last_name}`}
                              month={selectedMonth}
                              year={selectedYear}
                              payrollData={{
                                base_salary: payroll?.base_salary || 0,
                                allowances: payroll?.allowances || 0,
                                deductions: payroll?.deductions || 0,
                                net_salary: payroll?.net_salary || 0,
                                attendance_summary: {
                                  days_present: payroll?.attendance_summary?.days_present || 0,
                                  days_absent: payroll?.attendance_summary?.days_absent || 0,
                                  days_late: payroll?.attendance_summary?.days_late || 0,
                                  total_hours: payroll?.attendance_summary?.total_hours || 0,
                                }
                              }}
                            />
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/payroll/${employee.id}/edit`}>
                                <Edit className="mr-1 h-4 w-4" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                Object.values(payrollData).reduce((sum, payroll: any) => sum + (payroll?.net_salary || 0), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Monthly total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                filteredEmployees.length > 0 
                  ? Object.values(payrollData).reduce((sum, payroll: any) => sum + (payroll?.net_salary || 0), 0) / filteredEmployees.length
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(payrollData).filter(Boolean).length}/{filteredEmployees.length}
            </div>
            <p className="text-xs text-muted-foreground">Payroll calculated</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Import missing icons
import { Users, CheckCircle } from 'lucide-react';