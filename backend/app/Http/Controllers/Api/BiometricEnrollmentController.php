<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessBiometricBulkEnrollment;
use App\Models\BiometricImport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class BiometricEnrollmentController extends Controller
{
    /**
     * Handle bulk biometric enrollment from CSV
     */
    public function bulkEnrollment(Request $request): JsonResponse
    {
        try {
            // Log the incoming request
            \Log::info('Bulk enrollment request received', [
                'user_id' => Auth::id(),
                'files' => $request->allFiles(),
                'all_input' => $request->all(),
            ]);

            // Validate the request
            $validator = Validator::make($request->all(), [
                'csv_file' => 'required|file|mimes:csv,txt|max:10240', // max 10MB
            ]);

            if ($validator->fails()) {
                \Log::warning('Bulk enrollment validation failed', [
                    'errors' => $validator->errors(),
                ]);

                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $file = $request->file('csv_file');
            \Log::info('Processing file', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'valid' => $file->isValid(),
            ]);

            $fileName = $file->getClientOriginalName();
            $filePath = $file->storeAs('biometric_imports', time().'_'.$fileName);

            \Log::info('File stored', [
                'file_path' => $filePath,
            ]);

            // Create a biometric import record
            $biometricImport = BiometricImport::create([
                'filename' => $file->getClientOriginalName(),
                'user_id' => Auth::id(),
                'status' => 'pending',
                'total_records' => 0,
                'successful_records' => 0,
                'failed_records' => 0,
            ]);

            \Log::info('Biometric import record created', [
                'import_id' => $biometricImport->id,
            ]);

            // Dispatch the job to process the CSV
            ProcessBiometricBulkEnrollment::dispatch(
                $biometricImport->id,
                $filePath,
                Auth::id()
            );

            \Log::info('Job dispatched', [
                'import_id' => $biometricImport->id,
            ]);

            // Return immediate response with import info
            return response()->json([
                'message' => 'CSV upload successful, processing started',
                'import_id' => $biometricImport->id,
                'status' => 'pending',
                'filename' => $file->getClientOriginalName(),
                'created_at' => $biometricImport->created_at,
            ], 202); // 202 Accepted status

        } catch (ValidationException $e) {
            \Log::error('Bulk enrollment validation exception', [
                'errors' => $e->errors(),
            ]);

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Bulk enrollment failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to process CSV file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get import history
     */
    public function getImportHistory(Request $request): JsonResponse
    {
        $imports = BiometricImport::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'data' => $imports->items(),
            'pagination' => [
                'current_page' => $imports->currentPage(),
                'per_page' => $imports->perPage(),
                'total' => $imports->total(),
                'last_page' => $imports->lastPage(),
            ],
        ]);
    }

    /**
     * Get specific import details
     */
    public function getImportDetails(int $id): JsonResponse
    {
        $import = BiometricImport::with('user')->findOrFail($id);

        return response()->json([
            'data' => $import,
        ]);
    }
}
