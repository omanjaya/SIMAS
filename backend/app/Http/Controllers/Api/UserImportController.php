<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportUsersRequest;
use App\Http\Requests\PreviewImportRequest;
use App\Jobs\ProcessUserBulkImport;
use App\Models\UserImport;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class UserImportController extends Controller
{
    /**
     * Handle bulk user import from CSV
     */
    public function bulkImport(ImportUsersRequest $request): JsonResponse
    {
        try {
            // Log the incoming request
            \Log::info('Bulk user import request received', [
                'user_id' => Auth::id(),
                'files' => $request->allFiles(),
                'all_input' => $request->all(),
            ]);

            $file = $request->file('csv_file');
            \Log::info('Processing file', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'valid' => $file->isValid(),
            ]);

            $fileName = $file->getClientOriginalName();
            $filePath = $file->storeAs('user_imports', time().'_'.$fileName);

            \Log::info('File stored', [
                'file_path' => $filePath,
            ]);

            // Create a user import record
            $userImport = UserImport::create([
                'filename' => $file->getClientOriginalName(),
                'user_id' => Auth::id(),
                'status' => 'pending',
                'total_records' => 0,
                'successful_records' => 0,
                'failed_records' => 0,
            ]);

            \Log::info('User import record created', [
                'import_id' => $userImport->id,
            ]);

            // Dispatch the job to process the CSV
            ProcessUserBulkImport::dispatch(
                $userImport->id,
                $filePath,
                Auth::id()
            );

            \Log::info('Job dispatched', [
                'import_id' => $userImport->id,
            ]);

            // Return immediate response with import info
            return response()->json([
                'message' => 'CSV upload successful, processing started',
                'import_id' => $userImport->id,
                'status' => 'pending',
                'filename' => $file->getClientOriginalName(),
                'created_at' => $userImport->created_at,
            ], 202); // 202 Accepted status

        } catch (\Exception $e) {
            \Log::error('Bulk user import failed', [
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
        $imports = UserImport::with('user')
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
        $import = UserImport::with('user')->findOrFail($id);

        return response()->json([
            'data' => $import,
        ]);
    }

    /**
     * Download CSV template for user import
     */
    public function downloadTemplate(): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="user_import_template.csv"',
        ];

        $template = "employee_code,first_name,last_name,email,phone,address,date_of_birth,gender,position,department,hire_date,employment_type,salary,salary_type,status,role,password\n";
        $template .= "EMP001,John,Doe,john.doe@example.com,1234567890,123 Main St,1990-01-01,male,Teacher,IT,2024-01-15,full-time,5000000,monthly,active,employee,password123\n";
        $template .= "EMP002,Jane,Smith,jane.smith@example.com,0987654321,456 Oak Ave,1985-05-15,female,Admin,Administration,2024-02-01,full-time,4500000,monthly,active,employee,password123\n";

        $tempFile = tempnam(sys_get_temp_dir(), 'user_import_template');
        file_put_contents($tempFile, $template);

        return response()->download($tempFile, 'user_import_template.csv', $headers)->deleteFileAfterSend(true);
    }

    /**
     * Preview import data (first 10 rows)
     */
    public function preview(PreviewImportRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $handle = fopen($file->getPathname(), 'r');

        $preview = [];
        $header = fgetcsv($handle);
        $rowCount = 0;

        while (($data = fgetcsv($handle)) !== false && $rowCount < 10) {
            $preview[] = array_combine($header, $data);
            $rowCount++;
        }

        fclose($handle);

        return response()->json([
            'header' => $header,
            'preview_data' => $preview,
            'total_rows' => $rowCount,
        ]);
    }
}
