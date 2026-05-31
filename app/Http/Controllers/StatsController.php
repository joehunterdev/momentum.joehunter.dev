<?php

namespace App\Http\Controllers;

use App\Services\StatsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatsController extends Controller
{
    /** Allowed rolling windows (days); first is the default. */
    private const RANGES = [30, 90, 180];

    public function __construct(private StatsService $stats) {}

    public function index(Request $request): Response
    {
        $range = (int) $request->input('range', self::RANGES[0]);
        if (! in_array($range, self::RANGES, strict: true)) {
            $range = self::RANGES[0];
        }

        return Inertia::render('Stats/Index', $this->stats->build($request->user(), $range));
    }
}
