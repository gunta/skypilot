# SkyPilot Web App (WIP)

This package hosts the experimental SkyPilot web interface. It mirrors the CLI/TUI product pillars using React, TanStack Router/Query, and XState. The goal is to ship three delivery targets with a shared codebase:

- **Localhost web app** for development and rapid prototyping.
- **Installable Chrome PWA** for lightweight access without native installers.
- **Electron (macOS)** shell (standalone + Mac App Store) distributed by Hydraulic Conveyor.

## Key Decisions

- **Routing & data:** [TanStack Router](https://tanstack.com/router/latest) handles navigation while TanStack Query manages remote state and caching.
- **State machines:** XState powers orchestration-heavy workflows; simple derived state can live in `@xstate/store`.
- **UI kit:** Canva App UI Kit establishes consistent primitives across web/PWA/Electron.
- **Media pipeline:** [`mediabunny`](https://www.npmjs.com/package/mediabunny) will support browser-friendly media operations shared with native shells.
- **Database:** The web build connects to the existing libSQL schema via `@libsql/client/web`. Configure the connection with `VITE_SKYPILOT_LIBSQL_URL` (and optional `VITE_SKYPILOT_LIBSQL_AUTH_TOKEN`) to mirror the CLI's persistence layer. Offline/dev mode gracefully falls back to a descriptive stub.

## Getting Started

```bash
cd apps/web
bun install
bun run dev
```

Environment variables live in a `.env.local` file (ignored by git). Example:

```
VITE_SKYPILOT_LIBSQL_URL=https://<project>.turso.io
VITE_SKYPILOT_LIBSQL_AUTH_TOKEN=...
```

## Project Layout

- `src/main.tsx` – bootstraps providers (TanStack Query, Router).
- `src/router.tsx` – root/child route definitions.
- `src/routes/` – route components (Home dashboard scaffold shown as example).
- `src/state/` – XState machines and store definitions.
- `src/lib/` – libSQL browser client shim + Mediabunny bootstrap helpers.
- `src/styles/` – shared CSS reset and design tokens.

## Next Steps

1. Flesh out feature routes (job list, prompt builder, remix workflows) using TanStack loaders/actions and shared `SoraManagerController` semantics.
2. Implement libSQL sync strategies (local-first vs remote) and reconcile with CLI-managed settings.
3. Integrate Paraglide translations so the web experience remains bilingual.
4. Wire Mediabunny runtime for video previews, thumbnail transforms, and download helpers.
5. Prepare PWA manifest/service worker and Electron preload to share the same React bundle.
