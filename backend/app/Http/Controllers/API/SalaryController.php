<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSalaryRequest;
use App\Http\Requests\UpdateSalaryRequest;
use App\Models\Salary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalaryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Salary::with(['employee', 'updatedBy']);

        // For admin users, show all salary records
        // For regular users, show only their own
        if (! $user->isAdmin()) {
            $query->where('employee_id', $user->employee->id ?? null);
        }

        // Apply active filter if provided
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Apply date range filter if provided
        if ($request->has('effective_from') && $request->has('effective_to')) {
            $query->where(function ($q) use ($request) {
                $q->whereBetween('effective_from', [$request->effective_from, $request->effective_to])
                    ->orWhereBetween('effective_to', [$request->effective_from, $request->effective_to])
                    ->orWhere(function ($subQuery) use ($request) {
                        $subQuery->where('effective_from', '<=', $request->effective_from)
                            ->where('effective_to', '>=', $request->effective_to);
                    });
            });
        }

        $salaries = $query->orderBy('created_at', 'desc')->get();

        return response()->json($salaries);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSalaryRequest $request): JsonResponse
    {
        $user = $request->user();

        // Only admin users can create salary records
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->merge(['updated_by' => $user->id]); // Set who created this record

        $salary = Salary::create($request->validated());

        return response()->json([
            'message' => 'Salary record created successfully',
            'salary' => $salary->load(['employee', 'updatedBy']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Salary $salary): JsonResponse
    {
        $user = auth()->user();

        // Check if the user can view this salary record
        if (! $user->isAdmin() && $salary->employee_id !== $user->employee?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($salary->load(['employee', 'updatedBy']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSalaryRequest $request, Salary $salary): JsonResponse
    {
        $user = $request->user();

        // Only admin users can update salary records
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->merge(['updated_by' => $user->id]); // Track who updated this record

        $salary->update($request->validated());

        return response()->json([
            'message' => 'Salary record updated successfully',
            'salary' => $salary->load(['employee', 'updatedBy']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Salary $salary): JsonResponse
    {
        $user = auth()->user();

        // Only admin can delete salary records
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $salary->delete();

        return response()->json([
            'message' => 'Salary record deleted successfully',
        ]);
    }

    /**
     * Generate payroll summary for a specific employee and month.
     */
    public function payrollSummary(Request $request, $employeeId = null): JsonResponse
    {
        $user = $request->user();

        // If no employeeId is provided, use the authenticated user's employee
        if (! $employeeId) {
            $employeeId = $user->employee->id ?? null;
            if (! $employeeId) {
                return response()->json(['message' => 'Employee not found'], 404);
            }
        }

        // Allow only admin or the employee themselves to access this
        if (! $user->isAdmin() && $employeeId !== $user->employee?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get the month and year from request or use current month
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);

        // Create date range for the month
        $startDate = now()->year($year)->month($month)->startOfMonth();
        $endDate = now()->year($year)->month($month)->endOfMonth();

        // Get the employee's salary for this period
        $salary = Salary::where('employee_id', $employeeId)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->where('effective_from', '<=', $endDate)
                    ->where(function ($subQuery) use ($startDate) {
                        $subQuery->whereNull('effective_to')
                            ->orWhere('effective_to', '>=', $startDate);
                    });
            })
            ->where('is_active', true)
            ->first();

        if (! $salary) {
            return response()->json(['message' => 'No active salary record found for the specified period'], 404);
        }

        // Get attendance records for the month
        $attendanceRecords = \App\Models\Attendance::where('employee_id', $employeeId)
            ->whereBetween('check_in_time', [$startDate, $endDate])
            ->get();

        // Calculate working days and hours
        $totalDays = $attendanceRecords->count();
        $totalHours = 0;
        $overtimeHours = 0;
        $lateCount = 0;
        $absentDays = 0;

        foreach ($attendanceRecords as $attendance) {
            if ($attendance->getWorkDurationAttribute()) {
                $totalHours += $attendance->getWorkDurationAttribute() / 60; // Convert minutes to hours
            }

            if ($attendance->wasLate()) {
                $lateCount++;
            }

            if ($attendance->is_late) {
                $lateCount++;
            }

            if ($attendance->overtime_minutes > 0) {
                $overtimeHours += $attendance->overtime_minutes / 60;
            }
        }

        // Calculate basic salary
        $baseSalary = $salary->base_salary;

        // Calculate overtime pay
        $overtimePay = 0;
        if ($salary->overtime_rate > 0) {
            $overtimePay = $overtimeHours * $salary->overtime_rate;
        }

        // Calculate allowances
        $allowances = $salary->allowances ? array_sum($salary->allowances) : 0;

        // Calculate bonuses
        $bonuses = $salary->bonuses;

        // Calculate total
        $totalEarnings = $baseSalary + $overtimePay + $allowances + $bonuses;

        // Calculate deductions
        $deductions = $salary->deductions;

        // Calculate net salary
        $netSalary = $totalEarnings - $deductions;

        $payrollData = [
            'employee_id' => $employeeId,
            'period' => [
                'year' => $year,
                'month' => $month,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
            'salary_details' => [
                'base_salary' => $baseSalary,
                'salary_type' => $salary->salary_type,
                'overtime_rate' => $salary->overtime_rate,
                'hourly_rate' => $salary->hourly_rate,
            ],
            'attendance_summary' => [
                'total_days' => $totalDays,
                'total_hours' => round($totalHours, 2),
                'overtime_hours' => round($overtimeHours, 2),
                'late_count' => $lateCount,
                'absent_days' => $absentDays,
            ],
            'earnings' => [
                'base_salary' => $baseSalary,
                'overtime_pay' => $overtimePay,
                'allowances' => $allowances,
                'bonuses' => $bonuses,
                'total_earnings' => $totalEarnings,
            ],
            'deductions' => [
                'total_deductions' => $deductions,
            ],
            'net_salary' => $netSalary,
        ];

        // TODO: Future enhancement - implement actual payroll calculation based on company policies
        // TODO: Future enhancement - implement tax calculation
        // TODO: Future enhancement - implement export to CSV/PDF

        return response()->json($payrollData);
    }

    /**
     * Export payroll data (stub for CSV export).
     */
    public function exportPayroll(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only admin can export payroll data
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get filters from request
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);
        $department = $request->get('department');

        // This is a stub - in a real implementation, this would generate a CSV file
        $payrollData = [
            'export_info' => [
                'year' => $year,
                'month' => $month,
                'department' => $department,
                'generated_at' => now(),
            ],
            'message' => 'Payroll export functionality would generate a CSV file with employee salary information',
            // TODO: In a real implementation, this would query the database and format as CSV
        ];

        // TODO: Future enhancement - implement actual CSV export functionality
        return response()->json($payrollData);
    }
}
