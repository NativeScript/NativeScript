package org.nativescript.kit

/**
 * Changes an app makes to `@nativescript/core` with patch-package
 * (`patches/@nativescript+core+<version>.patch`) that the compiler recognizes.
 * Each is off for stock core; the generated entry turns on the app's before
 * the first view is made.
 */
object CorePatches {
    /** layout-base.android `clipToBounds`: false sets the layout's `setClipChildren` and `setClipToPadding` instead of only warning. */
    var clipToBoundsChildren = false
    /** application.android `setSystemAppearance`: edge-to-edge styling applied again for the new appearance (`Utils.android.refreshEdgeToEdge`). */
    var refreshEdgeToEdge = false
    /** background.android: every gradient stop positioned as CSS positions it (`resolveGradientStopOffsets`), not only those that give an offset. */
    var resolvedGradientStops = false
}
