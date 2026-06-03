<?php

namespace App\Data;

use App\Enums\Frequency;
use App\Models\MomentSchedule;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class MomentScheduleData extends Data
{
    public function __construct(
        public Frequency $frequency,
        /** @var int[]|null */
        public ?array $days_of_week,
        public ?string $preferred_time,
        /** ISO date (yyyy-MM-dd) the recurrence stops after; null = ongoing. */
        public ?string $end_date,
    ) {}

    public static function fromModel(MomentSchedule $schedule): self
    {
        return new self(
            frequency: $schedule->frequency,
            days_of_week: $schedule->days_of_week,
            preferred_time: $schedule->preferred_time ? substr($schedule->preferred_time, 0, 5) : null,
            end_date: $schedule->end_date,
        );
    }
}
