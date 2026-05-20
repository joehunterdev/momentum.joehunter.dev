<?php

namespace App\Services;

use App\Data\MonthlyDayData;
use App\Data\MonthlyMomentData;
use App\Data\SlotMomentData;
use App\Data\TimeSlotData;
use App\Data\WeekDayData;
use App\Enums\Frequency;
use App\Models\Moment;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CalendarService
{
    /**
     * Build an array of 'H:i' strings from wake to sleep in $intervalMinutes increments.
     *
     * @return string[]
     */
    public function buildTimeSlots(string $wakeTime, string $sleepTime, int $intervalMinutes = 30): array
    {
        $slots = [];

        $current = Carbon::createFromTimeString($wakeTime);
        $remainder = $current->minute % $intervalMinutes;
        $current->minute($remainder === 0 ? $current->minute : $current->minute - $remainder)->second(0);

        $end = Carbon::createFromTimeString($sleepTime);
        $endRemainder = $end->minute % $intervalMinutes;
        if ($end->second > 0 || $endRemainder !== 0) {
            $end->minute($end->minute - $endRemainder + $intervalMinutes);
            if ($end->minute >= 60) {
                $end->addHour()->minute($end->minute - 60);
            }
            $end->second(0);
        }

        while ($current->lte($end)) {
            $slots[] = $current->format('H:i');
            $current->addMinutes($intervalMinutes);
        }

        return $slots;
    }

    /**
     * Snap a time string (HH:mm or HH:mm:ss) to the nearest $intervalMinutes slot boundary.
     */
    public function snapToSlot(string $time, int $intervalMinutes = 30): string
    {
        $carbon = Carbon::createFromTimeString($time);
        $half = (int) ($intervalMinutes / 2);
        $remainder = $carbon->minute % $intervalMinutes;

        if ($remainder < $half) {
            $snapped = $carbon->copy()->minute($carbon->minute - $remainder)->second(0);
        } else {
            $next = $carbon->minute - $remainder + $intervalMinutes;
            if ($next >= 60) {
                $snapped = $carbon->copy()->addHour()->minute(0)->second(0);
            } else {
                $snapped = $carbon->copy()->minute($next)->second(0);
            }
        }

        return $snapped->format('H:i');
    }

    /**
     * Calculate the consistency percentage (0–100) for a moment over a 28-day window.
     */
    public function calculateConsistency(Moment $moment, Carbon $windowStart, Carbon $today): ?int
    {
        $schedule = $moment->schedule;
        $scheduled = 0;
        $cursor = $windowStart->copy();
        // TODO: Daily Weekly Custom both front and back should just have their own types
        while ($cursor->lte($today)) {
            $due = match ($schedule?->frequency) {
                'daily' => true,
                'weekly', 'custom' => $schedule->days_of_week !== null
                    && in_array($cursor->dayOfWeek, $schedule->days_of_week, strict: true),
                default => false,
            };

            if ($due) {
                $scheduled++;
            }

            $cursor->addDay();
        }

        if ($scheduled === 0) {
            return null;
        }

        $completed = $moment->instances->filter(
            fn($i) => $i->date->toDateString() >= $windowStart->toDateString()
                && $i->date->toDateString() <= $today->toDateString()
                && $i->completed_at !== null
        )->count();

        return (int) round(($completed / $scheduled) * 100);
    }

    /**
     * Build a SlotMomentData for a matched moment in a given slot.
     */
    public function buildSlotMoment(
        Moment $match,
        string $dateStr,
        bool $isPast,
        bool $isToday,
        Carbon $consistencyWindow,
        Carbon $today,
    ): SlotMomentData {
        $instance = $match->instances->first(fn($i) => $i->date->toDateString() === $dateStr);
        // TODO: missed, pending,passed need their own enum both front and back
        $status = match (true) {
            $instance?->completed_at !== null => 'completed',
            $isPast => 'missed',
            $isToday => 'pending',
            default => null,
        };

        $consistency = $this->calculateConsistency($match, $consistencyWindow, $today);

        // Daily view progress: 100 if completed today, else 0
        $progress = $status === 'completed' ? 100 : 0;

        return new SlotMomentData(
            id: $match->id,
            name: $match->name,
            description: $match->description,
            icon: $match->icon,
            color: $match->color,
            frequency: $match->schedule?->frequency ? Frequency::from($match->schedule->frequency) : null,
            consistency: $consistency,
            status: $status,
            instance_id: $instance?->id,
            implementation_intention: $match->cue?->implementation_intention,
            habit_stack_after: $match->cue?->habit_stack_after,
            environment_prompt: $match->cue?->environment_prompt,
            progress: $progress,
        );
    }

    /**
     * Build a WeekDayData for a single calendar date given a set of loaded moments.
     *
     * @param  string[]  $slots
     * @param  Collection<int, Moment>  $dayMoments
     * @param  array<int, int>  $momentProgress  Weekly progress map (momentId => percentage)
     */
    public function buildWeekDayData(
        Carbon $date,
        array $slots,
        Collection $dayMoments,
        bool $isPast,
        bool $isToday,
        Carbon $consistencyWindow,
        Carbon $today,
        int $intervalMinutes = 30,
        array $momentProgress = [],
    ): WeekDayData {
        $dateStr = $date->toDateString();

        $daySlots = array_map(function (string $slotTime) use ($dayMoments, $dateStr, $isPast, $isToday, $consistencyWindow, $today, $intervalMinutes, $momentProgress) {
            $match = $dayMoments->first(function (Moment $m) use ($slotTime, $intervalMinutes) {
                if (! $m->schedule?->preferred_time) {
                    return false;
                }

                return $this->snapToSlot($m->schedule->preferred_time, $intervalMinutes) === $slotTime;
            });

            if (! $match) {
                return new TimeSlotData(time: $slotTime, moment: null);
            }

            $slotMoment = $this->buildSlotMoment($match, $dateStr, $isPast, $isToday, $consistencyWindow, $today);

            // Override progress with weekly aggregate if provided
            if (isset($momentProgress[$match->id])) {
                $slotMoment->progress = $momentProgress[$match->id];
            }

            return new TimeSlotData(
                time: $slotTime,
                moment: $slotMoment,
            );
        }, $slots);

        return new WeekDayData(
            date: $dateStr,
            dayName: $date->format('l'),
            isToday: $isToday,
            isWeekend: $date->isWeekend(),
            slots: $daySlots,
        );
    }

    /**
     * Build a MonthlyDayData for a single calendar date (no time slots — just moment summaries).
     *
     * @param  Collection<int, Moment>  $dayMoments
     * @param  array<int, int>  $momentProgress  Monthly progress map (momentId => percentage)
     */
    public function buildMonthDayData(
        Carbon $date,
        Collection $dayMoments,
        bool $isPast,
        bool $isToday,
        bool $isCurrentMonth,
        Carbon $today,
        int $intervalMinutes = 20,
        array $momentProgress = [],
    ): MonthlyDayData {
        $dateStr = $date->toDateString();

        $moments = $dayMoments->map(function (Moment $m) use ($dateStr, $isPast, $isToday, $momentProgress) {
            $instance = $m->instances->first(fn($i) => $i->date->toDateString() === $dateStr);

            $status = match (true) {
                $instance?->completed_at !== null => 'completed',
                $isPast => 'missed',
                $isToday => 'pending',
                default => null,
            };

            $progress = $momentProgress[$m->id] ?? null;

            return new MonthlyMomentData(
                id: $m->id,
                name: $m->name,
                icon: $m->icon,
                color: $m->color,
                status: $status,
                progress: $progress,
            );
        })->values()->all();

        $completedCount = collect($moments)->filter(fn($m) => $m->status === 'completed')->count();
        $totalCount = count($moments);

        return new MonthlyDayData(
            date: $dateStr,
            dayName: $date->format('l'),
            isToday: $isToday,
            isWeekend: $date->isWeekend(),
            isCurrentMonth: $isCurrentMonth,
            moments: $moments,
            completedCount: $completedCount,
            totalCount: $totalCount,
        );
    }
}
