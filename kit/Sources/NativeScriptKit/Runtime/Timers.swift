import Foundation

// Timers as Node schedules them (lib/internal/timers.js): one list per duration, lists
// ordered by expiry and then by list id, every timer callback followed by a microtask checkpoint.

final class JSTimer {
    let id: Double
    let callback: () -> Void
    let repeatInterval: Double?
    var duration: Double
    var start = 0.0
    var active = true

    init(id: Double, duration: Double, repeatInterval: Double?, callback: @escaping () -> Void) {
        self.id = id
        self.duration = duration
        self.repeatInterval = repeatInterval
        self.callback = callback
    }
}

final class JSTimerList {
    let duration: Double
    var expiry: Double
    var id: Int
    var timers: [JSTimer] = []
    var head = 0

    init(duration: Double, expiry: Double, id: Int) {
        self.duration = duration
        self.expiry = expiry
        self.id = id
    }

    var first: JSTimer? { head < timers.count ? timers[head] : nil }

    func removeFirst() {
        head += 1
        if head > 64 && head * 2 > timers.count {
            timers.removeFirst(head)
            head = 0
        }
    }

    func remove(_ timer: JSTimer) {
        if let i = timers[head...].firstIndex(where: { $0 === timer }) { timers.remove(at: i) }
    }

    var isEmpty: Bool { head >= timers.count }
}

/// The event loop for timers: drives them from the main run loop in an app, or from
/// `runUntilIdle()` in a command-line program.
public enum JSEventLoop {
    nonisolated(unsafe) static var lists: [Double: JSTimerList] = [:]
    nonisolated(unsafe) static var timers: [Double: JSTimer] = [:]
    nonisolated(unsafe) static var nextTimerId = 1.0
    nonisolated(unsafe) static var nextListId = 0
    nonisolated(unsafe) static var processing = false
    nonisolated(unsafe) static var runLoopTimer: CFRunLoopTimer?
    nonisolated(unsafe) static var observer: CFRunLoopObserver?
    static let origin = DispatchTime.now().uptimeNanoseconds

    /// libuv's clock: whole milliseconds since the loop started.
    static func now() -> Double {
        Double(elapsedNanoseconds() / 1_000_000)
    }

    private static func elapsedNanoseconds() -> UInt64 {
        let start = origin
        return DispatchTime.now().uptimeNanoseconds - start
    }

    static func schedule(_ callback: @escaping () -> Void, _ delay: Double, repeats: Bool) -> Double {
        var duration = delay
        if !(duration >= 1 && duration <= 2_147_483_647) { duration = 1 }
        let timer = JSTimer(id: nextTimerId, duration: duration, repeatInterval: repeats ? duration : nil, callback: callback)
        nextTimerId += 1
        timers[timer.id] = timer
        insert(timer, start: now())
        return timer.id
    }

    private static func insert(_ timer: JSTimer, start: Double) {
        let duration = timer.duration.rounded(.towardZero)
        timer.start = start
        if let list = lists[duration] {
            list.timers.append(timer)
        } else {
            let list = JSTimerList(duration: duration, expiry: start + duration, id: nextListId)
            nextListId += 1
            list.timers.append(timer)
            lists[duration] = list
        }
        arm()
    }

    static func cancel(_ id: Double?) {
        guard let id, let timer = timers.removeValue(forKey: id) else { return }
        timer.active = false
        let duration = timer.duration.rounded(.towardZero)
        guard let list = lists[duration] else { return }
        list.remove(timer)
        if list.isEmpty { lists[duration] = nil }
        arm()
    }

    private static func earliestList() -> JSTimerList? {
        var best: JSTimerList?
        for list in lists.values {
            guard let current = best else { best = list; continue }
            if list.expiry < current.expiry || (list.expiry == current.expiry && list.id < current.id) { best = list }
        }
        return best
    }

    /// When the next timer is due, on the `now()` clock.
    static var nextExpiry: Double? { earliestList()?.expiry }

    /// Node's `processTimers`: runs every due timer list in expiry order.
    static func processTimers() {
        guard !processing else { return }
        processing = true
        defer { processing = false }
        let current = now()
        while let list = earliestList() {
            if list.expiry > current { break }
            listOnTimeout(list, current)
        }
        arm()
    }

    private static func listOnTimeout(_ list: JSTimerList, _ current: Double) {
        while let timer = list.first {
            if current - timer.start < list.duration {
                list.expiry = max(timer.start + list.duration, current + 1)
                list.id = nextListId
                nextListId += 1
                return
            }
            list.removeFirst()
            let start = now()
            timer.callback()
            if let interval = timer.repeatInterval, timer.active {
                timer.duration = interval
                insert(timer, start: start)
            } else if timer.active {
                timer.active = false
                timers[timer.id] = nil
            }
            Microtasks.checkpoint()
        }
        if lists[list.duration] === list { lists[list.duration] = nil }
    }

    /// Re-arms the run-loop timer for the earliest expiry.
    private static func arm() {
        guard let expiry = nextExpiry else {
            if let timer = runLoopTimer { CFRunLoopTimerSetNextFireDate(timer, .greatestFiniteMagnitude) }
            return
        }
        let fireDate = CFAbsoluteTimeGetCurrent() + max(0, expiry - now()) / 1000
        if let timer = runLoopTimer {
            CFRunLoopTimerSetNextFireDate(timer, fireDate)
            return
        }
        let timer = CFRunLoopTimerCreateWithHandler(nil, fireDate, 1e9, 0, 0) { _ in
            JSEventLoop.processTimers()
        }
        runLoopTimer = timer
        CFRunLoopAddTimer(CFRunLoopGetMain(), timer, .commonModes)
    }

    /// For command-line programs: drains microtasks, then runs timers (sleeping until each is due)
    /// until none remain.
    public static func runUntilIdle() {
        Microtasks.checkpoint()
        while let expiry = nextExpiry {
            let due = UInt64(expiry) * 1_000_000
            let elapsed = elapsedNanoseconds()
            if due > elapsed {
                usleep(useconds_t(min(due - elapsed, 1_000_000_000) / 1000 + 1))
                continue
            }
            processTimers()
            Microtasks.checkpoint()
        }
    }

    /// Adds a main-run-loop observer that performs a microtask checkpoint before timers fire and
    /// before the loop sleeps, so promise callbacks run after each batch of UIKit work.
    public static func installRunLoopObserver() {
        guard observer == nil else { return }
        let activities = CFRunLoopActivity.beforeTimers.rawValue | CFRunLoopActivity.beforeWaiting.rawValue
        let created = CFRunLoopObserverCreateWithHandler(nil, activities, true, 0) { _, _ in
            Microtasks.checkpoint()
        }
        observer = created
        CFRunLoopAddObserver(CFRunLoopGetMain(), created, .commonModes)
    }
}

/// `setTimeout(callback, ms)`. Delays below 1 (or NaN) become 1, as in Node.
@discardableResult
public func jsSetTimeout(_ callback: @escaping () -> Void, _ ms: Double = 0) -> Double {
    JSEventLoop.schedule(callback, ms, repeats: false)
}

/// `setInterval(callback, ms)`.
@discardableResult
public func jsSetInterval(_ callback: @escaping () -> Void, _ ms: Double = 0) -> Double {
    JSEventLoop.schedule(callback, ms, repeats: true)
}

/// `clearTimeout(id)`; undefined and unknown ids are ignored.
public func jsClearTimeout(_ id: Double?) { JSEventLoop.cancel(id) }

/// `clearInterval(id)`.
public func jsClearInterval(_ id: Double?) { JSEventLoop.cancel(id) }

/// `queueMicrotask(callback)`.
public func jsQueueMicrotask(_ callback: @escaping () -> Void) { Microtasks.enqueue(callback) }
