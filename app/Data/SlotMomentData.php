<?php

namespace App\Data;

use App\Enums\Frequency;
use App\Enums\MomentStatus;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

/**
 * A moment as it appears in a weekly grid slot — includes status and progress bar.
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
        public ?MomentStatus $status,
        public ?int $instance_id,
        public ?string $implementation_intention,
        public ?string $habit_stack_after,
        public ?string $environment_prompt,
        // Progress bar fields (derived from moment type)
        /** 'ongoing' | 'fixed' | 'once' */
        public string $bar_kind = 'ongoing',
        /** 0–100 for ongoing/fixed, null for once or when 0 due-days resolved */
        public ?int $bar_value = null,
        // Fixed-specific fields (null if not a Fixed habit)
        public ?int $bar_completed = null,
        public ?int $bar_scheduled_total = null,
        public ?int $bar_days_remaining = null,
        public ?string $bar_end_date = null,
    ) {}
}
