package org.nativescript.kit

import android.animation.Animator
import android.animation.AnimatorSet
import android.animation.ArgbEvaluator
import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import java.lang.ref.WeakReference

// RootLayout's overlay API from root-layout-common and root-layout/index.android.

/** root-layout-stack: every RootLayout in creation order. */
private val rootLayouts = mutableListOf<WeakReference<RootLayout>>()

internal fun registerRootLayout(layout: RootLayout) {
    rootLayouts.removeAll { it.get() == null }
    if (rootLayouts.none { it.get() === layout }) rootLayouts.add(WeakReference(layout))
}

/** `getRootLayout()`: the first RootLayout created that still exists, not the topmost. */
fun getRootLayout(): RootLayout? = rootLayouts.firstNotNullOfOrNull { it.get() }

/** `getRootLayoutById(id)`. */
fun getRootLayoutById(id: String): RootLayout? = rootLayouts.firstNotNullOfOrNull { ref -> ref.get()?.takeIf { toText(it.applied["id"]) == id } }

/** What a RootLayout keeps for `open` and `close`. */
internal class RootLayoutState {
    class Popup(val view: View, val options: Any?)

    val popups = mutableListOf<Popup>()
    var shadeCover: View? = null
}

/** root-layout-common's `defaultTransitionAnimation`, with a script object's fields over it. */
private class Transition(private val script: Any?, defaultOpacity: Double = 1.0) {
    private fun number(key: String): Double? = jsField(script, key) as? Double
    val translateX = number("translateX") ?: 0.0
    val translateY = number("translateY") ?: 0.0
    val scaleX = number("scaleX") ?: 1.0
    val scaleY = number("scaleY") ?: 1.0
    val rotate = number("rotate") ?: 0.0
    val opacity = number("opacity") ?: defaultOpacity
    val duration = number("duration") ?: 300.0
    val curve: Any = jsField(script, "curve") ?: "easeIn"
}

private const val defaultShadeCoverOpacity = 0.5
private const val defaultShadeCoverColor = "#000000"

private fun field(target: Any?, vararg keys: String): Any? = keys.fold(target) { value, key -> jsField(value, key) }

/** `open(view, options)`: the view fades and moves in from `animation.enterFrom` after a tick, over a shade cover when `shadeCover` is given. */
fun RootLayout.open(view: Any?, options: Any? = null): JSPromise<Unit> = JSPromise { resolvers ->
    if (view !is View) return@JSPromise resolvers.reject(JSError("Invalid open view: ${jsToString(view)}"))
    if (getChildIndex(view) >= 0) return@JSPromise resolvers.reject(JSError("View $view has already been added to the root layout"))
    val toOpen = mutableListOf<JSPromise<Unit>>()
    val enterFrom = field(options, "animation", "enterFrom")
    rootState.popups.add(RootLayoutState.Popup(view, options))
    view.set("opacity", 0.0)
    insertChild(view, getChildrenCount())
    val shade = field(options, "shadeCover")
    if (jsTruthy(shade)) {
        val cover = rootState.shadeCover
        toOpen.add(if (cover != null) updateShadeCover(cover, shade) else openShadeCover(shade))
    }
    toOpen.add(JSPromise { entered ->
        jsSetTimeout({
            // Only after the first tick do safe areas and other measurements apply.
            applyInitialState(view, Transition(enterFrom))
            enterAnimation(view, Transition(enterFrom)).play().then<Unit>({
                applyInitialState(view, Transition(null))
                view.emit("opened", null)
                entered.resolve(Unit)
            }, { error -> entered.reject(JSError("Error playing enter animation: ${jsToString(error)}")) })
        })
    })
    JSPromise.all(toOpen).then<Unit>({ resolvers.resolve(Unit) }, { resolvers.reject(it) })
}

/** `close(view, exitTo)`: `exitTo` or the view's `animation.exitTo` from `open`. */
fun RootLayout.close(view: Any?, exitTo: Any? = null): JSPromise<Unit> = JSPromise { resolvers ->
    if (view !is View) return@JSPromise resolvers.reject(JSError("Invalid close view: ${jsToString(view)}"))
    if (getChildIndex(view) < 0) return@JSPromise resolvers.reject(JSError("Unable to close popup. View $view not found"))
    val toClose = mutableListOf<JSPromise<Unit>>()
    val popups = rootState.popups
    val index = popups.indexOfFirst { it.view === view }
    val popped = popups.getOrNull(index)
    val exit = exitTo?.takeIf { jsTruthy(it) } ?: field(popped?.options, "animation", "exitTo")
    if (index > -1) popups.removeAt(index)
    toClose.add(JSPromise { exited ->
        if (!jsTruthy(exit)) return@JSPromise exited.resolve(Unit)
        Animation(listOf(exitDefinition(view, Transition(exit)))).play().then<Unit>({ exited.resolve(Unit) }, { error ->
            exited.reject(JSError("Error playing exit animation: ${jsToString(error)}"))
        })
    })
    val cover = rootState.shadeCover
    if (cover != null) {
        val poppedShade = field(popped?.options, "shadeCover")
        val next = if (popups.isNotEmpty() && !jsTruthy(field(poppedShade, "ignoreShadeRestore"))) field(popups.last().options, "shadeCover") else null
        toClose.add(if (jsTruthy(next)) updateShadeCover(cover, next) else closeShadeCover(poppedShade))
    }
    JSPromise.all(toClose).then<Unit>({
        view.emit("closed", null)
        removeChild(view)
        resolvers.resolve(Unit)
    }, { resolvers.reject(it) })
}

/** `closeAll()`. */
fun RootLayout.closeAll(): JSPromise<JSArray<Unit>> = JSPromise.all(rootState.popups.map { close(it.view) })

/** `topmost()`: the last view opened that is still open. */
fun RootLayout.topmost(): View? = rootState.popups.lastOrNull()?.view

fun RootLayout.getShadeCover(): View? = rootState.shadeCover

/** `openShadeCover(options)`: below the first open popup. */
fun RootLayout.openShadeCover(options: Any? = null): JSPromise<Unit> = JSPromise { resolvers ->
    val count = getChildrenCount()
    val index = rootState.popups.firstOrNull()?.let { getChildIndex(it.view).takeIf { i -> i > -1 } } ?: count
    if (rootState.shadeCover != null) return@JSPromise resolvers.resolve(Unit)
    val cover = GridLayout()
    cover.set("verticalAlignment", "bottom")
    cover.on("loaded") {
        initShadeCover(cover, options)
        updateShadeCover(cover, options).then { resolvers.resolve(Unit) }
    }
    rootState.shadeCover = cover
    insertChild(cover, index)
}

/** `closeShadeCover(options)`. */
fun RootLayout.closeShadeCover(options: Any? = null): JSPromise<Unit> = JSPromise { resolvers ->
    val cover = rootState.shadeCover ?: return@JSPromise resolvers.resolve(Unit)
    val exit = Transition(field(options, "animation", "exitTo"), defaultOpacity = 0.0)
    playAnimation(animators(cover, exit, null), exit.duration).then {
        rootState.shadeCover?.let { shade ->
            shade.off("loaded")
            if (shade.parent != null) removeChild(shade)
        }
        rootState.shadeCover = null
        resolvers.resolve(Unit)
    }
}

/** `updateShadeCover`: `tapToClose` replaces the shade's tap handler, then the Android `_updateShadeCover`. */
private fun RootLayout.updateShadeCover(shade: View, options: Any?): JSPromise<Unit> {
    val tap = field(options, "tapToClose")
    if (tap != null && tap !== JSNull) {
        shade.off("tap")
        if (jsTruthy(tap)) shade.on("tap") { closeAll() }
    }
    val duration = (field(options, "animation", "enterFrom", "duration") as? Double)?.takeIf { jsTruthy(it) } ?: 300.0
    val color = (jsField(options, "color") ?: defaultShadeCoverColor) as? String
    val gradient = color != null && color.startsWith("linear-gradient")
    if (gradient) {
        if (shade.applied["backgroundColor"] != null) shade.set("backgroundColor", null)
        shade.set("backgroundImage", color)
    } else if (shade.applied["backgroundImage"] != null) {
        shade.set("backgroundImage", null)
    }
    val opacity = jsField(options, "opacity") as? Double ?: defaultShadeCoverOpacity
    return playAnimation(animators(shade, Transition(null, opacity), if (gradient) null else color), duration)
}

/** `_initShadeCover`: the shade starts from its `animation.enterFrom` state. */
private fun initShadeCover(shade: View, options: Any?) {
    val state = Transition(field(options, "animation", "enterFrom"), defaultOpacity = 0.0)
    val native = shade.nativeView
    native.alpha = state.opacity.toFloat()
    native.scaleX = state.scaleX.toFloat()
    native.scaleY = state.scaleY.toFloat()
    native.translationX = Layout.toDevicePixels(state.translateX).toFloat()
    native.translationY = Layout.toDevicePixels(state.translateY).toFloat()
    native.rotation = state.rotate.toFloat()
}

/** `_getAnimationSet`: the shade's native transform and alpha, and its background color when given. */
private fun animators(shade: View, state: Transition, backgroundColor: String?): List<Animator> {
    val native = shade.nativeView
    val list = mutableListOf<Animator>(
        ObjectAnimator.ofFloat(native, "translationX", Layout.toDevicePixels(state.translateX).toFloat()),
        ObjectAnimator.ofFloat(native, "translationY", Layout.toDevicePixels(state.translateY).toFloat()),
        ObjectAnimator.ofFloat(native, "scaleX", state.scaleX.toFloat()),
        ObjectAnimator.ofFloat(native, "scaleY", state.scaleY.toFloat()),
        ObjectAnimator.ofFloat(native, "rotation", state.rotate.toFloat()),
        ObjectAnimator.ofFloat(native, "alpha", state.opacity.toFloat()),
    )
    if (backgroundColor != null) {
        val from = toColor(shade.applied["backgroundColor"])?.argb ?: -1
        val to = Color.parse(backgroundColor)?.argb ?: -1
        val animator = ValueAnimator.ofObject(ArgbEvaluator(), from, to)
        animator.addUpdateListener { shade.set("backgroundColor", Color(it.animatedValue as Int)) }
        list.add(animator)
    }
    return list
}

/** `_playAnimation`: together, over `duration` milliseconds; settles when the set ends, never on cancel. */
private fun playAnimation(animators: List<Animator>, duration: Double): JSPromise<Unit> = JSPromise { resolvers ->
    val set = AnimatorSet()
    set.playTogether(animators)
    set.duration = duration.toLong()
    set.addListener(object : Animator.AnimatorListener {
        override fun onAnimationStart(animation: Animator) {}
        override fun onAnimationEnd(animation: Animator) {
            resolvers.resolve(Unit)
            Microtasks.checkpoint()
        }
        override fun onAnimationCancel(animation: Animator) {}
        override fun onAnimationRepeat(animation: Animator) {}
    })
    set.start()
}

/** `applyInitialState`, and with no state `applyDefaultState`. */
private fun applyInitialState(view: View, state: Transition) {
    view.set("translateX", state.translateX)
    view.set("translateY", state.translateY)
    view.set("scaleX", state.scaleX)
    view.set("scaleY", state.scaleY)
    view.set("rotate", state.rotate)
    view.set("opacity", state.opacity)
}

/** `getEnterAnimation`: to the default state. */
private fun enterAnimation(view: View, state: Transition): Animation {
    val definition = AnimationDefinition(view)
    definition.translate = Pair(0.0, 0.0)
    definition.scale = Pair(1.0, 1.0)
    definition.rotate = Triple(0.0, 0.0, 0.0)
    definition.opacity = 1.0
    definition.duration = state.duration
    definition.curve = AnimationDefinition.resolveCurve(state.curve)
    return Animation(listOf(definition))
}

/** `getExitAnimationDefinition`. */
private fun exitDefinition(view: View, state: Transition): AnimationDefinition {
    val definition = AnimationDefinition(view)
    definition.translate = Pair(state.translateX, state.translateY)
    definition.scale = Pair(state.scaleX, state.scaleY)
    definition.rotate = Triple(0.0, 0.0, state.rotate)
    definition.opacity = state.opacity
    definition.duration = state.duration
    definition.curve = AnimationDefinition.resolveCurve(state.curve)
    return definition
}
