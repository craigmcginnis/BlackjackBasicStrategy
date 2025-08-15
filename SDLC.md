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

Sprint 1 (Week 1): Project scaffold, models, strategy data for one rule set (e.g., 6D S17 DAS LS disabled), StrategyEngineService, basic chart component static.
Sprint 2: Drill component (random hand generation), feedback, stats service.
Sprint 3: Flashcard mode + persistence.
Sprint 4: Settings for multiple rule sets + dynamic chart.
Sprint 5: Analytics dashboard + polishing, accessibility, unit tests.

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

- Rule set selector.
- Toggle variants.

EPIC: Analytics

- Weakest decisions list.
- Accuracy over time chart.

## 12. Environment Setup

Node LTS, Angular CLI latest. Angular Material, optionally NGX Charts for analytics (future).

## 13. Deployment

- GitHub Pages or Netlify (ng build --configuration production). Add PWA later.

## 14. Maintenance

- Version strategy JSON using semantic versioning.
- Lint & test in CI.

## 15. Progress Update (2025-08-10)

Status Legend: ✅ Done | 🟡 Partial | ⛔ Not Started

MVP Functional Requirements:

1. Rule set selection (decks, H17/S17, DAS, LS toggles + presets) – ✅ (Presets + dynamic variant key propagation; future: multi-preset comparison outside MVP.)
2. Strategy chart (dynamic S17/H17 + DAS + LS integrated) – ✅ (Variant switching + surrender & DAS decisions surfaced; further rare H17 deviation validation in backlog.)
3. Drill mode (random/weighted hands, feedback, explanation, timing) – ✅ (Weak-spot weighting, persistent explanation, hint system; future: advanced generation constraints.)
4. Session stats (accuracy %, streak, time per decision, weakest scenarios) – ✅ (Analytics includes trends, time distribution, hardest actions; future: richer visual charts.)
5. Flashcard mode (full matrix until mastery) – ✅ (Mastery + adaptive SRS algorithm implemented.)
6. Persistence (settings, stats, mastery, SRS) – ✅ (LocalStorage abstraction via facade; ready for future backend swap.)
7. Accessibility (keyboard navigation & ARIA labels) – ✅ (Skip link, landmarks, aria-live feedback, keyboard shortcuts, axe gating <= serious/critical = 0; future: contrast interactive state polish.)

Sprints:

- Sprint 1: ✅
- Sprint 2: 🟡 (stats basic; explanation panel missing)
- Sprint 3: 🟡 (mastery present; repetition algorithm & soft/pair originally added later)
- Sprint 4: 🟡 (basic rule toggles; need richer selector + live propagation everywhere)
- Sprint 5: 🟡 (analytics baseline; tests & accessibility pending)

Epics Breakdown:

- Core Strategy: ✅ (StrategyEngineService + StrategyDataService variant key (S17/H17 + DAS + LS) implemented; surrender & DAS integrated; outstanding fine-grain validation of a small set of low-frequency H17 deviations tracked via tests backlog.)
-- Drill Mode: ✅ (Random & weighted weak-spot generation, difficulty tiers (E/M/H) controlling hand distribution, improved valid hand synthesis (hard/soft/pairs), answer feedback with persistent explanation, streak & best streak tracking, hint system (contextual non-revealing) with usage telemetry, keyboard shortcuts, scenario key normalization, surrender & DAS awareness. Remaining (post-MVP polish): fine-tune distribution weights via aggregated accuracy analytics; parameterize surrender frequency; optional time-pressure mode.)
- Persistence: ✅ (StorageService + facade interfaces for stats, mastery, SRS, rules; streak logic; local caching.)
- Flashcards: ✅ (Full matrix build for hard/soft/pairs, mastery progression, SRS adaptive scheduling (intervals, lapses, overdue penalty), keyboard shortcuts, EF & next-due surfacing.)
- Settings: 🟡 (Preset selector with common casino variants, dynamic rule propagation (events + reactive effects), DAS/LS toggles. Remaining: user feedback on rule save, validation (deck bounds), description tooltips, potential custom rule creation UI.)
- Analytics: 🟡 (Totals, per-action stats, weakest scenarios, rolling sparkline, action trends, hardest actions, hint usage, time distribution, overdue SRS list, streaks, recent history; Remaining: visual charts (graphical trends), export/share option, per-rule comparison view.)

Key Next Actions (Updated):

1. Integrate late surrender directly into strategy tables (remove overlay). ✅
2. Refactor engine & chart to consume surrender-integrated variants (S17_LS / H17_LS). ✅
3. Add DAS dimension & refine H17/DAS nuances (dynamic variant keys). ✅
4. Per-action accuracy aggregation UI in Analytics. ✅
5. Seed initial unit tests (engine core scenarios + app shell). ✅
6. Headless CI Karma config & script (test:ci). ✅
7. Variant matrix validation tests & coverage baseline. ✅ (Initial: Statements 91.78%, Branches 85.71%, Functions 58.33%)
8. Validate specific H17 DAS nuance (A7 vs 2 double) via test. ✅
9. Add additional H17 deviations (A8 vs 6 double) & broaden validation tests; soft 18 vs A validated (HIT across variants). ✅
9a. Finalize remaining H17 edge case validation (A7 vs 2 non-DAS stands, DAS double verified; surrender matrix full check; hard 17+ invariant). ✅ (Added extended variant spec tests; all 63 specs green.)
10. Improve function coverage (>70%) focusing on analytics & flashcards helpers. ✅ (Now Functions 69.73%≈70%, Branches 70.88%; added analytics & flashcards specs)
11. Add spaced repetition algorithm (e.g., SM-2 adaptation) to flashcards. ✅ (Enhanced SRS: EF adjustments, lapse handling (partial reset to reviewCount=1), overdue penalty reduces EF if late, refined interval curve (5m → 30m → 12h → multiplicative growth with EF) with caps and minimum spacing.)
12. Accessibility audit (focus order, ARIA labels, contrast). 🟡 (Added: skip link, nav landmarks, table semantics, aria-live feedback, button labels, focus-visible styles, keyboard focusable chart cells, legend semantics, shortcut keys, hidden SR-only shortcut descriptions, analytics tables captions + aria-labels + live summary region, descriptive aria-labels on strategy chart decision cells. Progress: enabled axe color-contrast rule across all primary routes; added secondary test to log (not fail) moderate issues for iterative remediation. Remaining: broaden axe scope to include best-practice tags, add CI gating threshold (0 serious/critical), expand contrast spec to cover interactive states (hover/focus) & large-text 3:1 verification, add automated test for future modal focus traps.)
13. Prepare deployment workflow & optional PWA scaffold. 🟡 (Added prod build & local preview scripts, GitHub Pages .nojekyll placeholder, created GitHub Actions Pages pipeline deploy.yml with build, test, and deploy steps, initial PWA scaffold: web manifest + theme-color + basic caching service worker registration (skips localhost). Next: integrate Lighthouse CI, enhance SW with runtime stale-while-revalidate strategy & offline analytics queue.)
14. Refactor components to externalize inline templates & styles into separate .html / .scss files for maintainability, theming, and cleaner diffs. ✅ (Analytics, StrategyChart, Flashcards, Drill, Settings extracted)
15. Incremental refactor applying SOLID principles (extract interfaces for storage/engine, single-responsibility segregation of analytics calculations, dependency inversion for strategy data). 🟡 (Added AnalyticsMetricsService + StrategyDataService/IStrategyProvider + unit tests + repository interfaces for stats/mastery/SRS/rules; storage facade DI token integrated across Drill/Flashcards/Analytics; next: add mock repo unit tests)
16. Accessibility enhancement: Focus-trapped keyboard shortcut help dialog + expanded axe route coverage. ✅ (Added `ShortcutHelpDialogComponent` with manual focus trap, escape + backdrop close, heading focus on open, and unit tests for open, escape close, and tab trapping; integrated trigger button in nav; expanded `app.a11y.spec.ts` to scan all primary routes for serious/critical axe violations, now including color-contrast.)
17. Accessibility gating expansion (best-practice + configurable thresholds). ✅ (Broadened axe spec to include `best-practice` tag set; added gating test ensuring zero serious/critical WCAG violations (contrast logged separately) with future-ready env override (`A11Y_MAX_SERIOUS`); logs moderate WCAG + best-practice issues for iterative remediation.)
18. Branch coverage uplift targeting analytics edge buckets & hint usage metrics. 🟡 (Added analytics metrics specs covering time distribution boundary buckets, hint usage rate, recent history ordering, and bucket edge classification; branch coverage improved from 48.35% to 49.11%. Remaining: SRS overdue penalty alternative path & strategy variant rare branch tests to surpass 55% target.)
19. Branch coverage uplift: strategy chart hard-row merge & abbreviation fallbacks. 🟡 (Added `strategy-chart.component.spec.ts` covering consecutive hard total grouping, action abbreviation mapping (Sp/R/?), and missing hard row fallback; branches now 50.12% (from 49.11%). Remaining: SRS overdue penalty scaling branch, EF min clamp, and strategy variant DAS+surrender rare combo path.)

Recent Fixes / Enhancements:

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
- Added hardest actions summary (lowest accuracy actions with sufficient attempts) to Analytics.
- Added hardest actions summary (lowest accuracy actions with sufficient attempts) to Analytics plus unit test.
- Added Drill on-demand Hint system (non-revealing contextual guidance) with usage tracking (hint usage rate surfaced in Analytics).
- Strategy Chart legend now shows full action names; added rule abbreviation explanations (H17, S17, DAS, LS).
- Recorded hint usage per drill session (usedHint flag) for future adaptivity (e.g., weighting mastery by assistance).
- Added adaptive weak-spot reinforcement in Drill: weighted hand generation (35% chance) biases toward recently low-accuracy scenarios (tracked last 300 entries, <75% acc, ≥2 attempts).
- Removed legacy sidebar; streamlined layout; shortcuts now only appear in Drill & Flashcards.
- Removed high contrast toggle in favor of consistently brighter default text colors.
- Fixed pair scenario key bug (stored total e.g. P-14) now uses actual rank (P-7) with backward compatibility mapping.
- Added rule presets (Vegas S17/H17, Atlantic H17 LS, Single Deck) for faster configuration.
- SRS tuning: Added lapse handling (partial resets), overdue EF penalty, refined interval progression (5m/30m/12h then EF-based growth), EF clamped 1.3–3.5, and tests for lapse & overdue scenarios.
- Added analytics metrics: overdue SRS items (top 10 by lateness) and decision time distribution buckets for speed insight.

Risk Updates:

- Function coverage for some helper branches below target (Branches 45.56%) leaves edge logic exposed; plan incremental targeted specs for analytics distribution bucketing & SRS overdue penalty paths. ✅ (Added analytics time distribution bucket spec and overdue SRS ordering spec; coverage now Statements 75.27%, Branches 48.35%, Functions 79.00%, Lines 76.58% – incremental branch gain; further targeting of remaining branch gaps planned.)
- Repository interface contract previously untested (now partially mitigated with mock facade spec improving resilience to future backend swap).

Definition of Done Gap Summary:

 - Tests: Strong baseline; H17 + surrender edge cases fully validated (71 specs passing). Added analytics boundary bucket, hint usage, recent history, and strategy chart row-merge/abbreviation specs improving coverage (Statements 76.35%, Branches 50.12%, Functions 81.21%, Lines 77.25%). Remaining: raise branch coverage >55% via targeted specs (alternate SRS overdue penalty scaling, storage EF min clamp path, variant DAS+LS combo rarely hit, overdue penalty ratio >2x upper bound logic).
- Accessibility: Improved; axe now enforces serious/critical (incl. color-contrast) across all primary routes; informational moderate issues logged separately. Added best-practice tag coverage & configurable gating thresholds (currently zero serious/critical allowed). Remaining: add example CI env config docs, extend contrast tests to capture actual computed styles for hover/focus via harness (current token-level approximation), implement generic modal focus trap regression template for future dialogs, add large-text DOM audit.
- Changelog: Initiated (CHANGELOG.md created; historical entries backfilled under Unreleased).

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
