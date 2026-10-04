package org.nativescript.kit

import android.animation.Animator
import android.animation.AnimatorSet
import android.animation.ArgbEvaluator
import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.animation.TimeInterpolator
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.AccelerateInterpolator
import android.view.animation.BounceInterpolator
import android.view.animation.DecelerateInterpolator
import android.view.animation.LinearInterpolator
import androidx.core.view.animation.PathInterpolatorCompat

/** `CoreTypes.AnimationCurve`: a named curve or a cubic Bézier. */
sealed class AnimationCurve {
    data class Named(val name: String) : AnimationCurve()
    data class CubicBezier(val x1: Double, val y1: Double, val x2: Double, val y2: Double) : AnimationCurve()

    /** `_resolveAnimationCurve`. */
    fun interpolator(): TimeInterpolator = when (this) {
        is CubicBezier -> PathInterpolatorCompat.create(x1.toFloat(), y1.toFloat(), x2.toFloat(), y2.toFloat())
        is Named -> when (name) {
            "easeIn" -> AccelerateInterpolator(1f)
            "easeOut" -> DecelerateInterpolator(1f)
            "easeInOut" -> AccelerateDecelerateInterpolator()
            "linear" -> LinearInterpolator()
            "spring" -> BounceInterpolator()
            else -> PathInterpolatorCompat.create(0.25f, 0.1f, 0.25f, 1.0f)
        }
    }

    companion object {
        val ease = Named("ease")

        /** `animationTimingFunctionConverter`: CSS names, or `cubic-bezier()` with each coordinate clamped to 0…1. */
        fun parse(css: String): AnimationCurve? {
            when (css) {
                "ease" -> return ease
                "linear" -> return Named("linear")
                "ease-in" -> return Named("easeIn")
                "ease-out" -> return Named("easeOut")
                "ease-in-out" -> return Named("easeInOut")
                "spring" -> return Named("spring")
            }
            val coords = Regex("\\((.*?)\\)").find(css)?.groupValues?.get(1)?.split(",")?.map { (parseFloat(it) ?: Double.NaN).coerceIn(0.0, 1.0) }
            if (css.startsWith("cubic-bezier") && coords != null && coords.size == 4) return CubicBezier(coords[0], coords[1], coords[2], coords[3])
            return null
        }

        /** The names `view.animate` takes (`curve: 'easeIn'`). */
        fun named(name: String): AnimationCurve = Named(name)
    }
}

/** `AnimationDefinition`: what to animate on `target`; lengths in dips, times in milliseconds. */
class AnimationDefinition(var target: View? = null) {
    var opacity: Double? = null
    var backgroundColor: Color? = null
    var translate: Pair<Double, Double>? = null
    var scale: Pair<Double, Double>? = null
    var rotate: Triple<Double, Double, Double>? = null
    var width: Any? = null
    var height: Any? = null
    var duration: Double? = null
    var delay: Double? = null
    var iterations: Double? = null
    var curve: AnimationCurve? = null
    /** `valueSource: 'keyframe'`: values land in the keyframe layer, which CSS animations own. */
    var fromKeyframe = false

    fun copy(): AnimationDefinition = AnimationDefinition(target).also {
        it.opacity = opacity; it.backgroundColor = backgroundColor; it.translate = translate; it.scale = scale; it.rotate = rotate
        it.width = width; it.height = height; it.duration = duration; it.delay = delay; it.iterations = iterations; it.curve = curve
        it.fromKeyframe = fromKeyframe
    }
}

/**
 * `Animation` from animation/index.android: one ObjectAnimator (or value
 * animator) per property, played together or in sequence by an AnimatorSet;
 * the final values are written to the view's style when it ends, the
 * original ones restored when it is cancelled.
 */
class Animation(definitions: List<AnimationDefinition>, private val playSequentially: Boolean = false) {
    private class PropertyAnimation(val target: View, val property: String, val value: Any, val definition: AnimationDefinition)

    private val propertyAnimations = mutableListOf<PropertyAnimation>()
    private var animatorSet: AnimatorSet? = null
    private val animators = mutableListOf<Animator>()
    private val updateCallbacks = mutableListOf<() -> Unit>()
    private val resetCallbacks = mutableListOf<() -> Unit>()
    private var resetOnFinish = true
    private var resolvers: JSResolvers<Unit>? = null
    private val fromKeyframe = definitions.firstOrNull()?.fromKeyframe ?: false

    var isPlaying = false
        private set

    init {
        for (d in definitions) {
            val target = d.target ?: continue
            d.opacity?.let { propertyAnimations.add(PropertyAnimation(target, "opacity", it, d)) }
            d.backgroundColor?.let { propertyAnimations.add(PropertyAnimation(target, "backgroundColor", it, d)) }
            d.translate?.let { propertyAnimations.add(PropertyAnimation(target, "translate", it, d)) }
            d.scale?.let { propertyAnimations.add(PropertyAnimation(target, "scale", it, d)) }
            d.rotate?.let { propertyAnimations.add(PropertyAnimation(target, "rotate", it, d)) }
            d.height?.let { propertyAnimations.add(PropertyAnimation(target, "height", it, d)) }
            d.width?.let { propertyAnimations.add(PropertyAnimation(target, "width", it, d)) }
        }
    }

    /** Plays the animation; the promise settles when it ends or is cancelled, and rejects if it is already playing. */
    fun play(resetOnFinish: Boolean? = null): JSPromise<Unit> {
        if (resetOnFinish != null) this.resetOnFinish = resetOnFinish
        if (isPlaying) return JSPromise.reject("Animation is already playing.")
        val (promise, r) = JSPromise.pending<Unit>()
        resolvers = r
        isPlaying = true
        if (animatorSet == null) {
            for (p in propertyAnimations) createAnimators(p)
            animatorSet = AnimatorSet().also { set ->
                set.addListener(object : Animator.AnimatorListener {
                    override fun onAnimationStart(animation: Animator) {}
                    override fun onAnimationRepeat(animation: Animator) {}
                    override fun onAnimationEnd(animation: Animator) = onEnd()
                    override fun onAnimationCancel(animation: Animator) = onCancel()
                })
            }
        }
        val set = animatorSet!!
        if (animators.isNotEmpty()) {
            if (playSequentially) set.playSequentially(animators) else set.playTogether(animators)
        }
        set.setupStartValues()
        set.start()
        return promise
    }

    fun cancel() {
        if (!isPlaying) return
        animatorSet?.cancel()
    }

    private fun onEnd() {
        if (!isPlaying) return
        for (callback in updateCallbacks) callback()
        finish()
    }

    private fun onCancel() {
        for (callback in resetCallbacks) callback()
        finish()
    }

    private fun finish() {
        isPlaying = false
        resolvers?.resolve(Unit)
        Microtasks.checkpoint()
    }

    private fun setStyle(target: View, name: String, value: Any?) {
        if (fromKeyframe) target.setKeyframe(name, value) else target.set(name, value)
    }

    private fun createAnimators(p: PropertyAnimation) {
        val target = p.target
        val nativeView = target.nativeView
        val density = Layout.density
        val created = mutableListOf<Animator>()
        fun animator(property: String, value: Float): ObjectAnimator = ObjectAnimator.ofFloat(nativeView, property, value)
        fun set(list: List<Animator>): AnimatorSet = AnimatorSet().also { s ->
            val repeat = repeatCount(p.definition.iterations ?: 1.0)
            for (a in list) (a as? ValueAnimator)?.repeatCount = repeat
            s.playTogether(list)
            s.setupStartValues()
        }
        when (p.property) {
            "opacity" -> {
                val original = nativeView.alpha.toDouble()
                updateCallbacks.add { setStyle(target, "opacity", p.value) }
                resetCallbacks.add {
                    setStyle(target, "opacity", original)
                    target.applyNow("opacity")
                }
                created.add(animator("alpha", (p.value as Double).toFloat()))
            }
            "backgroundColor" -> {
                val current = toColor(target.applied["backgroundColor"])
                val to = p.value as Color
                val animator = ValueAnimator.ofObject(ArgbEvaluator(), current?.argb ?: -1, to.argb)
                animator.addUpdateListener { setStyle(target, "backgroundColor", Color(it.animatedValue as Int)) }
                updateCallbacks.add { setStyle(target, "backgroundColor", to) }
                resetCallbacks.add {
                    setStyle(target, "backgroundColor", current)
                    target.applyNow("backgroundColor")
                }
                created.add(animator)
            }
            "translate" -> {
                @Suppress("UNCHECKED_CAST") val v = p.value as Pair<Double, Double>
                val x = nativeView.translationX / density.toDouble()
                val y = nativeView.translationY / density.toDouble()
                updateCallbacks.add {
                    setStyle(target, "translateX", v.first)
                    setStyle(target, "translateY", v.second)
                }
                resetCallbacks.add {
                    setStyle(target, "translateX", x)
                    setStyle(target, "translateY", y)
                    target.applyNow("translateX")
                    target.applyNow("translateY")
                }
                created.add(set(listOf(animator("translationX", (v.first * density).toFloat()), animator("translationY", (v.second * density).toFloat()))))
            }
            "scale" -> {
                @Suppress("UNCHECKED_CAST") val v = p.value as Pair<Double, Double>
                val x = nativeView.scaleX.toDouble()
                val y = nativeView.scaleY.toDouble()
                updateCallbacks.add {
                    setStyle(target, "scaleX", v.first)
                    setStyle(target, "scaleY", v.second)
                }
                resetCallbacks.add {
                    setStyle(target, "scaleX", x)
                    setStyle(target, "scaleY", y)
                    target.applyNow("scaleX")
                    target.applyNow("scaleY")
                }
                created.add(set(listOf(animator("scaleX", v.first.toFloat()), animator("scaleY", v.second.toFloat()))))
            }
            "rotate" -> {
                @Suppress("UNCHECKED_CAST") val v = p.value as Triple<Double, Double, Double>
                val rx = nativeView.rotationX.toDouble()
                val ry = nativeView.rotationY.toDouble()
                val rz = nativeView.rotation.toDouble()
                updateCallbacks.add {
                    setStyle(target, "rotateX", v.first)
                    setStyle(target, "rotateY", v.second)
                    setStyle(target, "rotate", v.third)
                }
                resetCallbacks.add {
                    setStyle(target, "rotateX", rx)
                    setStyle(target, "rotateY", ry)
                    setStyle(target, "rotate", rz)
                    target.applyNow("rotate")
                    target.applyNow("rotateX")
                    target.applyNow("rotateY")
                }
                created.add(set(listOf(animator("rotationX", v.first.toFloat()), animator("rotationY", v.second.toFloat()), animator("rotation", v.third.toFloat()))))
            }
            "width", "height" -> {
                val vertical = p.property == "height"
                val parent = target.parent ?: throw JSException(JSError("cannot animate ${p.property} on root view"))
                val parentExtent = (if (vertical) parent.nativeView.measuredHeight else parent.nativeView.measuredWidth).toDouble()
                val to = Length.parse(p.value, Length.Auto).toDevicePixels(parentExtent, parentExtent) / density
                val original = (if (vertical) nativeView.height else nativeView.width) / density.toDouble()
                val animator = ValueAnimator.ofFloat(original.toFloat(), to.toFloat())
                animator.addUpdateListener { setStyle(target, p.property, (it.animatedValue as Float).toDouble()) }
                updateCallbacks.add { setStyle(target, p.property, p.value) }
                resetCallbacks.add {
                    setStyle(target, p.property, original)
                    target.applyNow(p.property)
                }
                created.add(animator)
            }
        }
        val d = p.definition
        for (a in created) {
            d.duration?.let { a.duration = it.toLong() }
            d.delay?.let { a.startDelay = it.toLong() }
            if (d.iterations != null && a is ValueAnimator) a.repeatCount = repeatCount(d.iterations!!)
            d.curve?.let { a.interpolator = it.interpolator() }
        }
        animators.addAll(created)
    }

    private fun repeatCount(iterations: Double): Int = if (iterations.isInfinite()) ValueAnimator.INFINITE else (iterations - 1).toInt()
}

/** `view.animate(options)`. */
fun View.animate(definition: AnimationDefinition): JSPromise<Unit> {
    definition.target = this
    return Animation(listOf(definition)).play()
}

/** `setNative` with the property's current value, as an animation's reset does. */
internal fun View.applyNow(name: String) {
    if (isLoaded) setPropertyNow(name)
}

// Keyframe animations (keyframe-animation, css-animation-parser)

/** `KeyframeAnimationInfo`: one animation a CSS rule declares; times in milliseconds. */
class KeyframeAnimationInfo {
    var name = ""
    var duration = 0.3
    var delay = 0.0
    var iterations = 1.0
    var curve: AnimationCurve = AnimationCurve.ease
    var isForwards = false
    var isReverse = false

    /** `ANIMATION_PROPERTY_HANDLERS`. */
    fun apply(property: String, value: String) {
        when (property) {
            "animation-name" -> name = value.replace("'", "").replace("\"", "")
            "animation-duration" -> duration = time(value)
            "animation-delay" -> delay = time(value)
            "animation-timing-function" -> curve = AnimationCurve.parse(value) ?: AnimationCurve.ease
            "animation-iteration-count" -> iterations = if (value == "infinite") Double.POSITIVE_INFINITY else parseFloat(value) ?: Double.NaN
            "animation-direction" -> isReverse = value == "reverse"
            "animation-fill-mode" -> isForwards = value == "forwards" || value == "both"
        }
    }

    companion object {
        private val handled = setOf("animation-name", "animation-duration", "animation-delay", "animation-timing-function", "animation-iteration-count", "animation-direction", "animation-fill-mode")

        /** `CssAnimationParser.keyframeAnimationsFromCSSDeclarations`. */
        fun fromDeclarations(declarations: List<Pair<String, String>>): List<KeyframeAnimationInfo>? {
            val animations = mutableListOf<KeyframeAnimationInfo>()
            var current: KeyframeAnimationInfo? = null
            for ((property, value) in declarations) {
                if (property == "animation") animations.addAll(fromShorthand(value))
                else if (property.startsWith("animation-") && property in handled) {
                    val info = current ?: KeyframeAnimationInfo().also { animations.add(it); current = it }
                    info.apply(property, value)
                }
            }
            return animations.ifEmpty { null }
        }

        /** `timeConverter`: milliseconds, seconds unless the value says `ms`. */
        fun time(value: String): Double {
            var result = parseFloat(value) ?: Double.NaN
            if (!value.contains("ms")) result *= 1000
            return if (result.isNaN()) Double.NaN else maxOf(0.0, result)
        }

        /** `keyframeAnimationsFromCSSProperty`: each comma-separated animation's parts recognized by shape. */
        fun fromShorthand(value: String): List<KeyframeAnimationInfo> {
            if (value.isBlank()) return emptyList()
            fun matches(s: String, pattern: String) = Regex(pattern).containsMatchIn(s)
            val result = mutableListOf<KeyframeAnimationInfo>()
            for (parsed in splitOutsideParentheses(value, ',')) {
                val info = KeyframeAnimationInfo()
                val parts = splitOutsideParentheses(parsed.trim(), ' ')
                val times = parts.filter { matches(it, "\\dm?s$") }
                val duration = times.getOrNull(0)
                val delay = times.getOrNull(1)
                val timing = parts.firstOrNull { matches(it, "ease|linear|ease-in|ease-out|ease-in-out|spring|cubic-bezier") }
                val iterationCount = parts.firstOrNull { matches(it, "infinite|[\\d.]+$") }
                val direction = parts.firstOrNull { matches(it, "normal|reverse|alternate|alternate-reverse") }
                val fillMode = parts.firstOrNull { matches(it, "none|forwards|backwards|both") }
                val playState = parts.firstOrNull { matches(it, "running|paused") }
                val consumed = listOfNotNull(duration, delay, timing, iterationCount, direction, fillMode, playState)
                val name = parts.firstOrNull { it !in consumed }
                duration?.let { info.apply("animation-duration", it) }
                delay?.let { info.apply("animation-delay", it) }
                timing?.let { info.apply("animation-timing-function", it) }
                iterationCount?.let { info.apply("animation-iteration-count", it) }
                direction?.let { info.apply("animation-direction", it) }
                fillMode?.let { info.apply("animation-fill-mode", it) }
                name?.let { info.apply("animation-name", it) }
                result.add(info)
            }
            return result
        }

        /** JavaScript's `split(/<sep>(?![^(]*\))/)`: separators inside parentheses do not split. */
        private fun splitOutsideParentheses(s: String, separator: Char): List<String> {
            val parts = mutableListOf<String>()
            val current = StringBuilder()
            for ((i, c) in s.withIndex()) {
                if (c == separator) {
                    val close = s.indexOf(')', i + 1)
                    val open = s.indexOf('(', i + 1)
                    val inside = close >= 0 && (open < 0 || open > close)
                    if (!inside) {
                        parts.add(current.toString())
                        current.clear()
                        continue
                    }
                }
                current.append(c)
            }
            parts.add(current.toString())
            return parts
        }
    }
}

/** A `@keyframes` block as written: its selectors (`from`, `50%`) and declarations. */
class KeyframeRule(val values: List<String>, val declarations: List<Pair<String, String>>)

/** A parsed keyframe: its time as a fraction, its animated values and curve. */
class KeyframeInfo(val duration: Double) {
    val declarations = mutableListOf<Pair<String, Any>>()
    var curve: AnimationCurve? = null

    companion object {
        /** `CssAnimationParser.keyframesArrayFromCSS`. */
        fun parse(rules: List<KeyframeRule>): List<KeyframeInfo> {
            val byTime = LinkedHashMap<Double, KeyframeInfo>()
            for (rule in rules) {
                val declarations = parseDeclarations(rule.declarations)
                for (value in rule.values) {
                    val time = when (value) {
                        "from" -> 0.0
                        "to" -> 1.0
                        else -> ((parseFloat(value) ?: Double.NaN) / 100).let { if (it < 0) 0.0 else if (it > 100) 100.0 else it }
                    }
                    val current = byTime.getOrPut(time) { KeyframeInfo(time) }
                    for ((name, v) in rule.declarations) if (name == "animation-timing-function") current.curve = AnimationCurve.parse(v) ?: AnimationCurve.ease
                    current.declarations.addAll(declarations)
                }
            }
            return byTime.values.sortedBy { it.duration }
        }

        /** `parseKeyframeDeclarations`: animatable properties converted, `transform` as translate, rotate and scale. */
        fun parseDeclarations(declarations: List<Pair<String, String>>): List<Pair<String, Any>> {
            val result = mutableListOf<Pair<String, Any>>()
            fun put(property: String, value: Any) {
                val index = result.indexOfFirst { it.first == property }
                if (index >= 0) result[index] = Pair(property, value) else result.add(Pair(property, value))
            }
            for ((name, raw) in declarations) {
                val value = raw.replace("!important", "").trim()
                when (name) {
                    "opacity" -> put("opacity", parseFloat(value) ?: Double.NaN)
                    "background-color", "backgroundColor" -> toColor(value)?.let { put("backgroundColor", it) }
                    "width" -> put("width", value)
                    "height" -> put("height", value)
                    "transform" -> {
                        val t = Transformation.parse(value)
                        put("translate", Pair(t.translateX, t.translateY))
                        put("rotate", Triple(t.rotateX, t.rotateY, t.rotateZ))
                        put("scale", Pair(t.scaleX, t.scaleY))
                    }
                }
            }
            return result
        }
    }
}

/** `KeyframeAnimation`: a CSS animation played as a sequence of `Animation`s. */
class KeyframeAnimation private constructor(
    private val animations: List<AnimationDefinition>,
    private val delay: Double,
    private val iterations: Double,
    private val isForwards: Boolean,
) {
    private var nativeAnimations = mutableListOf<Animation>()
    private var target: View? = null
    var isPlaying = false
        private set

    fun play(view: View) {
        if (isPlaying) return
        isPlaying = true
        nativeAnimations = mutableListOf()
        target = view
        if (delay != 0.0) jsSetTimeout({ animate(view, 0, iterations) }, delay) else animate(view, 0, iterations)
    }

    fun cancel() {
        if (!isPlaying) return
        isPlaying = false
        for (animation in nativeAnimations.asReversed()) if (animation.isPlaying) animation.cancel()
        val target = target
        if (target != null && nativeAnimations.isNotEmpty()) resetValues(target, animations[0])
        nativeAnimations = mutableListOf()
        this.target = null
    }

    private fun animate(view: View, index: Int, iterations: Double) {
        if (!isPlaying) return
        if (index == 0) {
            val first = animations[0]
            first.backgroundColor?.let { view.setKeyframe("backgroundColor", it) }
            first.scale?.let { view.setKeyframe("scaleX", it.first); view.setKeyframe("scaleY", it.second) }
            first.translate?.let { view.setKeyframe("translateX", it.first); view.setKeyframe("translateY", it.second) }
            first.rotate?.let { view.setKeyframe("rotateX", it.first); view.setKeyframe("rotateY", it.second); view.setKeyframe("rotate", it.third) }
            first.opacity?.let { view.setKeyframe("opacity", it) }
            first.height?.let { view.setKeyframe("height", it) }
            first.width?.let { view.setKeyframe("width", it) }
            jsSetTimeout({ animate(view, 1, iterations) }, 1.0)
        } else if (index >= animations.size) {
            val remaining = iterations - 1
            if (remaining > 0) animate(view, 0, remaining)
            else {
                if (!isForwards) resetValues(view, animations.last())
                nativeAnimations = mutableListOf()
                isPlaying = false
                target = null
            }
        } else {
            val animation = nativeAnimations.getOrNull(index - 1) ?: Animation(listOf(animations[index].copy().also { it.target = view })).also { nativeAnimations.add(it) }
            animation.play(iterations - 1 <= 0).then<Unit>({ animate(view, index + 1, iterations) }, { })
        }
    }

    /** `_resetAnimationValues`: only the z rotation is reset. */
    private fun resetValues(view: View, animation: AnimationDefinition) {
        if (animation.backgroundColor != null) view.setKeyframe("backgroundColor", null)
        if (animation.scale != null) { view.setKeyframe("scaleX", null); view.setKeyframe("scaleY", null) }
        if (animation.translate != null) { view.setKeyframe("translateX", null); view.setKeyframe("translateY", null) }
        if (animation.rotate != null) view.setKeyframe("rotate", null)
        if (animation.opacity != null) view.setKeyframe("opacity", null)
        if (animation.height != null) view.setKeyframe("height", null)
        if (animation.width != null) view.setKeyframe("width", null)
    }

    companion object {
        /** `keyframeAnimationFromInfo`. */
        fun create(info: KeyframeAnimationInfo, keyframes: List<KeyframeInfo>?): KeyframeAnimation? {
            if (keyframes.isNullOrEmpty()) return null
            val definitions = mutableListOf<AnimationDefinition>()
            var start = 0.0
            val ordered = if (info.isReverse) keyframes.asReversed() else keyframes
            for (keyframe in ordered) {
                val definition = AnimationDefinition()
                for ((property, value) in keyframe.declarations) {
                    @Suppress("UNCHECKED_CAST")
                    when (property) {
                        "opacity" -> definition.opacity = value as Double
                        "backgroundColor" -> definition.backgroundColor = value as Color
                        "translate" -> definition.translate = value as Pair<Double, Double>
                        "scale" -> definition.scale = value as Pair<Double, Double>
                        "rotate" -> definition.rotate = value as Triple<Double, Double, Double>
                        "width" -> definition.width = value
                        "height" -> definition.height = value
                    }
                }
                var duration = keyframe.duration
                if (duration == 0.0) duration = 0.01
                else {
                    duration = info.duration * duration - start
                    start += duration
                }
                definition.duration = if (info.isReverse) info.duration - duration else duration
                definition.curve = keyframe.curve
                definition.fromKeyframe = true
                definitions.add(definition)
            }
            if (!info.isReverse && definitions.size > 1) {
                for (index in definitions.size - 1 downTo 1) {
                    if (definitions[index - 1].curve != null) {
                        definitions[index].curve = definitions[index - 1].curve
                        definitions[index - 1].curve = null
                    }
                }
            }
            for (d in definitions) if (d.curve == null) d.curve = info.curve
            return KeyframeAnimation(definitions, info.delay, info.iterations, info.isForwards)
        }
    }
}
