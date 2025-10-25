<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $locations = [
            [
                'name' => 'SMP Saraswati - Kantor Pusat',
                'code' => 'LOC-001',
                'address' => 'Jl. Pendidikan No. 123, Jakarta Selatan',
                'latitude' => -6.2293867,
                'longitude' => 106.8265753,
                'radius_meters' => 100,
                'description' => 'Kantor pusat SMP Saraswati',
                'is_active' => true,
                'created_by' => $admin?->id,
            ],
            [
                'name' => 'SMP Saraswati - Cabang Timur',
                'code' => 'LOC-002',
                'address' => 'Jl. Raya Timur No. 456, Jakarta Timur',
                'latitude' => -6.2615,
                'longitude' => 106.8940,
                'radius_meters' => 150,
                'description' => 'Cabang Jakarta Timur',
                'is_active' => true,
                'created_by' => $admin?->id,
            ],
            [
                'name' => 'SMP Saraswati - Cabang Barat',
                'code' => 'LOC-003',
                'address' => 'Jl. Perjuangan No. 789, Jakarta Barat',
                'latitude' => -6.1684,
                'longitude' => 106.7637,
                'radius_meters' => 200,
                'description' => 'Cabang Jakarta Barat',
                'is_active' => true,
                'created_by' => $admin?->id,
            ],
        ];

        foreach ($locations as $location) {
            Location::create($location);
        }

        Location::factory(7)->create([
            'created_by' => $admin?->id,
        ]);
    }
}
