# Create Moment — Implementation Plan

> Based on `07-information-architecture.md` §Create Moment.
> Covers: modal conversion, icon picker (Font Awesome), section reordering.

---

## 1. Current State

### What exists

| Layer        | File                                                 | Status |
|--------------|------------------------------------------------------|--------|
| Controller   | `MomentController@create` → renders `Moments/Create` | ✅ Done |
| Controller   | `MomentController@store` / `@update` / `@destroy`    | ✅ Done |
| Page         | `Pages/Moments/Create.tsx` (full page)                | ✅ Done — **needs modal conversion** |
| Page         | `Pages/Moments/Edit.tsx` (full page)                  | ✅ Done — **needs modal conversion** |
| Form         | `MomentForm.tsx` — accordion sections                 | ✅ Done |
| Sub-forms    | `ColorPicker`, `ScheduleFields`, `CueFields`, `RewardFields` | ✅ Done |
| Types        | `MomentFormData`, `Moment`, etc.                      | ✅ Done |
| Hook         | `useMomentForm`                                       | ✅ Done |
| Modal base   | `Components/Modal.tsx` (Headless UI Dialog)           | ✅ Done |
| Tests        | —                                                     | ❌ Missing |

### What's missing (from IA spec)

1. **Modal component** — Create Moment should open as a modal overlay, not a separate page route
2. **Icon picker** — replace the free-text emoji input with a searchable icon palette (Font Awesome or similar)
3. **Section reorder** — Schedule section should be last (currently second)

---

## 2. Modal Conversion

### Approach

Keep the existing `MomentController@create` / `@store` routes (they still handle the Inertia POST). The change is purely frontend — the form renders inside a `<Modal>` instead of a full page.

### 2.1 New component — `features/moments/components/MomentModal.tsx`

```
features/moments/components/MomentModal.tsx
```

A wrapper that composes the existing `<Modal>` shell with `<MomentForm>`:

```tsx
interface MomentModalProps {
    show: boolean;
    onClose: () => void;
    moment?: Moment;          // if editing
    onSubmit: (data, form) => void;
    submitLabel?: string;
}
```

- Uses `Components/Modal.tsx` (`maxWidth="2xl"`)
- Renders a header ("New Moment" or "Edit Moment") + close button
- Body: `<MomentForm>` (unchanged)
- The modal is opened/closed via parent state — no route navigation needed

### 2.2 Trigger points

| Location           | Current behaviour                | New behaviour                              |
|--------------------|----------------------------------|--------------------------------------------|
| Daily page "+ New Moment" | `<Link href={route('moments.create')}>` | Opens `<MomentModal show={…}>` inline       |
| Weekly view empty slot | Links to `moments.create` (planned) | Opens `<MomentModal>` with pre-filled time  |
| Edit moment        | Navigates to `Moments/Edit`      | Opens `<MomentModal moment={…}>`            |

### 2.3 Form submission

The `onSubmit` callback still uses `form.post(route('moments.store'))` or `form.put(route('moments.update', moment.id))`. On success, close the modal and let Inertia's redirect refresh the page data.

### 2.4 Keep page routes as fallback

Don't delete `Pages/Moments/Create.tsx` or `Pages/Moments/Edit.tsx` — they remain as standalone fallback pages (useful for direct URL access, bookmarks, or if JS fails). They can simply render `<MomentModal show={true}>` themselves so the form code stays DRY.

---

## 3. Icon Picker

### 3.1 Dependency — `@fortawesome/fontawesome-free`

Font Awesome Free gives ~2,000 icons via CSS classes. However, for a React icon picker, a better fit is a curated JSON list + SVG rendering.

**Recommended approach: curated icon set as a local constant.**

Rather than adding a heavy dependency, define a `MOMENT_ICONS` constant with ~60–80 commonly relevant habit/lifestyle icons. This keeps the bundle small and avoids licensing concerns.

### 3.2 Icon constant — `shared/constants/icons.ts`

```ts
export interface MomentIconOption {
    name: string;        // display name for search
    emoji: string;       // emoji character (works everywhere)
    category: string;    // for filtering: 'health', 'fitness', 'mind', 'work', 'social', 'creative'
}

export const MOMENT_ICONS: MomentIconOption[] = [
    // Health
    { name: 'Water',      emoji: '💧', category: 'health' },
    { name: 'Apple',      emoji: '🍎', category: 'health' },
    { name: 'Salad',      emoji: '🥗', category: 'health' },
    { name: 'Vitamin',    emoji: '💊', category: 'health' },
    { name: 'Sleep',      emoji: '😴', category: 'health' },
    { name: 'Tooth',      emoji: '🦷', category: 'health' },
    // Fitness
    { name: 'Run',        emoji: '🏃', category: 'fitness' },
    { name: 'Gym',        emoji: '🏋️', category: 'fitness' },
    { name: 'Yoga',       emoji: '🧘', category: 'fitness' },
    { name: 'Cycle',      emoji: '🚴', category: 'fitness' },
    { name: 'Swim',       emoji: '🏊', category: 'fitness' },
    { name: 'Walk',       emoji: '🚶', category: 'fitness' },
    { name: 'Stretch',    emoji: '🤸', category: 'fitness' },
    // Mind
    { name: 'Meditate',   emoji: '🧘', category: 'mind' },
    { name: 'Read',       emoji: '📚', category: 'mind' },
    { name: 'Journal',    emoji: '📝', category: 'mind' },
    { name: 'Brain',      emoji: '🧠', category: 'mind' },
    { name: 'Pray',       emoji: '🙏', category: 'mind' },
    { name: 'Breathe',    emoji: '🌬️', category: 'mind' },
    // Work
    { name: 'Code',       emoji: '💻', category: 'work' },
    { name: 'Email',      emoji: '📧', category: 'work' },
    { name: 'Meeting',    emoji: '🤝', category: 'work' },
    { name: 'Study',      emoji: '📖', category: 'work' },
    { name: 'Write',      emoji: '✍️', category: 'work' },
    { name: 'Plan',       emoji: '📋', category: 'work' },
    // Social
    { name: 'Call',       emoji: '📞', category: 'social' },
    { name: 'Family',     emoji: '👨‍👩‍👧', category: 'social' },
    { name: 'Friends',    emoji: '👥', category: 'social' },
    { name: 'Heart',      emoji: '❤️', category: 'social' },
    // Creative
    { name: 'Music',      emoji: '🎵', category: 'creative' },
    { name: 'Art',        emoji: '🎨', category: 'creative' },
    { name: 'Camera',     emoji: '📷', category: 'creative' },
    { name: 'Guitar',     emoji: '🎸', category: 'creative' },
    // General
    { name: 'Star',       emoji: '⭐', category: 'general' },
    { name: 'Fire',       emoji: '🔥', category: 'general' },
    { name: 'Check',      emoji: '✅', category: 'general' },
    { name: 'Clock',      emoji: '⏰', category: 'general' },
    { name: 'Money',      emoji: '💰', category: 'general' },
    { name: 'Clean',      emoji: '🧹', category: 'general' },
    { name: 'Cook',       emoji: '🍳', category: 'general' },
    { name: 'Plant',      emoji: '🌱', category: 'general' },
    // ... extend as needed
];

export const ICON_CATEGORIES = [
    'all', 'health', 'fitness', 'mind', 'work', 'social', 'creative', 'general',
] as const;
```

**Why emojis over Font Awesome?**
- Zero dependency, zero bundle cost
- Already used in the app (current `icon` field stores emoji strings like `💧`)
- Renders natively on all platforms
- The `icon` DB column (`varchar(255)`) stores the emoji character — no migration needed

If Font Awesome is preferred later, the `emoji` field can be swapped for an FA class name and a render component added. The constant structure supports both.

### 3.3 New component — `features/moments/components/IconPicker.tsx`

Replaces the current free-text `<TextInput>` for icon.

**UI:**
- Current selected icon displayed large
- Category filter tabs (horizontal scroll)
- Search input (filters by `name`)
- Grid of icon buttons (4–6 per row)
- Clicking an icon selects it and calls `onChange(emoji)`

**SCSS:** `_components.scss` addition:
```scss
.icon-picker { /* grid layout, selected state, search bar */ }
.icon-picker__item { /* individual icon button */ }
.icon-picker__item--selected { /* ring/highlight */ }
```

---

## 4. Section Reorder

Current order in `MOMENT_FORM_SECTIONS`:
1. Basics
2. Schedule
3. Cue
4. Reward

New order per IA spec ("schedule section can go last"):
1. **Basics** (name, description, identity statement, icon, colour)
2. **Cue**
3. **Reward**
4. **Schedule**

Update `shared/constants/moments.ts`:
```ts
export const MOMENT_FORM_SECTIONS: MomentFormSection[] = [
    { id: 'basics',   label: 'Basics',   emoji: '✏️' },
    { id: 'cue',      label: 'Cue',      emoji: '🔔' },
    { id: 'reward',   label: 'Reward',   emoji: '🏆' },
    { id: 'schedule', label: 'Schedule', emoji: '📅' },
];
```

---

## 5. Backend Changes

**None required.** The controller, validation, and model all remain the same. The `icon` column already stores emoji strings, and the form submission endpoints don't change.

---

## 6. File Changes Summary

| File                                          | Action     | What                                           |
|-----------------------------------------------|------------|-------------------------------------------------|
| `features/moments/components/MomentModal.tsx` | **New**    | Modal wrapper for MomentForm                   |
| `features/moments/components/IconPicker.tsx`   | **New**    | Searchable icon grid                           |
| `shared/constants/icons.ts`                    | **New**    | `MOMENT_ICONS` + `ICON_CATEGORIES`             |
| `shared/constants/moments.ts`                  | **Edit**   | Reorder `MOMENT_FORM_SECTIONS`                 |
| `features/moments/components/MomentForm.tsx`   | **Edit**   | Swap `<TextInput>` for `<IconPicker>`          |
| `features/moments/index.ts`                    | **Edit**   | Export `MomentModal`                           |
| `Pages/Daily/Index.tsx`                        | **Edit**   | Replace `<Link>` with modal trigger            |
| `Pages/Moments/Create.tsx`                     | **Edit**   | Render `<MomentModal show={true}>` standalone  |
| `Pages/Moments/Edit.tsx`                       | **Edit**   | Render `<MomentModal show={true}>` standalone  |
| `resources/css/_components.scss`               | **Edit**   | Add `.icon-picker` styles                      |

---

## 7. Testing

### `tests/Feature/MomentControllerTest.php`

```
php artisan make:test MomentControllerTest --phpunit --no-interaction
```

| Test                                             | Asserts                                                       |
|--------------------------------------------------|---------------------------------------------------------------|
| `testCreatePageRendersForAuthenticatedUser`      | GET `/moments/create` → 200, renders `Moments/Create`        |
| `testCreatePageRedirectsGuests`                  | GET `/moments/create` unauthenticated → redirect login        |
| `testStoreMomentWithValidData`                   | POST valid payload → moment + schedule + cue + reward created |
| `testStoreMomentRequiresName`                    | POST without name → validation error                          |
| `testStoreMomentWithEmojiIcon`                   | POST `icon: '💧'` → stored correctly                         |
| `testStoreMomentWithSchedule`                    | POST with frequency/days/time → schedule row created          |
| `testEditPageRendersForOwner`                    | GET `/moments/{id}/edit` → 200 with moment data              |
| `testEditPageForbiddenForNonOwner`               | GET `/moments/{id}/edit` as different user → 403              |
| `testUpdateMoment`                               | PUT valid data → moment updated                               |
| `testDeleteMoment`                               | DELETE → soft-deleted, redirect with flash                    |
| `testToggleMomentCompletion`                     | POST toggle → instance created / completed_at toggled         |

---

## 8. Implementation Order

1. **Constants** — create `shared/constants/icons.ts`, reorder sections in `moments.ts`
2. **IconPicker** — build `features/moments/components/IconPicker.tsx`
3. **MomentForm** — swap emoji text input for `<IconPicker>`
4. **MomentModal** — create modal wrapper component
5. **SCSS** — add `.icon-picker` styles to `_components.scss`
6. **Pages** — update `Create.tsx` / `Edit.tsx` to use modal, update `Daily/Index.tsx` trigger
7. **Tests** — write all feature tests, run green
8. **Manual QA** — verify modal open/close, icon selection, section order, form submission
