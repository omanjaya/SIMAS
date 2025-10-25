<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Models\Location;
use App\Models\LocationAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LocationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Location::query()->with(['creator', 'updater']);

        if ($request->has('is_active')) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('code', 'LIKE', "%{$search}%")
                    ->orWhere('address', 'LIKE', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $locations = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $locations->items(),
            'total' => $locations->total(),
            'current_page' => $locations->currentPage(),
            'last_page' => $locations->lastPage(),
            'per_page' => $locations->perPage(),
        ]);
    }

    public function store(StoreLocationRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $location = Location::create([
                ...$request->validated(),
                'created_by' => $request->user()->id,
            ]);

            LocationAuditLog::create([
                'location_id' => $location->id,
                'user_id' => $request->user()->id,
                'action' => 'created',
                'new_values' => $location->toArray(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lokasi berhasil ditambahkan',
                'data' => $location->load(['creator']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan lokasi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Location $location): JsonResponse
    {
        $location->load(['creator', 'updater']);

        return response()->json([
            'success' => true,
            'data' => $location,
        ]);
    }

    public function update(UpdateLocationRequest $request, Location $location): JsonResponse
    {
        DB::beginTransaction();

        try {
            $oldValues = $location->toArray();

            $location->update([
                ...$request->validated(),
                'updated_by' => $request->user()->id,
            ]);

            LocationAuditLog::create([
                'location_id' => $location->id,
                'user_id' => $request->user()->id,
                'action' => 'updated',
                'old_values' => $oldValues,
                'new_values' => $location->fresh()->toArray(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lokasi berhasil diperbarui',
                'data' => $location->fresh()->load(['creator', 'updater']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui lokasi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, Location $location): JsonResponse
    {
        DB::beginTransaction();

        try {
            $usageCount = $location->employeeSchedules()->count();

            if ($usageCount > 0) {
                DB::rollBack(); // Explicitly rollback before returning
                
                return response()->json([
                    'success' => false,
                    'message' => "Lokasi tidak dapat dihapus karena masih digunakan oleh {$usageCount} jadwal pegawai",
                ], 422);
            }

            LocationAuditLog::create([
                'location_id' => $location->id,
                'user_id' => $request->user()->id,
                'action' => 'deleted',
                'old_values' => $location->toArray(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $location->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lokasi berhasil dihapus',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus lokasi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function auditLogs(Location $location): JsonResponse
    {
        $logs = $location->auditLogs()
            ->with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'total' => $logs->total(),
            'current_page' => $logs->currentPage(),
            'last_page' => $logs->lastPage(),
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total_locations' => Location::count(),
            'active_locations' => Location::active()->count(),
            'inactive_locations' => Location::where('is_active', false)->count(),
            'locations_in_use' => Location::has('employeeSchedules')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
