# SkyPilot Logo Integration Guide

## Logo Files Needed

Place your logo files in the `landing/public/` directory:

### Required Files

1. **skypilotlogo.png** (Primary fallback)
   - Format: PNG with transparency
   - Size: 512x512px or larger (will scale down)
   - Color: Full color with transparent background
   - Use case: Fallback for browsers without WebP support

2. **skypilotlogo.webp** (Primary format)
   - Format: WebP (modern, smaller file size)
   - Size: 512x512px or larger (will scale down)
   - Color: Same as PNG
   - Use case: Modern browsers (better performance)

### File Locations

```
landing/
└── public/
    ├── skypilotlogo.png      # Add this file
    ├── skypilotlogo.webp     # Add this file
    └── favicon.svg           # Already updated with sparkle design
```

## Logo Design Specifications

### Recommended Design

Since SkyPilot represents:
- **AI Video Generation** (Sora 2)
- **Terminal/CLI Tool** (Developer-focused)
- **Privacy & Security** (Client-side)
- **Flight/Aviation Theme** ("Pilot", "Take Flight")

**Logo Concepts:**
1. **Minimalist Helicopter Silhouette**
   - Simple geometric shapes
   - Cyan to purple gradient (#00d4ff → #8b5cf6)
   - Clean, modern lines

2. **Abstract Star/Sparkle**
   - Represents AI generation
   - Gradient colors
   - Geometric, technical style

3. **Terminal + Flight Hybrid**
   - Command prompt symbol with wings
   - Technical meets aviation
   - Unique and memorable

### Technical Specs

- **Dimensions**: 512x512px minimum (square aspect ratio)
- **Background**: Transparent
- **Color Scheme**: 
  - Primary: Cyan (#00d4ff)
  - Secondary: Purple (#8b5cf6)
  - Optional: Gradient between the two
- **Style**: Minimalist, geometric, modern
- **Format**: 
  - PNG for compatibility
  - WebP for performance
- **File Size**: 
  - PNG: < 50KB
  - WebP: < 25KB

## Current Implementation

The Logo component (`src/components/Logo.tsx`) uses:

```tsx
<picture>
  <source srcSet="/skypilot/skypilotlogo.webp" type="image/webp" />
  <img
    src="/skypilot/skypilotlogo.png"
    alt="SkyPilot Logo"
    className={className}
    width={size}
    height={size}
  />
</picture>
```

This provides:
- ✅ Modern WebP format (smaller, faster)
- ✅ PNG fallback for older browsers
- ✅ Proper alt text for accessibility
- ✅ Responsive sizing
- ✅ Eager loading (no lazy load for logo)

## Where the Logo Appears

1. **Navigation** (Top of page)
   - Size: 32x32px
   - Always visible (fixed header)
   - Next to "SkyPilot" text

2. **Footer** (Bottom of page)
   - Size: 32x32px
   - Part of branding section
   - Next to "SkyPilot" text

3. **Favicon** (Browser tab)
   - Currently: Custom SVG sparkle design
   - Can be replaced with your logo
   - Should be 32x32px or 64x64px

## Midjourney Prompt for Logo

If you need to generate a logo, here's a professional prompt:

```
Minimalist abstract helicopter logo icon, geometric shapes, gradient from cyan #00d4ff to purple #8b5cf6, transparent background, clean lines, modern tech aesthetic, developer tool branding, simple and memorable, isometric style, 512x512, professional software icon --v 7 --style raw --s 250
```

Alternative prompts:
```
Abstract sparkle star icon with propeller blades, cyan to purple gradient, minimal geometric design, transparent background, tech logo, modern and clean, 512x512 --v 7 --style raw

Modern terminal icon with flight wings, gradient from electric cyan to vibrant purple, minimalist geometric design, transparent background, developer tool aesthetic, 512x512 --v 7 --style raw
```

## Optimizing Your Logo Files

### PNG Optimization
```bash
# Using ImageOptim, TinyPNG, or command line:
pngcrush -brute skypilotlogo.png skypilotlogo-optimized.png

# Or online tools:
# - TinyPNG.com
# - Squoosh.app
```

### WebP Conversion
```bash
# Using cwebp (from WebP package):
cwebp -q 90 skypilotlogo.png -o skypilotlogo.webp

# Or online tools:
# - Squoosh.app
# - CloudConvert.com
```

### Recommended Tools

1. **Squoosh.app** (Free, online)
   - Upload PNG
   - Select WebP output
   - Adjust quality (90-95%)
   - Download both formats

2. **ImageOptim** (Mac app)
   - Drag and drop PNG
   - Automatic optimization
   - Lossless compression

3. **sharp** (Node.js/Bun)
   ```bash
   bun add sharp
   ```
   ```javascript
   import sharp from 'sharp';
   
   await sharp('skypilotlogo.png')
     .resize(512, 512)
     .webp({ quality: 90 })
     .toFile('skypilotlogo.webp');
   ```

## Testing

After adding your logo files:

1. **Clear browser cache**: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)
2. **Visit**: http://localhost:4321/skypilot
3. **Check**:
   - Logo appears in navigation
   - Logo appears in footer
   - Logo is crisp and clear
   - No broken image icons
   - WebP version loads in modern browsers

### Verify WebP Loading

In browser DevTools:
1. Open Network tab
2. Reload page
3. Filter by "Img"
4. Check if `skypilotlogo.webp` is being loaded
5. If yes, WebP is working!

## Fallback

If you haven't created the logo yet, the component will show a broken image until the files are added. The Logo component expects:

```
/Users/a12907/Documents/GitHub/sora/landing/public/skypilotlogo.png
/Users/a12907/Documents/GitHub/sora/landing/public/skypilotlogo.webp
```

## Additional Logo Variants (Optional)

For maximum compatibility, consider adding:

### Apple Touch Icon
```
landing/public/apple-touch-icon.png (180x180px)
```

### Android Chrome Icons
```
landing/public/android-chrome-192x192.png
landing/public/android-chrome-512x512.png
```

### Favicon ICO
```
landing/public/favicon.ico (32x32px, 16x16px multi-size)
```

## Updating the Favicon

To use your logo as the favicon:

1. Create a simplified version (32x32px)
2. Save as `landing/public/favicon.png`
3. Update `BaseLayout.astro`:

```html
<link rel="icon" type="image/png" href="/skypilot/favicon.png" />
```

Or keep using the current SVG sparkle design in `favicon.svg`.

---

**Action Required**: 
1. Create or obtain your SkyPilot logo
2. Export as PNG (512x512px)
3. Convert to WebP
4. Place both files in `landing/public/`
5. Reload page to see your logo!

**Temporary State**: Logo component is ready but waiting for image files. Page will show broken image until files are added.

