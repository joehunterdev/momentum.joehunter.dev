<?php

namespace App\Models;

use App\Enums\Frequency;
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
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'frequency' => Frequency::class,
        'days_of_week' => 'array',
        'preferred_time' => 'string',
        'scheduled_date' => 'string',
        'start_date' => 'string',
        'end_date' => 'string',
    ];

    public function moment(): BelongsTo
    {
        return $this->belongsTo(Moment::class);
    }
}
