<?php

namespace App\Data;

use App\Models\UserConfig;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class UserConfigData extends Data
{
    public function __construct(
        public string $wake_time,
        public string $sleep_time,
        public string $office_start,
        public string $office_end,
        public string $friction_level = 'auto',
    ) {}

    public static function fromModel(UserConfig $config): self
    {
        return new self(
            wake_time: substr($config->wake_time ?? '07:00', 0, 5),
            sleep_time: substr($config->sleep_time ?? '22:00', 0, 5),
            office_start: substr($config->office_start ?? '09:00', 0, 5),
            office_end: substr($config->office_end ?? '17:00', 0, 5),
            friction_level: $config->friction_level ?? 'auto',
        );
    }
}
