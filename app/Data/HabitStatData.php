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
        /** 'ongoing' | 'fixed' — determines which fields are populated */
        public string $habit_type,
        // Ongoing-specific
        public ?int $strength = null, // Habit strength 0–100 (exponential smoothing)
        public int $currentStreak = 0,
        public int $longestStreak = 0,
        /** @var string[] one of 'done' | 'missed' | 'notdue', oldest → newest */
        public array $cells = [],
        // Fixed-specific
        public ?int $completionRate = null, // For Fixed: % complete
        public ?int $scheduled_total = null,
        public ?int $completed_total = null,
        public ?int $days_remaining = null,
        public ?string $end_date = null,
    ) {}
}
