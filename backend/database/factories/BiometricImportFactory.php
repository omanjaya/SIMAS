<?php

namespace Database\Factories;

use App\Models\BiometricImport;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BiometricImportFactory extends Factory
{
    protected $model = BiometricImport::class;

    public function definition(): array
    {
        return [
            'filename' => $this->faker->word.'.csv',
            'user_id' => User::factory(),
            'total_records' => $this->faker->numberBetween(1, 100),
            'successful_records' => $this->faker->numberBetween(0, 50),
            'failed_records' => $this->faker->numberBetween(0, 50),
            'summary' => [
                'total' => $this->faker->numberBetween(1, 100),
                'successful' => $this->faker->numberBetween(0, 50),
                'failed' => $this->faker->numberBetween(0, 50),
                'success_rate' => $this->faker->randomFloat(2, 0, 100),
            ],
            'errors' => [],
            'status' => $this->faker->randomElement(['pending', 'processing', 'completed', 'failed']),
            'completed_at' => $this->faker->optional()->dateTime(),
        ];
    }
}
