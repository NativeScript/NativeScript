package org.nativescript.kit.canvas

import org.nativescript.canvas.NSCCanvas
import org.nativescript.kit.*

/**
 * The binding of @nativescript/canvas: `global.CanvasModule`, as the plugin's engine module installs it, over its
 * native library. The kit's replacement of the plugin's script (Bindings/@nativescript/canvas/android/canvas.ts)
 * reaches it untyped.
 */
object NSBinding_nativescript_canvas {
    fun install() {
        // The plugin's engine binding (libcanvasnativev8) is this one's counterpart in a compiled app.
        JSNativeLibraries.provided += "canvasnativev8"
        System.loadLibrary("canvasnative")
        System.loadLibrary("canvaskit")
        jsSet(jsGlobalThis, "CanvasModule", CanvasModule)
    }
}

object CanvasModule : JSHostObject() {
    override val jsClassName: String get() = "CanvasModule"
    override val methods: Set<String> get() = setOf("create2DContextWithPointer", "__create2DContext", "__resize")

    override fun invoke(key: String, args: Array<out Any?>): Any? = when (key) {
        "create2DContextWithPointer" -> {
            val pointer = jsBox(args.getOrNull(0))
            val raw = (pointer as? Number)?.toLong() ?: jsToString(pointer).toLong()
            CanvasRenderingContext2DHost(CanvasNative.contextCreateWithPointer(raw))
        }
        // `(canvas, alpha, antialias, …)`: the view's 2D context, its pointer kept a Long (a number would lose its tag bits).
        "__create2DContext" -> {
            val canvas = jsBox(args.getOrNull(0)) as NSCCanvas
            val flag = { i: Int -> jsTruthy(args.getOrNull(i)) }
            val pointer = canvas.create2DContext(flag(1), flag(2), flag(3), flag(4), jsToNumber(args.getOrNull(5)).toInt(), flag(6), flag(7), flag(8), flag(9), flag(10), flag(11), jsToNumber(args.getOrNull(12)).toInt())
            CanvasRenderingContext2DHost(CanvasNative.contextCreateWithPointer(pointer))
        }
        else -> ABSENT
    }
}
