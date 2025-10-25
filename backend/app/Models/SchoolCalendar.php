<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolCalendar extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'event_type',
        'color',
        'is_recurring',
        'recurring_pattern',
        'recurring_interval',
        'metadata',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_recurring' => 'boolean',
        'recurring_interval' => 'integer',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Scope to get active events.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get events for a certain date range.
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
                ->orWhereBetween('end_date', [$startDate, $endDate])
                ->orWhere(function ($subQuery) use ($startDate, $endDate) {
                    $subQuery->where('start_date', '<=', $startDate)
                        ->where('end_date', '>=', $endDate);
                });
        });
    }

    /**
     * Scope to get events by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('event_type', $type);
    }

    /**
     * Check if the event is happening on a specific date.
     */
    public function isHappeningOn($date): bool
    {
        $date = is_string($date) ? \Carbon\Carbon::parse($date) : $date;
        $startDate = is_string($this->start_date) ? \Carbon\Carbon::parse($this->start_date) : $this->start_date;
        $endDate = is_string($this->end_date) ? \Carbon\Carbon::parse($this->end_date) : $this->end_date;

        return $date->between($startDate, $endDate);
    }
}
