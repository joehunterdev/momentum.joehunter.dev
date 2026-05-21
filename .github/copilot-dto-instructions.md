# Copilot Instructions – DTOs (Spatie Laravel Data)

## Purpose

DTOs define the exact shape of data sent to the frontend. They are the **strict contract between Laravel and Inertia**, and the source of truth for all `App.Data.*` TypeScript types.

---

## Core Rules

* DTOs are the single source of truth for frontend data
* Never expose Eloquent models directly to Inertia
* Only include fields the UI actually needs
* Don't duplicate model structure "just in case"

---

## When to Create a DTO

**Create one when:**
* Data is returned to an Inertia page (every page gets a `*PageData` DTO)
* Data combines multiple models (e.g. moment + schedule + instances)
* Data needs computed/formatted fields (progress, consistency, status)

**Skip when:**
* Returning trivial internal-only data not crossing the Inertia boundary

---

## Project DTO Catalogue

| DTO | Used in | Notes |
|---|---|---|
| `SlotMomentData` | Calendar views (Daily/Weekly/Monthly) | Has `progress`, `status`, `instance_id`, `consistency` — slot-context shape |
| `TimeSlotData` | Daily/Weekly slots | `time` + nullable `moment: SlotMomentData` |
| `WeekDayData` | Daily + Weekly | One day with its slot array |
| `MonthlyDayData` | Monthly | One day with moments[] (no slots) |
| `MonthlyScheduleRowData` | Monthly | Per-moment row across the month |
| `DailyPageData` | `Pages/Daily/Index.tsx` | Top-level Inertia props |
| `WeeklyPageData` | `Pages/Weekly/Index.tsx` | Top-level Inertia props |
| `MonthlyPageData` | `Pages/Monthly/Index.tsx` | Top-level Inertia props |
| `MomentData` | `Pages/Moments/{Create,Edit}.tsx` | CRUD shape — has `is_active`, `sort_order`, nested schedule/cue/reward |
| `MomentScheduleData` | Nested inside `MomentData` | `frequency`, `days_of_week`, `preferred_time` |
| `CueData`, `RewardData` | Nested inside `MomentData` | |
| `UserConfigData` | All calendar pages, `Pages/Config/Edit.tsx` | `wake_time`, `sleep_time`, office hours |

### Two Moment Shapes — Don't Mix

`SlotMomentData` and `MomentData` describe the **same domain entity** but for different purposes:

* `SlotMomentData` — rendered in a calendar slot. Has view-computed fields (`progress`, `status`, `instance_id`).
* `MomentData` — edited in a form. Has persistence fields (`is_active`, `sort_order`) and nested relations.

`CalendarService::buildSlotMoment()` produces the slot shape. Controllers building edit/create pages produce `MomentData`. Don't try to unify them — they have different lifecycles.

---

## Design Rules

* Keep DTOs **flat and minimal**
* Prefer explicit fields over deep nesting
* Use nested DTOs only when nesting clarifies (e.g. `MomentData` contains `MomentScheduleData`)
* Mark DTOs with `#[TypeScript]` so they appear in `generated.d.ts`

```php
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

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
        public ?int $consistency,        // 28-day window (0-100)
        public ?string $status,          // 'completed' | 'missed' | 'pending' | null
        public ?int $instance_id,
        public ?string $implementation_intention,
        public ?string $habit_stack_after,
        public ?string $environment_prompt,
        public ?int $progress = null,    // View-specific (0-100)
    ) {}
}
```

---

## Mapping Rules

* Always map from models or builder methods:
  * `UserConfigData::fromModel($config)` (custom factory)
  * `CalendarService::buildSlotMoment(...)` (service builder for computed shapes)
* Never pass raw Eloquent models to `Inertia::render`

```php
// ✅
return Inertia::render('Daily/Index', new DailyPageData(
    date: $date->toDateString(),
    day: $day,
    config: UserConfigData::fromModel($config),
));

// ❌
return Inertia::render('Daily/Index', ['moment' => $moment]);
```

---

## Type Safety Rules

* Use strict types (`int`, `string`, `bool`, enums)
* Cast enums via PHP enum types (e.g. `?Frequency $frequency`)
* Avoid `mixed`
* Mark nullable only where the underlying data is genuinely optional — the frontend handles nulls explicitly

---

## TypeScript Integration

* Generate TS types from PHP DTOs:

```bash
php artisan typescript:transform
```

* Output lands in `resources/js/types/generated.d.ts` under the `App.Data` namespace
* Frontend code consumes types as `App.Data.SlotMomentData`
* Features may re-export under domain aliases in `features/{name}/types.ts`:

```ts
export type CalendarMoment = App.Data.SlotMomentData;
export type TimeSlot = App.Data.TimeSlotData;
```

* **Never** redefine a DTO shape by hand in TypeScript

---

## Naming Conventions

* `*Data` suffix for every DTO class
* Page-level DTOs use `*PageData` (e.g. `DailyPageData`)
* One DTO per concept — if you find yourself adding optional fields for a different use case, consider whether you need a second DTO

---

## Relationship Handling

* Only include relationships if the UI needs them
* Always transform relations into their own DTOs — never a raw model
* Example: `MomentData` has `?MomentScheduleData $schedule`, not `MomentSchedule $schedule`

---

## Golden Rule

**If changing a DTO breaks the frontend → that's correct.**

DTOs are contracts, not helpers. A type error after a DTO change means the frontend is correctly forced to handle the new shape. Run `php artisan typescript:transform` after any DTO change and let TypeScript guide the frontend update.
