<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFaceTemplateRequest;
use App\Models\FaceTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaceTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = FaceTemplate::with('employee');

        // For admin users, show all face templates
        // For regular users, show only their own
        if (! $user->isAdmin()) {
            $query->where('employee_id', $user->employee->id ?? null);
        }

        $faceTemplates = $query->get();

        return response()->json($faceTemplates);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFaceTemplateRequest $request): JsonResponse
    {
        $user = $request->user();

        // Non-admin users can only create face templates for themselves
        if (! $user->isAdmin()) {
            $request->merge(['employee_id' => $user->employee->id]);
        }

        // Check if a face template already exists for this employee
        $existingTemplate = FaceTemplate::where('employee_id', $request->employee_id)->first();
        if ($existingTemplate) {
            return response()->json([
                'message' => 'Face template already exists for this employee',
            ], 409);
        }

        $faceTemplate = FaceTemplate::create(array_merge(
            $request->validated(),
            [
                'enrolled_by' => $user->id,
                'enrolled_at' => now(),
            ]
        ));

        return response()->json([
            'message' => 'Face template enrolled successfully',
            'face_template' => $faceTemplate->load('employee'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(FaceTemplate $faceTemplate): JsonResponse
    {
        $user = auth()->user();

        // Check if the user can view this face template
        if (! $user->isAdmin() && $faceTemplate->employee_id !== $user->employee?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($faceTemplate->load('employee'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreFaceTemplateRequest $request, FaceTemplate $faceTemplate): JsonResponse
    {
        $user = $request->user();

        // Only admin can update face templates
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $faceTemplate->update($request->validated());

        return response()->json([
            'message' => 'Face template updated successfully',
            'face_template' => $faceTemplate->load('employee'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FaceTemplate $faceTemplate): JsonResponse
    {
        $user = auth()->user();

        // Only admin can delete face templates
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $faceTemplate->delete();

        return response()->json([
            'message' => 'Face template deleted successfully',
        ]);
    }
}
