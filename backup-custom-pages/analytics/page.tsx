'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Calendar, TrendingUp, Users, DollarSign, BarChart3, CalendarDays, FileSpreadsheet } from 'lucide-react';
import { AttendanceTrendsChart } from '@/components/analytics/attendance-trends-chart';
import { OvertimeChart } from '@/components/analytics/overtime-chart';
import { LeaveBalanceTable } from '@/components/analytics/leave-balance-table';
import { PayrollCostChart } from '@/components/analytics/payroll-cost-chart';
import { AnalyticsFilters } from '@/components/analytics/analytics-filters';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { useState } from 'react';

export default function AnalyticsPage() {
  useProtectedRoute('admin'); // Only admin can access analytics

  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    department: '',
    groupBy: 'day' as 'day' | 'week' | 'month',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics and insights for attendance, overtime, leave, and payroll
        </p>
      </div>

      {/* Global Filters */}
      <AnalyticsFilters filters={filters} onFilterChange={setFilters} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Overtime</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156.5h</div>
            <p className="text-xs text-muted-foreground">+12.3h from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">5 pending approvals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Cost</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 1.25M</div>
            <p className="text-xs text-muted-foreground">Monthly total</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Analytics */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">
            <TrendingUp className="mr-2 h-4 w-4" />
            Attendance Trends
          </TabsTrigger>
          <TabsTrigger value="overtime">
            <CalendarDays className="mr-2 h-4 w-4" />
            Overtime Analysis
          </TabsTrigger>
          <TabsTrigger value="leave">
            <Users className="mr-2 h-4 w-4" />
            Leave Forecast
          </TabsTrigger>
          <TabsTrigger value="payroll">
            <DollarSign className="mr-2 h-4 w-4" />
            Payroll Cost
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceTrendsChart filters={filters} />
        </TabsContent>

        <TabsContent value="overtime" className="space-y-4">
          <OvertimeChart filters={filters} />
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <LeaveBalanceTable filters={filters} />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <PayrollCostChart filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  );
}