<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'period_id',
        'check_in_time',
        'check_out_time',
        'attendance_type',
        'check_in_location',
        'check_out_location',
        'check_in_image_path',
        'check_out_image_path',
        'check_in_latitude',
        'check_in_longitude',
        'check_out_latitude',
        'check_out_longitude',
        'check_in_location_distance',
        'check_out_location_distance',
        'check_in_late_minutes',
        'check_out_early_minutes',
        'geofencing_validation',
        'schedule_validation',
        'confidence_score',
        'biometric_data',
        'is_late',
        'is_early_departure',
        'overtime_minutes',
        'undertime_minutes',
        'notes',
        'status',
        'verified_by',
        'verified_at',
        'check_in_validation_passed',
        'check_out_validation_passed',
        'location_id',
        'check_in_distance',
        'check_out_distance',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
        'confidence_score' => 'decimal:2',
        'biometric_data' => 'array',
        'is_late' => 'boolean',
        'is_early_departure' => 'boolean',
        'overtime_minutes' => 'integer',
        'undertime_minutes' => 'integer',
        'verified_at' => 'datetime',
        'check_in_validation_passed' => 'boolean',
        'check_out_validation_passed' => 'boolean',
    ];

    /**
     * Get the employee for this attendance.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the period for this attendance.
     */
    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    /**
     * Get the user who verified this attendance.
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the location for this attendance.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the validations for this attendance.
     */
    public function validations(): HasMany
    {
        return $this->hasMany(AttendanceValidation::class);
    }

    /**
     * Get the check-in validations for this attendance.
     */
    public function checkInValidation(): HasMany
    {
        return $this->hasMany(AttendanceValidation::class)->where('validation_type', 'check_in');
    }

    /**
     * Get the check-out validations for this attendance.
     */
    public function checkOutValidation(): HasMany
    {
        return $this->hasMany(AttendanceValidation::class)->where('validation_type', 'check_out');
    }

    /**
     * Scope to get attendances for a specific employee.
     */
    public function scopeByEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Scope to get attendances for a specific date.
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('check_in_time', $date);
    }

    /**
     * Scope to get attendances for a date range.
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('check_in_time', [$startDate, $endDate]);
    }

    /**
     * Scope to get attendances by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get attendances by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('attendance_type', $type);
    }

    /**
     * Calculate the work duration in minutes.
     */
    public function getWorkDurationAttribute(): int
    {
        if (! $this->check_in_time || ! $this->check_out_time) {
            return 0;
        }

        return $this->check_out_time->diffInMinutes($this->check_in_time);
    }

    /**
     * Check if attendance is for a full day.
     */
    public function isFullDay(): bool
    {
        return $this->status !== 'half_day';
    }

    /**
     * Check if attendance is for a half day.
     */
    public function isHalfDay(): bool
    {
        return $this->status === 'half_day';
    }

    /**
     * Check if the employee was late.
     */
    public function wasLate(): bool
    {
        return $this->is_late;
    }

    /**
     * Check if the employee left early.
     */
    public function leftEarly(): bool
    {
        return $this->is_early_departure;
    }

    /**
     * Accessor for check-in coordinates.
     */
    public function getCheckInCoordinatesAttribute(): ?array
    {
        if (!$this->check_in_latitude || !$this->check_in_longitude) {
            return null;
        }

        return [
            'latitude' => (float) $this->check_in_latitude,
            'longitude' => (float) $this->check_in_longitude,
        ];
    }

    /**
     * Accessor for check-out coordinates.
     */
    public function getCheckOutCoordinatesAttribute(): ?array
    {
        if (!$this->check_out_latitude || !$this->check_out_longitude) {
            return null;
        }

        return [
            'latitude' => (float) $this->check_out_latitude,
            'longitude' => (float) $this->check_out_longitude,
        ];
    }

    /**
     * Check if attendance has valid check-in.
     */
    public function hasValidCheckIn(): bool
    {
        return $this->check_in_time && $this->check_in_validation_passed;
    }

    /**
     * Check if attendance has valid check-out.
     */
    public function hasValidCheckOut(): bool
    {
        return $this->check_out_time && $this->check_out_validation_passed;
    }

    /**
     * Hook for future analytics cache invalidation.
     */
    protected static function booted(): void
    {
        // TODO: invalidate analytics caches when attendance records change.
    }
}
