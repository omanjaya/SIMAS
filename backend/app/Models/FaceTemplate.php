<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FaceTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'face_data',
        'face_encoding_method',
        'face_features',
        'image_path',
        'confidence_threshold',
        'is_active',
        'enrolled_at',
        'enrolled_by',
        'last_verified_at',
        'verification_count',
        'notes',
    ];

    protected $casts = [
        'face_features' => 'array',
        'confidence_threshold' => 'integer',
        'is_active' => 'boolean',
        'enrolled_at' => 'datetime',
        'last_verified_at' => 'datetime',
        'verification_count' => 'integer',
    ];

    /**
     * Get the employee for this face template.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who enrolled this face template.
     */
    public function enrolledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enrolled_by');
    }

    /**
     * Scope to get active face templates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get face templates by employee.
     */
    public function scopeByEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Check if the face template is valid for recognition.
     */
    public function isValidForRecognition(): bool
    {
        return $this->is_active && ! empty($this->face_data);
    }
}
