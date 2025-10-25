<?php

namespace App\Jobs;

use App\Models\BiometricImport;
use App\Models\Employee;
use App\Models\FaceTemplate;
use App\Services\FaceRecognitionService;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use League\Csv\Reader;

class ProcessBiometricBulkEnrollment implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected int $biometricImportId,
        protected string $filePath,
        protected int $userId
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(FaceRecognitionService $faceRecognitionService): void
    {
        $biometricImport = BiometricImport::findOrFail($this->biometricImportId);

        // Update status to processing
        $biometricImport->update(['status' => 'processing']);

        $totalRecords = 0;
        $successfulRecords = 0;
        $failedRecords = 0;
        $errors = [];

        try {
            // Read the CSV file
            $csv = Reader::createFromPath(storage_path('app/'.$this->filePath), 'r');
            $csv->setHeaderOffset(0); // Set the first row as header

            foreach ($csv as $index => $row) {
                $totalRecords++;

                // Validate required fields
                if (empty($row['employee_code']) || empty($row['image_path'])) {
                    $errors[] = [
                        'line' => $index + 1,
                        'error' => 'Missing required fields: employee_code or image_path',
                        'data' => $row,
                    ];
                    $failedRecords++;

                    continue;
                }

                // Find employee by employee code
                $employee = Employee::where('employee_code', $row['employee_code'])->first();

                if (! $employee) {
                    $errors[] = [
                        'line' => $index + 1,
                        'error' => 'Employee with code '.$row['employee_code'].' not found',
                        'data' => $row,
                    ];
                    $failedRecords++;

                    continue;
                }

                try {
                    // Process the face template enrollment using the service
                    $faceTemplate = new FaceTemplate;
                    $faceTemplate->employee_id = $employee->id;
                    $faceTemplate->template_data = $faceRecognitionService->processImage($row['image_path']);
                    $faceTemplate->save();

                    $successfulRecords++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'line' => $index + 1,
                        'error' => 'Failed to process face template: '.$e->getMessage(),
                        'data' => $row,
                    ];
                    $failedRecords++;
                }
            }

            // Update the biometric import record with results
            $biometricImport->update([
                'total_records' => $totalRecords,
                'successful_records' => $successfulRecords,
                'failed_records' => $failedRecords,
                'summary' => [
                    'total' => $totalRecords,
                    'successful' => $successfulRecords,
                    'failed' => $failedRecords,
                    'success_rate' => $totalRecords > 0 ? round(($successfulRecords / $totalRecords) * 100, 2) : 0,
                ],
                'errors' => $errors,
                'status' => $failedRecords > 0 ? ($successfulRecords > 0 ? 'completed' : 'failed') : 'completed',
                'completed_at' => now(),
            ]);

        } catch (\Exception $e) {
            // Update the import record as failed
            $biometricImport->update([
                'status' => 'failed',
                'errors' => [
                    ['error' => 'Failed to read CSV file: '.$e->getMessage()],
                ],
                'completed_at' => now(),
            ]);
            throw $e;
        }
    }
}
