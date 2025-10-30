# Android Custom Font Over-Height Issue Fix

## Problem Description

When using custom fonts in NativeScript on Android, text and icons often appeared with excessive height due to Android's default font padding behavior. This was especially noticeable with custom fonts loaded from the `src/fonts` directory.

## Root Cause

Android's TextView components include font padding by default (`includeFontPadding="true"`). This padding adds extra space above and below text to accommodate font metrics, but it often creates unwanted visual spacing with custom fonts and icon fonts.

## Solution: Global Framework Fix (NativeScript 8.9.5+)

**File Modified:** `packages/core/ui/text-base/index.android.ts`

The NativeScript core `TextBase` class has been updated to automatically disable font padding for all text elements on Android:

```typescript
public initNativeView(): void {
    super.initNativeView();
    initializeTextTransformation();
    const nativeView = this.nativeTextViewProtected;
    // Fix for custom font over-height issue on Android
    nativeView.setIncludeFontPadding(false);
    // ... rest of initialization
}
```

**Benefits:**
- ✅ Fixes the issue globally for all text-based UI elements (Label, Button, TextField, etc.)
- ✅ No need for manual intervention in app code
- ✅ Consistent behavior for system, custom, and icon fonts
- ✅ Backward compatible

**Test/Demo:**
A test page (`apps/ui/src/font-padding-test.ts` and `.xml`) demonstrates the fix. It compares system, custom, and icon fonts, and visually distinguishes before/after states. With this fix, custom and icon fonts should align visually with system fonts, and extra vertical space should be eliminated.

## Manual Fix (for older versions)

If you need to apply the fix selectively or are using an older version of NativeScript, you can manually disable font padding on specific elements:

```typescript
import { Label } from '@nativescript/core';

// In component code
const label = new Label();
label.text = "Custom font text";
if (label.android) {
    label.nativeView.setIncludeFontPadding(false);
}

// Or using loaded event
export function onLabelLoaded(args) {
    const label = args.object as Label;
    if (label.android) {
        label.nativeView.setIncludeFontPadding(false);
    }
}
```

## No Further Action Needed

**If you are using NativeScript 8.9.5 or later, this fix is applied globally and you do not need to manually set `setIncludeFontPadding(false)` on individual elements.**

## References
- [NativeScript Font Documentation](https://docs.nativescript.org/ui/styling#using-fonts)
- [Typography Best Practices](https://docs.nativescript.org/ui/styling#typography)

### 3. Custom Component Solution

Create a custom Label component that automatically handles font padding:

```typescript
// custom-label.ts
import { Label } from '@nativescript/core';

export class CustomLabel extends Label {
    public initNativeView(): void {
        super.initNativeView();
        if (this.android) {
            this.nativeView.setIncludeFontPadding(false);
        }
    }
}

// Register the component
import { registerElement } from '@nativescript/angular';
registerElement('CustomLabel', () => CustomLabel);
```

Usage in templates:
```xml
<CustomLabel text="No font padding!" class="custom-font"></CustomLabel>
```

### 4. CSS-Based Approach (Limited)

While CSS cannot directly control `includeFontPadding`, you can use CSS to compensate:

```css
.custom-font {
    font-family: "my-custom-font";
    font-weight: 400;
    /* Adjust line-height to compensate for padding */
    line-height: 1.0;
    /* Fine-tune vertical alignment */
    vertical-align: center;
}
```

## Testing the Fix

### Before Fix:
- Custom font text appears taller than expected
- Inconsistent spacing compared to design mockups
- Icons may appear oversized

### After Fix:
- Text height matches font metrics exactly
- Consistent spacing with design expectations
- Proper icon sizing

### Test Cases:

1. **Basic Label with Custom Font:**
```xml
<Label text="Test Text" class="custom-font" />
```

2. **Icon Fonts:**
```xml
<Label text="&#xf007;" class="icon-font" />
```

3. **Formatted Text:**
```xml
<Label>
    <FormattedString>
        <Span text="Custom " class="custom-font" />
        <Span text="Font" class="custom-font bold" />
    </FormattedString>
</Label>
```

## Compatibility

- ✅ **NativeScript 8.x+**: Fully supported
- ✅ **Android API 16+**: All supported Android versions
- ✅ **Angular/Vue/React**: Works with all frameworks
- ⚠️ **iOS**: Not affected (iOS handles font metrics differently)

## Migration Guide

### For Existing Projects:

1. **Update NativeScript Core** to version with this fix
2. **Remove manual workarounds** if you were using `setIncludeFontPadding(false)` manually
3. **Test your custom fonts** to ensure they render correctly
4. **Adjust any CSS** that was compensating for the padding issue

### Breaking Changes:
- None expected - this fix improves consistency with design expectations

## Performance Impact

- ✅ **Minimal**: The fix adds one native method call per text element initialization
- ✅ **No runtime overhead**: Applied once during view creation
- ✅ **Memory neutral**: No additional memory usage

## Related Issues

- Custom fonts appearing too tall on Android
- Inconsistent text spacing between platforms
- Icon fonts rendering with excessive height
- Design mockups not matching Android implementation

## Additional Resources

- [Android TextView Documentation](https://developer.android.com/reference/android/widget/TextView#attr_android:includeFontPadding)
- [NativeScript Font Documentation](https://docs.nativescript.org/ui/styling#using-fonts)
- [Typography Best Practices](https://docs.nativescript.org/ui/styling#typography)
