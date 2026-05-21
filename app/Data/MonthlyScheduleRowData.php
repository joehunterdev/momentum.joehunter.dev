<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class MonthlyScheduleRowData extends Data
{
    public function __construct(
        public int $isoDayNumber,
        /** @var MomentData[] */
        public array $moments,
    ) {}
}
