<?php

namespace App\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

/**
 * How a moment recurs.
 *
 * - Daily:     every day. `days_of_week` and `scheduled_date` MUST be null.
 * - Recurring: on specific days of the week. `days_of_week` MUST be a non-empty array (1-7 ISO).
 * - Once:      on one specific date. `scheduled_date` MUST be set.
 *
 * Frontend may offer UX presets (e.g. "Weekdays" button → recurring + [1,2,3,4,5])
 * but those are presentation; the stored shape is always one of these three.
 */
#[TypeScript]
enum Frequency: string
{
    case Daily     = 'daily';
    case Recurring = 'recurring';
    case Once      = 'once';

    /**
     * @return string[]
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
