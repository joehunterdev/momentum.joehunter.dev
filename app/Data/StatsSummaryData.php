<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class StatsSummaryData extends Data
{
    public function __construct(
        public int $completionRate,
        public int $totalCompleted,
        public int $longestStreak,
        public int $missedDays,
    ) {}
}
