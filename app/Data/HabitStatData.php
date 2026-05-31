<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class HabitStatData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $icon,
        public ?string $color,
        public ?int $completionRate,
        public int $currentStreak,
        public int $longestStreak,
        /** @var string[] one of 'done' | 'missed' | 'notdue', oldest → newest */
        public array $cells,
    ) {}
}
