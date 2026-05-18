<?php

namespace App\Http\Controllers;

use App\Data\MomentData;
use App\Data\MonthlyPageData;
use App\Data\MonthlyScheduleRowData;
use App\Data\UserConfigData;
use App\Models\Moment;
use App\Models\UserConfig;
use App\Services\CalendarService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MonthlyController extends Controller
{
    public function __construct(private CalendarService $calendar) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();

        $monthAnchor = $request->filled('month')
            ? Carbon::parse($request->input('month') . '-01')
            : $today->copy()->startOfMonth();

        $monthStart = $monthAnchor->copy()->startOfMonth();
        $monthEnd = $monthAnchor->copy()->endOfMonth();

        // Grid starts on the Monday on or before the 1st, ends on the Sunday on or after the last day
        $gridStart = $monthStart->copy()->startOfWeek(Carbon::MONDAY);
        $gridEnd = $monthEnd->copy()->endOfWeek(Carbon::SUNDAY);

        $config = UserConfig::firstOrNew(['user_id' => $user->id]);
        $officeStart = $config->office_start ?? '09:00:00';
        $officeEnd = $config->office_end ?? '17:00:00';

        $consistencyWindow = $today->copy()->subDays(27);

        $moments = Moment::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->with([
                'schedule',
                'instances' => fn($q) => $q->whereBetween('date', [
                    $gridStart->toDateString(),
                    $gridEnd->toDateString(),
                ]),
            ])
            ->orderBy('sort_order')
            ->get();

        $days = [];
        $cursor = $gridStart->copy();

        while ($cursor->lte($gridEnd)) {
            $isPast = $cursor->lt($today);
            $isToday = $cursor->equalTo($today);
            $isCurrentMonth = $cursor->month === $monthStart->month;

            $dayMoments = $moments->filter(fn(Moment $m) => $m->isScheduledFor($cursor));

            $days[] = $this->calendar->buildMonthDayData(
                date: $cursor,
                dayMoments: $dayMoments,
                isPast: $isPast,
                isToday: $isToday,
                isCurrentMonth: $isCurrentMonth,
                today: $today,
            );

            $cursor->addDay();
        }
        //TODO: Why we repeating cant be enum ? 
        $dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $scheduleRows = [];

        foreach (range(1, 7) as $iso) {
            $rowMoments = $moments->filter(function (Moment $m) use ($iso) {
                $schedule = $m->schedule;

                if (! $schedule) {
                    return true; // no schedule = daily
                }
                //TODO: Why we repeating cant be enum ? 

                return match ($schedule->frequency) {
                    'daily' => true,
                    'weekly' => $iso >= 1 && $iso <= 5,
                    'custom' => in_array($iso, $schedule->days_of_week ?? [], strict: true),
                    default => false,
                };
            })
                ->map(fn(Moment $m) => MomentData::fromModel($m))
                ->values()
                ->all();

            $scheduleRows[] = new MonthlyScheduleRowData(
                isoDayNumber: $iso,
                dayLabel: $dayNames[$iso - 1],
                moments: $rowMoments,
            );
        }

        $pageData = new MonthlyPageData(
            month: $monthStart->format('Y-m'),
            monthStart: $monthStart->toDateString(),
            monthEnd: $monthEnd->toDateString(),
            config: new UserConfigData(
                wake_time: substr($config->wake_time ?? '07:00:00', 0, 5),
                sleep_time: substr($config->sleep_time ?? '22:00:00', 0, 5),
                office_start: substr($officeStart, 0, 5),
                office_end: substr($officeEnd, 0, 5),
            ),
            days: $days,
            scheduleRows: $scheduleRows,
        );

        return Inertia::render('Monthly/Index', $pageData);
    }
}
