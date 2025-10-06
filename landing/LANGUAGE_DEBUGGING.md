# Language Switching Debug Guide

## How to Debug Language Issues

I've added console logging to help debug the language switching. Here's what to check:

### 1. Open Browser Developer Tools

- **Chrome/Edge**: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Firefox**: Press `F12` or `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)
- **Safari**: Enable Developer menu in Preferences, then `Cmd+Option+C`

### 2. Go to the Console Tab

Look for messages starting with:
- `[Sky Pilot]` - Server-side rendering logs
- `[Client]` - Client-side JavaScript logs

### 3. Test Sequence

#### Test 1: Fresh Start
```bash
# Clear everything
localStorage.clear()
location.reload()
```

Expected console output:
```
[Client] URL lang param: null
[Client] Current URL: http://localhost:4321/
[Client] Stored preference: null
[Client] First visit, detected: en (or ja if your browser is Japanese)
[Client] Redirecting to: http://localhost:4321/?lang=en
[Sky Pilot] Language from URL param: en
[Client] URL lang param: en
[Client] Stored lang preference: en
```

#### Test 2: Click Language Switcher
1. Click the language toggle button (English → 日本語 or vice versa)
2. Watch the console

Expected console output:
```
[Client] URL lang param: ja
[Client] Current URL: http://localhost:4321/?lang=ja
[Client] Stored lang preference: ja
[Sky Pilot] Language from URL param: ja
```

#### Test 3: Verify Page Content Changed
After clicking the language switcher, check:
- Hero title should change
- All button text should change
- Cost calculator should show JPY instead of USD (for Japanese)

### 4. Common Issues & Solutions

#### Issue: Clicking toggle but nothing happens
**Check:**
1. Does the URL change? Look at the address bar
2. Is there an error in console?
3. Does localStorage update? Run: `localStorage.getItem('preferred-language')`

**Solutions:**
- Try clearing localStorage: `localStorage.clear()`
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)
- Check if React component is loaded: Look for the LanguageSwitcher button

#### Issue: URL changes but content stays the same
**Check:**
1. Does the console show `[Sky Pilot] Language from URL param: ja`?
2. Are you seeing English or Japanese content?

**Solutions:**
- The page needs to fully reload for Astro to re-render
- Check network tab - is the page actually reloading?
- Try manually visiting: `http://localhost:4321/?lang=ja`

#### Issue: Always defaults to same language
**Check:**
1. What's in localStorage? `localStorage.getItem('preferred-language')`
2. Is the auto-detect redirecting you?

**Solutions:**
- Clear localStorage: `localStorage.clear()`
- Directly visit with param: `http://localhost:4321/?lang=ja`

### 5. Manual Test URLs

Test these URLs directly:

**English:**
```
http://localhost:4321/?lang=en
```
Should show:
- Title: "Your Sora 2 Co-pilot 🚁"
- Cost in USD: $0.12

**Japanese:**
```
http://localhost:4321/?lang=ja
```
Should show:
- Title: "あなたの Sora 2 副操縦士 🚁"
- Cost in JPY: ¥18

### 6. Component Translation Check

If URLs work but switcher doesn't, check if the React component is properly hydrated:

```javascript
// In console
document.querySelector('button[aria-label="Switch language"]')
```

Should return the language switcher button. If null, the component isn't loading.

### 7. Astro SSR Check

The language is set at **build time** by Astro's server-side rendering. The flow is:

1. **Server** reads `?lang=` parameter
2. **Server** renders page with that language
3. **Client** receives pre-rendered HTML
4. **Client** hydrates React components

If switching doesn't work, the issue is likely:
- React component not hydrating (`client:load` directive)
- URL not updating properly
- Page not reloading after URL change

### 8. Quick Fix Checklist

Try these in order:

1. ✅ Clear localStorage
   ```javascript
   localStorage.clear()
   ```

2. ✅ Hard refresh page
   ```
   Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)
   ```

3. ✅ Test direct URL
   ```
   http://localhost:4321/?lang=ja
   ```

4. ✅ Check button exists
   ```javascript
   document.querySelector('button[aria-label="Switch language"]')
   ```

5. ✅ Manually trigger switch
   ```javascript
   localStorage.setItem('preferred-language', 'ja')
   window.location.href = '/?lang=ja'
   ```

### 9. Expected Behavior

**Correct Flow:**
1. User clicks language toggle
2. LanguageSwitcher updates URL to `?lang=ja`
3. Page fully reloads (you'll see the page flash)
4. Server renders page in Japanese
5. Browser receives Japanese HTML
6. Done! Everything is in Japanese

**What's NOT happening:**
- ❌ Dynamic client-side translation
- ❌ Partial page updates
- ❌ Translation without reload

**What IS happening:**
- ✅ Full page reload with new language parameter
- ✅ Server-side rendering in target language
- ✅ Complete HTML replacement

### 10. If Still Not Working

Remove the debugging logs and try this simpler approach. Update `LanguageSwitcher.tsx`:

```typescript
const toggleLanguage = () => {
  const newLang = lang === 'en' ? 'ja' : 'en';
  localStorage.setItem('preferred-language', newLang);
  window.location.href = `${window.location.pathname}?lang=${newLang}`;
};
```

This uses a simpler URL construction that should work 100% of the time.

### 11. Check Translations Exist

Verify translations are loaded:

```javascript
// In browser console
fetch('/src/i18n/translations.ts').then(r => r.text()).then(console.log)
```

Or check the built files in the Network tab.

---

## Report Back

After testing, please share:
1. Console logs (copy/paste the relevant parts)
2. Current URL when clicking switcher
3. What you see vs what you expect
4. Browser and version

This will help me pinpoint the exact issue!

