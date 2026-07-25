<?php

namespace App\Services;

use App\Enums\Frequency;
use App\Models\Moment;
use Carbon\Carbon;

class MomentProgressService
{
    /**
     * Build a type-aware progress bar payload for a moment over a period.
     *
     * Returns:
     * - Fixed: { kind: 'fixed', completed: int, scheduled_total: int, days_remaining: int, end_date: string }
     * - Ongoing: { kind: 'ongoing', value: ?int (0-100), completed: int, resolved: int }
     * - Once: { kind: 'once' }
     */
    public function momentBar(
        Moment $moment,
        Carbon $periodStart,
        Carbon $periodEnd,
        Carbon $today,
    ): array {
        $schedule = $moment->schedule;
        $isFixed = $schedule?->end_date !== null;

        if ($schedule?->frequency === Frequency::Once) {
            return ['kind' => 'once'];
        }

        // Determine the moment's start floor (start_date or created_at)
        $momentStart = $schedule?->start_date
            ? Carbon::parse($schedule->start_date)->startOfDay()
            : $moment->created_at?->copy()->startOfDay();

        // For Fixed habits, count the whole commitment (start → end)
        if ($isFixed) {
            $commitmentStart = $momentStart ?? $today->copy()->startOfDay();
            $commitmentEnd = Carbon::parse($schedule->end_date)->startOfDay();

            $scheduledTotal = $this->countScheduledDays(
                $moment,
                $commitmentStart,
                $commitmentEnd,
                $schedule,
            );

            $completed = $moment->instances->filter(
                fn ($i) => $i->date->toDateString() >= $commitmentStart->toDateString()
                    && $i->date->toDateString() <= $commitmentEnd->toDateString(),
            )->count();

            $daysRemaining = max(0, (int) $today->diffInDays($commitmentEnd) + 1);

            return [
                'kind' => 'fixed',
                'completed' => $completed,
                'scheduled_total' => $scheduledTotal,
                'days_remaining' => $daysRemaining,
                'end_date' => $schedule->end_date,
            ];
        }

        // For Ongoing habits, compute exponential-smoothing strength (forgiving, frequency-aware)
        $strength = $this->habitStrength($moment, $today);

        // Also compute rate-so-far for context (but not shown on bar anymore)
        $resolved = $this->countResolvedDueDays(
            $moment,
            $periodStart,
            $periodEnd,
            $today,
            $schedule,
        );

        $completed = $moment->instances->filter(
            fn ($i) => $i->date->toDateString() >= $periodStart->toDateString()
                && $i->date->toDateString() <= $periodEnd->toDateString(),
        )->count();

        return [
            'kind' => 'ongoing',
            'value' => $strength,
            'completed' => $completed,
            'resolved' => $resolved,
        ];
    }

    /**
     * Count scheduled due-days over a period (for Fixed habit tallies).
     */
    private function countScheduledDays(
        Moment $moment,
        Carbon $start,
        Carbon $end,
        $schedule,
    ): int {
        $count = 0;
        $cursor = $start->copy();

        while ($cursor->lte($end)) {
            if ($moment->isScheduledFor($cursor)) {
                $count++;
            }
            $cursor->addDay();
        }

        return $count;
    }

    /**
     * Count resolved due-days (past + today-if-completed) over a period (for Ongoing rate-so-far).
     * A day counts when it's in the past, or it's today and already completed, or it's today
     * and the moment is due. Future pending days are excluded.
     */
    private function countResolvedDueDays(
        Moment $moment,
        Carbon $start,
        Carbon $end,
        Carbon $today,
        $schedule,
    ): int {
        $count = 0;
        $cursor = $start->copy();

        while ($cursor->lte($end)) {
            if (! $moment->isScheduledFor($cursor)) {
                $cursor->addDay();

                continue; // Not due; skip
            }

            // Past day: counts as resolved
            if ($cursor->lt($today)) {
                $count++;
            }
            // Today: counts as resolved (whether completed or not)
            elseif ($cursor->equalTo($today)) {
                $count++;
            }
            // Future: not resolved; skip

            $cursor->addDay();
        }

        return $count;
    }

    /**
     * Compute habit strength using exponential smoothing (Loop Habit Tracker algorithm).
     *
     * Strength is frequency-aware, forgiving (misses dent but don't reset), and recency-weighted.
     * Formula: S_n = S_{n-1} * m + value * (1 - m)
     * where m = 0.5^(√frequency / 13), so daily habits have α ≈ 0.052.
     *
     * Returns: 0–100 (or null if no history).
     */
    public function habitStrength(Moment $moment, Carbon $today): ?int
    {
        $schedule = $moment->schedule;
        if (! $schedule) {
            return null; // No schedule = can't compute strength
        }

        // Determine start date (start_date or created_at)
        $startDate = $schedule->start_date
            ? Carbon::parse($schedule->start_date)->startOfDay()
            : $moment->created_at?->copy()->startOfDay();

        if (! $startDate || $startDate->isAfter($today)) {
            return null; // No history yet
        }

        // Build a completed-set for fast lookup
        $completedSet = [];
        foreach ($moment->instances as $inst) {
            $completedSet[$inst->date->toDateString()] = true;
        }

        // Compute frequency-dependent decay constants.
        // Frequency is reps/week. Daily = 7/week, 3x/week = 3/week, etc.
        $frequencyPerWeek = match ($schedule->frequency) {
            Frequency::Daily => 7,
            Frequency::Recurring => count($schedule->days_of_week ?? []),
            default => 1,
        };

        // m = 0.5^(√frequency / 13)
        // For daily: √7/13 ≈ 0.205 → m ≈ 0.866 → α ≈ 0.134 (per day)
        // Rescale to per-week for more intuitive decay: α_day = 1 - (1 - α_week)^(1/7)
        $sqrtFrequency = sqrt($frequencyPerWeek);
        $m = pow(0.5, $sqrtFrequency / 13);

        // Compute strength from start to today
        $strength = 0.0;
        $cursor = $startDate->copy();

        while ($cursor->lte($today)) {
            if (! $moment->isScheduledFor($cursor)) {
                $cursor->addDay();
                continue; // Not due; skip
            }

            // This day is due. Check if completed.
            $isCompleted = isset($completedSet[$cursor->toDateString()]);

            if ($isCompleted) {
                // Hit: S_n = (1-α)*S_{n-1} + α = S_{n-1} + α*(1 - S_{n-1})
                $strength = $strength * $m + (1 - $m);
            } else {
                // Miss: S_n = (1-β)*S_{n-1} (decay without recovery)
                // β = α (same weight) so misses and hits have symmetric impact
                $strength = $strength * $m;
            }

            $cursor->addDay();
        }

        return (int) round($strength * 100);
    }
}
