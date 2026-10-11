import Foundation

// Script runs on the main thread only. A native callback another thread calls (a URLSession
// delegate queue, an audio tap, a motion handler) enters it as a job on the main thread: one that
// returns nothing is posted, one that returns a value is awaited by the calling thread.

/// Whether the calling thread is not script's.
@inlinable public func jsOffScriptThread() -> Bool { pthread_main_np() == 0 }

/// A native callback returning nothing: run here on the main thread, else posted to it.
@inlinable public func jsEnter(_ body: @escaping () -> Void) {
    if pthread_main_np() != 0 { body() } else { jsLater(body) }
}

/// A native callback returning a value: run here on the main thread, else run there while the caller waits.
@inlinable public func jsEnterAwaiting<T>(_ body: () -> T) -> T {
    pthread_main_np() != 0 ? body() : jsAwait(body)
}

/// A task on the main thread, from any thread; its microtasks run after it.
public func jsLater(_ job: @escaping () -> Void) {
    JSPosted.post {
        job()
        Microtasks.taskRan()
        Microtasks.checkpoint()
    }
}

/**
 * `body` on the main thread while the calling thread waits, as it would hold NativeScript's isolate
 * lock; like that lock, it deadlocks if the main thread is itself waiting for the caller.
 */
public func jsAwait<T>(_ body: () -> T) -> T {
    withoutActuallyEscaping(body) { body in
        var result: T?
        let done = DispatchSemaphore(value: 0)
        JSPosted.post {
            result = body()
            done.signal()
            Microtasks.taskRan()
            Microtasks.checkpoint()
        }
        done.wait()
        return result!
    }
}

/// Jobs other threads post to the main thread: the main queue runs them in an app, `runUntilIdle` in a command-line program.
public enum JSPosted {
    nonisolated(unsafe) private static var jobs: [() -> Void] = []
    private static let lock = NSLock()
    static let arrived = DispatchSemaphore(value: 0)

    static func post(_ job: @escaping () -> Void) {
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
