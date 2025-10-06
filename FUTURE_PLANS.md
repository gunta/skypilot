Product Requirements Document (PRD)
Product: Sky Pilot Composer
Platforms: Mac (Electron) desktop app with React front end
Audience: Creators from first-time users to cinematography professionals
Version: v2.0

Summary
SkyPilot Sora 2 Movie Composer is a Mac desktop app that makes creating high-quality Sora 2 videos simple and controllable. The app translates the Sora 2 prompting guide into an intuitive UI: every part of a strong prompt has an optional visual control and a one-click “Refine with AI” action that expands or tightens detail. The app supports single-shot and multi-shot sequences, image reference anchoring, dialogue and audio cues, and iterative remixing. It separates “container” parameters (model, resolution, seconds) from “content” (prompt), assembles coherent prompts from modular UI sections, and manages renders, versions, and exports.

Goals and Non-Goals
- Goals
  - Make it effortless to author strong Sora 2 prompts using guided sections and templates.
  - Provide optional UI for each prompt part, plus a contextual “Refine with AI” button that increases specificity on demand.
  - Support both lightweight creative prompting and ultra-detailed cinematic specifications.
  - Encourage best practices: single action per shot, clear camera move, precise beats and timing, explicit lighting and palette, and resolution/length choices set via API parameters.
  - Enable image input anchoring with correct scaling and aspect management.
  - Provide a remix flow for controlled iterations and “nudge” changes.
  - Manage projects, shots, renders, and exports with version history.
  - Keep performance snappy and UX accessible for novices while powerful for experts.

- Non-Goals (v1)
  - Real-time multi-user collaboration.
  - Built-in advanced video editing beyond clip stitching, simple trims, and ordering.
  - Audio mixing or full soundtrack authoring (v1 supports dialogue blocks and simple ambience cues only).
  - Fine-grained model tuning or seeds if not supported by API.

Key Success Metrics
- Time to first successful render under 8 minutes for new users.
- ≥70% of users generate at least two variations using Remix.
- ≥60% of shots created via section UIs plus “Refine with AI.”
- ≥30% usage of image reference anchoring in multi-shot projects.
- Reduction in failed renders due to mismatched resolution on reference images to <3%.

Personas
- New Creator: Wants quick results with minimal jargon. Prefers templates and guided prompts.
- Filmmaker/DoP: Wants precise control over camera, lighting, lensing, palette, timing, and continuity.
- Producer/Marketer: Needs consistent look across multiple shots, safe-to-share outputs, and fast iteration.
- Educator/Student: Uses the app for learning cinematography language with Sora.

Experience Principles
- Progressive control: Start simple; reveal advanced controls on demand.
- Visual-first prompting: Every textual element can be set via visual UI components.
- One change at a time: Reinforce the Sora best practice of small, controlled nudges.
- Clarity of container vs content: API parameters separate from creative prose.
- Continuity tools: Make it easy to keep consistent characters, lighting, palette, wardrobe, and camera logic across shots.

Information Architecture
- Top-level
  - Projects (home)
  - New Project (wizard)
  - Assets (image references)
  - Renders (library of outputs)
  - Settings (API keys, defaults, telemetry consent)

- Project Workspace
  - Top bar: API container parameters (Model, Resolution, Seconds), Generate button, Preview pane toggle, Save.
  - Left panel: Shot List and Timeline (cards; reorder via drag-and-drop; durations 4/8/12).
  - Center: Prompt Canvas with section tabs (Style, Subject & Setting, Cinematography, Actions & Timing, Lighting & Palette, Dialogue & Audio, Visual References, Constraints & Continuity).
  - Right panel: Assistants (Refine with AI per section, Prompt Analyzer, Suggestions, Continuity Pins).
  - Bottom: Generation Queue and Renders strip (versions grid, Remix).

Core User Flows
1) Quick Single-Shot Flow (Novice)
- New Project → choose model, resolution, seconds.
- Choose a Template (e.g., “Interview,” “Street at Night,” “Animated Workshop,” “1970s Romance”).
- Fill minimal fields: Style (drop-down), Subject, Setting.
- Optionally press “Refine with AI” in each section to add detail.
- Generate → Preview → Save/Export → Remix if needed.

2) Multi-Shot Sequence Flow
- New Project → “Storyboard” mode with multiple shots defaulting to 4s each.
- For each shot, author sections. Use “Duplicate shot with continuity” to reuse identity/lighting cues.
- Use the Actions & Timing grid to define beats within 4/8/12 seconds.
- Generate each shot individually; review in a stitched timeline preview.
- Export stitched clip or export individual shots.

3) Image Reference Anchoring
- Upload an image for a shot or across multiple shots.
- Use the built-in crop/resize tool to match target resolution exactly.
- Enable “Use as first frame anchor” and confirm aspect match.
- Generate.

4) Dialogue
- Enable Dialogue in Dialogue & Audio section.
- Add speaker names and lines inside a structured editor (auto-formats to Dialogue block).
- Generate and review sync pacing.

5) Remix (Controlled Iterations)
- Select a render → “Remix” → choose nudge type:
  - Camera lens change
  - Lighting palette adjustment
  - Subject small change (e.g., wardrobe color)
  - Timing tweak
- The app retains existing prompt plus a clearly stated delta line (e.g., “Same shot, switch to 85 mm”).

Prompt Model and Assembly
- Prompt sections map to a descriptive template, assembled in a stable order:
  - Prose scene description
  - Cinematography: camera shot/framing, lens, DOF, camera motion, mood
  - Actions: actionable beats and timing cues
  - Lighting and palette: key/fill/rim, palette anchors
  - Dialogue: “Dialogue:” followed by labeled lines
  - Constraints: avoid signage/branding if selected; any other constraints
- Section text is generated from the UI controls with human-readable phrasing.
- “Refine with AI” per section:
  - Options: Add specificity, Reduce verbosity, Maintain continuity with shot X, Make it more cinematic, Make it more naturalistic, Improve strong nouns/verbs, Strengthen timing beats.
  - AI adds only visible, plausible details aligned with Sora best practices (e.g., “wide establishing shot, eye level; shallow DOF; volumetric light”).
- Ultra-Detailed Mode:
  - Adds Look & Format, Lenses & Filtration, Grade/Palette, Lighting & Atmosphere, Location & Framing, Wardrobe/Props/Extras, Sound, Optimized shot list (with timestamps), Camera notes, Finishing.
  - Users can auto-fill from advisory presets and then tweak.

Prompt Sections and UI (each includes an optional UI plus a Refine with AI button)
- Style & Tone
  - Controls: Style picker (e.g., “1970s 35mm,” “IMAX aerial,” “Handheld smartphone,” “2D/3D hybrid animation”), Aesthetic toggles (grain, halation, gate weave), Mood dropdown (cinematic, tender, suspenseful, playful), Strong/Light prompt slider (Control vs Creative Freedom).
  - Refine with AI: propose a first paragraph that sets look and tone; strengthen nouns and verbs.

- Subject & Setting
  - Fields: Subject identity, distinctive details (e.g., “navy coat, backpack one shoulder”), environment (location, time of day, weather), “Avoid signage/branding” toggle.
  - Refine with AI: add two to three distinctive but plausible details; maintain realism.

- Cinematography
  - Camera framing presets: wide establishing, medium close-up, aerial, low angle, slight angle from behind.
  - Lens: 24/32/40/50/85 virtual primes; Anamorphic 2.0x toggle; DOF slider; Camera motion dropdown (slow dolly, handheld ENG, tilt, arc).
  - Refine with AI: make camera choices consistent with style and subject.

- Actions & Timing
  - Beat editor: timeline segmented for 4/8/12 seconds with beat markers.
  - Add action beats with suggested verbs (“takes four steps,” “pauses,” “pulls curtain in final second”).
  - Refine with AI: tighten timing language into clearly counted beats.

- Lighting & Palette
  - Light sources: key/fill/rim; direction and quality (soft/hard); temperature.
  - Palette anchors: choose 3–5 colors with chips.
  - Refine with AI: compose a single lighting sentence and a palette anchor list.

- Dialogue & Audio
  - Dialogue block builder with speaker names and lines; length guidance based on clip seconds.
  - Background sound cues: diegetic ambience presets (wind, street noise, espresso machine hum).
  - Refine with AI: smooth lines to fit timing and tone.

- Visual References (Image Input)
  - Upload image; validate resolution must match the project’s size exactly.
  - Crop/resize tool with safe, cover, or letterbox options and auto-match to 1280x720, 720x1280, 1024x1792, 1792x1024.
  - “Use as input_reference (anchor first frame)” toggle and per-shot or global application.
  - Refine with AI: align prose with the given visual (character design, wardrobe, set).

- Constraints & Continuity
  - Pins: lock identity, wardrobe, palette, lighting logic, camera logic across selected shots.
  - Constraints list: avoid signage/branding, generic destinations, no overexposed flare breaking silhouette.
  - Refine with AI: phrase continuity instructions clearly and minimally.

- Prompt Analyzer (right panel)
  - Flags: missing camera framing, vague verbs, conflicting lighting cues, too many actions, dialogue too long for duration, inconsistent character descriptions across shots.
  - Suggestions: convert weak phrases into strong, visible results.

API Parameters and Render Controls (Top Bar)
- Model: sora-2, sora-2-pro.
- Size (resolution):
  - sora-2: 1280x720, 720x1280
  - sora-2-pro: 1280x720, 720x1280, 1024x1792, 1792x1024
- Seconds: 4, 8, 12 (default 4).
- Best-practice helper: Suggest stitching two 4s clips instead of one 8s for reliability.
- Validation:
  - Block generate if image reference doesn’t match selected size.
  - Warn if dialogue is too long for duration.
  - Warn on complex multi-action instructions; suggest simplifying.

Remix
- Select an existing render → “New Remix.”
- Choose a single nudge (one change at a time).
- App auto-builds a delta prompt that starts with “Same shot, …” and preserves pinned continuity.
- Options: Color change, lens swap, motion tweak, add a second character, lighting palette change.
- Render outputs create a version branch under the original.

Renders and Review
- Preview area: grid view for variations; side-by-side compare.
- Version tree: shows base and remixes.
- Rate and tag: “Close to vision,” “Good look, off action,” “Keep palette,” “Wrong identity.”
- Stitch preview (timeline): place shots in order, adjust trim within shot bounds, preview sequence playback.

Exports
- Single shot: MP4 (default) and GIF (if provided by API; otherwise convert locally).
- Sequence export: stitch MP4s locally using ffmpeg (bundled or wasm fallback).
- Export metadata: include assembled prompt text and container parameters as a sidecar JSON for reproducibility.
- Poster frame selector.

Data Model (conceptual)
- Project: id, name, model, size, defaultSeconds, shots[], assets[], settings.
- Shot: id, duration, sections (style, subject, cinematography, actions, lighting, dialogue, constraints), references (image), continuityPins, assembledPromptText.
- RenderJob: id, shotId, promptText, params (model, size, seconds, input_reference), status, progress, resultUrl, error, parentRenderId (for Remix), createdAt.
- Asset: id, type=image, path, width, height, color profile.

System Architecture
- Electron shell for Mac; React front end with TypeScript.
- State management: lightweight store (Zustand or Redux Toolkit). Persist to local IndexedDB + project .json files in user’s chosen folder.
- Render worker: queue that limits concurrency, retries on transient API errors, cancelable jobs.
- API integration:
  - POST /videos with form-data: model, size, seconds, prompt, input_reference (optional file).
  - GET /videos/{id} or status endpoint; polling or WebSocket if available.
  - Authentication: securely store API key in macOS Keychain; never write to logs.
  - Timeouts and progress: display server-side status (queued, processing, uploading, done).
  - Error handling: human-readable messages and remediation suggestions.
- Local media handling:
  - Cache downloads in app data folder.
  - FFmpeg for stitching and format conversion.

Accessibility
- Full keyboard navigation, clear focus states, skip-to-editor.
- High-contrast theme and font scaling.
- Color chips with names and hex values; never rely on color alone for meaning.
- Descriptive labels, tooltips, and help text explaining cinematography terms.
- Screen reader-friendly: section summaries and “assembled prompt preview.”

Localization
- UI copy in i18n strings; left-to-right and right-to-left support.
- Measurements and time shown consistently; explanatory microcopy translated.

Trust and Safety
- Default “avoid signage/branding” enabled.
- Content policy reminders in new project wizard and before generate.
- Report output button, opt-in telemetry only.

Telemetry (opt-in)
- Time to first render, use of Refine with AI per section, frequency of Remix, error types.
- No prompt content or media collected without explicit user consent.

Onboarding
- First-run sample project with two shots: one interview and one movement scene.
- “Teach me” guided tour that explains container vs content and how to add beats.
- Examples Gallery with the two detailed example prompts from the guide adapted into section UIs.

Detailed UI Specifications by Section (with defaults and validation)
- Style & Tone
  - Inputs: Style preset; Mood; Control–Freedom slider.
  - Defaults: Style empty, Mood “neutral cinematic,” slider centered.
  - Validation: none; Analyzer suggests adding style if missing.

- Subject & Setting
  - Inputs: Subject description (1–2 sentences), Environment (location, time of day, weather), Distinctive details, Avoid signage toggle (default on).
  - Validation: encourage at least one distinctive detail.

- Cinematography
  - Inputs: Framing preset, Lens, DOF slider, Camera motion.
  - Validation: require a framing; warn if multiple camera moves.

- Actions & Timing
  - Inputs: Beat list with timestamps; one main action recommended.
  - Validation: flag more than three beats for 4 seconds; propose trimming.

- Lighting & Palette
  - Inputs: Key/fill/rim; palette chips (3–5 required for stable look).
  - Validation: warn if palette anchors are missing.

- Dialogue & Audio
  - Inputs: Speaker name, line; background ambience.
  - Validation: character count budget based on seconds (e.g., ~60–80 chars for 4s).

- Visual References
  - Inputs: Upload image; auto-check resolution; crop/resize; apply globally or per shot.
  - Validation: hard-stop if size mismatch persists.

- Constraints & Continuity
  - Inputs: Pins across shots; constraint checkboxes.
  - Validation: show pinned fields on shot duplication; ensure consistent phrasing.

Prompt Refinement AI Behavior
- Each “Refine with AI” passes the current section content plus:
  - The project’s style and container parameters.
  - Continuity pins.
  - Instruction to adhere to Sora prompting best practices: visible cues, clear camera directions, single action, beats with timing, consistent palette.
- Global refine:
  - “Make more specific”
  - “Make more creative”
  - “Match shot 1’s identity and lighting”
  - “Convert to ultra-detailed cinematic format”
  - “Simplify to a lighter prompt”

Generation Queue and States
- States: Draft, Pending, Queued, Rendering, Uploading, Completed, Failed, Canceled.
- Progress bar and ETA if available; otherwise stepwise status.
- Cancel and Retry controls; log-lined error explanations.

Continuity and Sequences
- “Duplicate with continuity” button: clones a shot with pins active.
- “Continuity Monitor” warns if subject/lighting/wardrobe drift between pinned shots.
- “Lock look” toggle: freezes Style, Lighting, Palette across selected shots.

Best Practice Nudges
- Recommend stitching multiple 4s shots instead of a single 8s for complex sequences.
- Warn if mixing too many cinematography choices in a single shot.

Keyboard Shortcuts (Mac)
- Cmd+N: New Project
- Cmd+S: Save
- Cmd+Enter: Generate current shot
- Option+Enter: Remix last render
- Cmd+1…8: Jump to section
- Space: Play/pause preview
- Cmd+D: Duplicate shot

Performance Targets
- Cold start under 3 seconds to editor on modern Macs.
- Render job UI update latency under 200 ms.
- Prompt assembly under 30 ms per shot.

Testing and Acceptance
- Unit tests for prompt assembly, validation rules, and AI refinement shaping.
- Integration tests: image size check, generator queue, retry logic.
- Manual QA: end-to-end flows for all personas, accessibility checks, offline mode for drafting.

Risks and Mitigations
- Risk: Users paste long dialogue exceeding time.
  - Mitigation: dialogue length budget and auto-summarize option.
- Risk: Mismatched reference image sizes.
  - Mitigation: mandatory crop/resize with preview; block generate until correct.
- Risk: Over-specified prompts reduce creative results.
  - Mitigation: control–freedom slider; quick “simplify” refinement.
- Risk: API throttling or failures.
  - Mitigation: job queue, exponential backoff, graceful retry UX.

Open Questions
- Are audio tracks returned with videos? If not, how should dialogue guidance be handled post-render?
- Does the API expose a remix endpoint or should Remix reuse the same endpoint with a delta prompt and prior render as reference?
- What are rate limits and pricing to reflect in render budget UI?
- Are seeds supported? If yes, add seed controls for repeatability.

Roadmap (post v1)
- Collaborative review and comments.
- Multi-language prompt assistance and localization.
- Advanced audio: scoring, stems, and mix controls.
- Template marketplace and style packs.
- Cloud sync for projects and assets.
- Integration with NLEs (Premiere, Final Cut) via XML/EDL export.

Developer Notes and API Mapping
- Sora API calls (assumed; verify with latest docs):
  - Create video: POST /videos with form-data:
    - model: sora-2 or sora-2-pro
    - size: e.g., 1280x720
    - seconds: 4 | 8 | 12
    - prompt: assembled text from sections
    - input_reference: file (optional; must match size)
  - Get status: GET /videos/{id}
  - List renders: GET /videos
- Headers: Authorization: Bearer <apiKey>; Content-Type: multipart/form-data
- Security: Store apiKey in macOS Keychain; never include in project files.
- Project file format: JSON with all sections, pins, and prompt history; keep media file paths relative.
- Export sidecar JSON: includes prompt, params, render id, timestamps.

Copy and Microcopy Examples
- Analyzer hint for weak phrasing: “Try replacing ‘beautiful street’ with visible cues like ‘wet asphalt, zebra crosswalk, neon reflections in puddles.’”
- Timing hint: “For 4 seconds, aim for 1–3 beats. Consider a single clear action.”
- Continuity pin tooltip: “Pinned details will be reused across selected shots to keep identity consistent.”

Onboarding Templates (seed content)
- 90s documentary interview.
- Street at night with reflections.
- Hand-painted 2D/3D hybrid robot workshop.
- 1970s 35mm rooftop romance.

Edge Cases
- Empty prompt: block generate and highlight missing key sections (at least Style or Subject & Setting and Cinematography framing).
- Conflicting instructions (e.g., “deep focus” and “shallow DOF”): Analyzer highlights and proposes one.
- Excessive number of actions for 4 seconds: prompt to split into two shots.

What Makes This UI “Most Easy to Use”
- Every prompt part has a tangible UI control and optional AI refinement that writes camera-ready language.
- Clear separation between API container parameters and creative content so users don’t try to set length via prose.
- Continuity pins to keep identity and look consistent across shots.
- Beat editor to make timing explicit, as recommended.
- Image reference tooling guarantees correct resolution anchoring with no guesswork.
- Remix workflow encourages “nudging” one change at a time.

Acceptance Criteria (v1)
- Users can generate a single shot from a minimal template within 8 minutes on first run.
- Each prompt section offers a “Refine with AI” that produces syntactically correct, visible cues.
- Renders can be remixed with one-change deltas, producing a new version tree.
- Image input cannot be submitted unless it matches selected size.
- Projects, shots, and renders persist reliably across relaunch.

This PRD translates Sora 2 prompting best practices into a progressive, guided UI that scales from simple to ultra-detailed workflows, with refinement tools at every step and tight integration with the API’s explicit parameters.