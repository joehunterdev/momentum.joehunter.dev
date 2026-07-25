<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\MomentInstance;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MomentInstanceController extends Controller
{
    /**
     * Toggle the completion of a moment for a given date.
     * Row exists ⇒ completed. Tap to create, tap again to delete.
     * Validates that the date is not too far in the past (grace window = 7 days).
     * Returns a redirect back so Inertia can perform a partial reload.
     */
    public function toggle(Request $request, Moment $moment): RedirectResponse
    {
        abort_unless($moment->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $toggleDate = Carbon::parse($data['date'])->startOfDay();
        $today = Carbon::today();
        $graceWindow = 7;

        // Validate date bounds
        if ($toggleDate->gt($today)) {
            abort(422, 'Cannot log future dates.');
        }

        $schedule = $moment->schedule;
        $momentStart = $schedule?->start_date
            ? Carbon::parse($schedule->start_date)->startOfDay()
            : $moment->created_at?->copy()->startOfDay();

        if ($momentStart && $toggleDate->lt($momentStart)) {
            abort(422, 'Cannot log before the habit start date.');
        }

        if ($toggleDate->lt($today->copy()->subDays($graceWindow))) {
            abort(422, "Cannot log more than {$graceWindow} days in the past.");
        }

        $instance = MomentInstance::where('moment_id', $moment->id)
            ->whereDate('date', $data['date'])
            ->first();

        if ($instance) {
            $instance->delete();
        } else {
            MomentInstance::create([
                'moment_id' => $moment->id,
                'date' => $data['date'],
                'completed_at' => now(),
            ]);
        }

        return back();
    }
}
