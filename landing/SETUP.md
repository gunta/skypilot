# Landing Page Setup Guide

## Prerequisites

- Bun installed (or Node.js 18+)
- Git

## Local Development

1. **Navigate to the landing directory**:
   ```bash
   cd landing
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Start the development server**:
   ```bash
   bun run dev
   ```
   
   The site will be available at `http://localhost:4321`

4. **Build for production**:
   ```bash
   bun run build
   ```

5. **Preview production build**:
   ```bash
   bun run preview
   ```

## Testing Languages

The site supports English and Japanese with automatic detection. To test:

- **English**: `http://localhost:4321?lang=en`
- **Japanese**: `http://localhost:4321?lang=ja`
- **Auto-detect**: `http://localhost:4321` (uses browser language)

## GitHub Pages Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

### Setup GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the sidebar
3. Under "Build and deployment":
   - Source: GitHub Actions
4. The workflow in `.github/workflows/deploy-landing.yml` will handle deployment

### Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to `landing/public/` with your domain
2. Configure DNS settings to point to GitHub Pages
3. Update `site` in `astro.config.mjs`

## Creating the OG Image

You need to create an Open Graph image for social sharing:

1. Create a 1200x630px image
2. Follow the design guidelines in `public/og-image-template.md`
3. Save as `landing/public/og-image.png`

## Demo Screenshots

To add demo screenshots/GIFs:

1. Create a `landing/public/demo/` directory
2. Add CLI and TUI screenshots/recordings
3. Reference them in the Demo component

## Troubleshooting

### Port Already in Use

If port 4321 is already in use, you can specify a different port:
```bash
bun run dev -- --port 3000
```

### Build Errors

If you encounter TypeScript errors:
```bash
bun run typecheck
```

### Language Not Switching

Clear your browser's localStorage:
```js
localStorage.clear()
```

## Contributing

When adding new features:

1. Add translations to `src/i18n/translations.ts`
2. Use the `getTranslation()` function in components
3. Test both English and Japanese versions
4. Ensure responsive design (mobile, tablet, desktop)
5. Check accessibility with screen readers

## Performance

Target metrics:
- Lighthouse score: 95+ (all categories)
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Bundle size: < 100KB (excluding fonts)

Run Lighthouse in Chrome DevTools to check performance.

