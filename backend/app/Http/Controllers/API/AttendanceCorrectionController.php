<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewAttendanceCorrectionRequest;
use App\Http\Requests\StoreAttendanceCorrectionRequest;
use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceCorrectionController extends Controller
{
    /**
     * Get all correction requests (admin) or user's own requests
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = AttendanceCorrection::with(['attendance', 'employee', 'requestedBy', 'reviewedBy']);

        // If not admin, only show own requests
        if ($user->role !== 'admin') {
            $employee = $user->employee;
            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee profile not found',
                ], 404);
            }
            $query->where('employee_id', $employee->id);
        }

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $corrections = $query->orderBy('requested_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $corrections,
        ]);
    }

    /**
     * Request attendance correction (user)
     */
    public function store(StoreAttendanceCorrectionRequest $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        // Get attendance record
        $attendance = Attendance::findOrFail($request->attendance_id);

        // Verify attendance belongs to this employee
        if ($attendance->employee_id !== $employee->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only request correction for your own attendance',
            ], 403);
        }

        // Check if already has pending correction
        $existingPending = AttendanceCorrection::where('attendance_id', $attendance->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingPending) {
            return response()->json([
                'success' => false,
                'message' => 'A pending correction request already exists for this attendance',
            ], 422);
        }

        // Create correction request
        $correction = AttendanceCorrection::create([
            'attendance_id' => $attendance->id,
            'employee_id' => $employee->id,
            'requested_by' => $user->id,
            'correction_type' => $request->correction_type,
            'original_clock_in_time' => $attendance->clock_in_time,
            'original_clock_out_time' => $attendance->clock_out_time,
            'new_clock_in_time' => $request->new_clock_in_time,
            'new_clock_out_time' => $request->new_clock_out_time,
            'reason' => $request->reason,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Correction request submitted successfully',
            'data' => $correction->load(['attendance', 'employee']),
        ], 201);
    }

    /**
     * View specific correction request
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $correction = AttendanceCorrection::with(['attendance', 'employee', 'requestedBy', 'reviewedBy'])
            ->findOrFail($id);

        // Authorization: admin or own request
        if ($user->role !== 'admin' && $correction->requested_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view this correction request',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $correction,
        ]);
    }

    /**
     * Review correction request (admin only)
     */
    public function review(ReviewAttendanceCorrectionRequest $request, int $id): JsonResponse
    {
        $correction = AttendanceCorrection::with('attendance')->findOrFail($id);

        if ($correction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This correction request has already been reviewed',
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Update correction status
            $correction->update([
                'status' => $request->status,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'admin_notes' => $request->admin_notes,
            ]);

            // If approved, update attendance record
            if ($request->status === 'approved') {
                $attendance = $correction->attendance;

                $updateData = [];
                if ($correction->correction_type === 'clock_in' || $correction->correction_type === 'both') {
                    $updateData['clock_in_time'] = $correction->new_clock_in_time;
                }
                if ($correction->correction_type === 'clock_out' || $correction->correction_type === 'both') {
                    $updateData['clock_out_time'] = $correction->new_clock_out_time;
                }

                $attendance->update($updateData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Correction request {$request->status} successfully",
                'data' => $correction->fresh(['attendance', 'employee', 'reviewedBy']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to review correction: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete correction request (only if pending)
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $correction = AttendanceCorrection::findOrFail($id);

        // Authorization: admin or own request
        if ($user->role !== 'admin' && $correction->requested_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this correction request',
            ], 403);
        }

        // Can only delete pending requests
        if ($correction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending correction requests can be deleted',
            ], 422);
        }

        $correction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Correction request deleted successfully',
        ]);
    }
}