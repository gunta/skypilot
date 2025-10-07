# Implementation Plan

- [ ] 1. Bootstrap the SkyPilot Web shell
- [x] 1.1 Wire application providers and routing context
  - Compose the React root with TanStack Router, Query, XState, and localization providers so every route shares state consistently
  - Guarantee that initial navigation renders the dashboard route once translations and session defaults are loaded
  - _Requirements: 1.1, 2.1_

- [ ] 1.2 Implement settings bootstrap handshake
  - Retrieve language and currency from the shared libSQL store during startup and seed the session store before first paint
  - Surface initialization failures with actionable messaging while keeping navigation responsive
  - _Requirements: 2.1, 2.3_

- [ ] 1.3 Validate initialization path
  - Add unit and smoke tests covering successful bootstrap, missing credentials, and degraded libSQL scenarios
  - Ensure failing cases raise observable errors without breaking the shell
  - _Requirements: 1.1, 2.3_

- [ ] 2. Deliver the mission control dashboard
- [ ] 2.1 Build jobs query and polling orchestration
  - Expose TanStack Query hooks that fetch localized job summaries and adapt polling cadence to page visibility
  - Keep query lifecycle handlers non-blocking so UI interactions stay fluid during refreshes
  - _Requirements: 1.1, 1.3_

- [ ] 2.2 Render dashboard views with actionable summaries
  - Present job tables, status charts, and cost banners that mirror CLI/TUI outputs using Canva UI primitives
  - Confirm labels and currency formatting honor the retrieved session settings
  - _Requirements: 1.1, 1.4_

- [ ] 2.3 Verify dashboard behavior
  - Implement UI tests to assert refresh cadence, loading transitions, and localized content across supported locales
  - _Requirements: 1.1, 1.3_

- [ ] 3. Implement job detail and action workflows
- [ ] 3.1 Present job detail panels
  - Show status, cost breakdown, and activity history when a job is selected, matching CLI/TUI field fidelity
  - Keep detail views synchronized with shared query caches and XState actors
  - _Requirements: 1.2_

- [ ] 3.2 Wire create, remix, download, delete, and export flows
  - Integrate job lifecycle state machines so web actions reuse shared API helpers and guardrails
  - Respect job state constraints before enabling actions, mirroring command-line safety checks
  - _Requirements: 1.4, 3.3_

- [ ] 3.3 Test job workflows
  - Exercise action flows with mocked OpenAI responses and Mediabunny processing to confirm download availability after completion
  - _Requirements: 1.2, 1.4, 3.3_

- [ ] 4. Ensure shared state consistency and resilience
- [ ] 4.1 Persist settings mutations back to libSQL
  - Provide mutation hooks that commit preference changes to libSQL and invalidate dependent TanStack Query caches
  - _Requirements: 2.2_

- [ ] 4.2 Handle connectivity degradation gracefully
  - Detect libSQL outages, display recoverable banners, and pause write actions while allowing cached reads
  - _Requirements: 2.3_

- [ ] 4.3 Resynchronize browser session data
  - Reconcile session store values with libSQL once connectivity returns to prevent preference drift
  - _Requirements: 2.4_

- [ ] 4.4 Verify resilience behaviors
  - Add integration tests simulating offline transitions and reconnection to ensure preferences stay consistent
  - _Requirements: 2.2, 2.3, 2.4_

- [ ] 5. Prepare hybrid delivery targets
- [ ] 5.1 Harden PWA experience
  - Supply manifest metadata, service worker caching, and offline fallbacks so the bundle behaves identically in Chrome PWA context
  - _Requirements: 3.1, 3.4_

- [ ] 5.2 Integrate Electron shell bridges
  - Connect the React bundle to Electron preload hooks for filesystem, notifications, and Mediabunny bootstrap
  - _Requirements: 3.2, 3.3_

- [ ] 5.3 Confirm Mediabunny media processing
  - Ensure media operations delegate to Mediabunny in both browser and Electron environments before presenting download links
  - _Requirements: 3.3_

- [ ] 5.4 Validate hybrid shells
  - Run end-to-end tests in browser, installed PWA, and Electron to confirm navigation, storage, and media flows remain consistent
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Final integration and quality pass
- [ ] 6.1 Align cross-surface parity
  - Compare web outputs with CLI/TUI to ensure job metadata, costs, and available actions stay consistent
  - _Requirements: 1.2, 1.4, 2.2_

- [ ] 6.2 Conduct regression testing
  - Execute automated suites covering mission control, resilience scenarios, and hybrid shells; remediate any regressions
  - _Requirements: 1.1, 1.3, 2.3, 3.4_

- [ ] 6.3 Readiness review
  - Verify all implementation tasks are complete, acceptance criteria satisfied, and the web experience is ready for rollout alongside CLI/TUI
  - _Requirements: 1.1, 1.4, 2.4, 3.4_
