<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\EmployeeSchedule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyScheduleController extends Controller
{
    /**
     * Get authenticated user's schedule
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get employee record from user
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        // Get today's schedule
        $today = Carbon::now()->dayOfWeek; // 0 = Sunday, 1 = Monday, etc.
        $todaySchedule = $employee->schedules()
            ->where('day_of_week', $today)
            ->where('is_active', true)
            ->with('location')
            ->first();

        // Get this week's schedules
        $weekSchedules = $employee->schedules()
            ->where('is_active', true)
            ->with('location')
            ->orderBy('day_of_week')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'today' => $todaySchedule,
                'week' => $weekSchedules,
                'current_time' => Carbon::now()->toDateTimeString(),
                'current_day' => $today,
            ],
        ]);
    }

    /**
     * Get weekly schedule
     *
     * @return JsonResponse
     */
    public function weekly(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        $schedules = $employee->schedules()
            ->where('is_active', true)
            ->with('location')
            ->orderBy('day_of_week')
            ->get()
            ->map(function ($schedule) {
                return [
                    'day_of_week' => $schedule->day_of_week,
                    'day_name' => $this->getDayName($schedule->day_of_week),
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'location' => $schedule->location ? [
                        'id' => $schedule->location->id,
                        'name' => $schedule->location->name,
                        'address' => $schedule->location->address,
                        'latitude' => $schedule->location->latitude,
                        'longitude' => $schedule->location->longitude,
                        'radius' => $schedule->location->radius,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $schedules,
        ]);
    }

    /**
     * Get monthly schedule
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function monthly(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        // Get month and year from request (default to current month)
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        // Get employee's active schedules
        $schedules = $employee->schedules()
            ->where('is_active', true)
            ->with('location')
            ->get()
            ->keyBy('day_of_week');

        // Generate calendar for the month
        $startDate = Carbon::create($year, $month, 1);
        $endDate = $startDate->copy()->endOfMonth();

        $calendar = [];
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $dayOfWeek = $currentDate->dayOfWeek;
            $schedule = $schedules->get($dayOfWeek);

            $calendar[] = [
                'date' => $currentDate->toDateString(),
                'day_of_week' => $dayOfWeek,
                'day_name' => $this->getDayName($dayOfWeek),
                'has_schedule' => $schedule !== null,
                'schedule' => $schedule ? [
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'location' => $schedule->location ? [
                        'id' => $schedule->location->id,
                        'name' => $schedule->location->name,
                    ] : null,
                ] : null,
            ];

            $currentDate->addDay();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'month' => $month,
                'year' => $year,
                'calendar' => $calendar,
            ],
        ]);
    }

    /**
     * Get day name from day of week number
     *
     * @param int $dayOfWeek
     * @return string
     */
    private function getDayName(int $dayOfWeek): string
    {
        $days = [
            0 => 'Sunday',
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday',
        ];

        return $days[$dayOfWeek] ?? 'Unknown';
    }
}