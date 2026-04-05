<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\MomentInstance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DailyController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();

        // All active moments for this user, with schedule + today's instance
        $moments = Moment::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->with([
                'schedule',
                'instances' => fn($q) => $q->whereDate('date', $today),
            ])
            ->orderBy('sort_order')
            ->get();

        // Filter to only moments scheduled for today, then shape for frontend
        $todaysMoments = $moments
            ->filter(fn(Moment $m) => $m->isScheduledFor($today))
            ->map(fn(Moment $m) => [
                'id'                 => $m->id,
                'name'               => $m->name,
                'color'              => $m->color,
                'icon'               => $m->icon,
                'identity_statement' => $m->identity_statement,
                'completed_at'       => $m->instances->first()?->completed_at,
                'instance_id'        => $m->instances->first()?->id,
                'streak'             => $this->currentStreak($m, $today),
            ])
            ->values();

        return Inertia::render('Daily/Index', [
            'date'    => $today->toDateString(),
            'moments' => $todaysMoments,
        ]);
    }

    private function currentStreak(Moment $moment, Carbon $today): int
    {
        $streak = 0;
        $date   = $today->copy()->subDay();

        while (true) {
            // Only count days this moment was scheduled
            if ($moment->isScheduledFor($date)) {
                $completed = MomentInstance::where('moment_id', $moment->id)
                    ->whereDate('date', $date)
                    ->whereNotNull('completed_at')
                    ->exists();

                if (! $completed) {
                    break;
                }

                $streak++;
            }

            $date->subDay();

            // Safety cap — don't loop forever on unscheduled moments
            if ($date->lt($today->copy()->subDays(365))) {
                break;
            }
        }

        return $streak;
    }
}
