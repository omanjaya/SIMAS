<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\FaceRecognitionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FaceEnrollmentController extends Controller
{
    protected FaceRecognitionService $faceService;

    public function __construct(FaceRecognitionService $faceService)
    {
        $this->faceService = $faceService;
    }

    /**
     * Enroll face template
     */
    public function enroll(Request $request): JsonResponse
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'face_images' => 'required|array|min:3|max:5',
            'face_images.*' => 'required|string', // Base64 images
        ], [
            'face_images.min' => 'Minimal 3 foto wajah diperlukan',
            'face_images.max' => 'Maksimal 5 foto wajah',
        ]);

        $user = $request->user();
        $employeeId = $request->employee_id;

        // Authorization check
        if ($user->role !== 'admin' && $user->employee?->id !== $employeeId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $result = $this->faceService->enrollFace(
                $employeeId,
                $request->face_images
            );

            return response()->json($result, $result['success'] ? 201 : 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendaftarkan wajah',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test face verification
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'face_image' => 'required|string',
        ]);

        $user = $request->user();
        $employeeId = $request->employee_id;

        // Authorization
        if ($user->role !== 'admin' && $user->employee?->id !== $employeeId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        try {
            $result = $this->faceService->verifyFace(
                $employeeId,
                $request->face_image
            );

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Verification failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Health check
     */
    public function healthCheck(): JsonResponse
    {
        $health = $this->faceService->healthCheck();

        return response()->json([
            'success' => true,
            'data' => $health,
        ], $health['available'] ? 200 : 503);
    }
}
