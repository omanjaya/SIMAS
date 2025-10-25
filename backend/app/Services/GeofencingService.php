<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Location;

class GeofencingService
{
    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // meters

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(
            pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)
        ));

        return $angle * $earthRadius;
    }

    public function isWithinRadius(Location $location, float $latitude, float $longitude): array
    {
        $distance = $this->calculateDistance(
            (float) $location->latitude,
            (float) $location->longitude,
            $latitude,
            $longitude
        );

        return [
            'is_within_radius' => $distance <= $location->radius_meters,
            'distance' => $distance,
            'radius' => $location->radius_meters,
        ];
    }

    public function validateEmployeeLocation(Employee $employee, float $lat, float $lon, int $dayOfWeek): array
    {
        $schedule = $employee->getScheduleForDay($dayOfWeek);

        if (! $schedule) {
            return [
                'valid' => false,
                'reason' => 'No schedule found for this day',
                'distance' => null,
                'is_within_radius' => false,
                'location' => null,
            ];
        }

        $location = $schedule->location;
        $validation = $this->isWithinRadius($location, $lat, $lon);

        return [
            'valid' => $validation['is_within_radius'],
            'reason' => $validation['is_within_radius'] ? 'Within location radius' : 'Outside location radius',
            'distance' => $validation['distance'],
            'is_within_radius' => $validation['is_within_radius'],
            'location' => $location,
            'schedule' => $schedule,
        ];
    }

    public function findNearestLocations(float $latitude, float $longitude, int $limit = 5): array
    {
        $locations = Location::where('is_active', true)->get();

        $distances = [];
        foreach ($locations as $location) {
            $distance = $this->calculateDistance(
                (float) $location->latitude,
                (float) $location->longitude,
                $latitude,
                $longitude
            );
            $distances[] = [
                'location' => $location,
                'distance' => $distance,
            ];
        }

        usort($distances, function ($a, $b) {
            return $a['distance'] <=> $b['distance'];
        });

        return array_slice($distances, 0, $limit);
    }

    public function validateGpsCoordinates(float $latitude, float $longitude): array
    {
        $isValid = true;
        $errors = [];

        if ($latitude < -90 || $latitude > 90) {
            $isValid = false;
            $errors[] = 'Latitude must be between -90 and 90';
        }

        if ($longitude < -180 || $longitude > 180) {
            $isValid = false;
            $errors[] = 'Longitude must be between -180 and 180';
        }

        return [
            'valid' => $isValid,
            'errors' => $errors,
        ];
    }
}
