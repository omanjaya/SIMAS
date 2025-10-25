<?php

namespace Database\Factories;

use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class LocationFactory extends Factory
{
    protected $model = Location::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company().' Office',
            'code' => 'LOC-'.strtoupper($this->faker->unique()->bothify('???##')),
            'address' => $this->faker->address(),
            'latitude' => $this->faker->latitude(-6.5, -6.0),
            'longitude' => $this->faker->longitude(106.5, 107.0),
            'radius_meters' => $this->faker->randomElement([50, 100, 150, 200, 250]),
            'description' => $this->faker->optional()->sentence(),
            'is_active' => $this->faker->boolean(90),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
