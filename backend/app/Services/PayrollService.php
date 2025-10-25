<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\PayrollApproval;
use App\Models\Salary;
use Carbon\Carbon;

class PayrollService
{
    protected $taxService;

    public function __construct(TaxCalculationService $taxService)
    {
        $this->taxService = $taxService;
    }

    /**
     * Calculate payroll for a single employee
     */
    public function calculateEmployeePayroll(int $employeeId, int $year, int $month): ?array
    {
        $employee = Employee::with('salaries')->find($employeeId);

        if (! $employee) {
            return null;
        }

        // Get active salary for the period
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        $salary = Salary::where('employee_id', $employeeId)
            ->where('is_active', true)
            ->where(function ($query) use ($startDate) {
                $query->where('effective_from', '<=', $startDate)
                    ->where(function ($q) use ($startDate) {
                        $q->whereNull('effective_to')
                            ->orWhere('effective_to', '>=', $startDate);
                    });
            })
            ->first();

        if (! $salary) {
            return null;
        }

        // Get attendance records for the period
        $attendances = Attendance::where('employee_id', $employeeId)
            ->whereBetween('check_in_time', [$startDate, $endDate])
            ->get();

        // Calculate attendance summary
        $attendanceSummary = $this->calculateAttendanceSummary($attendances);

        // Calculate overtime pay
        $overtimePay = $attendanceSummary['overtime_hours'] * $salary->overtime_rate;

        // Get allowances
        $allowances = $salary->allowances ?? [];
        $totalAllowances = is_array($allowances) ? array_sum($allowances) : 0;

        // Calculate gross salary
        $grossSalary = $salary->base_salary + $overtimePay + $totalAllowances + $salary->bonuses;

        // Calculate tax using TaxCalculationService
        // Get employee marital status and dependents (default values if not available)
        $maritalStatus = $employee->marital_status ?? 'TK';
        $dependents = $employee->dependents ?? 0;

        $taxCalculation = $this->taxService->calculateTotalTax(
            $salary->base_salary,
            $allowances,
            [], // Non-tax deductions handled separately
            $maritalStatus,
            $dependents
        );

        // Total deductions (existing deductions + tax)
        $totalDeductions = $salary->deductions + $taxCalculation['monthly_tax'];

        // Net salary
        $netSalary = $grossSalary - $totalDeductions;

        return [
            'employee_id' => $employeeId,
            'employee_name' => $employee->full_name,
            'employee_code' => $employee->employee_code,
            'position' => $employee->position,
            'department' => $employee->department,
            'period' => [
                'year' => $year,
                'month' => $month,
                'month_name' => $startDate->format('F'),
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
            'salary_details' => [
                'base_salary' => $salary->base_salary,
                'salary_type' => $salary->salary_type,
                'hourly_rate' => $salary->hourly_rate,
                'overtime_rate' => $salary->overtime_rate,
            ],
            'attendance_summary' => $attendanceSummary,
            'earnings' => [
                'base_salary' => $salary->base_salary,
                'overtime_pay' => $overtimePay,
                'allowances' => $allowances,
                'total_allowances' => $totalAllowances,
                'bonuses' => $salary->bonuses,
                'total_earnings' => $grossSalary,
            ],
            'deductions' => [
                'fixed_deductions' => $salary->deductions,
                'tax_deductions' => $taxCalculation['monthly_tax'],
                'tax_breakdown' => $taxCalculation['tax_calculation']['annual_calculation']['tax_breakdown'] ?? [],
                'total_deductions' => $totalDeductions,
            ],
            'tax_info' => [
                'ptkp_status' => $taxCalculation['ptkp_status'],
                'ptkp_amount' => $taxCalculation['ptkp_amount'],
                'monthly_tax' => $taxCalculation['monthly_tax'],
                'effective_rate' => $taxCalculation['tax_calculation']['annual_calculation']['effective_rate'] ?? 0,
            ],
            'net_salary' => $netSalary,
            'calculated_at' => now()->toDateTimeString(),
        ];
    }

    /**
     * Calculate attendance summary from attendance records
     */
    protected function calculateAttendanceSummary($attendances): array
    {
        $totalDays = $attendances->count();
        $totalHours = 0;
        $overtimeHours = 0;
        $lateCount = 0;
        $absentDays = 0;

        foreach ($attendances as $attendance) {
            if ($attendance->status === 'absent') {
                $absentDays++;

                continue;
            }

            if ($attendance->is_late) {
                $lateCount++;
            }

            // Calculate work duration in hours
            if ($attendance->check_in_time && $attendance->check_out_time) {
                $checkIn = Carbon::parse($attendance->check_in_time);
                $checkOut = Carbon::parse($attendance->check_out_time);
                $hours = $checkOut->diffInMinutes($checkIn) / 60;
                $totalHours += $hours;
            }

            // Add overtime
            if ($attendance->overtime_minutes > 0) {
                $overtimeHours += $attendance->overtime_minutes / 60;
            }
        }

        return [
            'total_days' => $totalDays,
            'days_present' => $totalDays - $absentDays,
            'days_absent' => $absentDays,
            'days_late' => $lateCount,
            'total_hours' => round($totalHours, 2),
            'overtime_hours' => round($overtimeHours, 2),
        ];
    }

    /**
     * Generate bulk payroll for all employees in a period
     *
     * @param  array  $employeeIds  Optional array of specific employee IDs
     */
    public function generateBulkPayroll(int $year, int $month, array $employeeIds = []): array
    {
        $query = Employee::query()->where('status', 'active');

        if (! empty($employeeIds)) {
            $query->whereIn('id', $employeeIds);
        }

        $employees = $query->get();

        $results = [
            'total' => $employees->count(),
            'successful' => 0,
            'failed' => 0,
            'payrolls' => [],
            'errors' => [],
        ];

        foreach ($employees as $employee) {
            try {
                $payroll = $this->calculateEmployeePayroll($employee->id, $year, $month);

                if ($payroll) {
                    // Store in payroll_approvals table with pending status
                    $approval = PayrollApproval::updateOrCreate(
                        [
                            'employee_id' => $employee->id,
                            'period_year' => $year,
                            'period_month' => $month,
                        ],
                        [
                            'payroll_data' => $payroll,
                            'status' => 'pending',
                        ]
                    );

                    $results['payrolls'][] = $payroll;
                    $results['successful']++;
                } else {
                    $results['failed']++;
                    $results['errors'][] = [
                        'employee_id' => $employee->id,
                        'employee_name' => $employee->full_name,
                        'error' => 'No active salary found for this period',
                    ];
                }
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'employee_id' => $employee->id,
                    'employee_name' => $employee->full_name,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Get payroll summary statistics for a period
     */
    public function getPayrollSummary(int $year, int $month): array
    {
        $approvals = PayrollApproval::forPeriod($year, $month)
            ->with('employee')
            ->get();

        $totalGross = 0;
        $totalNet = 0;
        $totalTax = 0;
        $totalDeductions = 0;

        foreach ($approvals as $approval) {
            $payroll = $approval->payroll_data;
            $totalGross += $payroll['earnings']['total_earnings'] ?? 0;
            $totalNet += $payroll['net_salary'] ?? 0;
            $totalTax += $payroll['deductions']['tax_deductions'] ?? 0;
            $totalDeductions += $payroll['deductions']['total_deductions'] ?? 0;
        }

        return [
            'period' => [
                'year' => $year,
                'month' => $month,
                'month_name' => Carbon::create($year, $month)->format('F'),
            ],
            'total_employees' => $approvals->count(),
            'status_breakdown' => [
                'pending' => $approvals->where('status', 'pending')->count(),
                'approved' => $approvals->where('status', 'approved')->count(),
                'rejected' => $approvals->where('status', 'rejected')->count(),
            ],
            'totals' => [
                'gross_salary' => $totalGross,
                'total_tax' => $totalTax,
                'total_deductions' => $totalDeductions,
                'net_salary' => $totalNet,
            ],
            'averages' => [
                'avg_gross' => $approvals->count() > 0 ? $totalGross / $approvals->count() : 0,
                'avg_net' => $approvals->count() > 0 ? $totalNet / $approvals->count() : 0,
            ],
        ];
    }
}
