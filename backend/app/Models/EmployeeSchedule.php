<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeSchedule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'location_id',
        'day_of_week',
        'start_time',
        'end_time',
        'late_tolerance_minutes',
        'early_checkout_tolerance_minutes',
        'is_active',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'late_tolerance_minutes' => 'integer',
        'early_checkout_tolerance_minutes' => 'integer',
        'is_active' => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForEmployee($query, int $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeForDay($query, int $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    public function scopeForToday($query)
    {
        return $query->where('day_of_week', Carbon::now()->dayOfWeekIso);
    }

    public function getDayNameAttribute(): string
    {
        $days = [
            1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis',
            5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu',
        ];

        return $days[$this->day_of_week] ?? 'Unknown';
    }

    public function getWorkDurationMinutesAttribute(): int
    {
        $start = Carbon::parse($this->start_time);
        $end = Carbon::parse($this->end_time);

        return $end->diffInMinutes($start);
    }

    public function isValidCheckInTime(Carbon $checkInTime): bool
    {
        $scheduleStart = Carbon::parse($this->start_time);
        $maxAllowedTime = $scheduleStart->copy()->addMinutes($this->late_tolerance_minutes);

        return $checkInTime->lte($maxAllowedTime);
    }

    public function calculateLateMinutes(Carbon $checkInTime): int
    {
        $scheduleStart = Carbon::parse($this->start_time);

        // Calculate signed difference (negative if late, positive if early)
        $diffInMinutes = $checkInTime->diffInMinutes($scheduleStart, false);

        // Return 0 if not late (on time or early), otherwise return the positive number of late minutes
        return max(0, $diffInMinutes * -1);
    }
}
