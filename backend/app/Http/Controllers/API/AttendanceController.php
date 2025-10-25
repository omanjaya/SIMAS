<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Requests\UpdateAttendanceRequest;
use App\Http\Requests\ClockInRequest;
use App\Http\Requests\ClockOutRequest;
use App\Models\Attendance;
use App\Services\AttendanceValidationService;
use App\Services\GeofencingService;
use App\Services\ScheduleValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    protected GeofencingService $geofencingService;

    protected ScheduleValidationService $scheduleValidationService;

    protected AttendanceValidationService $attendanceValidationService;

    public function __construct(
        GeofencingService $geofencingService,
        ScheduleValidationService $scheduleValidationService,
        AttendanceValidationService $attendanceValidationService
    ) {
        $this->geofencingService = $geofencingService;
        $this->scheduleValidationService = $scheduleValidationService;
        $this->attendanceValidationService = $attendanceValidationService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Attendance::with(['employee', 'period']);

        // For admin users, show all attendance records
        // For regular users, show only their own
        if (! $user->isAdmin()) {
            $query->where('employee_id', $user->employee->id ?? null);
        }

        // Apply date range filter if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('check_in_time', [$request->start_date, $request->end_date]);
        } elseif ($request->has('date')) {
            $query->whereDate('check_in_time', $request->date);
        }

        // Apply employee filter if provided
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // Apply status filter if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $attendances = $query->orderBy('check_in_time', 'desc')->get();

        return response()->json($attendances);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttendanceRequest $request): JsonResponse
    {
        $user = $request->user();

        // Non-admin users can only create attendance for themselves
        if (! $user->isAdmin()) {
            $request->merge(['employee_id' => $user->employee->id]);
        }

        // TODO: In a real implementation, this would include biometric verification
        // For now, we'll accept the request as valid
        $attendance = Attendance::create($request->validated());

        return response()->json([
            'message' => 'Attendance record created successfully',
            'attendance' => $attendance->load(['employee', 'period']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Attendance $attendance): JsonResponse
    {
        $user = auth()->user();

        // Check if the user can view this attendance record
        if (! $user->isAdmin() && $attendance->employee_id !== $user->employee?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($attendance->load(['employee', 'period']));
    }

    /**
     * Update the specified resource in storage (check out).
     */
    public function update(UpdateAttendanceRequest $request, Attendance $attendance): JsonResponse
    {
        $user = $request->user();

        // Only admin or the employee themselves can update their attendance
        if (! $user->isAdmin() && $attendance->employee_id !== $user->employee?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Can only update if the employee hasn't checked out yet
        if ($attendance->check_out_time) {
            return response()->json(['message' => 'Attendance already checked out'], 400);
        }

        $attendance->update($request->validated());

        return response()->json([
            'message' => 'Attendance record updated successfully',
            'attendance' => $attendance->load(['employee', 'period']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attendance $attendance): JsonResponse
    {
        $user = auth()->user();

        // Only admin can delete attendance records
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attendance->delete();

        return response()->json([
            'message' => 'Attendance record deleted successfully',
        ]);
    }

    /**
     * Clock in with triple validation
     */
    public function clockIn(ClockInRequest $request): JsonResponse
    {
        $user = $request->user();

        // Get employee
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak memiliki data pegawai',
            ], 422);
        }

        // Check if already checked in today
        $existingAttendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('check_in_time', $request->timestamp ? \Carbon\Carbon::parse($request->timestamp)->toDateString() : now()->toDateString())
            ->whereNull('check_out_time')
            ->first();

        if ($existingAttendance) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah melakukan check-in hari ini',
                'attendance' => $existingAttendance,
            ], 422);
        }

        try {
            $metadata = [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'device_info' => $request->device_info,
            ];

            $result = $this->attendanceValidationService->validateClockIn(
                $employee->id,
                $request->latitude,
                $request->longitude,
                $request->face_image,
                $request->timestamp ? \Carbon\Carbon::parse($request->timestamp) : null,
                $metadata
            );

            return response()->json($result, $result['success'] ? 201 : 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat check-in',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clock out with validation
     */
    public function clockOut(ClockOutRequest $request): JsonResponse
    {
        try {
            $metadata = [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'device_info' => $request->device_info,
            ];

            $result = $this->attendanceValidationService->validateClockOut(
                $request->attendance_id,
                $request->latitude,
                $request->longitude,
                $request->timestamp ? \Carbon\Carbon::parse($request->timestamp) : null,
                $metadata
            );

            return response()->json($result, $result['success'] ? 200 : 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat check-out',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
