<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class MonthlyPageData extends Data
{
    public function __construct(
        public string $month,
        public string $monthStart,
        public string $monthEnd,
        public UserConfigData $config,
        /** @var MonthlyDayData[] */
        public array $days,
        /** @var MonthlyScheduleRowData[] */
        public array $scheduleRows,
        public int $completedCount,
        public int $totalCount,
    ) {}
}
