<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AttendanceValidation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AttendanceValidationController extends Controller
{
    /**
     * Get failed validation attempts (Admin only)
     */
    public function failedAttempts(Request $request): JsonResponse
    {
        $query = AttendanceValidation::query()
            ->with(['employee'])
            ->failed();

        // Filter by employee
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // Filter by validation type
        if ($request->has('type')) {
            $query->where('validation_type', $request->type);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $validations = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $validations->items(),
            'total' => $validations->total(),
            'current_page' => $validations->currentPage(),
            'last_page' => $validations->lastPage(),
        ]);
    }

    /**
     * Get validation statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $stats = [
            'total_validations' => AttendanceValidation::whereBetween('created_at', [$startDate, $endDate])->count(),
            'passed' => AttendanceValidation::whereBetween('created_at', [$startDate, $endDate])->passed()->count(),
            'failed' => AttendanceValidation::whereBetween('created_at', [$startDate, $endDate])->failed()->count(),
            'by_type' => [
                'check_in' => AttendanceValidation::whereBetween('created_at', [$startDate, $endDate])->checkIn()->count(),
                'check_out' => AttendanceValidation::whereBetween('created_at', [$startDate, $endDate])->checkOut()->count(),
            ],
            'failed_reasons' => AttendanceValidation::whereBetween('created_at', [$startDate, $endDate])
                ->failed()
                ->selectRaw('failed_reason, COUNT(*) as count')
                ->groupBy('failed_reason')
                ->orderByDesc('count')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * Get validation detail
     */
    public function show(AttendanceValidation $attendanceValidation): JsonResponse
    {
        $attendanceValidation->load(['employee', 'attendance']);

        return response()->json([
            'success' => true,
            'data' => $attendanceValidation->getValidationSummary(),
        ]);
    }
}
