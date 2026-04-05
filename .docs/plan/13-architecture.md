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
- Daily view 
    - here we have start to end of day with slots for each habit to check off
- Weekly view
    - here is where we can tap into a day or get an overview or configure habits
- Dashbaord or Overview
    - See E:\www\momentum.joehunter.dev\.docs\.private\screens\overview.webp
- Config: