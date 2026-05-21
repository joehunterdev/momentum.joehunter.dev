<?php

namespace App\Models;

use App\Enums\Frequency;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Moment extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'color',
        'icon',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
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
            Frequency::Daily => true,
            Frequency::Recurring => in_array($date->dayOfWeekIso, $schedule->days_of_week ?? [], strict: true),
            Frequency::Once => $schedule->scheduled_date !== null && $date->toDateString() === $schedule->scheduled_date,
        };
    }
}
