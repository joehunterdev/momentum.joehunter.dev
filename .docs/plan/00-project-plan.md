# Project Planning — Momentum

## 1) Vision & USP
- **Goal**: moment tracker grounded in *Momentum* psychology.
- **USP**: moments + calendar + **psychology-first** setup (cue, craving, response, reward).
- **Success**: Users set cues, environment tweaks, and identity-based moments.
## 2) Target User
- Who is it for?
- Current pain points?
- Desired outcomes?

## 3) Core Concepts (Momentum)

- **Cue → Craving → Response → Reward**
- **Make it obvious / invisible**
- **Make it attractive / unattractive**
- **Make it easy / difficult**
- **Make it satisfying / unsatisfying**
- **Identity-based moments**



## 4) Product Principles-
- Low friction
- Calendar-first UI
- Psychology embedded in setup
- Small wins & immediate feedback
- For trademark issues avoid using any terms to do with Momentum

## 5) Key Features (MVP)
- Daily view with timeslots
- Weekly view + moment creation
- Monthly dashboard with streaks & charts
- moment creation: cue, trigger, reward, identity
- Config: wake, sleep, work hours

## 6) Psychology-Driven UX Ideas
- Cue checklist shown in calendar slot
- If–Then plan per moment
- Environment prompts (e.g., “Book on table”)
- Reward marker after completion
- Identity streaks (e.g., “I am a runner”)
- Friction slider (easy ↔ hard)
The 4 Laws of Behavior Change:
Make it Obvious (Cue): Use "implementation intentions" (I will [BEHAVIOR] at [TIME] in [LOCATION]) and "habit stacking" (stacking a new habit on an old one).
Make it Attractive (Craving): Use "temptation bundling" (pairing an action you need to do with one you want to do).
Make it Easy (Response): Reduce friction. Start with the "Two-Minute Rule" (your new habit should take less than two minutes to do).
Make it Satisfying (Reward): Use instant reinforcement. What is rewarded is repeated; what is punished is avoided.

## 7) Information Architecture
- **/daily** — schedule view
- **/weekly** — planning & moment setup
- **/dashboard** — metrics
- **/config** — user schedule
- **/create-moment** — moment builder

## 8) Data Model Draft
- User
- moment
  - Schedule
  - Instance
  - Cue
  - Reward
  - Identity

## 9) Technical Stack
- Laravel + React + Inertia
- Typescript
- MySQL
- Mobile-first UI
- Icon library

## 10) Milestones
- **M1**: Routes + basic UI shell
- **M2**: moment creation + schedule
- **M3**: Daily check-offs
- **M4**: Dashboard charts
- **M5**: Polish & mobile UX

## 11) Risks & Assumptions
- Time-blocking complexity
- moment scheduling edge cases
- UI overwhelm

## 12) Open Questions
- Offline support?
- Notifications?
- Privacy model?

## 13)

## 14) Doc Structure (suggested)
- `.docs/`
  - `project-planning.md` (this file)
  - `product-brief.md`
  - `ux-notes.md`
  - `data-model.md`
  - `api-notes.md`
  - `milestones.md`
  - `decisions.md`
