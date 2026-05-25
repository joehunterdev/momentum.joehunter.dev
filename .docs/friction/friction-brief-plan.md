# Friction Feature — Implementation Plan

## Summary

The friction mechanism is largely wired up. This plan closes the gap between the existing infrastructure and a fully testable, visually obvious feature.

---

## What Already Exists

| Piece | File | Status |
|-------|------|--------|
| Friction config by consistency band | `useMomentCompletionFriction.ts` | ✅ done |
| Drag + hold gesture engine | `useMomentComplete.ts` | ✅ done |
| ElectricBorder binding component | `MomentActionBorder.tsx` | ✅ done |
| Hold progress wired to CSS var | `MomentAction.tsx` | ✅ done |
| Border fill visual | `MomentActionBorder` (ElectricBorder) | ⚠️ commented out |

---

## Tasks

### 1. Restore ElectricBorder on the icon (the fill visual)

**File:** `resources/js/features/calendar/components/MomentAction.tsx`

- Uncomment the `MomentActionBorder` import.
- Replace the plain `outline` wrapper `<span>` around the icon with `<MomentActionBorder>`, passing `color`, `consistency`, `dragProgress`, `holdProgress`, `hasFriction`, `isCompleted`, and the existing transform/transition/zIndex as `style`.
- Remove the inline `outline` and `opacity` hacks — `MomentActionBorder` handles intensity.

The border's `interaction` value drives `thickness` (0.8 → 2.2 px) and the ElectricBorder opacity, creating the "fill" effect as the user drags and holds.

```tsx
// Before (plain outline wrapper):
<span style={{ outline: dragProgress > 0 ? `2px solid ...` : 'none', opacity: ... }}>
  <span className="moment-action__icon" ...>...</span>
</span>

// After (ElectricBorder wrapper):
<MomentActionBorder
    color={moment.color}
    consistency={moment.consistency}
    dragProgress={dragProgress}
    holdProgress={holdProgress}
    hasFriction={hasFriction}
    isCompleted={isCompleted}
    style={{ transform: iconTranslateX, transition: iconTransition, ... }}
>
    <span className="moment-action__icon" ...>...</span>
</MomentActionBorder>
```

---

### 2. Friction badge in the description area

**File:** `resources/js/features/calendar/components/MomentAction.tsx`

Add a visible friction badge directly below the moment name in read variant. This makes low/mid friction "super obvious" at a glance.

- Show only when `friction.frictionLevel !== 'none'` and variant is `read`.
- `low` → red badge: `🔴 Hold 3 s to complete`
- `mid` → amber badge: `🟡 Hold 1.5 s to complete`
- Use a small inline `<span>` with a Tailwind/BEM utility class `moment-action__friction-badge`.

```tsx
{friction.frictionLevel !== 'none' && variant === 'read' && (
    <span className={`moment-action__friction-badge moment-action__friction-badge--${friction.frictionLevel}`}>
        {friction.frictionLevel === 'low' ? '🔴' : '🟡'} {friction.label}
    </span>
)}
```

**File:** `resources/css/calendar/_moment-action.scss` (or wherever `.moment-action` styles live)

Add badge styles:
```scss
.moment-action__friction-badge {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    line-height: 1.4;

    &--low  { color: #ef4444; background: rgba(239,68,68,0.12); }
    &--mid  { color: #f59e0b; background: rgba(245,158,11,0.12); }
}
```

---

### 3. Make hold time overridable for testing

**File:** `resources/js/features/quick-action/useMomentCompletionFriction.ts`

Add a dev-time URL param override so QA/testing can force any friction level without needing real consistency data:

```ts
// In development only — check ?friction=low|mid|none in the URL
const devOverride = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get('friction')
    : null;
```

Apply override before the band check:
```ts
export function useMomentCompletionFriction(consistency: number | null | undefined): FrictionConfig {
    if (import.meta.env.DEV) {
        const override = new URLSearchParams(window.location.search).get('friction');
        if (override === 'low') return { requiredHoldMs: 3000, frictionLevel: 'low', label: 'Press and hold to complete' };
        if (override === 'mid') return { requiredHoldMs: 1500, frictionLevel: 'mid', label: 'Hold to complete' };
        if (override === 'none') return NONE;
    }
    // ... existing band logic
}
```

Also add a `?holdMs=<number>` override for precise timing control in tests:
```ts
const holdMsOverride = import.meta.env.DEV
    ? parseInt(new URLSearchParams(window.location.search).get('holdMs') ?? '', 10)
    : NaN;
```

---

### 4. FrictionTestSeeder

**File:** `database/seeders/FrictionTestSeeder.php`

Seeds a set of moments with controlled consistency values directly against a named user (defaults to the demo user). Covers all three friction bands so you can see them side by side.

```php
php artisan db:seed --class=FrictionTestSeeder
```

Moment set:

| Name | Consistency | Friction band | Expected hold |
|------|-------------|---------------|---------------|
| 🟢 Perfect habit | 95 | none | instant |
| 🟢 Good habit | 75 | none | instant |
| 🟡 Building habit | 55 | mid | 1.5 s |
| 🟡 Struggling habit | 40 | mid | 1.5 s |
| 🔴 New habit | 20 | low | 3 s |
| 🔴 Abandoned habit | 5 | low | 3 s |

Each moment description explicitly states its friction level and expected hold duration, making it obvious in the UI:
> "consistency: 20 — low friction — hold 3s to complete"

---

## Implementation Order

1. **FrictionTestSeeder** — get test data in the DB so visuals can be verified immediately.
2. **URL param override** — enables testing without seeded data (append `?friction=low`).
3. **Restore ElectricBorder** — the core visual fill.
4. **Friction badge** — makes friction level legible at a glance.

---

## Files Touched

| File | Change |
|------|--------|
| `resources/js/features/calendar/components/MomentAction.tsx` | Restore `MomentActionBorder`, add friction badge |
| `resources/js/features/calendar/components/MomentActionBorder.tsx` | No change needed |
| `resources/js/features/quick-action/useMomentCompletionFriction.ts` | Add URL param override |
| `resources/css/calendar/_moment-action.scss` (or equivalent) | Friction badge styles |
| `database/seeders/FrictionTestSeeder.php` | New seeder |
