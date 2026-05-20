<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class MonthlyMomentData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $icon,
        public ?string $color,
        public ?string $status,
        /**
         * Completion percentage (0–100) for this moment across the current month.
         */
        public ?int $progress = null,
    ) {}
}
