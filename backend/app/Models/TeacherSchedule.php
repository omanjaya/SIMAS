<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'period_id',
        'subject',
        'class_name',
        'room_number',
        'date',
        'day_of_week',
        'is_recurring',
        'schedule_type',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'date' => 'date',
        'is_recurring' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the employee for this schedule.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the period for this schedule.
     */
    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    /**
     * Scope to get active schedules.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get schedules for a specific date.
     */
    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    /**
     * Scope to get recurring schedules.
     */
    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    /**
     * Scope to get schedules for a specific employee.
     */
    public function scopeByEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }
}
