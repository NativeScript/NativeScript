package workertest

import org.nativescript.kit.*
import java.util.Collections
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger

// kit-android's Worker on the host JVM: this thread is the app's main thread, its loop `Host`.

private var failed = 0
private var passed = 0

private fun check(name: String, ok: Boolean, detail: () -> String = { "" }) {
    if (ok) passed++ else failed++
    println(if (ok) "✓ $name" else "✗ $name: ${detail()}")
}

/** On the worker's thread: its realm's `onmessage`. */
private fun onMessage(handler: (Any?) -> Unit) {
    jsSet(jsGlobalThis, "onmessage", { event: Any? -> handler((event as JSMessageEvent).data); null })
}

private fun thrown(body: () -> Unit): Any? = try { body(); null } catch (e: JSException) { e.value }

private val reported: MutableList<String> = Collections.synchronizedList(ArrayList())
private val mainThread = Thread.currentThread()
private val threadCrashes: MutableList<String> = Collections.synchronizedList(ArrayList())

private fun lifecycleTerminate() {
    val ticks = AtomicInteger()
    val handled = Collections.synchronizedList(ArrayList<Any?>())
    val release = CountDownLatch(1)
    JSWorker.register("terminate.worker") {
        jsSetInterval({ ticks.incrementAndGet() }, 2.0)
        onMessage { data ->
            handled.add(data)
            postMessage("reply $data")
            if (data == "block") release.await(5, TimeUnit.SECONDS)
            postMessage("done $data")
        }
    }
    val worker = JSWorker("./terminate.worker", "terminate.worker")
    val got = ArrayList<Any?>()
    worker.onmessage = { e -> got.add(e.data); null }
    worker.postMessage("first")
    Host.pumpUntil(2000) { got.size == 2 && ticks.get() > 2 }
    check("terminate: the worker runs, its timers tick", got == listOf("reply first", "done first") && ticks.get() > 2) { "got $got, ticks $ticks" }
    worker.postMessage("block")
    // Not pumping: "reply block" waits in the main loop's queue when terminate() comes.
    while (handled.size < 2) Thread.sleep(1)
    worker.postMessage("queued 1")
    worker.postMessage("queued 2")
    worker.terminate()
    release.countDown()
    check("terminate: the thread exits", run { worker.thread.join(2000); !worker.thread.isAlive })
    Host.pump(50)
    check("terminate: queued messages are dropped", handled == listOf("first", "block")) { "handled $handled" }
    check("terminate: no event arrives after it, even one posted before", got == listOf("reply first", "done first")) { "got $got" }
    val after = ticks.get()
    Thread.sleep(30)
    check("terminate: the worker's timers stop", ticks.get() == after) { "$after then ${ticks.get()}" }
    check("terminate: postMessage after it is a no-op", thrown { worker.postMessage("late"); worker.postMessage(JSMethod { _, _ -> null }) } == null)
    Host.pump(30)
    check("terminate: nothing handled after postMessage on a terminated worker", handled.size == 2 && got.size == 2)
    worker.terminate()
}

private fun lifecycleClose() {
    val ticks = AtomicInteger()
    val handled = Collections.synchronizedList(ArrayList<Any?>())
    JSWorker.register("close.worker") {
        jsSetInterval({ ticks.incrementAndGet() }, 2.0)
        onMessage { data ->
            handled.add(data)
            if (data == "close") {
                postMessage("before close")
                close()
                postMessage("after close")
            }
        }
    }
    val worker = JSWorker("./close.worker", "close.worker")
    val got = ArrayList<Any?>()
    var errors = 0
    worker.onmessage = { e -> got.add(e.data); null }
    worker.onerror = { _ -> errors++; true }
    Host.pumpUntil(1000) { ticks.get() > 2 }
    worker.postMessage("close")
    worker.postMessage("queued")
    check("close: the thread exits", run { worker.thread.join(2000); !worker.thread.isAlive })
    Host.pump(50)
    check("close: what it posted before close() arrives, nothing after", got == listOf("before close")) { "got $got" }
    check("close: queued messages are dropped", handled == listOf("close")) { "handled $handled" }
    val after = ticks.get()
    Thread.sleep(30)
    check("close: the worker's timers stop", ticks.get() == after && errors == 0) { "$after then ${ticks.get()}, errors $errors" }
    worker.postMessage("late")
    Host.pump(20)
    check("close: postMessage after it is a no-op", handled.size == 1)

    val again = JSWorker("./close.worker", "close.worker")
    val gotAgain = ArrayList<Any?>()
    again.onmessage = { e -> gotAgain.add(e.data); null }
    again.postMessage("close")
    Host.pumpUntil(2000) { gotAgain.size == 1 }
    check("close: the script starts again in a new worker once closed", gotAgain == listOf("before close")) { "got $gotAgain" }
    again.thread.join(2000)
}

private fun errors() {
    val counter = AtomicInteger()
    JSWorker.register("top-level-throws.worker") { throw JSException(JSError("at the top")) }
    val top = JSWorker("./top-level-throws.worker", "top-level-throws.worker")
    val messages = ArrayList<String>()
    var on: Thread? = null
    top.onerror = { e -> messages.add(e.message); on = Thread.currentThread(); true }
    Host.pumpUntil(2000) { messages.isNotEmpty() }
    check("errors: the top level's exception is an ErrorEvent on the creating thread", messages == listOf("Uncaught Error: at the top") && on === mainThread) { "messages $messages on ${on?.name}" }
    check("errors: a handler returning true leaves it handled", reported.isEmpty()) { "reported $reported" }
    top.terminate()

    JSWorker.register("handler-throws.worker") {
        onMessage { data ->
            if (data == "throw") throw JSException(JSTypeError("in onmessage"))
            if (data == "java") throw IllegalStateException("from Java")
            if (data == "timer") jsSetTimeout({ throw JSException(JSRangeError("in a timer")) }, 1.0)
            if (data == "rejection") jsQueueMicrotask { throw JSException(JSError("in a microtask")) }
            postMessage("still alive ${counter.incrementAndGet()}")
        }
    }
    val worker = JSWorker("./handler-throws.worker", "handler-throws.worker")
    val got = ArrayList<Any?>()
    val events = ArrayList<String>()
    worker.onmessage = { e -> got.add(e.data); null }
    worker.postMessage("throw")
    worker.postMessage("ok")
    Host.pumpUntil(2000) { reported.size == 1 && got.size == 1 }
    check("errors: onmessage's exception with no onerror is reported as uncaught on the creating thread", reported == listOf("main: TypeError: in onmessage")) { "reported $reported" }
    check("errors: the worker goes on after an error", got == listOf("still alive 1")) { "got $got" }
    reported.clear()

    worker.onerror = { e -> events.add(e.message); null }
    worker.postMessage("timer")
    Host.pumpUntil(2000) { events.size == 1 && reported.size == 1 }
    check("errors: a timer's exception is an ErrorEvent", events == listOf("Uncaught RangeError: in a timer")) { "events $events" }
    check("errors: a handler not returning true leaves it uncaught", reported == listOf("main: RangeError: in a timer")) { "reported $reported" }
    reported.clear()
    events.clear()

    worker.onerror = { e -> events.add(e.message); true }
    worker.postMessage("java")
    worker.postMessage("rejection")
    Host.pumpUntil(2000) { events.size == 2 }
    check("errors: a JVM exception and a microtask's are ErrorEvents too", events == listOf("Uncaught Error: from Java", "Uncaught Error: in a microtask") && reported.isEmpty()) { "events $events reported $reported" }
    events.clear()

    worker.onerror = { _ -> throw JSException(JSError("onerror throws")) }
    worker.postMessage("throw")
    Host.pumpUntil(2000) { reported.isNotEmpty() }
    check("errors: an onerror that throws is reported, the main thread goes on", reported == listOf("main: Error: onerror throws")) { "reported $reported" }
    reported.clear()

    val saved = jsUncaughtHandler
    jsUncaughtHandler = { _ -> throw IllegalStateException("an app that rethrows uncaught errors") }
    worker.onerror = null
    worker.postMessage("throw")
    var survived = false
    try {
        Host.pumpUntil(300) { false }
        survived = true
    } catch (_: Throwable) {}
    jsUncaughtHandler = saved
    check("errors: an uncaught handler that throws does not reach the main loop", survived)
    worker.terminate()
    worker.thread.join(2000)
}

private fun cloning() {
    val o = JSObject()
    o["n"] = 1.5; o["s"] = "text"; o["b"] = true; o["nil"] = JSNull; o["u"] = null
    o["list"] = JSArray(arrayListOf<Any?>(1.0, JSArray(arrayListOf<Any?>("deep")), JSObject().also { it["k"] = "v" }))
    val buffer = JSArrayBuffer(8.0)
    val floats = JSFloat32Array(buffer, 0.0, 2.0)
    val bytes = JSUint8Array(buffer)
    floats[0] = 0.5
    o["floats"] = floats; o["bytes"] = bytes; o["buffer"] = buffer
    o["map"] = JSMap<Any?, Any?>().also { it.set("a", JSArray(arrayListOf<Any?>(1.0))) }
    o["set"] = JSSet<Any?>().also { it.add("x"); it.add(2.0) }
    o["date"] = JSDate(1_700_000_000_000.0)
    o["error"] = JSTypeError("cloned")
    o["self"] = o
    val list = JSArray<Any?>(); list.storage.add(list); o["loop"] = list
    val copy = jsStructuredClone(o) as JSObject
    check("clone: primitives, strings and nested arrays and objects", copy !== o && copy["n"] == 1.5 && copy["s"] == "text" && copy["b"] == true && copy["nil"] === JSNull && copy["u"] == null &&
        jsInspect(copy["list"]) == jsInspect(o["list"]) && copy["list"] !== o["list"]) { jsInspect(copy) }
    val f = copy["floats"] as JSFloat32Array
    val cb = copy["buffer"] as JSArrayBuffer
    floats[0] = 9.0
    check("clone: typed arrays and buffers copied, views still sharing their copied buffer", f[0] == 0.5 && f.buffer === cb && (copy["bytes"] as JSUint8Array).buffer === cb && cb !== buffer && cb.byteLength == 8.0) { "f0 ${f[0]}" }
    val m = copy["map"] as JSMap<*, *>
    @Suppress("UNCHECKED_CAST") val s = copy["set"] as JSSet<Any?>
    check("clone: Map, Set and Date", m !== o["map"] && jsInspect(m) == jsInspect(o["map"]) && s.has("x") && s.has(2.0) && (copy["date"] as JSDate).time == 1_700_000_000_000.0 && copy["date"] !== o["date"])
    check("clone: an error keeps its standard name", (copy["error"] as? JSTypeError)?.message == "cloned")
    check("clone: cycles preserved", copy["self"] === copy && (copy["loop"] as JSArray<*>).storage[0] === copy["loop"])
    val fnError = thrown { jsStructuredClone(JSObject().also { it["f"] = JSMethod { _, _ -> null } }) } as? JSDOMException
    val lambdaError = thrown { jsStructuredClone({ x: Any? -> x }) } as? JSDOMException
    val javaError = thrown { jsStructuredClone(java.lang.StringBuilder("java")) } as? JSDOMException
    val hostError = thrown { jsStructuredClone(object : JSHostObject() {}) } as? JSDOMException
    check("clone: functions and Java objects are a DataCloneError", listOf(fnError, lambdaError, javaError, hostError).all { it?.name == "DataCloneError" }) { "$fnError $lambdaError $javaError $hostError" }

    JSWorker.register("echo.worker") {
        onMessage { data ->
            if (data == "function") postMessage(JSMethod { _, _ -> null }) else postMessage(data)
        }
    }
    val worker = JSWorker("./echo.worker", "echo.worker")
    val got = ArrayList<Any?>()
    val events = ArrayList<String>()
    worker.onmessage = { e -> got.add(e.data); null }
    worker.onerror = { e -> events.add(e.message); true }
    val sendError = thrown { worker.postMessage(JSArray(arrayListOf<Any?>(JSMethod { _, _ -> null }))) } as? JSDOMException
    check("clone: posting a function throws DataCloneError to the sender", sendError?.name == "DataCloneError") { "$sendError" }
    val sent = JSArrayBuffer(16.0)
    worker.postMessage(o, JSArray(arrayListOf<Any?>(sent)))
    worker.postMessage("function")
    Host.pumpUntil(2000) { got.size == 1 && events.size == 1 }
    val back = got.firstOrNull() as? JSObject
    check("clone: a round trip through the worker keeps the data and its cycles", back != null && back !== o && back["self"] === back && jsInspect(back["map"]) == jsInspect(o["map"]) && (back["floats"] as JSFloat32Array)[0] == floats[0]) { "${got.firstOrNull()}" }
    check("clone: a transfer list is copied, not detached", sent.byteLength == 16.0)
    check("clone: the worker posting a function is a DataCloneError in the worker", events.size == 1 && events[0].startsWith("Uncaught DataCloneError")) { "events $events" }
    worker.terminate()
    worker.thread.join(2000)
}

private fun secondWorker() {
    val started = Collections.synchronizedList(ArrayList<String>())
    val release = CountDownLatch(1)
    JSWorker.register("single.worker") {
        started.add("single on ${Thread.currentThread().name}")
        onMessage { data ->
            if (data == "block") release.await(5, TimeUnit.SECONDS)
            postMessage("single $data")
        }
    }
    JSWorker.register("other.worker") {
        jsSet(jsGlobalThis, "mine", "other's global")
        onMessage { data -> postMessage("other $data ${jsGet(jsGlobalThis, "mine")}") }
    }
    val first = JSWorker("./single.worker", "single.worker")
    val second = thrown { JSWorker("./single.worker", "single.worker") } as? JSError
    check("second worker: a second live worker of a script fails with a clear error", second?.message?.contains("single.worker already runs in a worker") == true) { "${second?.message}" }
    val other = JSWorker("./other.worker", "other.worker")
    val got = ArrayList<Any?>()
    first.onmessage = { e -> got.add(e.data); null }
    other.onmessage = { e -> got.add(e.data); null }
    first.postMessage("a")
    other.postMessage("b")
    Host.pumpUntil(2000) { got.size == 2 }
    check("second worker: different scripts run side by side, each with its own global", got.toSet() == setOf("single a", "other b other's global") && jsGetOptional(jsGlobalThis, "mine") == null &&
        first.thread !== other.thread && first.thread.isAlive && other.thread.isAlive) { "got $got" }
    first.postMessage("block")
    Host.pump(20)
    first.terminate()
    val third = JSWorker("./single.worker", "single.worker")
    Host.pump(50)
    check("second worker: one after terminate() starts once the first's thread has ended", started.size == 1 && first.thread.isAlive) { "started $started" }
    release.countDown()
    Host.pumpUntil(2000) { started.size == 2 }
    check("second worker: ...and then runs", started.size == 2 && !first.thread.isAlive) { "started $started" }
    third.terminate()
    other.terminate()
    third.thread.join(2000)
    other.thread.join(2000)
}

fun main() {
    Host.install()
    jsUncaughtHandler = { value -> reported.add("${Thread.currentThread().name}: ${jsToString(value)}") }
    Thread.setDefaultUncaughtExceptionHandler { t, e -> threadCrashes.add("${t.name}: $e") }
    val only = System.getProperty("worker.only")
    for ((name, test) in listOf("lifecycle" to ::lifecycleTerminate, "close" to ::lifecycleClose, "errors" to ::errors, "clone" to ::cloning, "second" to ::secondWorker)) {
        if (only == null || only == name) test()
    }
    check("no worker thread left running", Host.pumpUntilIdle(3000)) { Host.workerThreads().joinToString { it.name } }
    check("no thread ended by an uncaught exception", threadCrashes.isEmpty()) { "$threadCrashes" }
    println("$passed of ${passed + failed} worker checks pass")
    System.exit(if (failed == 0) 0 else 1)
}
