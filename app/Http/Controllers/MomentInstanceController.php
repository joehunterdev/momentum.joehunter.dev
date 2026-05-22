<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\MomentInstance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MomentInstanceController extends Controller
{
    /**
     * Toggle the completion of a moment for a given date.
     * Row exists ⇒ completed. Tap to create, tap again to delete.
     * Returns a redirect back so Inertia can perform a partial reload.
     */
    public function toggle(Request $request, Moment $moment): RedirectResponse
    {
        abort_unless($moment->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

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
