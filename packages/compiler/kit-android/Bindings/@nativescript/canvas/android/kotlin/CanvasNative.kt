package org.nativescript.kit.canvas

/** libcanvaskit (jni/canvas_kit.c): the plugin's C API, native pointers as Long. */
object CanvasNative {
    @JvmStatic external fun contextCreateWithPointer(pointer: Long): Long
    @JvmStatic external fun contextRelease(context: Long)
    @JvmStatic external fun contextRender(context: Long)
    @JvmStatic external fun contextResize(context: Long, width: Float, height: Float)

    @JvmStatic external fun setFillColor(context: Long, color: String)
    @JvmStatic external fun setStrokeColor(context: Long, color: String)
    @JvmStatic external fun getFillColor(context: Long): String?
    @JvmStatic external fun getStrokeColor(context: Long): String?
    @JvmStatic external fun setFillStyle(context: Long, style: Long)
    @JvmStatic external fun setStrokeStyle(context: Long, style: Long)

    @JvmStatic external fun setLineWidth(context: Long, value: Float)
    @JvmStatic external fun getLineWidth(context: Long): Float
    @JvmStatic external fun setLineCap(context: Long, value: String)
    @JvmStatic external fun getLineCap(context: Long): String?
    @JvmStatic external fun setLineJoin(context: Long, value: String)
    @JvmStatic external fun getLineJoin(context: Long): String?
    @JvmStatic external fun setMiterLimit(context: Long, value: Float)
    @JvmStatic external fun setLineDash(context: Long, dash: FloatArray)
    @JvmStatic external fun setLineDashOffset(context: Long, value: Float)
    @JvmStatic external fun setFont(context: Long, value: String): Boolean
    @JvmStatic external fun getFont(context: Long): String?
    @JvmStatic external fun setTextAlign(context: Long, value: String)
    @JvmStatic external fun getTextAlign(context: Long): String?
    @JvmStatic external fun setTextBaseline(context: Long, value: String)
    @JvmStatic external fun getTextBaseline(context: Long): String?
    @JvmStatic external fun setShadowBlur(context: Long, value: Float)
    @JvmStatic external fun getShadowBlur(context: Long): Float
    @JvmStatic external fun setShadowColor(context: Long, value: String)
    @JvmStatic external fun getShadowColor(context: Long): String?
    @JvmStatic external fun setShadowOffsetX(context: Long, value: Float)
    @JvmStatic external fun setShadowOffsetY(context: Long, value: Float)
    @JvmStatic external fun setGlobalAlpha(context: Long, value: Float)
    @JvmStatic external fun getGlobalAlpha(context: Long): Float

    @JvmStatic external fun beginPath(context: Long)
    @JvmStatic external fun closePath(context: Long)
    @JvmStatic external fun moveTo(context: Long, x: Float, y: Float)
    @JvmStatic external fun lineTo(context: Long, x: Float, y: Float)
    @JvmStatic external fun quadraticCurveTo(context: Long, cpx: Float, cpy: Float, x: Float, y: Float)
    @JvmStatic external fun bezierCurveTo(context: Long, a: Float, b: Float, c: Float, d: Float, x: Float, y: Float)
    @JvmStatic external fun arc(context: Long, x: Float, y: Float, radius: Float, start: Float, end: Float, anticlockwise: Boolean)
    @JvmStatic external fun ellipse(context: Long, x: Float, y: Float, rx: Float, ry: Float, rotation: Float, start: Float, end: Float, anticlockwise: Boolean)
    @JvmStatic external fun rect(context: Long, x: Float, y: Float, w: Float, h: Float)
    @JvmStatic external fun roundRect(context: Long, x: Float, y: Float, w: Float, h: Float, radii: FloatArray)
    @JvmStatic external fun fill(context: Long, rule: Int)
    @JvmStatic external fun stroke(context: Long)
    @JvmStatic external fun clip(context: Long, rule: Int)
    @JvmStatic external fun clearRect(context: Long, x: Float, y: Float, w: Float, h: Float)
    @JvmStatic external fun fillRect(context: Long, x: Float, y: Float, w: Float, h: Float)
    @JvmStatic external fun strokeRect(context: Long, x: Float, y: Float, w: Float, h: Float)
    @JvmStatic external fun fillText(context: Long, text: String, x: Float, y: Float)
    @JvmStatic external fun strokeText(context: Long, text: String, x: Float, y: Float)
    @JvmStatic external fun measureTextWidth(context: Long, text: String): Float

    @JvmStatic external fun save(context: Long)
    @JvmStatic external fun restore(context: Long)
    @JvmStatic external fun setTransform(context: Long, a: Float, b: Float, c: Float, d: Float, e: Float, f: Float)
    @JvmStatic external fun transform(context: Long, a: Float, b: Float, c: Float, d: Float, e: Float, f: Float)
    @JvmStatic external fun resetTransform(context: Long)
    @JvmStatic external fun translate(context: Long, x: Float, y: Float)
    @JvmStatic external fun scale(context: Long, x: Float, y: Float)
    @JvmStatic external fun rotate(context: Long, angle: Float)

    @JvmStatic external fun createLinearGradient(context: Long, x0: Float, y0: Float, x1: Float, y1: Float): Long
    @JvmStatic external fun createRadialGradient(context: Long, x0: Float, y0: Float, r0: Float, x1: Float, y1: Float, r1: Float): Long
    @JvmStatic external fun gradientAddColorStop(style: Long, stop: Float, color: String)
    @JvmStatic external fun paintStyleRelease(style: Long)
}
