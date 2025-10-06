# Demo Assets

This directory should contain screenshots, GIFs, and videos demonstrating Sky Pilot's features.

## Recommended Assets

### CLI Screenshots
- `cli-create.png` - Screenshot of `sky-pilot create` command in action
- `cli-list.png` - Screenshot of `sky-pilot list` output
- `cli-download.png` - Screenshot of download progress

### TUI Screenshots
- `tui-dashboard.png` - Main TUI dashboard view
- `tui-create.png` - TUI prompt creation interface
- `tui-progress.png` - Video generation progress tracking

### Animated Demos
- `cli-demo.gif` - Animated GIF of CLI workflow (create → download)
- `tui-demo.gif` - Animated GIF of TUI navigation and features

### Terminal Recordings
- `demo.cast` - Asciinema recording for embedding

## Creating Demos

### Screenshots
Use a clean terminal with good color scheme (e.g., Dracula, Nord, Monokai Pro)

### GIFs
Tools:
- [Terminalizer](https://github.com/faressoft/terminalizer)
- [asciinema](https://asciinema.org/)
- [ttygif](https://github.com/icholy/ttygif)

### Video
Tools:
- OBS Studio
- QuickTime (Mac)
- Windows Game Bar

## Guidelines

- Use realistic prompts and examples
- Blur or redact any API keys or sensitive info
- Keep file sizes reasonable (< 5MB for GIFs)
- Use consistent terminal theme across all demos
- Show successful workflows (avoid errors unless demonstrating error handling)

## Integration

Once created, reference these assets in:
- `src/components/Demo.astro`
- `src/components/Hero.astro` (for background videos/animations)
- README.md (main repository)

