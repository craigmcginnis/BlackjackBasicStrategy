# Style Migration & Global Design Tokens

Purpose: establish a single source of truth for visual styling (colors, spacing, typography, elevation, component primitives) and track migration from ad‑hoc per‑component SCSS to token + utility / mixin based styling. Global styles are now modularized into categorized partials located in `src/styles/`.

> Keep this file up to date. Each time you migrate a component, check it off below and remove obsolete hard‑coded values. Prefer CSS custom properties (design tokens) declared in `src/styles.scss`.

## Core Principles

1. Token First: Use CSS custom properties (`var(--token-name)`) for any value reused or likely to change (colors, spacing, radii, shadows, font sizes, z-index tiers, transition durations).
2. Semantic over Raw: Prefer `--color-action-hit` over a hex value in components. Only `styles.scss` (or a tokens partial) should contain raw color literals (except for one‑off illustrative charts where data-driven colors apply).
3. Dark Mode Ready: All color tokens represent *roles* (background, surface, border, text-subtle, action-*). Later a `:root.dark` (or `[data-theme="dark"]`) variant can override them. Don’t encode “dark/light” in token names; encode *purpose*.
4. Accessibility: Maintain minimum contrast (WCAG AA) for text & interactive elements. When introducing new token values, verify contrast > 4.5:1 for normal text, 3:1 for large text / UI icons.
5. Layered Overrides: Component SCSS may define derived private variables (e.g. `--_card-border-color: var(--color-border-subtle);`). Avoid nesting raw values.
6. Remove Duplication: Shared patterns (cards layout, `.buttons` flex group, table styling) become mixins or utility classes.
7. No One-Off Styles: Do not introduce ad‑hoc, single‑use declarations (e.g. a lone hard‑coded color, spacing, or bespoke class) in component SCSS. Every new style must map to: (a) an existing token / utility; (b) a newly added semantic token (with this doc updated); or (c) a reusable utility / component primitive partial. If a style is truly unique and not reusable, challenge the requirement or refactor the design instead of inlining.
8. BEM Naming: Component classes must follow BEM (`block`, `block__element`, `block--modifier`). Utilities retain `u-` prefix. Former `.c-*` primitives should migrate to BEM block names (e.g., `.c-table-base` -> `.table`, with elements like `.table__row` and modifiers like `.table--compact`). Action classes (`.hit`, `.stand`) will be replaced by modifiers (`.action-tag--hit`).

## Design Tokens (Initial Set)

Declared across token partials in `src/styles/` under `:root` blocks:

* `_tokens.colors.scss`
* `_tokens.spacing.scss`
* `_tokens.typography.scss`
* `_tokens.radius.scss`
* `_tokens.elevation.scss`
* `_tokens.motion.scss`

The aggregator `src/styles.scss` imports these via Sass `@use` for better organization.

Categories:
* Colors: `--color-bg-app`, `--color-surface`, `--color-surface-alt`, `--color-border`, `--color-border-strong`, `--color-text`, `--color-text-muted`, `--color-focus-ring`, semantic action colors (`--color-action-hit`, `--color-action-stand`, `--color-action-double`, `--color-action-split`, `--color-action-surrender`, `--color-positive`, `--color-negative`, `--color-accent`) and table specific roles (`--table-border-color`, etc.).
* Spacing scale: `--space-0` … `--space-6` (0,2,4,8,12,16,24px) for consistency.
* Radius: `--radius-xs`, `--radius-sm`, `--radius-md`, `--radius-lg`.
* Typography: `--font-family-base`, `--font-size-xs` … etc (extend later; currently rely on Material system vars & a couple of custom size tokens for tags / tables).
* Elevation: `--elevation-1`, `--elevation-2` (box-shadow presets).
* Motion: `--ease-standard`, `--transition-fast`, `--transition-base`.

## Migration Tasks Checklist

Check off as each file is refactored to tokens & utilities. Add PR link in the Notes column.

| File | Status | Key Actions | Notes/PR |
|------|--------|-------------|----------|
| `src/styles.scss` | ✅ Seeded | Orchestrates partial imports; no direct one-off styles | |
| `src/styles/_tokens.colors.scss` | ✅ Seeded | Keep only color role tokens; consolidate duplicates before adding | |
| Added `--color-accent-light` | ✅ | Lighter accent for links on dark background (home links) | |
| Added `--color-surface-overlay` | ✅ | Subtle translucent surface overlay replacing rgba literal in settings list | |
| Added `--color-overlay-scrim` | ✅ | Backdrop scrim token for dialog/modal surfaces (replaces inline rgba) | |
| Adjusted `--color-text-muted` opacity | ✅ | Improved contrast to address axe warnings | |
| Added `--color-text-subtle` | ✅ | Secondary meta text (avoid for body copy); supports contrast tuning | |
| Added `--color-surface-card` | ✅ | Dedicated card background (lighter variant of app surface) | |
| `src/styles/_tokens.spacing.scss` | ✅ Seeded | Spacing scale; extend only with semantic need | |
| `src/styles/_tokens.typography.scss` | ✅ Seeded | Centralize font sizes; evaluate Material vars before adding new | |
| `src/styles/_tokens.radius.scss` | ✅ Seeded | Border radius tokens; avoid ad-hoc radii in components | |
| `src/styles/_tokens.elevation.scss` | ✅ Seeded | Shadow presets; migrate component box-shadows here | |
| `src/styles/_tokens.motion.scss` | ✅ Seeded | Easing & durations; map new transitions here | |
| `src/styles/_utilities.accessibility.scss` | ✅ Seeded | `.u-visually-hidden`; add any further a11y helpers here | |
| `src/styles/_utilities.layout.scss` | ✅ | Added flex helpers (.u-flex-*) & gap utilities; will refactor components to use them | |
| `src/styles/_utilities.text.scss` | ✅ | Added text color utility helpers (.u-text-muted / .u-text-strong) | |
| `src/styles/_components.actions.scss` | ✅ | Replaced legacy helper classes with `.action-tag` + modifiers; removed old `.hit/.stand/...` | |
| `src/styles/_components.button.scss` | ✅ | Introduced `.btn` primitive with variants (`--primary`, `--danger`, `--ghost`) using tokens | |
| `src/styles/_components.dialog.scss` | ✅ | Added dialog primitive; extracted inline shortcut help dialog styles | |
| `src/styles/_components.table.scss` | ✅ | Added BEM `.table` + Material bridge; feature tables migrated | |
| `src/app/app.scss` | ✅ | Replaced nav colors with tokens, added transition, mapped spacing to tokens | |
| `src/app/features/home/home.component.scss` | ✅ | Migrated to `.action-tag` BEM primitive (global); removed local `.tag` styles | |
| `src/app/features/drill/drill.component.scss` | ✅ | Uses global `.card` primitive & tokens; removed hex literals | |
| Drill & chart contrast pass (action tag/cell text color adjustments) | ✅ | Switched hit/double tag & cell text to inverse for WCAG contrast | |
| Removed raw shadow & opacity in drill/flashcards bubbles | ✅ | Adopted `--elevation-1`; replaced opacity text with `--color-text-subtle` | |
| `src/app/features/flashcards/flashcards.component.scss` | ✅ | Consumes global `.card` primitive; removed duplication & hexes | |
| `src/app/features/strategy-chart/strategy-chart.component.scss` | ✅ | Replaced raw hexes with tokens; aligned with table tokens & action tokens | |
| `src/app/features/analytics/analytics.component.scss` | ✅ | Consolidated styling; replaced hexes with tokens for tables & spark charts | |
| Analytics export buttons | ✅ | Adopted global `.btn` primitive variants; removed local button styles | |
| Header inline styles (app.html) | ✅ | Migrated to `app.scss` and tokenized | |
| `src/app/features/settings/settings.component.scss` | ✅ | Replaced color literals with tokens; centralized button group utility | |
| Shared `.buttons` pattern (several components) | ✅ | Replaced with `.u-button-group` + `.btn` primitives (drill, flashcards, settings, analytics) | |
| Visually hidden helper (duplicated `.vh`, `.visually-hidden`) | ✅ | Consolidated into `.u-visually-hidden`; templates updated | |

Add new rows as needed for any additional style files.

## Utilities & Mixins (Planned / Implemented)

Implemented so far (partials in `src/styles/`):
* `_utilities.accessibility.scss` providing `.u-visually-hidden`.
* `_utilities.layout.scss` providing `.u-button-group` (future: add flex helpers).
* `_components.table.scss` base `.c-table-base` primitive (alias) & emerging BEM `.table` (elements/modifiers roadmap).
* `_components.actions.scss` finalized `.action-tag` primitive + modifiers (legacy helper classes removed).
* `_components.button.scss` `.btn` primitive (base + primary / danger / ghost variants) with focus ring + tokenized states.

Planned (create incrementally as you migrate components):
* Layout flex utilities: `.u-flex-row`, `.u-flex-col`, `.u-center`, gap utilities.
* Card primitive: BEM `.card` added (basic playing card); can extend later for generic app cards.
* Enhanced table theme: BEM `.table` with elements (`.table__row`, `.table__cell`, `.table__header`) and modifiers (`.table--compact`, `.table--striped`).
* Action tag pattern: BEM `.action-tag` + modifiers (`.action-tag--hit`, `.action-tag--stand`, etc.) replacing legacy classes.

## Migration Process (Per File)

1. Inventory: List hard-coded values in the file (`grep -E "#[0-9a-fA-F]{3,6}"). Also list bespoke/selective class names that only exist to style a pattern duplicated elsewhere.
2. Map: For each raw value decide: (a) existing token; (b) new semantic token to add; (c) refactor/delete. Inline one‑off values are not allowed.
3. Extract: If a style block is reusable across >1 component (or likely to be), move it to an appropriate global partial (utility, primitive, or BEM block) and rename classes to follow BEM if not already.
4. Replace in Templates: Update component templates to use the new global utility / BEM class names. Remove the old component-specific class names from markup when a one-to-one replacement exists.
5. Replace Values: Swap remaining literals with `var(--token)`; if helpful declare a temporary local alias variable (prefixed `--_`) only when composing values.
6. Prune & Alias (Optional): For any removed class that might still be referenced externally (rare), add a temporary alias selector in the global partial (e.g. `.old-class { @extend .card; }`) with a `// TODO remove by <date>` note. Prefer full removal if internal only.
7. Remove `!important`: Only keep if overriding 3rd-party specificity that can’t be addressed with a better selector.
8. Document: Mark the checklist row ✅ and add PR/commit reference (include note if aliases added).
9. New Categories: When adding a new utility or token category, create a new `_tokens.*.scss`, `_utilities.*.scss`, or `_components.*.scss` partial instead of expanding unrelated files; update this document.

### Class Decommission / Cleanup

| Legacy Class (Example) | Replacement (Global) | Removal Strategy | Status |
|------------------------|----------------------|------------------|--------|
| `.hit`, `.stand`, `.double`, `.split`, `.surrender` | `.action-tag--hit` (etc.) applied to `.action-tag` block | Legend & all usages migrated; legacy classes removed | Complete |
| `.c-table-base` | `.table` + elements (`.table__row`, `.table__cell`) | Alias retained with removal target 2025-09-15 | Complete |
| Component `.buttons` wrappers | `.u-button-group` + `.btn` | Templates updated & local style blocks removed | Complete |
| Duplicate card container classes in drill / flashcards | `.card` (+ modifiers) | `.card` primitive created & applied; duplicates removed | Complete |

Add new rows as legacy classes are identified. Remove rows once fully decommissioned.

## Color Token Mapping (Initial Extraction)

| Literal | Usage | Token |
|---------|-------|-------|
| `#0d1319` | App background | `--color-bg-app` |
| `#15212c` | Dark surface (tables) | `--color-surface` |
| `#20303d` | Table header gradient start | `--color-surface-alt` |
| `#2f3d4a` | Table border | `--table-border-color` |
| `#1c2b36` | Alt row | `--table-row-alt` |
| `#293847` | Row hover | `--table-row-hover` |
| `#e8edf1` | Light text on dark surface | `--color-text` (contextual) |
| `#f1f6f9` | Header text | `--color-text-strong` |
| `#ffffff` | White text/general | `--color-text` (light mode override later) |
| `#d32f2f` | Red suits / incorrect | `--color-negative` |
| `#4caf50` / `#43a047` | Positive / stand | `--color-positive`, `--color-action-stand` |
| `#1e88e5` / `#2196f3` / `#0277bd` | Blues (double / links / hit) | `--color-action-double`, `--color-action-hit`, `--color-accent` |
| `#ef5350` / `#c62828` | Hit / surrender alt (needs rationalization) | `--color-action-hit`, `--color-action-surrender` |
| `#ff9800` / `#ef6c00` | Split / tag split | `--color-action-split` |
| `#8e24aa` / `#6a1b9a` | Surrender / double alt | `--color-action-surrender`, `--color-action-double-alt` |
| `#444`, `#555`, `#666` | Neutral borders / text-muted | `--color-border`, `--color-text-muted` |
| `#222` | Nav / spark bg | `--color-surface-alt-2` |
| `#ffeb3b` | Hint highlight | `--color-hint` |

Consolidate near-duplicates during migration (e.g. unify multiple reds into `--color-negative` & semantic action tokens; unify blues).

## Adding New Tokens

1. Define in `:root` after existing group, add a succinct comment.
2. Choose semantic (role-based) naming, not visual naming (avoid `--color-lightblue`).
3. Update this file’s Color Token Mapping table if widely used.
4. Refactor at least one existing usage in same PR to justify the addition.

## Copilot / Automation Hints

See `style.instructions.md` for repository-wide guidance. When prompting Copilot inside SCSS, add a preceding comment such as:

```scss
// Copilot: use existing design tokens (search: --color-action-) instead of new hex values.
```

## Open Questions / Future

* Introduce light theme variant? Provide `[data-theme='light']` override block.
* Transition to Angular Material design tokens for color roles where possible rather than separate app tokens.
* Consider CSS `@layer` to encapsulate utilities vs component styles to control cascade order.

---
Maintainer: (add name)
Last Updated: 2025-08-17
