<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reward extends Model
{
    protected $table = 'moment_rewards';

    protected $fillable = [
        'moment_id',
        'description',
        'temptation_bundle',
    ];

    public function moment(): BelongsTo
    {
        return $this->belongsTo(Moment::class);
    }
}
