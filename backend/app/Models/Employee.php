<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_code',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'address_ktp',
        'address_domisili',
        'date_of_birth',
        'gender',
        'position',
        'secondary_position',
        'department',
        'rank',
        'job_class',
        'tpp_amount',
        'hire_date',
        'employment_type',
        'salary',
        'salary_type',
        'emergency_contact',
        'profile_image',
        'status',
        'user_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'hire_date' => 'date',
        'salary' => 'decimal:2',
        'tpp_amount' => 'decimal:2',
        'emergency_contact' => 'array',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the employee.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attendances for the employee.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get the leave requests for the employee.
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /**
     * Get the teacher schedules for the employee.
     */
    public function teacherSchedules(): HasMany
    {
        return $this->hasMany(TeacherSchedule::class);
    }

    /**
     * Get the salary records for the employee.
     */
    public function salaries(): HasMany
    {
        return $this->hasMany(Salary::class);
    }

    /**
     * Get the face template for the employee.
     */
    public function faceTemplate()
    {
        return $this->hasOne(FaceTemplate::class);
    }

    /**
     * Get the full name attribute.
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }

    /**
     * Scope to get employees by department.
     */
    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    /**
     * Scope to get employees by employment type.
     */
    public function scopeByEmploymentType($query, $employmentType)
    {
        return $query->where('employment_type', $employmentType);
    }

    /**
     * Get the employee schedules for the employee.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(EmployeeSchedule::class);
    }

    /**
     * Get the active employee schedules for the employee.
     */
    public function activeSchedules(): HasMany
    {
        return $this->hasMany(EmployeeSchedule::class)->where('is_active', true);
    }

    /**
     * Get the schedule for a specific day of the week.
     */
    public function getScheduleForDay(int $dayOfWeek): ?EmployeeSchedule
    {
        return $this->activeSchedules()
            ->where('day_of_week', $dayOfWeek)
            ->first();
    }

    /**
     * Get today's schedule for the employee.
     */
    public function getTodaySchedule(): ?EmployeeSchedule
    {
        return $this->getScheduleForDay(now()->dayOfWeekIso);
    }

    /**
     * Check if the employee has a schedule for a specific day.
     */
    public function hasScheduleForDay(int $dayOfWeek): bool
    {
        return $this->activeSchedules()
            ->where('day_of_week', $dayOfWeek)
            ->exists();
    }
}
