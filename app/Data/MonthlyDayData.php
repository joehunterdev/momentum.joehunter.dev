<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class MonthlyDayData extends Data
{
    public function __construct(
        public string $date,
        public string $dayName,
        public bool $isToday,
        public bool $isWeekend,
        public bool $isCurrentMonth,
        /** @var MonthlyMomentData[] */
        public array $moments,
        public int $completedCount,
        public int $totalCount,
    ) {}
}
