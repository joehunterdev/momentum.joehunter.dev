<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cue extends Model
{
    protected $fillable = [
        'moment_id',
        'implementation_intention',
        'habit_stack_after',
        'environment_prompt',
    ];

    public function moment(): BelongsTo
    {
        return $this->belongsTo(Moment::class);
    }
}
