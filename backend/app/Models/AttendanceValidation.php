<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceValidation extends Model
{
    use HasFactory;

    protected $fillable = [
        'attendance_id',
        'employee_id',
        'validation_type',
        'gps_latitude',
        'gps_longitude',
        'distance_from_location',
        'location_validation_passed',
        'schedule_validation_passed',
        'face_verification_passed',
        'overall_validation_passed',
        'location_validation_details',
        'schedule_validation_details',
        'face_verification_details',
        'failed_reason',
        'ip_address',
        'user_agent',
        'device_info',
    ];

    protected $casts = [
        'gps_latitude' => 'decimal:8',
        'gps_longitude' => 'decimal:8',
        'distance_from_location' => 'decimal:2',
        'location_validation_passed' => 'boolean',
        'schedule_validation_passed' => 'boolean',
        'face_verification_passed' => 'boolean',
        'overall_validation_passed' => 'boolean',
        'location_validation_details' => 'array',
        'schedule_validation_details' => 'array',
        'face_verification_details' => 'array',
    ];

    // Relationships
    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    // Scopes
    public function scopeFailed($query)
    {
        return $query->where('overall_validation_passed', false);
    }

    public function scopePassed($query)
    {
        return $query->where('overall_validation_passed', true);
    }

    public function scopeCheckIn($query)
    {
        return $query->where('validation_type', 'check_in');
    }

    public function scopeCheckOut($query)
    {
        return $query->where('validation_type', 'check_out');
    }

    public function scopeForEmployee($query, int $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Helper Methods
    public function getFailedValidations(): array
    {
        $failed = [];

        if (!$this->location_validation_passed) {
            $failed[] = 'location';
        }

        if (!$this->schedule_validation_passed) {
            $failed[] = 'schedule';
        }

        if (!$this->face_verification_passed) {
            $failed[] = 'face';
        }

        return $failed;
    }

    public function getValidationSummary(): array
    {
        return [
            'type' => $this->validation_type,
            'passed' => $this->overall_validation_passed,
            'validations' => [
                'location' => [
                    'passed' => $this->location_validation_passed,
                    'details' => $this->location_validation_details,
                ],
                'schedule' => [
                    'passed' => $this->schedule_validation_passed,
                    'details' => $this->schedule_validation_details,
                ],
                'face' => [
                    'passed' => $this->face_verification_passed,
                    'details' => $this->face_verification_details,
                ],
            ],
            'failed_reason' => $this->failed_reason,
            'timestamp' => $this->created_at,
        ];
    }
}
