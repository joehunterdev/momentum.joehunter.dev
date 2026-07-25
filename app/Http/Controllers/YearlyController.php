<?php

namespace App\Http\Controllers;

use App\Data\MonthlyPageData;
use App\Data\UserConfigData;
use App\Models\Moment;
use App\Models\UserConfig;
use App\Services\CalendarService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class YearlyController extends Controller
{
    public function __construct(private CalendarService $calendar) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();

        // 365-day rolling window: either anchor to today or parse a requested start date
        $anchor = $request->filled('start')
            ? Carbon::parse($request->input('start'))->startOfDay()
            : $today->copy();

        $rangeStart = $anchor;
        $rangeEnd = $rangeStart->copy()->addDays(364); // 365 days total

        $config = UserConfig::firstOrNew(['user_id' => $user->id]);
        $officeStart = $config->office_start ?? '09:00:00';
        $officeEnd = $config->office_end ?? '17:00:00';

        $moments = Moment::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->with([
                'schedule',
                'instances' => fn ($q) => $q->whereBetween('date', [
                    $rangeStart->toDateString(),
                    $rangeEnd->toDateString(),
                ]),
            ])
            ->orderBy('sort_order')
            ->get();

        $days = [];
        $cursor = $rangeStart->copy();

        while ($cursor->lte($rangeEnd)) {
            $isPast = $cursor->lt($today);
            $isToday = $cursor->equalTo($today);

            $dayMoments = $moments->filter(fn (Moment $m) => $m->isScheduledFor($cursor));

            $days[] = $this->calendar->buildMonthDayData(
                date: $cursor,
                dayMoments: $dayMoments,
                isPast: $isPast,
                isToday: $isToday,
                isCurrentMonth: true,
                periodStart: $rangeStart,
                periodEnd: $rangeEnd,
                today: $today,
            );

            $cursor->addDay();
        }

        $completedCount = 0;
        $totalCount = 0;
        foreach ($days as $yearDay) {
            $completedCount += $yearDay->completedCount;
            $totalCount += $yearDay->totalCount;
        }

        $pageData = new MonthlyPageData(
            rangeStart: $rangeStart->toDateString(),
            rangeEnd: $rangeEnd->toDateString(),
            whole: true,
            config: new UserConfigData(
                wake_time: substr($config->wake_time ?? '07:00:00', 0, 5),
                sleep_time: substr($config->sleep_time ?? '22:00:00', 0, 5),
                office_start: substr($officeStart, 0, 5),
                office_end: substr($officeEnd, 0, 5),
            ),
            days: $days,
            scheduleRows: [],
            completedCount: $completedCount,
            totalCount: $totalCount,
        );

        return Inertia::render('Yearly/Index', $pageData);
    }
}
