<p align="center">
  <img src="public/logo_75.png" alt="Momentum" width="75" />
</p>

<h1 align="center">Momentum</h1>
<p align="center"><strong>Build momentum, one habit at a time.</strong></p>
<p align="center">
  A behaviour-science-backed habit tracker built with Laravel, React & Inertia
  <br />
  <a href="https://momentum.joehunter.dev">momentum.joehunter.dev</a> &middot;
  Built by <a href="https://joehunter.es">Joe Hunter</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-13-FF2D20?style=flat&logo=laravel&logoColor=white" alt="Laravel 13" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Inertia.js-v2-8B5CF6?style=flat" alt="Inertia v2" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PHP-8.4-777BB4?style=flat&logo=php&logoColor=white" alt="PHP 8.4" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat" alt="MIT License" />
</p>

---

## What is Momentum?

Momentum is a habit-tracking web application built on the behaviour science behind lasting change — cue-routine-reward loops, habit stacking, implementation intentions, and environment design.

It's not a checklist. It's a **scheduling and design system** for the habits that matter.

**Live:** [momentum.joehunter.dev](https://momentum.joehunter.dev)

---

## Features

| Feature | Description |
|---|---|
| **Weekly View** | See all habits across 7 days in 30-min slots, colour-coded by completion status |
| **Consistency tracking** | Per-habit completion % over the last 28 days, calculated server-side |
| **Moment Builder** | Define habits with cues, stacks, environment prompts & rewards |
| **Habit Stacking** | Chain habits together with the proven after-X-do-Y formula |
| **Flexible Config** | Customisable wake/sleep times and office hours |
| **Bilingual content** | SEO content pages in English & Spanish (`/en/`, `/es/`) |
| **SSR + SEO** | Full server-side rendering via Inertia v2 + dynamic sitemap |
| **Type-safe DTOs** | `spatie/laravel-data` DTOs auto-generate TypeScript interfaces via `php artisan typescript:transform` |

---

## Tech Stack

### Backend
- **Laravel 13** (PHP 8.4) — routing, Eloquent ORM, queues, auth
- **MySQL** — primary datastore
- **Laravel Breeze** — authentication scaffolding
- **Laravel Sanctum** — API token auth
- **spatie/laravel-data** — typed DTOs with auto-generated TypeScript interfaces

### Frontend
- **React 18** + **TypeScript** (strict)
- **Inertia.js v2** — server-driven SPA with SSR
- **Vite** — bundler with rolldown, SSR client + server builds
- **Tailwind CSS v3** — layout utilities
- **Custom SCSS design system** — `_drop-border.scss`, `_components.scss`, `_content.scss`

### Design System
- Brand tokens: `--mm-drop-green: #00E5AA`, `--mm-drop-purple: #604C81`
- Hard-offset cube drop-shadow mixin (`mm-drop-border`) replicating the logo's cube effect
- Square corners throughout — no border-radius
- Hybrid Tailwind (structure) + SCSS (component styles) approach

---

## Project Structure

```
app/
├── Data/                        # spatie/laravel-data DTOs (source of truth for frontend types)
├── Enums/                       # Backed PHP enums → TypeScript union types
resources/
├── js/
│   ├── Pages/
│   │   ├── Welcome.tsx          # Marketing homepage
│   │   ├── Content/Show.tsx     # Reusable SEO content page renderer
│   │   ├── Weekly/              # Weekly overview
│   │   ├── Moments/             # Habit CRUD
│   │   └── Config/              # User configuration
│   ├── features/                # Feature-scoped components & hooks
│   └── types/
│       └── generated.d.ts       # Auto-generated from DTOs — do not edit
├── css/
│   ├── _drop-border.scss        # Brand drop-shadow token + mixin
│   ├── _components.scss         # Global UI components
│   ├── _welcome.scss            # Marketing page styles
│   └── _content.scss            # SEO content page styles
└── content/
    ├── en/                      # English content JSON files
    └── es/                      # Spanish content JSON files
```

---

## Content Pages (EN/ES)

Pages are driven by JSON files in `resources/content/{locale}/` and rendered via a single `ContentController` + `Content/Show.tsx` component.

| Route | EN | ES |
|---|---|---|
| About | `/en/about` | `/es/sobre-nosotros` |
| Features | `/en/features` | `/es/funcionalidades` |
| Weekly View | `/en/weekly-habit-view` | `/es/vista-semanal-habitos` |
| Daily Schedule | `/en/daily-habit-schedule` | `/es/horario-diario-habitos` |
| Habit Stacking | `/en/habit-stacking` | `/es/apilamiento-habitos` |
| Pricing | `/en/pricing` | `/es/precios` |
| Hire me | `/en/hire-developer` | `/es/contratar-desarrollador` |
| Blog: Build better habits | `/en/how-to-build-better-habits` | `/es/como-crear-mejores-habitos` |
| Blog: Best habit apps | `/en/best-habit-tracking-apps` | `/es/mejores-apps-seguimiento-habitos` |
| Blog: Building a SaaS | `/en/building-a-saas-with-laravel-react` | `/es/construir-saas-con-laravel-react` |

All content pages include:
- Full Open Graph + Twitter Card meta tags
- `hreflang` alternate links
- Canonical URLs
- Included in the dynamic `/sitemap.xml`

---

## Local Development

```bash
# Clone and install
git clone https://github.com/joehunterdev/momentum.joehunter.dev.git
cd momentum.joehunter.dev
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate --seed

# Dev server
composer run dev
# or separately:
php artisan serve
npm run dev

# Regenerate TypeScript types after changing any app/Data or app/Enums class
php artisan typescript:transform
```

### Virtual Host Setup

The app expects `http://momentum.joehunter.local` by default (`APP_URL` in `.env`).

**Apache** — add to `httpd-vhosts.conf` (or your distro's equivalent):

```apache
<VirtualHost *:80>
    ServerName momentum.joehunter.local
    DocumentRoot "C:/path/to/momentum.joehunter.dev/public"
    <Directory "C:/path/to/momentum.joehunter.dev/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

**Hosts file** — add to `C:\Windows\System32\drivers\etc\hosts` (Windows) or `/etc/hosts` (macOS/Linux):

```
127.0.0.1  momentum.joehunter.local
```

Then restart Apache and visit `http://momentum.joehunter.local`.

> **Tip:** If you prefer a different local domain, update both the hosts file entry and `APP_URL` in your `.env`.

---

## SEO

- Dynamic sitemap at `/sitemap.xml` — auto-includes all content pages
- `public/og-image.png` — 1200×630 branded OG image
- Per-page meta via Inertia `<Head>` component with `head-key` deduplication
- `hreflang` tags on all bilingual content pages
- `robots.txt` with Sitemap directive and app routes disallowed

---

## About the developer

Built by **Joe Hunter** — full-stack developer based in Spain.

- Portfolio: [joehunter.es](https://joehunter.es)
- Stack: Laravel, React, TypeScript, AI integrations
- Open to freelance & contract work

---

## License

MIT — see [LICENSE](LICENSE)
