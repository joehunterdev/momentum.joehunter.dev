# Config Page — Implementation Plan

> Based on `07-information-architecture.md` §Config.
> Documents the current state and the gaps that need closing before the Weekly View can work properly.

---

## 1. Current State

### What exists

| Layer      | File                                              | Status |
|------------|---------------------------------------------------|--------|
| Model      | `UserConfig` — `wake_time`, `sleep_time`, `week_starts_on` | ✅ Done |
| Controller | `ConfigController@edit` / `@update`               | ✅ Done |
| Routes     | `GET /config`, `PUT /config`                      | ✅ Done |
| Page       | `Pages/Config/Edit.tsx`                            | ✅ Done |
| Form       | `features/config/components/ConfigForm.tsx`        | ✅ Done |
| Types      | `features/config/types.ts` — `UserConfig`         | ✅ Done |
| Tests      | —                                                  | ❌ Missing |

### What's missing (from IA spec)

1. **8-hour sleep helper** — when setting wake/sleep time, suggest the complementary time so the user gets 8 hrs
2. **Office hours** — define start/end of working hours (used by Weekly View for the OOO dimming)
3. **Identity statement area** — a place for the user's overarching identity statement (not per-moment)
4. **Full day names** — the `WEEK_DAYS` constant uses single letters (`M`, `T`…); config dropdown should show full names
5. **"What is an identity statement?"** — inline helper/tooltip explaining the concept

---

## 2. Database Changes

### 2.1 Migration — add `office_start`, `office_end`, `identity_statement` to `user_configs`

```
php artisan make:migration add_office_hours_and_identity_to_user_configs --table=user_configs --no-interaction
```

| Column               | Type          | Default    | Purpose                              |
|----------------------|---------------|------------|--------------------------------------|
| `office_start`       | `time`        | `'09:00'`  | Start of working hours               |
| `office_end`         | `time`        | `'17:00'`  | End of working hours                 |
| `identity_statement` | `string(500)` | `null`     | User's overarching identity statement |

---

## 3. Backend

### 3.1 Model — `UserConfig`

Add to `$fillable`:
```php
'office_start',
'office_end',
'identity_statement',
```

Add to `$casts` (keep existing):
```php
'office_start' => 'string',
'office_end'   => 'string',
```

### 3.2 Controller — `ConfigController`

**`edit()`** — update `firstOrCreate` defaults:
```php
->firstOrCreate([], [
    'wake_time'          => '07:00',
    'sleep_time'         => '23:00',
    'week_starts_on'     => 1,
    'office_start'       => '09:00',
    'office_end'         => '17:00',
    'identity_statement' => null,
]);
```

**`update()`** — extend validation:
```php
$data = $request->validate([
    'wake_time'          => ['required', 'date_format:H:i'],
    'sleep_time'         => ['required', 'date_format:H:i'],
    'week_starts_on'     => ['required', 'integer', 'between:1,7'],
    'office_start'       => ['required', 'date_format:H:i'],
    'office_end'         => ['required', 'date_format:H:i', 'after:office_start'],
    'identity_statement' => ['nullable', 'string', 'max:500'],
]);
```

---

## 4. Frontend

### 4.1 Types — `features/config/types.ts`

```ts
export interface UserConfig {
    id: number;
    wake_time: string;
    sleep_time: string;
    week_starts_on: number;
    office_start: string;
    office_end: string;
    identity_statement: string | null;
}
```

### 4.2 Form sections — `ConfigForm.tsx`

Reorganise into logical sections:

#### Section 1: Sleep Schedule
- **Wake time** / **Sleep time** (existing fields)
- **8-hour sleep helper**: when the user changes `wake_time`, show a subtle hint below: _"For 8 hours of sleep, set sleep time to HH:mm"_ with a clickable link that auto-fills `sleep_time`. Vice versa.

#### Section 2: Office Hours
- **Office start** / **Office end** — two new `<input type="time">` fields
- Helper text: _"Used to dim non-working hours in the weekly view."_

#### Section 3: Week Preferences
- **Week starts on** — existing dropdown, but use full day names from `WEEK_DAYS[].full` instead of single letters

#### Section 4: Identity Statement
- **Textarea** for the overarching identity statement
- **Tooltip/helper**: _"An identity statement describes who you want to become. e.g. 'I am someone who prioritises health and continuous learning.' Your per-moment identity statements build on this."_
- Character count indicator (max 500)

### 4.3 Constants update — `shared/constants/moments.ts`

The `WEEK_DAYS` constant already has a `full` property. The config dropdown should use `opt.full` instead of `opt.label`:
```tsx
<option key={opt.value} value={opt.value}>
    {opt.full}
</option>
```

### 4.4 Sleep helper component — `features/config/components/SleepHelper.tsx`

A small presentational component:
- Receives `wakeTime` and `sleepTime` strings
- Calculates the gap; if ≠ 8 hours, renders a suggestion
- On click, calls a callback to set the complementary time

### 4.5 SCSS

Minimal — the form is structural (Tailwind). Only add if a tooltip or helper needs custom styling, in which case add to `_components.scss`:

```scss
.config-helper {
    // tooltip / hint styles
}
```

---

## 5. Testing

### `tests/Feature/ConfigControllerTest.php`

```
php artisan make:test ConfigControllerTest --phpunit --no-interaction
```

| Test                                                 | Asserts                                                            |
|------------------------------------------------------|--------------------------------------------------------------------|
| `testConfigPageRendersForAuthenticatedUser`          | GET `/config` → 200, renders `Config/Edit`                        |
| `testConfigPageRedirectsGuests`                      | GET `/config` unauthenticated → redirect login                    |
| `testConfigCreatedWithDefaultsOnFirstVisit`          | First visit creates `user_configs` row with correct defaults       |
| `testUpdateWakeAndSleepTime`                         | PUT valid times → saved, redirected with success flash             |
| `testUpdateOfficeHours`                              | PUT valid office hours → saved correctly                           |
| `testOfficeEndMustBeAfterOfficeStart`                | PUT `office_end < office_start` → validation error                 |
| `testUpdateIdentityStatement`                        | PUT with string → saved; PUT with null → saved as null             |
| `testIdentityStatementMaxLength`                     | PUT with 501 chars → validation error                              |
| `testWakeTimeRequiresValidFormat`                    | PUT `wake_time: 'abc'` → validation error                         |
| `testWeekStartsOnMustBeBetween1And7`                | PUT `week_starts_on: 0` and `8` → validation errors               |

---

## 6. Impact on Weekly View

Once config is extended, the `WeeklyController` can use:

- `config.office_start` / `config.office_end` → determine which slots get the `.weekly-slot--ooo` class
- `config.wake_time` / `config.sleep_time` → define the slot range (already planned)
- `config.identity_statement` → could optionally display at the top of the weekly view as a motivational reminder

---

## 7. Implementation Order

1. **Migration** — add columns
2. **Model** — update `$fillable` / `$casts`
3. **Controller** — extend validation and defaults
4. **Types** — update `UserConfig` interface
5. **Tests** — write all feature tests, run green
6. **Form** — add new sections + sleep helper
7. **Constants** — use full day names in dropdown
8. **Manual QA** — verify form saves, helper works, validation errors display
