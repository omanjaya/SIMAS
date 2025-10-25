<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Get audit logs with filters
     */
    public function index(Request $request): JsonResponse
    {
        // Only allow admin users to view audit logs
        if (! auth()->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $query = AuditLog::with('user')->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', 'like', '%'.$request->action.'%');
        }

        if ($request->has('model')) {
            $query->where('model', 'like', '%'.$request->model.'%');
        }

        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->date_from.' 00:00:00');
        }

        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->date_to.' 23:59:59');
        }

        $perPage = $request->get('per_page', 15);
        $auditLogs = $query->paginate($perPage);

        return response()->json([
            'data' => $auditLogs->items(),
            'pagination' => [
                'current_page' => $auditLogs->currentPage(),
                'per_page' => $auditLogs->perPage(),
                'total' => $auditLogs->total(),
                'last_page' => $auditLogs->lastPage(),
            ],
        ]);
    }

    /**
     * Get a specific audit log
     */
    public function show(int $id): JsonResponse
    {
        // Only allow admin users to view audit logs
        if (! auth()->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $auditLog = AuditLog::with('user')->findOrFail($id);

        return response()->json([
            'data' => $auditLog,
        ]);
    }
}
