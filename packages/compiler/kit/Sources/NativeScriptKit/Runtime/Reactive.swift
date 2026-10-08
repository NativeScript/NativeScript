import Foundation

/// The dependency a deeply reactive collection reports (Vue's `ref`/`reactive`): reads
/// subscribe the running `Effect`, mutations re-run the effects that read it.
public final class JSTracker {
    private let version = Signal<Int>(0)

    public init() {}

    public func track() { _ = version.value }

    public func trigger() { version.update { $0 &+ 1 } }
}

/// A class Vue's deep reactivity reaches into: `JSArray`, `JSObject`, `JSMap`, `JSSet` and
/// generated classes, which install trackers on themselves.
public protocol JSReactiveConvertible: AnyObject {
    func jsMakeReactive()
}

/// Vue's `reactive(value)`: makes a collection or generated class track reads and writes and
/// returns it; other values pass through. What is read from a reactive collection is made
/// reactive as it is read, as Vue's lazy deep proxies do, so `list.value.items[0].tags.push(x)` triggers.
@discardableResult
public func jsReactive<T>(_ value: T) -> T {
    if let convertible = value as? JSReactiveConvertible { convertible.jsMakeReactive() }
    return value
}

func jsReactiveAny(_ value: Any?) -> Any? {
    if let convertible = value as? JSReactiveConvertible { convertible.jsMakeReactive() }
    return value
}
