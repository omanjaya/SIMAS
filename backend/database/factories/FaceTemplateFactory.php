<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FaceTemplate>
 */
class FaceTemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'face_data' => json_encode([
                'encoding' => base64_encode(random_bytes(128)), // Simulate encoded face data
                'landmarks' => [
                    'left_eye' => [fake()->randomFloat(2, 0, 1), fake()->randomFloat(2, 0, 1)],
                    'right_eye' => [fake()->randomFloat(2, 0, 1), fake()->randomFloat(2, 0, 1)],
                    'nose' => [fake()->randomFloat(2, 0, 1), fake()->randomFloat(2, 0, 1)],
                    'mouth' => [fake()->randomFloat(2, 0, 1), fake()->randomFloat(2, 0, 1)],
                ],
            ]),
            'face_encoding_method' => fake()->randomElement(['dlib', 'openface', 'facenet', 'deepface']),
            'face_features' => [
                'confidence' => fake()->randomFloat(2, 0.7, 1.0),
                'quality' => fake()->randomElement(['high', 'medium', 'low']),
                'lighting' => fake()->randomElement(['good', 'average', 'poor']),
                'angle' => fake()->randomFloat(2, -30, 30),
            ],
            'image_path' => 'storage/face_images/'.fake()->uuid().'.jpg',
            'confidence_threshold' => fake()->numberBetween(70, 95),
            'is_active' => fake()->boolean(95), // 95% chance of being active
            'enrolled_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'enrolled_by' => null,
            'last_verified_at' => fake()->optional(0.7)->dateTime(), // 70% chance of being null
            'verification_count' => fake()->numberBetween(0, 100),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Set the face template as active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Set the face template as inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Set a high confidence threshold.
     */
    public function highConfidence(): static
    {
        return $this->state(fn (array $attributes) => [
            'confidence_threshold' => fake()->numberBetween(85, 95),
        ]);
    }
}
