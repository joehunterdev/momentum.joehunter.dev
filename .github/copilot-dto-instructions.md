

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
 