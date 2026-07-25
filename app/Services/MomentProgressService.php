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

        // For Ongoing habits, rate-so-far over the period (resolved due-days only)
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

        $value = $resolved > 0 ? (int) round(($completed / $resolved) * 100) : null;

        return [
            'kind' => 'ongoing',
            'value' => $value,
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
}
