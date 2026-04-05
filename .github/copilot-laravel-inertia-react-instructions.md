# Copilot Instructions – Laravel + Inertia + React + TypeScript

## 🎯 Goal

Build a **clean, scalable full-stack application** using:

* Laravel (backend, domain logic)
* Inertia (transport layer)
* React + TypeScript (frontend UI)

Principles:

* KISS (Keep It Simple)
* DRY (Avoid premature abstraction)
* Clear backend/frontend boundaries

---

# 🧱 Project Structure

## Backend (Laravel)

```
app/
├── Actions/
├── Http/
│   ├── Controllers/
│   └── Requests/
├── Models/
├── Services/
└── Policies/
```

## Frontend (resources/js)

```
resources/js/
├── app.tsx                   # Inertia entry point
├── ssr.tsx                   # SSR entry point
├── bootstrap.ts              # Axios setup
├── types/                    # Global TS types (User, PageProps)
├── Layouts/                  # AuthenticatedLayout, GuestLayout
├── Components/               # Breeze generic UI (TextInput, Modal, etc.)
├── Pages/                    # Inertia pages — map 1:1 to routes
│   ├── Daily/
│   ├── Moments/
│   ├── Config/
│   └── Auth/                 # Breeze (don't modify)
├── features/                 # Domain logic (components, hooks, types)
│   ├── daily/
│   ├── moments/
│   └── config/
└── shared/                   # Cross-feature utils & components
```

> **Note**: Breeze uses capitalised `Pages/`, `Components/`, `Layouts/`.
> Our additions (`features/`, `shared/`) use lowercase — this is intentional to
> visually distinguish framework scaffolding from app code.

---

# 🧠 Architecture Principles

## 1. Backend Owns Business Logic

* Laravel handles:

  * Validation
  * Authorization
  * Data manipulation

❌ Do NOT move business logic into React

---

## 2. Inertia = Thin Transport Layer

* Controllers return data
* Pages receive props

```php
return Inertia::render('Dashboard', [
    'users' => User::all()
]);
```

---

## 3. Frontend = UI + Interaction

* React handles:

  * Rendering
  * UI state
  * Minor transformations only

---

# 📏 Frontend Rules (React + TS)

## 🧩 Feature-Based Structure

* Same as SPA setup
* Features are isolated

---

## 🪶 Components

* UI only
* No API calls directly

---

## 🧠 Hooks

* Handle UI logic
* NOT backend logic

---

## 🔌 API Calls

* **Inertia mutations** → `router.post()`, `router.put()`, `router.delete()`
  These return redirects and trigger a full Inertia page visit.

```ts
router.post(route('moments.store'), data)
```

* **JSON endpoints** → `axios.post()` when the backend returns JSON (not an Inertia page).
  Use this for actions that update local state without a page reload (e.g. toggling a checkbox).

```ts
axios.post(route('moments.toggle', momentId), { date })
    .then(res => updateLocalState(res.data))
```

* ❌ Never use `fetch()` — axios is already configured with CSRF.
* ❌ Never use `axios` for routes that return Inertia redirects — use `router.*` instead.

---

## 📄 Pages

* Map directly to Laravel routes
* Receive props from backend

---

# ⚠️ React Gotchas

## ❌ Overusing useEffect

* Avoid syncing props to state

❌ Bad:

```ts
useEffect(() => setUsers(props.users), [props.users])
```

✅ Good:

```ts
const users = props.users
```

---

## ❌ Derived State

* Compute instead of storing

---

## ❌ Massive Components

* Split into hooks + components

---

# 🔷 TypeScript Best Practices

## 🚫 Avoid `any`

## ✅ Type Props from Backend

```ts
type Props = {
  users: User[]
}
```

---

## ✅ Prefer Inference

---

## ✅ Handle Nulls

---

# 🎨 Styling (Tailwind)

* Use Tailwind as default
* Extract reusable components

---

# 🧹 Linting

* Airbnb ESLint
* Prettier

---

# 🧱 Backend Rules (Laravel)

## Controllers

* Thin — validate, delegate, return
* Inline validation is fine for MVP (no FormRequest needed until complex)
* Extract to Actions/Services when logic is reused or exceeds ~30 lines

---

## Requests (FormRequests)

* Use when validation rules are complex or reused across store/update
* For MVP: inline `$request->validate()` in controllers is acceptable

---

## Actions / Services

* Extract **when** a controller method exceeds ~30 lines or logic is shared
* Don't pre-create empty Action classes — YAGNI

---

## Models

* Keep lightweight
* Relationships, scopes, simple accessors are fine
* Avoid fat models — move complex query logic to Services or scoped query classes

---

# 🔄 Data Flow

```
Page loads:     Controller → Inertia::render → Page (props) → features/ components
Form submits:   Page → router.post/put/delete → Controller → redirect back
JSON actions:   Page → axios.post → Controller → JSON response → update local state
```

---

# 🤖 Copilot Rules

When generating code:

* Keep business logic in Laravel
* Keep React focused on UI
* Avoid `any` — type all props from `features/*/types.ts`
* Avoid unnecessary `useEffect` — derive from props instead
* Use Inertia `router.*` for form mutations, `axios` only for JSON endpoints
* Use `useForm` from `@inertiajs/react` for forms — not manual state
* Follow feature-based structure (`features/` for domain, `Pages/` for thin shells)
* Use `route()` helper (Ziggy) for all URLs — never hardcode paths
* Prefer Tailwind — no custom CSS files per component
* Pages go in `resources/js/Pages/` (capitalised, matching Inertia resolver)
* Feature code goes in `resources/js/features/` (lowercase)

---

# 🚨 Anti-Patterns

* Business logic in React (streaks, scheduling, auth checks)
* Duplicating validation frontend/backend — backend validates, frontend shows `errors`
* Overusing `useEffect` to sync props → state
* Using `any` or untyped props
* Fat controllers (>30 lines of logic — extract to Action/Service)
* Using `axios` for routes that return Inertia redirects
* Using `router.post()` for JSON-only endpoints
* Hardcoding URL strings instead of `route()` helper
* Putting domain components directly in `Pages/` instead of `features/`
* Cross-feature imports (`features/daily/` importing from `features/moments/`)

---

This is the default standard for Laravel + Inertia projects.
