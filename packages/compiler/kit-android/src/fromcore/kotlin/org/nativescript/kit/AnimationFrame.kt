package org.nativescript.kit

import android.view.Choreographer

// `requestAnimationFrame` as core's animation-frame module runs it: callbacks requested during a
// frame run in the next one, each frame's batch gets that frame's time in milliseconds, and a
// microtask checkpoint follows every callback.

private object AnimationFrames {
    var nextId = 1.0
    var pending = LinkedHashMap<Double, (Double) -> Unit>()
    var scheduled = false

    val frame = Choreographer.FrameCallback { frameTimeNanos ->
        scheduled = false
        val batch = pending
        pending = LinkedHashMap()
        val time = frameTimeNanos / 1e6
        for (callback in batch.values) {
            try {
                callback(time)
            } catch (e: Throwable) {
                jsReportUncaught(jsCaught(e))
            }
            Microtasks.checkpoint()
        }
    }

    fun request(callback: (Double) -> Unit): Double {
        val id = nextId++
        pending[id] = callback
        if (!scheduled) {
            scheduled = true
            Choreographer.getInstance().postFrameCallback(frame)
        }
        return id
    }
}

fun requestAnimationFrame(callback: (Double) -> Unit): Double = AnimationFrames.request(callback)

fun cancelAnimationFrame(id: Double?) {
    if (id != null) AnimationFrames.pending.remove(id)
}
