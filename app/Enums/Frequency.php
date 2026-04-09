<?php

namespace App\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum Frequency: string
{
    case Daily = 'daily';
    case Weekly = 'weekly';
    case Custom = 'custom';
}
