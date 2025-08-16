# Blackjack Trainer SDLC Plan

## 1. Vision & Objectives

Build a responsive Angular + Angular Material web app to help users learn and memorize optimal basic blackjack strategy via interactive drills, flash cards, and adaptive practice.

Primary goals:

- Teach correct decision (Hit, Stand, Double, Split, Surrender) for any standard 1-8 deck shoe (S17/H17 variants toggle, DAS, etc.)
- Provide spaced repetition & performance analytics.
- Offer strategy chart visualization and quiz modes.

Non-goals (v1):

- Card counting training.
- Real-money simulation.

## 2. Requirements

### Functional (MVP)

1. Select rule set (decks, dealer hits soft 17, double after split, surrender availability).
2. Display basic strategy chart for current rule set.
3. Drill mode: Random hand + dealer up-card -> user selects action -> feedback + explanation.
4. Track session stats: accuracy %, streak, time per decision.
5. Flashcard mode: cycle through full matrix until each combination answered correctly N times.
6. Persist user settings & progress locally (LocalStorage / IndexedDB).
7. Accessibility: keyboard navigation & ARIA labels.

### Functional (Future / Backlog)

- User accounts & cloud sync.
- Spaced repetition algorithm (SM-2 variant).
- Custom rule editor.
- Multi-hand simulation.
- Count practice overlay.

### Non-Functional

- Lighthouse performance > 90 on desktop/mobile.
- 100% offline-capable (PWA) in later iteration.
- Unit test coverage >= 70% for core services & components.

## 3. Personas & Use Cases

Persona: Casual player preparing for casino trip.
Use Case: Learn decisions quickly; reinforce weak spots discovered via analytics.

## 4. High-Level Architecture

- Angular standalone components.
- Feature modules (lazy loaded): StrategyChart, Drill, Flashcards, Settings, Analytics.
- Core domain service: StrategyEngineService (computes optimal action from hand state + rules).
- Data models: Card, Hand, RuleSet, Decision, DrillResult.
- Storage: Local persistence via a StorageService abstraction (switchable backend later).
- The strategy tables stored as JSON keyed by rule variants.

## 5. Data Model (Initial)

```
RuleSet { id, decks, hitSoft17, doubleAfterSplit, lateSurrender }
HandState { playerTotal, isSoft, isPair, playerCards: Card[], dealerUp: number }
Decision enum { Hit, Stand, Double, Split, Surrender }
DrillResult { id, handState, expected: Decision, given: Decision, correct: boolean, timestamp }
```

## 6. Strategy Representation

Use precomputed matrices:

- Hard totals (5-21) vs dealer (2-A)
- Soft totals (A2-A10)
- Pairs (2,3,...,A)
  Hierarchical decision: Pair > Soft > Hard.
  Store each matrix as object of arrays for O(1) lookup.

## 7. Iterative Release Plan

Original MVP sequencing (completed unless noted):

1. Sprint 1 – Scaffold & Core (DONE): Angular project scaffold, core models, initial strategy data (single baseline rule set), `StrategyEngineService`, static strategy chart.
2. Sprint 2 – Drill Foundations (DONE): Drill component (random hand generation), user action & feedback loop, initial stats service.
3. Sprint 3 – Flashcards & Persistence (DONE): Flashcard traversal of full matrix, local persistence of settings & progress.
4. Sprint 4 – Variant Expansion (DONE): Multiple rule variants (S17/H17, DAS, LS), dynamic chart rendering, enhanced settings, difficulty tiers.
5. Sprint 5 – Analytics, Accessibility & Refactor (DONE / PARTIAL POLISH): Analytics baseline, accessibility improvements, extraction of templates/styles, storage facade & initial coverage uplift. Remaining polish items moved forward.

Forward-looking incremental plan (re-baselined post-MVP):

6. Sprint 6 – Test & A11y Maturity: Raise branch coverage >55%; interactive state contrast automation; generic modal focus-trap regression harness; accessibility CI threshold docs.
7. Sprint 7 – Analytics Visualization & UX: Graphical trend charts, export/share (CSV/JSON) for weak spots & SRS queue, rule variant comparison view, time-pressure (timed drill) experimental mode, improved theming.
8. Sprint 8 – Offline & Performance: Enhanced PWA service worker (runtime caching, stale-while-revalidate, offline analytics queue), Lighthouse CI integration, performance budgets.
9. Sprint 9 – Advanced Learning Features (Stretch): Adaptive weighting refinements (multi-factor), configurable SRS parameter UI, optional count-practice overlay (stretch), custom rule editor.

Out-of-scope (v1): User accounts / cloud sync, multi-hand simulation, card counting training (candidate v2 roadmap items).

## 8. Quality Plan

- ESLint + Prettier.
- Unit tests: Jasmine/Karma (default) or migrate to Vitest later.
- StrategyEngineService test matrix cross-check with CSV fixture.

## 9. Risks

- Incorrect strategy data (mitigate via cross validation with published charts).
- Scope creep (adhere to MVP list).
- Performance for large drill history (paginate / summary only).

## 10. Definition of Done (per feature)

- All acceptance criteria met.
- Unit tests added & green.
- No ESLint errors, >90% component accessibility checks.
- Updated docs & changelog.

## 11. Initial Backlog (Epics -> Stories)

EPIC: Core Strategy

- Load static strategy JSON.
- Compute decision for hand.
- Show strategy chart grid.

EPIC: Drill Mode

- Generate random legal player hands. ✅ (Improved: difficulty-tier distribution + validity heuristics avoiding unintended pairs; weighted weak-spot reinforcement retained.)
- User action buttons. ✅
- Feedback banner & explanation. ✅ (Persistent until manual Next; contextual explanation & EV reasoning.)
- Session stats panel. ✅ (Accuracy, streak, time per decision stored; difficulty tier now recorded.)
- Difficulty tiers (Easy/Medium/Hard) influencing hand mix & edge-case exposure. ✅
- Adaptive hint system (one per hand, chart-contextual without leaking exact action). ✅

EPIC: Persistence

- Storage service abstraction.
- Save rule set & stats.
17. Accessibility gating expansion (best-practice + configurable thresholds). ✅ (Broadened axe spec to include `best-practice` tag set; added gating test ensuring zero serious/critical WCAG violations (contrast logged separately) with future-ready env override (`A11Y_MAX_SERIOUS`); logs moderate WCAG + best-practice issues for iterative remediation.)
18. Accessibility regression: Focus trap robustness tests & contrast interactive state extensions. ✅ (Added shift+tab wrap test, focus return to trigger test, expanded contrast spec to include hover/large-text interactive state approximations; coverage modestly improved Branches 44.44%, Lines 74.04%.)
18. Accessibility regression: Focus trap robustness tests & contrast interactive state extensions. ✅ (Added shift+tab wrap test, focus return to trigger test, expanded contrast spec to include hover/large-text interactive state approximations; coverage modestly improved Branches 44.44%, Lines 74.04%.)
EPIC: Flashcards

- Iterate matrix combinations sequentially.
- Track mastery counts.

EPIC: Settings

- Rule set selector. ✅ (Multiple built-in presets + dynamic variant propagation)
- Toggle variants. ✅ (H17/S17, DAS, LS, deck count)
- Custom rule presets (create/apply/delete). ✅ (Local persistence; collision-safe IDs; immediate rules-changed event dispatch)
- Pending: Advanced custom rule editor (non-standard options) & multi-preset comparison (future backlog)

EPIC: Analytics

- Weakest decisions list.
- Accuracy over time chart.
 - Cumulative accuracy trend (sparkline) ✅
 - Per-action rolling trends ✅
 - Export (CSV/JSON) of raw session history ✅
 - Overdue SRS items & time distribution ✅
 - Pending (future): Full graphical charts (line/bar via chart lib), variant comparison view, interactive filters.

## 12. Environment Setup

Node LTS, Angular CLI latest. Angular Material, optionally NGX Charts for analytics (future).

## 13. Deployment

- GitHub Pages or Netlify (ng build --configuration production). Add PWA later.

## 14. Maintenance

- Version strategy JSON using semantic versioning.
- Lint & test in CI.

## 15. Progress Update (2025-08-14)

Status Legend: ✅ Done | 🟡 Partial | ⛔ Not Started

MVP Functional Requirements:

1. Rule set selection (decks, H17/S17, DAS, LS toggles + presets) – ✅ (Presets + dynamic variant key propagation; future: multi-preset comparison outside MVP.)
2. Strategy chart (dynamic S17/H17 + DAS + LS integrated) – ✅ (Variant switching + surrender & DAS decisions surfaced; further rare H17 deviation validation in backlog.)
3. Drill mode (random/weighted hands, feedback, explanation, timing) – ✅ (Weak-spot weighting, persistent explanation, hint system; future: advanced generation constraints.)
4. Session stats (accuracy %, streak, time per decision, weakest scenarios) – ✅ (Analytics includes trends, time distribution, hardest actions; future: richer visual charts.)
5. Flashcard mode (full matrix until mastery) – ✅ (Mastery + adaptive SRS algorithm implemented.)
6. Persistence (settings, stats, mastery, SRS) – ✅ (LocalStorage abstraction via facade; ready for future backend swap.)
7. Accessibility (keyboard navigation & ARIA labels) – ✅ (Skip link, landmarks, aria-live feedback, keyboard shortcuts, axe gating <= serious/critical = 0; future: contrast interactive state polish.)

Sprint History & Status:

- Sprint 1 (Scaffold & Core): ✅ Completed on schedule.
- Sprint 2 (Drill Foundations): ✅ Feature-complete; explanation persistence later refined.
- Sprint 3 (Flashcards & Persistence): ✅ Mastery loop delivered; advanced SRS introduced ahead of roadmap (in Sprint 5).
- Sprint 4 (Variant Expansion): ✅ Variant matrix (S17/H17 + DAS + LS) integrated; presets added.
- Sprint 5 (Analytics, Accessibility, Refactor): ✅ Baseline analytics, hint system, accessibility gating, SRS algorithm, refactors, coverage uplift. Residual polish (interactive contrast states, branch coverage >55%) pushed to Sprint 6.

Current Focus: Transitioning into Sprint 6 (test & accessibility maturity) — backlog below.

Epics Breakdown:

- Core Strategy: ✅ Complete; variant coverage & edge-case H17 deviations validated via tests.
- Drill Mode: ✅ Complete; future enhancements (distribution fine-tuning, surrender frequency tuning, optional time-pressure) scheduled later.
- Persistence: ✅ Complete with abstraction for future backend swap.
- Flashcards: ✅ Adaptive SM-2 style SRS (EF clamping, lapse/overdue handling) fully integrated.
- Settings: ✅ Functional (presets, toggles, custom preset CRUD). Remaining future enhancements: advanced editor & comparison view.
- Analytics: 🟡 Expanded (weakest scenarios, hardest actions, per-action trends, cumulative accuracy series, exports, overdue SRS, time distribution). Remaining: rich chart library visuals & comparison view.

Key Recent Outcomes (Closed):

1–4. Variant integration (Surrender + DAS + H17 nuances) & engine/chart refactor – ✅
5–11. Test baseline + SRS algorithm + coverage uplift – ✅ (Current: Statements 76.35%, Branches 50.12%, Functions 81.21%, Lines 77.25%)
12 & 16–17. Accessibility enhancements & gating expansion – ✅ (Serious/critical axe violations = 0 across primary routes)
14. Template/style extraction refactor – ✅
15. SOLID-oriented service abstractions – 🟡 (Interfaces in place; add mock repository tests)
18–19. Branch coverage incremental improvements – 🟡 (Target >55% deferred to Sprint 6)

Upcoming Focus (Sprint 6 Backlog):

S6-1. Branch coverage >55% (tests for SRS overdue penalty scaling, EF min clamp, rare DAS+LS path).
S6-2. Interactive state contrast automation (hover/focus/active) & large-text 3:1 verification harness.
S6-3. Generic modal/dialog focus trap regression template; integrate with shortcut dialog.
S6-4. Accessibility CI documentation & environment variable examples (`A11Y_MAX_SERIOUS`).
S6-5. Service worker enhancement design doc (runtime caching strategy) ahead of Sprint 8.
S6-6. Mock repository unit tests for storage facade & analytics metrics (increase mutation/branch coverage).
S6-7. Time-pressure (optional countdown) drill experiment behind feature flag (may slip to Sprint 7 based on capacity).

Recent Fixes / Enhancements (Consolidated):

- Adjusted Settings component styling to use Material surface tokens instead of near-black custom background for readability; added focus-visible outlines for inputs.
- Reordered Strategy Chart sections to Hard Totals, then Soft Totals, then Pairs to align with common learning progression.
- Corrected Strategy Chart abbreviation: Split now displays as 'P' (to distinguish from Stand 'S'); Surrender as 'R'.
- Added responsive grid layout: Hard / Soft / Pairs charts display side-by-side on wide screens (>=1000px).
- Dynamic grouping of Hard total rows: consecutive totals with identical decision patterns now merged (e.g., 5-8) for denser chart.
- Updated Split abbreviation in chart from 'P' to 'Sp' for clarity and to avoid confusion with Pair notation.
- Increased global Material card padding for improved readability (24px x 28px).
- Accessibility improvements: Added skip link, navigation landmark/labels, focus-visible styles, hidden keyboard shortcut descriptions, conditional shortcut pill.
- Added global streak tracking (current & best) surfaced in Analytics.
- Keyboard shortcuts: Drill & Flashcards now accept H,S,D,P,R keys for quicker answers.
- Introduced STORAGE_FACADE injection token; components now depend on facade interface instead of concrete StorageService (improves testability & future backend swap path).
- Drill: Explanation now persists until user clicks Next (removed auto-advance) improving learning retention.
- Analytics tests refactored to use STORAGE_FACADE mock; added streak exposure test.
- Added Drill component unit tests verifying explanation persistence and answer guarding.
- Implemented adaptive SM-2 style SRS (ease factor, dynamic intervals) with unit tests.
- Flashcards now display SRS meta (due, tracked count, ease factor, next due) for transparency.
- Added per-action rolling trend mini-sparks in Analytics with supporting metrics & tests.
-- Added hardest actions summary (lowest accuracy actions with sufficient attempts) to Analytics plus unit test.
- Added Drill on-demand Hint system (non-revealing contextual guidance) with usage tracking (hint usage rate surfaced in Analytics).
- Strategy Chart legend now shows full action names; added rule abbreviation explanations (H17, S17, DAS, LS).
- Recorded hint usage per drill session (usedHint flag) for future adaptivity (e.g., weighting mastery by assistance).
- Added adaptive weak-spot reinforcement in Drill: weighted hand generation (35% chance) biases toward recently low-accuracy scenarios (tracked last 300 entries, <75% acc, ≥2 attempts).
- Removed legacy sidebar; streamlined layout; shortcuts now only appear in Drill & Flashcards.
- Removed high contrast toggle in favor of consistently brighter default text colors.
- Fixed pair scenario key bug (stored total e.g. P-14) now uses actual rank (P-7) with backward compatibility mapping.
- Added rule presets (Vegas S17/H17, Atlantic H17 LS, Single Deck) for faster configuration.
- Added custom rule preset CRUD (save current rules with name, list, apply, delete; persisted in local storage).
- Added cumulative accuracy series visualization & per-action rolling trend sparks; added CSV/JSON export of history.
- SRS tuning: Added lapse handling (partial resets), overdue EF penalty, refined interval progression (5m/30m/12h then EF-based growth), EF clamped 1.3–3.5, and tests for lapse & overdue scenarios.
- Added analytics metrics: overdue SRS items (top 10 by lateness) and decision time distribution buckets for speed insight.

Risk Updates:

- Branch Coverage Gap: Still below near-term goal (50.12% vs >55% target). Mitigation: Dedicated Sprint 6 story (S6-1) with focused specs on unexercised branches.
- Accessibility Interactive States: Contrast for hover/focus not yet automated. Mitigation: S6-2 harness addition; manual review currently performed.
- Repository Abstractions: Mock tests incomplete. Mitigation: S6-6 will add repository interface contract tests to guard future backend swap.
- Performance / Offline: Current service worker minimal; offline drill history resilience risk if network-dependent features added later. Mitigation: Sprint 8 PWA enhancement roadmap drafted early (S6-5).

Definition of Done Gap Summary:

- Tests: Robust; edge-case strategy variants validated. Coverage uplift to >55% (branch) targeted in Sprint 6 (S6-1).
- Accessibility: Serious/critical violations held at zero; interactive state contrast + large-text audits pending (S6-2); focus-trap regression template pending (S6-3).
- Changelog: Active; ensure new Sprint 6 stories append under [Unreleased].

## 16. Changelog & Release Notes

Introduced `CHANGELOG.md` following Keep a Changelog format. Historical progress (pre-file) captured at a high level; ongoing changes will be appended under [Unreleased] then versioned upon release cuts (e.g., 0.1.0 for first public MVP). Release process to include:

1. Ensure tests green & coverage threshold met.
2. Run accessibility audit (axe + manual contrast) and update any remediations.
3. Update `CHANGELOG.md` moving Unreleased section to new version heading with date.
4. Tag git version (e.g., v0.1.0) and push.
5. Deploy build artifact via GitHub Pages / Netlify.

Planned near-term tasks before first tagged release:
- Complete contrast verification & add automated axe test harness.
- Finalize remaining H17 edge case validation tests.
- Add per-decision accessibility keyboard shortcut help popup (focus-trapped dialog) with tests.

---
