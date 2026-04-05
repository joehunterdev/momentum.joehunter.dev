# Copilot Instructions – React + TypeScript (Feature-Based Architecture)

## 🎯 Goal

Build a **maintainable, scalable React + TypeScript application** using:

* Feature-based structure
* KISS (Keep It Simple)
* DRY (Don’t Repeat Yourself, but not prematurely)

---

# 🧱 Project Structure

```
src/
├── app/                # App setup (routing, providers)
├── features/           # Business domains (core logic)
├── shared/             # Reusable, generic code
├── pages/              # Route-level composition
├── styles/             # Global styles/theme
└── main.tsx
```

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

## 🔌 Services = API Only

* No React code
* No UI logic
* No state

✅ Example:

```ts
export const getProducts = () => api.get("/products")
```

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
shared → features → pages → app
```

❌ Never reverse this flow

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

* Place new logic inside the **correct feature folder**
* Prefer **hooks over inline logic**
* Do NOT introduce cross-feature dependencies
* Reuse from `shared/` only when appropriate
* Keep code simple and readable over clever

---

# ❗ Anti-Patterns to Avoid

* Fetching data directly inside components
* Large multi-purpose hooks
* Global “utils” dumping ground
* Tight coupling between features
* Over-abstraction too early

---

This document defines the **default standard**.
Deviations should be intentional and justified.
