import Foundation

/// An event a component raises (Angular `output()`): the parent subscribes, the component emits.
public final class Emitter<T> {
    private var handlers: [(T) -> Void] = []
    public init() {}
    public func on(_ handler: @escaping (T) -> Void) { handlers.append(handler) }
    public func emit(_ value: T) { for h in handlers { h(value) } }
}

extension Emitter where T == Void {
    public func emit() { emit(()) }
}

/// The route a component was created for (Angular `ActivatedRoute`): set by the
/// router before it constructs the routed component.
public final class ActivatedRoute {
    public struct Snapshot { public let params: [String: String] }
    public let snapshot: Snapshot
    public static var current = ActivatedRoute(params: [:])
    public init(params: [String: String]) { snapshot = Snapshot(params: params) }
}

public struct Route {
    let segments: [String]
    let make: () -> View
    public init(_ path: String, _ make: @escaping () -> View) {
        segments = path.split(separator: "/").map(String.init)
        self.make = make
    }
}

/// Path-based navigation (Angular `RouterExtensions`, `page-router-outlet`):
/// a path resolves to a route, its `:params` to the activated route, and the
/// routed page is pushed on the frame.
public final class Router {
    public static let shared = Router()
    public var routes: [Route] = []
    public var initial = "/"

    /// The outlet: a frame showing the initial route's page.
    public func outlet() -> View {
        let frame = Frame()
        if let page = resolve(initial) { frame.addChild(page) }
        return frame
    }

    public func navigate(_ commands: [Any], _ extras: Any? = nil) {
        let path = commands.map { "\($0)" }.joined(separator: "/")
        guard resolveRoute(path) != nil else { return }
        Frame.topmost?.navigate { self.resolve(path)! }
    }

    func resolve(_ path: String) -> View? {
        guard let (route, params) = resolveRoute(path) else { return nil }
        ActivatedRoute.current = ActivatedRoute(params: params)
        return route.make()
    }

    private func resolveRoute(_ path: String) -> (Route, [String: String])? {
        let parts = path.split(separator: "/").map(String.init)
        for route in routes where route.segments.count == parts.count {
            var params: [String: String] = [:]
            var matched = true
            for (pattern, part) in zip(route.segments, parts) {
                if pattern.hasPrefix(":") { params[String(pattern.dropFirst())] = part.removingPercentEncoding ?? part }
                else if pattern != part { matched = false; break }
            }
            if matched { return (route, params) }
        }
        return nil
    }
}
