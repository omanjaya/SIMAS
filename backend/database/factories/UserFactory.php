<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => fake()->randomElement(['admin', 'teacher', 'employee']),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'last_login_at' => fake()->optional()->dateTimeBetween('-1 year', 'now'),
            'status' => fake()->randomElement(['active', 'inactive', 'suspended']),
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Set the role of the user.
     */
    public function role(string $role): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => $role,
        ]);
    }

    /**
     * Set the user as an admin.
     */
    public function admin(): static
    {
        return $this->role('admin');
    }

    /**
     * Set the user as a teacher.
     */
    public function teacher(): static
    {
        return $this->role('teacher');
    }

    /**
     * Set the user as an employee.
     */
    public function employee(): static
    {
        return $this->role('employee');
    }
}
