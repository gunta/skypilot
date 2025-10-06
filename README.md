# Sky Pilot 🚁

[![npm version](https://img.shields.io/npm/v/sky-pilot.svg)](https://www.npmjs.com/package/sky-pilot)
[![GitHub stars](https://img.shields.io/github/stars/gunta/skypilot?style=social)](https://github.com/gunta/skypilot)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Sky Pilot is an unofficial CLI and TUI for OpenAI's Sora 2 video generation API. It helps you launch jobs, monitor progress, download outputs, and automate your release workflow with AI-authored changelog entries.

**🌐 [Visit the landing page](https://gunta.github.io/skypilot)** | **❤️ [Support via GitHub Sponsors](https://github.com/sponsors/gunta)**

> **Disclaimer:** Sky Pilot is an unofficial GUI for OpenAI's video generation API. It is not affiliated with, endorsed by, or sponsored by OpenAI.

## Why Sky Pilot?

- **🔒 Privacy First**: Runs entirely on your machine—your API key never touches our servers (because we don't have any)
- **💰 Cost Transparent**: Real-time cost tracking in 150+ currencies before and after generation
- **⚡ Zero Config**: `npx sky-pilot` and you're ready—no installation needed
- **🌍 Bilingual**: Full support for English and Japanese
- **📊 Beautiful TUI**: Terminal dashboard with live progress tracking
- **🔓 Open Source**: MIT licensed, audit every line of code

## Installation

```bash
npm install -g sky-pilot
# or use npx for one-off runs
npx sky-pilot --help
```

Make sure `OPENAI_API_KEY` is exported in your environment before running the CLI or TUI.

## CLI

```bash
sky-pilot --help
```

Common workflows:

- List jobs (newest first):
  ```bash
  sky-pilot list --limit 10
  ```
- Create a job with full control, watch progress, and download when complete:
  ```bash
  sky-pilot create \
    --prompt "A koi fish swimming through neon skyscrapers" \
    --model sora-2-pro \
    --seconds 8 \
    --size 1792x1024 \
    --input-reference ./reference.png \
    --watch \
    --download
  ```
- Retrieve a single job as JSON:
  ```bash
  sky-pilot retrieve <video-id> --json
  ```
- Download an existing job:
  ```bash
  sky-pilot download <video-id> --output ./videos/<video-id>.mp4
  ```
- Change the interface language (English or Japanese):
  ```bash
  sky-pilot language ja
  ```
  Run `sky-pilot language` with no arguments to see the current setting (stored in `~/.sky-pilot/settings.db`), or pass `next` to cycle through supported locales. When unset, Sky Pilot autodetects your locale on first run.
- Set your preferred currency for cost estimates (defaults to USD):
  ```bash
  sky-pilot currency EUR
  ```
  The command validates the 1-day cached exchange rates provided by https://open.er-api.com/ and persists your preference in `~/.sky-pilot/settings.db`. When no preference is stored, Sky Pilot attempts to autodetect your locale, region, and currency (CLI, browser, or server environments) and seeds the database with the detected currency.

Every CLI listing now includes the estimated and actual (when available) cost for each video in both USD and your preferred currency.

## Ink TUI Dashboard

Launch the Ink interface to keep tabs on active jobs:

```bash
sky-pilot tui
```

Controls:

- `↑`/`↓` or `j`/`k` — change selection.
- `c` — create a video (enter prompt, press `enter`, `esc` to cancel).
- `d` or `enter` — download the selected job to the current directory.
- `r` — refresh immediately (automatic refresh runs in the background).
- `m` — cycle the Sora model.
- `t` — cycle available durations (4s, 8s, 12s).
- `s` — cycle output resolutions.
- `l` — switch between available interface languages.
- `q` or `esc` — quit the dashboard.

The dashboard displays a banner reminding users that Sky Pilot is an unofficial GUI for OpenAI's video generation API. It renders the job list in a sortable table, shows a status distribution chart, and surfaces estimated/actual costs in your preferred currency—localized to whichever language you select.

## Development

```bash
bun install
npm run build
npm run typecheck
```

The source TypeScript remains in `src/` and is compiled to `dist/` for publishing.

## Automated Releases

Sky Pilot ships with AI-assisted release tooling:

- `npm run generate:changelog` — produces a Markdown changelog entry for the next release by feeding recent commits into GPT‑5 via the OpenAI SDK.
- `npm run release -- --type patch` — bumps the version (or use `--version 1.2.3`), regenerates the changelog, builds the package, commits, tags, and optionally publishes if you add `--publish`.

Example end-to-end release:

```bash
npm run release -- --type minor --publish
# then push the commit and tag:
git push && git push --tags
```

The release script requires a clean working tree and `OPENAI_API_KEY` to be set so the changelog generator can talk to OpenAI.

## Programmatic Usage

```ts
import { createVideo, listVideos, calculateVideoCost, getCurrencyFormatter } from 'sky-pilot';

const video = await createVideo({ prompt: 'A calm lake at sunrise', model: 'sora-2' });
const videos = await listVideos({ limit: 5 });

const cost = calculateVideoCost(video);
if (cost) {
  const formatter = await getCurrencyFormatter();
  console.log('Estimated cost', formatter.format(cost.estimatedUsd));
}
```

The Ink App and Commander program are also exported:

```ts
import { SkyPilotApp, runSkyPilotCli } from 'sky-pilot';
```

Locale detection helpers are available too:

```ts
import { detectLocale } from 'sky-pilot';

const info = detectLocale();
console.log(info.locale, info.region, info.currency);
```

## License

MIT
