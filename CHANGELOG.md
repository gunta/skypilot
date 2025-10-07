# Changelog

_Changelog entries are generated with `npm run generate:changelog` using OpenAI GPT-5 for the SkyPilot project._

## 0.2.0 - 2025-10-07

## 0.2.0

### Highlights
- Add video deletion functionality (CLI + TUI) so users can remove generated videos and free associated storage.
- Major refresh of the landing site with new components, styles, logos and demo media for a polished public experience.
- README and docs updated to reflect features and workflow changes.

### CLI & TUI
- New video deletion support exposed to the CLI and integrated into the Ink TUI (src/cli.ts, src/tui/App.tsx) — delete generated videos from storage via the tool.
- UX improvements and minor behavior tweaks in the TUI for more reliable state updates after video operations.
- Updated CLI help/documentation in README to describe the new deletion flow.

### Landing site & UX
- Large redesign and feature additions to the landing/ site:
  - New HeroPremium, ValuePropsPremium, CostCalculatorPremium and several new visual components and animations.
  - New logo and multiple demo media assets (posters, mp4s, png/svg/heic/webp).
  - Added scripts for poster generation and new styles (Tailwind config and animation CSS updates).
- Removed several obsolete landing docs and replaced with concise public-facing guides and logo assets.

### Automation & tooling
- Added landing/scripts/generate-poster.js to automate poster generation for demos.
- Minor tooling updates in landing package files (package.json, bun.lock, tailwind config) to support the refreshed site build.

### Docs
- README, landing README, and multiple markdown docs updated to cover the new features, usage, and branding.
- CHANGELOG generation helper updated.

### Dependencies
- Updates to landing build dependencies and lockfiles included to support new assets and Tailwind/layout changes.

### Breaking Changes
- Names/identifiers were changed in this cycle (commit "Changed names"). This may affect scripts, aliases, or automation that reference old CLI commands, config keys, or asset names — check the updated README and CLI help output and update any external integrations accordingly.

If you want, I can list the exact renamed CLI commands/config keys from the diff to help update automation and scripts.

## 0.1.1 - 2025-10-06

# SkyPilot — changelog for v0.1.1 (2025-10-07)

Highlights
- Documentation & website
  - README updated for improved clarity and developer onboarding.
  - Landing/LP components refreshed to improve UI and functionality of the project website/landing pages.

Automation / tooling
- Added a changelog file to track releases.

Other
- Project initialization: first commit and follow-up housekeeping (several small commits labeled "Removed", "Perfect", etc.) — miscellaneous cleanup and scaffolding.

Breaking Changes
- None in this release.

## 0.1.0 - 2025-10-06

# SkyPilot — v0.1.0

Summary: initial public release with the project scaffold and documentation/landing improvements.

## Added
- Initial project scaffold (CLI and Ink TUI baseline) — project bootstrap from first commit.
- Updated README and landing components for improved UI and functionality (better onboarding and documentation).

## Changed
- Landing page / landing components refined (LP).
- General polish and minor fixes across repo (commit message: "Perfect").
- Removed obsolete/unused files as part of repository cleanup.

## Automation & Dependencies
- No dependency or CI/tooling changes surfaced in this set of commits.

## Breaking Changes
- None identified.

Notes: This release represents the initial seed of the SkyPilot CLI/TUI project and documentation updates.
