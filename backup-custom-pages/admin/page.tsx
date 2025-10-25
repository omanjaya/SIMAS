// src/app/(dashboard)/admin/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/stat-card';
import { 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertCircle,
  ClockIcon
} from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import { useLeaveRequests } from '@/hooks/use-leave-requests';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { employees, loading: employeesLoading } = useEmployees();
  const { leaveRequests, loading: leaveRequestsLoading } = useLeaveRequests();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    totalSalary: 0,
    avgAttendanceRate: 0,
  });

  useEffect(() => {
    if (!employeesLoading && !leaveRequestsLoading) {
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(e => e.status === 'active').length;
      const pendingLeaves = leaveRequests.filter(lr => lr.status === 'pending').length;
      const approvedLeaves = leaveRequests.filter(lr => lr.status === 'approved').length;
      const rejectedLeaves = leaveRequests.filter(lr => lr.status === 'rejected').length;
      
      // Calculate average attendance rate (simplified)
      const avgAttendanceRate = 95; // Placeholder - would be calculated from actual data

      setStats({
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        totalSalary: 0, // Would be calculated from salary data
        avgAttendanceRate,
      });
    }
  }, [employees, leaveRequests, employeesLoading, leaveRequestsLoading]);

  const loading = employeesLoading || leaveRequestsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your organization's employees, schedules, and attendance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={loading ? '-' : stats.totalEmployees}
          icon={<Users className="h-4 w-4" />}
          description={`${loading ? '-' : stats.activeEmployees} active`}
          trend={{
            value: 12,
            isPositive: true,
            text: "from last month"
          }}
        />
        <StatCard
          title="Pending Leaves"
          value={loading ? '-' : stats.pendingLeaves}
          icon={<FileText className="h-4 w-4" />}
          description="Requires approval"
          trend={{
            value: 5,
            isPositive: false,
            text: "from last week"
          }}
        />
        <StatCard
          title="Attendance Rate"
          value={loading ? '-' : `${stats.avgAttendanceRate}%`}
          icon={<ClockIcon className="h-4 w-4" />}
          description="This month"
          trend={{
            value: 2,
            isPositive: true,
            text: "improvement"
          }}
        />
        <StatCard
          title="Monthly Payroll"
          value={loading ? '-' : 'Rp 850M'}
          icon={<DollarSign className="h-4 w-4" />}
          description="Processed"
          trend={{
            value: 8,
            isPositive: true,
            text: "from last month"
          }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/employees/create">
                <Users className="mr-2 h-4 w-4" />
                Add New Employee
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/schedules/create">
                <Calendar className="mr-2 h-4 w-4" />
                Assign Schedule
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/leave-requests">
                <FileText className="mr-2 h-4 w-4" />
                Review Leave Requests
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/payroll">
                <DollarSign className="mr-2 h-4 w-4" />
                Process Payroll
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription>
              Latest employee leave submissions
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
                No leave requests found
              </div>
            ) : (
              <div className="space-y-3">
                {leaveRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {request.employee?.first_name} {request.employee?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {request.leave_type} • {request.total_days} days
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
                        <Link href={`/dashboard/leave-requests/${request.id}`}>
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

      {/* Employee Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Distribution</CardTitle>
          <CardDescription>
            By department and employment type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
              Loading employee distribution...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">By Department</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>IT</span>
                    <span>25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HR</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Finance</span>
                    <span>18</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Academics</span>
                    <span>65</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Administration</span>
                    <span>22</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">By Employment Type</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Full-time</span>
                    <span>120</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Part-time</span>
                    <span>15</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contract</span>
                    <span>8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Intern</span>
                    <span>7</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">By Status</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Active</span>
                    <span>{stats.activeEmployees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inactive</span>
                    <span>{employees.filter(e => e.status === 'inactive').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Terminated</span>
                    <span>{employees.filter(e => e.status === 'terminated').length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}