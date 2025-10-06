# Font Loading Fix

## Problem

Console errors showing:
```
Failed to decode downloaded font: https://fonts.googleapis.com/css2?family=Inter...
OTS parsing error: invalid sfntVersion: 791289955
```

## Root Cause

The `global.css` file had incorrect `@font-face` declarations:

```css
@font-face {
  font-family: 'Inter';
  src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
}
```

**This is wrong** because:
- Google Fonts URLs return CSS files, not font files
- The browser tried to parse CSS as a font file
- This caused the "invalid sfntVersion" error

## Solution

### ✅ Removed Incorrect @font-face Declarations

Deleted the incorrect `@font-face` rules from `src/styles/global.css`.

### ✅ Fonts Already Loaded Correctly

The fonts are properly loaded in `src/layouts/BaseLayout.astro`:

```html
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
```

This is the **correct way** to load Google Fonts.

## How It Works Now

1. **Preconnect**: Browser establishes early connection to Google's servers
2. **Load CSS**: Google Fonts CSS file is loaded via `<link rel="stylesheet">`
3. **CSS Contains @font-face**: Google's CSS has proper `@font-face` rules with actual font file URLs
4. **Browser Downloads Fonts**: Browser downloads `.woff2` font files from Google's CDN
5. **Fonts Render**: Inter and JetBrains Mono display correctly

## Font Stack in Tailwind Config

The `tailwind.config.mjs` correctly references these fonts:

```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
}
```

## Verification

After this fix:
- ✅ No console errors
- ✅ Inter font loads for UI text
- ✅ JetBrains Mono loads for code blocks
- ✅ Fonts load with `font-display: swap` for better performance
- ✅ Preconnect speeds up font loading

## Best Practices for Google Fonts

### ✅ DO:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
```

### ❌ DON'T:
```css
@font-face {
  src: url('https://fonts.googleapis.com/css2?...');
}
```

### 💡 Alternative (Self-Hosted):
If you want full control:
1. Download font files from Google Fonts
2. Add to `public/fonts/`
3. Use `@font-face` with local URLs:
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
}
```

## Performance Impact

Current setup:
- **Preconnect**: Saves ~100ms on font loading
- **font-display: swap**: Text visible immediately with fallback
- **Combined URL**: Single request for both fonts
- **Google CDN**: Fast delivery worldwide

---

**Status**: ✅ Fixed
**Date**: 2025-10-06

