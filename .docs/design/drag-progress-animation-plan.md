# Drag-Progress / Consistency ElectricBorder — Implementation Plan

Brief: [drag-progress-animation.md](drag-progress-animation.md).

Wrap `.moment-action--read` with [ElectricBorder](https://reactbits.dev/animations/electric-border) (React Bits, JS + CSS variant), made into a proper reusable component. Tie `color` to `moment.color`. Tie `speed` / `chaos` / `thickness` to the user's gesture (`dragProgress`, `holdProgress`) and to the moment's raw consistency (0–100, continuous — not bucketed).

## Locked design decisions

- **Scope** — electric border wraps the whole row (`.moment-action--read`). The icon SVG arc stays put as the precise commit-threshold cue. Two different jobs, two different scopes.
- **Trigger — drag only.** No ambient glow on idle rows. Border appears on `pointerdown`, fades on `pointerup`. Maximum one active instance app-wide (you can only drag one row at a time) → Monthly-view perf risk dissolves; no IntersectionObserver gating needed.
- **Visibility on drag — every row.** All moments get the electric border while dragging, regardless of consistency band. Consistency drives the *look*, not visibility.
- **Consistency → look mapping** — low consistency drags feel chaotic and slow (the habit is fighting back); high consistency drags feel clean and fast (in the zone). Continuous 0–100 → smooth interpolation.
- **Bands stay.** `consistencyBand()` and the `--consistency-${band}` classes are unchanged — they still drive the friction-hold-time thresholds. The ElectricBorder reads the raw 0–100 number directly. No refactor.
- **Completion celebration.** When `isCompleted`, the border does **not** keep glowing — drag-only means drag-only. Undoing a completion (left swipe) gets the same drag treatment.
- **Reduced motion.** ElectricBorder falls back to a static SVG outline when `prefers-reduced-motion: reduce`.

## 1. Reusable component shape

Two-layer split — the React Bits source becomes generic, our app-specific binding sits on top.

### `resources/js/shared/components/ElectricBorder.tsx` (new, generic)

Verbatim port of the React Bits source from [drag-progress-animation.md:57-355](drag-progress-animation.md#L57-L355), with these changes:

- TypeScript instead of JS. Strict types for all props.
- `aria-hidden` on the canvas + glow layers (decorative).
- Honours `prefers-reduced-motion`: skips the rAF loop, renders a static SVG outline at the same color instead.
- Visibility gate: accepts an `active` prop. When false, the rAF loop is not scheduled (component still mounts so children render normally — only the border layer disappears).
- IntersectionObserver gate baked in: if the root isn't in the viewport, the rAF loop pauses. Cheap insurance even if we only use it interaction-only.
- Cleanup confirmed: `cancelAnimationFrame` + observer disconnect on unmount.

Props (matches the brief's table):

```ts
interface ElectricBorderProps {
  children: React.ReactNode;
  color?: string;          // default '#5227FF'
  speed?: number;          // default 1
  chaos?: number;          // default 0.12
  thickness?: number;      // default 2 — maps to canvas lineWidth & glow border widths
  borderRadius?: number;   // default 24
  active?: boolean;        // default true; false = don't animate, but render children
  className?: string;
  style?: React.CSSProperties;
}
```

### `resources/js/shared/components/ElectricBorder.css` (new)

Verbatim port from [drag-progress-animation.md:359-422](drag-progress-animation.md#L359-L422), one tweak: `.eb-glow-1` and `.eb-glow-2` border widths driven by a CSS var `--electric-thickness` so the JS `thickness` prop has somewhere to land.

### `resources/js/features/calendar/components/MomentActionBorder.tsx` (new, app-specific binding)

Thin wrapper that takes a moment + drag state and computes the props for `<ElectricBorder>`. The actual mapping (§3) lives here, isolated from both ElectricBorder and MomentAction.

```ts
interface MomentActionBorderProps {
  children: React.ReactNode;
  color: string | null;         // moment.color
  consistency: number | null;   // moment.consistency, 0–100
  dragProgress: number;         // 0–1 from useMomentComplete
  holdProgress: number;         // 0–1 from useMomentComplete
  isCompleted: boolean;
}
```

This is the component MomentAction.tsx renders.

## 2. Where it wires in

[MomentAction.tsx](../../resources/js/features/calendar/components/MomentAction.tsx) — read variant only. The current return tree for the read variant is:

```tsx
<div ref={rowRef} className={readCls} style={{ '--hold-progress': holdProgress }}>
  <div className="moment-action__row">…</div>
  <div className="moment-action__progress">…</div>
</div>
```

Becomes:

```tsx
<MomentActionBorder
  color={moment.color}
  consistency={moment.consistency}
  dragProgress={dragProgress}
  holdProgress={holdProgress}
  isCompleted={isCompleted}
>
  <div ref={rowRef} className={readCls} style={{ '--hold-progress': holdProgress }}>
    <div className="moment-action__row">…</div>
    <div className="moment-action__progress">…</div>
  </div>
</MomentActionBorder>
```

Edit and draft variants are untouched.

## 3. Prop mapping — gesture × consistency → ElectricBorder

All mappings live in `MomentActionBorder.tsx`. Drag-only: nothing computes while `interaction === 0`.

```ts
// Continuous consistency (0–1). null/undefined → 0.5 (treat as neutral mid).
const c = Math.max(0, Math.min(1, (consistency ?? 50) / 100));

// Gesture signal — max of drag and hold (drag dominates on no-friction rows,
// hold dominates while waiting through the friction window).
const interaction = Math.max(dragProgress, holdProgress);

// ── Active: drag only. Border doesn't exist outside the gesture. ──
const active = interaction > 0;

// ── Color: moment.color, or fallback to brand teal when null. ──
const color = momentColor ?? 'var(--mm-progress-complete, #00E5AA)';

// ── Speed: high consistency = fast & energetic, low = slow & sluggish. ──
//   Low (c=0):  0.5  (sluggish, struggling)
//   High (c=1): 2.0  (energetic, in the zone)
const speed = 0.5 + (c * 1.5);

// ── Chaos: high consistency = clean lines, low = chaotic noise. ──
// Interaction depth adds a tiny extra kick as you approach commit threshold.
//   Low + light drag:  0.20  (very glitchy)
//   High + light drag: 0.06  (smooth)
//   + up to +0.05 as drag/hold approaches 1
const chaos = 0.20 - (c * 0.14) + (interaction * 0.05);

// ── Thickness: grows with gesture depth — "the border pressing back". ──
const thickness = 1.5 + (interaction * 1.5);   // 1.5 → 3.0 px
```

Numbers are starting values; tune post-implementation in the sandbox page (§6).

### Behavioural summary

| Scenario | Look while dragging |
|---|---|
| New habit (`consistency = null`) | neutral — mid speed, mid chaos (c defaults to 0.5) |
| Low band (0–29) | sluggish, very chaotic — drag feels like wading through static |
| Mid band (30–59) | mid-tempo, moderate chaos |
| High band (60–84) | brisk, cleaner lines |
| Top band (85–100) | fast, smooth electric pulse — "in the zone" |
| Idle (any band) | invisible — no animation, no canvas, no rAF loop |
| Completed | invisible at rest; left-swipe to undo gets the same drag treatment |

This satisfies "dynamic range" — the visual interpolates smoothly across the full 0–100 axis instead of snapping between discrete bands. Bands stay as the basis for friction-hold thresholds in `useMomentCompletionFriction`.

### Reduced-motion (`prefers-reduced-motion: reduce`)

`ElectricBorder` detects this internally and renders a static SVG outline at `color` instead of the rAF canvas. `MomentActionBorder` passes the same `active` gate through, so the outline appears only during drag.

## 4. Performance plan

Drag-only means **at most one active instance at any time**, app-wide. The Monthly-view concern (60 simultaneous rAF loops) is moot.

- `active=false` is the default and only flips true while `interaction > 0`. No idle CPU cost.
- **DPR cap** at 2 in the source — keep it.
- **Canvas reuse on resize**: ResizeObserver already wired; only matters mid-drag, which is brief.
- **No IntersectionObserver needed** — there's no idle animation to pause.

## 5. Layout / clipping concerns

The React Bits source uses `borderOffset = 60` — the canvas is **60 px larger than the container on every side** so the noise distortion can spill outward without clipping. In our calendar rows:

- `.calendar-article` and ancestors might `overflow: hidden`. The 60 px halo will be clipped — visually broken.
- `.moment-action` has `overflow: hidden` set ([_moment-action.scss:20](../../resources/css/calendar/_moment-action.scss#L20)). The whole point of that is to clip the description marquee.

Fix: wrap `MomentActionBorder` **outside** `.moment-action` (so `.moment-action`'s `overflow: hidden` keeps doing its job), and ensure the ancestor `.calendar-article` does not clip. Audit needed during implementation.

If the calendar layout forbids spillover, reduce `borderOffset` to ~16 px and `displacement` to ~15 px. Tighter, slightly less wild, but stays inside row bounds.

## 6. Rollout — single PR

1. Add `ElectricBorder.tsx` + `ElectricBorder.css` (verbatim port + the three tweaks in §1).
2. Add `MomentActionBorder.tsx`.
3. Edit `MomentAction.tsx` — wrap the read-variant return in `<MomentActionBorder>`.
4. Touch `_moment-action.scss` only if §5 reveals a clipping issue.
5. Sandbox page (`resources/js/Pages/Sandbox/Electric.tsx`) — a static row at each of the four bands (0, 30, 60, 90) with mocked `dragProgress` sliders, for tuning the §3 mapping. Delete before merge.
6. Test on:
   - Desktop Chrome (golden path).
   - Mobile Safari iOS (gesture + canvas perf during drag).
   - Reduced-motion (static SVG fallback renders).

No dependency add — the React Bits component is self-contained. No backend / DTO change.

## 7. File-by-file change list

**New**
- `resources/js/shared/components/ElectricBorder.tsx`
- `resources/js/shared/components/ElectricBorder.css`
- `resources/js/features/calendar/components/MomentActionBorder.tsx`

**Modified**
- `resources/js/features/calendar/components/MomentAction.tsx` — read variant return wrapped in `<MomentActionBorder>`.

**Maybe modified (depends on §5 audit)**
- `resources/css/calendar/_moment-action.scss` — adjust `overflow` if border spillover gets clipped.
- `resources/css/calendar/_calendar-article.scss` — same.

**Untouched**
- `useMomentComplete`, `useMomentCompletionFriction`, `consistencyBand` — friction logic and band thresholds are unchanged; we only read their outputs.
- Icon arc SVG inside `.moment-action__icon` — stays as the commit-threshold cue (per Q1 = b).

## 8. Risks

- **`overflow: hidden` clipping the halo.** Real possibility; audit in §5.
- **Visual collision with the icon arc.** Both animate during drag. They're at different scopes (icon vs row) and serve different jobs (commit threshold vs ambient effort), but the shared teal-ish palette could look noisy. Tune chaos / thickness conservatively first; loosen in the sandbox once the gesture feels right.
- **Single-frame canvas spin-up on `pointerdown`.** The first frame of the rAF loop costs more than steady-state (canvas init, ResizeObserver). On low-end devices the first 1–2 frames of a drag may stutter. If measurable, pre-warm by mounting `ElectricBorder` with `active=false` at all times (children render, canvas stays sized but unanimated).
- **`oklch(from …)` browser support.** Used in `ElectricBorder.css` for the lighter-glow derivation. Safari 16.4+, Chrome 111+, Firefox 113+ — fine for target browsers; document as a baseline assumption.
- **Color contrast on bright moment colors.** If a moment is `#FFFF00`, the electric border + glow will be very bright against a white surface. Mitigate by clamping luminance via a CSS filter on the glow layer, or by deriving a safe stroke colour from `moment.color` in JS.
