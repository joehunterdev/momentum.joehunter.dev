<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\UserConfig;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WeeklyController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();

        // Always Monday → Sunday (ISO week) — copy() to avoid mutating $today
        $weekStart = $today->copy()->startOfWeek(Carbon::MONDAY);
        $weekEnd = $today->copy()->endOfWeek(Carbon::SUNDAY);

        // User config — fall back to sensible defaults if not set
        $config = UserConfig::firstOrNew(['user_id' => $user->id]);
        $wakeTime = $config->wake_time ?? '07:00:00';
        $sleepTime = $config->sleep_time ?? '22:00:00';
        $officeStart = $config->office_start ?? '09:00:00';
        $officeEnd = $config->office_end ?? '17:00:00';

        $consistencyWindow = $today->copy()->subDays(27); // 28 days inclusive

        // Load all active moments with schedule + instances for this week + 28-day window
        $moments = Moment::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->with([
                'schedule',
                'cue',
                'instances' => fn ($q) => $q->whereBetween('date', [
                    $consistencyWindow->toDateString(),
                    $weekEnd->toDateString(),
                ]),
            ])
            ->orderBy('sort_order')
            ->get();

        // Build 30-min time slots between wake and sleep
        $slots = $this->buildTimeSlots($wakeTime, $sleepTime);

        // Build each day row
        $days = [];
        $date = $weekStart->copy();

        for ($i = 0; $i < 7; $i++) {
            $dateStr = $date->toDateString();
            $isPast = $date->lt($today);
            $isToday = $date->equalTo($today);
            $isFuture = $date->gt($today);
            $isWeekend = $date->isWeekend();

            // Moments scheduled for this day
            $dayMoments = $moments->filter(fn (Moment $m) => $m->isScheduledFor($date));

            // Map slots → moment or null
            $daySlots = array_map(function (string $slotTime) use ($dayMoments, $dateStr, $isPast, $isToday, $today, $consistencyWindow) {
                $match = $dayMoments->first(function (Moment $m) use ($slotTime) {
                    if (! $m->schedule?->preferred_time) {
                        return false;
                    }

                    return $this->snapToSlot($m->schedule->preferred_time) === $slotTime;
                });

                if (! $match) {
                    return ['time' => $slotTime, 'moment' => null];
                }

                $instance = $match->instances->first(fn ($i) => $i->date->toDateString() === $dateStr);

                $status = match (true) {
                    $instance?->completed_at !== null => 'completed',
                    $isPast => 'missed',
                    $isToday => 'pending',
                    default => null,
                };

                // Consistency: completed instances in 28-day window ÷ scheduled occurrences.
                // Scheduled = number of dates in the window where the moment was due (by frequency/days_of_week).
                // Completed = DB rows with completed_at set — missed days have no row.
                $schedule = $match->schedule;
                $scheduled = 0;
                $windowCursor = $consistencyWindow->copy();

                while ($windowCursor->lte($today)) {
                    $due = match ($schedule?->frequency) {
                        'daily' => true,
                        'weekly', 'custom' => $schedule->days_of_week !== null
                            && in_array($windowCursor->dayOfWeek, $schedule->days_of_week, strict: true),
                        default => false,
                    };

                    if ($due) {
                        $scheduled++;
                    }

                    $windowCursor->addDay();
                }

                $completed = $match->instances->filter(
                    fn ($i) => $i->date->toDateString() >= $consistencyWindow->toDateString()
                        && $i->date->toDateString() <= $today->toDateString()
                        && $i->completed_at !== null
                )->count();

                $consistency = $scheduled > 0 ? (int) round(($completed / $scheduled) * 100) : null;

                return [
                    'time' => $slotTime,
                    'moment' => [
                        'id' => $match->id,
                        'name' => $match->name,
                        'description' => $match->description,
                        'icon' => $match->icon,
                        'color' => $match->color,
                        'frequency' => $match->schedule?->frequency,
                        'consistency' => $consistency,
                        'status' => $status,
                        'instance_id' => $instance?->id,
                        'implementation_intention' => $match->cue?->implementation_intention,
                        'habit_stack_after' => $match->cue?->habit_stack_after,
                        'environment_prompt' => $match->cue?->environment_prompt,
                    ],
                ];
            }, $slots);

            $days[] = [
                'date' => $dateStr,
                'dayName' => $date->format('l'),
                'isToday' => $isToday,
                'isWeekend' => $isWeekend,
                'slots' => $daySlots,
            ];

            $date = $date->addDay();
        }

        return Inertia::render('Weekly/Index', [
            'weekStart' => $weekStart->toDateString(),
            'weekEnd' => $weekEnd->toDateString(),
            'config' => [
                'wake_time' => substr($wakeTime, 0, 5),
                'sleep_time' => substr($sleepTime, 0, 5),
                'office_start' => substr($officeStart, 0, 5),
                'office_end' => substr($officeEnd, 0, 5),
            ],
            'days' => $days,
        ]);
    }

    /**
     * Build an array of 'HH:mm' strings from wake to sleep in 30-min increments.
     * Wake time is floored to the nearest 30-min boundary, sleep time is ceiled.
     *
     * @return string[]
     */
    private function buildTimeSlots(string $wakeTime, string $sleepTime): array
    {
        $slots = [];

        $current = Carbon::createFromTimeString($wakeTime);
        // Floor to nearest 30-min (e.g. 08:18 → 08:00)
        $current->minute($current->minute < 30 ? 0 : 30)->second(0);

        $end = Carbon::createFromTimeString($sleepTime);
        // Ceil to nearest 30-min (e.g. 23:00 stays 23:00, 22:45 → 23:00)
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
     * Snap a time string (HH:mm or HH:mm:ss) to the nearest 30-min slot.
     */
    private function snapToSlot(string $time): string
    {
        $carbon = Carbon::createFromTimeString($time);
        $snapped = $carbon->minute < 15
            ? $carbon->copy()->minute(0)->second(0)
            : ($carbon->minute < 45
                ? $carbon->copy()->minute(30)->second(0)
                : $carbon->copy()->addHour()->minute(0)->second(0));

        return $snapped->format('H:i');
    }
}
