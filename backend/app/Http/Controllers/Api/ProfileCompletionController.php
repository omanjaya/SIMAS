<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileCompletionController extends Controller
{
    /**
     * Get the current user's profile completion status
     */
    public function getStatus(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (! $employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee record not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'profile_completed' => $employee->profile_completed,
                'employee_code' => $employee->employee_code,
                'email' => $employee->email,
                'required_fields' => [
                    'phone' => $employee->phone ?? null,
                    'date_of_birth' => $employee->date_of_birth ?? null,
                    'gender' => $employee->gender ?? null,
                    'position' => $employee->position ?? null,
                    'emergency_contact' => $employee->emergency_contact ?? null,
                ],
            ],
        ]);
    }

    /**
     * Complete the user's profile with required information
     */
    public function completeProfile(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (! $employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee record not found',
            ], 404);
        }

        // Validation rules for required profile fields
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female',
            'position' => 'required|string|max:255',
            'emergency_contact' => 'required|array',
            'emergency_contact.name' => 'required|string|max:255',
            'emergency_contact.phone' => 'required|string|max:20',
            'emergency_contact.relationship' => 'required|string|max:50',
            'address' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Update employee profile with provided data
        $employee->update([
            'phone' => $request->phone,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'position' => $request->position,
            'emergency_contact' => [
                'name' => $request->input('emergency_contact.name'),
                'phone' => $request->input('emergency_contact.phone'),
                'relationship' => $request->input('emergency_contact.relationship'),
            ],
            'address' => $request->address,
            'department' => $request->department,
            'first_name' => $request->first_name ?? $employee->first_name, // Update first name if provided
            'last_name' => $request->last_name ?? $employee->last_name, // Update last name if provided
            'profile_completed' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile completed successfully',
            'data' => [
                'profile_completed' => true,
                'employee_code' => $employee->employee_code,
                'full_name' => $employee->first_name.' '.$employee->last_name,
                'email' => $employee->email,
            ],
        ]);
    }

    /**
     * Update partial profile information (for users who return to complete more fields)
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (! $employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee record not found',
            ], 404);
        }

        // Validation rules for update (all optional)
        $validator = Validator::make($request->all(), [
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'position' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|array',
            'emergency_contact.name' => 'nullable|string|max:255',
            'emergency_contact.phone' => 'nullable|string|max:20',
            'emergency_contact.relationship' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Prepare update data
        $updateData = [];

        if ($request->has('phone')) {
            $updateData['phone'] = $request->phone;
        }
        if ($request->has('date_of_birth')) {
            $updateData['date_of_birth'] = $request->date_of_birth;
        }
        if ($request->has('gender')) {
            $updateData['gender'] = $request->gender;
        }
        if ($request->has('position')) {
            $updateData['position'] = $request->position;
        }
        if ($request->has('address')) {
            $updateData['address'] = $request->address;
        }
        if ($request->has('department')) {
            $updateData['department'] = $request->department;
        }
        if ($request->has('first_name')) {
            $updateData['first_name'] = $request->first_name;
        }
        if ($request->has('last_name')) {
            $updateData['last_name'] = $request->last_name;
        }

        // Handle emergency contact separately
        if ($request->has('emergency_contact')) {
            $emergencyContact = $employee->emergency_contact ?: [];
            $emergencyContact = array_merge($emergencyContact, $request->emergency_contact);
            $updateData['emergency_contact'] = $emergencyContact;
        }

        // If all required fields are now filled, mark profile as completed
        $requiredFieldsFilled = ! empty($updateData['phone'] ?? $employee->phone) &&
                                ! empty($updateData['date_of_birth'] ?? $employee->date_of_birth) &&
                                ! empty($updateData['gender'] ?? $employee->gender) &&
                                ! empty($updateData['position'] ?? $employee->position) &&
                                ! empty($updateData['emergency_contact'] ?? $employee->emergency_contact);

        if ($requiredFieldsFilled) {
            $updateData['profile_completed'] = true;
        }

        $employee->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'profile_completed' => $employee->profile_completed,
                'employee_code' => $employee->employee_code,
            ],
        ]);
    }
}
