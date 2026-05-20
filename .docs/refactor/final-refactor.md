# Final Architecture Refactor Plan

## Overview

This refactor aligns frontend and backend architectures by:
1. **Frontend:** Reducing `features/calendar/` from 15 → 5 components, moving display to `shared/`
2. **Frontend:** Creating `useCalendarActions` hook to mirror backend's `CalendarService`
3. **Backend:** Extracting validation to FormRequest classes (Laravel best practice)
4. **Both:** Establishing clear separation of concerns across all layers

**Goal:** Achieve the same clean architecture patterns in `calendar/` that already exist in `moments/` and `config/`.

---

## Phase 1: Frontend Hook Extraction (High Priority)

### 1.1 Create `useCalendarActions` Hook

**File:** `resources/js/features/calendar/hooks/useCalendarActions.ts`

**Purpose:** Extract API call logic from Pages, mirror backend's `CalendarService` pattern

**Methods to implement:**
```typescript
export function useCalendarActions() {
    const toggleMoment = useCallback(async (
        momentId: number, 
        date: string,
        time?: string
    ) => {
        await router.post(
            route('moments.toggle', { moment: momentId }), 
            { date, time },
            { only: ['day', 'days', 'completedCount', 'totalCount'] }
        );
    }, []);
    
    const scheduleOneOff = useCallback((
        date: string,
        time: string,
        name: string,
        icon: string | null
    ) => {
        // Scheduling logic extraction
    }, []);
    
    return { toggleMoment, scheduleOneOff };
}
```

**Files to update:**
- `Pages/Daily/Index.tsx` - Remove `handleToggleMoment`, use `useCalendarActions`
- `Pages/Weekly/Index.tsx` - Remove inline toggle logic
- `Pages/Monthly/Index.tsx` - Remove inline toggle logic

**Success criteria:**
- ✅ All Pages use `const { toggleMoment } = useCalendarActions()`
- ✅ No raw `fetch()` calls in Pages
- ✅ TypeScript compiles with no errors
- ✅ All calendar views still toggle moments correctly

---

## Phase 2: Frontend Component Reorganization (High Priority)

### 2.1 Move Display Components to `shared/components/calendar/`

**Goal:** Consolidate all display/UI components in shared location (mirrors backend's `app/Data/`)

**Moves:**

| Current Location | New Location | Rename |
|-----------------|--------------|--------|
| `features/calendar/components/MomentActionItem.tsx` | `shared/components/calendar/MomentDisplay.tsx` | ✅ |
| `features/calendar/components/CalendarMomentIcon.tsx` | `shared/components/calendar/MomentIcon.tsx` | ✅ |
| `features/calendar/components/FrequencyBar.tsx` | `shared/components/calendar/FrequencyBadge.tsx` | ✅ |
| `features/calendar/components/AddSlotPopover.tsx` | `shared/components/calendar/AddMomentPopover.tsx` | ✅ |

**Steps:**
1. Move files with renames
2. Update imports in all consumers:
   - `DailyTimeSlotCell.tsx`
   - `TimeSlotCell.tsx`
   - `MonthlyVerticalView.tsx`
   - `CalendarSectionArticle.tsx`
3. Update `shared/components/calendar/index.ts` barrel export
4. Update `features/calendar/index.ts` barrel export (remove moved components)

**Delete unused components:**
- `features/calendar/components/ConsistencyBar.tsx` (unused)
- `features/calendar/components/MomentDetailTicker.tsx` (unused)
- `features/calendar/components/DailySlotCard.tsx` (replaced by MomentDisplay)

**Success criteria:**
- ✅ `shared/components/calendar/` has all display components
- ✅ `features/calendar/components/` only has view containers + layout wrappers
- ✅ All imports updated, no broken references
- ✅ `npx tsc --noEmit` passes
- ✅ All three calendar views render correctly

---

### 2.2 Rename View Containers

**Goal:** Clear naming convention - "View" suffix for page-level orchestrators

**Renames:**

| Current Name | New Name | Location |
|-------------|----------|----------|
| `WeeklyGrid.tsx` | `WeeklyView.tsx` | `features/calendar/components/` |
| `MonthlyVerticalView.tsx` | `MonthlyView.tsx` | `features/calendar/components/` |

**Note:** `DailyView` doesn't exist yet - Daily page renders `DailyTimeSlotCell` directly. Consider extracting later if Daily page gets complex.

**Files to update:**
- `Pages/Weekly/Index.tsx` - Import `WeeklyView` instead of `WeeklyGrid`
- `Pages/Monthly/Index.tsx` - Import `MonthlyView` instead of `MonthlyVerticalView`
- `features/calendar/index.ts` - Update barrel exports

**Success criteria:**
- ✅ View containers clearly named with "View" suffix
- ✅ Pages import updated
- ✅ TypeScript compiles
- ✅ Weekly and Monthly views render correctly

---

### 2.3 Consolidate Layout Helpers (Optional - Low Priority)

**Current layout helpers:**
- `DayRow.tsx`
- `DaySection.tsx`
- `MonthlyScheduleRow.tsx`

**Analysis needed:** Check if these have overlapping responsibilities or can be simplified.

**Defer this until Phases 1-2 complete** - only refactor if clear duplication exists.

---

## Phase 3: Frontend Utilities (Medium Priority)

### 3.1 Create `features/calendar/utils.ts`

**Purpose:** Pure functions for calendar calculations (mirror backend's `CalendarService` helpers)

**Functions to extract:**

```typescript
// From Pages/Daily/Index.tsx
export function getVisibleTimeSlots(
    slots: TimeSlot[], 
    config: CalendarConfig, 
    isToday: boolean,
    intervalMinutes: number = 30
): TimeSlot[] {
    // Extract inline logic from Daily/Index.tsx
}

// From backend CalendarService::snapToSlot
export function snapToSlotBoundary(
    time: string, 
    intervalMinutes: number = 30
): string {
    // Client-side implementation of time snapping
}

// Progress calculation helpers
export function calculateSlotProgress(
    completed: number, 
    total: number
): number {
    return total === 0 ? 0 : Math.round((completed / total) * 100);
}
```

**Files to update:**
- `Pages/Daily/Index.tsx` - Use `getVisibleTimeSlots()` from utils
- Any components doing time calculations

**Success criteria:**
- ✅ Pure functions extracted to utils
- ✅ Pages use utility functions instead of inline logic
- ✅ TypeScript compiles
- ✅ Daily view still correctly filters visible slots

---

## Phase 4: Backend FormRequest Extraction (Medium Priority)

### 4.1 Create FormRequest Classes

**Goal:** Follow Laravel best practice (you already use `ProfileUpdateRequest`)

**Create:**

**File:** `app/Http/Requests/StoreMomentRequest.php`
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMomentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:10'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            // Schedule
            'frequency' => ['nullable', 'in:daily,weekly,custom,once'],
            'days_of_week' => ['nullable', 'array'],
            'days_of_week.*' => ['integer', 'between:1,7'],
            'preferred_time' => ['nullable', 'date_format:H:i'],
            'scheduled_date' => ['nullable', 'date'],
            // Cue
            'implementation_intention' => ['nullable', 'string', 'max:255'],
            'habit_stack_after' => ['nullable', 'string', 'max:255'],
            'environment_prompt' => ['nullable', 'string', 'max:255'],
            // Reward
            'reward_description' => ['nullable', 'string', 'max:255'],
            'temptation_bundle' => ['nullable', 'string', 'max:255'],
        ];
    }
}
```

**File:** `app/Http/Requests/UpdateMomentRequest.php`
```php
<?php

namespace App\Http\Requests;

class UpdateMomentRequest extends StoreMomentRequest
{
    // Inherits all validation rules from StoreMomentRequest
}
```

**File:** `app/Http/Requests/UpdateUserConfigRequest.php`
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wake_time' => ['required', 'date_format:H:i'],
            'sleep_time' => ['required', 'date_format:H:i'],
            'office_start' => ['nullable', 'date_format:H:i'],
            'office_end' => ['nullable', 'date_format:H:i'],
        ];
    }
}
```

**Files to update:**
- `app/Http/Controllers/MomentController.php`:
  ```php
  public function store(StoreMomentRequest $request): RedirectResponse
  {
      $data = $request->validated();
      // ... rest of logic
  }
  
  public function update(UpdateMomentRequest $request, Moment $moment): RedirectResponse
  {
      $data = $request->validated();
      // ... rest of logic
  }
  ```

- `app/Http/Controllers/ConfigController.php`:
  ```php
  public function update(UpdateUserConfigRequest $request): RedirectResponse
  {
      $data = $request->validated();
      // ... rest of logic
  }
  ```

**Success criteria:**
- ✅ All FormRequest classes created
- ✅ Controllers use FormRequest type hints
- ✅ Controllers use `$request->validated()` instead of `$request->validate()`
- ✅ Run `vendor/bin/pint --dirty` to format
- ✅ Test moment creation/editing still works
- ✅ Test config update still works

---

## Phase 5: Client-Side Validation (Low Priority - Future Enhancement)

**Goal:** Improve UX by validating before submission

**Options:**
1. Manual validation in `useMomentForm` hook
2. Schema library (Zod, Valibot, Yup)
3. Share validation rules between Laravel + TypeScript

**Recommendation:** Defer until Phases 1-4 complete. This is polish, not architecture.

**If implementing:**
- Create `features/moments/validation.ts`
- Add validation to `useMomentForm` hook
- Show client-side errors before form submission

---

## Phase 6: Merge TimeSlotCell Variants (Low Priority)

**Goal:** Reduce duplication between `TimeSlotCell` and `DailyTimeSlotCell` (~80% overlap)

**Current:**
- `TimeSlotCell.tsx` - Weekly view (no swipe)
- `DailyTimeSlotCell.tsx` - Daily view (with swipe)

**Proposed:**
```typescript
// features/calendar/components/TimeSlotCell.tsx
interface TimeSlotCellProps {
    slot: TimeSlot;
    date: string;
    mode: 'overview' | 'configure';
    enableSwipe?: boolean;  // Only true for Daily configure mode
    onToggle?: (momentId: number, instanceId: number | null) => void;
    onSchedule?: (time: string) => void;
}
```

**Success criteria:**
- ✅ Single `TimeSlotCell` component with `enableSwipe` prop
- ✅ `useSwipeComplete` hook only activates when `enableSwipe={true}`
- ✅ Daily and Weekly views both use same component
- ✅ Swipe-to-complete still works in Daily configure mode
- ✅ Weekly view has no swipe functionality

**Defer until Phases 1-4 complete** - this is optimization, not critical path.

---

## Execution Order

### Sprint 1 (Critical Path - Do First)
1. ✅ **Phase 1:** Create `useCalendarActions` hook
2. ✅ **Phase 2.1:** Move display components to `shared/`
3. ✅ **Phase 2.2:** Rename view containers

**Validation after Sprint 1:**
- Run `npx tsc --noEmit`
- Test all three calendar views (Daily, Weekly, Monthly)
- Test moment toggle/completion
- Run `vendor/bin/pint --dirty --format agent`

### Sprint 2 (Polish)
4. ✅ **Phase 3:** Extract calendar utilities
5. ✅ **Phase 4:** Create FormRequest classes

**Validation after Sprint 2:**
- Test moment creation/editing
- Test config updates
- Verify validation errors still appear

### Sprint 3 (Optimization - Optional)
6. ⏸️ **Phase 6:** Merge `TimeSlotCell` variants (only if needed)
7. ⏸️ **Phase 5:** Client-side validation (future enhancement)

---

## File Structure After Refactor

### Backend (Before → After)
```
app/Http/
├── Controllers/
│   ├── MomentController.php        # ❌ Inline validation
│   └── ConfigController.php        # ❌ Inline validation
└── Requests/
    ├── ProfileUpdateRequest.php    # ✅ Already exists
    ├── StoreMomentRequest.php      # ✅ NEW
    ├── UpdateMomentRequest.php     # ✅ NEW
    └── UpdateUserConfigRequest.php # ✅ NEW
```

### Frontend (Before → After)
```
features/calendar/
├── components/                     # 15 components → 5 components
│   ├── WeeklyView.tsx              # RENAMED from WeeklyGrid
│   ├── MonthlyView.tsx             # RENAMED from MonthlyVerticalView
│   ├── TimeSlotCell.tsx            # KEPT (maybe merge with Daily variant)
│   ├── DailyTimeSlotCell.tsx       # KEPT (or merge into TimeSlotCell)
│   ├── MonthlyDayCell.tsx          # KEPT
│   ├── DayRow.tsx                  # KEPT (review for consolidation)
│   ├── DaySection.tsx              # KEPT (review for consolidation)
│   ├── MonthlyScheduleRow.tsx      # KEPT (review for consolidation)
│   ├── ❌ MomentActionItem.tsx     # MOVED to shared/
│   ├── ❌ CalendarMomentIcon.tsx   # MOVED to shared/
│   ├── ❌ FrequencyBar.tsx         # MOVED to shared/
│   ├── ❌ AddSlotPopover.tsx       # MOVED to shared/
│   ├── ❌ ConsistencyBar.tsx       # DELETED (unused)
│   ├── ❌ MomentDetailTicker.tsx   # DELETED (unused)
│   └── ❌ DailySlotCard.tsx        # DELETED (replaced)
├── hooks/
│   ├── useSwipeComplete.ts         # ✅ Already exists
│   └── useCalendarActions.ts       # ✅ NEW
├── utils.ts                        # ✅ NEW
├── index.ts                        # Updated barrel exports
└── types.ts

shared/components/calendar/
├── CalendarNav.tsx                 # ✅ Already exists
├── CalendarSection.tsx             # ✅ Already exists
├── CalendarProgressBar.tsx         # ✅ Already exists
├── CalendarViewToggle.tsx          # ✅ Already exists
├── CalendarMomentCard.tsx          # ✅ Already exists
├── MomentDisplay.tsx               # ✅ MOVED from MomentActionItem
├── MomentIcon.tsx                  # ✅ MOVED from CalendarMomentIcon
├── FrequencyBadge.tsx              # ✅ MOVED from FrequencyBar
└── AddMomentPopover.tsx            # ✅ MOVED from AddSlotPopover
```

---

## Success Metrics

**After Sprint 1 (Critical):**
- ✅ `features/calendar/components/` has 8 files (down from 15)
- ✅ `shared/components/calendar/` has 9 display components
- ✅ All Pages use `useCalendarActions` hook
- ✅ TypeScript compiles with no errors
- ✅ All three calendar views render and function correctly
- ✅ Moment toggle/completion works
- ✅ Pint formatting passes

**After Sprint 2 (Polish):**
- ✅ Backend has 4 FormRequest classes
- ✅ Controllers use `$request->validated()`
- ✅ Moment creation/editing works
- ✅ Config updates work
- ✅ Validation errors still display correctly

**After Sprint 3 (Optional):**
- ⏸️ Single `TimeSlotCell` component (if merged)
- ⏸️ Client-side validation (if implemented)

---

## Rollback Plan

**If issues arise during Sprint 1:**
1. Revert `useCalendarActions` hook creation
2. Restore old imports in Pages
3. Move components back to `features/calendar/components/`
4. Restore old component names

**Git strategy:**
- Create feature branch: `refactor/calendar-architecture`
- Commit after each phase with clear messages
- Test thoroughly before merging to `feature/moment-actions`

---

## Testing Checklist

**After each phase:**

### Daily View
- [ ] Page loads without errors
- [ ] Time slots render correctly
- [ ] Moments display with icons and progress
- [ ] Swipe-to-complete works in configure mode
- [ ] Toggle moment completion works
- [ ] Navigation (prev/next day) works

### Weekly View
- [ ] Page loads without errors
- [ ] 7-day grid renders correctly
- [ ] Moments display in correct time slots
- [ ] Toggle moment completion works
- [ ] Week navigation works
- [ ] FrequencyBadge displays correctly

### Monthly View
- [ ] Page loads without errors
- [ ] Month calendar renders correctly
- [ ] Moments display on correct days
- [ ] Schedule rows render correctly
- [ ] Month navigation works
- [ ] Mobile vertical view works

### Moment CRUD
- [ ] Create moment form opens
- [ ] Create moment submits successfully
- [ ] Edit moment form opens with data
- [ ] Update moment submits successfully
- [ ] Delete moment works
- [ ] Validation errors display correctly

### Config
- [ ] Config page loads
- [ ] Wake/sleep times update successfully
- [ ] Office hours update successfully
- [ ] Validation errors display correctly

---

## Next Steps

1. **Review this plan** - Confirm Sprint 1 priorities
2. **Start Phase 1** - Create `useCalendarActions` hook
3. **Test thoroughly** - After each phase
4. **Commit frequently** - Small, focused commits
5. **Update architecture docs** - After successful refactor

**Ready to begin?** Start with Phase 1.1 - Create `useCalendarActions` hook.
