<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyDashboardController extends Controller
{
    /**
     * Get dashboard overview for authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        // Get today's schedule
        $today = Carbon::now()->dayOfWeek;
        $todaySchedule = $employee->schedules()
            ->where('day_of_week', $today)
            ->where('is_active', true)
            ->with('location')
            ->first();

        // Get today's attendance
        $todayAttendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('clock_in_time', Carbon::today())
            ->with('period')
            ->first();

        // Get this month's statistics
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $monthlyAttendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('clock_in_time', [$startOfMonth, $endOfMonth])
            ->get();

        $totalDays = $endOfMonth->day;
        $present = $monthlyAttendances->count();
        $late = $monthlyAttendances->where('status', 'late')->count();
        $onTime = $monthlyAttendances->where('status', 'present')->count();
        $absent = $totalDays - $present;

        // Get pending leave requests
        $pendingLeaves = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'pending')
            ->count();

        // Get approved leave requests (future)
        $approvedLeaves = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where('end_date', '>=', Carbon::today())
            ->get();

        // Get recent attendance (last 7 days)
        $recentAttendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('clock_in_time', [Carbon::now()->subDays(7), Carbon::now()])
            ->orderBy('clock_in_time', 'desc')
            ->limit(7)
            ->get();

        // Calculate working hours this month
        $totalWorkingHours = 0;
        foreach ($monthlyAttendances as $attendance) {
            if ($attendance->clock_out_time) {
                $clockIn = Carbon::parse($attendance->clock_in_time);
                $clockOut = Carbon::parse($attendance->clock_out_time);
                $totalWorkingHours += $clockIn->diffInMinutes($clockOut) / 60;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'name' => $user->name,
                    'employee_code' => $employee->employee_code,
                    'position' => $employee->position,
                    'department' => $employee->department,
                ],
                'today' => [
                    'date' => Carbon::now()->toDateString(),
                    'day' => Carbon::now()->format('l'),
                    'schedule' => $todaySchedule ? [
                        'start_time' => $todaySchedule->start_time,
                        'end_time' => $todaySchedule->end_time,
                        'location' => $todaySchedule->location ? [
                            'name' => $todaySchedule->location->name,
                            'address' => $todaySchedule->location->address,
                        ] : null,
                    ] : null,
                    'attendance' => $todayAttendance ? [
                        'clock_in_time' => $todayAttendance->clock_in_time,
                        'clock_out_time' => $todayAttendance->clock_out_time,
                        'status' => $todayAttendance->status,
                    ] : null,
                    'can_clock_in' => !$todayAttendance,
                    'can_clock_out' => $todayAttendance && !$todayAttendance->clock_out_time,
                ],
                'monthly_summary' => [
                    'month' => Carbon::now()->format('F Y'),
                    'total_days' => $totalDays,
                    'present' => $present,
                    'absent' => $absent,
                    'late' => $late,
                    'on_time' => $onTime,
                    'attendance_rate' => $totalDays > 0 ? round(($present / $totalDays) * 100, 2) : 0,
                    'total_working_hours' => round($totalWorkingHours, 2),
                    'average_hours_per_day' => $present > 0 ? round($totalWorkingHours / $present, 2) : 0,
                ],
                'leave_requests' => [
                    'pending' => $pendingLeaves,
                    'approved_upcoming' => $approvedLeaves->count(),
                ],
                'recent_attendance' => $recentAttendances->map(function ($attendance) {
                    return [
                        'date' => Carbon::parse($attendance->clock_in_time)->toDateString(),
                        'clock_in_time' => $attendance->clock_in_time,
                        'clock_out_time' => $attendance->clock_out_time,
                        'status' => $attendance->status,
                    ];
                }),
            ],
        ]);
    }
}