# Tailwind CSS v3 Setup - Production Ready

## Configuration

I've set up Tailwind v3.4.18 (the stable production version) instead of v4 because:

1. **Astro Compatibility**: @astrojs/tailwind v6 works perfectly with Tailwind v3
2. **Production Stability**: Tailwind v3 is battle-tested and fully stable
3. **GitHub Pages**: No issues with static site generation
4. **Future Proof**: Easy to upgrade to v4 when it's officially stable

## Files Created

### 1. `tailwind.config.ts`
Standard Tailwind v3 configuration with:
- Custom color palette (cyan/purple theme)
- Custom fonts (Inter, JetBrains Mono)
- Custom animations (gradient, float)
- Extended theme for Sky Pilot branding

### 2. `src/styles/tailwind.css`
Main CSS file with:
- Tailwind directives (@tailwind base, components, utilities)
- Custom component classes (btn-primary, card, etc.)
- Base styles (scrollbar, selection, etc.)
- Animation keyframes

## Color Palette

```css
--color-bg-primary: #0a0a0a     /* Near black */
--color-bg-secondary: #1a1a1a   /* Dark gray */
--color-bg-card: #1e1e1e        /* Card background */
--color-accent-primary: #00d4ff /* Cyan */
--color-accent-secondary: #8b5cf6 /* Purple */
--color-success: #10b981        /* Green */
--color-text-primary: #ffffff   /* White */
--color-text-secondary: #a1a1aa /* Light gray */
--color-text-muted: #71717a     /* Muted gray */
--color-border-color: #27272a   /* Border */
--color-code-bg: #18181b        /* Code background */
```

## Usage in Components

Use the custom colors with Tailwind classes:

```html
<!-- Backgrounds -->
<div class="bg-bg-primary">
<div class="bg-bg-secondary">
<div class="bg-bg-card">

<!-- Text -->
<p class="text-text-primary">
<p class="text-text-secondary">
<p class="text-text-muted">

<!-- Accents -->
<button class="bg-accent-primary">
<span class="text-accent-secondary">

<!-- Custom components -->
<button class="btn-primary">Primary Button</button>
<button class="btn-secondary">Secondary Button</button>
<div class="card">Card content</div>
<div class="code-block">Code snippet</div>
```

## Custom Components

### `.btn-primary`
- Gradient background (cyan → purple)
- Hover effects (scale, shadow)
- Rounded corners

### `.btn-secondary`
- Border style
- Hover fill animation
- Accent color theme

### `.card`
- Background with border
- Hover lift effect
- Consistent padding and radius

### `.code-block`
- Dark background
- Mono font
- Border and overflow handling

### `.section-container`
- Max width constraint (7xl)
- Responsive padding
- Vertical spacing

### `.gradient-text`
- Text with gradient fill
- Background clipping
- Cyan → purple gradient

## Animations

### `animate-gradient`
- 8s infinite loop
- Smooth gradient movement
- Used for background effects

### `animate-float`
- 6s ease-in-out loop
- Vertical floating effect
- 20px movement range

## Development

To modify styles:
1. Edit `tailwind.config.ts` for theme changes
2. Edit `src/styles/tailwind.css` for custom CSS
3. Hot reload automatically updates in browser

## Build

```bash
bun run build
```

Generates optimized CSS in production build with:
- Unused classes removed
- Minified output
- Production-ready bundle

---

**Status**: ✅ Working with Tailwind v3.4.18
**Date**: 2025-10-06

