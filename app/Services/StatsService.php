<?php

namespace App\Services;

use App\Data\HabitStatData;
use App\Data\StatsPageData;
use App\Data\StatsSummaryData;
use App\Data\TrendPointData;
use App\Models\Moment;
use App\Models\User;
use Carbon\Carbon;

class StatsService
{
    public function __construct(private MomentProgressService $progress) {}

    /**
     * Aggregate completion stats for a user over a rolling window of N days.
     *
     * Ongoing habits: strength-based scoring + grid + streaks over the window.
     * Fixed habits: tally-based scoring scoped to the commitment (start → end).
     *
     * Everything is "due-aware": a habit only counts toward a day when its
     * schedule makes it due (see Moment::isScheduledFor). Cells are therefore
     * one of done / missed / notdue, and rates use completed ÷ scheduled.
     */
    public function build(User $user, int $rangeDays): StatsPageData
    {
        $today = Carbon::today();
        $windowStart = $today->copy()->subDays($rangeDays - 1);

        $moments = Moment::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->with([
                'schedule',
                'instances' => fn ($q) => $q->whereBetween('date', [
                    $windowStart->toDateString(),
                    $today->toDateString(),
                ]),
            ])
            ->orderBy('sort_order')
            ->get();

        // Ordered list of ISO date strings, oldest → newest, shared by the grid
        // columns and the trend x-axis.
        $days = [];
        for ($c = $windowStart->copy(); $c->lte($today); $c->addDay()) {
            $days[] = $c->toDateString();
        }

        // Per-day accumulators for the overall trend line.
        $dueByDay = array_fill_keys($days, 0);
        $doneByDay = array_fill_keys($days, 0);

        $habits = [];
        $sumScheduled = 0;
        $sumCompleted = 0;
        $maxLongest = 0;

        foreach ($moments as $moment) {
            $isFixed = $moment->schedule?->end_date !== null;

            if ($isFixed) {
                // Fixed habit: tally over the commitment (start → end)
                $barPayload = $this->progress->momentBar(
                    $moment,
                    Carbon::parse($moment->schedule->start_date ?? $moment->created_at)->startOfDay(),
                    Carbon::parse($moment->schedule->end_date),
                    $today,
                );

                $habits[] = new HabitStatData(
                    id: $moment->id,
                    name: $moment->name ?? 'Untitled',
                    icon: $moment->icon,
                    color: $moment->color,
                    habit_type: 'fixed',
                    completionRate: $barPayload['scheduled_total'] > 0
                        ? (int) round($barPayload['completed'] / $barPayload['scheduled_total'] * 100)
                        : null,
                    scheduled_total: $barPayload['scheduled_total'],
                    completed_total: $barPayload['completed'],
                    days_remaining: $barPayload['days_remaining'],
                    end_date: $barPayload['end_date'],
                );

                // Fixed habits don't contribute to trend (they're scoped to their own period)
                continue;
            }

            // Ongoing habit: strength-based scoring + grid + streaks over the window
            $doneSet = [];
            foreach ($moment->instances as $inst) {
                $doneSet[$inst->date->toDateString()] = true;
            }

            $cells = [];
            $scheduled = 0;
            $completed = 0;
            $longest = 0;
            $run = 0;

            foreach ($days as $dateStr) {
                if (! $moment->isScheduledFor(Carbon::parse($dateStr))) {
                    $cells[] = 'notdue';

                    continue;
                }

                $scheduled++;
                $dueByDay[$dateStr]++;

                if (isset($doneSet[$dateStr])) {
                    $completed++;
                    $doneByDay[$dateStr]++;
                    $cells[] = 'done';
                    $run++;
                    $longest = max($longest, $run);
                } else {
                    $cells[] = 'missed';
                    $run = 0;
                }
            }

            // Current streak
            $current = 0;
            for ($i = count($cells) - 1; $i >= 0; $i--) {
                if ($cells[$i] === 'notdue') {
                    continue;
                }
                if ($cells[$i] === 'done') {
                    $current++;
                } else {
                    break;
                }
            }

            // Compute habit strength (all-time exponential smoothing)
            $strength = $this->progress->habitStrength($moment, $today);

            $habits[] = new HabitStatData(
                id: $moment->id,
                name: $moment->name ?? 'Untitled',
                icon: $moment->icon,
                color: $moment->color,
                habit_type: 'ongoing',
                strength: $strength,
                currentStreak: $current,
                longestStreak: $longest,
                cells: $cells,
            );

            $sumScheduled += $scheduled;
            $sumCompleted += $completed;
            $maxLongest = max($maxLongest, $longest);
        }

        $trend = array_map(
            fn (string $dateStr) => new TrendPointData(
                date: $dateStr,
                rate: $dueByDay[$dateStr] > 0
                    ? (int) round($doneByDay[$dateStr] / $dueByDay[$dateStr] * 100)
                    : 0,
            ),
            $days,
        );

        $summary = new StatsSummaryData(
            completionRate: $sumScheduled > 0 ? (int) round($sumCompleted / $sumScheduled * 100) : 0,
            totalCompleted: $sumCompleted,
            longestStreak: $maxLongest,
            missedDays: max(0, $sumScheduled - $sumCompleted),
        );

        return new StatsPageData(
            rangeDays: $rangeDays,
            days: $days,
            summary: $summary,
            habits: $habits,
            trend: $trend,
        );
    }
}
