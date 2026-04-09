<?php

namespace App\Data;

use App\Models\Moment;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

/**
 * Full moment shape — used by create/edit forms.
 */
#[TypeScript]
class MomentData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public ?string $color,
        public ?string $icon,
        public bool $is_active,
        public int $sort_order,
        public ?MomentScheduleData $schedule,
        public ?CueData $cue,
        public ?RewardData $reward,
    ) {}

    public static function fromModel(Moment $moment): self
    {
        return new self(
            id: $moment->id,
            name: $moment->name,
            description: $moment->description,
            color: $moment->color,
            icon: $moment->icon,
            is_active: $moment->is_active,
            sort_order: $moment->sort_order,
            schedule: $moment->schedule ? MomentScheduleData::fromModel($moment->schedule) : null,
            cue: $moment->cue ? CueData::fromModel($moment->cue) : null,
            reward: $moment->reward ? RewardData::fromModel($moment->reward) : null,
        );
    }
}
