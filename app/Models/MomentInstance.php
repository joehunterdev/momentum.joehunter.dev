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
        'notes',
    ];

    protected $casts = [
        'date'         => 'date',
        'completed_at' => 'datetime',
    ];

    // ─── Relationships ───────────────────────────────────────────────────────

    public function moment(): BelongsTo
    {
        return $this->belongsTo(Moment::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function isCompleted(): bool
    {
        return $this->completed_at !== null;
    }

    public function toggle(): void
    {
        $this->completed_at = $this->isCompleted() ? null : now();
        $this->save();
    }
}
