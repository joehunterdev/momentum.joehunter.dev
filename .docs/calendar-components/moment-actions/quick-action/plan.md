# Moment Quick Action — Implementation Plan

## Goal

Turn the `read` variant of `MomentAction` from a passive label into an interactive surface for **in-place actions on committed moments**. The user can complete a moment with a gesture, see at a glance how reliably they keep that moment, scan long descriptions without truncation, and is nudged with friction when their record on a moment is poor.

This is the **Quick Action** domain — fast, in-row interactions that don't navigate away from the calendar.

---

## Domain naming and where things live

`moment-actions/` is the umbrella for any in-row interaction on a `MomentAction`. Two sibling sub-domains today:

| Sub-domain | What it covers | Code location |
|---|---|---|
| **Schedule** (existing) | Creating a new moment via the inline source / ghost flow. Variants: `draft`, `source`, `ghost`. | `features/scheduling/`, draft-related code in `MomentAction.tsx`. |
| **Quick Action** (this plan) | Acting on an *existing* committed moment in the `read` variant: complete, see consistency, read overflowing text, gated friction. | `features/calendar/quick-action/` (new), read-variant code in `MomentAction.tsx`. |

The umbrella name **Moment Action** is already canonical (`MomentAction.tsx`, `moment-actions-plan.md`). Quick Action is a sub-domain within it — no rename needed.

### Proposed code structure
```
features/calendar/
  quick-action/                       # NEW directory — Quick Action sub-domain
    useMomentComplete.ts              # swipe gesture → POST → completed state
    useMomentDescriptionMarquee.ts    # detect overflow, animate scroll
    useMomentCompletionFriction.ts    # gate gesture behind hold/threshold for low-consistency
    utils.ts                          # shared helpers (consistency banding, etc.)
    types.ts                          # CompletionEvent, FrictionLevel, etc.
  components/
    MomentAction.tsx                  # read variant gains the hooks above
```

### File layout in the docs folder

```
moment-actions/
  README.md                           # umbrella: what Moment Action is, links to subs
  schedule/
    brief.md                          # original schedule brief
    plan.md                           # schedule implementation plan
  quick-action/
    brief.md                          # this sub-domain's brief
    plan.md                           # this file
  review-log.md
```

---

## Architecture grounding

What already exists that this plan reuses:

| Hook / asset | File | Status |
|---|---|---|
| `swipeToComplete` capability flag | `CalendarSectionArticle.tsx:9-11` | Declared, never wired up. We complete the wiring. |
| `--drag-progress` CSS variable + green wash | `_moment-action.scss:206-223` | Visual scaffolding for a left→right fill, currently inert. |
| `moment.status` (Completed / Missed / Pending) | `SlotMomentData` | Backend already returns it. UI doesn't render distinct states. |
| `moment.consistency` (0–100 over 28 days) | `SlotMomentData` | Already computed by `CalendarService::calculateConsistency`. UI ignores it. |
| `moment.progress` (0 / 100 daily, or weekly aggregate) | `SlotMomentData` | Backend present. UI ignores it. |
| `moment.instance_id` | `SlotMomentData` | Today's instance ID when completed. Needed for "uncomplete" if we add it. |

So **most of the data is already plumbed** — the work is gesture handling, visual states, and a complete endpoint.

---

## Feature 1 — Swipe to complete

The user taps the moment's icon and drags right; when the drag passes a threshold, the moment is marked complete for today. Released early → animates back.

### UX

- **Touch / mouse target:** the existing `MomentIcon` element on the left of the `read` row.
- **Gesture:** drag horizontally. `--drag-progress` (0–1) drives the background green wash already wired in SCSS. Vertical drags don't trigger (so the page can still scroll).
- **Threshold:** release at ≥ 0.85 → commit. < 0.85 → snap back, no-op.
- **Completed state:** row background turns light green (use `--mm-progress-complete-rgb` at ~18% opacity to match the existing wash). The icon shows a small ✓ overlay. Drag is disabled (already complete).
- **Re-open (optional / Phase 5):** swipe left to uncomplete, calling the same endpoint with `DELETE`.

### Backend

New route + controller method:

```
POST   /moments/{moment}/complete   → creates a MomentInstance for today
DELETE /moments/{moment}/complete   → removes today's instance (Phase 5 only)
```

- Idempotent on the create side: if an instance for today already exists, return 200 unchanged.
- Returns Inertia redirect to the same view (calendar reloads with `status: Completed`).
- Authorization: same user-owns-moment check.

### Frontend hook

```ts
// features/calendar/quick-action/useMomentComplete.ts
export function useMomentComplete(momentId: number, dateISO: string) {
    // Returns:
    //   dragProgress: number          // 0..1, drives --drag-progress
    //   isCommitting: boolean         // optimistic flag while POST is in flight
    //   bindHandlers: object          // onPointerDown / Move / Up + touch fallbacks
}
```

### Files touched

- NEW `features/calendar/quick-action/useMomentComplete.ts`
- NEW `routes/web.php` route + `MomentController::complete()`
- `features/calendar/components/MomentAction.tsx` — read variant wires the hook on the icon element.
- `_moment-action.scss` — add a `.moment-action--completed` class for the persistent green state (the existing `::before` handles the in-progress wash).

---

## Feature 2 — Consistency visualization

Make the row's track record visible at a glance, drawing on the existing `consistency` field (0–100, 28-day window).

### Options (decide before coding)

| Option | Pros | Cons |
|---|---|---|
| **A. Background colour band** — hue shifts from red (0%) → amber (50%) → green (100%) across the row, low opacity. | Always visible. Pre-attentive. Zero extra DOM. | Conflicts with the completion wash; needs careful layering. |
| **B. Thin progress bar** at the bottom edge of the row, width = consistency%. | Precise. Independent of completion state. | Adds a discrete visual element to a dense row. |
| **C. Both** — subtle bg tint + bar on hover/focus. | Best info density. | More complex; needs a11y review. |

**Recommendation: A as default, with B revealed on row hover / focus** so the precise number is reachable but doesn't crowd the resting state. The completion wash always layers on top.

### Buckets (proposed)
- 0–29% → red
- 30–59% → amber
- 60–84% → light green
- 85–100% → strong green

These also drive Feature 4's friction threshold (see below).

### Files touched

- NEW `features/calendar/quick-action/utils.ts` — `consistencyBand(consistency)` → `'low' | 'mid' | 'high' | 'top'`.
- `MomentAction.tsx` (read) — applies a `.moment-action--consistency-{band}` modifier.
- `_moment-action.scss` — colour definitions per band.

---

## Feature 3 — Description marquee for overflow

`.moment-action__desc` currently uses `text-overflow: ellipsis`. Long descriptions are truncated invisibly. The user wants the text to scroll/ticker so it can be read in full without leaving the calendar.

### Approach

CSS-first with a JS overflow detector:

1. Measure if `desc` element's `scrollWidth > clientWidth`.
2. If overflowing, swap to a marquee container that animates `transform: translateX()` from 0 to `-(overflow + small pause)` and loops.
3. Pause on hover and on `prefers-reduced-motion`.

### Hook

```ts
// features/calendar/quick-action/useMomentDescriptionMarquee.ts
export function useMomentDescriptionMarquee(
    ref: React.RefObject<HTMLElement>,
    enabled = true,
): { isOverflowing: boolean };
```

### Decisions
- **Speed:** ~40 px/sec base, configurable per text length.
- **Pause behaviour:** 1s pause at each end of the loop.
- **Reduced motion:** show the full text statically (no animation), with a horizontal scrollbar as a fallback, OR truncate as today. Recommendation: static + scroll.

### Files touched

- NEW `features/calendar/quick-action/useMomentDescriptionMarquee.ts`
- `MomentAction.tsx` — wraps `__desc` in a marquee container when needed.
- `_moment-action.scss` — keyframes + container styles.

---

## Feature 4 — Completion friction for low-consistency moments

For moments where the user's recent record is poor, completing them should require **more deliberate effort**. The intent is psychological: friction makes the user notice the moment and re-commit to it.

### Friction levels (proposed)

Tied to the `consistencyBand` from Feature 2:

| Band | Friction | Rationale |
|---|---|---|
| `top` (85–100%) | None — single swipe completes. | You're crushing it, no need to slow you down. |
| `high` (60–84%) | None. | Same. |
| `mid` (30–59%) | Hold-press for 1.5s while swiping. | Subtle nudge. |
| `low` (0–29%) | Hold-press for 3s, OR double-swipe (swipe→snap-back→swipe again). | Hard to do absent-mindedly. |

### Why hold-press over confirm dialogs

Confirm dialogs interrupt flow and feel punitive. A hold press repurposes the same gesture vocabulary as the base swipe — the user's hand stays in motion, the friction is felt physically, not cognitively.

### Visual cue for friction

A small ring around the icon fills as the hold progresses. The ring is amber for `mid` and red for `low`. When full, the swipe completes the moment. Releasing early aborts.

### Hook

```ts
// features/calendar/quick-action/useMomentCompletionFriction.ts
export function useMomentCompletionFriction(consistency: number | null): {
    requiredHoldMs: number;          // 0 for high+top, 1500 for mid, 3000 for low
    label: string;                   // "Hold to complete" / "Press and hold longer"
};
```

### Edge cases

- Brand-new moment with no consistency yet → treat as `top` (don't punish a moment that hasn't had time to fail).
- Cold-start: if `consistency` is null, no friction.

### Files touched

- NEW `features/calendar/quick-action/useMomentCompletionFriction.ts`
- `useMomentComplete.ts` — composes with the friction hook to gate the commit.
- `MomentAction.tsx` (read) — renders the hold ring.
- `_moment-action.scss` — ring styling.

---

## Phasing

| Phase | Scope | Acceptance |
|---|---|---|
| **1** | Backend complete endpoint + frontend swipe + completed-state styling. No consistency, no marquee, no friction. | Swipe right on icon → row turns light green → reload shows completed. Swipe left does nothing yet. |
| **2** | Consistency band colour. Bucket logic + `--consistency-{band}` modifier. | Each row tinted per its consistency. Completion wash layers correctly. |
| **3** | Description marquee. | Long descriptions animate; reduced-motion users get static text. |
| **4** | Completion friction. Hold-ring + threshold gating per band. | Low-band moments require sustained press; top-band moments stay single-swipe. |
| **5** | Polish: swipe-left to uncomplete, hover progress bar, a11y review, keyboard equivalent (Enter or Space to complete with same friction). | All gestures have keyboard equivalents; screen readers announce state changes. |

Phases 1–4 are independently mergeable. Phase 5 is polish.

---

## Open questions

1. **Where is "today" defined?** Frontend uses local-midnight; backend uses Carbon::today() in app timezone. Should the `complete` endpoint accept the date explicitly or trust the server's today? Recommendation: accept explicit date from frontend (defends against TZ skew).
2. **Multiple completions per day?** Endpoint is idempotent; only one MomentInstance per (moment, date). Confirmed.
3. **Consistency band thresholds.** Defaults above are guesses — calibrate after we have real data.
4. **Friction visibility.** Should the user *know* in advance that a moment will require more effort before they start swiping? Recommendation: yes — the icon shows the empty ring colour at rest for `mid` and `low` bands.
5. **Uncomplete UX.** Long-press the completed row to revert? Swipe-left? Confirm dialog? Decide in Phase 5.
6. **Reduced motion.** Marquee + friction ring + drag wash all involve motion. Need a coherent reduced-motion fallback story.
7. **Mobile vs desktop parity.** PointerEvents cover both, but velocity feel differs. Test in browser before locking thresholds.

---

## Sequencing

Start Phase 1 — it's the only sub-feature that needs backend work, and the visual scaffolding (`--drag-progress`, `--mm-progress-complete-rgb`) already exists. Phases 2–4 then layer onto the same row component without further backend changes.
