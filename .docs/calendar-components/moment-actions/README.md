# Moment Action

**Moment Action** is the in-row interaction system on a `MomentAction` component — the canonical row that appears inside every `CalendarSectionArticle` across Daily, Weekly, and Monthly views.

There are two sub-domains, each owning a distinct set of variants, hooks, and visual states.

## Sub-domains

### [Schedule](./schedule/) — creating new moments

Inline source / ghost flow. The user clicks a slot, fills in icon + name in place, and commits via ✓ Apply (one-off) or ☑ Apply All (recurring). Variants involved: `draft`, `source`, `ghost`.

- [`schedule/brief.md`](./schedule/brief.md) — original brief
- [`schedule/plan.md`](./schedule/plan.md) — implementation plan, scope conventions, phasing

Code location: `resources/js/features/scheduling/` + draft-related branches in `MomentAction.tsx`.

### [Quick Action](./quick-action/) — acting on committed moments

Fast in-place interactions on the `read` variant: swipe to complete, consistency visualization, description marquee, completion friction for low-consistency moments.

- [`quick-action/brief.md`](./quick-action/brief.md) — original brief
- [`quick-action/plan.md`](./quick-action/plan.md) — implementation plan, phases, open questions

Code location: `resources/js/features/quick-action/` (planned, peer to `scheduling/`) + read-variant code in `MomentAction.tsx`.

## Why this split

| | Schedule | Quick Action |
|---|---|---|
| Acts on | Empty slot → new moment | Existing committed moment |
| Lifecycle | Create | Interact / complete |
| Variants | `draft`, `source`, `ghost` | `read` (enhanced) |
| State machine | `useScheduling` | `useMomentComplete` etc. |
| Backend | `POST /moments` | `POST /moments/{id}/complete` |

Same row component, two independent feature surfaces. Keeping the doc folders separate prevents the briefs and plans from blurring into each other as both grow.

## Other files

- [`review-log.md`](./review-log.md) — running notes from review conversations.
- `image.png` — current screenshot used during a recent review pass.
- `.private/` — superseded drafts kept for reference; do not edit.
