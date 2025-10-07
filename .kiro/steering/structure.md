# SkyPilot Project Structure

_Last updated: 2025-10-07_

## Top-Level Layout
- `src/` – Source of truth for the CLI, TUI, shared API surface, state machine, persistence layer, and localization helpers.
- `scripts/` – Automation utilities (release orchestration, changelog generation, Homebrew formula updates, Paraglide entry point).
- `messages/` – Paraglide message catalogs (`en.json`, `ja.json`) used to generate type-safe localization helpers.
- `project.inlang/` – Paraglide configuration project; run `bunx paraglide-js compile --project ./project.inlang --outdir ./src/paraglide` after message changes.
- `src/paraglide/` (generated) – Type-safe message accessors consumed throughout CLI/TUI.
- `landing/` – Astro marketing site with bilingual content, Tailwind styling, interactive components, and GitHub Pages workflow integration.
- `apps/web/` – Experimental React + TanStack Router + XState web console (also the basis for PWA and Electron shells) using Canva’s App UI Kit.
- `Formula/` – Homebrew formula (`skypilot.rb`) maintained by release scripts.
- `dist/` – Build artefacts emitted by `bun run build` (ignored in git).
- Repository docs (`README.md`, `CHANGELOG.md`, `AGENTS.md`, `FUTURE_PLANS.md`, `LANDING_PAGE_SUMMARY.md`) capture onboarding, release history, guidelines, and future product explorations.

## Source Directory Highlights (`src/`)
- **Entry points**
  - `src/index.ts` – ESM export surface for consumers embedding SkyPilot programmatically (CLI runner, Ink app, API helpers, pricing utilities).
  - `src/cli/index.ts` – Commander entry point registered as the `skypilot` binary (adds `.js` extensions in imports to keep Node-friendly specifiers).
- **API & pricing**
  - `src/api.ts` – Thin wrapper around the OpenAI SDK (`openai`) managing client instantiation, job lifecycle calls, and asset downloads.
  - `src/pricing.ts` – Pricing table and estimators for Sora models/sizes; produces human-friendly summaries via `src/currency.ts`.
  - `src/modelCapabilities.ts` – Maps Sora models to supported resolutions, validated by CLI options.
- **State & orchestration**
  - `src/state/soraMachine.ts` – XState finite state machine encapsulating job polling, downloads, currency loading, and tracked job bookkeeping.
  - `src/state/manager.ts` – Promise-based wrapper (`SoraManagerController`) that exposes high-level methods for CLI & TUI.
- **CLI**
  - `src/cli/commands/` – Per-command modules (`create.ts`, `list.ts`, `retrieve.ts`, `download.ts`, `delete.ts`, `remix.ts`, `export.ts`, `currency.ts`, `language.ts`, `tui.ts`) sharing a common `CliContext`.
  - `src/cli/context.ts` – API key enforcement, currency formatting helpers, status line rendering, and command parser utilities.
  - `src/cli/banner.ts` – Ink big text banner reinforcing the unofficial GUI disclaimer.
- **TUI**
  - `src/tui/App.tsx` – Main Ink layout combining header, tables, tracking panel, and modals.
  - `src/tui/components/` – Presentation components (brand banner, currency alert, status table, activity panel, prompt/remix modals, thumbnail preview).
  - `src/tui/hooks/` – Controller hooks bridging Ink events, keyboard input, and the XState actor.
  - `src/tui/utils.ts` / `src/tui/constants.ts` / `src/tui/types.ts` – Shared types, constants, and helpers for consistent UI behavior.
- **Shared utilities**
  - `src/shared/translation.ts` – Paraglide glue providing `translate()` and namespaced helpers.
  - `src/shared/video.ts` – Formatting helpers for video status/timestamps used across CLI and TUI.
  - `src/assets.ts` – Asset download option helpers reused by CLI and state machine.
  - `src/notify.ts` – Cross-platform completion sound or system notification hooks (check implementation for platform fallbacks).
- **Localization & currency**
  - `src/locale/` – Locale detection (`detect.ts`) and region-to-currency map (`regionCurrency.ts`).
  - `src/currency.ts` – Exchange-rate caching and formatter creation.
  - `src/config/settings.ts` – Preference storage (language, currency) layered on top of Drizzle.
- **Storage**
  - `src/storage/db.ts` – libSQL client initialization, path management (`~/.skypilot/settings.db`), and schema initialization.
  - `src/storage/schema.ts` – Drizzle schema for `settings` and `exchange_rates` tables.
- **Type declarations**
  - `src/types/*.d.ts` – Local ambient type definitions for Ink charting, update notifier, and other third-party modules lacking shipped types.

## Configuration & Tooling Files
- `package.json` – Declares scripts, exports map, binary configuration, dependency graph, and Node engine constraint.
- `bun.lock`, `package-lock.json` – Lockfiles for Bun and npm compatibility (Bun preferred for development).
- `tsconfig.json` / `tsconfig.build.json` – TypeScript compiler options (strict mode, bundler resolution, ESM targets).
- `biome.jsonc` – Formatter/linter rules enforced by Ultracite.
- `vite.paraglide.config.ts` – Vite configuration used to build localization bundles.
- `.github/workflows/deploy-landing.yml` – GitHub Actions workflow for Astro site deployment.

## Landing Site (`landing/`)
- Astro project with bilingual content, interactive components (`src/components/`), Tailwind styling, and a marketing-focused README/SETUP/LAUNCH docs.
- Includes `scripts/generate-poster.js` for demo asset generation and `components.json` for shared UI tokens.
- Separate `bun.lock` to isolate landing dependencies; keep it in sync when updating Astro or Tailwind packages.

## Data Persistence
- Runtime settings are stored in SQLite under `~/.skypilot/settings.db` (override via `SKYPILOT_HOME`).
- Exchange rates cached for 24 hours to reduce API calls; fallback to persisted values on failure/offline runs.

## Naming & Import Conventions
- Use `.js` extensions in relative imports so emitted ESM remains Node-compatible (e.g., `import { createVideo } from './api.js';`).
- Prefer aliased imports via `@/*` (configured in `tsconfig.json`) for cross-cutting utilities, especially when consumed by CLI/TUI modules.
- Maintain two-space indentation and semicolons across the TypeScript codebase per project guidelines.

## Maintenance Notes
- Regenerate localization helpers after editing `messages/*.json`.
- Keep `dist/` outputs clean; avoid checking build artefacts into git.
- When touching release automation, validate that Homebrew formula paths (`Formula/`) and landing deployment workflow still succeed.
- Document manual QA runs in PR descriptions until automated testing lands.
- Track upcoming GUI work: expect a shared React/TanStack Router codebase that targets (1) localhost web builds, (2) Chrome-friendly PWAs, and (3) macOS Electron packages distributed via Hydraulic Conveyor. Plan directory strategy (e.g., `apps/`) before implementation to keep platform shells isolated but sharing domain modules.
