<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class WeeklyPageData extends Data
{
    public function __construct(
        public string $weekStart,
        public string $weekEnd,
        public UserConfigData $config,
        /** @var WeekDayData[] */
        public array $days,
    ) {}
}
