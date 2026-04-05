<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\MomentInstance;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MomentInstanceController extends Controller
{
    /**
     * Toggle the completed state of a moment instance for a given date.
     * Upserts the instance row, then flips completed_at.
     */
    public function toggle(Request $request, Moment $moment): JsonResponse
    {
        abort_unless($moment->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $date = Carbon::parse($data['date']);

        $instance = MomentInstance::firstOrCreate(
            ['moment_id' => $moment->id, 'date' => $date->toDateString()],
            ['completed_at' => null]
        );

        $instance->toggle();

        return response()->json([
            'completed_at' => $instance->completed_at?->toIso8601String(),
            'instance_id'  => $instance->id,
        ]);
    }
}
