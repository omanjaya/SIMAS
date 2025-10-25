<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AttendanceAnalyticsController extends Controller
{
    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get attendance trends over a date range
     */
    public function attendanceTrends(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'department' => 'nullable|string',
            'employee_id' => 'nullable|integer',
            'group_by' => 'nullable|in:day,week,month',
        ]);

        $filters['group_by'] = $filters['group_by'] ?? 'day';

        // Create cache key based on filters
        $cacheKey = 'analytics:attendance_trends:'.md5(json_encode($filters));

        // Cache for 5 minutes
        $data = Cache::remember($cacheKey, 300, function () use ($filters) {
            return $this->analyticsService->getAttendanceTrends($filters);
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Get overtime analysis
     */
    public function overtime(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'department' => 'nullable|string',
            'employee_id' => 'nullable|integer',
            'threshold_hours' => 'nullable|numeric|min:0|max:24',
        ]);

        $filters['threshold_hours'] = $filters['threshold_hours'] ?? 8;

        $cacheKey = 'analytics:overtime:'.md5(json_encode($filters));

        $data = Cache::remember($cacheKey, 300, function () use ($filters) {
            return $this->analyticsService->getOvertimeAnalysis($filters);
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Get leave balance forecast
     */
    public function leaveForecast(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
            'department' => 'nullable|string',
            'employee_id' => 'nullable|integer',
        ]);

        $cacheKey = 'analytics:leave_forecast:'.md5(json_encode($filters));

        $data = Cache::remember($cacheKey, 300, function () use ($filters) {
            return $this->analyticsService->getLeaveBalanceForecast(
                $filters['year'],
                $filters['department'] ?? null,
                $filters['employee_id'] ?? null
            );
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Get payroll cost analysis
     */
    public function payrollCost(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'department' => 'nullable|string',
            'group_by' => 'nullable|in:month,department,position',
        ]);

        $filters['group_by'] = $filters['group_by'] ?? 'month';

        $cacheKey = 'analytics:payroll_cost:'.md5(json_encode($filters));

        $data = Cache::remember($cacheKey, 300, function () use ($filters) {
            return $this->analyticsService->getPayrollCostAnalysis($filters);
        });

        return response()->json(['success' => true, 'data' => $data]);
    }
}
