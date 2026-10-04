package org.nativescript.kit

/** `CubicBezierAnimationCurve`, what `CoreTypes.AnimationCurve.cubicBezier()` returns. */
class CubicBezierAnimationCurve(var x1: Double, var y1: Double, var x2: Double, var y2: Double)

// Animations from script: definitions are script objects, read as
// animation-common's `_createPropertyAnimations` reads them.

/** `view.animate(definition)`: its promise's `cancel()` cancels the animation. */
fun View.animate(definition: Any?): JSPromise<Unit> {
    val animation = createAnimation(definition)
    val promise = animation.play()
    promise.canceler = { animation.cancel() }
    return promise
}

/** `view.createAnimation(definition)`. */
fun View.createAnimation(definition: Any?): Animation =
    Animation(listOfNotNull(AnimationDefinition.fromScript(definition, this)))

/**
 * A script object's animated properties, or null where core logs an invalid
 * value and animates nothing. `target` stands for the object's own
 * (`createAnimation` sets it). An unknown curve throws, as `new Animation` does.
 */
fun AnimationDefinition.Companion.fromScript(value: Any?, target: View? = null): AnimationDefinition? {
    if (value is AnimationDefinition) return value.also { if (target != null) it.target = target }
    fun field(key: String): Any? = jsField(value, key)
    val curve = field("curve")?.takeIf { jsTruthy(it) }?.let { resolveCurve(it) }
    val definition = AnimationDefinition(target ?: field("target") as? View)
    if (definition.target == null) {
        jsError("No animation target specified.")
        return null
    }
    for (key in jsKeysOf(value)) {
        val raw = field(key) ?: continue
        val valid = when (key) {
            "opacity", "duration", "delay", "iterations" -> raw is Double
            "scale", "translate" -> jsField(raw, "x") is Double && jsField(raw, "y") is Double
            "backgroundColor" -> toColor(raw) != null
            "rotate" -> raw is Double || (jsField(raw, "x") is Double && jsField(raw, "y") is Double && jsField(raw, "z") is Double)
            else -> true
        }
        if (valid) continue
        val shown = jsToString(raw)
        jsError(when (key) {
            "scale", "translate" -> "Property $key must be valid Pair. Value: $shown"
            "backgroundColor" -> "Property $key must be valid color. Value: $shown"
            "rotate" -> "Property $shown must be valid number or Point3D. Value: $shown"
            else -> "Property $key must be valid number. Value: $shown"
        })
        return null
    }
    fun pair(key: String): Pair<Double, Double>? = field(key)?.let { Pair(jsField(it, "x") as Double, jsField(it, "y") as Double) }
    definition.opacity = field("opacity") as Double?
    definition.duration = field("duration") as Double?
    definition.delay = field("delay") as Double?
    definition.iterations = field("iterations") as Double?
    definition.translate = pair("translate")
    definition.scale = pair("scale")
    definition.backgroundColor = toColor(field("backgroundColor"))
    definition.rotate = field("rotate")?.let { r ->
        if (r is Double) Triple(0.0, 0.0, r) else Triple(jsField(r, "x") as Double, jsField(r, "y") as Double, jsField(r, "z") as Double)
    }
    definition.width = field("width")
    definition.height = field("height")
    definition.curve = curve
    return definition
}

/** `_resolveAnimationCurve`. */
fun AnimationDefinition.Companion.resolveCurve(curve: Any?): AnimationCurve = when {
    curve is String && curve in setOf("easeIn", "easeOut", "easeInOut", "linear", "spring", "ease") -> AnimationCurve.Named(curve)
    curve is CubicBezierAnimationCurve -> AnimationCurve.CubicBezier(curve.x1, curve.y1, curve.x2, curve.y2)
    else -> throw JSException(JSError("Invalid animation curve: ${jsToString(curve)}"))
}
