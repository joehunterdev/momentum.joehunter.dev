<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class MonthlyScheduleRowData extends Data
{
    public function __construct(
        public int $isoDayNumber,
        public string $dayLabel,
        /** @var MomentData[] */
        public array $moments,
    ) {}
}
