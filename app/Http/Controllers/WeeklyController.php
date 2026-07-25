<?php

namespace App\Http\Controllers;

use App\Data\UserConfigData;
use App\Data\WeeklyPageData;
use App\Enums\MomentStatus;
use App\Models\Moment;
use App\Models\UserConfig;
use App\Services\CalendarService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WeeklyController extends Controller
{
    public function __construct(private CalendarService $calendar) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();

        // Rolling 7-day window anchored on the requested day (default: today),
        // not snapped to a calendar week — so the view opens on "now".
        $weekStart = $request->filled('week')
            ? Carbon::parse($request->input('week'))->startOfDay()
            : $today->copy();

        $weekEnd = $weekStart->copy()->addDays(6);

        $config = UserConfig::firstOrNew(['user_id' => $user->id]);
        $wakeTime = $config->wake_time ?? '07:00:00';
        $sleepTime = $config->sleep_time ?? '22:00:00';
        $officeStart = $config->office_start ?? '09:00:00';
        $officeEnd = $config->office_end ?? '17:00:00';

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

        $slots = $this->calendar->buildTimeSlots($wakeTime, $sleepTime);

        $days = [];
        $date = $weekStart->copy();
        $dayCount = $date->diffInDays($weekEnd) + 1;

        for ($i = 0; $i < $dayCount; $i++) {
            $dayMoments = $moments->filter(fn (Moment $m) => $m->isScheduledFor($date));

            $days[] = $this->calendar->buildWeekDayData(
                date: $date,
                slots: $slots,
                dayMoments: $dayMoments,
                isPast: $date->lt($today),
                isToday: $date->equalTo($today),
                periodStart: $weekStart,
                periodEnd: $weekEnd,
                today: $today,
            );

            $date = $date->addDay();
        }

        $completedCount = 0;
        $totalCount = 0;
        foreach ($days as $weekDay) {
            foreach ($weekDay->slots as $slot) {
                if ($slot->moment !== null) {
                    $totalCount++;
                    if ($slot->moment->status === MomentStatus::Completed) {
                        $completedCount++;
                    }
                }
            }
        }

        $pageData = new WeeklyPageData(
            weekStart: $weekStart->toDateString(),
            weekEnd: $weekEnd->toDateString(),
            config: new UserConfigData(
                wake_time: substr($wakeTime, 0, 5),
                sleep_time: substr($sleepTime, 0, 5),
                office_start: substr($officeStart, 0, 5),
                office_end: substr($officeEnd, 0, 5),
            ),
            days: $days,
            completedCount: $completedCount,
            totalCount: $totalCount,
        );

        return Inertia::render('Weekly/Index', $pageData);
    }
}
