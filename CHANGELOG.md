# Changelog

_Changelog entries are generated with `npm run generate:changelog` using OpenAI GPT-5 for the SkyPilot project._

## 0.5.2 - 2025-10-08

# 0.5.2

Highlights
- Major web app scaffolding: full new apps/web frontend (React + Vite) with UI primitives, routing, i18n, and tooltips; improved Home route layout and UX.
- Big CLI + TUI refactor with many new commands and a new TUI controller/hook architecture.
- Automation added for releases and Homebrew formula updates.

CLI & TUI
- Refactored CLI into modular commands (replacing the old monolithic src/cli.ts):
  - Added commands: create, currency, delete, download, export, language, list, remix, retrieve, tui (+ supporting context & index).
  - CSV export implemented (src/export/csv.ts).
  - Improved CLI context and initialization flow.
- TUI rewritten / reorganized:
  - New controller and hooks (useTuiController, useAppInput, useAppDerivedState, useThumbnailPreview).
  - New/updated components: RemixModal, PromptModal, ThumbnailPreviewPanel, StatusTableSection, TrackingPanel, ActivityPanel, BrandBanner, HeaderPanel.
  - More robust app state machine and Sora state management (src/state/*, src/state/soraMachine.ts).
- UX improvements in both CLI and TUI: better prompts, thumbnail preview support, currency alerts and status/tracking panels.

Web app & UX
- Integrated tooltips and enhanced HomeRoute layout.
- Video export functionality added to the web UI.
- New app structure and reusable UI components (button, card, tooltip, etc.).
- i18n updates and installation prompt localization improvements (messages/en.json, messages/ja.json, apps/web/src/lib/i18n.ts).

Automation & Release tooling
- Added release automation and maintenance scripts:
  - scripts/release.ts, scripts/generate-changelog.ts, scripts/update-homebrew-formula.ts.
  - Homebrew update script and updated Formula/skypilot.rb.
- README release instruction corrected: bump policy changed from minor → patch.

Dependencies & packaging
- Dependency and build script updates across the repo (package-lock.json, bun.lock, apps/web/bun.lock).
- Project scripts updated to use bun (package.json / scripts) — builds and local scripts now expect bun where previously npm/yarn were used.
- Vite/vitest configuration and frontend test setup added (apps/web/*, vitest config).

Documentation & product
- Extensive documentation/spec additions for the web app and product/structure/tech steering docs (.kiro/*).
- Landing page updated with advanced features, asset management, and improved components.

Breaking Changes
- Developer toolchain: package scripts now use bun. You must have bun installed to run project scripts (build, dev, release) that previously assumed npm/yarn.
- CLI refactor: the CLI has been reorganized into many command modules (new command surface). If you call the CLI programmatically or rely on internal layouts of the old src/cli.ts, you may need to update integrations and scripts that invoked internals or parsed old outputs.
- Homebrew: formula updates and an automated formula updater were added — Homebrew users should run brew update and re-install if they rely on an older formula behavior.

Notes / Migration
- Install bun for local development and CI where scripts rely on it.
- Review any tooling that invoked the old CLI internals; migrate to the exposed commands (create, list, remix, etc.).
- If you depend on Homebrew packaging, re-run the updated formula or rely on scripts/update-homebrew-formula.ts to regenerate the formula.

## 0.4.0 - 2025-10-07

## 0.4.0

### New
- Homebrew packaging
  - Added a Homebrew formula (Formula/skypilot.rb) so SkyPilot can be installed via Homebrew.
  - Added scripts/update-homebrew-formula.ts — a script to regenerate/update the Homebrew formula from the package (handles version/sha updates).

### CLI / TUI
- Improved API client usage in the CLI
  - The CLI now uses the enhanced API client initialization from src/api.ts, reducing duplicated credential-loading and making startup more reliable.

### Automation & Releases
- Release tooling
  - scripts/release.ts updated to integrate with the new Homebrew automation flow.
  - CHANGELOG.md added and README updated with relevant Homebrew / release notes.

### Internal / Developer
- API client initialization
  - Centralized and hardened client initialization in src/api.ts for more robust reuse across commands and fewer surprises when credentials or config are missing.
- Minor packaging tweaks
  - package.json adjusted and .npmignore removed.

### Fixes
- General bug fixes and polish to the release pipeline and CLI startup.

Breaking Changes
- None.

## 0.3.0 - 2025-10-07

## 0.3.0 — 2025-10-07

### Highlights
- Add Homebrew support and automation
  - New Homebrew formula (Formula/skypilot.rb) included so users can install SkyPilot via Homebrew.
  - New release helper script (scripts/update-homebrew-formula.ts) automates updating the Homebrew formula during releases.
  - README updated with Homebrew installation / release notes guidance.

- More robust API client initialization
  - The API client initialization flow was improved to provide more reliable startup behavior and clearer failure modes when configuration or credentials are missing. This reduces confusing runtime errors for CLI users.

### CLI / TUI changes
- CLI now benefits from the improved API client initialization — startup errors related to misconfiguration are clearer and handled earlier.
- Minor CLI adjustments to integrate better with the updated client initialization (smaller behavioral improvements and messaging tweaks).

### Automation & release
- Release tooling updated:
  - scripts/update-homebrew-formula.ts: adds automation to generate/update the Homebrew formula as part of the release process.
  - scripts/release.ts: small adaptions to integrate the Homebrew update step.
- These changes make it easier to publish new versions and keep the Homebrew formula in sync with releases.

### Developer / tooling
- package.json updated to support the new release/homebrew automation (small dependency / script wiring changes).
- Developer documentation (README) updated to explain Homebrew installation and the new release steps.

### Breaking Changes
- None. All changes are additive or improve initialization/error reporting; no user-facing breaking API or CLI flags were removed.

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
