<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class MonthlyPageData extends Data
{
    public function __construct(
        public string $rangeStart,
        public string $rangeEnd,
        /** True = whole calendar month; false = rolling 30 days from now. */
        public bool $whole,
        public UserConfigData $config,
        /** @var MonthlyDayData[] */
        public array $days,
        /** @var MonthlyScheduleRowData[] */
        public array $scheduleRows,
        public int $completedCount,
        public int $totalCount,
    ) {}
}
