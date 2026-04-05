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
├── app/
├── features/
├── shared/
├── pages/
├── layouts/
└── main.tsx
```

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

* Use Inertia router (not fetch/axios directly in most cases)

```ts
router.post('/users', data)
```

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

* Thin
* Delegate to Actions/Services

❌ Bad:

```php
// huge controller logic
```

---

## Requests

* Handle validation

---

## Actions / Services

* Contain business logic

---

## Models

* Keep lightweight
* Avoid fat models

---

# 🔄 Data Flow

```
Controller → Inertia → Page → Components
```

---

# 🤖 Copilot Rules

When generating code:

* Keep business logic in Laravel
* Keep React focused on UI
* Avoid `any`
* Avoid unnecessary `useEffect`
* Use Inertia router for mutations
* Follow feature-based structure
* Prefer Tailwind

---

# 🚨 Anti-Patterns

* Business logic in React
* Duplicating validation frontend/backend
* Overusing useEffect
* Using `any`
* Fat controllers

---

This is the default standard for Laravel + Inertia projects.
