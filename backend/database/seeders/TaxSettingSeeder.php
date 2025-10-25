<?php

namespace Database\Seeders;

use App\Models\TaxSetting;
use Illuminate\Database\Seeder;

class TaxSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seed Indonesian PPh 21 tax brackets based on 2024 regulations
     */
    public function run(): void
    {
        $taxBrackets = [
            [
                'bracket_name' => 'Bracket 1 (0 - 60 Juta)',
                'min_income' => 0,
                'max_income' => 60_000_000,
                'tax_rate' => 0.05, // 5%
                'is_active' => true,
                'description' => 'Penghasilan kena pajak sampai dengan Rp 60.000.000 per tahun',
            ],
            [
                'bracket_name' => 'Bracket 2 (60 Juta - 250 Juta)',
                'min_income' => 60_000_000,
                'max_income' => 250_000_000,
                'tax_rate' => 0.15, // 15%
                'is_active' => true,
                'description' => 'Penghasilan kena pajak di atas Rp 60.000.000 sampai dengan Rp 250.000.000 per tahun',
            ],
            [
                'bracket_name' => 'Bracket 3 (250 Juta - 500 Juta)',
                'min_income' => 250_000_000,
                'max_income' => 500_000_000,
                'tax_rate' => 0.25, // 25%
                'is_active' => true,
                'description' => 'Penghasilan kena pajak di atas Rp 250.000.000 sampai dengan Rp 500.000.000 per tahun',
            ],
            [
                'bracket_name' => 'Bracket 4 (500 Juta - 5 Milyar)',
                'min_income' => 500_000_000,
                'max_income' => 5_000_000_000,
                'tax_rate' => 0.30, // 30%
                'is_active' => true,
                'description' => 'Penghasilan kena pajak di atas Rp 500.000.000 sampai dengan Rp 5.000.000.000 per tahun',
            ],
            [
                'bracket_name' => 'Bracket 5 (> 5 Milyar)',
                'min_income' => 5_000_000_000,
                'max_income' => null, // Unlimited
                'tax_rate' => 0.35, // 35%
                'is_active' => true,
                'description' => 'Penghasilan kena pajak di atas Rp 5.000.000.000 per tahun',
            ],
        ];

        foreach ($taxBrackets as $bracket) {
            TaxSetting::updateOrCreate(
                [
                    'bracket_name' => $bracket['bracket_name'],
                ],
                $bracket
            );
        }

        $this->command->info('Indonesian PPh 21 tax brackets seeded successfully!');
    }
}
