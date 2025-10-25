// src/app/(dashboard)/teacher/page.tsx
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
  BookOpen, 
  CalendarCheck,
  CalendarClock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useEmployeeSchedules } from '@/hooks/use-schedules';
import { useEmployeeLeaveRequests } from '@/hooks/use-leave-requests';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { schedules, loading: schedulesLoading } = useEmployeeSchedules(user?.employee?.id || 0);
  const { leaveRequests, loading: leaveRequestsLoading } = useEmployeeLeaveRequests(user?.id || 0);
  const [stats, setStats] = useState({
    todaySchedules: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    totalTeachingHours: 0,
  });

  useEffect(() => {
    if (!schedulesLoading && !leaveRequestsLoading) {
      const today = new Date().toISOString().split('T')[0];
      const todaySchedules = schedules.filter(s => s.date === today).length;
      const pendingLeaves = leaveRequests.filter(lr => lr.status === 'pending').length;
      const approvedLeaves = leaveRequests.filter(lr => lr.status === 'approved').length;
      
      // Calculate total teaching hours (simplified)
      const totalTeachingHours = schedules.reduce((total, schedule) => {
        // Simplified calculation - in reality, would calculate from period times
        return total + 1; // 1 hour per schedule for demo
      }, 0);

      setStats({
        todaySchedules,
        pendingLeaves,
        approvedLeaves,
        totalTeachingHours,
      });
    }
  }, [schedules, leaveRequests, schedulesLoading, leaveRequestsLoading]);

  const loading = schedulesLoading || leaveRequestsLoading;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          View your schedule and manage your teaching duties
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Classes"
          value={loading ? '-' : stats.todaySchedules}
          icon={<Calendar className="h-4 w-4" />}
          description="Scheduled for today"
          trend={{
            value: 0,
            isPositive: true,
            text: "No changes"
          }}
        />
        <StatCard
          title="Pending Leaves"
          value={loading ? '-' : stats.pendingLeaves}
          icon={<FileText className="h-4 w-4" />}
          description="Awaiting approval"
          trend={{
            value: 0,
            isPositive: false,
            text: "No changes"
          }}
        />
        <StatCard
          title="Approved Leaves"
          value={loading ? '-' : stats.approvedLeaves}
          icon={<CalendarCheck className="h-4 w-4" />}
          description="This month"
          trend={{
            value: 2,
            isPositive: true,
            text: "from last month"
          }}
        />
        <StatCard
          title="Teaching Hours"
          value={loading ? '-' : stats.totalTeachingHours}
          icon={<Clock className="h-4 w-4" />}
          description="This month"
          trend={{
            value: 5,
            isPositive: true,
            text: "from last month"
          }}
        />
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Teaching Schedule</CardTitle>
          <CardDescription>
            Your classes scheduled for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
              Loading schedule...
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No classes scheduled for today
            </div>
          ) : (
            <div className="space-y-3">
              {schedules
                .filter(s => s.date === new Date().toISOString().split('T')[0])
                .map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {schedule.subject} - {schedule.class_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {schedule.period?.name || 'Period'} • Room {schedule.room_number || 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {schedule.schedule_type.replace('_', ' ')}
                      </Badge>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/schedule/${schedule.id}`}>
                          <BookOpen className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
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
              Common teacher tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                View Full Schedule
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/teacher/leave-requests">
                <FileText className="mr-2 h-4 w-4" />
                Submit Leave Request
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/attendance">
                <Clock className="mr-2 h-4 w-4" />
                View Attendance
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
                        <Link href={`/dashboard/teacher/leave-requests/${request.id}`}>
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