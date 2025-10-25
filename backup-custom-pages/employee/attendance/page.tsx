// src/app/(dashboard)/employee/attendance/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, AlertCircle, ClockIcon, CalendarDays } from 'lucide-react';
import { useTodayAttendance } from '@/hooks/use-attendance';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { Attendance } from '@/types/attendance';
import { useClockIn, useClockOut } from '@/hooks/use-attendance';
import { useToast } from '@/hooks/use-toast';
import { useEmployeeAttendance } from '@/hooks/use-attendance';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { FaceEnrollmentModal } from '@/components/employee/face-enrollment-modal';
import { FaceTemplateStatus } from '@/components/employee/face-template-status';
import { LiveTimer } from '@/components/attendance/live-timer';

export default function EmployeeAttendancePage() {
  useProtectedRoute('employee');
  const { user } = useAuth();
  const { todayAttendance, loading: todayLoading, error: todayError } = useTodayAttendance(user?.id || 0);
  const { clockIn, loading: clockInLoading } = useClockIn();
  const { clockOut, loading: clockOutLoading } = useClockOut();
  const { attendance, loading: historyLoading, error: historyError } = useEmployeeAttendance(user?.id || 0);
  const { faceTemplate, loading: faceLoading, refetch: refetchFace } = useFaceTemplate(user?.id || 0);
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleClockIn = async () => {
    try {
      await clockIn({
        employee_id: user?.id || 0,
        attendance_type: 'manual',
        // You might want to add location data here
        // check_in_location: 'Office',
      });
      toast({
        title: 'Success',
        description: 'Clocked in successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clock in',
        variant: 'destructive',
      });
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut({
        employee_id: user?.id || 0,
        attendance_type: 'manual',
        // You might want to add location data here
        // check_out_location: 'Office',
      });
      toast({
        title: 'Success',
        description: 'Clocked out successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clock out',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Present</Badge>;
      case 'late':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertCircle className="mr-1 h-3 w-3" /> Late</Badge>;
      case 'absent':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertCircle className="mr-1 h-3 w-3" /> Absent</Badge>;
      case 'half_day':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800"><AlertCircle className="mr-1 h-3 w-3" /> Half Day</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateDuration = (checkIn: string, checkOut: string) => {
    const inTime = new Date(checkIn).getTime();
    const outTime = new Date(checkOut).getTime();
    const diffMs = outTime - inTime;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground">
          Track your daily attendance and work hours
        </p>
      </div>

      {/* Face Recognition Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Face Recognition Setup</CardTitle>
          <CardDescription>
            Enroll your face for contactless attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <FaceTemplateStatus 
                status={faceTemplate ? 'enrolled' : 'not_enrolled'}
                lastEnrolled={faceTemplate?.updated_at}
              />
              <p className="text-sm text-muted-foreground">
                {faceTemplate
                  ? 'Your face is enrolled. You can use face recognition for attendance.'
                  : 'Enroll your face to enable contactless clock in/out.'}
              </p>
            </div>
            <FaceEnrollmentModal
              employeeId={user?.id || 0}
              currentStatus={faceTemplate ? 'enrolled' : 'not_enrolled'}
              lastEnrolled={faceTemplate?.updated_at}
              onEnrollmentComplete={refetchFace}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clock In/Out Section */}
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
              <CalendarDays className="h-8 w-8 text-muted-foreground mb-2" />
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
                    {formatTime(todayAttendance.check_in_time)}
                  </div>
                ) : (
                  <div className="text-muted-foreground">Not clocked in</div>
                )}
              </div>
              <Button
                onClick={handleClockIn}
                disabled={!!todayAttendance?.check_in_time || clockInLoading}
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
                    {formatTime(todayAttendance.check_out_time)}
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    {todayAttendance?.check_in_time ? 'Not clocked out' : 'Clock in first'}
                  </div>
                )}
              </div>
              <Button
                onClick={handleClockOut}
                disabled={!todayAttendance?.check_in_time || !!todayAttendance?.check_out_time || clockOutLoading}
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
                    Today's Status: {getStatusBadge(todayAttendance.status)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {todayAttendance.check_in_time && todayAttendance.check_out_time ? (
                      <>
                        Worked: {calculateDuration(todayAttendance.check_in_time, todayAttendance.check_out_time)}
                      </>
                    ) : todayAttendance.check_in_time ? (
                      <>
                        Clocked in at {formatTime(todayAttendance.check_in_time)}
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
              
              {todayAttendance?.check_in_time && !todayAttendance?.check_out_time && (
                <div className="mt-2">
                  <div className="text-sm text-muted-foreground mb-1">Active Session</div>
                  <LiveTimer checkInTime={todayAttendance.check_in_time} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>
            View your recent attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading attendance history...</p>
              </div>
            ) : historyError ? (
              <div className="text-center py-8 text-destructive">
                Error loading attendance history: {historyError.message}
              </div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found
              </div>
            ) : (
              attendance.slice(0, 5).map((record: Attendance) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {formatDate(record.check_in_time)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {record.check_in_time && record.check_out_time ? (
                        `Worked: ${calculateDuration(record.check_in_time, record.check_out_time)}`
                      ) : record.check_in_time ? (
                        `Clocked in: ${formatTime(record.check_in_time)}`
                      ) : (
                        'No clock in record'
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="font-medium">
                          {record.check_in_time ? formatTime(record.check_in_time) : 'N/A'}
                        </span>
                        <span className="mx-2">-</span>
                        <span className="font-medium">
                          {record.check_out_time ? formatTime(record.check_out_time) : 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {record.check_in_time && record.check_out_time ? 'Duration' : 'Times'}
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                </div>
              ))
            )}
            {attendance.length > 5 && (
              <Button variant="outline" className="w-full">
                View All History ({attendance.length} records)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendance.filter(a => a.status === 'present').length}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Days</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendance.filter(a => a.status === 'late').length}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendance.filter(a => a.status === 'absent').length}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendance.reduce((total, record) => {
                if (record.check_in_time && record.check_out_time) {
                  const inTime = new Date(record.check_in_time).getTime();
                  const outTime = new Date(record.check_out_time).getTime();
                  const diffHrs = Math.floor((outTime - inTime) / (1000 * 60 * 60));
                  return total + diffHrs;
                }
                return total;
              }, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}