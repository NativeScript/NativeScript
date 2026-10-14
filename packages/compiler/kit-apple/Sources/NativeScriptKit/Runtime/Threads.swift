import Foundation

// Script runs on the main thread only, and is isolated to the main actor. A native callback another thread
// calls (a URLSession delegate queue, an audio tap, a motion handler) enters it as a job on the main
// thread: one that returns nothing is posted, one that returns a value is awaited by the calling thread.
// These helpers are the only runtime code that runs off the main thread. What a job carries crosses in a
// `JSCarried`: the sending thread has either handed it off or waits until the job ends.

/// A value a job carries to the main thread.
@usableFromInline nonisolated struct JSCarried<T>: @unchecked Sendable {
    @usableFromInline let value: T
    @usableFromInline init(_ value: T) { self.value = value }
}

/// Whether the calling thread is not script's.
@inlinable nonisolated public func jsOffScriptThread() -> Bool { pthread_main_np() == 0 }

/**
 * The code of a native entry point past its guard (`if jsOffScriptThread() { … }`), which has made sure it
 * runs on the main thread: script code, isolated to the main actor, without a second check of the thread.
 * The entry point's arguments are passed in rather than captured: they belong to the thread native code
 * called it on, and are the main thread's from here on. One overload per arity.
 */
@inlinable nonisolated public func jsOnMainThread<R>(_ body: @MainActor () throws -> R) rethrows -> R {
    assert(pthread_main_np() != 0, "script entered off the main thread")
    return try withoutActuallyEscaping(body) { body in try unsafeBitCast(body, to: (() throws -> R).self)() }
}
@inlinable nonisolated public func jsOnMainThread<A, R>(_ a: A, body: @MainActor (A) throws -> R) rethrows -> R {
    assert(pthread_main_np() != 0, "script entered off the main thread")
    return try withoutActuallyEscaping(body) { body in try unsafeBitCast(body, to: ((A) throws -> R).self)(a) }
}
@inlinable nonisolated public func jsOnMainThread<A, B, R>(_ a: A, _ b: B, body: @MainActor (A, B) throws -> R) rethrows -> R {
    assert(pthread_main_np() != 0, "script entered off the main thread")
    return try withoutActuallyEscaping(body) { body in try unsafeBitCast(body, to: ((A, B) throws -> R).self)(a, b) }
}
@inlinable nonisolated public func jsOnMainThread<A, B, C, R>(_ a: A, _ b: B, _ c: C, body: @MainActor (A, B, C) throws -> R) rethrows -> R {
    assert(pthread_main_np() != 0, "script entered off the main thread")
    return try withoutActuallyEscaping(body) { body in try unsafeBitCast(body, to: ((A, B, C) throws -> R).self)(a, b, c) }
}
@inlinable nonisolated public func jsOnMainThread<A, B, C, D, R>(_ a: A, _ b: B, _ c: C, _ d: D, body: @MainActor (A, B, C, D) throws -> R) rethrows -> R {
    assert(pthread_main_np() != 0, "script entered off the main thread")
    return try withoutActuallyEscaping(body) { body in try unsafeBitCast(body, to: ((A, B, C, D) throws -> R).self)(a, b, c, d) }
}
@inlinable nonisolated public func jsOnMainThread<A, B, C, D, E, R>(_ a: A, _ b: B, _ c: C, _ d: D, _ e: E, body: @MainActor (A, B, C, D, E) throws -> R) rethrows -> R {
    assert(pthread_main_np() != 0, "script entered off the main thread")
    return try withoutActuallyEscaping(body) { body in try unsafeBitCast(body, to: ((A, B, C, D, E) throws -> R).self)(a, b, c, d, e) }
}
@inlinable nonisolated public func jsOnMainThread<A, B, C, D, E, F, R>(_ a: A, _ b: B, _ c: C, _ d: D, _ e: E, _ f: F, body: @MainActor (A, B, C, D, E, F) throws -> R) rethrows -> R {
    assert(pthread_main_np() != 0, "script entered off the main thread")
    return try withoutActuallyEscaping(body) { body in try unsafeBitCast(body, to: ((A, B, C, D, E, F) throws -> R).self)(a, b, c, d, e, f) }
}
@inlinable nonisolated public func jsOnMainThread<A, B, C, D, E, F, G, R>(_ a: A, _ b: B, _ c: C, _ d: D, _ e: E, _ f: F, _ g: G, body: @MainActor (A, B, C, D, E, F, G) throws -> R) rethrows -> R {
    assert(pthread_main_np() != 0, "script entered off the main thread")
    return try withoutActuallyEscaping(body) { body in try unsafeBitCast(body, to: ((A, B, C, D, E, F, G) throws -> R).self)(a, b, c, d, e, f, g) }
}
@inlinable nonisolated public func jsOnMainThread<A, B, C, D, E, F, G, H, R>(_ a: A, _ b: B, _ c: C, _ d: D, _ e: E, _ f: F, _ g: G, _ h: H, body: @MainActor (A, B, C, D, E, F, G, H) throws -> R) rethrows -> R {
    assert(pthread_main_np() != 0, "script entered off the main thread")
    return try withoutActuallyEscaping(body) { body in try unsafeBitCast(body, to: ((A, B, C, D, E, F, G, H) throws -> R).self)(a, b, c, d, e, f, g, h) }
}

// A script closure as a block native code may call from any thread, one overload per arity (Objective-C
// blocks take few parameters): `jsEnter` for one returning nothing, run there on the main thread, else
// posted to it; `jsEnterAwaiting` for one returning a value, run there on the main thread, else run there
// while the caller waits.
@inlinable nonisolated public func jsEnter(_ body: @escaping @MainActor () -> Void) -> @Sendable () -> Void {
    let body = JSCarried(body)
    return {
        jsEnterPosting { body.value() }
    }
}
@inlinable nonisolated public func jsEnterAwaiting<R>(_ body: @escaping @MainActor () -> R) -> @Sendable () -> R {
    let body = JSCarried(body)
    return {
        return jsEnterWaiting { body.value() }
    }
}
@inlinable nonisolated public func jsEnter<A>(_ body: @escaping @MainActor (A) -> Void) -> @Sendable (A) -> Void {
    let body = JSCarried(body)
    return { a in
        let carried = JSCarried(a)
        jsEnterPosting { body.value(carried.value) }
    }
}
@inlinable nonisolated public func jsEnterAwaiting<A, R>(_ body: @escaping @MainActor (A) -> R) -> @Sendable (A) -> R {
    let body = JSCarried(body)
    return { a in
        let carried = JSCarried(a)
        return jsEnterWaiting { body.value(carried.value) }
    }
}
@inlinable nonisolated public func jsEnter<A, B>(_ body: @escaping @MainActor (A, B) -> Void) -> @Sendable (A, B) -> Void {
    let body = JSCarried(body)
    return { a, b in
        let carried = JSCarried((a, b))
        jsEnterPosting { body.value(carried.value.0, carried.value.1) }
    }
}
@inlinable nonisolated public func jsEnterAwaiting<A, B, R>(_ body: @escaping @MainActor (A, B) -> R) -> @Sendable (A, B) -> R {
    let body = JSCarried(body)
    return { a, b in
        let carried = JSCarried((a, b))
        return jsEnterWaiting { body.value(carried.value.0, carried.value.1) }
    }
}
@inlinable nonisolated public func jsEnter<A, B, C>(_ body: @escaping @MainActor (A, B, C) -> Void) -> @Sendable (A, B, C) -> Void {
    let body = JSCarried(body)
    return { a, b, c in
        let carried = JSCarried((a, b, c))
        jsEnterPosting { body.value(carried.value.0, carried.value.1, carried.value.2) }
    }
}
@inlinable nonisolated public func jsEnterAwaiting<A, B, C, R>(_ body: @escaping @MainActor (A, B, C) -> R) -> @Sendable (A, B, C) -> R {
    let body = JSCarried(body)
    return { a, b, c in
        let carried = JSCarried((a, b, c))
        return jsEnterWaiting { body.value(carried.value.0, carried.value.1, carried.value.2) }
    }
}
@inlinable nonisolated public func jsEnter<A, B, C, D>(_ body: @escaping @MainActor (A, B, C, D) -> Void) -> @Sendable (A, B, C, D) -> Void {
    let body = JSCarried(body)
    return { a, b, c, d in
        let carried = JSCarried((a, b, c, d))
        jsEnterPosting { body.value(carried.value.0, carried.value.1, carried.value.2, carried.value.3) }
    }
}
@inlinable nonisolated public func jsEnterAwaiting<A, B, C, D, R>(_ body: @escaping @MainActor (A, B, C, D) -> R) -> @Sendable (A, B, C, D) -> R {
    let body = JSCarried(body)
    return { a, b, c, d in
        let carried = JSCarried((a, b, c, d))
        return jsEnterWaiting { body.value(carried.value.0, carried.value.1, carried.value.2, carried.value.3) }
    }
}
@inlinable nonisolated public func jsEnter<A, B, C, D, E>(_ body: @escaping @MainActor (A, B, C, D, E) -> Void) -> @Sendable (A, B, C, D, E) -> Void {
    let body = JSCarried(body)
    return { a, b, c, d, e in
        let carried = JSCarried((a, b, c, d, e))
        jsEnterPosting { body.value(carried.value.0, carried.value.1, carried.value.2, carried.value.3, carried.value.4) }
    }
}
@inlinable nonisolated public func jsEnterAwaiting<A, B, C, D, E, R>(_ body: @escaping @MainActor (A, B, C, D, E) -> R) -> @Sendable (A, B, C, D, E) -> R {
    let body = JSCarried(body)
    return { a, b, c, d, e in
        let carried = JSCarried((a, b, c, d, e))
        return jsEnterWaiting { body.value(carried.value.0, carried.value.1, carried.value.2, carried.value.3, carried.value.4) }
    }
}
@inlinable nonisolated public func jsEnter<A, B, C, D, E, F>(_ body: @escaping @MainActor (A, B, C, D, E, F) -> Void) -> @Sendable (A, B, C, D, E, F) -> Void {
    let body = JSCarried(body)
    return { a, b, c, d, e, f in
        let carried = JSCarried((a, b, c, d, e, f))
        jsEnterPosting { body.value(carried.value.0, carried.value.1, carried.value.2, carried.value.3, carried.value.4, carried.value.5) }
    }
}
@inlinable nonisolated public func jsEnterAwaiting<A, B, C, D, E, F, R>(_ body: @escaping @MainActor (A, B, C, D, E, F) -> R) -> @Sendable (A, B, C, D, E, F) -> R {
    let body = JSCarried(body)
    return { a, b, c, d, e, f in
        let carried = JSCarried((a, b, c, d, e, f))
        return jsEnterWaiting { body.value(carried.value.0, carried.value.1, carried.value.2, carried.value.3, carried.value.4, carried.value.5) }
    }
}

/// Script's code of a block returning nothing: run here on the main thread, else posted to it.
@usableFromInline nonisolated func jsEnterPosting(_ body: @escaping @MainActor () -> Void) {
    if pthread_main_np() != 0 { jsOnMainThread(body) } else { JSPosted.post { body(); jsTaskRan() } }
}

/// Script's code of a block returning a value: run here on the main thread, else run there while the caller waits.
@usableFromInline nonisolated func jsEnterWaiting<R>(_ body: @MainActor () -> R) -> R {
    pthread_main_np() != 0 ? jsOnMainThread(body) : jsAwaitMain(body)
}

/// A native entry point called again on the main thread, from any thread; its microtasks run after it.
nonisolated public func jsLater(_ entry: @escaping () -> Void) {
    let entry = JSCarried(entry)
    JSPosted.post {
        entry.value()
        jsTaskRan()
    }
}

/**
 * `body` on the main thread while the calling thread waits, as it would hold NativeScript's isolate
 * lock; like that lock, it deadlocks if the main thread is itself waiting for the caller.
 */
@usableFromInline nonisolated func jsAwaitMain<T>(_ body: @MainActor () -> T) -> T {
    withoutActuallyEscaping(body) { body in
        let body = JSCarried(body)
        let result = JSAwaited<T>()
        let done = DispatchSemaphore(value: 0)
        JSPosted.post {
            result.value = body.value()
            done.signal()
            jsTaskRan()
        }
        done.wait()
        return result.value!
    }
}

/// A native entry point called again on the main thread, the calling thread waiting for its result.
nonisolated public func jsAwait<T>(_ entry: () -> T) -> T {
    withoutActuallyEscaping(entry) { entry in
        let entry = JSCarried(entry)
        return jsAwaitMain { entry.value() }
    }
}

/// The result of a job the calling thread waits for: written on the main thread before the wait ends.
@usableFromInline nonisolated final class JSAwaited<T>: @unchecked Sendable {
    @usableFromInline var value: T?
    @usableFromInline init() {}
}

/// After a task from another thread: its microtasks.
@usableFromInline func jsTaskRan() {
    Microtasks.taskRan()
    Microtasks.checkpoint()
}

/// Jobs other threads post to the main thread: the main queue runs them in an app, `runUntilIdle` in a command-line program.
public enum JSPosted {
    nonisolated(unsafe) private static var jobs: [@MainActor () -> Void] = []
    private nonisolated static let lock = NSLock()
    nonisolated static let arrived = DispatchSemaphore(value: 0)

    @usableFromInline nonisolated static func post(_ job: @escaping @MainActor () -> Void) {
        lock.lock()
        jobs.append(job)
        let first = jobs.count == 1
        lock.unlock()
        arrived.signal()
        if first { DispatchQueue.main.async { run() } }
    }

    /// Runs every posted job, in order; whether there was one.
    @discardableResult static func run() -> Bool {
        lock.lock()
        let ready = jobs
        jobs = []
        lock.unlock()
        for job in ready { job() }
        return !ready.isEmpty
    }
}
