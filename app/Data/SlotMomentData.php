<?php

namespace App\Data;

use App\Enums\Frequency;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

/**
 * A moment as it appears in a weekly grid slot — includes status and consistency.
 */
#[TypeScript]
class SlotMomentData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public ?string $icon,
        public ?string $color,
        public ?Frequency $frequency,
        public ?int $consistency,
        public ?string $status,
        public ?int $instance_id,
        public ?string $implementation_intention,
        public ?string $habit_stack_after,
        public ?string $environment_prompt,
        /**
         * Completion percentage (0–100) over the current view's timespan.
         * Daily  = 100 if this moment instance is completed today, else 0.
         * Weekly = ratio across the visible Mon–Sun week.
         * Monthly = ratio across the current month's days.
         */
        public ?int $progress = null,
    ) {}
}
