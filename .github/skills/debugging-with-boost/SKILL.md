---
name: debugging-with-boost
description: "Project debugging playbook for the Momentum app. Activate whenever something 'doesn't work', a save/form fails, a created record doesn't appear, a request errors, or you need to CONFIRM a fix in the real running app. Drives Laravel Boost MCP tools (last-error, read-log-entries, browser-logs, database-query/schema, search-docs) plus a VISIBLE (headed) Playwright browser so the user can watch, and Tinker/Pail for backend visibility."
license: MIT
metadata:
  author: project
---

# Debugging with Boost — Momentum Project

The goal of this skill: **find the real cause with evidence, then prove the fix
by watching it work in a real browser** — never "it should work" or "tests pass"
alone. The user wants to SEE the behaviour.

This is the source-of-truth copy under `.ai/skills/`. Boost redistributes it to
each agent (`.claude/skills/`, `.github/skills/`) on `php artisan boost:update`.
Edit it here, then re-run `boost:update` (or keep the agent copies in sync).

## When to apply

- A user reports "I did X, hit save, and nothing happened / it didn't save."
- A created/edited record doesn't show up where expected.
- A request errors (500/422/419/503) or a page throws in the browser.
- You changed user-facing behaviour and need to confirm it in the running app.
- Before finalising ANY frontend or controller fix.

## Golden rule learned the hard way: failures can be silent

Inertia `router.post(...)` handlers in this app often have an `onError` that
**clears state without surfacing the message** (e.g. the daily quick-create in
`useScheduling.ts`). A rejected `422` then looks like "nothing happened."

So **never trust the UI's silence** — go to the evidence:

1. **`last-error`** (Boost) or tail `storage/logs/laravel.log` — backend
   exceptions and **validation failures** (Store/UpdateMomentRequest now log
   `*** validation failed` with the failing fields + input).
2. **`browser-logs`** (Boost) or `storage/logs/browser.log` — frontend console
   errors and failed network requests. The app posts these to
   `/_boost/browser-logs`. Only recent entries matter; ignore old ones.
3. **`database-query`** (Boost) — did the row actually persist?
   e.g. `select id, name, icon, created_at from moments order by id desc limit 5`.

## The investigation loop (Boost-first)

Prefer Boost MCP tools over manual shell/file reads.

1. **Reproduce the user's exact path** (see headed Playwright below). Reproduce
   on the **same device shape** they reported — they use **iPhone SE, 375×667**.
2. **Read the evidence** with `last-error` → `read-log-entries` → `browser-logs`.
   Correlate the frontend error with the backend log by timestamp.
3. **Check the data** with `database-query` / `database-schema` to see whether
   the write happened and what the column constraints are (don't assume).
4. **Check the docs** with `search-docs` before changing framework code — it
   returns version-pinned Laravel/Inertia/Tailwind docs. Use broad topic
   queries, no package names (package versions are already known to Boost).
5. **Probe in app context** with Tinker for one-off checks (single quotes to
   avoid shell expansion):
   `php artisan tinker --execute 'App\Models\Moment::latest()->first();'`
6. **Watch logs live** while reproducing: `php artisan pail` (or
   `php artisan pail --filter='Moment'`). `composer run dev` runs Pail in a pane.

## Watch it in a REAL, visible browser (required for UI fixes)

The user wants to see the fix work. Drive Playwright **headed**, not headless.

**Run the app** so it's reachable at the Playwright base URL
(`http://momentum.joehunter.localhost`, see `playwright.config.ts`):

- `npm run hot` — artisan serve on :80 + Vite + opens Chrome, OR
- `composer run dev` — artisan serve (:8000) + queue + **Pail** + Vite. If you
  use this, pass a base URL override (below) because it serves on :8000.

**Log in** with the seeded test user (from `.env`):
`TEST_EMAIL` / `TEST_PASSWORD` (currently `lesleybeddows30@hotmail.com`).

**Headed reproduction options:**

```bash
# Headed run of a spec, mobile viewport, slow enough to watch:
npx playwright test path/to/repro.spec.ts --headed --project=chromium

# Step through interactively (inspector) — great for "show me":
PWDEBUG=1 npx playwright test path/to/repro.spec.ts --project=chromium

# Or the Playwright UI runner:
npx playwright test --ui
```

For a quick one-off (no spec file), a headed script reads clearly:

```ts
import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch({ headless: false, slowMo: 300 });
const ctx = await browser.newContext({ ...devices['iPhone SE'] }); // 375×667
const page = await ctx.newPage();
await page.goto('http://momentum.joehunter.localhost/login');
// ...log in with TEST_EMAIL/TEST_PASSWORD, then reproduce the user's path
```

**To detect layout/overflow bugs** (e.g. modal spilling past the viewport),
in-page assert against the viewport width:

```ts
const overflow = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  return [...document.querySelectorAll('*')]
    .filter(el => el.getBoundingClientRect().right > vw + 1)
    .map(el => ({ tag: el.tagName, cls: (el.className||'').toString().slice(0,40),
                  right: Math.round(el.getBoundingClientRect().right), vw }));
});
```

## Assets: if a frontend change doesn't show

The app may be in Vite **hot** mode (a `public/hot` file points to the dev
server). If Vite isn't running you'll get a blank/unmounted app. Either run
`npm run dev`/`npm run hot`, or temporarily move `public/hot` aside to fall back
to the built manifest in `public/build`. **If you move `public/hot`, restore it
afterwards.**

## Cleanup & house rules

- **Do not leave throwaway repro specs/scripts behind** — delete them when done
  (and remove `test-results/`, screenshot dirs you created).
- **Do not write automated tests unless the user asks.** The user tests
  manually. If you must write a test, use a **file-based SQLite** DB
  (`database/testing.sqlite`), not `:memory:`.
- **Restore anything you toggled** (`public/hot`, background `php artisan serve`
  you started, etc.).
- Report outcomes faithfully: if you couldn't reproduce, say so; if the log
  shows the cause, quote the relevant line.

## Adding visibility (debug logging)

When a controller path is hard to observe, add a structured log and read it back
via Boost. Logs go to `storage/logs/laravel.log` (channel `stack`→`single`).

**Naming convention: every log message starts with `[Controller@method]`** so it
can be grepped / filtered by owner (`php artisan pail --filter='MomentController'`
or `grep '\[DailyController@index\]' storage/logs/laravel.log`). Form requests
are tagged with the controller action they guard, not the request class.

```php
use Illuminate\Support\Facades\Log;
Log::debug('[DailyController@index] view built', ['user_id' => $user->id, 'moments_loaded' => $moments->count()]);
```

Already wired for moments:
- `StoreMomentRequest` / `UpdateMomentRequest` →
  `[MomentController@store|update] validation failed` with errors + input
  (catches silent 422s).
- `MomentController@store|update` → `[MomentController@store|update] moment
  created|updated` with id + schedule.
- `DailyController@index` → `[DailyController@index] view built` (loaded vs.
  placed counts) — useful for "created a moment but it doesn't show."
