/// Changes an app makes to `@nativescript/core` with patch-package
/// (`patches/@nativescript+core+<version>.patch`) that the compiler recognizes.
/// Each is off for stock core; the generated entry turns on the app's before
/// the first view is made.
public enum CorePatches {
    /// background.ios `drawBoxShadow`: the shadow's color opaque, its alpha
    /// applied once, as the layer's opacity.
    public static var opaqueShadowColor = false
    /// `_addViewToNativeVisualTree`: `insertSubviewBelowSubview` the native
    /// view at that index, in place of `insertSubviewAtIndex`.
    public static var insertBelowSubview = false
    /// ScrollView `scrollToVerticalOffset`/`scrollToHorizontalOffset`: the
    /// content offset set, clamped to the content and its adjusted insets, in
    /// place of `scrollRectToVisible`.
    public static var clampedScrollOffsets = false
    /// utils.ios `drawGradient`: every stop positioned as CSS positions it
    /// (`resolveGradientStopOffsets`), not only those that give an offset.
    public static var resolvedGradientStops = false
}
