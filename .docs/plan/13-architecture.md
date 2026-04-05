## 13) Architecture

## General:
- React / Typescript
- Laravel Breeze + Inertia (React/SSR)
- MySQL
- SCSS + Vite HMR
- Mobile ready
- Icon library (TBD: Heroicons / Lucide)

### 13.1 High-Level
- **Frontend**: React + Inertia (SPA-like), TypeScript
- **Backend**: Laravel 12, Breeze auth, Inertia SSR
- **DB**: MySQL
- **Auth**: Laravel Breeze (email/password)

### 13.2 App Layers
- **UI**: React pages + components
- **State**: Inertia props + local state
- **Domain**: moments, schedules, instances, cues, rewards
- **Data**: Eloquent models + migrations
- **Services**: Scheduling engine, streaks, analytics

### 13.3 Core Flows
- **Create moment** → store moment + cue + schedule
- **Render calendar** → build daily/weekly slots
- **Check off** → create/update momentInstance
- **Dashboard** → aggregate stats

### 13.4 Data Ownership
- User owns moments, schedules, instances
- Instances are immutable daily records
- Aggregates derived (streaks, totals)

### 13.5 System Concerns
- Timezone handling
- Scheduling edge cases
- Mobile performance
- Future notifications

### 13.6 Deployment
- Git actions
- **Repo**: https://github.com/joehunterdev/momentum.joehunter.dev

### 13.6 Development
- SCSS and Hot reloading

## 13.7 Views

- **Daily view** — Habits as rows, single day column with time slots (wake → sleep). Check off each habit per slot.
- **Weekly view** — Habits as rows, M T W T F S S columns (like the tracker grid). Tap a day to drill into daily view. Configure/add habits here.
- **Dashboard / Overview** — Monthly progress chart, streak counts, completion %, top habits, weekly breakdown donuts.
- **Config** — Wake/sleep hours, timezone, profile.
- **Create Moment** — Moment builder with cue, schedule, reward, identity fields.

## 13.8 Data Model (MVP)

### Entity Relationship

```text
User
 ├── has many → Moment
 │    ├── has one  → MomentSchedule (when/how often)
 │    ├── has one  → Cue (optional — implementation intention)
 │    ├── has one  → Reward (optional — satisfaction trigger)
 │    └── has many → MomentInstance (daily check-offs)
 └── has one  → UserConfig (wake, sleep, timezone)
```

> **Note**: Cues and Rewards are optional. A moment only requires a name + schedule.
> Identity statements are per-moment but not required — progressive disclosure.

### Tables

#### users (existing — updated)
| Column | Type | Notes |
|---|---|---|
| first_name | string | |
| last_name | string | |
| email | string | unique |
| role | string | default `user` — `super_admin`, `admin`, `user` |
| timezone | string | Default `Europe/Madrid` |

#### user_configs
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | unique |
| wake_time | time | e.g. `07:00` |
| sleep_time | time | e.g. `23:00` |
| week_starts_on | tinyint | 0=Sun, 1=Mon (default 1) |
| timestamps | | |

#### moments
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | |
| name | string | e.g. "Drink water" |
| description | text nullable | |
| color | string nullable | Hex color for UI |
| icon | string nullable | Icon identifier |
| identity_statement | string nullable | e.g. "I am a healthy person" |
| is_active | boolean | Default true |
| sort_order | int | Display ordering |
| timestamps | | |
| soft_deletes | | |

#### moment_schedules
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| moment_id | FK → moments | unique |
| frequency | enum | `daily`, `weekly`, `custom` |
| days_of_week | json nullable | e.g. `[1,2,3,4,5]` for weekdays |
| preferred_time | time nullable | Target time of day |
| timestamps | | |

#### cues
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| moment_id | FK → moments | unique |
| implementation_intention | string nullable | "I will [X] at [TIME] in [LOCATION]" |
| habit_stack_after | string nullable | "After I [existing habit]..." |
| environment_prompt | string nullable | e.g. "Book on table" |
| timestamps | | |

#### rewards
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| moment_id | FK → moments | unique |
| description | string nullable | What reward after completion |
| temptation_bundle | string nullable | Paired enjoyable activity |
| timestamps | | |

#### moment_instances
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| moment_id | FK → moments | |
| date | date | The day this instance belongs to |
| completed_at | timestamp nullable | When checked off (null = not done) |
| notes | text nullable | Optional reflection |
| timestamps | | |
| **unique** | moment_id + date | One instance per moment per day |

### Key Queries

- **Daily view**: `moment_instances WHERE date = today`, joined with `moments` → rows of habits, check/uncheck
- **Weekly view**: `moment_instances WHERE date BETWEEN monday AND sunday`, pivoted by day → the M T W T F S S grid
- **Dashboard**: `moment_instances` aggregated by week/month → completion %, streaks, progress over time
- **Streak calc**: Count consecutive days where `completed_at IS NOT NULL` for a given moment