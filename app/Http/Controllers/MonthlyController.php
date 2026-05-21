<?php

namespace App\Http\Controllers;

use App\Data\MomentData;
use App\Data\MonthlyPageData;
use App\Data\MonthlyScheduleRowData;
use App\Data\UserConfigData;
use App\Enums\Frequency;
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

        // Compute per-moment monthly progress (completed ÷ scheduled across current month)
        $momentProgress = [];
        $tempDate = $monthStart->copy();
        while ($tempDate->lte($monthEnd)) {
            $dayMoments = $moments->filter(fn(Moment $m) => $m->isScheduledFor($tempDate));
            foreach ($dayMoments as $moment) {
                if (! isset($momentProgress[$moment->id])) {
                    $momentProgress[$moment->id] = ['completed' => 0, 'total' => 0];
                }
                $momentProgress[$moment->id]['total']++;
                $instance = $moment->instances->first(fn($i) => $i->date->toDateString() === $tempDate->toDateString());
                if ($instance !== null) {
                    $momentProgress[$moment->id]['completed']++;
                }
            }
            $tempDate->addDay();
        }

        // Convert to percentage (0-100)
        foreach ($momentProgress as $momentId => $stats) {
            $momentProgress[$momentId] = $stats['total'] > 0
                ? (int) round(($stats['completed'] / $stats['total']) * 100)
                : 0;
        }

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
                momentProgress: $momentProgress,
            );

            $cursor->addDay();
        }

        $scheduleRows = [];

        foreach (range(1, 7) as $iso) {
            $rowMoments = $moments->filter(function (Moment $m) use ($iso) {
                $schedule = $m->schedule;

                if (! $schedule) {
                    return true; // no schedule = daily
                }

                return match ($schedule->frequency) {
                    Frequency::Daily => true,
                    Frequency::Recurring => in_array($iso, $schedule->days_of_week ?? [], strict: true),
                    default => false,
                };
            })
                ->map(fn(Moment $m) => MomentData::fromModel($m))
                ->values()
                ->all();

            $scheduleRows[] = new MonthlyScheduleRowData(
                isoDayNumber: $iso,
                moments: $rowMoments,
            );
        }

        $completedCount = 0;
        $totalCount = 0;
        foreach ($days as $monthDay) {
            if (! $monthDay->isCurrentMonth) {
                continue;
            }
            $completedCount += $monthDay->completedCount;
            $totalCount += $monthDay->totalCount;
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
            completedCount: $completedCount,
            totalCount: $totalCount,
        );

        return Inertia::render('Monthly/Index', $pageData);
    }
}
