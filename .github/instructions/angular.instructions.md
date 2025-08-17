---
applyTo: '**'
---
# Angular Coding Style (Concise Guide)

Purpose: Provide simple, consistent conventions for this project. Keep it short; if you need more detail, use the official Angular Style Guide as a reference.

## 1. File & Naming Conventions
- kebab-case file names: `strategy-chart.component.ts`, `storage.service.ts`.
- One class/interface per file (except small model groups). Suffix types: `Component`, `Service`, `Directive`, `Pipe`.
- Public symbols exported; keep helpers `function`-scoped or `const` if not reused.
- Folder-by-feature (already in place). Keep shared low-level services in `core/services`; models in `core/models`.
- Always keep component HTML templates and styles in separate external files (`.html`, `.scss`). Avoid inline `template` / `styles` in `@Component` except for tiny, non-committed experimentation.

## 2. Component Structure Order
1. Angular imports
2. Third‑party imports
3. Local app imports
4. `@Component` metadata
5. Public readonly inputs (if any)
6. Signals / state vars
7. Constructor DI (private unless used in template)
8. Lifecycle hooks (in chronological order)
9. Public methods (template-used first)
10. Private methods / helpers

## 3. Change Detection & Performance
- Prefer standalone components (already used) + OnPush equivalent via signals (Angular v17+). Avoid unnecessary state copies.
- Derive state with computed signals rather than manual subscriptions when possible.
- Heavy loops: move constant expressions outside template.

## 4. Templates
- Keep templates declarative; avoid complex inline logic—extract to small pure methods or computed signals.
- Use `@for` / `@if` (if using Angular's built-in control flow) instead of `*ngFor` + `*ngIf` chains when available.
- Add `track` function/expr for lists to avoid re-renders.
- Accessibility: always provide `aria-label`/`aria-labelledby` for icon-only buttons; never rely solely on color for meaning.

## 5. Styling (Tie-in with Tokens)
- Always consult the global style rules in `.github/instructions/style.instructions.md` (and existing tokens in `styles.scss`) before adding or changing component styles; reuse tokens/utilities instead of introducing new raw values.
- No raw hex colors in component SCSS. Use `var(--color-*)` tokens (see `styles.scss`).
- Reuse utilities: `.u-button-group`, `.u-visually-hidden`. Add new utilities in global file before scattering bespoke styles.
- Keep specificity low; prefer class selectors; avoid `::ng-deep` unless absolutely needed for 3rd-party overrides (document why).

## 6. Services & State
- Pure calculation logic belongs in services (e.g., strategy engine) or pure utility functions.
- Avoid storing duplicate state across services; derive when cheap.
- Prefer readonly Observables / signals for shared state; expose mutation via intent methods.

## 7. RxJS (Where Still Used)
- Prefer signals; when using RxJS keep pipelines short and readable.
- Order of operators: source -> transform (map / filter) -> combination (switchMap / mergeMap) -> side-effects (tap) -> finalize.
- Unsubscribe with `takeUntil(destroy$)` or use `take(1)` for one-offs. Prefer `firstValueFrom` only in bootstrapping code.

## 8. Error Handling & Logging
- Fail fast with thrown errors in pure functions when invariants break.
- User-facing errors: surface meaningful message (no raw stack) and optionally log diagnostic detail to analytics service.

## 9. Testing
- Component tests: focus on public template behavior (DOM text, classes, aria attributes) not internals.
- Service tests: cover decision branches in strategy calculations.
- Use given-when-then structure in spec descriptions.
- Keep test data builders in spec files unless reused broadly.

## 10. Imports & Ordering
- Group and separate by blank line; within a group sort alphabetically.
- Avoid barrel files that hide tree‑shaking issues unless multiple consumers justify them.

## 11. TypeScript Practices
- Enable strict typing (already). Use explicit return types on exported functions.
- Opening braces MUST start on a new line (Allman style) for classes, interfaces, enums, functions, methods, control blocks. Example:
```ts
function dealCard()
{
	// ...
}
if (hand.isBlackjack())
{
	// ...
}
```
- Use `readonly` for constants and immutable arrays (`readonly number[]`).
- Avoid `any`; if needed, wrap with a TODO and a reason.
- Narrow types early (e.g., validate external data at boundary layer).

## 12. Misc Patterns
- Prefer pure functions for reusable logic—place near consumers or in `core` if widely reused.
- Use enumerations via union string literal types over `enum` unless interop needed.
- Avoid magical numbers; create a named constant or token.

## 13. Comments & Documentation
- Explain *why*, not *what*. The code should show *what*.
- For tricky algorithms, add a brief high-level comment with references.

## 14. Accessibility Checklist
- Focus outline must remain visible (do not remove outline without replacement).
- Ensure sufficient color contrast (use tokens chosen for contrast).
- Provide skip/landmark semantics when adding major navigation structures.

## 15. Commit Messages (Style Focus)
- `feat:`, `fix:`, `refactor:`, `style:`, `test:`, `docs:` conventional prefixes.
- Style migration: `style(tokens): migrate <component>`.

## 16. Copilot Prompt Hints
Use inline comments to steer suggestions:
```ts
// Copilot: use existing design tokens and keep function pure.
```
```scss
// Copilot: use var(--space-*) for spacing, no new hex colors.
```

## 17. Adding New Code
Before adding: check if pattern already exists. After adding: update related style or migration docs if tokens/utilities were affected.

---
Keep this concise—expand only when repetition or confusion recurs. Update date when modifying.
Last Updated: (update as needed)
