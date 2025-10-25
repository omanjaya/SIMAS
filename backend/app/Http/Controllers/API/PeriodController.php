<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePeriodRequest;
use App\Http\Requests\UpdatePeriodRequest;
use App\Models\Period;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PeriodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Period::query();

        // Apply filters if provided
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $periods = $query->orderBy('order')->get();

        return response()->json($periods);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePeriodRequest $request): JsonResponse
    {
        $period = Period::create($request->validated());

        return response()->json([
            'message' => 'Period created successfully',
            'period' => $period,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Period $period): JsonResponse
    {
        return response()->json($period);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePeriodRequest $request, Period $period): JsonResponse
    {
        $period->update($request->validated());

        return response()->json([
            'message' => 'Period updated successfully',
            'period' => $period,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Period $period): JsonResponse
    {
        $period->delete();

        return response()->json([
            'message' => 'Period deleted successfully',
        ]);
    }
}
