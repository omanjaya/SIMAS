<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeScheduleRequest;
use App\Http\Requests\UpdateEmployeeScheduleRequest;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EmployeeSchedule::query()->with(['employee', 'location', 'creator', 'updater']);

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        if ($request->has('day_of_week')) {
            $query->where('day_of_week', $request->day_of_week);
        }

        if ($request->has('is_active')) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        $sortBy = $request->get('sort_by', 'day_of_week');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $schedules = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $schedules->items(),
            'total' => $schedules->total(),
            'current_page' => $schedules->currentPage(),
            'last_page' => $schedules->lastPage(),
            'per_page' => $schedules->perPage(),
        ]);
    }

    public function store(StoreEmployeeScheduleRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $schedule = EmployeeSchedule::create([
                ...$request->validated(),
                'created_by' => $request->user()->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Jadwal pegawai berhasil ditambahkan',
                'data' => $schedule->load(['employee', 'location', 'creator']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan jadwal pegawai',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(EmployeeSchedule $employeeSchedule): JsonResponse
    {
        $employeeSchedule->load(['employee', 'location', 'creator', 'updater']);

        return response()->json([
            'success' => true,
            'data' => $employeeSchedule,
        ]);
    }

    public function update(UpdateEmployeeScheduleRequest $request, EmployeeSchedule $employeeSchedule): JsonResponse
    {
        DB::beginTransaction();

        try {
            $employeeSchedule->update([
                ...$request->validated(),
                'updated_by' => $request->user()->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Jadwal pegawai berhasil diperbarui',
                'data' => $employeeSchedule->fresh()->load(['employee', 'location', 'creator', 'updater']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui jadwal pegawai',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(EmployeeSchedule $employeeSchedule): JsonResponse
    {
        DB::beginTransaction();

        try {
            $employeeSchedule->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Jadwal pegawai berhasil dihapus',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus jadwal pegawai',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getEmployeeSchedules(Employee $employee): JsonResponse
    {
        $schedules = $employee->schedules()->with(['location', 'creator', 'updater'])->get();

        return response()->json([
            'success' => true,
            'data' => $schedules,
        ]);
    }

    public function bulkAssign(Request $request, Employee $employee): JsonResponse
    {
        $request->validate([
            'schedules' => 'required|array',
            'schedules.*.day_of_week' => 'required|integer|min:1|max:7',
            'schedules.*.location_id' => 'required|exists:locations,id',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.end_time' => 'required|date_format:H:i|after:schedules.*.start_time',
            'schedules.*.late_tolerance_minutes' => 'nullable|integer|min:0|max:120',
            'schedules.*.early_checkout_tolerance_minutes' => 'nullable|integer|min:0|max:120',
            'schedules.*.is_active' => 'boolean',
            'schedules.*.notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            // Delete existing schedules for this employee
            $employee->schedules()->delete();

            // Create new schedules
            foreach ($request->schedules as $scheduleData) {
                $employee->schedules()->create([
                    ...$scheduleData,
                    'created_by' => $request->user()->id,
                ]);
            }

            DB::commit();

            $schedules = $employee->schedules()->with(['location', 'creator', 'updater'])->get();

            return response()->json([
                'success' => true,
                'message' => 'Jadwal pegawai berhasil ditetapkan',
                'data' => $schedules,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menetapkan jadwal pegawai',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
