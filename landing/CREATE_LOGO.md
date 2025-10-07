# Sky Pilot Logo Creation Guide

## Quick Start - Generate Your Logo

### Option 1: Use AI (Midjourney/DALL-E)

**Best Midjourney v7 Prompt:**
```
minimalist geometric helicopter icon logo, cyan #00d4ff to purple #8b5cf6 gradient, clean vector style, transparent background, modern tech branding, simple propeller blades, isometric view, professional software logo, 512x512px --v 7 --style raw --s 250 --ar 1:1
```

**Alternative Prompts:**

1. **Abstract/Geometric:**
```
abstract sparkle star with propeller motion, gradient cyan to purple, minimal geometric shapes, tech logo, transparent background, modern and clean, 512x512 --v 7 --style raw --ar 1:1
```

2. **Terminal-Inspired:**
```
minimalist command line terminal icon with wings, cyan purple gradient, geometric design, transparent background, developer tool aesthetic, 512x512 --v 7 --style raw --ar 1:1
```

3. **Aviation + Tech:**
```
abstract flight path icon, digital sparkles, cyan #00d4ff purple #8b5cf6 gradient, minimalist tech logo, transparent background, geometric precision, 512x512 --v 7 --style raw --ar 1:1
```

### Option 2: Use Design Tools

**Figma/Sketch/Illustrator:**
1. Create 512x512px canvas
2. Use geometric shapes
3. Apply gradient: #00d4ff → #8b5cf6
4. Keep it simple (recognizable at small sizes)
5. Export as PNG with transparency

**Key Design Elements:**
- Simple helicopter silhouette OR
- Abstract star/sparkle shape OR
- Combined terminal + flight imagery

### Option 3: Use Free Icon Tools

**Tools:**
- [Hatchful by Shopify](https://hatchful.shopify.com/) - Free logo maker
- [Canva](https://www.canva.com/) - Logo templates
- [Looka](https://looka.com/) - AI logo generator

## Logo Requirements

### Dimensions
- **Primary**: 512x512px (square)
- **Minimum**: 256x256px
- **Recommended**: 1024x1024px (scales down perfectly)

### Format
- **PNG**: With transparent background
- **WebP**: Converted from PNG for better performance

### Colors

**Primary Gradient:**
- Start: #00d4ff (Cyan)
- End: #8b5cf6 (Purple)

**Alternative Solid Colors:**
- Cyan only: #00d4ff
- Purple only: #8b5cf6
- White: #ffffff (on dark backgrounds)

### Background
- ✅ **Transparent** (required)
- ❌ No solid background colors

### Style Guidelines

**Do:**
- ✅ Keep it simple and geometric
- ✅ Use clean, sharp lines
- ✅ Make it recognizable at 16x16px
- ✅ Use gradient or solid brand colors
- ✅ Consider how it looks in monochrome

**Don't:**
- ❌ Too much detail (won't scale down)
- ❌ Text in the logo (separate from wordmark)
- ❌ Multiple colors outside brand palette
- ❌ Complex gradients or effects
- ❌ Raster effects (keep it vector-clean)

## After Creating Your Logo

### Step 1: Export Files

Export your logo in these formats:
1. **PNG** - Full quality, transparent background
2. **SVG** - Vector format (optional, best for scaling)

### Step 2: Create WebP Version

Using Squoosh.app or command line:
```bash
cwebp -q 95 skypilotlogo.png -o skypilotlogo.webp
```

### Step 3: Place Files

Copy files to the public directory:
```bash
cp skypilotlogo.png /Users/a12907/Documents/GitHub/sora/landing/public/
cp skypilotlogo.webp /Users/a12907/Documents/GitHub/sora/landing/public/
```

### Step 4: Test

1. Visit http://localhost:4321/skypilot
2. Check navigation (top left)
3. Check footer (bottom left)
4. Verify logo is crisp and clear
5. Test on mobile sizes

## File Size Targets

- **PNG**: < 50KB (compress if larger)
- **WebP**: < 25KB (usually 50-70% smaller than PNG)

If your files are too large:
- Reduce dimensions (512x512 is sufficient)
- Increase compression
- Simplify design (fewer gradients)
- Use solid colors instead of gradients

## Favicon Options

### Option 1: Use Your Logo
```bash
# Create 32x32 version
cp skypilotlogo.png favicon.png
# Resize to 32x32 using image editor or:
sips -z 32 32 favicon.png
```

### Option 2: Keep Current SVG
The current `favicon.svg` has a sparkle design that works well. You can keep it or replace it with your logo.

## Brand Consistency

Your logo should work well:
- **On dark backgrounds** (primary use case)
- **On light backgrounds** (for light mode, if added)
- **At small sizes** (16px in browser tab)
- **At large sizes** (hero section, if needed)
- **In monochrome** (GitHub profile, etc.)

## Example Logo Concepts

### Concept 1: Helicopter Minimalist
```
Simple helicopter silhouette
- Main rotor (circular)
- Tail rotor (small)
- Body (rectangular)
- Cyan-purple gradient
- Ultra clean, recognizable
```

### Concept 2: Command Spark
```
Terminal prompt (>) combined with sparkle
- ">" shape with radiating points
- Gradient fill
- Tech meets creative
```

### Concept 3: Flight Path
```
Abstract curved line representing flight
- Sparkling trail effect
- Upward movement
- Dynamic and modern
```

## Testing Different Sizes

Your logo will appear at these sizes:
- **16x16px**: Browser favicon
- **32x32px**: Navigation, footer
- **64x64px**: Potential hero section
- **192x192px**: Android home screen
- **512x512px**: Apple touch icon, PWA splash

Test your logo at all these sizes to ensure it remains clear and recognizable.

## Quick Creation Script

If you want to create a simple gradient placeholder:

```bash
# Using ImageMagick
convert -size 512x512 xc:transparent \
  -fill "gradient:#00d4ff-#8b5cf6" \
  -draw "circle 256,256 100,256" \
  skypilotlogo.png

cwebp skypilotlogo.png -o skypilotlogo.webp
```

## Resources

- **Midjourney**: Use the prompts above
- **Figma**: Free vector design tool
- **Canva**: Easy logo templates
- **Inkscape**: Free vector editor
- **GIMP**: Free raster editor
- **Squoosh.app**: Image optimization
- **ImageOptim**: Mac image optimizer

---

**Next Steps:**
1. Create/generate your logo using one of the methods above
2. Export as PNG (512x512px, transparent)
3. Convert to WebP
4. Place both files in `landing/public/`
5. Refresh browser to see your logo!

**Current Status:** Logo component is ready and will automatically load your files once added.

