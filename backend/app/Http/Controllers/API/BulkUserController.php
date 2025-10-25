<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BulkUserController extends Controller
{
    /**
     * Bulk update user statuses
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
        ]);

        $updatedCount = User::whereIn('id', $request->user_ids)
            ->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Users updated successfully',
            'updated_count' => $updatedCount,
        ]);
    }

    /**
     * Bulk assign roles
     */
    public function bulkAssignRole(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'role' => ['required', Rule::in(['admin', 'teacher', 'employee'])],
        ]);

        $updatedCount = User::whereIn('id', $request->user_ids)
            ->update(['role' => $request->role]);

        return response()->json([
            'message' => 'Roles assigned successfully',
            'updated_count' => $updatedCount,
        ]);
    }

    /**
     * Bulk reset passwords
     */
    public function bulkResetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'new_password' => 'required|string|min:8',
        ]);

        $hashedPassword = bcrypt($request->new_password);

        $updatedCount = User::whereIn('id', $request->user_ids)
            ->update([
                'password' => $hashedPassword,
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => 'Passwords reset successfully',
            'updated_count' => $updatedCount,
        ]);
    }
}
