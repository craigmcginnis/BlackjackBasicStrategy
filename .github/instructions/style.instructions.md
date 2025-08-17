---
applyTo: '**'
---
High-Level Rules:
1. Do NOT introduce raw hex/rgb/rgba color values in component SCSS or templates; use existing CSS custom properties (search for `--color-`). If a token is missing, suggest adding one instead of inlining a value.
2. Prefer semantic token names (role-based) over visual descriptors.
3. Reuse utilities (`.u-*`, `.c-*`) before adding new bespoke declarations.
4. Keep specificity low: avoid IDs and deep descendant chains. Never use `!important` unless overriding 3rd-party inline styles (document rationale in a comment).
5. For spacing, use spacing tokens (`var(--space-*)`) instead of numeric literals (except inside token declarations themselves).
6. For interactive elements, include focus styles that leverage `--color-focus-ring`.
7. When generating new components: scaffold a section in the migration checklist if adding new SCSS files.
 8. Follow BEM naming for component classes: `block`, `block__element`, `block--modifier`. Utilities keep `u-` prefix (not BEM). Component primitives (formerly `.c-*`) should migrate to plain BEM blocks (e.g. `.card`, `.table`, `.action-tag`). Avoid chaining more than one `__` level; create a new block if hierarchy deepens.

## BEM Conventions
* Blocks: standalone components (`.card`, `.table`, `.action-tag`).
* Elements: parts of a block (`.card__header`, `.table__row`, `.action-tag__icon`).
* Modifiers: variations (`.card--interactive`, `.table--compact`, `.action-tag--hit`).
* State classes (JS/ARIA driven) use `is-` or `has-` prefixes (`.is-open`, `.has-error`) applied in addition to BEM classes.
* Utilities (`.u-*`) and layout helpers are orthogonal and may coexist with BEM classes.
* Avoid location-based naming (no `.left-col`); describe purpose (`.card__sidebar`).
* Do not nest blocks inside other blocks' elements; if composition needed, place a new block class alongside the element container.
* Replace legacy helper classes like `.hit`, `.stand` with modifier or data-attribute driven BEM (`.action-tag--hit`).

Prompts / Inline Comments to Encourage Correct Output:
// Copilot: use design tokens (e.g. var(--color-text)) instead of hard-coded colors.
// Copilot: prefer existing utility classes (.u-button-group, .c-card) before adding new styles.
// Copilot: if a needed token does not exist, comment a TODO suggesting its addition in styles.scss and update STYLE-MIGRATION.md.

Commit Message Guidance for Style Changes:
style(tokens): migrate <component> to design tokens
style(util): add <utility-name> and refactor usages
refactor(style): deduplicate <pattern> into <utility/mixin>

Lint / Review Checklist for PR Author & Reviewer:
[] No new raw color literals outside styles.scss
[] No unnecessary `!important`
[] All new styles reference tokens/utilities where appropriate
[] Migration checklist updated
[] BEM naming followed (block, block__element, block--modifier); no ad-hoc non‑utility one-off classes

Enforcement Ideas (Future):
* Stylelint rule set to forbid hex colors outside `styles.scss`
* CI grep failing build on new raw hex values (except whitelisted files)

Update this file as automation grows.
