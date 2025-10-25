<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BiometricImport extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'user_id',
        'total_records',
        'successful_records',
        'failed_records',
        'summary',
        'errors',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'summary' => 'array',
        'errors' => 'array',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
