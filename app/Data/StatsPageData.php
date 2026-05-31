<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class StatsPageData extends Data
{
    public function __construct(
        public int $rangeDays,
        /** @var string[] ISO dates on the x-axis / grid columns, oldest → newest */
        public array $days,
        public StatsSummaryData $summary,
        /** @var HabitStatData[] */
        public array $habits,
        /** @var TrendPointData[] */
        public array $trend,
    ) {}
}
