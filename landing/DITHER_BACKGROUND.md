# Dither Background Implementation

> **Note**: This document describes the old SVG-based implementation. The current version uses an advanced canvas-based dither effect. See **DITHER_V2.md** for the latest implementation.

## Overview

Added a sophisticated dithered background effect inspired by ReactBits (https://reactbits.dev/backgrounds/dither) to enhance the landing page's visual appeal with a modern, technical aesthetic.

## Component: Dither (v2)

### Location
`src/components/DitherBackground.tsx`

### Features

1. **SVG Dither Pattern**
   - Creates a classic dither effect using alternating pixel patterns
   - Adds texture and depth to the background
   - Uses subtle opacity for non-intrusive design

2. **Animated Gradient Orbs**
   - Floating cyan and purple orbs that pulse and animate
   - Creates dynamic visual interest
   - Matches the brand colors (accent-primary and accent-secondary)

3. **Noise Filter**
   - Adds fractal noise for additional texture
   - Creates a subtle grain effect
   - Enhances the technical/developer aesthetic

4. **Gradient Overlay**
   - Radial gradient from cyan to purple
   - Ties in with the SkyPilot brand colors
   - Creates focal point in center of viewport

5. **Dither Grid Lines**
   - Repeating linear gradients
   - Creates a subtle grid pattern
   - Adds to the technical/terminal aesthetic

## Integration

### Added to `src/pages/index.astro`
```astro
<DitherBackground client:load />
```

The background is loaded as a React component with `client:load` directive to ensure it renders on the client side.

## Visual Updates

### Section Backgrounds
All sections with backgrounds now have:
- **Transparency**: `bg-bg-secondary/80` (80% opacity)
- **Backdrop Blur**: `backdrop-blur-sm` for glassmorphism effect
- Better contrast against the dithered background

### Updated Components
- `ValueProps.astro` - Semi-transparent with backdrop blur
- `Installation.astro` - Semi-transparent with backdrop blur
- `FAQ.astro` - Semi-transparent with backdrop blur
- `Footer.astro` - Semi-transparent with backdrop blur
- Cost Calculator section - Semi-transparent with backdrop blur

### Hero Section
- Removed old animated gradient background
- Now relies on the global dithered background
- Cleaner, more cohesive design

## Design Benefits

1. **Professional Aesthetic**
   - Technical, developer-focused appearance
   - Matches the terminal/CLI theme of SkyPilot
   - Modern and sophisticated

2. **Performance**
   - SVG-based for crisp rendering at any resolution
   - CSS animations are GPU-accelerated
   - Minimal JavaScript overhead

3. **Brand Cohesion**
   - Uses SkyPilot's cyan (#00d4ff) and purple (#8b5cf6) colors
   - Dark theme matches the terminal aesthetic
   - Subtle enough not to distract from content

4. **Accessibility**
   - Background is purely decorative
   - Sufficient contrast maintained for all text
   - No motion sensitivity issues (gentle animations)

## Technical Details

### Color Palette Used
- Background Base: `#0a0a0a` (near black)
- Dither Pattern: `#0f0f0f` (slightly lighter)
- Cyan Accent: `#00d4ff` (accent-primary)
- Purple Accent: `#8b5cf6` (accent-secondary)

### Animation Timing
- Pulse animation: Default timing
- Float animation: Defined in Tailwind config
- Second orb delayed by 2s for offset rhythm

### Z-Index Management
- Background: `-z-10` (behind everything)
- Content sections: Default z-index
- Navigation: `z-50` (on top)

## Browser Compatibility

- SVG filters: All modern browsers
- Backdrop filter: Chrome 76+, Safari 9+, Firefox 103+
- CSS animations: All modern browsers
- Fallback: Solid color background for older browsers

## Customization

To adjust the dither effect:

1. **Pattern Size**: Change the `width` and `height` in the pattern element
2. **Opacity**: Adjust the `opacity` values on various layers
3. **Colors**: Modify the gradient stops and orb colors
4. **Animation Speed**: Adjust animation duration in Tailwind classes
5. **Noise Intensity**: Change `baseFrequency` in the turbulence filter

## Performance Considerations

- Fixed positioning prevents repaints on scroll
- SVG is hardware accelerated
- Animations use `transform` and `opacity` for best performance
- Background doesn't affect layout calculations

## Future Enhancements

Potential improvements:
- Add parallax effect on scroll
- Interactive elements that respond to mouse movement
- Different patterns for different sections
- Light mode variant
- Configurable intensity settings

---

**Status**: ✅ Implemented
**Date**: 2025-10-06
**Inspiration**: https://reactbits.dev/backgrounds/dither
