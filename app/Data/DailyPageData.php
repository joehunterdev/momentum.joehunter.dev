<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class DailyPageData extends Data
{
    public function __construct(
        public string $from,
        /** True = whole anchored day from start of day; false = rolling 24h from now. */
        public bool $whole,
        /** @var WeekDayData[] */
        public array $days,
        public UserConfigData $config,
        public int $completedCount,
        public int $totalCount,
    ) {}
}
