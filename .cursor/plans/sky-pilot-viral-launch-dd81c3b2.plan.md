<!-- dd81c3b2-7c59-4a92-b5bc-3fbd1cbb2487 e2e783b2-4404-4d28-afcf-7b9c580efa2c -->
# Sky Pilot Landing Page - Astro + GitHub Pages

## Overview

Build a high-converting, viral-ready static landing page using Astro that positions Sky Pilot as the essential client-side open-source Sora 2 tool. Emphasis on the unique value proposition: **everything runs on your machine**, making it the most secure and cost-effective option available.

## Technical Stack

- **Framework**: Astro (static site generation, perfect for GitHub Pages)
- **Styling**: Tailwind CSS with custom theme matching OpenAI/Vercel aesthetics
- **Components**: React islands for interactive elements (cost calculator)
- **Deployment**: GitHub Pages with GitHub Actions workflow
- **Analytics**: Optional lightweight analytics (Plausible or similar)

## Site Structure

```
/Users/a12907/Documents/GitHub/sora/
├── landing/                  # [NEW] Landing page project
│   ├── src/
│   │   ├── pages/
│   │   │   └── index.astro   # Main landing page
│   │   ├── components/
│   │   │   ├── Hero.astro
│   │   │   ├── ValueProps.astro  # Client-side benefits
│   │   │   ├── Features.astro
│   │   │   ├── Demo.astro
│   │   │   ├── CostCalculator.tsx  # React component
│   │   │   ├── Installation.astro
│   │   │   ├── ComingSoon.astro    # GUI/Native teaser
│   │   │   ├── FAQ.astro
│   │   │   ├── Footer.astro
│   │   │   └── Navigation.astro
│   │   ├── layouts/
│   │   │   └── BaseLayout.astro
│   │   └── styles/
│   │       └── global.css
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── og-image.png
│   │   └── demo/             # Screenshots/GIFs/videos
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   └── package.json
├── .github/
│   └── workflows/
│       └── deploy-landing.yml  # [NEW] GitHub Actions for deployment
```

## Landing Page Sections

### 1. Hero Section
**Copy**: 
- H1: "Your Sora 2 Co-pilot 🚁"
- Subheading: "The most secure way to use OpenAI's video API. Free, open source, runs entirely on your machine."
- Badge: "✓ No server costs • ✓ Your API key stays local • ✓ 100% private"
- CTA: Two buttons - "Try Now" (copy `npx sky-pilot` command) + "View on GitHub"

**Visual**: 
- Animated terminal showing `npx sky-pilot` command execution
- Background gradient (dark with cyan/purple accents)
- Subtle particle effects or abstract shapes
- Optional: Embedded demo video thumbnail

### 2. Unique Value Proposition Section
**Headline**: "Why Sky Pilot is Different"

**Three core benefits**:

1. **"Zero Server Infrastructure"**
   - Icon: Shield with checkmark
   - "Everything runs on your machine. No data leaves your control."
   - "Your OpenAI API key never touches our servers—because we don't have any."

2. **"As Cheap As It Gets"**
   - Icon: Money/Piggy bank
   - "No markup, no subscription, no hidden fees."
   - "You pay OpenAI directly. We take nothing."

3. **"Transparent & Open Source"**
   - Icon: Open lock / Code
   - "MIT licensed. Audit every line of code."
   - "No black boxes, no vendor lock-in."

### 3. Problem/Solution Section
**Copy**: "Tired of..."
- "Worrying where your API key is stored?"
- "Bill shock from unexpected costs?"
- "Complex SDKs and manual API calls?"
- "Proprietary tools you can't trust?"

**Solution**: "Sky Pilot gives you..."
- CLI for instant video generation
- TUI dashboard for real-time monitoring
- Built-in cost calculator before you spend
- Multi-currency support (150+ currencies)

### 4. Features Grid

**Currently Available:**
1. **"One Command, Infinite Videos"**
   - `npx sky-pilot` - zero config, instant start
   - Full control over model, duration, resolution

2. **"Beautiful Terminal Dashboard"**
   - Live TUI with progress tracking
   - Sortable job list with costs
   - Keyboard shortcuts for power users

3. **"Never Get Bill-Shocked"**
   - Real-time cost estimates in your currency
   - Track every generation's actual cost
   - Detailed pricing breakdown

4. **"Privacy First"**
   - No telemetry, no tracking
   - Your videos stay on your machine
   - API key stored locally only

### 5. Interactive Demo Section

**Live Terminal Recording**:
- Embed asciinema recording or video showing:
  1. Installation with `npx sky-pilot`
  2. Creating a video with `sky-pilot create --prompt "..."`
  3. Launching TUI with `sky-pilot tui`
  4. Downloading completed video

**Screenshot Gallery**:
- CLI interface in action (with blurred API responses for privacy)
- TUI dashboard showing job grid
- Cost tracking in multiple currencies
- Download progress indicators

### 6. Cost Calculator Widget

**Interactive React Component**:
- Inputs: 
  - Model dropdown (Sora 2 / Sora 2 Pro)
  - Duration (4s / 8s / 12s)
  - Resolution (720x1280, 1280x720, 1024x1792, 1792x1024)
  - Quantity slider (1-100)
- Output: 
  - Real-time USD cost
  - User's preferred currency (auto-detect or selector)
  - Cost breakdown per video
- Comparison callout: "No markup. You pay OpenAI directly."
- CTA: "Start generating →"

### 7. Installation & Quick Start

```bash
# Zero install - just run it once
npx sky-pilot create --prompt "A serene lake at sunrise"

# Or install globally for faster access
npm install -g sky-pilot

# Launch the beautiful TUI dashboard
sky-pilot tui

# Watch progress and download when ready
sky-pilot download <video-id>
```

**Copy**: "From zero to your first AI video in 30 seconds"

**Visual**: Copy-to-clipboard buttons for each command

### 8. Coming

### To-dos

- [ ] Create Bun web server with HTML imports and WebSocket support for real-time video progress tracking
- [ ] Build React SPA with Tailwind CSS, porting TUI components to web with Shadcn/ui for OpenAI aesthetics
- [ ] Add PWA capabilities with offline queue, push notifications, and installation prompts
- [ ] Implement Tauri-based desktop app with native file access and system tray support
- [ ] Create Model Context Protocol server to expose Sora 2 capabilities to AI assistants
- [ ] Implement AI-powered prompt enhancement and smart templates in the web interface
- [ ] Execute viral marketing campaign with social media strategy, cost calculator widget, and community building