<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchoolCalendarRequest;
use App\Http\Requests\UpdateSchoolCalendarRequest;
use App\Models\SchoolCalendar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolCalendarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = SchoolCalendar::query();

        // Apply date range filter if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                ->orWhere(function ($q) use ($request) {
                    $q->where('start_date', '<=', $request->start_date)
                        ->where('end_date', '>=', $request->end_date);
                });
        } elseif ($request->has('start_date')) {
            $query->where('start_date', '>=', $request->start_date);
        } elseif ($request->has('end_date')) {
            $query->where('end_date', '<=', $request->end_date);
        }

        // Apply event type filter if provided
        if ($request->has('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        // Apply active filter if provided
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $calendars = $query->orderBy('start_date')->get();

        return response()->json($calendars);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSchoolCalendarRequest $request): JsonResponse
    {
        $calendar = SchoolCalendar::create($request->validated());

        return response()->json([
            'message' => 'Calendar event created successfully',
            'calendar' => $calendar,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SchoolCalendar $schoolCalendar): JsonResponse
    {
        return response()->json($schoolCalendar);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSchoolCalendarRequest $request, SchoolCalendar $schoolCalendar): JsonResponse
    {
        $schoolCalendar->update($request->validated());

        return response()->json([
            'message' => 'Calendar event updated successfully',
            'calendar' => $schoolCalendar,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SchoolCalendar $schoolCalendar): JsonResponse
    {
        $schoolCalendar->delete();

        return response()->json([
            'message' => 'Calendar event deleted successfully',
        ]);
    }
}
