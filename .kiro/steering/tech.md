# SkyPilot Technology Stack

_Last updated: 2025-10-07_

## Architecture Overview
- **Runtime:** TypeScript-first ESM project targeting Node.js ≥18 (`"type": "module"`). Build output lives in `dist/` after `tsc`.
- **Execution surfaces:** Commander-powered CLI (`src/cli/`), Ink/React terminal UI (`src/tui/`), and a reusable library API exported from `src/index.ts`.
- **State management:** XState (`src/state/soraMachine.ts`, `src/state/manager.ts`) drives all long-running operations and keeps CLI, TUI, and programmatic consumers in sync.
- **Persistence & caching:** Drizzle ORM with the libSQL client writing to a local SQLite database (`src/storage/`). Stores user preferences and exchange rates.
- **Internationalization:** Paraglide message catalogs compiled via Vite (`vite.paraglide.config.ts`) and consumed through generated helpers under `src/paraglide/`.
- **Planned app shells:** New React front ends (localhost web app, Chrome PWA, Electron desktop) will reuse TanStack Router for navigation and XState for statecharts, sharing domain logic with the existing CLI/TUI actors.

## Runtime Components
### Command-Line Interface
- Entry point: `src/cli/index.ts` (also published via `dist/cli/index.js` and configured as the `skypilot` binary).
- Uses Commander v14 for command/option parsing, with per-command modules (`src/cli/commands/*.ts`) to keep responsibilities separated.
- Each command talks to the shared `SoraManagerController`, ensuring stateful operations (create, remix, download, delete, refresh) always funnel through the same actor.
- `update-notifier` prompts users about npm upgrades, translating the message via Paraglide (`cli.message.updateAvailable`).

### Ink Terminal UI
- Root component: `src/tui/App.tsx`, composed of modular panels (header, cost summary, activity log, tracking timeline, thumbnail preview).
- Hooks in `src/tui/hooks/` bridge the Ink lifecycle with the XState actor (`useTuiController`, `useAppInput`, `useAppDerivedState`).
- Supports keyboard-driven workflows (c, r, m, t, s, l, d, q) and optional inline thumbnail previews (`src/tui/terminal.ts` detects iTerm support).

### Shared State & Orchestration
- `createSoraManager()` builds the XState machine that coordinates API calls, job tracking, cost calculations, and download flows.
- `SoraManagerController` wraps the actor with promise-based helpers that wait for specific operations to complete before resolving.
- Cost summaries originate from `src/pricing.ts`, which calculates per-second pricing and pairs it with localized formatting from `src/currency.ts`.

### API Integration
- `src/api.ts` owns OpenAI SDK interactions (videos.create/list/retrieve/remix/delete/downloadContent).
- Lazily instantiates the OpenAI client and throws meaningful errors if `OPENAI_API_KEY` is missing.
- Asset download logic supports video, thumbnail, and spritesheet variants with filesystem-safe naming, streaming downloads via `pipeline`.

### Data & Persistence
- SQLite file lives under `~/.skypilot/settings.db` (or `SKYPILOT_HOME` override). Tables: `settings` and `exchange_rates`.
- Settings layer (`src/config/settings.ts`) seeds defaults via locale detection (`src/locale/detect.ts`) and enforces supported language/currency codes.
- Exchange rates fetched from `https://open.er-api.com/v6/latest/{base}` are cached in memory and persisted for 24 hours (`src/currency.ts`).

## Localization Pipeline
- Message sources: `messages/en.json` and `messages/ja.json`.
- Build step: `bun run messages:build` or `vite build --config ./vite.paraglide.config.ts` generates type-safe loaders in `src/paraglide/`.
- Consumption: All user-facing copy routes through `translate()` helpers (`src/shared/translation.ts`) to maintain bilingual parity.

## Build & Tooling
- **Compiler:** TypeScript 5.9 (`tsconfig.json`) with `moduleResolution: "bundler"` and `allowImportingTsExtensions` so emitted JS keeps `.js` specifiers.
- **Task runner:** Bun scripts wrap common workflows (`bun run typecheck`, `bun run build`, `bun run src/cli/index.ts …`).
- **Formatter/Linter:** Biome (`biome.jsonc`) for zero-config formatting and linting, integrated with Ultracite guardrails. The new web app reuses the same tooling via `bunx biome`.
- **Bundler for messages:** Vite (Rolldown fork) compiles Paraglide bundles; overrides lock the dependency to `rolldown-vite`.
- **Automation scripts:** Located in `scripts/` (release, changelog generation, Homebrew formula sync) and executed with `tsx`.

## Development Environment
- Install deps with `bun install` (synchronizes `bun.lock`).
- Type checks run via `bun run typecheck`; builds produce ESM artifacts in `dist/`.
- CLI can be executed locally with `bun run src/cli/index.ts …`; `bun run src/cli/index.ts tui` launches the Ink dashboard without compiling first.
- Node.js runtime must be ≥ 18 (see `engines` field).
- Web console: `apps/web/` hosts a standalone Vite project—run `bun install` inside the package followed by `bun run dev`.

## Common Commands
- `bun run build` – compile TypeScript to `dist/`.
- `bun run typecheck` – strict TS diagnostics without emitting.
- `bun run src/cli/index.ts create --prompt "..." --watch` – end-to-end manual verification of job creation/watch flow.
- `bun run src/cli/index.ts download <video-id>` – confirm asset download pipeline.
- `bun run generate:changelog` / `bun run scripts/update-homebrew-formula.ts` – release automation.
- `bun run messages:build` – regenerate localized bundles after editing `messages/*.json`.

## Environment Variables
- `OPENAI_API_KEY` (required): authenticates all OpenAI SDK calls; CLI exits early if missing.
- `SKYPILOT_HOME` (optional): overrides the default `~/.skypilot` directory for settings DB placement.
- `npm_config_user_agent` (read-only): used to tailor update instructions (npm/pnpm/yarn/bun) in CLI notifications.
- Standard locale environment variables (`LC_ALL`, `LANG`, etc.) influence initial language/currency detection.

## External Services & Networking
- **OpenAI API** (`videos` endpoints) – core job lifecycle (create/list/retrieve/remix/delete/download).
- **open.er-api.com** – exchange rates for currency conversion.
- **GitHub Pages / Actions** – hosts and deploys the Astro landing site (workflow: `.github/workflows/deploy-landing.yml`).
- **Hydraulic Conveyor** – planned distribution channel for the macOS Electron builds (standalone and Mac App Store submissions).
- No server component ships with SkyPilot; all calls originate from the user's machine to third-party APIs.

## Observability & Logging
- Logging is primarily stdout/stderr within CLI commands (via `chalk` for formatting). No centralized telemetry or analytics are recorded.
- TUI surfaces status, cost summaries, and errors inline; consider augmenting with structured logging if automated monitoring becomes necessary.

## Testing & Quality
- Automated tests are not yet defined. Manual validation steps are documented in the README and project guidelines.
- Biome/Ultracite guardrails enforce formatting, lint correctness, accessibility, and TypeScript best practices during development.
