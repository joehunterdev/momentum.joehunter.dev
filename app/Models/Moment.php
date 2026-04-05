<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Moment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'color',
        'icon',
        'identity_statement',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    // ─── Relationships ───────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schedule(): HasOne
    {
        return $this->hasOne(MomentSchedule::class);
    }

    public function cue(): HasOne
    {
        return $this->hasOne(Cue::class);
    }

    public function reward(): HasOne
    {
        return $this->hasOne(Reward::class);
    }

    public function instances(): HasMany
    {
        return $this->hasMany(MomentInstance::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Whether this moment is scheduled for the given date.
     */
    public function isScheduledFor(Carbon $date): bool
    {
        $schedule = $this->schedule;

        if (! $schedule) {
            return true; // no schedule = daily by default
        }

        return match ($schedule->frequency) {
            'daily'  => true,
            'weekly',
            'custom' => in_array($date->dayOfWeekIso, $schedule->days_of_week ?? [], strict: true),
            default  => false,
        };
    }
}
