<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Salary;
use Carbon\Carbon;

class AnalyticsService
{
    public function getAttendanceTrends(array $filters): array
    {
        $startDate = Carbon::parse($filters['start_date'])->startOfDay();
        $endDate = Carbon::parse($filters['end_date'])->endOfDay();
        $groupBy = $filters['group_by'] ?? 'day';

        $attendances = Attendance::with('employee')
            ->whereBetween('check_in_time', [$startDate, $endDate])
            ->when(! empty($filters['department']), function ($query) use ($filters) {
                $query->whereHas('employee', function ($employeeQuery) use ($filters) {
                    $employeeQuery->where('department', $filters['department']);
                });
            })
            ->when(! empty($filters['employee_id']), function ($query) use ($filters) {
                $query->where('employee_id', $filters['employee_id']);
            })
            ->get();

        $grouped = $attendances
            ->groupBy(function ($attendance) use ($groupBy) {
                $date = $attendance->check_in_time ?? $attendance->created_at ?? Carbon::now();
                $date = Carbon::parse($date);

                return match ($groupBy) {
                    'week' => $date->startOfWeek()->toDateString(),
                    'month' => $date->format('Y-m'),
                    default => $date->toDateString(),
                };
            })
            ->sortKeys();

        $trends = $grouped->map(function ($items, $period) {
            $present = $items->where('status', 'present')->count();
            $late = $items->where('status', 'late')->count();
            $absent = $items->where('status', 'absent')->count();
            $halfDay = $items->where('status', 'half_day')->count();
            $totalEmployees = $items->pluck('employee_id')->unique()->count();
            $total = $present + $late + $absent + $halfDay;

            return [
                'date' => $period,
                'total_employees' => $totalEmployees,
                'present' => $present,
                'late' => $late,
                'absent' => $absent,
                'half_day' => $halfDay,
                'attendance_rate' => round($this->calculateAttendanceRate($present, $late, $total), 2),
            ];
        })->values()->toArray();

        $summary = [
            'avg_attendance_rate' => ! empty($trends)
                ? round(array_sum(array_column($trends, 'attendance_rate')) / count($trends), 2)
                : 0,
            'total_working_days' => count($trends),
            'peak_attendance_date' => ! empty($trends)
                ? collect($trends)->sortByDesc('attendance_rate')->first()['date']
                : null,
            'lowest_attendance_date' => ! empty($trends)
                ? collect($trends)->sortBy('attendance_rate')->first()['date']
                : null,
        ];

        return [
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
            'group_by' => $groupBy,
            'trends' => $trends,
            'summary' => $summary,
        ];
    }

    public function getOvertimeAnalysis(array $filters): array
    {
        $threshold = $filters['threshold_hours'] ?? 8;
        $startDate = Carbon::parse($filters['start_date'])->startOfDay();
        $endDate = Carbon::parse($filters['end_date'])->endOfDay();

        $attendances = Attendance::with('employee')
            ->whereBetween('check_in_time', [$startDate, $endDate])
            ->whereNotNull('check_in_time')
            ->whereNotNull('check_out_time')
            ->when(! empty($filters['department']), function ($query) use ($filters) {
                $query->whereHas('employee', function ($employeeQuery) use ($filters) {
                    $employeeQuery->where('department', $filters['department']);
                });
            })
            ->when(! empty($filters['employee_id']), function ($query) use ($filters) {
                $query->where('employee_id', $filters['employee_id']);
            })
            ->get();

        $employees = $attendances
            ->groupBy('employee_id')
            ->map(function ($records) use ($threshold) {
                /** @var Attendance $first */
                $first = $records->first();
                $employee = $first?->employee;

                $workingDays = $records->count();
                $totalHoursWorked = $records->sum(function (Attendance $attendance) {
                    return $attendance->work_duration / 60;
                });

                $overtimeHours = $records->sum(function (Attendance $attendance) use ($threshold) {
                    $hours = $attendance->work_duration / 60;

                    return max(0, $hours - $threshold);
                });

                $overtimeDays = $records->filter(function (Attendance $attendance) use ($threshold) {
                    return ($attendance->work_duration / 60) > $threshold;
                })->count();

                return [
                    'employee_id' => $employee?->id,
                    'employee_name' => trim(($employee->first_name ?? '').' '.($employee->last_name ?? '')),
                    'department' => $employee->department ?? 'Unassigned',
                    'working_days' => $workingDays,
                    'total_hours_worked' => round($totalHoursWorked, 2),
                    'regular_hours' => round($totalHoursWorked - $overtimeHours, 2),
                    'overtime_hours' => round($overtimeHours, 2),
                    'overtime_days' => $overtimeDays,
                ];
            })
            ->values()
            ->toArray();

        $totalOvertimeHours = array_sum(array_column($employees, 'overtime_hours'));
        $totalEmployees = count($employees);
        $avgOvertimePerEmployee = $totalEmployees > 0 ? $totalOvertimeHours / $totalEmployees : 0;

        $byDepartment = collect($employees)
            ->groupBy('department')
            ->map(function ($items, $department) {
                $overtime = $items->sum('overtime_hours');
                $count = $items->count();

                return [
                    'department' => $department,
                    'total_overtime_hours' => round($overtime, 2),
                    'employee_count' => $count,
                    'avg_overtime_per_employee' => $count > 0 ? round($overtime / $count, 2) : 0,
                ];
            })
            ->values()
            ->toArray();

        return [
            'overtime_summary' => [
                'total_overtime_hours' => round($totalOvertimeHours, 2),
                'total_employees' => $totalEmployees,
                'avg_overtime_per_employee' => round($avgOvertimePerEmployee, 2),
            ],
            'by_employee' => $employees,
            'by_department' => $byDepartment,
        ];
    }

    public function getLeaveBalanceForecast(int $year, ?string $department = null, ?int $employee_id = null): array
    {
        // Get all employees with their entitlements
        $query = Employee::with(['leaveRequests' => function ($q) use ($year) {
            $q->whereYear('start_date', $year);
        }]);

        if ($department) {
            $query->where('department', $department);
        }

        if ($employee_id) {
            $query->where('id', $employee_id);
        }

        $employees = $query->get()->map(function ($employee) use ($year) {
            // Calculate leave entitlement (assuming 12 days per year)
            $leaveEntitlement = 12;

            // Calculate taken leave (approved)
            $leaveTaken = $employee->leaveRequests
                ->filter(function ($leave) {
                    return $leave->status === 'approved';
                })
                ->sum('total_days');

            // Calculate pending leave
            $leavePending = $employee->leaveRequests
                ->filter(function ($leave) {
                    return $leave->status === 'pending';
                })
                ->sum('total_days');

            $leaveRemaining = $leaveEntitlement - $leaveTaken - $leavePending;

            // Calculate forecast for exhausted date
            $forecastExhaustedDate = null;
            if ($leaveRemaining > 0) {
                // Based on current usage rate
                $currentMonth = Carbon::now()->month;
                if ($currentMonth > 0) {
                    $avgMonthlyUsage = $leaveTaken / $currentMonth;
                    $monthsLeft = $leaveRemaining / max($avgMonthlyUsage, 0.001); // Avoid division by zero
                    $forecastExhaustedDate = Carbon::now()->addMonths($monthsLeft)->format('Y-m-d');
                } else {
                    $forecastExhaustedDate = Carbon::create($year, 12, 31)->format('Y-m-d');
                }
            }

            // Determine risk level
            $riskLevel = $this->determineRiskLevel($leaveRemaining);

            return [
                'employee_id' => $employee->id,
                'employee_name' => $employee->first_name.' '.$employee->last_name,
                'department' => $employee->department,
                'leave_entitlement' => $leaveEntitlement,
                'leave_taken' => $leaveTaken,
                'leave_pending' => $leavePending,
                'leave_remaining' => $leaveRemaining,
                'forecast_exhausted_date' => $forecastExhaustedDate,
                'risk_level' => $riskLevel,
            ];
        })->toArray();

        // Calculate summary
        $summary = [
            'total_leave_taken' => array_sum(array_column($employees, 'leave_taken')),
            'total_leave_pending' => array_sum(array_column($employees, 'leave_pending')),
            'total_leave_remaining' => array_sum(array_column($employees, 'leave_remaining')),
            'avg_remaining_per_employee' => count($employees) > 0 ?
                round(array_sum(array_column($employees, 'leave_remaining')) / count($employees), 2) : 0,
            'high_risk_employees' => count(array_filter($employees, function ($emp) {
                return $emp['risk_level'] === 'high';
            })),
        ];

        return [
            'forecast_year' => $year,
            'employees' => $employees,
            'summary' => $summary,
        ];
    }

    public function getPayrollCostAnalysis(array $filters): array
    {
        $startDate = Carbon::parse($filters['start_date'])->startOfDay();
        $endDate = Carbon::parse($filters['end_date'])->endOfDay();

        $salaries = Salary::with('employee')
            ->when(! empty($filters['department']), function ($query) use ($filters) {
                $query->whereHas('employee', function ($employeeQuery) use ($filters) {
                    $employeeQuery->where('department', $filters['department']);
                });
            })
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $totals = $salaries->map(function (Salary $salary) {
            $allowances = $this->sumAllowances($salary->allowances);
            $net = (float) $salary->base_salary + $allowances - (float) $salary->deductions;

            return [
                'gross' => (float) $salary->base_salary,
                'allowances' => $allowances,
                'deductions' => (float) $salary->deductions,
                'net' => $net,
                'month' => Carbon::parse($salary->created_at)->format('Y-m'),
                'department' => $salary->employee->department ?? 'Unassigned',
                'position' => $salary->employee->position ?? 'Unassigned',
            ];
        });

        $totalGross = $totals->sum('gross');
        $totalAllowances = $totals->sum('allowances');
        $totalDeductions = $totals->sum('deductions');
        $totalNet = $totals->sum('net');

        $byMonth = $totals
            ->groupBy('month')
            ->map(function ($items, $month) {
                return [
                    'month' => $month,
                    'total_gross' => round($items->sum('gross'), 2),
                    'total_allowances' => round($items->sum('allowances'), 2),
                    'total_deductions' => round($items->sum('deductions'), 2),
                    'total_net' => round($items->sum('net'), 2),
                    'employee_count' => $items->count(),
                ];
            })
            ->values()
            ->toArray();

        $byDepartment = $totals
            ->groupBy('department')
            ->map(function ($items, $department) {
                $net = $items->sum('net');
                $count = $items->count();

                return [
                    'department' => $department,
                    'total_cost' => round($net, 2),
                    'employee_count' => $count,
                    'avg_salary' => $count > 0 ? round($net / $count, 2) : 0,
                ];
            })
            ->values()
            ->toArray();

        $byPosition = $totals
            ->groupBy('position')
            ->map(function ($items, $position) {
                $net = $items->sum('net');
                $count = $items->count();

                return [
                    'position' => $position,
                    'total_cost' => round($net, 2),
                    'employee_count' => $count,
                    'avg_salary' => $count > 0 ? round($net / $count, 2) : 0,
                ];
            })
            ->values()
            ->toArray();

        return [
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
            'totals' => [
                'gross' => round($totalGross, 2),
                'allowances' => round($totalAllowances, 2),
                'deductions' => round($totalDeductions, 2),
                'net' => round($totalNet, 2),
                'employee_count' => $salaries->count(),
            ],
            'by_month' => $byMonth,
            'by_department' => $byDepartment,
            'by_position' => $byPosition,
        ];
    }

    private function calculateAttendanceRate(int $present, int $late, int $total): float
    {
        return $total > 0 ? (($present + $late) / $total) * 100 : 0;
    }

    private function determineRiskLevel(int $remainingDays): string
    {
        if ($remainingDays < 3) {
            return 'high';
        }
        if ($remainingDays < 6) {
            return 'medium';
        }

        return 'low';
    }

    private function sumAllowances($allowances): float
    {
        if (is_array($allowances)) {
            return array_sum($allowances);
        }

        if (is_numeric($allowances)) {
            return (float) $allowances;
        }

        return 0.0;
    }
}
