<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MyAttendanceController extends Controller
{
    /**
     * Get authenticated user's attendance history
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

        // Get query parameters
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());
        $perPage = $request->input('per_page', 15);

        // Get attendance records
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('clock_in_time', [$startDate, $endDate])
            ->with(['period', 'location', 'employee'])
            ->orderBy('clock_in_time', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $attendances,
        ]);
    }

    /**
     * Get today's attendance status
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function today(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        // Get today's attendance
        $today = Carbon::today();
        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('clock_in_time', $today)
            ->with(['period', 'location'])
            ->first();

        // Get today's schedule
        $dayOfWeek = Carbon::now()->dayOfWeek;
        $schedule = $employee->schedules()
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->with('location')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'attendance' => $attendance,
                'schedule' => $schedule,
                'current_time' => Carbon::now()->toDateTimeString(),
                'can_clock_in' => !$attendance,
                'can_clock_out' => $attendance && !$attendance->clock_out_time,
                'status' => $this->getAttendanceStatus($attendance, $schedule),
            ],
        ]);
    }

    /**
     * Get attendance statistics
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        // Get period (default: current month)
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // Count statistics
        $totalDays = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;

        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('clock_in_time', [$startDate, $endDate])
            ->get();

        $present = $attendances->count();
        $late = $attendances->where('status', 'late')->count();
        $onTime = $attendances->where('status', 'present')->count();
        $absent = $totalDays - $present;

        // Calculate working hours
        $totalWorkingHours = 0;
        foreach ($attendances as $attendance) {
            if ($attendance->clock_out_time) {
                $clockIn = Carbon::parse($attendance->clock_in_time);
                $clockOut = Carbon::parse($attendance->clock_out_time);
                $totalWorkingHours += $clockIn->diffInMinutes($clockOut) / 60;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'total_days' => $totalDays,
                ],
                'summary' => [
                    'present' => $present,
                    'absent' => $absent,
                    'late' => $late,
                    'on_time' => $onTime,
                    'attendance_rate' => $totalDays > 0 ? round(($present / $totalDays) * 100, 2) : 0,
                ],
                'working_hours' => [
                    'total' => round($totalWorkingHours, 2),
                    'average_per_day' => $present > 0 ? round($totalWorkingHours / $present, 2) : 0,
                ],
            ],
        ]);
    }

    /**
     * Get monthly summary
     *
     * @param Request $request
     * @param int $month
     * @return JsonResponse
     */
    public function monthlySummary(Request $request, int $month): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        // Validate month (1-12)
        if ($month < 1 || $month > 12) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid month. Must be between 1 and 12',
            ], 422);
        }

        $year = $request->input('year', Carbon::now()->year);

        // Get month date range
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        // Get attendances for the month
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('clock_in_time', [$startDate, $endDate])
            ->orderBy('clock_in_time', 'asc')
            ->get();

        // NEW: Get leave requests for the month
        $leaveRequests = \App\Models\LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'approved')  // Only approved leaves
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                      ->orWhereBetween('end_date', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                      });
            })
            ->get();

        // Calculate leave days by type
        $leaveDays = [
            'annual' => 0,    // Cuti
            'sick' => 0,      // Sakit
            'official_duty' => 0,  // Dinas/Diklat
            'permission' => 0,     // Ijin
        ];

        foreach ($leaveRequests as $leave) {
            $leaveStart = max(Carbon::parse($leave->start_date), $startDate);
            $leaveEnd = min(Carbon::parse($leave->end_date), $endDate);
            $days = $leaveStart->diffInDays($leaveEnd) + 1;

            if (isset($leaveDays[$leave->leave_type])) {
                $leaveDays[$leave->leave_type] += $days;
            }
        }

        // Group by date
        $dailySummary = [];
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->toDateString();
            $attendance = $attendances->firstWhere(function ($item) use ($currentDate) {
                return Carbon::parse($item->clock_in_time)->isSameDay($currentDate);
            });

            // Check if date is in leave
            $leaveType = null;
            foreach ($leaveRequests as $leave) {
                if ($currentDate->between($leave->start_date, $leave->end_date)) {
                    $leaveType = $leave->leave_type;
                    break;
                }
            }

            $dailySummary[] = [
                'date' => $dateStr,
                'day_of_week' => $currentDate->dayOfWeek,
                'day_name' => $currentDate->format('l'),
                'has_attendance' => $attendance !== null,
                'status' => $attendance ? $attendance->status : ($leaveType ? $leaveType : 'absent'),
                'leave_type' => $leaveType,  // NEW
                'clock_in_time' => $attendance ? $attendance->clock_in_time : null,
                'clock_out_time' => $attendance ? $attendance->clock_out_time : null,
            ];

            $currentDate->addDay();
        }

        // Calculate statistics
        $totalDays = $endDate->day;
        $present = $attendances->count();
        $late = $attendances->where('status', 'late')->count();
        $onTime = $attendances->where('status', 'present')->count();

        // Calculate weekends/holidays (libur)
        $weekends = 0;
        $tempDate = $startDate->copy();
        while ($tempDate <= $endDate) {
            if ($tempDate->isWeekend()) {
                $weekends++;
            }
            $tempDate->addDay();
        }

        // Working days = total days - weekends
        $workingDays = $totalDays - $weekends;

        // Absent = working days - present - leave days
        $totalLeaveDays = array_sum($leaveDays);
        $absent = max(0, $workingDays - $present - $totalLeaveDays);

        return response()->json([
            'success' => true,
            'data' => [
                'month' => $month,
                'year' => $year,
                'summary' => [
                    'total_days' => $totalDays,
                    'working_days' => $workingDays,
                    'weekends' => $weekends,
                    'present' => $present,
                    'absent' => $absent,
                    'late' => $late,
                    'on_time' => $onTime,
                    'leaves' => [  // NEW
                        'annual' => $leaveDays['annual'],        // Cuti
                        'sick' => $leaveDays['sick'],            // Sakit
                        'official_duty' => $leaveDays['official_duty'],  // Dinas/Diklat
                        'permission' => $leaveDays['permission'], // Ijin
                        'total' => $totalLeaveDays,
                    ],
                    'attendance_rate' => $workingDays > 0 ? round((($present + $totalLeaveDays) / $workingDays) * 100, 2) : 0,
                ],
                'daily' => $dailySummary,
            ],
        ]);
    }

    /**
     * Determine attendance status
     *
     * @param Attendance|null $attendance
     * @param EmployeeSchedule|null $schedule
     * @return string
     */
    private function getAttendanceStatus($attendance, $schedule): string
    {
        if (!$attendance) {
            return 'not_clocked_in';
        }

        if (!$attendance->clock_out_time) {
            return 'clocked_in';
        }

        return 'completed';
    }
}