<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MomentSchedule extends Model
{
    protected $fillable = [
        'moment_id',
        'frequency',
        'days_of_week',
        'preferred_time',
        'scheduled_date',
    ];

    protected $casts = [
        'days_of_week' => 'array',
        'preferred_time' => 'string',
        'scheduled_date' => 'string',
    ];

    public function moment(): BelongsTo
    {
        return $this->belongsTo(Moment::class);
    }
}
