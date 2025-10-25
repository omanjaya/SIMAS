// src/app/(dashboard)/leave-requests/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Eye, FileText, Filter, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLeaveRequests } from '@/hooks/use-leave-requests';
import { useEmployees } from '@/hooks/use-employees';
import { useState, useEffect } from 'react';
import { LeaveRequest } from '@/types/leave-requests';
import { Employee } from '@/types/employees';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useProtectedRoute } from '@/hooks/use-protected-route';

export default function LeaveRequestsPage() {
  useProtectedRoute('admin');
  const [filters, setFilters] = useState({
    search: '',
    employee_id: '',
    leave_type: '',
    status: '',
    date_range: '',
    page: 1,
    per_page: 10,
  });
  
  const { leaveRequests, pagination, loading: leaveRequestsLoading, error: leaveRequestsError, refetch } = useLeaveRequests(filters);
  const { employees, loading: employeesLoading } = useEmployees({});
  const { toast } = useToast();

  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    let filtered = leaveRequests;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(request => 
        request.reason.toLowerCase().includes(searchLower) ||
        request.employee?.first_name.toLowerCase().includes(searchLower) ||
        request.employee?.last_name.toLowerCase().includes(searchLower) ||
        request.employee?.employee_code.toLowerCase().includes(searchLower)
      );
    }

    if (filters.employee_id) {
      filtered = filtered.filter(request => 
        request.employee_id === parseInt(filters.employee_id)
      );
    }

    if (filters.leave_type) {
      filtered = filtered.filter(request => request.leave_type === filters.leave_type);
    }

    if (filters.status) {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    setFilteredLeaveRequests(filtered);
  }, [leaveRequests, filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleEmployeeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, employee_id: value, page: 1 }));
  };

  const handleLeaveTypeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, leave_type: value, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  const handleDateRangeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, date_range: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getLeaveTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      sick: 'bg-red-100 text-red-800',
      annual: 'bg-blue-100 text-blue-800',
      emergency: 'bg-orange-100 text-orange-800',
      personal: 'bg-purple-100 text-purple-800',
      maternity: 'bg-pink-100 text-pink-800',
      paternity: 'bg-indigo-100 text-indigo-800',
      unpaid: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800"><XCircle className="mr-1 h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
  };

  const loading = leaveRequestsLoading || employeesLoading;
  const error = leaveRequestsError;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
          <p className="text-muted-foreground">
            Manage employee leave requests and approvals
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/leave-requests/create">
            <Plus className="mr-2 h-4 w-4" />
            Request Leave
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Management</CardTitle>
          <CardDescription>
            Review, approve, or reject employee leave requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reason or employee..."
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
            <Select value={filters.leave_type} onValueChange={handleLeaveTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="maternity">Maternity</SelectItem>
                <SelectItem value="paternity">Paternity</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.date_range} onValueChange={handleDateRangeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Leave Requests Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="md" className="mr-2" />
                        Loading leave requests...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-destructive">
                      Error loading leave requests: {error.message}
                    </TableCell>
                  </TableRow>
                ) : filteredLeaveRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No leave requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeaveRequests.map((request: LeaveRequest) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">
                          {request.employee ? 
                            `${request.employee.first_name} ${request.employee.last_name}` : 
                            getEmployeeName(request.employee_id)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.employee?.employee_code || 'EMP-' + request.employee_id}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLeaveTypeBadge(request.leave_type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(request.start_date).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            to {new Date(request.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{request.total_days} days</div>
                        <div className="text-sm text-muted-foreground">
                          {request.is_paid ? 'Paid' : 'Unpaid'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/leave-requests/${request.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/dashboard/leave-requests/${request.id}/approve`}>
                                  <CheckCircle className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/dashboard/leave-requests/${request.id}/reject`}>
                                  <XCircle className="h-4 w-4" />
                                </Link>
                              </Button>
                            </>
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
          {pagination && pagination.total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} leave requests
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