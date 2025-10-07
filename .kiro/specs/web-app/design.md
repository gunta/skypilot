# Design Document

## Overview
The SkyPilot Web App will deliver a browser-first mission control that parallels the existing CLI and Ink TUI. It reuses the shared libSQL persistence, Paraglide localization, and XState-driven orchestration so that CLI, TUI, web, PWA, and Electron surfaces stay aligned. The web bundle is authored in React (Vite) with TanStack Router/Query for navigation and data orchestration, and Canva’s App UI Kit for UI primitives, enabling fast iteration toward the PWA and macOS Electron shells.

## High-Level Architecture
- **Front-end shell:** Single-page React app bootstrapped in `apps/web/`, using TanStack Router for route composition and code splitting. The root route renders the mission control dashboard and delegates detail screens to child routes.
- **Data layer:** TanStack Query manages fetch, cache, and refetch cycles for OpenAI job data, currency settings, and local libSQL state. Query keys mirror CLI/TUI selectors (e.g., `['videos', filters]`).
- **State orchestration:** XState machines encapsulate long-running workflows—job creation, remix flows, downloads, and Mediabunny processing. `@xstate/store` holds lightweight UI/session state (locale, theme, PWA install banners).
- **Persistence:** `@libsql/client/web` connects to the existing SkyPilot SQLite schema (via Turso/libSQL URL). Mutations run through shared helper functions defined in `src/` and imported via `@core/*` aliases, ensuring consistent migrations and formatting logic.
- **Localization:** Paraglide bundles generated under `src/paraglide/` are consumed to localize UI strings, matching CLI/TUI translations.
- **Media processing:** Mediabunny loads lazily when media operations are required. The XState media machine brokers encoding and thumbnail jobs, exposing progress to the UI.
- **Target shells:** 
  - **Browser/PWA:** Uses service worker + manifest to enable offline caching of static assets and fast resume.
  - **Electron (macOS):** Wraps the same React bundle, with preload scripts exposing filesystem and notification capabilities required for downloads and sound playback.

## Route Structure
- `/` – Mission control dashboard (job listing, filters, quick actions).
- `/jobs/:id` – Job detail view with action panel (download, remix, delete, export), activity timeline, cost breakdown.
- `/create` – Guided job creation flow with prompt editor, asset uploader, and preview hooks.
- `/settings` – Localization and currency preferences page backed by libSQL settings table.
- `/downloads` – History of downloaded assets for PWA/Electron shell.

Each route composes domain-specific XState machines and TanStack Query hooks. Router loaders preload critical data, while actions handle mutations.

## Component Breakdown
- **Layout primitives:** Root layout (header, navigation rail, notification area) using Canva App UI Kit components to maintain consistent styling and accessibility.
- **Dashboard widgets:** Job table (sortable), status distribution chart (reusing shared logic from Ink TUI), cost summary banner, tracked job timeline.
- **Detail panels:** Job metadata card, activity log, asset download list, Remix prompt modal.
- **Forms:** Create/Remix forms using TanStack Form with schema validation via Zod v4; dynamic fields reuse CLI model capability definitions.
- **System banners:** Connectivity status, PWA install prompt, Electron update notifications.

## State Management Design
- **TanStack Query:**
  - `useJobsQuery(filters)` – fetches Sora jobs via shared API client.
  - `useJobDetail(jobId)` – hydrates detail panel, auto-refetches on polling interval.
  - `useSettingsQuery` / `useUpdateSettingsMutation` – reads/writes language + currency in libSQL.
  - Query invalidation triggered after create/remix/delete/download mutations coordinated by XState actions.
- **XState Machines:**
  - `jobLifecycleMachine` – orchestrates create/remix flows, handles watch mode, and interacts with Mediabunny when downloads are requested.
  - `mediaProcessingMachine` – manages Mediabunny bootstrap, asset processing queue, progress updates.
  - `connectivityMachine` – monitors libSQL and OpenAI availability, outputs status banners.
- **@xstate/store atoms:**
  - Session store for locale, currency, and feature flags.
  - UI store for modal visibility, selection state, and layout density preferences.

## Data Flow
1. **Initialization:** On app mount, the router loader invokes `ensureSettings()` which fetches language/currency from libSQL and seeds the session store. TanStack Query caches results.
2. **Dashboard render:** `useJobsQuery` pulls job data via shared `listVideos` helper. Polling uses Query’s `refetchInterval` with pause/resume tied to `document.visibilityState`.
3. **Job actions:** User triggers create/remix via forms. The `jobLifecycleMachine` validates inputs, calls shared API wrappers (`createVideo`, `remixVideo`), updates libSQL if settings change, then invalidates relevant queries.
4. **Downloads:** When jobs complete, the media machine decides whether to download assets immediately (auto-download) or wait for user action. Mediabunny handles transformations; once finished, the machine logs download history to libSQL.
5. **Error handling:** Connectivity issues push events to the connectivity machine, which updates banners and toggles offline safe behavior (disable write actions, allow read from cache).
6. **Hybrid shell integration:** PWA’s service worker caches static assets and job responses for offline read. Electron’s preload exposes FS and notifications; machines emit events consumed by preload connectors.

## Shared Utilities
- **API layer reuse:** Import functions from `src/api.ts`, `src/pricing.ts`, `src/assets.ts`, and `src/state/manager.ts` via `@core` alias, avoiding duplicated logic.
- **Localization helper:** `translate()` from `src/shared/translation.ts` ensures consistent messaging.
- **Model capabilities:** `MODEL_RESOLUTIONS` ensures create/remix forms stick to allowed configurations.

## Security & Privacy
- **API keys:** Never store `OPENAI_API_KEY` in browser storage. Web app expects native shell or user environment to supply credentials securely (e.g., Electron secure store). Browser version guides users to set environment variables or use token relay service if required for remote execution.
- **Database access:** For remote libSQL (Turso), use read-only tokens in browser context. Write operations funnel through signed requests or use serverless proxy where necessary (future iteration).
- **PWA & Electron:** Service worker caches exclude sensitive content. Electron packaging uses Hydraulic Conveyor for signing and MAS deployment.

## Accessibility & UX
- Canva App UI Kit ensures baseline WCAG compliance. Additional steps:
  - Keyboard navigation for all controls, job tables, and forms.
  - High-contrast themes mapped to user preferences stored in session store.
  - Status updates announced via live regions (React ARIA or custom).

## Telemetry & Observability
- Initial release relies on existing logging (stdout/console) for dev. Future iterations may add optional analytics consistent with privacy stance. Error boundaries capture unhandled exceptions and surface to maintainers.

## Risks & Mitigations
- **libSQL browser writes:** If browser cannot write directly, fall back to background worker or CLI sync strategy.
- **Mediabunny size limitations:** Provide graceful degradation for large assets by queuing downloads in Electron shell where FS access is reliable.
- **Version drift across shells:** Maintain shared packages (`core` modules) and run regression scripts (`bun run typecheck`, `bun run src/cli/index.ts ...`) before releases. Continuous integration should build CLI, TUI, and web bundles concurrently.
