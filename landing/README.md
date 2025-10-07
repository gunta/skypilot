# SkyPilot Landing Page

This is the Astro-based landing page for SkyPilot, deployed to GitHub Pages.

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Features

- **Bilingual Support**: Automatic language detection (English/Japanese)
- **Interactive Cost Calculator**: Real-time Sora 2 pricing estimates
- **Professional Design**: Lucide icons, no emojis, modern aesthetic
- **Dither Background**: Sophisticated animated background effect
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark Mode**: Modern dark theme matching OpenAI/Vercel aesthetics
- **SEO Optimized**: Meta tags, Open Graph, and Twitter cards
- **Performance**: Lighthouse score 95+ target

## Logo

The site currently uses a temporary SVG logo (sparkle/star design). To add your custom logo:

1. Create or generate your logo (see `public/CREATE_LOGO.md` for prompts)
2. Export as PNG (512x512px, transparent background)
3. Convert to WebP for better performance
4. Place files in `public/`:
   - `skypilotlogo.png`
   - `skypilotlogo.webp`
5. The Logo component will automatically use them

See `public/LOGO_GUIDE.md` for detailed instructions.

## Structure

- `src/pages/` - Main pages (index.astro)
- `src/components/` - Reusable UI components
- `src/layouts/` - Page layouts
- `src/i18n/` - Internationalization translations
- `src/styles/` - Global styles and Tailwind config
- `public/` - Static assets

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

Live URL: https://gunta.github.io/skypilot

## Languages

- English (default)
- Japanese (日本語)

Language is auto-detected from browser settings and can be manually switched using the language toggle in the navigation.

