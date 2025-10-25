<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;

class SettingFactory extends Factory
{
    protected $model = Setting::class;

    public function definition(): array
    {
        return [
            'key' => $this->faker->word,
            'value' => $this->faker->word,
            'type' => $this->faker->randomElement(['string', 'integer', 'boolean', 'json']),
            'category' => $this->faker->word,
            'description' => $this->faker->sentence,
            'is_public' => $this->faker->boolean,
        ];
    }
}
