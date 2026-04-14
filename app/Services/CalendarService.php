<?php

namespace App\Services;

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
     * Build an array of 'H:i' strings from wake to sleep in 30-min increments.
     *
     * @return string[]
     */
    public function buildTimeSlots(string $wakeTime, string $sleepTime): array
    {
        $slots = [];

        $current = Carbon::createFromTimeString($wakeTime);
        $current->minute($current->minute < 30 ? 0 : 30)->second(0);

        $end = Carbon::createFromTimeString($sleepTime);
        if ($end->second > 0 || ($end->minute > 0 && $end->minute % 30 !== 0)) {
            $end->minute($end->minute < 30 ? 30 : 0);
            if ($end->minute === 0) {
                $end->addHour();
            }
            $end->second(0);
        }

        while ($current->lte($end)) {
            $slots[] = $current->format('H:i');
            $current->addMinutes(30);
        }

        return $slots;
    }

    /**
     * Snap a time string (HH:mm or HH:mm:ss) to the nearest 30-min slot boundary.
     */
    public function snapToSlot(string $time): string
    {
        $carbon = Carbon::createFromTimeString($time);
        $snapped = $carbon->minute < 15
            ? $carbon->copy()->minute(0)->second(0)
            : ($carbon->minute < 45
                ? $carbon->copy()->minute(30)->second(0)
                : $carbon->copy()->addHour()->minute(0)->second(0));

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
            fn ($i) => $i->date->toDateString() >= $windowStart->toDateString()
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
        $instance = $match->instances->first(fn ($i) => $i->date->toDateString() === $dateStr);
        // TODO: missed, pending,passed need their own enum both front and back
        $status = match (true) {
            $instance?->completed_at !== null => 'completed',
            $isPast => 'missed',
            $isToday => 'pending',
            default => null,
        };

        $consistency = $this->calculateConsistency($match, $consistencyWindow, $today);

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
        );
    }

    /**
     * Build a WeekDayData for a single calendar date given a set of loaded moments.
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
        Carbon $consistencyWindow,
        Carbon $today,
    ): WeekDayData {
        $dateStr = $date->toDateString();

        $daySlots = array_map(function (string $slotTime) use ($dayMoments, $dateStr, $isPast, $isToday, $consistencyWindow, $today) {
            $match = $dayMoments->first(function (Moment $m) use ($slotTime) {
                if (! $m->schedule?->preferred_time) {
                    return false;
                }

                return $this->snapToSlot($m->schedule->preferred_time) === $slotTime;
            });

            if (! $match) {
                return new TimeSlotData(time: $slotTime, moment: null);
            }

            return new TimeSlotData(
                time: $slotTime,
                moment: $this->buildSlotMoment($match, $dateStr, $isPast, $isToday, $consistencyWindow, $today),
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
}
