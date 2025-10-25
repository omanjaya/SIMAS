<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Period extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_time',
        'end_time',
        'code',
        'is_active',
        'description',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Get the teacher schedules for this period.
     */
    public function teacherSchedules(): HasMany
    {
        return $this->hasMany(TeacherSchedule::class);
    }

    /**
     * Get the attendances for this period.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Scope to get active periods.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order periods.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    /**
     * Check if a given time falls within this period.
     */
    public function containsTime($time): bool
    {
        $time = date('H:i:s', strtotime($time));

        return $time >= $this->start_time && $time <= $this->end_time;
    }
}
