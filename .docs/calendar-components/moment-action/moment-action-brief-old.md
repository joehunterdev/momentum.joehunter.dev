# Moment Action — Adaptive Drag Resistance Plan

## Core Idea

The swipe-to-complete gesture should feel different based on how consistent the habit is.
A habit with 70% consistency has a **30% balance deficit** — the drag should reflect that
debt with physical resistance, making the user work a little harder to mark it complete.
High-consistency habits feel effortless. Struggling habits feel appropriately harder.

---

## The Balance Factor

```
resistanceFactor = 1 - (consistency / 100)   // 0.0 → no resistance, 1.0 → maximum
```

| Consistency | Resistance Factor | Feel |
|-------------|-------------------|------|
| 100% | 0.0 | Frictionless — one short drag |
| 70% | 0.3 | Mild friction |
| 50% | 0.5 | Noticeably sluggish mid-drag |
| 20% | 0.8 | Heavy — requires deliberate effort |
| 0% (new) | 1.0 | Maximum — full row width |

---

## How Resistance Is Applied

### 1. Variable Threshold (travel distance required)

The completion threshold scales with resistance:

```ts
const BASE_THRESHOLD = 80;   // px for a perfect habit
const MAX_THRESHOLD  = 240;  // px cap for a new/failing habit

threshold = BASE_THRESHOLD + resistanceFactor * (MAX_THRESHOLD - BASE_THRESHOLD)
// 70% consistency → 80 + 0.3 * 160 = 128px
// 20% consistency → 80 + 0.8 * 160 = 208px
```

### 2. Non-linear drag mapping (easing / friction)

Instead of `dragX = rawDelta`, apply an easing curve so the icon
decelerates the further right it's dragged — mimicking physical friction:

```ts
// Ease-out curve: fast start, slows toward threshold
const ease = (raw: number, threshold: number): number => {
    const t = Math.min(raw / threshold, 1);
    return threshold * (1 - Math.pow(1 - t, 1 + resistanceFactor * 2));
};
```

- Low resistance (high consistency): exponent ≈ 1 → nearly linear, snappy
- High resistance (low consistency): exponent ≈ 3 → icon slows dramatically near the end

### 3. Haptic pulses (mobile)

At 50% drag distance, trigger a light haptic pulse (`navigator.vibrate(10)`).
At 100% (completion), trigger a stronger burst (`navigator.vibrate([30, 10, 30])`).
This gives physical confirmation without sound.

### 4. Visual feedback during drag

- The **consistency bar** at the top of the card fills/pulses as drag progresses (already wired via `onSwipeProgress`)
- The **icon tint** shifts from neutral → green as `dragProgress` → 1
- A subtle **row background wash** fills left-to-right proportional to `dragProgress`

---

## Implementation Plan

### Step 1 — Update `useSwipeComplete` hook

**File:** `resources/js/features/weekly/hooks/useSwipeComplete.ts`

Add:
- `resistanceFactor?: number` option (0–1, default 0)
- Compute `threshold` from `BASE_THRESHOLD + resistanceFactor * (MAX_THRESHOLD - BASE_THRESHOLD)`
- Replace `delta` → `ease(delta, threshold)` for `dragX` visual position
- Raw delta still drives the completion trigger (so threshold is real distance, not eased)
- Add `navigator.vibrate` calls at 50% and 100% progress

### Step 2 — Pass `consistency` into `SlotMomentIcon`

**File:** `resources/js/features/weekly/components/SlotMomentIcon.tsx`

- `moment.consistency` is already on the `SlotMoment` type
- Derive `resistanceFactor = moment.consistency !== null ? 1 - moment.consistency / 100 : 1`
- Pass to `useSwipeComplete`

### Step 3 — Icon colour transition during drag

**File:** `SlotMomentIcon.tsx`

```tsx
style={{
    transform: `translateX(${dragX}px)`,
    filter: `hue-rotate(${dragProgress * 120}deg)`,  // neutral → green
    cursor: 'grab',
}}
```

### Step 4 — Row wash on drag progress

**File:** `DailySlotCard.tsx` / `_daily.scss`

Pass `dragProgress` up via `onSwipeProgress` (already exists) and apply as a CSS custom property on the card:

```tsx
<div
  className="slot-moment-card"
  style={{ '--drag-progress': swipeProgress } as React.CSSProperties}
>
```

```scss
.slot-moment-card {
    background: linear-gradient(
        to right,
        rgba(0, 229, 170, calc(var(--drag-progress, 0) * 0.15)) 0%,
        transparent calc(var(--drag-progress, 0) * 100%)
    );
}
```

### Step 5 — Snap-back spring on failed drag

If user releases before threshold, animate `dragX` back to 0 with a spring rather than instant reset:

```ts
// In onPointerUp, instead of setDragX(0) immediately:
// use requestAnimationFrame to decay dragX → 0 with spring coefficient
const spring = (from: number) => {
    if (Math.abs(from) < 1) { setDragX(0); return; }
    const next = from * 0.75;
    setDragX(next);
    requestAnimationFrame(() => spring(next));
};
spring(currentDragX);
```

---

## What NOT to do

- Don't change the **visual icon position** speed — the icon should still track the finger
  linearly; only the **threshold required** and **completion feel** changes.
  (Easing should only apply to the rendered offset, not the trigger logic.)
- Don't block completion for very-low-consistency habits — the resistance is feedback, not a gate.
- Don't apply this to the weekly view (static icons, no swipe).

---

## Files to Change

| File | Change |
|------|--------|
| `hooks/useSwipeComplete.ts` | Add `resistanceFactor`, easing curve, haptics, spring snap-back |
| `components/SlotMomentIcon.tsx` | Derive and pass `resistanceFactor`, add hue-rotate style |
| `components/DailySlotCard.tsx` | Pass `--drag-progress` CSS var to card |
| `css/_daily.scss` | Gradient wash on `.slot-moment-card` using CSS var |
