````md
# Laravel + Inertia + React Best Practices Checklist

A practical checklist for building scalable, maintainable Laravel + Inertia.js + React applications.

---

# Architecture & Philosophy

## Core Principles

- [ ] Treat Laravel as the application core
- [ ] Keep business logic on the backend
- [ ] Use React primarily for UI and interaction
- [ ] Avoid duplicating backend architecture in frontend state
- [ ] Embrace the “modern monolith” approach
- [ ] Keep frontend and backend in a single repository
- [ ] Prefer server-driven workflows over SPA-style orchestration
- [ ] Avoid unnecessary API-first architecture unless required

---

# Project Structure

## Frontend Organization

- [ ] Organize frontend code by domain/feature
- [ ] Separate reusable UI from domain components
- [ ] Use clear folder boundaries:
  - [ ] `common/`
  - [ ] `modules/`
  - [ ] `pages/`
- [ ] Keep Inertia pages thin
- [ ] Extract reusable logic into modules
- [ ] Use nested layouts appropriately

Example:

```txt
resources/js/
├── common/
├── modules/
├── pages/
└── app.tsx
````

---

# Naming Conventions

* [ ] Use PascalCase for components
* [ ] Use camelCase for utilities/hooks
* [ ] Use kebab-case for directories
* [ ] Suffix page components with `Page`

Examples:

```txt
CreateProjectPage.tsx
generateSlug.ts
user-profile/
```

---

# Component Design

## UI Architecture

* [ ] Separate UI primitives from application components
* [ ] Keep components focused and composable
* [ ] Prefer named exports
* [ ] Avoid massive page components
* [ ] Avoid deep prop drilling
* [ ] Avoid barrel exports where possible

Recommended split:

```txt
common/ui/
modules/projects/components/
```

---

# Laravel Backend Standards

## Controllers

* [ ] Keep controllers thin
* [ ] Move business logic into:

  * [ ] Services
  * [ ] Actions
  * [ ] Domain classes
  * [ ] Jobs
* [ ] Keep controllers orchestration-focused

---

## Validation

* [ ] Use Laravel Form Requests
* [ ] Keep validation authoritative on backend
* [ ] Use frontend validation only for UX enhancement
* [ ] Standardize form validation handling

---

## DTOs / Resources

* [ ] Avoid exposing raw Eloquent models
* [ ] Use DTOs or API Resources
* [ ] Generate TypeScript types where possible
* [ ] Create stable frontend contracts

Example:

```php
return Inertia::render('Projects/ShowPage', [
    'project' => ProjectData::from($project),
]);
```

---

# Inertia Patterns

## Data Flow

* [ ] Keep server as source of truth
* [ ] Avoid excessive frontend state management
* [ ] Avoid Redux-style architecture unless truly needed
* [ ] Send UI-ready props from backend

---

## Shared Props

* [ ] Keep shared props lightweight
* [ ] Share only global concerns:

  * [ ] auth user
  * [ ] flash messages
  * [ ] feature flags
  * [ ] locale
  * [ ] permissions
* [ ] Avoid large shared datasets

---

## Partial Reloads

* [ ] Use partial reloads for filtering/searching
* [ ] Use `only`
* [ ] Use `preserveState`
* [ ] Use `preserveScroll`

---

## Deferred Props

* [ ] Use deferred props for heavy data
* [ ] Defer charts and analytics
* [ ] Lazy-load expensive page sections
* [ ] Avoid blocking initial page render

---

## Payload Optimization

* [ ] Avoid oversized Inertia payloads
* [ ] Paginate aggressively
* [ ] Avoid unnecessary relationships
* [ ] Use `select()` intentionally
* [ ] Use lazy evaluation where possible

---

# React Best Practices

## State Management

* [ ] Keep React state minimal
* [ ] Use local state for:

  * [ ] modals
  * [ ] tabs
  * [ ] temporary UI state
* [ ] Avoid duplicating backend collections client-side
* [ ] Avoid giant frontend stores

---

## URL State

* [ ] Keep filters in query params
* [ ] Keep sorting in URLs
* [ ] Keep pagination URL-driven
* [ ] Ensure pages are refresh-safe/shareable

Example:

```txt
/projects?status=active&page=2
```

---

## Forms

* [ ] Standardize form handling
* [ ] Use Inertia `useForm`
* [ ] Create reusable form primitives:

  * [ ] FormField
  * [ ] FormError
  * [ ] SubmitButton
* [ ] Standardize loading/error states

---

## Optimistic UI

* [ ] Use optimistic updates selectively
* [ ] Restrict optimistic UI to simple interactions
* [ ] Avoid optimistic flows for critical business logic

Good examples:

* [ ] toggles
* [ ] likes
* [ ] read states

---

## Error Handling

* [ ] Add React error boundaries
* [ ] Create graceful fallback UIs
* [ ] Prevent entire page crashes

---

## Code Splitting

* [ ] Lazy-load heavy components
* [ ] Split admin-only functionality
* [ ] Split analytics/charts/maps/editors
* [ ] Avoid giant frontend bundles

Example:

```tsx
const HeavyChart = lazy(() => import('./HeavyChart'))
```

---

# Authentication & Authorization

## Permissions

* [ ] Enforce permissions on backend
* [ ] Mirror permissions in frontend for UX
* [ ] Use Laravel Policies/Gates
* [ ] Share permissions explicitly via props

Example:

```php
permissions: [
    'canUpdateProject' => ...
]
```

---

## Routing

* [ ] Use named routes
* [ ] Avoid hardcoded URLs
* [ ] Use Ziggy or route helpers

Example:

```tsx
route('projects.edit', project.id)
```

---

# Performance

## Database Performance

* [ ] Detect N+1 queries early
* [ ] Eager-load intentionally
* [ ] Profile queries regularly
* [ ] Use:

  * [ ] Telescope
  * [ ] Debugbar
  * [ ] Clockwork

---

## Pagination

* [ ] Prefer cursor pagination for large datasets
* [ ] Avoid giant infinite-scroll datasets
* [ ] Use segmented loading patterns

---

## SSR

* [ ] Evaluate SSR requirements
* [ ] Use SSR for:

  * [ ] SEO
  * [ ] marketing pages
  * [ ] public content
* [ ] Skip SSR for purely internal dashboards if unnecessary

---

# Type Safety

## TypeScript

* [ ] Use TypeScript throughout frontend
* [ ] Generate shared types from backend DTOs
* [ ] Avoid duplicated interface definitions
* [ ] Standardize prop typing

Recommended:

* [ ] Laravel Data
* [ ] Type transformers
* [ ] Zod validation

---

# Styling & UI

## Tailwind

* [ ] Use Tailwind CSS consistently
* [ ] Establish spacing/layout conventions
* [ ] Avoid inline one-off chaos
* [ ] Create reusable design primitives

---

## shadcn/ui

* [ ] Use shadcn/ui for velocity
* [ ] Wrap primitives into app-specific abstractions
* [ ] Avoid leaking low-level Radix APIs everywhere

---

# Testing

## Backend Testing

* [ ] Use feature tests heavily
* [ ] Test business workflows
* [ ] Test authorization
* [ ] Test validation

Recommended:

* [ ] Pest
* [ ] PHPUnit

---

## Frontend Testing

* [ ] Test critical UI interactions
* [ ] Test reusable components
* [ ] Test forms and validation states

Recommended:

* [ ] Vitest
* [ ] React Testing Library

---

## E2E Testing

* [ ] Add browser-level tests
* [ ] Test complete user flows
* [ ] Test auth flows
* [ ] Test critical business operations

Recommended:

* [ ] Playwright

---

# Scaling Patterns

## Domain Organization

* [ ] Organize by feature/domain
* [ ] Avoid giant generic component folders
* [ ] Keep domains isolated

Example:

```txt
modules/
├── billing/
├── projects/
└── users/
```

---

## Multi-Zone Applications

* [ ] Separate admin/client applications cleanly
* [ ] Share only common primitives
* [ ] Avoid cross-zone coupling

Example:

```txt
apps/
├── admin/
└── client/
```

---

# Infrastructure & Tooling

## Build System

* [ ] Use Vite
* [ ] Enable proper code splitting
* [ ] Configure caching correctly
* [ ] Monitor bundle size

---

## Monitoring

* [ ] Add error monitoring
* [ ] Track frontend exceptions
* [ ] Track backend failures

Recommended:

* [ ] Sentry
* [ ] Flare
* [ ] Bugsnag

---

## CI/CD

* [ ] Run tests automatically
* [ ] Run type checks
* [ ] Run linting
* [ ] Prevent broken deployments

---

# Documentation

## Team Standards

* [ ] Document folder structure
* [ ] Document naming conventions
* [ ] Document DTO conventions
* [ ] Document prop conventions
* [ ] Document form patterns
* [ ] Document testing expectations

---

# Anti-Patterns To Avoid

* [ ] Turning Inertia into a client-side SPA framework
* [ ] Massive global frontend stores
* [ ] Overusing shared props
* [ ] Huge serialized payloads
* [ ] Duplicating business logic in React
* [ ] Passing raw Eloquent models everywhere
* [ ] Fat controllers
* [ ] Hardcoded URLs
* [ ] Over-fetching relationships
* [ ] Over-engineered frontend abstractions

---

# Recommended Modern Stack

## Backend

* [ ] Laravel
* [ ] Pest
* [ ] Policies
* [ ] Queues
* [ ] DTOs / Laravel Data
* [ ] Actions / Services

---

## Frontend

* [ ] React
* [ ] TypeScript
* [ ] Tailwind CSS
* [ ] shadcn/ui
* [ ] Inertia.js 2.0
* [ ] Zod
* [ ] React Hook Form or useForm

---

## Tooling

* [ ] Vite
* [ ] Playwright
* [ ] SSR
* [ ] Sentry
* [ ] CI/CD pipelines

---

# Final Guiding Principle

* [ ] Keep complexity where Laravel excels
* [ ] Keep React focused on UX
* [ ] Prefer server-driven architecture
* [ ] Optimize payloads intentionally
* [ ] Build around domains and boundaries
* [ ] Scale through consistency rather than abstraction

```
```
