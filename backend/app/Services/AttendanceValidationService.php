<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceValidation;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AttendanceValidationService
{
    protected GeofencingService $geofencingService;
    protected ScheduleValidationService $scheduleService;
    protected FaceRecognitionService $faceService;

    public function __construct(
        GeofencingService $geofencingService,
        ScheduleValidationService $scheduleService,
        FaceRecognitionService $faceService
    ) {
        $this->geofencingService = $geofencingService;
        $this->scheduleService = $scheduleService;
        $this->faceService = $faceService;
    }

    /**
     * Validate and process check-in
     *
     * @param int $employeeId
     * @param float $latitude
     * @param float $longitude
     * @param string|null $faceImage Base64 encoded image
     * @param Carbon|null $timestamp
     * @param array $metadata Additional metadata (ip, user_agent, device_info)
     * @return array
     */
    public function validateClockIn(
        int $employeeId,
        float $latitude,
        float $longitude,
        ?string $faceImage = null,
        ?Carbon $timestamp = null,
        array $metadata = []
    ): array {
        $timestamp = $timestamp ?? now();
        $employee = Employee::with(['activeSchedules.location'])->findOrFail($employeeId);

        DB::beginTransaction();

        try {
            // Step 1: Validate GPS coordinates format
            $gpsValidation = $this->geofencingService->validateGpsCoordinates($latitude, $longitude);

            if (!$gpsValidation['valid']) {
                return $this->createFailedValidation(
                    $employee,
                    'check_in',
                    $latitude,
                    $longitude,
                    'GPS tidak valid: ' . implode(', ', $gpsValidation['errors']),
                    [],
                    $metadata
                );
            }

            // Step 2: Validate schedule (check if employee has schedule today)
            $scheduleValidation = $this->scheduleService->validateCheckIn($employee, $timestamp);

            if (!$scheduleValidation['valid']) {
                return $this->createFailedValidation(
                    $employee,
                    'check_in',
                    $latitude,
                    $longitude,
                    $scheduleValidation['reason'],
                    ['schedule' => $scheduleValidation],
                    $metadata
                );
            }

            $schedule = $scheduleValidation['schedule'];

            // Step 3: Validate location (geofencing)
            $locationValidation = $this->geofencingService->validateEmployeeLocation(
                $employee,
                $latitude,
                $longitude,
                $timestamp->dayOfWeekIso
            );

            $allValidationsPassed = $scheduleValidation['valid'] &&
                                    $locationValidation['valid'];

            // Step 4: Face verification (optional for now, will be implemented in Phase 5)
            $faceValidation = [
                'valid' => true, // Temporary: auto-pass for Phase 4
                'reason' => 'Face verification will be implemented in Phase 5',
                'confidence' => null,
            ];

            // If face image is provided, validate it
            if ($faceImage && config('services.face_recognition.enabled', false)) {
                $faceResult = $this->faceService->verifyFace($employeeId, $faceImage);
                
                if (!$faceResult['success']) {
                    $faceValidation = [
                        'valid' => false,
                        'reason' => $faceResult['message'],
                        'confidence' => 0,
                    ];
                    
                    // Check if fallback is enabled
                    if (config('services.face_recognition.fallback_enabled', true)) {
                        Log::warning('Face verification failed, fallback allowed', [
                            'employee_id' => $employeeId,
                            'reason' => $faceResult['message'],
                        ]);
                        
                        $faceValidation['valid'] = true;
                        $faceValidation['reason'] = 'Face verification failed, using fallback';
                    }
                } else {
                    $faceValidation = [
                        'valid' => $faceResult['verified'],
                        'reason' => $faceResult['message'],
                        'confidence' => $faceResult['confidence'],
                    ];
                }
                
                // Update overall validation based on face verification
                $allValidationsPassed = $allValidationsPassed && $faceValidation['valid'];
            } elseif (config('services.face_recognition.enabled', false) && !$faceImage) {
                $faceValidation = [
                    'valid' => config('services.face_recognition.fallback_enabled', true),
                    'reason' => 'Face image not provided, ' . (config('services.face_recognition.fallback_enabled', true) ? 'fallback allowed' : 'rejected'),
                    'confidence' => 0,
                ];
            }

            // If all validations pass, create attendance record
            if ($allValidationsPassed) {
                $attendance = $this->createAttendanceRecord(
                    $employee,
                    $schedule,
                    $latitude,
                    $longitude,
                    $timestamp,
                    $locationValidation
                );

                // Create validation log
                $validationLog = $this->createValidationLog(
                    $employee,
                    'check_in',
                    $latitude,
                    $longitude,
                    true,
                    null,
                    $locationValidation,
                    $scheduleValidation,
                    $faceValidation,
                    $metadata,
                    $attendance->id
                );

                DB::commit();

                return [
                    'success' => true,
                    'message' => 'Check-in berhasil',
                    'attendance' => $attendance->fresh(['employee', 'location', 'period']),
                    'validation' => $validationLog,
                    'summary' => [
                        'location_valid' => true,
                        'schedule_valid' => true,
                        'face_valid' => true,
                        'is_late' => $scheduleValidation['late_minutes'] > 0,
                        'late_minutes' => $scheduleValidation['late_minutes'],
                        'distance_from_location' => $locationValidation['distance'],
                    ],
                ];
            }

            // Validation failed
            $failedReason = !$locationValidation['valid']
                ? $locationValidation['reason']
                : ($scheduleValidation['valid'] 
                    ? ($faceValidation['valid'] ? 'Unknown validation error' : $faceValidation['reason'])
                    : $scheduleValidation['reason']);

            $validationLog = $this->createValidationLog(
                $employee,
                'check_in',
                $latitude,
                $longitude,
                false,
                $failedReason,
                $locationValidation,
                $scheduleValidation,
                $faceValidation,
                $metadata
            );

            DB::commit();

            return [
                'success' => false,
                'message' => 'Check-in gagal: ' . $failedReason,
                'validation' => $validationLog,
                'summary' => [
                    'location_valid' => $locationValidation['valid'],
                    'schedule_valid' => $scheduleValidation['valid'],
                    'face_valid' => $faceValidation['valid'],
                ],
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Check-in validation failed', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Validate and process check-out
     */
    public function validateClockOut(
        int $attendanceId,
        float $latitude,
        float $longitude,
        ?Carbon $timestamp = null,
        array $metadata = []
    ): array {
        $timestamp = $timestamp ?? now();
        $attendance = Attendance::with(['employee.activeSchedules.location', 'location'])
            ->findOrFail($attendanceId);

        DB::beginTransaction();

        try {
            // Check if already checked out
            if ($attendance->check_out_time) {
                return [
                    'success' => false,
                    'message' => 'Sudah melakukan check-out sebelumnya',
                ];
            }

            // Validate GPS
            $gpsValidation = $this->geofencingService->validateGpsCoordinates($latitude, $longitude);

            if (!$gpsValidation['valid']) {
                return [
                    'success' => false,
                    'message' => 'GPS tidak valid: ' . implode(', ', $gpsValidation['errors']),
                ];
            }

            // Validate schedule
            $scheduleValidation = $this->scheduleService->validateCheckOut(
                $attendance->employee,
                $timestamp
            );

            // Validate location
            $locationValidation = $this->geofencingService->isWithinRadius(
                $attendance->location,
                $latitude,
                $longitude
            );

            $allValidationsPassed = $scheduleValidation['valid'] &&
                                    $locationValidation['is_within_radius'];

            if (! $allValidationsPassed) {
                if (! $scheduleValidation['valid']) {
                    $failureDetail = 'Jadwal tidak valid: '.$scheduleValidation['reason'];
                } elseif (! $locationValidation['is_within_radius']) {
                    $failureDetail = 'Lokasi tidak valid';
                } else {
                    $failureDetail = 'Validasi tidak lolos';
                }

                $validationLog = $this->createValidationLog(
                    $attendance->employee,
                    'check_out',
                    $latitude,
                    $longitude,
                    false,
                    'Check-out gagal: '.$failureDetail,
                    [
                        'valid' => $locationValidation['is_within_radius'],
                        'distance' => $locationValidation['distance'],
                        'radius' => $attendance->location?->radius_meters,
                    ],
                    $scheduleValidation,
                    ['valid' => true], // Face not required for check-out
                    $metadata,
                    $attendance->id
                );

                DB::commit();

                return [
                    'success' => false,
                    'message' => 'Check-out gagal: '.$failureDetail,
                    'validation' => $validationLog,
                    'summary' => [
                        'location_valid' => $locationValidation['is_within_radius'],
                        'schedule_valid' => $scheduleValidation['valid'],
                    ],
                ];
            }

            // Update attendance record
            $attendance->update([
                'check_out_time' => $timestamp,
                'check_out_latitude' => $latitude,
                'check_out_longitude' => $longitude,
                'check_out_validation_passed' => true,
                'check_out_distance' => $locationValidation['distance'],
            ]);

            // Create validation log
            $validationLog = $this->createValidationLog(
                $attendance->employee,
                'check_out',
                $latitude,
                $longitude,
                $allValidationsPassed,
                $allValidationsPassed ? null : 'Check-out validation failed',
                [
                    'valid' => $locationValidation['is_within_radius'],
                    'distance' => $locationValidation['distance'],
                    'radius' => $attendance->location?->radius_meters,
                ],
                $scheduleValidation,
                ['valid' => true], // Face not required for check-out
                $metadata,
                $attendance->id
            );

            DB::commit();

            return [
                'success' => true,
                'message' => 'Check-out berhasil',
                'attendance' => $attendance->fresh(['employee', 'location']),
                'validation' => $validationLog,
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Check-out validation failed', [
                'attendance_id' => $attendanceId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Create attendance record
     */
    protected function createAttendanceRecord(
        Employee $employee,
        $schedule,
        float $latitude,
        float $longitude,
        Carbon $timestamp,
        array $locationValidation
    ): Attendance {
        $lateMinutes = $this->scheduleService->calculateLateMinutes($schedule, $timestamp);

        return Attendance::create([
            'employee_id' => $employee->id,
            'location_id' => $schedule->location_id,
            'period_id' => null, // Or get from a real period if needed
            'check_in_time' => $timestamp,
            'check_in_latitude' => $latitude,
            'check_in_longitude' => $longitude,
            'check_in_validation_passed' => true,
            'check_in_distance' => $locationValidation['distance'],
            'attendance_type' => 'face_recognition',
            'status' => 'present',
            'is_late' => $lateMinutes > 0,
            'late_minutes' => $lateMinutes,
        ]);
    }

    /**
     * Create validation log
     */
    protected function createValidationLog(
        Employee $employee,
        string $validationType,
        float $latitude,
        float $longitude,
        bool $passed,
        ?string $failedReason,
        array $locationValidation,
        array $scheduleValidation,
        array $faceValidation,
        array $metadata,
        ?int $attendanceId = null
    ): AttendanceValidation {
        return AttendanceValidation::create([
            'attendance_id' => $attendanceId,
            'employee_id' => $employee->id,
            'validation_type' => $validationType,
            'gps_latitude' => $latitude,
            'gps_longitude' => $longitude,
            'distance_from_location' => $locationValidation['distance'] ?? null,
            'location_validation_passed' => $locationValidation['valid'] ?? false,
            'schedule_validation_passed' => $scheduleValidation['valid'] ?? false,
            'face_verification_passed' => $faceValidation['valid'] ?? false,
            'overall_validation_passed' => $passed,
            'location_validation_details' => $locationValidation,
            'schedule_validation_details' => $scheduleValidation,
            'face_verification_details' => $faceValidation,
            'failed_reason' => $failedReason,
            'ip_address' => $metadata['ip'] ?? null,
            'user_agent' => $metadata['user_agent'] ?? null,
            'device_info' => $metadata['device_info'] ?? null,
        ]);
    }

    /**
     * Helper to create failed validation
     */
    protected function createFailedValidation(
        Employee $employee,
        string $type,
        float $lat,
        float $lon,
        string $reason,
        array $details,
        array $metadata
    ): array {
        $validation = AttendanceValidation::create([
            'employee_id' => $employee->id,
            'validation_type' => $type,
            'gps_latitude' => $lat,
            'gps_longitude' => $lon,
            'overall_validation_passed' => false,
            'failed_reason' => $reason,
            'location_validation_details' => $details['location'] ?? [],
            'schedule_validation_details' => $details['schedule'] ?? [],
            'ip_address' => $metadata['ip'] ?? null,
            'user_agent' => $metadata['user_agent'] ?? null,
        ]);

        DB::commit();

        return [
            'success' => false,
            'message' => $reason,
            'validation' => $validation,
        ];
    }

    /**
     * Get failed validation attempts
     */
    public function getFailedAttempts(int $employeeId, int $days = 7): array
    {
        $attempts = AttendanceValidation::forEmployee($employeeId)
            ->failed()
            ->recent($days)
            ->orderBy('created_at', 'desc')
            ->get();

        return [
            'total_failed' => $attempts->count(),
            'attempts' => $attempts->map(function ($attempt) {
                return $attempt->getValidationSummary();
            }),
        ];
    }
}
