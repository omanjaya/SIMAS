<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceCorrection extends Model
{
    use HasFactory;

    protected $fillable = [
        'attendance_id',
        'employee_id',
        'requested_by',
        'reviewed_by',
        'correction_type',
        'original_clock_in_time',
        'original_clock_out_time',
        'new_clock_in_time',
        'new_clock_out_time',
        'reason',
        'status',
        'admin_notes',
        'requested_at',
        'reviewed_at',
    ];

    protected $casts = [
        'original_clock_in_time' => 'datetime',
        'original_clock_out_time' => 'datetime',
        'new_clock_in_time' => 'datetime',
        'new_clock_out_time' => 'datetime',
        'requested_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    // Relationships
    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}