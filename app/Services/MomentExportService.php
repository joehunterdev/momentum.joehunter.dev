<?php

namespace App\Services;

use App\Models\Moment;
use App\Models\MomentInstance;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

/**
 * Exports a user's moments to the same JSON shape consumed by
 * MomentImportService, so the output can be checked in and re-seeded.
 */
class MomentExportService
{
    /**
     * Build the export array for the given user's moments.
     *
     * @return array<int, array<string, mixed>>
     */
    public function export(User $user): array
    {
        $moments = Moment::where('user_id', $user->id)
            ->with(['schedule', 'cue', 'reward'])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $today = Carbon::today();
        $periodStart = $today->copy()->subMonths(6)->startOfDay();
        $yesterday = $today->copy()->subDay();
        $midpoint = $periodStart->copy()->addDays((int) ($periodStart->diffInDays($yesterday) / 2));

        return $moments->map(function (Moment $moment) use ($periodStart, $midpoint, $yesterday) {
            $schedule = $moment->schedule;
            $cue = $moment->cue;
            $reward = $moment->reward;

            [$rateStart, $rateEnd] = $this->completionRates(
                moment: $moment,
                frequency: $schedule?->frequency ?? 'daily',
                daysOfWeek: $schedule?->days_of_week,
                periodStart: $periodStart,
                midpoint: $midpoint,
                periodEnd: $yesterday,
            );

            return [
                'name' => $moment->name,
                'description' => $moment->description,
                'icon' => $moment->icon,
                'color' => $moment->color,
                'frequency' => $schedule?->frequency ?? 'daily',
                'days_of_week' => $schedule?->days_of_week,
                'preferred_time' => $this->formatTime($schedule?->preferred_time),
                'implementation_intention' => $cue?->implementation_intention,
                'habit_stack_after' => $cue?->habit_stack_after,
                'environment_prompt' => $cue?->environment_prompt,
                'reward_description' => $reward?->description,
                'temptation_bundle' => $reward?->temptation_bundle,
                'completion_rate_start' => $rateStart,
                'completion_rate_end' => $rateEnd,
            ];
        })->all();
    }

    /**
     * Compute start/end completion rates by splitting the last 6 months
     * in half. Each rate is completed-scheduled-days / total-scheduled-days
     * within that half-window, rounded to 2 dp.
     *
     * @param  int[]|null  $daysOfWeek
     * @return array{0: float, 1: float}
     */
    private function completionRates(
        Moment $moment,
        string $frequency,
        ?array $daysOfWeek,
        Carbon $periodStart,
        Carbon $midpoint,
        Carbon $periodEnd,
    ): array {
        $completedDates = MomentInstance::where('moment_id', $moment->id)
            ->whereBetween('date', [$periodStart->toDateString(), $periodEnd->toDateString()])
            ->whereNotNull('completed_at')
            ->pluck('date')
            ->map(fn ($d) => $d instanceof Carbon ? $d->toDateString() : (string) $d)
            ->all();

        $completedSet = array_flip($completedDates);

        $firstHalf = $this->countWindow($periodStart, $midpoint, $frequency, $daysOfWeek, $completedSet);
        $secondHalf = $this->countWindow($midpoint->copy()->addDay(), $periodEnd, $frequency, $daysOfWeek, $completedSet);

        return [
            $this->rate($firstHalf['completed'], $firstHalf['scheduled']),
            $this->rate($secondHalf['completed'], $secondHalf['scheduled']),
        ];
    }

    /**
     * @param  int[]|null  $daysOfWeek
     * @param  array<string, int>  $completedSet  date-string => 0 lookup
     * @return array{scheduled: int, completed: int}
     */
    private function countWindow(
        Carbon $start,
        Carbon $end,
        string $frequency,
        ?array $daysOfWeek,
        array $completedSet,
    ): array {
        $scheduled = 0;
        $completed = 0;

        if ($start->greaterThan($end)) {
            return ['scheduled' => 0, 'completed' => 0];
        }

        /** @var CarbonPeriod $period */
        $period = CarbonPeriod::create($start, '1 day', $end);

        foreach ($period as $date) {
            if (! $this->isScheduledOn($date, $frequency, $daysOfWeek)) {
                continue;
            }

            $scheduled++;

            if (isset($completedSet[$date->toDateString()])) {
                $completed++;
            }
        }

        return ['scheduled' => $scheduled, 'completed' => $completed];
    }

    /** @param  int[]|null  $daysOfWeek */
    private function isScheduledOn(Carbon $date, string $frequency, ?array $daysOfWeek): bool
    {
        return match ($frequency) {
            'daily' => true,
            'weekly', 'custom' => $daysOfWeek !== null && in_array($date->dayOfWeek, $daysOfWeek, strict: true),
            default => false,
        };
    }

    private function rate(int $completed, int $scheduled): float
    {
        if ($scheduled === 0) {
            return 0.0;
        }

        return round($completed / $scheduled, 2);
    }

    private function formatTime(?string $time): ?string
    {
        if ($time === null || $time === '') {
            return null;
        }

        return substr($time, 0, 5);
    }
}