<?php

namespace App\Data;

use App\Models\Cue;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CueData extends Data
{
    public function __construct(
        public ?string $implementation_intention,
        public ?string $habit_stack_after,
        public ?string $environment_prompt,
    ) {}

    public static function fromModel(Cue $cue): self
    {
        return new self(
            implementation_intention: $cue->implementation_intention,
            habit_stack_after: $cue->habit_stack_after,
            environment_prompt: $cue->environment_prompt,
        );
    }
}
