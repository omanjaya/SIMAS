<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'address',
        'latitude',
        'longitude',
        'radius_meters',
        'description',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'radius_meters' => 'integer',
        'is_active' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(LocationAuditLog::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function employeeSchedules(): HasMany
    {
        return $this->hasMany(EmployeeSchedule::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getCoordinatesAttribute(): array
    {
        return [
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
        ];
    }

    public function isWithinRadius(float $latitude, float $longitude): bool
    {
        $distance = $this->calculateDistance($latitude, $longitude);

        return $distance <= $this->radius_meters;
    }

    public function calculateDistance(float $latitude, float $longitude): float
    {
        $earthRadius = 6371000; // meters

        $latFrom = deg2rad((float) $this->latitude);
        $lonFrom = deg2rad((float) $this->longitude);
        $latTo = deg2rad($latitude);
        $lonTo = deg2rad($longitude);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(
            pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)
        ));

        return $angle * $earthRadius;
    }
}
