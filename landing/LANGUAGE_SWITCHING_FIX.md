# Language Switching Fix

## Problem

The Japanese language toggle was not working correctly due to:
1. Relative URL construction in the LanguageSwitcher
2. Conflicting redirect logic in the auto-detection script

## Solution

### 1. Fixed LanguageSwitcher.tsx

**Before:**
```typescript
window.location.href = `?lang=${newLang}`;
```

**After:**
```typescript
const url = new URL(window.location.href);
url.searchParams.set('lang', newLang);
window.location.href = url.toString();
```

This properly constructs the full URL with the language parameter, preventing issues with relative paths.

### 2. Fixed Language Detection Script

**Improved Logic:**

1. **If URL has lang param**: Just store it in localStorage (no redirect)
2. **If no lang param AND no stored preference**: 
   - Detect from browser language
   - Store preference
   - Redirect to detected language
3. **If no lang param BUT has stored preference**:
   - Redirect to stored preference

**Key Changes:**
- Wrapped in IIFE to avoid variable pollution
- Added `is:inline` to prevent Astro processing
- Clear logic flow prevents redirect loops
- Only redirects when necessary

## How It Works Now

### First Visit (No Query Param)
```
User visits: https://example.com/
↓
Browser language = ja-JP
↓
Store 'ja' in localStorage
↓
Redirect to: https://example.com/?lang=ja
```

### Language Switch
```
User clicks language switcher (currently on ?lang=en)
↓
Toggle to 'ja'
↓
Store 'ja' in localStorage
↓
Construct full URL: https://example.com/?lang=ja
↓
Page reloads with Japanese content
```

### Return Visit
```
User visits: https://example.com/
↓
Check localStorage: 'ja' found
↓
Redirect to: https://example.com/?lang=ja
```

### Direct Link
```
User visits: https://example.com/?lang=ja
↓
Store 'ja' in localStorage
↓
No redirect (already has lang param)
↓
Show Japanese content
```

## Testing

To test the fix:

### Local Development
```bash
cd landing
bun run dev
# Visit http://localhost:4321
```

### Test Cases

1. **First visit (no lang param)**
   - Should auto-detect and redirect
   - Should show correct language

2. **Language switcher**
   - Click language toggle
   - Should switch and reload
   - Should maintain new language

3. **Direct link with lang param**
   - Visit `?lang=ja`
   - Should show Japanese
   - Should not redirect

4. **Return visit**
   - Close and reopen browser
   - Should remember last language
   - Should redirect to preference

5. **Clear localStorage and test**
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

## Browser Compatibility

The fix uses:
- `URL` API (supported in all modern browsers)
- `URLSearchParams` (supported in all modern browsers)
- `localStorage` (supported in all modern browsers)

## Debugging

If language switching still doesn't work:

1. **Check browser console** for errors
2. **Inspect localStorage**:
   ```javascript
   console.log(localStorage.getItem('preferred-language'));
   ```
3. **Check current URL**:
   ```javascript
   console.log(window.location.href);
   ```
4. **Clear cache and localStorage**:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

## Edge Cases Handled

✅ User visits without lang param  
✅ User clicks language switcher  
✅ User shares link with lang param  
✅ User returns after closing browser  
✅ User has stored preference but visits root URL  
✅ Prevents infinite redirect loops  
✅ Handles both English and Japanese correctly  

## Performance Impact

- No additional network requests
- Single redirect on first visit or when switching
- Minimal localStorage usage
- No performance degradation

---

**Status**: ✅ Fixed and tested
**Last Updated**: 2025-10-06

