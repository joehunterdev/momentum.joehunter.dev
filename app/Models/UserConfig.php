<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserConfig extends Model
{
    protected $fillable = [
        'user_id',
        'wake_time',
        'sleep_time',
        'week_starts_on',
        'office_start',
        'office_end',
        'identity_statement',
        'friction_level',
    ];

    protected $casts = [
        'wake_time' => 'string',
        'sleep_time' => 'string',
        'week_starts_on' => 'integer',
        'office_start' => 'string',
        'office_end' => 'string',
        'identity_statement' => 'string',
        'friction_level' => 'string',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
