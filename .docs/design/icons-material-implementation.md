# Material Icons + emoji-mart Implementation Plan

Sitewide icon system using:

- [**Google Material Icons — Sharp style**](https://fonts.google.com/icons?icon.style=Sharp) for all system / UI chrome (chevrons, close, view toggle, settings, edit, check, etc.).
- [**emoji-mart**](https://github.com/missive/emoji-mart) for the moment emoji picker and for rendering emojis throughout the app. emoji-mart provides the catalogue, the picker UI, and 5 swappable visual sets (Apple / Google / Twitter / Facebook / Native).

The current hand-rolled emoji catalogue ([resources/js/shared/constants/icons.ts](../../resources/js/shared/constants/icons.ts), 54 hardcoded entries) and the custom [IconPicker.tsx](../../resources/js/features/moments/components/IconPicker.tsx) panel are removed. Curation lives in a JSON file (data, not code), letting emoji-mart resolve names, keywords, search, and rendering.

---

## 1. Goals

1. Replace inline SVGs and hard-coded emoji UX glyphs (✓ ✕ ⚙️ ✏️ ⚠️ ✨) with Material Icons (Sharp).
2. Replace the hardcoded `MOMENT_ICONS` catalogue with emoji-mart data, sourced via a curated JSON file for our habit-app categories.
3. Replace the custom `IconPicker` panel with `@emoji-mart/react`'s picker.
4. Render emojis consistently across devices via emoji-mart's `<em-emoji>` web component (Twitter set by default).
5. Two parallel config knobs — `MATERIAL_STYLE` and `EMOJI_SET` — each switching the whole site at once.
6. **Non-breaking** rollout: existing `moments.icon` data (raw emoji codepoints in the DB) keeps working unchanged.
7. No emoji catalogues hardcoded in React. Curation = JSON. Names / keywords / search = library.

## 2. Why these libraries

### Material Icons → [`material-icons`](https://www.npmjs.com/package/material-icons) (npm)

- Self-hosted, ships all 5 styles as separate CSS files.
- Sharp style import: `import 'material-icons/iconfont/material-icons-sharp.css'`.
- ~80 kB woff2 for the active style only.
- Rejected: Google Fonts CDN (privacy/perf), `@mui/icons-material` (heavy peer deps), Material Symbols variable font (user's link is the classic set).

### Emoji catalogue + picker + renderer → [`emoji-mart`](https://github.com/missive/emoji-mart)

- De-facto React standard, MIT, active maintenance.
- Three pieces:
  - **`@emoji-mart/data`** — full emoji catalogue (names, categories, keywords, search index) as JSON. ~70 kB gzipped.
  - **`@emoji-mart/react`** — the picker UI (`<Picker>` component).
  - **`em-emoji` web component** (registered by `emoji-mart`'s `init({ data })` call) — renders a single emoji anywhere, with the chosen set. Use this **outside** the picker.
- 5 visual sets via `set="…"` prop: `apple` / `google` / `twitter` / `facebook` / `native`. Picks the parallel to Material's 5 styles.
- Built-in fuzzy search, keyword search, recently-used, skin-tone picker, accessibility.
- Custom categories defined via JSON (`{id, name, emojis: [{id, name, keywords}]}`) — exactly the shape we want.

### Rejected alternatives

| Lib | Verdict |
|---|---|
| `react-twemoji` | Renders Twemoji SVGs but no picker, no catalogue. emoji-mart's `<em-emoji set="twitter">` covers the same ground. |
| `emoji-picker-react` | Smaller, but no curated-category support, fewer set choices. |
| `unicode-emoji-json`, `node-emoji` | Data-only, no picker; would force us to keep a custom UI. |
| OpenMoji / Fluent UI Emoji | Smaller communities; emoji-mart already supports the major sets. |

## 3. Install

```bash
npm install material-icons @emoji-mart/data @emoji-mart/react emoji-mart
```

Four packages total. `emoji-mart` is the core (needed for `init()` and the web component); `@emoji-mart/data` is the catalogue; `@emoji-mart/react` is the picker.

[AGENTS.md:49](../../AGENTS.md#L49) requires dependency approval — confirm before installing.

## 4. Configuration

Single TS file for both knobs. No emoji data here — pure config.

### `resources/js/shared/config/icons.config.ts` (new)

```ts
// ── Material Icons (system / UI chrome) ────────────────────────────────
export type MaterialIconStyle =
  | 'filled' | 'outlined' | 'rounded' | 'sharp' | 'two-tone';

export const MATERIAL_STYLE: MaterialIconStyle = 'sharp';

export const MATERIAL_STYLE_CLASS: Record<MaterialIconStyle, string> = {
  'filled':    'material-icons',
  'outlined':  'material-icons-outlined',
  'rounded':   'material-icons-round',
  'sharp':     'material-icons-sharp',
  'two-tone':  'material-icons-two-tone',
};

// ── emoji-mart (moment emoji rendering) ────────────────────────────────
export type EmojiSet = 'apple' | 'google' | 'twitter' | 'facebook' | 'native';

export const EMOJI_SET: EmojiSet = 'twitter';
```

Switching style or set is a one-line edit in this file. Phase 5 (below) optionally lifts the values into per-user config.

### `resources/js/app.tsx` — boot-time imports

```ts
import 'material-icons/iconfont/material-icons-sharp.css';
import { init } from 'emoji-mart';
import emojiData from '@emoji-mart/data';
import momentEmojiCatalog from '@/shared/config/moment-emoji-catalog.json';
init({ data: emojiData, custom: momentEmojiCatalog });
```

`init()` registers the `<em-emoji>` web component globally and seeds the picker's catalogue.

## 5. The moment emoji catalogue → JSON (data, not code)

Curate the habit-app categories as a JSON file shaped exactly like emoji-mart's `custom` prop. Editing this file is editing data, not code — no rebuild concerns beyond Vite's HMR.

### `resources/js/shared/config/moment-emoji-catalog.json` (new)

Shape:

```json
[
  {
    "id": "health",
    "name": "Health",
    "emojis": [
      { "id": "droplet",      "name": "Water",    "keywords": ["water","hydration"] },
      { "id": "apple",        "name": "Apple",    "keywords": ["fruit","food"] },
      { "id": "green_salad",  "name": "Salad",    "keywords": ["food","veggie"] },
      { "id": "pill",         "name": "Vitamin",  "keywords": ["meds","supplement"] },
      { "id": "sleeping_face","name": "Sleep",    "keywords": ["rest","bed"] },
      { "id": "tooth",        "name": "Tooth",    "keywords": ["dental","brush"] },
      { "id": "heart",        "name": "Heart",    "keywords": ["love","cardio"] },
      { "id": "stethoscope",  "name": "Medicine", "keywords": ["doctor","health"] }
    ]
  },
  { "id": "fitness",  "name": "Fitness",  "emojis": [/* runner, weight_lifter, person_in_lotus_position, bike, swimmer, walking, cartwheeling, hiking_boot */] },
  { "id": "mind",     "name": "Mind",     "emojis": [/* lotus, books, memo, brain, pray, wind_blowing_face, cherry_blossom, mortar_board */] },
  { "id": "work",     "name": "Work",     "emojis": [/* computer, e-mail, handshake, book, writing_hand, clipboard, dart, mag */] },
  { "id": "social",   "name": "Social",   "emojis": [/* telephone_receiver, family_man_woman_girl, busts_in_silhouette, speech_balloon, couple_with_heart, open_hands */] },
  { "id": "creative", "name": "Creative", "emojis": [/* musical_note, art, camera, guitar, dancer, thread */] },
  { "id": "general",  "name": "General",  "emojis": [/* star, fire, white_check_mark, alarm_clock, moneybag, broom, cooking, seedling, sunny, crescent_moon */] }
]
```

`id` values are emoji-mart's shortcode IDs (resolvable via the `@emoji-mart/data` catalogue). `keywords` are optional; emoji-mart's data already carries default keywords — we only add ones that help our habit-tracking context.

The full file lists all 54 entries currently in `MOMENT_ICONS`. Generating it once is a mechanical translation (emoji → shortcode) — included as Appendix A below.

Bad-practice avoided: no emoji metadata in TS/TSX. Code references *IDs* only; the library owns names, search, rendering.

## 6. The `<Icon>` component — one entry point

Material-or-emoji decision in one place. Every consumer just passes a value.

### `resources/js/shared/components/Icon.tsx` (new)

```tsx
import { usePage } from '@inertiajs/react';
import {
    EMOJI_SET,
    MATERIAL_STYLE,
    MATERIAL_STYLE_CLASS,
    type EmojiSet,
    type MaterialIconStyle,
} from '@/shared/config/icons.config';

interface Props {
    /** Material ligature ('check'), emoji codepoint ('💧'), or emoji-mart id ('droplet'). */
    name: string;
    /** Override site-wide Material style. */
    materialStyle?: MaterialIconStyle;
    /** Override site-wide emoji set. */
    emojiSet?: EmojiSet;
    size?: number | string;
    className?: string;
    title?: string;
    'aria-hidden'?: boolean;
}

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const MATERIAL_LIGATURE_RE = /^[a-z0-9_]+$/;     // material ligatures are snake_case ascii
const EMOJI_ID_RE = /^[a-z0-9_+-]+$/;            // so are emoji-mart ids; disambiguated by lookup

// MATERIAL_NAMES = Set built from a generated list. See §7.
import { MATERIAL_NAMES } from '@/shared/config/material-names';

export default function Icon({
    name, materialStyle, emojiSet, size, className, title, ...rest
}: Props) {
    const user = usePage().props.auth?.user;
    const mStyle = materialStyle ?? (user?.material_style as MaterialIconStyle) ?? MATERIAL_STYLE;
    const eSet   = emojiSet      ?? (user?.emoji_set     as EmojiSet)          ?? EMOJI_SET;
    const fontSize = typeof size === 'number' ? `${size}px` : size;

    // 1. Material ligature
    if (MATERIAL_LIGATURE_RE.test(name) && MATERIAL_NAMES.has(name)) {
        return (
            <span
                className={[MATERIAL_STYLE_CLASS[mStyle], className].filter(Boolean).join(' ')}
                style={fontSize ? { fontSize } : undefined}
                title={title}
                {...rest}
            >
                {name}
            </span>
        );
    }

    // 2. Emoji — either codepoint ('💧') or emoji-mart id ('droplet')
    if (EMOJI_RE.test(name) || EMOJI_ID_RE.test(name)) {
        const props: Record<string, string> = { set: eSet };
        if (EMOJI_RE.test(name)) {
            props.native = name;     // <em-emoji native="💧" set="twitter">
        } else {
            props.id = name;         // <em-emoji id="droplet" set="twitter">
        }
        if (fontSize) props.size = String(fontSize);
        // em-emoji is a registered web component — TS will need a global JSX intrinsic decl
        return <em-emoji {...props} class={className} title={title} {...rest} />;
    }

    // 3. Raw text fallback (user-typed custom string)
    return (
        <span className={className} style={fontSize ? { fontSize } : undefined} title={title} {...rest}>
            {name}
        </span>
    );
}
```

`em-emoji` is a web component → needs a JSX intrinsic declaration in [resources/js/types/global.d.ts](../../resources/js/types/global.d.ts):

```ts
declare namespace JSX {
  interface IntrinsicElements {
    'em-emoji': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      id?: string; native?: string; set?: string; size?: string | number;
    };
  }
}
```

## 7. Material name allowlist

To distinguish "Material ligature" from "raw text" the `<Icon>` component needs a set of known Material names. Generate once, commit as data:

### `resources/js/shared/config/material-names.ts` (new, generated)

```ts
export const MATERIAL_NAMES = new Set([
  // System chrome we actually use:
  'expand_more','expand_less','menu','close','check',
  'today','view_week','calendar_view_month','event',
  'settings','edit','edit_note','draw',
  'notifications','emoji_events','warning','auto_awesome',
  'arrow_forward','bolt','trending_up','gps_fixed',
  'delete','search','call','chat','mail','handshake',
  // …plus everything used by the moment catalogue Material fallbacks (none planned now)
]);
```

Allowlist approach (not "every Material name") keeps the bundle tiny and makes the `<Icon>` ambiguity check (Material vs emoji-mart id) reliable. Add new names as needed.

## 8. Current state — audit

### Emoji icons (catalogue + UX literals)

| Location | What it does | Disposition |
|---|---|---|
| [resources/js/shared/constants/icons.ts](../../resources/js/shared/constants/icons.ts) | 54-entry `MOMENT_ICONS` catalogue | **Delete.** Replace with `moment-emoji-catalog.json`. |
| [resources/js/shared/constants/moments.ts:101](../../resources/js/shared/constants/moments.ts#L101) | `MOMENT_FORM_SECTIONS` ✏️ 🔔 🏆 📅 | Replace with Material names: `edit` / `notifications` / `emoji_events` / `event`. |
| [resources/js/Pages/Welcome.tsx:5](../../resources/js/Pages/Welcome.tsx#L5) | Marketing feature cards | Replace with Material: `edit_note` / `event` / `bolt` / `trending_up` / `gps_fixed`. |
| Inline JSX literals (✓ ✕ ✏️ ⚙️ ⚠️ ✨ →) | Various buttons / badges (~15 sites) | Replace with Material `<Icon>` (Sharp). |

### Inline SVG icons

| File | New Material name |
|---|---|
| [AuthenticatedLayout.tsx:94](../../resources/js/Layouts/AuthenticatedLayout.tsx#L94) dropdown chevron | `expand_more` |
| [AuthenticatedLayout.tsx:138](../../resources/js/Layouts/AuthenticatedLayout.tsx#L138) hamburger/close | `menu` / `close` |
| [CalendarViewToggle.tsx](../../resources/js/shared/components/calendar/CalendarViewToggle.tsx) daily | `today` |
| same, weekly | `view_week` |
| same, monthly | `calendar_view_month` |
| [MomentModal.tsx:55](../../resources/js/features/moments/components/MomentModal.tsx#L55) close | `close` |
| [IconPicker.tsx:56](../../resources/js/features/moments/components/IconPicker.tsx#L56) trigger chevron | `expand_more` *(but file goes away — see §9)* |
| [MomentAction.tsx:363-379](../../resources/js/features/calendar/components/MomentAction.tsx#L363-L379) progress arc | **leave alone** — functional SVG, not an icon |

### Persisted state — `moments.icon`

Currently: raw emoji string (e.g. `'💧'`). No DB change required. `<em-emoji native="💧" set="twitter">` accepts the codepoint directly. New picker can write either the codepoint *or* the emoji-mart shortcode (`'droplet'`); the component renders both.

Recommended: keep storing raw codepoints (backward compat, no migration). Phase 4 optionally migrates to shortcodes for portability.

## 9. The new moment picker

Delete [IconPicker.tsx](../../resources/js/features/moments/components/IconPicker.tsx) entirely (panel UI + 134 lines of search / category filtering / no-results / custom-add — all replaced by emoji-mart's built-ins).

### `resources/js/features/moments/components/MomentIconPicker.tsx` (new, ~40 LOC)

```tsx
import { lazy, Suspense, useState } from 'react';
import data from '@emoji-mart/data';
import momentCatalog from '@/shared/config/moment-emoji-catalog.json';
import { EMOJI_SET } from '@/shared/config/icons.config';
import Icon from '@/shared/components/Icon';

const Picker = lazy(() => import('@emoji-mart/react'));

interface Props {
    value: string;                         // emoji codepoint OR emoji-mart id
    onChange: (value: string) => void;
}

export default function MomentIconPicker({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div className="moment-icon-picker">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`moment-icon-picker__trigger${open ? ' is-open' : ''}`}
            >
                {value
                    ? <Icon name={value} size={24} />
                    : <img src="/logo.png" alt="Default" className="moment-icon-picker__default" />}
                <Icon name="expand_more" size={16} aria-hidden />
            </button>

            {open && (
                <Suspense fallback={<div className="moment-icon-picker__loading">…</div>}>
                    <div className="moment-icon-picker__panel">
                        <Picker
                            data={data}
                            custom={momentCatalog}
                            categories={['health','fitness','mind','work','social','creative','general']}
                            set={EMOJI_SET}
                            onEmojiSelect={(e: { id: string; native: string }) => {
                                onChange(e.native);  // store codepoint by default
                                setOpen(false);
                            }}
                            previewPosition="none"
                            skinTonePosition="none"
                            theme="light"
                        />
                    </div>
                </Suspense>
            )}
        </div>
    );
}
```

Lazy-load keeps `@emoji-mart/react` (~80 kB) off the first paint of every page that mounts a moment row.

The `categories` prop restricts the picker to our 7 curated categories. The trailing default emoji-mart categories (people / nature / etc.) can be re-enabled by passing them too, if we want users to also pick from the full ~3500-emoji catalogue.

## 10. Rollout plan — phased, non-breaking

### Phase 1 — Foundation (one PR)

1. `npm install material-icons @emoji-mart/data @emoji-mart/react emoji-mart`.
2. Create:
   - `resources/js/shared/config/icons.config.ts` (§4)
   - `resources/js/shared/config/material-names.ts` (§7)
   - `resources/js/shared/config/moment-emoji-catalog.json` (§5, full 54-entry version per Appendix A)
3. Boot-time wiring in [resources/js/app.tsx](../../resources/js/app.tsx) (§4).
4. JSX intrinsic decl in [resources/js/types/global.d.ts](../../resources/js/types/global.d.ts) (§6).
5. Create [resources/js/shared/components/Icon.tsx](../../resources/js/shared/components/Icon.tsx) (§6).
6. Minimal SCSS in [resources/css/_base.scss](../../resources/css/_base.scss): make `.material-icons-sharp` inherit `font-size` and `line-height: 1` so it composes with our existing `.slot-icon` sizing.

**Acceptance:** `<Icon name="check" />`, `<Icon name="💧" />`, and `<Icon name="droplet" />` all render correctly on a sandbox page. Nothing else in the UI changes.

### Phase 2 — Swap UI chrome (one PR)

Replace inline SVGs + literal emoji UX glyphs per §8:

- [AuthenticatedLayout.tsx](../../resources/js/Layouts/AuthenticatedLayout.tsx)
- [CalendarViewToggle.tsx](../../resources/js/shared/components/calendar/CalendarViewToggle.tsx)
- [MomentModal.tsx](../../resources/js/features/moments/components/MomentModal.tsx)
- [FlashMessage.tsx](../../resources/js/shared/components/FlashMessage.tsx)
- [EmptyState.tsx](../../resources/js/shared/components/EmptyState.tsx)
- [FrequencyBadge.tsx](../../resources/js/shared/components/calendar/FrequencyBadge.tsx)
- [MomentFrequencyConfig.tsx](../../resources/js/shared/components/calendar/MomentFrequencyConfig.tsx)
- [MomentAction.tsx](../../resources/js/features/calendar/components/MomentAction.tsx) — edit pencil, draft buttons, completed tick (**leave the progress arc SVG**)
- [MomentIcon.tsx](../../resources/js/shared/components/calendar/MomentIcon.tsx) — swipe ✓ + emoji rendering through `<Icon>`
- [Daily/Weekly/Monthly Index.tsx](../../resources/js/Pages/Daily/Index.tsx)
- [Welcome.tsx](../../resources/js/Pages/Welcome.tsx)
- [shared/constants/moments.ts](../../resources/js/shared/constants/moments.ts) — `MOMENT_FORM_SECTIONS` switches its `emoji` field to a Material name

Verify in browser at each step.

### Phase 3 — Swap the moment picker (one PR)

1. Add [MomentIconPicker.tsx](../../resources/js/features/moments/components/MomentIconPicker.tsx) per §9.
2. Replace the two existing picker call-sites:
   - [MomentForm.tsx](../../resources/js/features/moments/components/MomentForm.tsx) — main form (uses `IconPicker`)
   - [MomentAction.tsx:171](../../resources/js/features/calendar/components/MomentAction.tsx#L171) — inline draft picker portal
3. Delete [IconPicker.tsx](../../resources/js/features/moments/components/IconPicker.tsx).
4. Delete [shared/constants/icons.ts](../../resources/js/shared/constants/icons.ts) **after** confirming nothing else imports `MOMENT_ICONS` / `ICON_CATEGORIES`.
5. Delete `_icon-picker.scss` and replace with a small `_moment-icon-picker.scss` for the trigger button and panel positioning. The picker body styles itself.

### Phase 4 (optional) — Canonicalise storage as shortcodes

If we want DB rows to hold `'droplet'` instead of `'💧'` (more portable, easier to debug, locale-stable):

1. Migration: backfill `moments.icon` using emoji-mart's data file as the mapping table.
2. Switch the picker's `onEmojiSelect` to write `e.id` instead of `e.native`.
3. `<Icon>` already supports both — no consumer change needed.

Defer until phases 1–3 ship and we're confident in coverage.

### Phase 5 (optional) — Per-user style / set switch

1. Add `material_style` and `emoji_set` columns to the user `Config` table.
2. Surface in [Config/Edit.tsx](../../resources/js/Pages/Config/Edit.tsx) as two 5-way pickers.
3. Import all five Material CSS files (~400 kB woff2 total, well-cached) so any style is render-ready.
4. `<Icon>` already reads from Inertia shared props (§6) — no further code change.

## 11. Tradeoffs and risks

- **First-paint bytes.** Sharp Material woff2 (~80 kB) + emoji-mart data (~70 kB gzipped) + `<em-emoji>` runtime (~20 kB) added to the bundle. Picker UI (`@emoji-mart/react`, ~80 kB) is lazy-loaded behind the trigger.
- **Vertical alignment.** Material font sits on a text baseline; our flex-centred icon containers should handle it, but verify `.slot-icon` (1.125 rem → ~18 px) matches the visual mass of the previous 18 px emoji glyphs. Add `line-height: 1; vertical-align: middle;` if needed.
- **Sharp style aesthetic.** Sharp has 90° corners — more architectural than Two-Tone. Confirm it pairs with our soft rounded buttons (`.calendar-view-toggle__btn` is `border-radius: 0` already, so a Sharp icon is consistent; double-check elsewhere).
- **emoji-mart bundle vs picker availability.** Picker is lazy-loaded, but the data + web component runtime ship eagerly because we render emoji in every moment row. Acceptable for an authenticated app; reconsider for the Welcome page (no emoji there once Phase 2 converts the feature cards to Material).
- **CDN vs self-host for emoji-mart's Twitter sprites.** `<em-emoji set="twitter">` fetches sprites from emoji-mart's CDN by default. If we need offline / privacy guarantees we self-host by passing an absolute `src` prefix at `init()` time. Out of scope unless requested.
- **Custom emoji input removed.** The old picker let users type arbitrary text into search and "Add as custom" — emoji-mart's picker doesn't. If that flow is still valued, keep it via a small "Use your own…" link that opens a free-text input alongside the picker.
- **AGENTS.md dependency approval.** Four new packages — confirm before installing.

## 12. Open questions

1. **Confirm Sharp** as the system Material style. ✅ user-confirmed
2. **Confirm Twitter** as the emoji visual set (we recommend it for cross-platform consistency).
3. **Approve adding** `material-icons`, `@emoji-mart/data`, `@emoji-mart/react`, `emoji-mart` to `package.json`?
4. **Phase 4** (store shortcodes in DB) — ship now or defer?
5. **Phase 5** (per-user pickers) — ship now or defer?
6. **Custom emoji input** — keep the "Add as custom" affordance, or drop it?

## 13. File-by-file change list (concise)

**New**
- `resources/js/shared/config/icons.config.ts`
- `resources/js/shared/config/material-names.ts`
- `resources/js/shared/config/moment-emoji-catalog.json`
- `resources/js/shared/components/Icon.tsx`
- `resources/js/features/moments/components/MomentIconPicker.tsx`
- `resources/css/forms/_moment-icon-picker.scss`

**Modified**
- `package.json`
- `resources/js/app.tsx` (CSS import + `init()`)
- `resources/js/types/global.d.ts` (`em-emoji` JSX intrinsic)
- `resources/css/_base.scss` (Material baseline)
- `resources/css/app.scss` (`@import` swap)
- `resources/js/shared/constants/moments.ts` (MOMENT_FORM_SECTIONS → Material names)
- `resources/js/Layouts/AuthenticatedLayout.tsx`
- `resources/js/shared/components/calendar/CalendarViewToggle.tsx`
- `resources/js/features/moments/components/MomentModal.tsx`
- `resources/js/features/moments/components/MomentForm.tsx` (picker swap)
- `resources/js/features/calendar/components/MomentAction.tsx`
- `resources/js/shared/components/calendar/MomentIcon.tsx`
- `resources/js/shared/components/FlashMessage.tsx`
- `resources/js/shared/components/EmptyState.tsx`
- `resources/js/shared/components/calendar/FrequencyBadge.tsx`
- `resources/js/shared/components/calendar/MomentFrequencyConfig.tsx`
- `resources/js/Pages/Daily/Index.tsx`
- `resources/js/Pages/Weekly/Index.tsx`
- `resources/js/Pages/Monthly/Index.tsx`
- `resources/js/Pages/Welcome.tsx`

**Deleted**
- `resources/js/shared/constants/icons.ts`
- `resources/js/features/moments/components/IconPicker.tsx`
- `resources/css/forms/_icon-picker.scss`

**Untouched (functional SVG)**
- `MomentAction.tsx` progress arc, progress bars, `Cubes` background.

---

## Appendix A — `moment-emoji-catalog.json` (full)

The full 54-entry curation. IDs are emoji-mart shortcodes (verify each against `@emoji-mart/data` before merging — a couple may need renames, e.g. `salad` vs `green_salad`).

```json
[
  { "id": "health", "name": "Health", "emojis": [
    { "id": "droplet",       "name": "Water" },
    { "id": "apple",         "name": "Apple" },
    { "id": "green_salad",   "name": "Salad" },
    { "id": "pill",          "name": "Vitamin" },
    { "id": "sleeping_face", "name": "Sleep" },
    { "id": "tooth",         "name": "Tooth" },
    { "id": "heart",         "name": "Heart" },
    { "id": "stethoscope",   "name": "Medicine" }
  ]},
  { "id": "fitness", "name": "Fitness", "emojis": [
    { "id": "runner",                     "name": "Run" },
    { "id": "weight_lifter",              "name": "Gym" },
    { "id": "person_in_lotus_position",   "name": "Yoga" },
    { "id": "bike",                       "name": "Cycle" },
    { "id": "swimmer",                    "name": "Swim" },
    { "id": "walking",                    "name": "Walk" },
    { "id": "cartwheeling",               "name": "Stretch" },
    { "id": "hiking_boot",                "name": "Hike" }
  ]},
  { "id": "mind", "name": "Mind", "emojis": [
    { "id": "lotus",              "name": "Meditate" },
    { "id": "books",              "name": "Read" },
    { "id": "memo",               "name": "Journal" },
    { "id": "brain",              "name": "Brain" },
    { "id": "pray",               "name": "Pray" },
    { "id": "wind_blowing_face",  "name": "Breathe" },
    { "id": "cherry_blossom",     "name": "Gratitude" },
    { "id": "mortar_board",       "name": "Learn" }
  ]},
  { "id": "work", "name": "Work", "emojis": [
    { "id": "computer",      "name": "Code" },
    { "id": "e-mail",        "name": "Email" },
    { "id": "handshake",     "name": "Meeting" },
    { "id": "book",          "name": "Study" },
    { "id": "writing_hand",  "name": "Write" },
    { "id": "clipboard",     "name": "Plan" },
    { "id": "dart",          "name": "Focus" },
    { "id": "mag",           "name": "Review" }
  ]},
  { "id": "social", "name": "Social", "emojis": [
    { "id": "telephone_receiver",      "name": "Call" },
    { "id": "family_man_woman_girl",   "name": "Family" },
    { "id": "busts_in_silhouette",     "name": "Friends" },
    { "id": "speech_balloon",          "name": "Message" },
    { "id": "couple_with_heart",       "name": "Date" },
    { "id": "open_hands",              "name": "Volunteer" }
  ]},
  { "id": "creative", "name": "Creative", "emojis": [
    { "id": "musical_note", "name": "Music" },
    { "id": "art",          "name": "Art" },
    { "id": "camera",       "name": "Camera" },
    { "id": "guitar",       "name": "Guitar" },
    { "id": "dancer",       "name": "Dance" },
    { "id": "thread",       "name": "Craft" }
  ]},
  { "id": "general", "name": "General", "emojis": [
    { "id": "star",              "name": "Star" },
    { "id": "fire",              "name": "Fire" },
    { "id": "white_check_mark",  "name": "Check" },
    { "id": "alarm_clock",       "name": "Clock" },
    { "id": "moneybag",          "name": "Money" },
    { "id": "broom",             "name": "Clean" },
    { "id": "cooking",           "name": "Cook" },
    { "id": "seedling",          "name": "Plant" },
    { "id": "sunny",             "name": "Sun" },
    { "id": "crescent_moon",     "name": "Moon" }
  ]}
]
```
