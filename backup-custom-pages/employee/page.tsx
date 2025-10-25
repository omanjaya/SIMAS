// src/app/(dashboard)/employee/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/stat-card';
import { 
  Calendar, 
  FileText, 
  Clock, 
  User, 
  CheckCircle,
  AlertCircle,
  ClockIcon,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTodayAttendance } from '@/hooks/use-attendance';
import { useEmployeeLeaveRequests } from '@/hooks/use-leave-requests';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useClockIn, useClockOut } from '@/hooks/use-attendance';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { todayAttendance, loading: attendanceLoading, error: attendanceError } = useTodayAttendance(user?.employee?.id || 0);
  const { leaveRequests, loading: leaveRequestsLoading } = useEmployeeLeaveRequests(user?.id || 0);
  const { clockIn, loading: clockInLoading } = useClockIn();
  const { clockOut, loading: clockOutLoading } = useClockOut();
  const [stats, setStats] = useState({
    attendanceStatus: 'not_clocked_in',
    totalAttendance: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    totalWorkHours: 0,
  });

  useEffect(() => {
    if (!attendanceLoading && !leaveRequestsLoading) {
      const totalAttendance = 22; // Placeholder - would be calculated from actual data
      const pendingLeaves = leaveRequests.filter(lr => lr.status === 'pending').length;
      const approvedLeaves = leaveRequests.filter(lr => lr.status === 'approved').length;
      const totalWorkHours = 176; // Placeholder - would be calculated from actual data
      
      const attendanceStatus = todayAttendance 
        ? (todayAttendance.check_out_time ? 'clocked_out' : 'clocked_in') 
        : 'not_clocked_in';

      setStats({
        attendanceStatus,
        totalAttendance,
        pendingLeaves,
        approvedLeaves,
        totalWorkHours,
      });
    }
  }, [todayAttendance, leaveRequests, attendanceLoading, leaveRequestsLoading]);

  const handleClockIn = async () => {
    try {
      await clockIn({
        employee_id: user?.employee?.id || 0,
        attendance_type: 'manual',
      });
    } catch (error) {
      console.error('Clock in error:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut({
        employee_id: user?.employee?.id || 0,
        attendance_type: 'manual',
      });
    } catch (error) {
      console.error('Clock out error:', error);
    }
  };

  const getAttendanceStatusBadge = () => {
    switch (stats.attendanceStatus) {
      case 'clocked_in':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Clocked In</Badge>;
      case 'clocked_out':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CalendarCheck className="mr-1 h-3 w-3" /> Clocked Out</Badge>;
      case 'not_clocked_in':
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800"><AlertCircle className="mr-1 h-3 w-3" /> Not Clocked In</Badge>;
    }
  };

  const loading = attendanceLoading || leaveRequestsLoading || clockInLoading || clockOutLoading;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Dashboard</h1>
        <p className="text-muted-foreground">
          Track your attendance and work schedule
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Status"
          value={getAttendanceStatusBadge()}
          icon={<ClockIcon className="h-4 w-4" />}
          description="Today's attendance"
          trend={{
            value: 0,
            isPositive: true,
            text: "On time"
          }}
        />
        <StatCard
          title="Total Attendance"
          value={loading ? '-' : stats.totalAttendance}
          icon={<CalendarCheck className="h-4 w-4" />}
          description="Days this month"
          trend={{
            value: 3,
            isPositive: true,
            text: "from last month"
          }}
        />
        <StatCard
          title="Pending Leaves"
          value={loading ? '-' : stats.pendingLeaves}
          icon={<FileText className="h-4 w-4" />}
          description="Awaiting approval"
          trend={{
            value: 1,
            isPositive: false,
            text: "new request"
          }}
        />
        <StatCard
          title="Work Hours"
          value={loading ? '-' : `${stats.totalWorkHours}h`}
          icon={<Clock className="h-4 w-4" />}
          description="This month"
          trend={{
            value: 12,
            isPositive: true,
            text: "hours worked"
          }}
        />
      </div>

      {/* Attendance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
          <CardDescription>
            Clock in and out for today's work hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's Date */}
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
              <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div className="text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Clock In */}
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
              <div className="text-center mb-4">
                <div className="text-lg font-medium mb-1">Clock In</div>
                {todayAttendance?.check_in_time ? (
                  <div className="text-2xl font-bold text-green-600">
                    {new Date(todayAttendance.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                ) : (
                  <div className="text-muted-foreground">Not clocked in</div>
                )}
              </div>
              <Button
                onClick={handleClockIn}
                disabled={!!todayAttendance?.check_in_time || clockInLoading || loading}
                className="w-full"
              >
                <ClockIcon className="mr-2 h-4 w-4" />
                {clockInLoading ? 'Clocking In...' : todayAttendance?.check_in_time ? 'Clocked In' : 'Clock In'}
              </Button>
            </div>

            {/* Clock Out */}
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
              <div className="text-center mb-4">
                <div className="text-lg font-medium mb-1">Clock Out</div>
                {todayAttendance?.check_out_time ? (
                  <div className="text-2xl font-bold text-green-600">
                    {new Date(todayAttendance.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    {todayAttendance?.check_in_time ? 'Not clocked out' : 'Clock in first'}
                  </div>
                )}
              </div>
              <Button
                onClick={handleClockOut}
                disabled={!todayAttendance?.check_in_time || !!todayAttendance?.check_out_time || clockOutLoading || loading}
                variant={todayAttendance?.check_in_time && !todayAttendance?.check_out_time ? 'default' : 'outline'}
                className="w-full"
              >
                <ClockIcon className="mr-2 h-4 w-4" />
                {clockOutLoading ? 'Clocking Out...' : todayAttendance?.check_out_time ? 'Clocked Out' : 'Clock Out'}
              </Button>
            </div>
          </div>

          {/* Today's Status */}
          {todayAttendance && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    Today's Status: {getAttendanceStatusBadge()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {todayAttendance.check_in_time && todayAttendance.check_out_time ? (
                      <>
                        Worked: {calculateDuration(todayAttendance.check_in_time, todayAttendance.check_out_time)}
                      </>
                    ) : todayAttendance.check_in_time ? (
                      <>
                        Clocked in at {new Date(todayAttendance.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </>
                    ) : (
                      'Not clocked in yet'
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {todayAttendance.check_in_time ? 'Clocked in' : 'Not clocked in'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {todayAttendance.check_out_time ? 'Clocked out' : todayAttendance.check_in_time ? 'Working' : 'Not working'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common employee tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/employee/attendance">
                <Clock className="mr-2 h-4 w-4" />
                View Attendance History
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/employee/leave-requests">
                <FileText className="mr-2 h-4 w-4" />
                Submit Leave Request
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                View Schedule
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription>
              Your submitted leave requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                Loading leave requests...
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leave requests submitted
              </div>
            ) : (
              <div className="space-y-3">
                {leaveRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)} Leave
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        request.status === 'pending' ? 'secondary' :
                        request.status === 'approved' ? 'default' :
                        'destructive'
                      }>
                        {request.status}
                      </Badge>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/employee/leave-requests/${request.id}`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to calculate duration between two times
function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHrs}h ${diffMins}m`;
}