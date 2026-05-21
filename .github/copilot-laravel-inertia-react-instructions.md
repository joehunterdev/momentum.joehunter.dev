# Copilot Instructions – Laravel + Inertia + React + TypeScript

## Goal

Build a clean, scalable full-stack application using:

* Laravel (backend, domain logic, validation, persistence)
* Inertia (transport — no separate API layer)
* React + TypeScript (frontend UI)

Principles: KISS, DRY (not premature), clear backend/frontend boundaries.

---

## Project Structure

### Backend (Laravel)

```
app/
├── Console/Commands/
├── Data/                       # Spatie DTOs — frontend contracts
│   ├── SlotMomentData.php      # Moment as rendered in a calendar slot
│   ├── TimeSlotData.php
│   ├── WeekDayData.php
│   ├── MonthlyDayData.php
│   ├── MonthlyScheduleRowData.php
│   ├── DailyPageData.php       # Inertia page props
│   ├── WeeklyPageData.php
│   ├── MonthlyPageData.php
│   ├── MomentData.php          # Moment for CRUD (separate shape from SlotMomentData)
│   ├── MomentScheduleData.php
│   ├── CueData.php
│   ├── RewardData.php
│   └── UserConfigData.php
├── Enums/
│   └── Frequency.php           # daily | weekly | custom | once
├── Http/
│   ├── Controllers/
│   │   ├── DailyController.php
│   │   ├── WeeklyController.php
│   │   ├── MonthlyController.php
│   │   ├── MomentController.php           # CRUD
│   │   ├── MomentInstanceController.php   # toggle completion
│   │   ├── ConfigController.php
│   │   └── …
│   └── Requests/
│       ├── StoreMomentRequest.php
│       ├── UpdateMomentRequest.php
│       └── UpdateUserConfigRequest.php
├── Models/                     # Moment, MomentSchedule, MomentInstance, Cue, Reward, UserConfig
├── Providers/
│   └── TypeScriptTransformerServiceProvider.php
└── Services/
    ├── CalendarService.php     # Calendar aggregation + progress computation
    ├── MomentExportService.php
    └── MomentImportService.php
```

### Frontend (resources/js/)

See `.github/copilot-react-instructions.md` for the full tree. Summary:

```
resources/js/
├── Pages/                      # Thin Inertia shells (1:1 with routes)
├── features/                   # Domain code (lowercase)
│   ├── calendar/{daily,weekly,monthly}/   # View containers
│   ├── calendar/components/               # MomentAction, TimeSlotCell (shared row UI)
│   ├── calendar/hooks/
│   ├── moments/                # Create/Edit forms
│   ├── config/
│   └── scheduling/
├── shared/components/calendar/  # CalendarNav, CalendarSection, MomentIcon, etc.
├── types/generated.d.ts        # ⚠️ Generated from PHP DTOs — App.Data.* namespace
└── Layouts/, Components/       # Breeze (don't modify)
```

> Breeze uses capitalised `Pages/`, `Components/`, `Layouts/`. Our additions
> (`features/`, `shared/`) are lowercase — intentional, to visually separate
> framework scaffolding from app code.

---

## Architecture Principles

### 1. Backend Owns Business Logic

Laravel handles validation, authorisation, data aggregation, progress computation. **Never** move these into React.

### 2. Inertia = Thin Transport

Controllers return DTOs via `Inertia::render(...)`. Pages receive `App.Data.*` typed props.

### 3. Frontend = UI + Interaction

React handles rendering, UI state, minor transformations. Heavy logic stays server-side.

---

## Backend Rules

### Controllers — Thin Orchestrators

A controller method should:
1. Type-hint a `FormRequest` (for write actions) or `Request` (for read)
2. Pull `$request->validated()` (FormRequest) or eager-load models
3. Delegate to a Service for computation
4. Return `Inertia::render('Page', $pageDataDto)`

**Pattern:**

```php
class DailyController extends Controller
{
    public function __construct(private CalendarService $calendar) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $date = $request->filled('date')
            ? Carbon::parse($request->input('date'))
            : Carbon::today();

        $moments = Moment::query()
            ->where('user_id', $user->id)
            ->with(['schedule', 'cue', 'reward', 'instances' => fn ($q) =>
                $q->whereBetween('date', [$consistencyWindow, $today])
            ])
            ->get();

        $slots = $this->calendar->buildTimeSlots($config->wake_time, $config->sleep_time);
        $day   = $this->calendar->buildWeekDayData($date, $slots, $dayMoments, …);

        return Inertia::render('Daily/Index', new DailyPageData(
            date: $date->toDateString(),
            day: $day,
            config: UserConfigData::fromModel($config),
            completedCount: $completed,
            totalCount: $total,
        ));
    }
}
```

### FormRequests — Standard for All Writes

Use FormRequests for every `store`/`update` action:

* `StoreMomentRequest`, `UpdateMomentRequest`, `UpdateUserConfigRequest`
* Inline `$request->validate()` is **only** acceptable for read-only filtering on GET routes.
* `$request->validated()` only — never `$request->all()`.

### Services — Computation Layer

Use a service when:
* Logic exceeds ~30 lines in a controller
* Logic is reused across controllers
* The work is pure computation (calendar aggregation, progress, consistency)

**Don't** create empty service classes — YAGNI. Inject via constructor (`private CalendarService $calendar`).

`CalendarService` is the canonical example: pure functions for `buildTimeSlots`, `snapToSlot`, `calculateConsistency`, `buildSlotMoment`, `buildWeekDayData`. No HTTP, no rendering — controllers handle that.

### Models — Lightweight

* Relationships, scopes, simple accessors, cast definitions (especially enums)
* Move complex query logic to Services
* Cast frequency: `'frequency' => Frequency::class`

### DTOs — Always for Inertia Responses

* Every Inertia page receives a `*PageData` DTO
* Never pass raw Eloquent models to Inertia
* See `.github/copilot-dto-instructions.md` for full DTO rules

### Two Moment Shapes — Don't Conflate Them

| DTO | Used by | Has |
|---|---|---|
| `SlotMomentData` | Calendar views (Daily, Weekly, Monthly) | `progress`, `status`, `instance_id`, `consistency` |
| `MomentData` | CRUD pages (Create, Edit) | `is_active`, `sort_order`, nested `schedule`/`cue`/`reward` |

`CalendarService::buildSlotMoment()` produces `SlotMomentData`. `MomentController` produces `MomentData` for forms. Don't mix.

---

## Frontend Rules

### Pages

* Map 1:1 to routes
* Receive `App.Data.*PageData` props
* Render layout + container(s) + modals
* No business logic inline

### Containers

* Live in `features/calendar/{daily,weekly,monthly}/`
* Orchestrate a single view
* Consume props passed from the page, call hooks, render layout helpers + `TimeSlotCell`

### Shared Row UI

* `MomentAction` is the canonical row — used by all three calendar views
* `TimeSlotCell` is the cell wrapper — handles mode (`'overview' | 'configure'`), swipe, scheduling popover
* These two files in `features/calendar/components/` are the entire shared row layer

### Hooks

* UI/business logic
* `useCalendarActions.toggleMoment` for completion toggles (uses `router.post` with `only: [...]` partial reload)
* `useSwipeComplete` for drag-to-complete gesture
* `useScheduling` for the scheduling state machine
* `useMomentForm` for the create/edit form

### API Calls

* **Inertia mutations** → `router.post/put/delete()` or `useForm`
* **Partial reloads** → `router.post(url, data, { only: ['day', 'completedCount'] })`
* **Raw JSON** → `axios.post()` (CSRF is preconfigured) — rare, only when the route doesn't redirect
* ❌ Never `fetch()`
* ❌ Never `axios` for routes that return Inertia redirects

### Types

* Source of truth: `resources/js/types/generated.d.ts` (regenerated by `php artisan typescript:transform`)
* Consume via `App.Data.SlotMomentData` etc.
* Or re-export under feature aliases in `features/{name}/types.ts`
* Never redefine a shape that exists as a DTO

---

## React Gotchas

* ❌ Don't sync props to state via `useEffect`
* ❌ Don't store derived data — compute it
* ❌ Don't grow components past ~200 lines without splitting

---

## TypeScript Best Practices

* Avoid `any`
* Type props from `App.Data.*` or feature `types.ts`
* Prefer inference
* Handle nulls (most DTO fields are nullable — check `generated.d.ts`)

---

## Styling

* Tailwind by default
* Project-specific styles in `resources/css/`
* Extract reusable patterns to components, not utility class strings

---

## Data Flow

```
Page load:    Controller → Service → DTO → Inertia::render → Page (typed props) → Container → TimeSlotCell → MomentAction
Form submit:  Page → useForm/router.post → FormRequest → Controller → DB → redirect back
Toggle:       useCalendarActions.toggleMoment → router.post with `only: [...]` → MomentInstanceController → partial reload
```

---

## Copilot Rules

When generating code:

* Backend: thin controller + FormRequest + Service + DTO + `Inertia::render`
* Frontend: thin page + container + shared row component (`MomentAction`)
* Type from `App.Data.*` — regenerate with `php artisan typescript:transform`
* Use `route()` (Ziggy) for URLs
* Use `useForm` from `@inertiajs/react` for forms
* Use `router.*` for navigation/mutations, `axios` only for non-redirect JSON
* No business logic in React
* No raw models passed to Inertia
* No inline `$request->validate()` for store/update — use FormRequest
* No cross-feature runtime imports
* No reintroduction of old calendar names (see React instructions)

---

## Anti-Patterns

* Business logic in React (streaks, consistency, progress)
* Duplicating validation frontend/backend — backend validates, frontend shows `errors`
* Overusing `useEffect` to sync props → state
* `any` or untyped props
* Fat controllers (>30 lines of logic — extract to Service)
* Inline `$request->validate()` for store/update
* Raw models passed to Inertia
* `axios` for Inertia redirect routes
* `router.post()` for routes that return JSON
* Hardcoding URL strings
* Domain components in `Pages/` instead of `features/`
* Cross-feature runtime imports
* Defining TS shapes that duplicate a DTO

---

This is the default standard. Deviations should be intentional and justified.
