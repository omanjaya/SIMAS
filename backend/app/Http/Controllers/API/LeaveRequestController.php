<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeaveRequest;
use App\Http\Requests\UpdateLeaveRequest;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = LeaveRequest::with(['employee', 'approvedBy']);

        // For admin users, show all leave requests
        // For regular users, show only their own requests
        if (! $user->isAdmin()) {
            $query->where('employee_id', $user->employee->id ?? null);
        }

        // Apply filters if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->where(function ($q) use ($request) {
                $q->whereBetween('start_date', [$request->start_date, $request->end_date])
                    ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                    ->orWhere(function ($subQuery) use ($request) {
                        $subQuery->where('start_date', '<=', $request->start_date)
                            ->where('end_date', '>=', $request->end_date);
                    });
            });
        }

        // Add search filter if provided
        if ($request->has('search')) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('first_name', 'like', '%'.$request->search.'%')
                    ->orWhere('last_name', 'like', '%'.$request->search.'%')
                    ->orWhere('employee_code', 'like', '%'.$request->search.'%');
            });
        }

        // Apply pagination
        $perPage = $request->get('per_page', 10);
        $leaveRequests = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($leaveRequests);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLeaveRequest $request): JsonResponse
    {
        $user = $request->user();

        // Non-admin users can only create leave requests for themselves
        if (! $user->isAdmin()) {
            // Verify that the user has an associated employee
            if (! $user->employee) {
                return response()->json([
                    'message' => 'User does not have an associated employee record',
                ], 400);
            }
            // For non-admin users, always use their own employee ID
            $validatedData = $request->validated();
            $validatedData['employee_id'] = $user->employee->id;
        } else {
            // For admin users, use the employee_id provided in the request
            $validatedData = $request->validated();
        }

        // Calculate total days (inclusive) and set defaults
        $startDate = Carbon::parse($validatedData['start_date']);
        $endDate = Carbon::parse($validatedData['end_date']);
        $validatedData['total_days'] = $endDate->diffInDays($startDate) + 1;
        $validatedData['is_paid'] = $validatedData['is_paid'] ?? true;

        $leaveRequest = LeaveRequest::create($validatedData);

        return response()->json([
            'message' => 'Leave request submitted successfully',
            'leave_request' => $leaveRequest->load(['employee', 'approvedBy']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(LeaveRequest $leaveRequest): JsonResponse
    {
        $user = auth()->user();

        // Check if the user can view this leave request
        if (! $user->isAdmin() && $leaveRequest->employee_id !== $user->employee?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($leaveRequest->load(['employee', 'approvedBy']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLeaveRequest $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $user = $request->user();

        // Only admins can update status (approve/reject)
        if ($user->isAdmin()) {
            $updateData = $request->validated();

            // If approving, set the approved_by and approved_at
            if (isset($updateData['status']) && in_array($updateData['status'], ['approved', 'rejected'])) {
                if ($updateData['status'] === 'approved') {
                    $updateData['approved_by'] = $user->id;
                    $updateData['approved_at'] = now();
                } elseif ($updateData['status'] === 'rejected' && ! isset($updateData['rejection_reason'])) {
                    $updateData['rejection_reason'] = 'Not specified';
                }
            }

            $leaveRequest->update($updateData);

            return response()->json([
                'message' => "Leave request {$updateData['status']} successfully",
                'leave_request' => $leaveRequest->load(['employee', 'approvedBy']),
            ]);
        } else {
            // Regular users can update other fields (but not status), though that's not common
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    }

    /**
     * Admin approve/reject a leave request.
     */
    public function approve(UpdateLeaveRequest $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $user = $request->user();

        // Only admins can approve/reject leave requests
        if (! $user || ! $user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $updateData = $request->validated();

        // If approving, set the approved_by and approved_at
        if ($updateData['status'] === 'approved') {
            $updateData['approved_by'] = $user->id;
            $updateData['approved_at'] = now();
        }

        $leaveRequest->update($updateData);

        return response()->json([
            'message' => "Leave request {$request->status} successfully",
            'leave_request' => $leaveRequest->load(['employee', 'approvedBy']),
        ]);
    }

    /**
     * Remove the specified resource from storage (cancel by employee).
     */
    public function destroy(LeaveRequest $leaveRequest): JsonResponse
    {
        $user = auth()->user();

        // Only the employee who created the request or an admin can delete it
        if (! $user->isAdmin() && $leaveRequest->employee_id !== $user->employee?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only pending requests can be cancelled
        if ($leaveRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be cancelled'], 400);
        }

        $leaveRequest->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Leave request cancelled successfully',
        ]);
    }
}
