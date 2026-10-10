package org.nativescript.kit.canvas

import android.view.Choreographer
import org.nativescript.kit.*

private fun Array<out Any?>.float(i: Int): Float = jsToNumber(getOrNull(i)).toFloat()
private fun Array<out Any?>.text(i: Int): String = jsToString(getOrNull(i))
private fun Array<out Any?>.floats(i: Int): FloatArray = ((jsBox(getOrNull(i)) as? JSArray<*>)?.storage ?: emptyList<Any?>()).map { jsToNumber(it).toFloat() }.toFloatArray()
private fun fillRule(value: Any?): Int = if (jsToString(value) == "evenodd") 1 else 0

/**
 * `CanvasRenderingContext2D` over the plugin's C API (kit-apple's CanvasRenderingContext2DHost). Drawing marks the
 * context dirty; a display-frame callback renders a dirty context, once per frame, as the plugin's own Raf does.
 */
class CanvasRenderingContext2DHost(val context: Long) : JSHostObject() {
    private var dirty = false
    private var running = false
    private val frame: Choreographer.FrameCallback = object : Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if (!running) return
            flush()
            Choreographer.getInstance().postFrameCallback(this)
        }
    }

    init {
        startRaf()
    }

    fun startRaf() {
        if (running) return
        running = true
        Choreographer.getInstance().postFrameCallback(frame)
    }

    fun stopRaf() {
        running = false
        Choreographer.getInstance().removeFrameCallback(frame)
    }

    fun flush() {
        if (!dirty) return
        dirty = false
        CanvasNative.contextRender(context)
    }

    private fun drew(): Any? {
        dirty = true
        return null
    }

    override val jsClassName: String get() = "CanvasRenderingContext2D"
    override val methods: Set<String> get() = METHODS

    override fun get(key: String): Any? = when (key) {
        "fillStyle" -> CanvasNative.getFillColor(context)
        "strokeStyle" -> CanvasNative.getStrokeColor(context)
        "lineWidth" -> CanvasNative.getLineWidth(context).toDouble()
        "lineCap" -> CanvasNative.getLineCap(context)
        "lineJoin" -> CanvasNative.getLineJoin(context)
        "font" -> CanvasNative.getFont(context)
        "textAlign" -> CanvasNative.getTextAlign(context)
        "textBaseline" -> CanvasNative.getTextBaseline(context)
        "shadowBlur" -> CanvasNative.getShadowBlur(context).toDouble()
        "shadowColor" -> CanvasNative.getShadowColor(context)
        "globalAlpha" -> CanvasNative.getGlobalAlpha(context).toDouble()
        else -> ABSENT
    }

    override fun set(key: String, value: Any?): Boolean {
        when (key) {
            "fillStyle" -> setStyle(value, fill = true)
            "strokeStyle" -> setStyle(value, fill = false)
            "lineWidth" -> CanvasNative.setLineWidth(context, jsToNumber(value).toFloat())
            "lineCap" -> CanvasNative.setLineCap(context, jsToString(value))
            "lineJoin" -> CanvasNative.setLineJoin(context, jsToString(value))
            "miterLimit" -> CanvasNative.setMiterLimit(context, jsToNumber(value).toFloat())
            "lineDashOffset" -> CanvasNative.setLineDashOffset(context, jsToNumber(value).toFloat())
            "font" -> CanvasNative.setFont(context, jsToString(value))
            "textAlign" -> CanvasNative.setTextAlign(context, jsToString(value))
            "textBaseline" -> CanvasNative.setTextBaseline(context, jsToString(value))
            "shadowBlur" -> CanvasNative.setShadowBlur(context, jsToNumber(value).toFloat())
            "shadowColor" -> CanvasNative.setShadowColor(context, jsToString(value))
            "shadowOffsetX" -> CanvasNative.setShadowOffsetX(context, jsToNumber(value).toFloat())
            "shadowOffsetY" -> CanvasNative.setShadowOffsetY(context, jsToNumber(value).toFloat())
            "globalAlpha" -> CanvasNative.setGlobalAlpha(context, jsToNumber(value).toFloat())
            else -> return false
        }
        return true
    }

    private fun setStyle(value: Any?, fill: Boolean) {
        when (val v = jsBox(value)) {
            is String -> if (fill) CanvasNative.setFillColor(context, v) else CanvasNative.setStrokeColor(context, v)
            is CanvasGradientHost -> if (fill) CanvasNative.setFillStyle(context, v.style) else CanvasNative.setStrokeStyle(context, v.style)
        }
    }

    override fun invoke(key: String, args: Array<out Any?>): Any? = when (key) {
        "__startRaf" -> { startRaf(); null }
        "__stopRaf" -> { stopRaf(); null }
        "__makeDirty" -> drew()
        "__resize" -> { CanvasNative.contextResize(context, args.float(0), args.float(1)); drew() }
        "beginPath" -> { CanvasNative.beginPath(context); null }
        "closePath" -> { CanvasNative.closePath(context); null }
        "moveTo" -> { CanvasNative.moveTo(context, args.float(0), args.float(1)); null }
        "lineTo" -> { CanvasNative.lineTo(context, args.float(0), args.float(1)); null }
        "quadraticCurveTo" -> { CanvasNative.quadraticCurveTo(context, args.float(0), args.float(1), args.float(2), args.float(3)); null }
        "bezierCurveTo" -> { CanvasNative.bezierCurveTo(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5)); null }
        "arc" -> { CanvasNative.arc(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), jsTruthy(args.getOrNull(5))); null }
        "ellipse" -> { CanvasNative.ellipse(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5), args.float(6), jsTruthy(args.getOrNull(7))); null }
        "rect" -> { CanvasNative.rect(context, args.float(0), args.float(1), args.float(2), args.float(3)); null }
        "roundRect" -> {
            val radii = jsBox(args.getOrNull(4))
            CanvasNative.roundRect(context, args.float(0), args.float(1), args.float(2), args.float(3), if (radii is JSArray<*>) args.floats(4) else floatArrayOf(jsToNumber(radii).toFloat()))
            null
        }
        "fill" -> { CanvasNative.fill(context, fillRule(args.getOrNull(0))); drew() }
        "stroke" -> { CanvasNative.stroke(context); drew() }
        "clip" -> { CanvasNative.clip(context, fillRule(args.getOrNull(0))); null }
        "clearRect" -> { CanvasNative.clearRect(context, args.float(0), args.float(1), args.float(2), args.float(3)); drew() }
        "fillRect" -> { CanvasNative.fillRect(context, args.float(0), args.float(1), args.float(2), args.float(3)); drew() }
        "strokeRect" -> { CanvasNative.strokeRect(context, args.float(0), args.float(1), args.float(2), args.float(3)); drew() }
        "fillText" -> { CanvasNative.fillText(context, args.text(0), args.float(1), args.float(2)); drew() }
        "strokeText" -> { CanvasNative.strokeText(context, args.text(0), args.float(1), args.float(2)); drew() }
        "measureText" -> JSObject("width" to CanvasNative.measureTextWidth(context, args.text(0)).toDouble())
        "setLineDash" -> { CanvasNative.setLineDash(context, args.floats(0)); null }
        "save" -> { CanvasNative.save(context); null }
        "restore" -> { CanvasNative.restore(context); null }
        "setTransform" -> { CanvasNative.setTransform(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5)); null }
        "transform" -> { CanvasNative.transform(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5)); null }
        "resetTransform" -> { CanvasNative.resetTransform(context); null }
        "translate" -> { CanvasNative.translate(context, args.float(0), args.float(1)); null }
        "scale" -> { CanvasNative.scale(context, args.float(0), args.float(1)); null }
        "rotate" -> { CanvasNative.rotate(context, args.float(0)); null }
        "createLinearGradient" -> CanvasGradientHost(CanvasNative.createLinearGradient(context, args.float(0), args.float(1), args.float(2), args.float(3)))
        "createRadialGradient" -> CanvasGradientHost(CanvasNative.createRadialGradient(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5)))
        else -> ABSENT
    }

    private companion object {
        val METHODS = setOf(
            "__startRaf", "__stopRaf", "__makeDirty", "__resize", "beginPath", "closePath", "moveTo", "lineTo", "quadraticCurveTo",
            "bezierCurveTo", "arc", "ellipse", "rect", "roundRect", "fill", "stroke", "clip", "clearRect", "fillRect", "strokeRect",
            "fillText", "strokeText", "measureText", "setLineDash", "save", "restore", "setTransform", "transform", "resetTransform",
            "translate", "scale", "rotate", "createLinearGradient", "createRadialGradient",
        )
    }
}

/** `CanvasGradient`: a paint style its color stops are added to. */
class CanvasGradientHost(val style: Long) : JSHostObject() {
    override val jsClassName: String get() = "CanvasGradient"
    override val methods: Set<String> get() = setOf("addColorStop")
    override fun invoke(key: String, args: Array<out Any?>): Any? = when (key) {
        "addColorStop" -> { CanvasNative.gradientAddColorStop(style, args.float(0), args.text(1)); null }
        else -> ABSENT
    }
}
