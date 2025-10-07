# SkyPilot Product Overview

_Last updated: 2025-10-07_

## Product Snapshot
- **What it is:** SkyPilot is an open source toolkit that wraps OpenAI's Sora 2 video generation API with a Commander-based CLI, an Ink-powered terminal dashboard, and a programmatic TypeScript API surface.
- **Current packaging:** Published as an ESM npm package (`skypilot@0.5.0`) that exposes both the CLI binary and reusable helpers under `dist/`. Homebrew and `npx` flows mirror the npm distribution.
- **Status:** Actively developed; the latest changelog entry (`CHANGELOG.md`) was written on 2025-10-07 for version 0.1.1, while `package.json` targets 0.5.0. Align versions before the next release cut.
- **Brand promise:** Privacy-first mission control for Sora workflows—reminding users that SkyPilot is an unofficial GUI with no formal OpenAI affiliation.

## Core Capabilities
- **Job lifecycle management:** Create, list, retrieve, remix, download, delete, and export Sora 2 jobs through dedicated CLI commands (`src/cli/commands/*`) backed by a shared XState controller.
- **Interactive monitoring:** Real-time terminal dashboard (`src/tui/App.tsx`) with polling, tracked job queue, cost summaries, and inline thumbnail previews (iTerm inline image support when available).
- **Cost transparency:** Localized cost estimation in USD and a user-selected currency using cached exchange rates from `open.er-api.com` (`src/currency.ts`, `src/pricing.ts`).
- **Localization:** Bilingual English/Japanese experience across CLI and TUI via Paraglide message catalogs (`messages/en.json`, `messages/ja.json`) compiled into `src/paraglide/`.
- **Release automation:** Scripts for changelog generation, release orchestration, and Homebrew formula updates (`scripts/*.ts`), plus an Astro-based marketing site under `landing/`.
- **Persistence:** User preferences (language, currency) and cached rates stored in a local SQLite database at `~/.skypilot/settings.db` via Turso/libSQL (`src/storage/`).

## Target Users & Scenarios
- **Individual creators** who want quick, dependable access to Sora 2 without building bespoke tooling.
- **Technical artists and producers** needing fine-grained control over job parameters, cost visibility, and remix workflows from the terminal.
- **Developer advocates and maintainers** integrating SkyPilot into automation pipelines (npm module exports: `createVideo`, `waitForVideoCompletion`, Ink app, CLI entry point).
- **Localization-sensitive teams** that require bilingual UX when collaborating across English and Japanese speakers.

## Value Proposition & Differentiators
- **Client-side privacy:** The OpenAI API key never leaves the user's environment; all requests are executed locally with explicit credential checks (`ensureApiKey` in `src/cli/context.ts`).
- **Zero configuration onboarding:** `npx skypilot`, Homebrew tap, or `npm install -g` deliver an immediately usable CLI with smart defaults enforced by the Sora manager state machine.
- **Embedded cost signals:** Before and after job submission SkyPilot surfaces price-per-second estimates and localized totals, reducing unexpected spend.
- **Unified control surface:** The CLI, TUI, and programmatic API share the same `SoraManagerController`, ensuring consistent behavior across entry points.
- **Bilingual messaging:** Translations and locale-aware formatting are first-class, avoiding ad hoc strings and increasing approachability in Japanese markets.

## Experience Overview
- **CLI workflows:** Commander routes register per-command option schemas, enforce resolution/model compatibility (`src/modelCapabilities.ts`), provide progress feedback (`cli.message.progressLine`), and support watch/auto-download/remix toggles.
- **Ink dashboard:** `useTuiController` orchestrates polling, state synchronization, keyboard controls, and asset downloads, presenting cost summaries, status distribution charts, and tracked job timelines.
- **Landing & onboarding:** The Astro site in `landing/` communicates positioning, pricing, installation flows, and bilingual marketing copy; GitHub Actions deploy it to Pages (`.github/workflows/deploy-landing.yml`).
- **Library usage:** `src/index.ts` re-exports high-level helpers (`createVideo`, `calculateVideoCost`, `SkyPilotApp`, `runSkyPilotCli`) so third parties can embed Skypilot capabilities without shelling out to the binary.

## Current Roadmap Signals
- `FUTURE_PLANS.md` documents a separate “SkyPilot Composer” desktop concept. Treat it as exploratory; nothing in the repository implements that Mac app yet.
- Landing page messaging teases forthcoming GUI/native experiences. Use the steering docs to flag when those plans become real code.
- ✅ **Planned application suite (scaffolding underway in `apps/web/`):**
  - **Web App (localhost dev build):** React + TanStack Router front end running locally against the SkyPilot API layer; XState orchestrates flows similar to the CLI/TUI manager.
  - **Web App (installable PWA):** Chrome-optimized progressive web app sharing the same React/TanStack Router/XState stack, targeting quick access without native installers.
  - **Electron Desktop (macOS):** Standalone and Mac App Store variants packaged via Hydraulic Conveyor distribution. Relies on the shared React view layer, TanStack Router navigation, and XState machines to stay aligned with CLI/TUI behavior.
- Treat the three app targets as one code family—design components, statecharts, and routing contracts once, then adapt deployment shells (web, PWA, Electron).

## Risks & Constraints
- **API coverage:** Only Sora 2 video endpoints are wrapped. Audio, image, or future Sora capabilities would need new abstractions.
- **Version drift:** Keep npm version, changelog, and Homebrew formula in sync. Scripts under `scripts/` expect clean git state and configured `OPENAI_API_KEY`.
- **Localization debt:** All user-visible strings must transit through Paraglide catalogs; forgetting to add translations breaks Japanese parity.
- **Network dependencies:** Exchange rate fetching depends on `open.er-api.com`; offline scenarios fall back to cached data but may deliver stale prices.

## Release & Support Notes
- **Distribution channels:** npm (`skypilot`), Homebrew tap (`gunta/skypilot/skypilot`), and GitHub Releases once `scripts/release.ts` is executed.
- **Manual regression testing:** Until automated coverage exists, follow README guidance (`bun run src/cli/index.ts tui`, `bun run src/cli/index.ts create --prompt "..." --watch`, `download`) after major changes.
- **Support posture:** Reinforce the OpenAI affiliation disclaimer wherever users interact (CLI banner, TUI header, landing page copy).
