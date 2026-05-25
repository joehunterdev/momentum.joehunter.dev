# Friction Analysis Brief

> Rename `MomentActionBorder` → `MomentActionIconBorder` once border design is finalised.

---

## Purpose

This document catalogues every parameter available to the friction + visual feedback system so design decisions can be grounded in what the code actually exposes, rather than invented in isolation.

---

## 1. Moment-level parameters (server → props)

These come from the backend via Inertia and are available on every `CalendarMoment` object.

| Parameter | Type | Source | Notes |
|---|---|---|---|
| `consistency` | `number \| null` (0–100) | `CalendarService::calculateConsistency()` — 28-day window | `null` for brand-new moments with no history. Raw continuous value, not bucketed. |
| `color` | `string \| null` | `moments.color` (DB, hex #RRGGBB) | User-picked from `MOMENT_COLOR_PALETTE`. Null = no colour set. |
| `status` | `MomentStatus` enum | `moment_instances` table | `Completed` / `Pending` / etc. Drives `isCompleted`. |
| `progress` | `number` (0–100) | Aggregated from instances | Used by `MomentProgressBar`. Not directly used by friction. |
| `frequency` | `'daily' \| 'recurring' \| 'once'` | `moment_schedules.frequency` | Schedule shape; informs how often a moment appears and therefore how often friction is encountered. |
| `days_of_week` | `int[] \| null` | `moment_schedules.days_of_week` | ISO 1=Mon…7=Sun. Null for daily. |

---

## 2. Derived / computed parameters (frontend)

### 2a. Consistency band — `consistencyBand(consistency)`

Buckets the raw 0–100 into four named bands. Used as the basis for friction level selection.

| Band | Range | Colour signal | Friction |
|---|---|---|---|
| `null` | No history | Neutral | None — don't punish a new moment |
| `low` | 0–29 | Red | 3 000 ms hold at wall |
| `mid` | 30–59 | Amber | 1 500 ms hold at wall |
| `high` | 60–84 | Light green | None |
| `top` | 85–100 | Strong green | None |

Source: `resources/js/features/quick-action/utils.ts`

### 2b. Friction config — `useMomentCompletionFriction(consistency)`

Returns a `FrictionConfig` object:

| Field | Type | Values | Meaning |
|---|---|---|---|
| `requiredHoldMs` | `number` | `0` / `1500` / `3000` | Milliseconds the user must hold at the drag wall before commit unlocks. `0` = instant. |
| `frictionLevel` | `'none' \| 'mid' \| 'low'` | — | Band label for visual/aria use. |
| `label` | `string` | e.g. `'Hold to complete'` | Shown as `aria-label` on the icon button. |

Source: `resources/js/features/quick-action/useMomentCompletionFriction.ts`

### 2c. Derived boolean — `hasFriction`

```ts
const hasFriction = friction.requiredHoldMs > 0;
```

Simple gate used to switch between the two gesture modes throughout `MomentAction` and `MomentActionBorder`.

---

## 3. Gesture parameters (runtime, from `useMomentComplete`)

These are live values produced during the drag gesture. All are `number` in range `0–1` unless noted.

| Parameter | Range | Meaning |
|---|---|---|
| `dragProgress` | 0–1 | How far the icon has been dragged relative to row width. Commit wall = `0.85` (`COMMIT_THRESHOLD`). |
| `holdProgress` | 0–1 | How far through the required hold the user is. Only climbs once `dragProgress >= 0.85`. Resets if user drags back. `1.0` = hold complete, commit fires on pointer-up. |
| `isCommitting` | `boolean` | True while the toggle POST is in-flight. Locks out further gestures. |
| `normalisedDrag` | 0–1 (derived) | `Math.min(1, dragProgress / 0.85)` — remaps drag so `1.0` = commit threshold, for use in visual intensity. |
| `interaction` | 0–1 (derived) | `hasFriction ? holdProgress : normalisedDrag` — single signal driving border intensity in both modes. |

Source: `resources/js/features/quick-action/useMomentComplete.ts`

Key constants in `useMomentComplete`:

| Constant | Value | Purpose |
|---|---|---|
| `COMMIT_THRESHOLD` | `0.85` | Fraction of row width that triggers the hold timer (friction) or commits (no friction). |
| `VERTICAL_DOMINANCE_PX` | `8` | Pixel delta above which a vertical-dominant swipe is treated as scroll and aborts the gesture. |

---

## 4. Visual / animation parameters (from `MomentActionBorder` → `ElectricBorder`)

> These are currently **commented out** while the plain CSS border approach is being developed. Preserved here for when the electric border is re-enabled.

All values are computed from `consistency` (0–1 normalised) and `interaction` (0–1).

| Parameter | Formula | Range | Effect |
|---|---|---|---|
| `speed` | `0.4 + normalizedConsistency × 0.8` | 0.4 → 1.2 | Animation playback speed. High consistency = faster, more confident pulse. |
| `chaos` | `max(0.08, (0.20 − c × 0.10) + interaction × 0.04)` | 0.08 → ~0.20 | Noise turbulence. Low consistency = glitchy/struggling. Rises slightly as hold fills. |
| `thickness` | `0.8 + interaction × 1.4` | 0.8 → 2.2 px | Canvas stroke width. Grows as drag/hold progresses, giving a "filling" feel. |
| `borderRadius` | `0` | — | Matches the square `__icon` element (no rounded corners). |
| `active` | `dragProgress > 0 && !isCompleted` | `boolean` | Gates whether the canvas draws at all. Off = no rAF loop, no CPU cost. |
| `color` | `moment.color ?? 'var(--mm-primary)'` | CSS colour | Stroke + glow colour. Tied to the moment's user-chosen colour. |

Source: `resources/js/features/calendar/components/MomentActionBorder.tsx`, `resources/js/shared/components/ElectricBorder.tsx`

---

## 5. Plain border parameters (current active implementation)

The `outline` approach currently used in `MomentAction.tsx` while the electric border is commented out.

| Parameter | Expression | Effect |
|---|---|---|
| `outline` | `2px solid <moment.color>` when `dragProgress > 0`, else `none` | Shows/hides the border. |
| `outlineOffset` | `2px` | Sits just outside the icon box. |
| `opacity` | No friction: `0.4 + normalisedDrag × 0.6`. Friction: `holdProgress > 0 ? 0.4 + holdProgress × 0.6 : 0.4` | Fades from 40% → 100% as drag (no friction) or hold (friction) fills. |

---

## 6. Opportunity parameters (not yet wired to friction)

These exist in the data model but are not currently used by the friction or visual system.

| Parameter | Where | Potential use |
|---|---|---|
| `identity_statement` | `user_configs.identity_statement` | Could reinforce commitment messaging in the friction label (e.g. show the user's identity statement during a hold). |
| `implementation_intention` | `moment_cues.implementation_intention` | Could be surfaced as a tooltip/overlay during the hold pause. |
| `habit_stack_after` | `moment_cues.habit_stack_after` | The existing stack cue — could be shown as context during hold to reinforce why this moment matters. |
| `reward_description` | `moment_rewards.description` | Could flash briefly on commit as a micro-reward message. |
| `temptation_bundle` | `moment_rewards.temptation_bundle` | The "treat" associated with completing — could appear as commit confirmation. |
| `end_date` | `moment_schedules.end_date` | Could influence friction (e.g. moments near their end date get reduced friction as encouragement). |
| `sort_order` | `moments.sort_order` | Could be used to give first-of-day moments slightly reduced friction (morning routine momentum). |