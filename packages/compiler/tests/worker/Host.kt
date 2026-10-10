package workertest

import org.nativescript.kit.*
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit

/** The creating thread's loop, as an app's main looper is: the jobs workers post to it, and the main realm's timers. */
object Host {
    private val jobs = LinkedBlockingQueue<() -> Unit>()

    fun install() {
        JSRealm.main.post = { job -> jobs.put(job) }
    }

    fun workerThreads(): List<Thread> = Thread.getAllStackTraces().keys.filter { it.isAlive && it.name.startsWith("JSWorker ") }

    /** Runs jobs and due timers until `done` holds or `ms` pass; whether `done` held. */
    fun pumpUntil(ms: Long, done: () -> Boolean): Boolean {
        val end = System.nanoTime() + ms * 1_000_000
        while (true) {
            if (done()) return true
            val now = System.nanoTime()
            if (now >= end) return done()
            val expiry = JSEventLoop.nextExpiry
            val timerWait = if (expiry == null) Long.MAX_VALUE else maxOf(0L, ((expiry - JSEventLoop.now()) * 1_000_000).toLong())
            val job = jobs.poll(minOf(end - now, timerWait, 5_000_000L), TimeUnit.NANOSECONDS)
            if (job != null) job()
            else if (expiry != null && JSEventLoop.now() >= expiry) {
                JSEventLoop.processTimers()
                Microtasks.checkpoint()
            }
        }
    }

    fun pump(ms: Long) { pumpUntil(ms) { false } }

    /** Until no job, main-realm timer or worker thread is left. */
    fun pumpUntilIdle(ms: Long): Boolean = pumpUntil(ms) { jobs.isEmpty() && JSEventLoop.nextExpiry == null && workerThreads().isEmpty() }
}
