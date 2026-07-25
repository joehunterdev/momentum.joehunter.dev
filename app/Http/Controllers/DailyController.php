<?php

namespace App\Http\Controllers;

use App\Data\DailyPageData;
use App\Data\UserConfigData;
use App\Enums\MomentStatus;
use App\Models\Moment;
use App\Models\UserConfig;
use App\Services\CalendarService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DailyController extends Controller
{
    public function __construct(private CalendarService $calendar) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();

        // Two display modes, toggled by the "Now / Today" badge:
        //  • rolling (default) — a 24h window from the current slot that crosses
        //    midnight, so it may span two calendar dates ("jump to now").
        //  • whole — the entire anchored day from start of day (wake→sleep).
        $whole = $request->boolean('whole');
        $windowStart = $request->filled('from')
            ? Carbon::parse($request->input('from'))
            : Carbon::now();
        // Floor to the 30-min slot grid, zeroing seconds + microseconds so the
        // live slot compares equal to its grid time (Carbon::now() carries µs).
        $windowStart->setTime($windowStart->hour, $windowStart->minute - ($windowStart->minute % 30), 0, 0);
        $windowEnd = $whole ? $windowStart->copy()->endOfDay() : $windowStart->copy()->addDay();

        $config = UserConfig::firstOrNew(['user_id' => $user->id]);
        $wakeTime = $config->wake_time ?? '07:00:00';
        $sleepTime = $config->sleep_time ?? '22:00:00';
        $officeStart = $config->office_start ?? '09:00:00';
        $officeEnd = $config->office_end ?? '17:00:00';

        // For daily view, the period is the calendar week containing today
        $weekStart = $today->copy()->startOfWeek($config->week_starts_on ?? 1);
        $weekEnd = $weekStart->copy()->addDays(6);

        $moments = Moment::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->with([
                'schedule',
                'cue',
                'instances' => fn ($q) => $q->whereBetween('date', [
                    $weekStart->toDateString(),
                    $weekEnd->toDateString(),
                ]),
            ])
            ->orderBy('sort_order')
            ->get();

        $slotLabels = $this->calendar->buildTimeSlots($wakeTime, $sleepTime, intervalMinutes: 30);

        if ($whole) {
            // Whole anchored day, from start of day — a single full wake→sleep section.
            $dayDate = $windowStart->copy()->startOfDay();
            $days = [
                $this->calendar->buildWeekDayData(
                    date: $dayDate,
                    slots: $slotLabels,
                    dayMoments: $moments->filter(fn (Moment $m) => $m->isScheduledFor($dayDate)),
                    isPast: $dayDate->lt($today),
                    isToday: $dayDate->equalTo($today),
                    periodStart: $weekStart,
                    periodEnd: $weekEnd,
                    today: $today,
                    intervalMinutes: 30,
                ),
            ];
        } else {
            $days = $this->calendar->buildRollingDays(
                windowStart: $windowStart,
                windowEnd: $windowEnd,
                slotLabels: $slotLabels,
                moments: $moments,
                periodStart: $weekStart,
                periodEnd: $weekEnd,
                today: $today,
                intervalMinutes: 30,
            );
        }

        $completedCount = 0;
        $totalCount = 0;
        foreach ($days as $day) {
            foreach ($day->slots as $slot) {
                if ($slot->moment !== null) {
                    $totalCount++;
                    if ($slot->moment->status === MomentStatus::Completed) {
                        $completedCount++;
                    }
                }
            }
        }

        // Visibility for "created a moment but it doesn't show" reports: confirms
        // how many active moments were loaded vs. how many actually landed in a
        // visible slot for this window. Read via Boost `read-log-entries` / `php artisan pail`.
        Log::debug('[DailyController@index] view built', [
            'user_id' => $user->id,
            'whole' => $whole,
            'window' => [$windowStart->toDateTimeString(), $windowEnd->toDateTimeString()],
            'moments_loaded' => $moments->count(),
            'slots_with_moment' => $totalCount,
            'completed' => $completedCount,
        ]);

        $pageData = new DailyPageData(
            from: $windowStart->format('Y-m-d\TH:i'),
            whole: $whole,
            days: $days,
            config: new UserConfigData(
                wake_time: substr($wakeTime, 0, 5),
                sleep_time: substr($sleepTime, 0, 5),
                office_start: substr($officeStart, 0, 5),
                office_end: substr($officeEnd, 0, 5),
            ),
            completedCount: $completedCount,
            totalCount: $totalCount,
        );

        return Inertia::render('Daily/Index', $pageData);
    }
}
