// src/app/(dashboard)/teacher/leave-requests/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Search, Plus, CalendarClock, CalendarCheck, CalendarX, Edit3 } from 'lucide-react';
import { useEmployeeLeaveRequests } from '@/hooks/use-leave-requests';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { LeaveRequest } from '@/types/leave-requests';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { useProtectedRoute } from '@/hooks/use-protected-route';

export default function TeacherLeaveRequestsPage() {
  useProtectedRoute('teacher');
  const { user } = useAuth();
  const { leaveRequests, loading, error, refetch } = useEmployeeLeaveRequests(user?.id || 0);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    leave_type: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    let filtered = leaveRequests;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(request => 
        request.reason.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    if (filters.leave_type) {
      filtered = filtered.filter(request => request.leave_type === filters.leave_type);
    }

    setFilteredRequests(filtered);
  }, [leaveRequests, filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const handleLeaveTypeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, leave_type: value }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><CalendarClock className="mr-1 h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CalendarCheck className="mr-1 h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><CalendarX className="mr-1 h-3 w-3" /> Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800"><CalendarX className="mr-1 h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  const onSubmit = async (data: any) => {
    try {
      // Here you would call your API to submit the leave request
      // await submitLeaveRequest(data);
      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });
      reset();
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit leave request',
        variant: 'destructive',
      });
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString();
    }
    
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Leave Requests</h1>
          <p className="text-muted-foreground">
            Submit and track your leave requests
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Leave Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leave_type">Leave Type *</Label>
                  <Select onValueChange={(value) => setValue('leave_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="emergency">Emergency Leave</SelectItem>
                      <SelectItem value="personal">Personal Leave</SelectItem>
                      <SelectItem value="maternity">Maternity Leave</SelectItem>
                      <SelectItem value="paternity">Paternity Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.leave_type && (
                    <p className="text-sm text-destructive">{errors.leave_type.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is_paid">Payment Status</Label>
                  <Select onValueChange={(value) => setValue('is_paid', value === 'true')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Paid Leave</SelectItem>
                      <SelectItem value="false">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="start_date"
                      type="date"
                      {...register('start_date', { required: 'Start date is required' })}
                      className="pl-8"
                    />
                  </div>
                  {errors.start_date && (
                    <p className="text-sm text-destructive">{errors.start_date.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="end_date"
                      type="date"
                      {...register('end_date', { required: 'End date is required' })}
                      className="pl-8"
                    />
                  </div>
                  {errors.end_date && (
                    <p className="text-sm text-destructive">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave *</Label>
                <Textarea
                  id="reason"
                  {...register('reason', { required: 'Reason is required' })}
                  placeholder="Please provide details about your leave request"
                  rows={4}
                />
                {errors.reason && (
                  <p className="text-sm text-destructive">{errors.reason.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Request
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            View and manage your leave requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reason..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
          </div>

          {/* Leave Requests Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                        Loading leave requests...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-destructive">
                      Error loading leave requests: {error.message}
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No leave requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request: LeaveRequest) => (
                    <TableRow key={request.id}>
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
                        <Button variant="ghost" size="icon">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Leave Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveRequests.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}