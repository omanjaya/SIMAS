<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Employee::query();

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Role filter - query through user relationship
        if ($request->has('role')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('role', $request->role);
            });
        }

        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        if ($request->has('hire_date_from')) {
            $query->whereDate('hire_date', '>=', $request->hire_date_from);
        }

        if ($request->has('hire_date_to')) {
            $query->whereDate('hire_date', '<=', $request->hire_date_to);
        }

        if ($request->has('has_biometric')) {
            $hasBiometric = filter_var($request->has_biometric, FILTER_VALIDATE_BOOLEAN);

            if ($hasBiometric) {
                $query->whereHas('faceTemplate');
            } else {
                $query->whereDoesntHave('faceTemplate');
            }
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'LIKE', "%{$search}%")
                    ->orWhere('last_name', 'LIKE', "%{$search}%")
                    ->orWhere('employee_code', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $employees = $query->with('user')->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $employees->items(),
            'total' => $employees->total(),
            'current_page' => $employees->currentPage(),
            'last_page' => $employees->lastPage(),
            'per_page' => $employees->perPage(),
        ]);
    }

    /**
     * Return aggregated stats for dashboard widgets.
     */
    public function stats(): JsonResponse
    {
        $totalEmployees = Employee::count();
        $activeEmployees = Employee::where('status', 'active')->count();
        $inactiveEmployees = Employee::where('status', 'inactive')->count();
        $terminatedEmployees = Employee::where('status', 'terminated')->count();

        $byDepartment = Employee::select('department')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('department')
            ->orderByDesc('total')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $totalEmployees,
                'active' => $activeEmployees,
                'inactive' => $inactiveEmployees,
                'terminated' => $terminatedEmployees,
                'by_department' => $byDepartment,
            ],
        ]);
    }

    /**
     * Return filter options (departments, positions, statuses).
     */
    public function filterOptions(): JsonResponse
    {
        $departments = Employee::whereNotNull('department')
            ->distinct()
            ->orderBy('department')
            ->pluck('department');

        $positions = Employee::whereNotNull('position')
            ->distinct()
            ->orderBy('position')
            ->pluck('position');

        $statuses = Employee::select('status')
            ->distinct()
            ->pluck('status');

        return response()->json([
            'success' => true,
            'data' => [
                'departments' => $departments,
                'positions' => $positions,
                'statuses' => $statuses,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        // If no user_id is provided, create a user account for the employee
        if (! $request->has('user_id')) {
            $user = User::create([
                'name' => $request->first_name.' '.$request->last_name,
                'email' => $request->email,
                'password' => bcrypt('password'), // Default password, should be changed later
                'role' => 'employee', // Default role for employees
            ]);
            $request->merge(['user_id' => $user->id]);
        }

        $employee = Employee::create($request->validated());

        return response()->json([
            'message' => 'Employee created successfully',
            'employee' => $employee->load('user'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee): JsonResponse
    {
        return response()->json($employee->load('user', 'attendances', 'leaveRequests'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $employee->update($request->validated());

        // If user_id is being updated, potentially update the associated user's role
        if ($request->has('user_id')) {
            $user = User::find($request->user_id);
            if ($user) {
                $user->update(['role' => 'employee']); // Set appropriate role
            }
        }

        return response()->json([
            'message' => 'Employee updated successfully',
            'employee' => $employee->load('user'),
        ]);
    }

    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(Employee $employee): JsonResponse
    {
        $employee->update(['status' => 'terminated']); // Mark as terminated instead of deleting
        $employee->delete(); // Actually soft delete

        return response()->json([
            'message' => 'Employee deactivated successfully',
        ]);
    }

    /**
     * Restore a previously deleted employee.
     */
    public function restore($id): JsonResponse
    {
        $employee = Employee::withTrashed()->findOrFail($id);
        $employee->restore();
        $employee->update(['status' => 'active']);

        return response()->json([
            'message' => 'Employee restored successfully',
            'employee' => $employee,
        ]);
    }

    /**
     * Get employee statistics for dashboard cards
     */
    public function getStats()
    {
        // Current month stats
        $totalActive = Employee::where('status', 'active')->count();

        // For teachers: those with role 'teacher' in user table OR position containing 'guru'
        $activeTeachersQuery = Employee::query()
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereHas('user', function ($userQuery) {
                    $userQuery->where('role', 'teacher');
                })
                    ->orWhereRaw('LOWER(position) LIKE ?', ['%guru%']);
            });
        $totalTeachers = (clone $activeTeachersQuery)->count();

        // For staff: those with role 'employee' in user table OR position containing 'staff' or 'tu'
        $activeStaffQuery = Employee::query()
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereHas('user', function ($userQuery) {
                    $userQuery->where('role', 'employee');
                })
                    ->orWhere(function ($subQuery) {
                        $subQuery->whereRaw('LOWER(position) LIKE ?', ['%staff%'])
                            ->orWhereRaw('LOWER(position) LIKE ?', ['%tu%']);
                    });
            });
        $totalStaff = (clone $activeStaffQuery)->count();
        $onLeaveToday = Employee::where('status', 'on_leave')->count();

        // Last month stats for trend calculation
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();

        $lastMonthActive = Employee::where('status', 'active')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $lastMonthTeachers = (clone $activeTeachersQuery)
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $lastMonthStaff = (clone $activeStaffQuery)
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        // Yesterday's on_leave count
        $yesterdayOnLeave = Employee::where('status', 'on_leave')
            ->whereDate('updated_at', now()->subDay())
            ->count();

        // Calculate trends (percentage change)
        $totalActiveTrend = $lastMonthActive > 0
            ? round((($totalActive - $lastMonthActive) / $lastMonthActive) * 100, 1)
            : 0;

        $totalTeachersTrend = $lastMonthTeachers > 0
            ? round((($totalTeachers - $lastMonthTeachers) / $lastMonthTeachers) * 100, 1)
            : 0;

        $totalStaffTrend = $lastMonthStaff > 0
            ? round((($totalStaff - $lastMonthStaff) / $lastMonthStaff) * 100, 1)
            : 0;

        $onLeaveTodayTrend = $onLeaveToday - $yesterdayOnLeave;

        return response()->json([
            'success' => true,
            'data' => [
                'total_active' => $totalActive,
                'total_active_trend' => $totalActiveTrend,
                'total_teachers' => $totalTeachers,
                'total_teachers_trend' => $totalTeachersTrend,
                'total_staff' => $totalStaff,
                'total_staff_trend' => $totalStaffTrend,
                'on_leave_today' => $onLeaveToday,
                'on_leave_today_trend' => $onLeaveTodayTrend,
                'last_updated' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get filter options for the advanced filter
     */
    public function getFilterOptions()
    {
        // Get unique positions with count
        $positions = Employee::select('position', DB::raw('COUNT(*) as count'))
            ->whereNotNull('position')
            ->where('position', '!=', '')
            ->groupBy('position')
            ->orderBy('position')
            ->get()
            ->map(function ($item) {
                return [
                    'value' => $item->position,
                    'label' => $item->position,
                    'count' => $item->count,
                ];
            });

        // Get unique departments with count
        $departments = Employee::select('department', DB::raw('COUNT(*) as count'))
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->groupBy('department')
            ->orderBy('department')
            ->get()
            ->map(function ($item) {
                return [
                    'value' => $item->department,
                    'label' => $item->department,
                    'count' => $item->count,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'positions' => $positions,
                'departments' => $departments,
            ],
        ]);
    }

    /**
     * Check for duplicate emails in the database
     */
    public function checkDuplicates(Request $request)
    {
        $emails = $request->input('emails', []);

        $duplicates = Employee::whereIn('email', $emails)
            ->pluck('email')
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'duplicates' => $duplicates,
            ],
        ]);
    }

    /**
     * Check for duplicate employee codes in the database
     */
    public function checkDuplicateCodes(Request $request)
    {
        $codes = $request->input('codes', []);

        $duplicates = Employee::whereIn('employee_code', $codes)
            ->pluck('employee_code')
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'duplicates' => $duplicates,
            ],
        ]);
    }

    /**
     * Export employees to Excel/CSV
     */
    public function export(Request $request)
    {
        $query = Employee::query();

        // Apply filters for export
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Role filter - query through user relationship
        if ($request->has('role')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('role', $request->role);
            });
        }

        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        if ($request->has('hire_date_from')) {
            $query->whereDate('hire_date', '>=', $request->hire_date_from);
        }

        if ($request->has('hire_date_to')) {
            $query->whereDate('hire_date', '<=', $request->hire_date_to);
        }

        if ($request->has('has_biometric')) {
            $hasBiometric = filter_var($request->has_biometric, FILTER_VALIDATE_BOOLEAN);

            if ($hasBiometric) {
                $query->whereHas('faceTemplate');
            } else {
                $query->whereDoesntHave('faceTemplate');
            }
        }

        $employees = $query->get();

        // Generate CSV content
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="employees_export_'.date('Y-m-d').'.csv"',
        ];

        $csv = fopen('php://temp', 'r+');

        // Add headers
        fputcsv($csv, [
            'Employee Code', 'First Name', 'Last Name', 'Email', 'Phone',
            'Address', 'Date of Birth', 'Gender', 'Position', 'Department',
            'Hire Date', 'Employment Type', 'Salary', 'Salary Type',
            'Emergency Contact', 'Profile Image', 'Status',
        ]);

        // Add data rows
        foreach ($employees as $employee) {
            fputcsv($csv, [
                $employee->employee_code,
                $employee->first_name,
                $employee->last_name,
                $employee->email,
                $employee->phone,
                $employee->address,
                $employee->date_of_birth,
                $employee->gender,
                $employee->position,
                $employee->department,
                $employee->hire_date,
                $employee->employment_type,
                $employee->salary,
                $employee->salary_type,
                $employee->emergency_contact ? json_encode($employee->emergency_contact) : null,
                $employee->profile_image,
                $employee->status,
            ]);
        }

        rewind($csv);
        $csvContent = stream_get_contents($csv);
        fclose($csv);

        return response($csvContent, 200, $headers);
    }
}
