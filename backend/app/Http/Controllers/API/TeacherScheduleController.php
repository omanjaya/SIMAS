<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherScheduleRequest;
use App\Http\Requests\UpdateTeacherScheduleRequest;
use App\Models\TeacherSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TeacherSchedule::with(['employee', 'period']);

        // Apply filters if provided
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('date')) {
            $query->where('date', $request->date);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $schedules = $query->get();

        return response()->json($schedules);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeacherScheduleRequest $request): JsonResponse
    {
        $schedule = TeacherSchedule::create($request->validated());

        return response()->json([
            'message' => 'Teacher schedule created successfully',
            'schedule' => $schedule->load(['employee', 'period']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TeacherSchedule $teacherSchedule): JsonResponse
    {
        return response()->json($teacherSchedule->load(['employee', 'period']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTeacherScheduleRequest $request, TeacherSchedule $teacherSchedule): JsonResponse
    {
        $teacherSchedule->update($request->validated());

        return response()->json([
            'message' => 'Teacher schedule updated successfully',
            'schedule' => $teacherSchedule->load(['employee', 'period']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TeacherSchedule $teacherSchedule): JsonResponse
    {
        $teacherSchedule->delete();

        return response()->json([
            'message' => 'Teacher schedule deleted successfully',
        ]);
    }
}
