<?php

namespace App\Services;

use App\Models\TaxSetting;

class TaxCalculationService
{
    /**
     * Calculate progressive tax based on annual income
     * Uses Indonesian PPh 21 progressive tax brackets
     *
     * @param  float  $annualIncome  Annual taxable income
     * @param  float  $ptkp  Penghasilan Tidak Kena Pajak (tax-free threshold)
     * @return array Tax calculation breakdown
     */
    public function calculateProgressiveTax(float $annualIncome, float $ptkp = 54000000): array
    {
        // Get PKP (Penghasilan Kena Pajak = Taxable Income after PTKP)
        $pkp = max(0, $annualIncome - $ptkp);

        // Get active tax brackets ordered by income
        $taxBrackets = TaxSetting::active()
            ->orderedByIncome()
            ->get();

        if ($taxBrackets->isEmpty()) {
            return [
                'annual_income' => $annualIncome,
                'ptkp' => $ptkp,
                'pkp' => $pkp,
                'tax_breakdown' => [],
                'total_tax' => 0,
                'effective_rate' => 0,
                'monthly_tax' => 0,
            ];
        }

        $totalTax = 0;
        $taxBreakdown = [];
        $remainingIncome = $pkp;

        foreach ($taxBrackets as $bracket) {
            if ($remainingIncome <= 0) {
                break;
            }

            // Calculate how much income falls into this bracket
            $bracketMin = $bracket->min_income;
            $bracketMax = $bracket->max_income ?? PHP_FLOAT_MAX;

            if ($remainingIncome + $bracketMin <= $bracketMin) {
                continue; // Income doesn't reach this bracket
            }

            // Taxable amount in this bracket
            $taxableInBracket = min(
                $remainingIncome,
                $bracketMax - $bracketMin
            );

            // Tax for this bracket
            $taxInBracket = $taxableInBracket * $bracket->tax_rate;

            $totalTax += $taxInBracket;

            $taxBreakdown[] = [
                'bracket_name' => $bracket->bracket_name,
                'bracket_range' => [
                    'min' => $bracketMin,
                    'max' => $bracketMax === PHP_FLOAT_MAX ? null : $bracketMax,
                ],
                'tax_rate' => $bracket->tax_rate * 100, // Convert to percentage
                'taxable_amount' => $taxableInBracket,
                'tax_amount' => $taxInBracket,
            ];

            $remainingIncome -= $taxableInBracket;
        }

        $effectiveRate = $pkp > 0 ? ($totalTax / $pkp) * 100 : 0;

        return [
            'annual_income' => $annualIncome,
            'ptkp' => $ptkp,
            'pkp' => $pkp,
            'tax_breakdown' => $taxBreakdown,
            'total_tax' => $totalTax,
            'effective_rate' => $effectiveRate, // as percentage
            'monthly_tax' => $totalTax / 12,
        ];
    }

    /**
     * Calculate monthly tax based on monthly gross salary
     *
     * @param  float  $monthlyGross  Monthly gross salary
     * @param  float  $ptkp  Annual tax-free threshold
     * @return array Tax calculation
     */
    public function calculateMonthlyTax(float $monthlyGross, float $ptkp = 54000000): array
    {
        $annualIncome = $monthlyGross * 12;
        $taxCalculation = $this->calculateProgressiveTax($annualIncome, $ptkp);

        return [
            'monthly_gross' => $monthlyGross,
            'monthly_tax' => $taxCalculation['monthly_tax'],
            'monthly_net' => $monthlyGross - $taxCalculation['monthly_tax'],
            'annual_calculation' => $taxCalculation,
        ];
    }

    /**
     * Calculate PTKP (Penghasilan Tidak Kena Pajak)
     * Based on marital status and dependents
     *
     * @param  string  $status  Marital status: 'TK', 'K', 'K/I'
     * @param  int  $dependents  Number of dependents (max 3)
     * @return float PTKP amount
     */
    public function calculatePTKP(string $status = 'TK', int $dependents = 0): float
    {
        // PTKP 2024 rates
        $basePTKP = [
            'TK' => 54000000,  // Tidak Kawin (Single)
            'K' => 58500000,   // Kawin (Married)
            'K/I' => 112500000, // Kawin, income combined (Married, combined income)
        ];

        $ptkp = $basePTKP[$status] ?? $basePTKP['TK'];

        // Add 4.5 million per dependent (max 3)
        $dependents = min($dependents, 3);
        $ptkp += $dependents * 4500000;

        return $ptkp;
    }

    /**
     * Calculate total tax including allowances and deductions
     *
     * @param  float  $baseSalary  Base salary
     * @param  array  $allowances  Allowances array
     * @param  array  $deductions  Deductions array (excluding tax)
     * @param  string  $maritalStatus  Marital status
     * @param  int  $dependents  Number of dependents
     * @return array Complete tax calculation
     */
    public function calculateTotalTax(
        float $baseSalary,
        array $allowances = [],
        array $deductions = [],
        string $maritalStatus = 'TK',
        int $dependents = 0
    ): array {
        // Calculate total monthly gross
        $totalAllowances = array_sum($allowances);
        $totalDeductions = array_sum($deductions);

        $monthlyGross = $baseSalary + $totalAllowances - $totalDeductions;

        // Calculate PTKP
        $ptkp = $this->calculatePTKP($maritalStatus, $dependents);

        // Calculate tax
        $taxResult = $this->calculateMonthlyTax($monthlyGross, $ptkp);

        return [
            'base_salary' => $baseSalary,
            'allowances' => $allowances,
            'total_allowances' => $totalAllowances,
            'deductions' => $deductions,
            'total_deductions' => $totalDeductions,
            'gross_salary' => $monthlyGross,
            'ptkp_status' => "{$maritalStatus}/{$dependents}",
            'ptkp_amount' => $ptkp,
            'tax_calculation' => $taxResult,
            'monthly_tax' => $taxResult['monthly_tax'],
            'net_salary' => $monthlyGross - $taxResult['monthly_tax'],
        ];
    }

    /**
     * Get summary of all active tax brackets
     */
    public function getTaxBracketsSummary(): array
    {
        $brackets = TaxSetting::active()
            ->orderedByIncome()
            ->get();

        return $brackets->map(function ($bracket) {
            return [
                'id' => $bracket->id,
                'bracket_name' => $bracket->bracket_name,
                'min_income' => $bracket->min_income,
                'max_income' => $bracket->max_income,
                'tax_rate' => $bracket->tax_rate * 100, // as percentage
                'description' => $bracket->description,
            ];
        })->toArray();
    }
}
