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

/**
 * A worker's frame callbacks: frames come from the main thread's Choreographer (a worker's thread has no
 * looper), each callback runs as a task in the worker's realm with that frame's time.
 */
private object WorkerFrames {
    private val nextId = java.util.concurrent.atomic.AtomicLong(1)
    val live = java.util.concurrent.ConcurrentHashMap<Double, (Double) -> Unit>()

    fun request(realm: JSRealm, callback: (Double) -> Unit): Double {
        val id = nextId.getAndIncrement().toDouble()
        live[id] = callback
        JSRealm.main.later {
            Choreographer.getInstance().postFrameCallback { frameTimeNanos ->
                live.remove(id)?.let { realm.later { it(frameTimeNanos / 1e6) } }
            }
        }
        return id
    }
}

fun requestAnimationFrame(callback: (Double) -> Unit): Double {
    val realm = JSRealm.current()
    return if (realm === JSRealm.main) AnimationFrames.request(callback) else WorkerFrames.request(realm, callback)
}

fun cancelAnimationFrame(id: Double?) {
    if (id == null) return
    if (JSRealm.current() === JSRealm.main) AnimationFrames.pending.remove(id) else WorkerFrames.live.remove(id)
}
