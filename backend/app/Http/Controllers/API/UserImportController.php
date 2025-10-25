<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\UserImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserImportController extends Controller
{
    protected $importService;

    public function __construct(UserImportService $importService)
    {
        $this->importService = $importService;
    }

    /**
     * Import users from CSV file
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
            'default_department' => 'nullable|string|max:255',
            'default_position' => 'nullable|string|max:255',
            'default_employment_type' => 'nullable|string|in:full-time,part-time,contract,intern',
        ]);

        $file = $request->file('file');

        // Read CSV file
        $csvData = [];
        $handle = fopen($file->getPathname(), 'r');

        if ($handle !== false) {
            while (($data = fgetcsv($handle)) !== false) {
                $csvData[] = $data;
            }
            fclose($handle);
        }

        // Import data
        $options = $request->only(['default_department', 'default_position', 'default_employment_type']);
        $result = $this->importService->importFromCsvData($csvData, $options);

        return response()->json([
            'message' => 'Import completed',
            'result' => $result,
        ]);
    }

    /**
     * Download CSV template for user import
     *
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="user_import_template.csv"',
        ];

        $template = "Name,Email,Role,Password\n";
        $template .= "John Doe,john@example.com,employee,password123\n";
        $template .= "Jane Smith,jane@example.com,teacher,password123\n";
        $template .= "Admin User,admin@example.com,admin,password123\n";

        $tempFile = tempnam(sys_get_temp_dir(), 'user_import_template');
        file_put_contents($tempFile, $template);

        return response()->download($tempFile, 'user_import_template.csv', $headers)->deleteFileAfterSend(true);
    }

    /**
     * Preview import data (first 10 rows)
     */
    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

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
