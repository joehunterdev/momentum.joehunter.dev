# Momentum — Claude Code instructions

The Laravel Boost guidelines (ecosystem versions, conventions, Boost MCP tool
usage, PHP/Inertia/Pint/test rules) apply to this project. They are the shared
source of truth for every agent:

@AGENTS.md

## Boost MCP is available to you

This project registers the Laravel Boost MCP server (`.mcp.json` →
`php artisan boost:mcp`). Prefer Boost tools over manual shell/file work:

- `search-docs` — version-specific Laravel/Inertia/Tailwind docs. Use it BEFORE
  writing framework code.
- `application-info`, `database-schema`, `database-query` — inspect the app and
  DB read-only instead of guessing.
- `last-error`, `read-log-entries`, `browser-logs` — investigate failures. Logs
  live in `storage/logs/laravel.log` (backend) and `storage/logs/browser.log`
  (frontend, posted to `/_boost/browser-logs`).
- `get-absolute-url` — resolve project URLs (app runs at
  `http://momentum.joehunter.localhost`).

If the Boost tools are not loaded, the MCP server is registered in `.mcp.json`;
re-approve it, or run `claude mcp add -s local -t stdio laravel-boost php artisan boost:mcp`.

## Skills

Activate the relevant skill before working in its domain (see "Skills
Activation" in @AGENTS.md). In addition to the Boost skills:

- **`debugging-with-boost`** — the project debugging playbook. Activate whenever
  a feature "doesn't work", a save fails, or you need to confirm a fix in the
  real app. It covers reproducing in a **visible (headed) browser** so the user
  can watch, reading backend + browser logs via Boost, and using Tinker/Pail.

## House rules for this repo

- **Verify changes in the running app with a headed Playwright session** when a
  fix touches user-facing behaviour — the user wants to SEE it work, not just
  read that tests passed. See the `debugging-with-boost` skill.
- Do **not** write automated tests unless asked. If you do, use a **file-based
  SQLite** database (e.g. `database/testing.sqlite`), not `:memory:`.
- Backend failures should be greppable in the logs: form-request validation
  failures and moment create/update now log to `storage/logs/laravel.log`.
