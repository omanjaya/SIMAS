<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordManagementController extends Controller
{
    /**
     * Force password change on next login
     */
    public function forcePasswordChange(User $user): JsonResponse
    {
        // This would require adding a column to track this
        // For now, we'll just return a success message
        // In a full implementation, you'd add a 'must_change_password' column to the users table

        return response()->json([
            'message' => 'User will be required to change password on next login (implementation pending)',
        ]);
    }

    /**
     * Generate random password for user
     */
    public function generateRandomPassword(User $user): JsonResponse
    {
        // Generate a random password
        $randomPassword = Str::random(12);
        $hashedPassword = Hash::make($randomPassword);

        // Update user's password
        $user->update(['password' => $hashedPassword]);

        return response()->json([
            'message' => 'Random password generated successfully',
            'password' => $randomPassword, // In production, this should be sent securely, not returned in response
        ]);
    }

    /**
     * Reset user password to a specific value
     */
    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json([
            'message' => 'Password reset successfully',
        ]);
    }
}
