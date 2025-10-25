<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateMyProfileRequest;
use App\Http\Requests\UpdateMyPasswordRequest;
use App\Models\FaceTemplate;
use App\Services\FaceRecognitionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class MyProfileController extends Controller
{
    protected FaceRecognitionService $faceRecognitionService;

    public function __construct(FaceRecognitionService $faceRecognitionService)
    {
        $this->faceRecognitionService = $faceRecognitionService;
    }

    /**
     * Get authenticated user's profile
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        // Get face template status
        $faceTemplate = FaceTemplate::where('employee_id', $employee->id)
            ->where('is_active', true)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'employee' => [
                    'id' => $employee->id,
                    'employee_code' => $employee->employee_code,
                    'full_name' => $employee->full_name,
                    'phone' => $employee->phone,
                    'address' => $employee->address, // Keep for backward compatibility
                    'address_ktp' => $employee->address_ktp,  // NEW
                    'address_domisili' => $employee->address_domisili,  // NEW
                    'position' => $employee->position,
                    'secondary_position' => $employee->secondary_position,  // NEW
                    'department' => $employee->department,
                    'rank' => $employee->rank,  // NEW - Golongan
                    'job_class' => $employee->job_class,  // NEW - Kelas Jabatan
                    'tpp_amount' => $employee->tpp_amount,  // NEW - Besaran TPP
                    'employment_type' => $employee->employment_type,
                    'employment_status' => $employee->employment_status,
                    'join_date' => $employee->join_date,
                ],
                'face_registered' => $faceTemplate !== null,
                'face_template_updated_at' => $faceTemplate ? $faceTemplate->updated_at : null,
            ],
        ]);
    }

    /**
     * Update authenticated user's profile
     *
     * @param UpdateMyProfileRequest $request
     * @return JsonResponse
     */
    public function update(UpdateMyProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        // Update user data
        if ($request->filled('name')) {
            $user->name = $request->input('name');
            $user->save();
        }

        // Update employee data
        $employee->update([
            'phone' => $request->input('phone', $employee->phone),
            'address' => $request->input('address', $employee->address),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'user' => $user->fresh(),
                'employee' => $employee->fresh(),
            ],
        ]);
    }

    /**
     * Update password
     *
     * @param UpdateMyPasswordRequest $request
     * @return JsonResponse
     */
    public function updatePassword(UpdateMyPasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 422);
        }

        // Update password
        $user->password = Hash::make($request->input('new_password'));
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
        ]);
    }

    /**
     * Upload or update face template
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadFace(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|string', // Base64 encoded image
        ]);

        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        try {
            // Process face image and generate template
            $imageData = $request->input('image');
            $template = $this->faceRecognitionService->generateTemplate($imageData);

            if (!$template) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate face template. Please ensure your face is clearly visible.',
                ], 422);
            }

            // Deactivate old templates
            FaceTemplate::where('employee_id', $employee->id)
                ->update(['is_active' => false]);

            // Create new template
            $faceTemplate = FaceTemplate::create([
                'employee_id' => $employee->id,
                'template_data' => $template,
                'template_version' => $this->faceRecognitionService->getTemplateVersion(),
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Face template registered successfully',
                'data' => [
                    'id' => $faceTemplate->id,
                    'registered_at' => $faceTemplate->created_at,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to register face template: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete face template
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function deleteFace(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found',
            ], 404);
        }

        // Deactivate all face templates
        $deleted = FaceTemplate::where('employee_id', $employee->id)
            ->update(['is_active' => false]);

        if ($deleted === 0) {
            return response()->json([
                'success' => false,
                'message' => 'No face template found to delete',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Face template deleted successfully',
        ]);
    }
}