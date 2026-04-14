<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class DailyPageData extends Data
{
    public function __construct(
        public string $date,
        public WeekDayData $day,
        public ?WeekDayData $nextDay,
        public UserConfigData $config,
        public int $completedCount,
        public int $totalCount,
    ) {}
}
