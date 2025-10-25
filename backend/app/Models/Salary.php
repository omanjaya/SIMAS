<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'base_salary',
        'salary_type',
        'hourly_rate',
        'monthly_hours',
        'overtime_rate',
        'bonuses',
        'deductions',
        'allowances',
        'tax_components',
        'is_active',
        'effective_from',
        'effective_to',
        'pay_grade',
        'notes',
        'updated_by',
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'monthly_hours' => 'integer',
        'overtime_rate' => 'decimal:2',
        'bonuses' => 'decimal:2',
        'deductions' => 'decimal:2',
        'allowances' => 'array',
        'tax_components' => 'array',
        'is_active' => 'boolean',
        'effective_from' => 'date',
        'effective_to' => 'date',
    ];

    /**
     * Get the employee for this salary.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who updated this salary record.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope to get active salaries.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get salaries by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('salary_type', $type);
    }

    /**
     * Scope to get salaries effective on a specific date.
     */
    public function scopeEffectiveOn($query, $date)
    {
        return $query->where('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            });
    }

    /**
     * Check if salary is currently effective.
     */
    public function isCurrentlyEffective(): bool
    {
        $today = now()->toDateString();
        $isActive = $this->is_active;
        $isFromEffective = $this->effective_from <= $today;
        $isToEffective = ! $this->effective_to || $this->effective_to >= $today;

        return $isActive && $isFromEffective && $isToEffective;
    }

    /**
     * Get the total compensation including bonuses.
     */
    public function getTotalCompensationAttribute(): float
    {
        return (float) $this->base_salary + (float) $this->bonuses - (float) $this->deductions;
    }

    /**
     * Hook for future analytics cache invalidation.
     */
    protected static function booted(): void
    {
        // TODO: invalidate analytics caches when salary records change.
    }
}
