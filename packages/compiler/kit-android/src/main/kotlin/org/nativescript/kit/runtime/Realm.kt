package org.nativescript.kit

import java.util.concurrent.CountDownLatch

/**
 * A realm's per-thread state: its global object, timers and microtask queue. A worker's thread
 * enters its own; every other thread runs in the app's (`main`), as all code did before workers.
 */
class JSRealm internal constructor() {
    val global: JSObject = JSObject().also { it["DOMException"] = JSDOMException::class.java }
    val loop = JSEventLoopState()
    val microtasks = JSMicrotasks()
    /** Runs a job on this realm's thread, from any thread: the host installs it for the app's realm (its main looper). */
    @Volatile var post: ((() -> Unit) -> Unit)? = null
    /** Where an uncaught error in this realm goes; null reports it as the app's. */
    var uncaught: ((Any?) -> Unit)? = null

    /**
     * The thread this realm's script runs on. Not volatile: only a thread's own write can make it
     * equal `Thread.currentThread()`, so a stale read elsewhere still answers "another thread".
     */
    var thread: Thread? = null

    /** Whether the calling thread is not this realm's: script it enters must run as a job on the realm's thread. */
    fun offThread(): Boolean = Thread.currentThread() !== thread

    private fun send(job: () -> Unit) {
        val host = post
        if (host != null) host(job) else loop.jobs.put(job)
    }

    /**
     * A native callback that returns nothing, entered from another thread: a task on this realm's
     * thread, as its looper runs any other. What it throws is reported; its microtasks run after it.
     */
    fun later(job: () -> Unit) = send {
        jsReport(job)
        microtasks.taskRan()
        microtasks.checkpoint()
    }

    /**
     * A native callback with a result, entered from another thread: run on this realm's thread while
     * the calling thread waits, as it would hold NativeScript's isolate lock. It deadlocks, as that
     * lock does, if the realm's thread is itself waiting for the caller.
     */
    fun <T> await(body: () -> T): T {
        val done = CountDownLatch(1)
        var result: Result<T>? = null
        send {
            result = runCatching(body)
            done.countDown()
            microtasks.taskRan()
            microtasks.checkpoint()
        }
        done.await()
        return result!!.getOrThrow()
    }

    companion object {
        /** The app's realm: its thread is the one that loads it until the host names its main looper's. */
        val main = JSRealm().also { it.thread = Thread.currentThread() }
        private val entered = ThreadLocal<JSRealm?>()
        fun current(): JSRealm = entered.get() ?: main
        internal fun enter(realm: JSRealm) {
            realm.thread = Thread.currentThread()
            entered.set(realm)
        }
    }
}

/**
 * The realm of an object a native callback entered, when the calling thread is not its own; null on
 * its thread, and while the object's constructor runs (its realm not yet stored), on the thread making it.
 */
@Suppress("NOTHING_TO_INLINE")
inline fun jsElsewhere(realm: JSRealm?): JSRealm? = if (realm != null && realm.offThread()) realm else null
