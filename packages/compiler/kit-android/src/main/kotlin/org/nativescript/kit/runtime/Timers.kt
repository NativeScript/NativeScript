package org.nativescript.kit

// Timers as Node schedules them (lib/internal/timers.js): one list per duration, lists
// ordered by expiry and then by list id, every timer callback followed by a microtask checkpoint.

internal class JSTimer(val id: Double, var duration: Double, val repeatInterval: Double?, val callback: () -> Unit) {
    var start = 0.0
    var active = true
}

internal class JSTimerList(val duration: Double, var expiry: Double, var id: Int) {
    val timers = ArrayDeque<JSTimer>()
}

/**
 * The event loop for timers: driven by the host's main looper in an app (`host`), or by
 * `runUntilIdle()` in a command-line program.
 */
object JSEventLoop {
    private val lists = HashMap<Double, JSTimerList>()
    private val timers = HashMap<Double, JSTimer>()
    private var nextTimerId = 1.0
    private var nextListId = 0
    private var processing = false
    private val origin = System.nanoTime()

    /** Arms a wake-up `delay` milliseconds from now that calls `processTimers`, replacing the previous one; null disarms. */
    var host: ((Double?) -> Unit)? = null

    /** libuv's clock: whole milliseconds since the loop started. */
    fun now(): Double = ((System.nanoTime() - origin) / 1_000_000).toDouble()

    internal fun schedule(callback: () -> Unit, delay: Double, repeats: Boolean): Double {
        var duration = delay
        if (!(duration >= 1 && duration <= 2_147_483_647.0)) duration = 1.0
        val timer = JSTimer(nextTimerId, duration, if (repeats) duration else null, callback)
        nextTimerId += 1
        timers[timer.id] = timer
        insert(timer, now())
        return timer.id
    }

    private fun insert(timer: JSTimer, start: Double) {
        val duration = Math.floor(timer.duration)
        timer.start = start
        val list = lists[duration]
        if (list != null) list.timers.addLast(timer)
        else {
            val created = JSTimerList(duration, start + duration, nextListId++)
            created.timers.addLast(timer)
            lists[duration] = created
        }
        arm()
    }

    internal fun cancel(id: Double?) {
        if (id == null) return
        val timer = timers.remove(id) ?: return
        timer.active = false
        val duration = Math.floor(timer.duration)
        val list = lists[duration] ?: return
        list.timers.remove(timer)
        if (list.timers.isEmpty()) lists.remove(duration)
        arm()
    }

    private fun earliestList(): JSTimerList? {
        var best: JSTimerList? = null
        for (list in lists.values) {
            val current = best
            if (current == null || list.expiry < current.expiry || (list.expiry == current.expiry && list.id < current.id)) best = list
        }
        return best
    }

    /** When the next timer is due, on the `now()` clock. */
    val nextExpiry: Double? get() = earliestList()?.expiry

    /** Node's `processTimers`: runs every due timer list in expiry order. */
    fun processTimers() {
        if (processing) return
        processing = true
        try {
            val current = now()
            while (true) {
                val list = earliestList() ?: break
                if (list.expiry > current) break
                listOnTimeout(list, current)
            }
        } finally {
            processing = false
        }
        arm()
    }

    private fun listOnTimeout(list: JSTimerList, current: Double) {
        while (true) {
            val timer = list.timers.firstOrNull() ?: break
            if (current - timer.start < list.duration) {
                list.expiry = maxOf(timer.start + list.duration, current + 1)
                list.id = nextListId++
                return
            }
            list.timers.removeFirst()
            val start = now()
            try {
                timer.callback()
            } catch (e: Throwable) {
                jsReportUncaught(jsCaught(e))
            }
            Microtasks.taskRan()
            if (timer.repeatInterval != null && timer.active) {
                timer.duration = timer.repeatInterval
                insert(timer, start)
            } else if (timer.active) {
                timer.active = false
                timers.remove(timer.id)
            }
            Microtasks.checkpoint()
        }
        if (lists[list.duration] === list) lists.remove(list.duration)
    }

    private fun arm() {
        val host = host ?: return
        val expiry = nextExpiry
        host(if (expiry == null) null else maxOf(0.0, expiry - now()))
    }

    /** For command-line programs: drains microtasks, then runs timers (sleeping until each is due) until none remain. */
    fun runUntilIdle() {
        Microtasks.checkpoint()
        while (true) {
            val expiry = nextExpiry ?: break
            val wait = expiry - (System.nanoTime() - origin) / 1_000_000.0
            if (wait > 0) {
                Thread.sleep(minOf(wait.toLong() + 1, 1000))
                continue
            }
            processTimers()
            Microtasks.checkpoint()
        }
    }
}

/** `setTimeout(callback, ms)`. Delays below 1 (or NaN) become 1, as in Node. */
fun jsSetTimeout(callback: () -> Unit, ms: Double = 0.0): Double = JSEventLoop.schedule(callback, ms, false)

fun jsSetInterval(callback: () -> Unit, ms: Double = 0.0): Double = JSEventLoop.schedule(callback, ms, true)

fun jsClearTimeout(id: Double?) = JSEventLoop.cancel(id)

fun jsClearInterval(id: Double?) = JSEventLoop.cancel(id)

fun jsQueueMicrotask(callback: () -> Unit) = Microtasks.enqueue(callback)
