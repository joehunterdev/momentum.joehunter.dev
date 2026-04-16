# 🎨 Frontend Styling Guidelines – React + TypeScript + SCSS

## 🎯 Goal

Establish a **scalable, maintainable styling system** that aligns with:

* Feature-based architecture
* React component model
* Inertia (Laravel Breeze)
* KISS & DRY principles

---

# 🧠 Core Philosophy

> **Styles follow features, not global folders**

* Co-locate styles with components
* Keep global styles minimal and foundational
* Avoid cross-feature dependencies (same rule as TypeScript)

---

# 🧱 Project Structure (Styling)

```
resources/js/
├── features/
│   ├── example/
│   │   ├── components/
│   │   │   ├── ExampleCard/
│   │   │   │   ├── ExampleCard.tsx
│   │   │   │   ├── ExampleCard.scss
│   │   │   │   └── _example-card.tokens.scss (optional)
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── index.ts
│
├── shared/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.scss
│
├── styles/
│   ├── abstracts/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── _functions.scss
│   │
│   ├── tokens/
│   │   ├── _colors.scss
│   │   ├── _spacing.scss
│   │   └── _zindex.scss
│   │
│   ├── base/
│   │   ├── _reset.scss
│   │   ├── _typography.scss
│   │   └── _globals.scss
│   │
│   └── main.scss
```

---

# 📏 Rules

## 1. 🧩 Feature-Based Styling (STRICT)

* Every component MUST have a co-located `.scss` file

✅ Correct:

```
features/moments/components/MomentCard/MomentCard.scss
```

❌ Incorrect:

```
styles/components/_moment-card.scss
```

---

## 2. 🚫 No Cross-Feature Styling Dependencies

* Features must NOT import styles from other features

❌ Avoid:

```scss
@use '@/features/auth/styles';
```

✔ If shared → move to `shared/` or `styles/`

---

## 3. 🌍 Global Styles = Infrastructure Only

The `styles/` folder is LIMITED to:

### `abstracts/`

* Variables
* Mixins
* Functions
* ❗ Must NOT output CSS

### `tokens/`

* Design tokens (colors, spacing, z-index)
* Exposed as CSS variables

### `base/`

* Reset
* Typography
* Global defaults

🚫 Never put component styles here

---

## 4. 🎯 Use CSS Variables (REQUIRED)

Define global tokens:

```scss
:root {
  --color-primary: #4f46e5;
  --spacing-md: 1rem;
}
```

Use in components:

```scss
.button {
  padding: var(--spacing-md);
  background: var(--color-primary);
}
```

👉 This avoids SCSS import dependencies

---

## 5. 🧱 BEM Naming Convention (MANDATORY)

Use structured class naming:

```scss
.card {}
.card__header {}
.card--active {}
```

❗ Do NOT rely on nested selectors without clear naming

---

## 6. 🪶 Keep Styles Simple

* No logic in SCSS
* No conditional complexity
* No over-nesting

---

## 7. 📄 Pages Are Styling-Light

* Pages should NOT contain heavy styling
* Pages compose components

---

## 8. 🔁 Shared Components Own Their Styles

* Components in `shared/` must include their own `.scss`
* Do NOT style shared components from features

---

## 9. 📦 Import Rules

### Global (once only)

```ts
import '@/styles/main.scss'
```

### Component-level

```ts
import './Button.scss'
```

❌ Do NOT import global SCSS into components

---

## 10. 🧩 Optional: Component Tokens

For complex components:

```
Button/
├── Button.tsx
├── Button.scss
└── _button.tokens.scss
```

Use for:

* Component-specific variables
* Variants
* Theming

---

# ⚖️ Alignment with Architecture

| Architecture Rule | Styling Equivalent              |
| ----------------- | ------------------------------- |
| Feature isolation | No cross-feature SCSS           |
| Shared discipline | Shared styles only in `shared/` |
| Hooks = logic     | SCSS = presentation only        |
| Thin pages        | Minimal page styling            |

---

# 🚫 Anti-Patterns (STRICT)

## ❌ Recreating 7-1 Inside React

```
styles/components/
styles/pages/
```

➡ Breaks feature isolation

---

## ❌ Global Utility Explosion

```
.mt-1, .mt-2, .mt-3...
```

➡ Avoid recreating Tailwind poorly

---

## ❌ SCSS Imports Everywhere

```scss
@import 'variables';
```

➡ Leads to tight coupling

---

## ❌ Styling in Pages

➡ Violates architecture rules

---

## ❌ Cross-Feature Styling

➡ Breaks modularity

---

# 🚀 Summary (Follow These First)

1. Co-locate styles with components
2. No cross-feature dependencies
3. Global styles are minimal
4. Use CSS variables for shared values
5. Keep pages thin and styling-light

---

# 🤖 Copilot Guidance

When generating styling code:

* Place styles inside the **same folder as the component**
* Use **BEM naming**
* Prefer **CSS variables over SCSS imports**
* Do NOT create global component styles
* Do NOT import styles across features
* Keep styles simple and readable
* Follow feature-based structure strictly

---

This document defines the **default styling standard**.
Deviations must be intentional and justified.
