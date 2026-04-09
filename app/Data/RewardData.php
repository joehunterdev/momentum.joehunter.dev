<?php

namespace App\Data;

use App\Models\Reward;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class RewardData extends Data
{
    public function __construct(
        public ?string $description,
        public ?string $temptation_bundle,
    ) {}

    public static function fromModel(Reward $reward): self
    {
        return new self(
            description: $reward->description,
            temptation_bundle: $reward->temptation_bundle,
        );
    }
}
