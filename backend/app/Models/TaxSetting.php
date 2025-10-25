<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'bracket_name',
        'min_income',
        'max_income',
        'tax_rate',
        'is_active',
        'description',
    ];

    protected $casts = [
        'min_income' => 'decimal:2',
        'max_income' => 'decimal:2',
        'tax_rate' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    /**
     * Scope to get only active tax settings
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by income bracket ascending
     */
    public function scopeOrderedByIncome($query)
    {
        return $query->orderBy('min_income', 'asc');
    }

    /**
     * Check if income falls within this bracket
     */
    public function appliesToIncome(float $income): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $meetsMin = $income >= $this->min_income;
        $meetsMax = $this->max_income === null || $income <= $this->max_income;

        return $meetsMin && $meetsMax;
    }

    /**
     * Calculate tax for given income using this bracket
     */
    public function calculateTax(float $income): float
    {
        if (! $this->appliesToIncome($income)) {
            return 0;
        }

        // Calculate taxable amount in this bracket
        $taxableAmount = $income - $this->min_income;

        // If there's a max, limit taxable amount to bracket range
        if ($this->max_income !== null) {
            $bracketRange = $this->max_income - $this->min_income;
            $taxableAmount = min($taxableAmount, $bracketRange);
        }

        return $taxableAmount * $this->tax_rate;
    }
}
