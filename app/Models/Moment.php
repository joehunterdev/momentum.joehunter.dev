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

        // No backdating before start_date (or created_at if no start_date).
        // One-off moments are exempt (they may target any explicit scheduled_date).
        if ($schedule->frequency !== Frequency::Once) {
            $startDate = $schedule->start_date
                ? Carbon::parse($schedule->start_date)->startOfDay()
                : $this->created_at?->copy()->startOfDay();
            if ($startDate !== null && $date->copy()->startOfDay()->lt($startDate)) {
                return false;
            }
        }

        // Respect end_date: daily and recurring moments stop after this date.
        if ($schedule->end_date !== null && $schedule->frequency !== Frequency::Once) {
            if ($date->copy()->startOfDay()->gt(Carbon::parse($schedule->end_date)->startOfDay())) {
                return false;
            }
        }

        return match ($schedule->frequency) {
            Frequency::Daily => true,
            Frequency::Recurring => in_array($date->dayOfWeekIso, $schedule->days_of_week ?? [], strict: true),
            Frequency::Once => $schedule->scheduled_date !== null && $date->toDateString() === $schedule->scheduled_date,
        };
    }
}
