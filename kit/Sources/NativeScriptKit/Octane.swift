import UIKit

// What Octane's NativeScript renderer does around a compiled component tree:
// a root mounted into a host view, effects that run after the views exist,
// and re-renders that wait for the microtask Octane schedules them in.

/// `renderNativeScriptApp(host, Component, props)`: the component's views
/// attached to the host as the driver attaches a root (a page's content, a
/// layout's child); `unmount()` disposes them.
public final class OctaneRoot: JSDynamic {
    private let owner: Owner
    private weak var host: View?
    private var view: View?

    public init(host: View, _ render: () -> View) {
        owner = Owner(parent: nil)
        let view = owner.run(render)
        self.host = host
        self.view = view
        if let layout = host as? LayoutBase {
            layout.insertChild(view, min(0, layout.getChildrenCount()))
        } else {
            host.addTemplateChild(view)
        }
    }

    public func unmount() {
        owner.dispose()
        if let view, let layout = host as? LayoutBase { layout.removeChild(view) }
        view = nil
    }

    public subscript(jsKey key: String) -> Any? {
        get { key == "unmount" ? ({ [weak self] (_: [Any?]) throws -> Any? in self?.unmount(); return nil } as JSFunction) : nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "Root" }
}

/// `useSyncExternalStore(subscribe, getSnapshot)` at one call site: subscribed
/// once, its listener bumping a version that whatever read the snapshot tracks.
public func jsExternalStore<T>(_ site: String, subscribe: Any?, snapshot: () throws -> T) rethrows -> T {
    let version: Signal<Int>
    if let existing = externalStores[site] {
        version = existing
    } else {
        version = Signal(0)
        externalStores[site] = version
        let listener: JSFunction = { _ in version.value += 1; return nil }
        jsReport { _ = try jsCall(subscribe, listener) }
    }
    _ = version.value
    return try snapshot()
}
private var externalStores: [String: Signal<Int>] = [:]

/// `useEffect(fn, deps)` / `useLayoutEffect`: `fn` runs once the component's
/// views exist (a passive effect in the microtask after the commit, a layout
/// effect at once), again whenever an entry of `deps` is no longer the same
/// value (after the previous run's cleanup), and its cleanup runs when the
/// component goes.
public final class ComponentEffect {
    private let run: () throws -> (() throws -> Void)?
    private let layout: Bool
    private var cleanup: (() throws -> Void)?
    private var previous: [Any?]?
    private var disposed = false

    @discardableResult
    public init(layout: Bool, deps: (() -> [Any?])?, _ run: @escaping () throws -> (() throws -> Void)?) {
        self.run = run
        self.layout = layout
        Owner.current?.onCleanup { [self] in
            disposed = true
            if let cleanup { jsReport { try cleanup() } }
            cleanup = nil
        }
        guard let deps else { schedule(); return }
        Effect { [self] in
            let next = deps()
            defer { previous = next }
            guard let previous else { untrack { schedule() }; return }
            if previous.count == next.count && zip(previous, next).allSatisfy({ jsSameValue($0, $1) }) { return }
            untrack { schedule() }
        }
    }

    @discardableResult
    public convenience init(layout: Bool, deps: (() -> [Any?])?, _ run: @escaping () throws -> Void) {
        self.init(layout: layout, deps: deps) { try run(); return nil }
    }

    private func schedule() {
        if layout { fire() } else { Microtasks.enqueue { [self] in fire() } }
    }

    private func fire() {
        guard !disposed else { return }
        if let cleanup { jsReport { try cleanup() } }
        cleanup = nil
        jsReport { cleanup = try run() }
    }
}

/// Octane's `registerElement(tag, ViewClass)`: the build resolved each tag
/// to its class, so templates create the class directly.
public func registerElement(_ tag: String, _ type: AnyClass) {}

/// A `className` prop: undefined sets no class.
public func octaneClassName(_ value: String) -> String { value }
public func octaneClassName(_ value: String?) -> String { value ?? "" }
public func octaneClassName(_ value: Any?) -> String { value == nil ? "" : jsToString(value) }

/// A list a template maps over; `{list?.map(…)}` with no list renders no rows.
public func octaneItems<S: Sequence>(_ items: S) -> [S.Element] { Array(items) }
public func octaneItems<S: Sequence>(_ items: S?) -> [S.Element] { items.map(Array.init) ?? [] }

/// A template's value for a view property as script code holds it: a function
/// becomes a script function (`translationFunction={fn}` on a plugin's view,
/// which calls it untyped); anything else is itself.
public func octaneValue(_ value: Any?) -> Any? { value }
public func octaneValue<R>(_ f: @escaping () throws -> R) -> Any? {
    { (_: [Any?]) throws -> Any? in scriptResult(try f()) } as JSFunction
}
public func octaneValue<A, R>(_ f: @escaping (A) throws -> R) -> Any? {
    { (a: [Any?]) throws -> Any? in scriptResult(try f(jsArg(a, 0) as! A)) } as JSFunction
}
public func octaneValue<A, B, R>(_ f: @escaping (A, B) throws -> R) -> Any? {
    { (a: [Any?]) throws -> Any? in scriptResult(try f(jsArg(a, 0) as! A, jsArg(a, 1) as! B)) } as JSFunction
}
public func octaneValue<A, B, C, R>(_ f: @escaping (A, B, C) throws -> R) -> Any? {
    { (a: [Any?]) throws -> Any? in scriptResult(try f(jsArg(a, 0) as! A, jsArg(a, 1) as! B, jsArg(a, 2) as! C)) } as JSFunction
}
public func octaneValue<A, B, C, D, R>(_ f: @escaping (A, B, C, D) throws -> R) -> Any? {
    { (a: [Any?]) throws -> Any? in scriptResult(try f(jsArg(a, 0) as! A, jsArg(a, 1) as! B, jsArg(a, 2) as! C, jsArg(a, 3) as! D)) } as JSFunction
}
public func octaneValue<A, B, C, D, E, R>(_ f: @escaping (A, B, C, D, E) throws -> R) -> Any? {
    { (a: [Any?]) throws -> Any? in scriptResult(try f(jsArg(a, 0) as! A, jsArg(a, 1) as! B, jsArg(a, 2) as! C, jsArg(a, 3) as! D, jsArg(a, 4) as! E)) } as JSFunction
}
public func octaneValue<A, B, C, D, E, F, R>(_ f: @escaping (A, B, C, D, E, F) throws -> R) -> Any? {
    { (a: [Any?]) throws -> Any? in scriptResult(try f(jsArg(a, 0) as! A, jsArg(a, 1) as! B, jsArg(a, 2) as! C, jsArg(a, 3) as! D, jsArg(a, 4) as! E, jsArg(a, 5) as! F)) } as JSFunction
}

private func scriptResult<R>(_ r: R) -> Any? { R.self == Void.self ? nil : r }
