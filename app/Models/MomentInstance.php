<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MomentInstance extends Model
{
    protected $fillable = [
        'moment_id',
        'date',
        'completed_at',
    ];

    protected $casts = [
        'date'         => 'date',
        'completed_at' => 'datetime',
    ];

    public function moment(): BelongsTo
    {
        return $this->belongsTo(Moment::class);
    }
}
