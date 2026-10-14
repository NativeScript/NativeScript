package org.nativescript.kit

import androidx.annotation.UiThread

/**
 * Runs [body] in place: it never changes threads. A main-thread class's override is `@AnyThread`, as Java may call it
 * from any thread, and its realm guard re-enters it on the main thread before this runs; the `@UiThread` parameter
 * tells lint so, which checks [body]'s calls as main-thread calls.
 */
inline fun <T> jsOnMainThread(@UiThread body: () -> T): T = body()
