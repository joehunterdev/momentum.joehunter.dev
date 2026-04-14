<?php

namespace App\Http\Controllers;

use App\Data\DailyPageData;
use App\Data\UserConfigData;
use App\Models\Moment;
use App\Models\UserConfig;
use App\Services\CalendarService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DailyController extends Controller
{
    public function __construct(private CalendarService $calendar) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();

        $date = $request->filled('date')
            ? Carbon::parse($request->input('date'))
            : $today->copy();

        $isPast = $date->lt($today);
        $isToday = $date->equalTo($today);

        $config = UserConfig::firstOrNew(['user_id' => $user->id]);
        $wakeTime = $config->wake_time ?? '07:00:00';
        $sleepTime = $config->sleep_time ?? '22:00:00';
        $officeStart = $config->office_start ?? '09:00:00';
        $officeEnd = $config->office_end ?? '17:00:00';

        $consistencyWindow = $today->copy()->subDays(27);

        $moments = Moment::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->with([
                'schedule',
                'cue',
                'instances' => fn($q) => $q->whereBetween('date', [
                    $consistencyWindow->toDateString(),
                    $date->toDateString(),
                ]),
            ])
            ->orderBy('sort_order')
            ->get();

        $slots = $this->calendar->buildTimeSlots($wakeTime, $sleepTime);
        $dayMoments = $moments->filter(fn(Moment $m) => $m->isScheduledFor($date));

        $day = $this->calendar->buildWeekDayData(
            date: $date,
            slots: $slots,
            dayMoments: $dayMoments,
            isPast: $isPast,
            isToday: $isToday,
            consistencyWindow: $consistencyWindow,
            today: $today,
        );

        $completedCount = collect($day->slots)
            ->filter(fn($slot) => $slot->moment?->status === 'completed')
            ->count();

        $totalCount = collect($day->slots)
            ->filter(fn($slot) => $slot->moment !== null)
            ->count();

        $pageData = new DailyPageData(
            date: $date->toDateString(),
            day: $day,
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
