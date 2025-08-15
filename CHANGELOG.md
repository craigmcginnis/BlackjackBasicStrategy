# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog (https://keepachangelog.com/en/1.1.0/) and the project aims to follow Semantic Versioning (https://semver.org/).

## [Unreleased]
### Added
- Initial changelog scaffold capturing historical progress from SDLC progress log.
- Rule presets (Vegas S17/H17, Atlantic H17 LS, Single Deck).
- Integrated surrender variants into strategy tables (S17/H17 with LS + DAS dimension).
- Strategy Chart legend with full action names and rule abbreviation explanations.
- Weighted adaptive drill generation focusing on weak spots.
- SM-2 inspired spaced repetition system (ease factor, overdue penalty, lapse handling).
- Flashcards SRS metadata display (due, ease factor, next due timestamp).
- Analytics: weakest scenarios list, hardest actions summary, per-action rolling trend sparks, overdue SRS items, decision time distribution.
- Drill: Hint system with usage tracking; persistent explanation until Next.
- Global streak tracking (current & best) surfaced in Analytics.
- Keyboard shortcuts (H,S,D,P,R) for Drill & Flashcards.
- Accessibility enhancements: skip link, landmarks, aria-live regions, focus-visible styles, keyboard focusable chart cells, table semantics, shortcut descriptions.
- Storage facade abstraction & repository interfaces for stats/mastery/SRS/rules.
- Variant matrix validation unit tests & H17/DAS nuance test coverage.
- Headless CI Karma config (test:ci) and production build scripts.
- PWA scaffold (manifest + basic service worker registration placeholder).

### Changed
- Strategy Chart ordering (Hard, Soft, Pairs) and responsive layout with row grouping for identical hard totals.
- Split abbreviation updated from 'P' to 'Sp' for clarity.
- Settings styling updated to Material surface tokens; increased card padding globally.
- Removed legacy sidebar and high contrast toggle in favor of improved default contrast.
- Pair scenario key bug fixed (now uses actual rank, e.g., P-7) with backward compatibility mapping.

### Fixed
- H17 / DAS specific deviations (e.g., A7 vs 2 double nuance, A8 vs 6 double) validated via tests.
- Persistent explanation behavior preventing premature auto-advance.

### Internal / Tooling
- Improved function coverage toward >70% (branch + statement coverage metrics elevated).
- Added analytics & flashcards unit tests, drill component tests, SRS algorithm tests.

## Historical (Pre-Changelog Extraction)
Progress prior to establishing this file was summarized in `SDLC.md` (see Progress Update 2025-08-10 and subsequent revisions). Earlier incremental commits encompassed initial scaffold, core strategy engine, flashcards mode, analytics foundation, and accessibility baseline.
