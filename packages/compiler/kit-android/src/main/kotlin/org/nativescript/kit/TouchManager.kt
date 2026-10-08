package org.nativescript.kit

import java.lang.ref.WeakReference

/**
 * `TouchManager` from ui/gestures/touch-manager: down and up animations on
 * views that are touched. With `enableGlobalTapAnimations`, every view with
 * a tap listener gets them when it loads, unless it sets
 * `ignoreTouchAnimation`; a view's own `touchAnimation` comes before `animations`.
 */
object TouchManager {
    var enableGlobalTapAnimations: Boolean = false
    /** `{ down, up }`: animation definitions without a target, or functions given the view. */
    var animations: Any? = null

    private class Definition(val view: WeakReference<View>, val type: String, val animation: Animation)

    private val definitions = mutableListOf<Definition>()

    /** `ViewCommon.onLoaded`'s check, then `addAnimations`. */
    internal fun viewLoading(view: View) {
        val hasTap = view.hasHandlers("tap") || view.hasHandlers("tapChange") || view.hasGestureObservers(GestureTypes.tap)
        if (isOn(view.applied["ignoreTouchAnimation"])) return
        if (isOn(view.applied["touchAnimation"]) || (enableGlobalTapAnimations && hasTap)) addAnimations(view)
    }

    /** A property's value as its `booleanConverter` (text) or JavaScript truthiness reads it. */
    private fun isOn(value: Any?): Boolean = if (value is String) toBool(value) == true else jsTruthy(value)

    private fun own(view: View, type: String): Any? = jsField(view.applied["touchAnimation"], type)?.takeIf { jsTruthy(it) }

    private fun global(type: String): Any? = jsField(animations, type)?.takeIf { jsTruthy(it) }

    /** The Android branch: the view's `touch` gesture plays the down animation, and the up one on up or cancel. */
    fun addAnimations(view: View) {
        val handleDown = (own(view, "down") ?: global("down")) != null
        val handleUp = (own(view, "up") ?: global("up")) != null
        if (!handleDown && !handleUp) return
        view.on("touch") { event ->
            when (event.action) {
                TouchAction.down -> if (handleDown) startAnimation(view, "down")
                TouchAction.up, TouchAction.cancel -> if (handleUp) startAnimation(view, "up")
            }
        }
    }

    /** `startAnimationForType`: cancels the view's touch animations in progress, then plays (or replays) this type's. */
    fun startAnimation(view: View, type: String) {
        val definition = (if (view.applied["touchAnimation"] is JSDynamic) own(view, type) else null) ?: global(type) ?: return
        if (jsIsFunction(definition)) {
            jsCall(definition, view)
            return
        }
        definitions.removeAll { it.view.get() == null }
        var touchAnimation: Animation? = null
        for (d in definitions) {
            if (d.view.get() !== view) continue
            d.animation.cancel()
            if (d.type == type) touchAnimation = d.animation
        }
        val animation = touchAnimation ?: Animation(listOfNotNull(AnimationDefinition.fromScript(definition, view))).also {
            definitions.add(Definition(WeakReference(view), type, it))
        }
        animation.play().catch { }
    }
}
