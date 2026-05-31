<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TrendPointData extends Data
{
    public function __construct(
        public string $date,
        public int $rate,
    ) {}
}
