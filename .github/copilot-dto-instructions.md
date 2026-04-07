# Copilot Instructions – React + TypeScript (Feature-Based Architecture)

## 🎯 Goal

Build a **maintainable, scalable React + TypeScript application** using:

* Feature-based structure
* KISS (Keep It Simple)
* DRY (Don’t Repeat Yourself, but not prematurely)

---

# 🧱 Project Structure

This project uses **Laravel Breeze + Inertia**, so the structure is under `resources/js/`
with Breeze's capitalised conventions. Our additions use lowercase.

```
resources/js/
├── app.tsx                   # Inertia entry point (existing)
├── types/                    # Global types: User, PageProps
├── Layouts/                  # App shells (Breeze — AuthenticatedLayout, GuestLayout)
├── Components/               # Breeze generic UI primitives
├── Pages/                    # Inertia page components (1:1 with routes)
├── features/                 # Business domains (our code)
│   ├── daily/                #   components/, hooks/, types.ts, index.ts
│   ├── moments/              #   components/, hooks/, types.ts, index.ts
│   └── config/               #   components/, types.ts, index.ts
└── shared/                   # Cross-feature: utils/, components/
```

> Breeze scaffolding (`Pages/Auth/`, `Pages/Profile/`, `Components/`) is not modified.
> New domain code lives in `features/` and is imported by thin `Pages/`.

---

# 🧠 Architecture Principles

## 1. Feature-Based Organization

* Group code by **business domain**, not by type.
* Each feature should be **self-contained**.

✅ Example:

```
features/auth/
features/products/
```

---

## 2. Clear Separation of Responsibilities

* **Components** → UI only
* **Hooks** → business logic
* **Services** → API + side effects
* **Types** → local to feature unless global

---

# 📏 Rules

## 🧩 Feature Isolation (STRICT)

* Features must NOT depend on other features

❌ Avoid:

```ts
import { something } from "@/features/products"
```

✅ If shared → move to `shared/`

---

## 🪶 Keep Components Simple

* Components should:

  * Render UI
  * Receive props
* No heavy logic or data fetching inside components

---

## 🧠 Use Hooks for Logic

* All business logic goes into **custom hooks**

✅ Example:

```ts
export const useProducts = () => {
  // logic here
}
```

---

## 🔌 API Calls (Inertia Context)

With Inertia there is **no separate API service layer** for most operations:

* **Form mutations** → `useForm` from `@inertiajs/react` or `router.post/put/delete`
* **JSON endpoints** (e.g. toggling a checkbox) → `axios.post()` in a hook

Only create a `services/` folder in a feature if you have multiple complex JSON
endpoints for that domain. For MVP this is unlikely.

✅ Example (hook handling a JSON call):

```ts
const toggle = (momentId: number, date: string) =>
    axios.post(route('moments.toggle', momentId), { date })
```

❌ Don't create `api.ts` wrappers for Inertia page routes — that's what `router.*` is for.

---

## 📦 Shared Folder Discipline

Only put code in `shared/` if:

* Used in **2+ features**
* Generic (not business-specific)

❌ Bad:

```
shared/userHelpers.ts
```

---

## 📄 Pages Are Thin

* Pages only:

  * Compose features
  * Handle routing-level concerns

❌ No business logic in pages

---

## 📦 Use Barrel Files (index.ts)

Each feature exposes a clean API:

```ts
export * from "./components"
export * from "./hooks"
```

---

## 🧬 Types Placement

* Keep types **close to usage**

✅ Good:

```
features/auth/types.ts
```

❌ Avoid global dumping:

```
shared/types.ts
```

---

## 🔁 DRY (Use Carefully)

* Don’t abstract too early
* Rule:

  * Duplicate 1–2 times → OK
  * Extract when pattern is stable

---

## ⚡ KISS (Prefer Readability)

✅ Prefer:

```ts
if (isLoading) return <Spinner />
```

❌ Avoid clever/compact code that reduces clarity

---

## 📁 File Size Limits

* Components: ~100–200 lines
* Hooks: single responsibility

➡️ Split when too large

---

## 🔄 Dependency Direction

Always follow:

```
types/  →  shared/  →  features/  →  Pages/  →  Layouts/
```

* `Pages/` import from `features/` and `shared/` — never the reverse.
* `features/` import from `shared/` and `types/` — never from other features.
* `Layouts/` wrap `Pages/` — they don't import feature code.

❌ Never reverse this flow.

---

## 🧪 Testing Strategy

* Hooks → unit tests
* Services → API tests
* Components → rendering tests

Keep tests close to files:

```
useAuth.test.ts
```

---

## 🧹 Naming Conventions

* Hooks → `useSomething`
* Components → `Something.tsx`
* Services → `somethingApi.ts` or `somethingService.ts`

---

## 🚫 Avoid "God Folders"

Avoid growing generic folders like:

```
utils/
helpers/
common/
```

➡️ Move logic back into features when possible

---

# 🧩 Example Feature Structure

```
features/auth/
├── components/
│   └── LoginForm.tsx
├── hooks/
│   └── useLogin.ts
├── services/
│   └── authApi.ts
├── types.ts
└── index.ts
```

---

# 🚀 Summary (Follow These First)

1. Feature-based structure
2. Logic in hooks, not components
3. Strict shared folder discipline
4. Thin pages
5. Avoid premature abstraction

---

# 🤖 Copilot Guidance

When generating code:

* Place new logic inside the **correct feature folder** under `resources/js/features/`
* Pages go in `resources/js/Pages/` — thin shells that compose feature components
* Prefer **hooks over inline logic**
* Use `useForm` from `@inertiajs/react` for form state — not manual `useState`
* Use `route()` (Ziggy) for all URLs — never hardcode paths
* Do NOT introduce cross-feature dependencies
* Reuse from `shared/` only when appropriate
* Keep code simple and readable over clever
* Type all component props — import types from `features/*/types.ts`

---

# ❗ Anti-Patterns to Avoid

* Fetching data directly inside components
* Large multi-purpose hooks
* Global "utils" dumping ground
* Tight coupling between features
* Over-abstraction too early
* Syncing Inertia props into `useState` via `useEffect`
* Using `fetch()` instead of `axios` (CSRF is pre-configured on axios)
* Hardcoding URL strings instead of `route()` helper
* Creating API service files for Inertia page routes
* Putting domain components in `Components/` (that's for Breeze generics)

---

This document defines the **default standard**.
Deviations should be intentional and justified.


Tried to cleanly replace the DTO section in your canvas, but the pattern didn’t match the existing document structure (likely because the headings differ slightly from what I expected). I didn’t want to risk partially corrupting it.

Here’s the **ready-to-paste Copilot instructions section** for DTOs—drop this into your doc under the backend section:

---

## 1. Backend DTOs (Laravel - spatie/laravel-data)

### Purpose

DTOs define the exact shape of data sent to the frontend. They act as a strict contract between Laravel and Inertia.

---

### Core Rules (KISS + DRY)

* DTOs are the **single source of truth for frontend data**
* Never expose Eloquent models directly
* Only include fields the UI actually needs
* Avoid duplicating model structure “just in case”

---

### When to Create a DTO

Create a DTO when:

* Data is returned to Inertia pages
* Data combines multiple models
* Data needs formatting (dates, enums, computed fields)

Avoid DTOs when:

* Returning simple, internal-only data
* The structure is trivial and not reused

---

### DTO Design Rules

* Keep DTOs **flat and minimal**
* Prefer explicit fields over deep nesting
* Only use nested DTOs if it improves clarity

```php
class HabitData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public bool $completed,
        public string $created_at,
    ) {}
}
```

---

### Mapping Rules

* Always map from models:

  * `HabitData::from($model)`
  * `HabitData::collection($models)`

* Never pass raw models to Inertia

---

### Type Safety Rules

* Use strict types (`int`, `string`, `bool`)
* Avoid `mixed`
* Avoid nullable unless truly needed

---

### Avoid Over-Typing

❌ Bad:

* DTO identical to model
* Fields added “just in case”
* Deep nesting without UI need

✅ Good:

* Matches exactly what frontend uses
* Minimal and intentional

---

### Relationship Handling

* Only include relationships if needed
* Always transform relations into DTOs

```php
class HabitData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public ?UserData $user,
    ) {}
}
```

---

### Naming Conventions

* Use `*Data` suffix:

  * `HabitData`
  * `UserData`

* One DTO per concept

---

### TypeScript Integration

* Generate TS types from DTOs
* Frontend must use generated types
* Never redefine types manually

---

### Golden Rule

If changing a DTO breaks the frontend → that’s correct.

DTOs are contracts, not helpers.

---
 