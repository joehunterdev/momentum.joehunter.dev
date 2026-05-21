<?php

namespace App\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum MomentStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Missed = 'missed';
    case Skipped = 'skipped';

    /**
     * @return string[]
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
