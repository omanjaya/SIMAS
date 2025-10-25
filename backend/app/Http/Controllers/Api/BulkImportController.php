<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SimplifiedImportService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class BulkImportController extends Controller
{
    protected $simplifiedImportService;

    public function __construct(SimplifiedImportService $simplifiedImportService)
    {
        $this->simplifiedImportService = $simplifiedImportService;
    }

    public function downloadTemplate()
    {
        // Create template content for complex import (17 columns)
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="employees_template.csv"',
        ];

        $template = "employee_code,first_name,last_name,email,phone,address,date_of_birth,gender,position,department,hire_date,employment_type,salary,salary_type,emergency_contact,profile_image,status\n";
        $template .= "EMP001,John,Doe,john.doe@school.com,+6281234567890,\"Jl. Raya No. 123\",1990-01-15,male,\"Guru Matematika\",Science,2025-01-15,full-time,5000000.00,monthly,\"{\\\"name\\\": \\\"Emergency Contact\\\", \\\"phone\\\": \\\"+628123456789\\\"}\",,active\n";
        $template .= "EMP002,Jane,Smith,jane.smith@school.com,08123456789,\"Jl. Pendidikan No. 45\",1988-05-20,female,\"Staff TU\",Administration,2025-02-01,full-time,4000000.00,monthly,\"{\\\"name\\\": \\\"Emergency Contact\\\", \\\"phone\\\": \\\"+628987654321\\\"}\",,active\n";
        $template .= "EMP003,Bob,Johnson,bob.johnson@school.com,,\"Jl. Sekolah No. 78\",,,male,\"Kepala Sekolah\",Administration,2024-12-01,full-time,8000000.00,monthly,\"{\\\"name\\\": \\\"Emergency Contact\\\", \\\"phone\\\": \\\"+628111222333\\\"}\",,active\n";

        $tempFile = tempnam(sys_get_temp_dir(), 'employees_template_');
        file_put_contents($tempFile, $template);

        return response()->download($tempFile, 'employees_template.csv', $headers)->deleteFileAfterSend(true);
    }

    // Download simplified template (4 columns)
    public function downloadSimplifiedTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="simplified_employees_template.csv"',
        ];

        $template = "full_name,email,hire_date,role\n";
        $template .= "I Wayan Sudiarta,wayan.sudiarta@sekolah.com,2024-01-15,teacher\n";
        $template .= "Ni Made Sari,made.sari@sekolah.com,2024-02-01,employee\n";
        $template .= "Komang Agus,agus.komang@sekolah.com,2024-03-01,admin\n";

        $tempFile = tempnam(sys_get_temp_dir(), 'simplified_employees_template_');
        file_put_contents($tempFile, $template);

        return response()->download($tempFile, 'simplified_employees_template.csv', $headers)->deleteFileAfterSend(true);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv|max:10240', // 10MB
        ]);

        // Check if this is a simplified import by examining the file structure
        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();

        // Read first few lines to determine if it's simplified format
        $handle = fopen($file->getRealPath(), 'r');
        $firstRow = fgetcsv($handle);
        fclose($handle);

        // Trim and lowercase headers for better detection
        $firstRow = array_map(function ($header) {
            return strtolower(trim($header));
        }, $firstRow);

        // Check if the file has the simplified format columns
        $isSimplified = (
            count($firstRow) == 4 &&
            in_array('full_name', $firstRow) &&
            in_array('email', $firstRow) &&
            in_array('hire_date', $firstRow) &&
            in_array('role', $firstRow)
        );

        if ($isSimplified) {
            // Process as simplified import
            \Log::info('Processing as SIMPLIFIED import (4 columns)', ['headers' => $firstRow]);

            return $this->processSimplifiedImport($request);
        } else {
            // Wrong format - return helpful error message
            \Log::warning('Invalid import format detected', ['headers' => $firstRow, 'count' => count($firstRow)]);

            return response()->json([
                'success' => false,
                'message' => 'Format file tidak sesuai. Gunakan template simplified (4 kolom: full_name, email, hire_date, role). Download template terbaru dari tombol "Download Template".',
                'data' => [
                    'total' => 0,
                    'success' => 0,
                    'failed' => 0,
                    'errors' => [
                        [
                            'row' => 1,
                            'email' => 'N/A',
                            'message' => 'File harus memiliki 4 kolom: full_name, email, hire_date, role. Kolom yang ditemukan: '.implode(', ', $firstRow),
                        ],
                    ],
                ],
            ], 422);
        }
    }

    protected function processSimplifiedImport(Request $request)
    {
        // Read the CSV content and convert to array format
        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();

        if ($extension === 'csv') {
            $handle = fopen($file->getRealPath(), 'r');
            $data = [];
            $headers = null;

            while (($row = fgetcsv($handle)) !== false) {
                if ($headers === null) {
                    // Normalize headers: trim whitespace and lowercase
                    $headers = array_map(function ($header) {
                        return strtolower(trim($header));
                    }, $row);

                    continue;
                }

                $data[] = array_combine($headers, $row);
            }
            fclose($handle);
        } else {
            // For Excel files, use Laravel Excel to convert to array
            $excelData = Excel::toArray(new \stdClass, $file);

            // Get the first sheet
            $sheet = $excelData[0] ?? [];

            if (empty($sheet)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File Excel kosong',
                    'data' => [
                        'total' => 0,
                        'success' => 0,
                        'failed' => 0,
                        'errors' => [],
                    ],
                ], 422);
            }

            // Convert to associative array and normalize headers
            $rawHeaders = $sheet[0] ?? [];
            $headers = array_map(function ($header) {
                return strtolower(trim($header));
            }, $rawHeaders);
            $data = [];

            for ($i = 1; $i < count($sheet); $i++) {
                if (! empty($sheet[$i])) {
                    $data[] = array_combine($headers, $sheet[$i]);
                }
            }
        }

        // Process the simplified import
        $result = $this->simplifiedImportService->processSimplifiedImport($data);

        return response()->json($result);
    }
}
