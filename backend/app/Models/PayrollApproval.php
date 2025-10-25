<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'period_year',
        'period_month',
        'payroll_data',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'notes',
    ];

    protected $casts = [
        'payroll_data' => 'array',
        'period_year' => 'integer',
        'period_month' => 'integer',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the employee that owns the payroll approval
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who approved the payroll
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope to get pending approvals
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get approved approvals
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope to get rejected approvals
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope to filter by period
     */
    public function scopeForPeriod($query, int $year, int $month)
    {
        return $query->where('period_year', $year)
            ->where('period_month', $month);
    }

    /**
     * Check if payroll is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payroll is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if payroll is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Approve the payroll
     */
    public function approve(int $userId, ?string $notes = null): bool
    {
        $this->status = 'approved';
        $this->approved_by = $userId;
        $this->approved_at = now();
        $this->notes = $notes;

        return $this->save();
    }

    /**
     * Reject the payroll
     */
    public function reject(int $userId, string $reason, ?string $notes = null): bool
    {
        $this->status = 'rejected';
        $this->approved_by = $userId;
        $this->approved_at = now();
        $this->rejection_reason = $reason;
        $this->notes = $notes;

        return $this->save();
    }

    /**
     * Get formatted period
     */
    public function getFormattedPeriodAttribute(): string
    {
        $monthName = date('F', mktime(0, 0, 0, $this->period_month, 1));

        return "{$monthName} {$this->period_year}";
    }
}
