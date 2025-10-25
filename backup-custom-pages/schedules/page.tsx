// src/app/(dashboard)/schedules/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Eye, Calendar, Filter, BookOpen } from 'lucide-react';
import { useSchedules } from '@/hooks/use-schedules';
import { useEmployees } from '@/hooks/use-employees';
import { usePeriods } from '@/hooks/use-periods';
import { useState, useEffect } from 'react';
import { TeacherSchedule } from '@/types/schedules';
import { Employee } from '@/types/employees';
import { Period } from '@/types/periods';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useProtectedRoute } from '@/hooks/use-protected-route';

export default function SchedulesPage() {
  useProtectedRoute('admin');
  const [filters, setFilters] = useState({
    search: '',
    employee_id: '',
    period_id: '',
    day_of_week: '',
    schedule_type: '',
    is_active: '',
    page: 1,
    per_page: 10,
  });
  
  const { schedules, pagination, loading: schedulesLoading, error: schedulesError, refetch } = useSchedules(filters);
  const { employees, loading: employeesLoading } = useEmployees({});
  const { periods, loading: periodsLoading } = usePeriods();
  const { toast } = useToast();

  const [filteredSchedules, setFilteredSchedules] = useState<TeacherSchedule[]>([]);

  useEffect(() => {
    let filtered = schedules;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(schedule => 
        schedule.subject.toLowerCase().includes(searchLower) ||
        schedule.class_name.toLowerCase().includes(searchLower) ||
        (schedule.room_number && schedule.room_number.toLowerCase().includes(searchLower))
      );
    }

    if (filters.employee_id) {
      filtered = filtered.filter(schedule => 
        schedule.employee_id === parseInt(filters.employee_id)
      );
    }

    if (filters.period_id) {
      filtered = filtered.filter(schedule => 
        schedule.period_id === parseInt(filters.period_id)
      );
    }

    if (filters.day_of_week) {
      filtered = filtered.filter(schedule => 
        schedule.day_of_week === filters.day_of_week
      );
    }

    if (filters.schedule_type) {
      filtered = filtered.filter(schedule => 
        schedule.schedule_type === filters.schedule_type
      );
    }

    if (filters.is_active) {
      filtered = filtered.filter(schedule => 
        schedule.is_active.toString() === filters.is_active
      );
    }

    setFilteredSchedules(filtered);
  }, [schedules, filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleEmployeeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, employee_id: value, page: 1 }));
  };

  const handlePeriodFilter = (value: string) => {
    setFilters(prev => ({ ...prev, period_id: value, page: 1 }));
  };

  const handleDayFilter = (value: string) => {
    setFilters(prev => ({ ...prev, day_of_week: value, page: 1 }));
  };

  const handleScheduleTypeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, schedule_type: value, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, is_active: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
  };

  const getPeriodInfo = (periodId: number) => {
    const period = periods.find(p => p.id === periodId);
    return period ? `${period.name} (${period.start_time} - ${period.end_time})` : 'Unknown Period';
  };

  const getDayBadge = (day: string) => {
    const dayColors: Record<string, string> = {
      monday: 'bg-blue-100 text-blue-800',
      tuesday: 'bg-green-100 text-green-800',
      wednesday: 'bg-yellow-100 text-yellow-800',
      thursday: 'bg-purple-100 text-purple-800',
      friday: 'bg-pink-100 text-pink-800',
      saturday: 'bg-orange-100 text-orange-800',
      sunday: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={dayColors[day] || 'bg-gray-100 text-gray-800'}>
        {day.charAt(0).toUpperCase() + day.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      class: 'bg-blue-100 text-blue-800',
      meeting: 'bg-green-100 text-green-800',
      duty: 'bg-yellow-100 text-yellow-800',
      exam_supervision: 'bg-purple-100 text-purple-800',
    };
    
    return (
      <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const loading = schedulesLoading || employeesLoading || periodsLoading;
  const error = schedulesError;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Schedules</h1>
          <p className="text-muted-foreground">
            Manage teaching schedules and class assignments
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/schedules/create">
            <Plus className="mr-2 h-4 w-4" />
            Assign Schedule
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Management</CardTitle>
          <CardDescription>
            View and manage all teacher schedules and class assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects or classes..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select value={filters.employee_id} onValueChange={handleEmployeeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Teachers</SelectItem>
                {employees.map((employee: Employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.period_id} onValueChange={handlePeriodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Periods</SelectItem>
                {periods.map((period: Period) => (
                  <SelectItem key={period.id} value={period.id.toString()}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.day_of_week} onValueChange={handleDayFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Days</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.schedule_type} onValueChange={handleScheduleTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="duty">Duty</SelectItem>
                <SelectItem value="exam_supervision">Exam Supervision</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.is_active} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Schedules Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject & Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="md" className="mr-2" />
                        Loading schedules...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-destructive">
                      Error loading schedules: {error.message}
                    </TableCell>
                  </TableRow>
                ) : filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No schedules found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((schedule: TeacherSchedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div className="font-medium">{schedule.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {schedule.class_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getEmployeeName(schedule.employee_id)}
                      </TableCell>
                      <TableCell>
                        {getPeriodInfo(schedule.period_id)}
                      </TableCell>
                      <TableCell>
                        {getDayBadge(schedule.day_of_week)}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(schedule.schedule_type)}
                      </TableCell>
                      <TableCell>
                        {schedule.room_number || '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={schedule.is_active ? 'active' : 'inactive'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/schedules/${schedule.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/schedules/${schedule.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                {pagination.total} schedules
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