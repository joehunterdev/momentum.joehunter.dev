<?php

namespace App\Services;

use App\Data\MonthlyDayData;
use App\Data\SlotMomentData;
use App\Data\TimeSlotData;
use App\Data\WeekDayData;
use App\Enums\MomentStatus;
use App\Models\Moment;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CalendarService
{
    public function __construct(private MomentProgressService $progress) {}

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

        // Handle sleep times that cross midnight (e.g., wake=20:00, sleep=02:00)
        if ($end->lt($current)) {
            $end->addDay();
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
     * Build a SlotMomentData for a matched moment in a given slot.
     * $periodStart/$periodEnd define the view's timeframe (week/month) for the bar computation.
     */
    public function buildSlotMoment(
        Moment $match,
        string $dateStr,
        bool $isPast,
        bool $isToday,
        Carbon $periodStart,
        Carbon $periodEnd,
        Carbon $today,
    ): SlotMomentData {
        $instance = $match->instances->first(fn ($i) => $i->date->toDateString() === $dateStr);
        $status = match (true) {
            $instance !== null => MomentStatus::Completed,
            $isPast => MomentStatus::Missed,
            $isToday => MomentStatus::Pending,
            default => null,
        };

        $barPayload = $this->progress->momentBar($match, $periodStart, $periodEnd, $today);

        return new SlotMomentData(
            id: $match->id,
            name: $match->name,
            description: $match->description,
            icon: $match->icon,
            color: $match->color,
            frequency: $match->schedule?->frequency,
            status: $status,
            instance_id: $instance?->id,
            implementation_intention: $match->cue?->implementation_intention,
            habit_stack_after: $match->cue?->habit_stack_after,
            environment_prompt: $match->cue?->environment_prompt,
            bar_kind: $barPayload['kind'],
            bar_value: $barPayload['value'] ?? null,
            bar_completed: $barPayload['completed'] ?? null,
            bar_scheduled_total: $barPayload['scheduled_total'] ?? null,
            bar_days_remaining: $barPayload['days_remaining'] ?? null,
            bar_end_date: $barPayload['end_date'] ?? null,
        );
    }

    /**
     * Build a WeekDayData for a single calendar date given a set of loaded moments.
     * $periodStart/$periodEnd define the view's timeframe (week/month) for the bar computation.
     *
     * @param  string[]  $slots
     * @param  Collection<int, Moment>  $dayMoments
     */
    public function buildWeekDayData(
        Carbon $date,
        array $slots,
        Collection $dayMoments,
        bool $isPast,
        bool $isToday,
        Carbon $periodStart,
        Carbon $periodEnd,
        Carbon $today,
        int $intervalMinutes = 30,
    ): WeekDayData {
        $dateStr = $date->toDateString();

        $daySlots = array_map(function (string $slotTime) use ($dayMoments, $dateStr, $isPast, $isToday, $periodStart, $periodEnd, $today, $intervalMinutes) {
            $match = $dayMoments->first(function (Moment $m) use ($slotTime, $intervalMinutes) {
                if (! $m->schedule?->preferred_time) {
                    return false;
                }

                return $this->snapToSlot($m->schedule->preferred_time, $intervalMinutes) === $slotTime;
            });

            if (! $match) {
                return new TimeSlotData(time: $slotTime, moment: null);
            }

            $slotMoment = $this->buildSlotMoment($match, $dateStr, $isPast, $isToday, $periodStart, $periodEnd, $today);

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
     * Build day objects for a rolling time window that may span two calendar
     * dates (e.g. the daily view's 24h-from-now window). Each emitted
     * WeekDayData carries only the wake→sleep slots whose datetime falls inside
     * [$windowStart, $windowEnd); days with no in-window slots are omitted.
     * $periodStart/$periodEnd define the view's timeframe (week/month) for the bar computation.
     *
     * @param  string[]  $slotLabels  Full wake→sleep 'H:i' labels for a day.
     * @param  Collection<int, Moment>  $moments  Active moments to match per day.
     * @return WeekDayData[]
     */
    public function buildRollingDays(
        Carbon $windowStart,
        Carbon $windowEnd,
        array $slotLabels,
        Collection $moments,
        Carbon $periodStart,
        Carbon $periodEnd,
        Carbon $today,
        int $intervalMinutes = 30,
    ): array {
        $days = [];
        $cursor = $windowStart->copy()->startOfDay();
        $lastDay = $windowEnd->copy()->startOfDay();

        while ($cursor->lte($lastDay)) {
            $dateStr = $cursor->toDateString();

            $inWindow = array_values(array_filter(
                $slotLabels,
                function (string $label) use ($dateStr, $windowStart, $windowEnd) {
                    $slotAt = Carbon::parse($dateStr.' '.$label);

                    return $slotAt->gte($windowStart) && $slotAt->lt($windowEnd);
                },
            ));

            if ($inWindow !== []) {
                $dayMoments = $moments->filter(fn (Moment $m) => $m->isScheduledFor($cursor));

                $days[] = $this->buildWeekDayData(
                    date: $cursor->copy(),
                    slots: $inWindow,
                    dayMoments: $dayMoments,
                    isPast: $cursor->lt($today),
                    isToday: $cursor->equalTo($today),
                    periodStart: $periodStart,
                    periodEnd: $periodEnd,
                    today: $today,
                    intervalMinutes: $intervalMinutes,
                );
            }

            $cursor->addDay();
        }

        return $days;
    }

    /**
     * Build a MonthlyDayData for a single calendar date (no time slots — just moment summaries).
     * $periodStart/$periodEnd define the month range for the bar computation.
     *
     * @param  Collection<int, Moment>  $dayMoments
     */
    public function buildMonthDayData(
        Carbon $date,
        Collection $dayMoments,
        bool $isPast,
        bool $isToday,
        bool $isCurrentMonth,
        Carbon $periodStart,
        Carbon $periodEnd,
        Carbon $today,
        int $intervalMinutes = 20,
    ): MonthlyDayData {
        $dateStr = $date->toDateString();

        $moments = $dayMoments->map(function (Moment $m) use ($dateStr, $isPast, $isToday, $periodStart, $periodEnd, $today) {
            return $this->buildSlotMoment($m, $dateStr, $isPast, $isToday, $periodStart, $periodEnd, $today);
        })->values()->all();

        $completedCount = collect($moments)->filter(fn ($m) => $m->status === MomentStatus::Completed)->count();
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
