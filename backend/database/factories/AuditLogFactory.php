<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'action' => $this->faker->word,
            'model' => $this->faker->word,
            'payload' => [
                'request' => [
                    'method' => $this->faker->randomElement(['GET', 'POST', 'PUT', 'DELETE']),
                    'uri' => $this->faker->url,
                    'input' => [],
                ],
                'response' => [
                    'status' => 200,
                ],
            ],
            'ip_address' => $this->faker->ipv4,
            'user_agent' => $this->faker->userAgent,
        ];
    }
}
