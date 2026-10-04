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
    public struct Snapshot { public let params: JSRecord<String> }
    public let snapshot: Snapshot
    /// `route.params`: the route's parameters, replayed to each subscriber.
    public let params: RxBehaviorSubject<JSRecord<String>>
    /// The outlet the route renders in, and the URL segments within that outlet up to and including the route's own.
    let outlet: String
    let url: [String]
    public static var current = ActivatedRoute(params: [:])

    public init(params: [String: String], outlet: String = Router.primary, url: [String] = []) {
        let record = JSRecord(params)
        snapshot = Snapshot(params: record)
        self.params = RxBehaviorSubject(record)
        self.outlet = outlet
        self.url = url
    }
}

public struct Route {
    let segments: [String]
    let make: () -> View
    public init(_ path: String, _ make: @escaping () -> View) {
        segments = path.split(separator: "/").map(String.init)
        self.make = make
    }
}

/// A route of the app's configuration (Angular's `Route`), lazy children and components resolved at compile time.
public final class RouteConfig {
    let segments: [String]
    let outlet: String
    let redirectTo: String?
    let full: Bool
    let children: [RouteConfig]
    let make: (() -> View)?

    public init(_ path: String, outlet: String = Router.primary, redirectTo: String? = nil, full: Bool = false, children: [RouteConfig] = [], _ make: (() -> View)? = nil) {
        segments = path.split(separator: "/").map(String.init)
        self.outlet = outlet
        self.redirectTo = redirectTo
        self.full = full
        self.children = children
        self.make = make
    }
}

/// Path-based navigation (Angular's router with `page-router-outlet`s, `RouterExtensions`):
/// each outlet is a frame, a URL within an outlet resolves through the configuration to a
/// component, and navigating to a URL the outlet does not show pushes that component's page.
public final class Router {
    public static let primary = "primary"
    public static let shared = Router()
    /// The flat table of apps configured without a route tree.
    public var routes: [Route] = []
    public var initial = "/"
    public var config: [RouteConfig] = []

    private final class Outlet {
        weak var frame: Frame?
        /// The configuration the outlet's URLs resolve against, and the primary URL that holds it.
        let routes: [RouteConfig]
        init(frame: Frame, routes: [RouteConfig]) { self.frame = frame; self.routes = routes }
    }
    private var outlets: [String: Outlet] = [:]
    /// Navigations to outlets not created yet, applied when they are.
    private var pending: [String: [String]] = [:]
    /// The outlets in the order they were last navigated, for `back()`.
    private var history: [String] = []

    /// A `page-router-outlet`: a frame showing its outlet's URL.
    public func outlet(_ name: String = Router.primary) -> View {
        let frame = Frame()
        if config.isEmpty {
            if let page = resolveFlat(initial) { frame.addChild(page) }
            return frame
        }
        outlets[name] = Outlet(frame: frame, routes: name == Router.primary ? config : Router.routes(in: config, outlet: name))
        if name == Router.primary {
            show(name, ["/"], animated: false, into: frame)
        } else if let url = pending.removeValue(forKey: name) {
            show(name, url, animated: false, into: frame)
        }
        return frame
    }

    @discardableResult
    public func navigate(_ commands: [Any], _ extras: Any? = nil) -> JSPromise<Bool> {
        if config.isEmpty {
            let path = commands.map { "\($0)" }.joined(separator: "/")
            guard resolveFlatRoute(path) != nil else { return JSPromise.resolve(false) }
            Frame.topmost()?.navigate { self.resolveFlat(path)! }
            return JSPromise.resolve(true)
        }
        let relativeTo = field(extras, "relativeTo") as? ActivatedRoute
        let animated = field(extras, "animated").map { jsTruthy($0) } ?? true
        var targets: [(outlet: String, url: [String])] = []
        var segments: [String] = []
        var absolute = false
        for (i, command) in commands.enumerated() {
            if let text = command as? String {
                if i == 0, text.hasPrefix("/") { absolute = true }
                segments += text.split(separator: "/").map(String.init)
            } else if let outlets = field(command, "outlets") {
                for key in jsKeysOf(outlets) {
                    let commands = (try? jsItemsOf(field(outlets, key))) ?? []
                    let url = commands.flatMap { jsToString($0).split(separator: "/").map(String.init) }
                    targets.append((key, url))
                }
            } else {
                segments.append(jsToString(command))
            }
        }
        if !segments.isEmpty {
            if absolute || relativeTo == nil {
                targets.insert((Router.primary, segments), at: 0)
            } else if let base = relativeTo {
                var url = base.url
                for s in segments {
                    if s == ".." { if !url.isEmpty { url.removeLast() } } else if s != "." { url.append(s) }
                }
                targets.insert((base.outlet, url), at: 0)
            }
        }
        var ok = true
        for (name, url) in targets {
            // The primary URL `/home` with outlets names the route holding them, already shown.
            if name == Router.primary, !targets.dropFirst().isEmpty, current(Router.primary)?.first == url.first { continue }
            guard let outlet = outlets[name], let frame = outlet.frame else {
                pending[name] = url
                continue
            }
            ok = show(name, url, animated: animated, into: frame) && ok
        }
        return JSPromise.resolve(ok)
    }

    /// `navigate(['/recipe', id])` as translated code passes it.
    @discardableResult
    public func navigate(_ commands: JSArray<Any?>, _ extras: Any? = nil) -> JSPromise<Bool> {
        navigate(commands.storage.map { $0 ?? "" }, extras)
    }

    /// `back()`: the outlet of the given route, else the one navigated last that can go back.
    public func back(_ options: Any? = nil) {
        if let route = field(options, "relativeTo") as? ActivatedRoute, let frame = outlets[route.outlet]?.frame, frame.canGoBack {
            frame.goBack()
            return
        }
        for name in history.reversed() {
            if let frame = outlets[name]?.frame, frame.canGoBack { frame.goBack(); return }
        }
        Frame.topmost()?.goBack()
    }

    /// `RouterExtensions.router`: the router itself.
    public var router: Router { self }

    /// `router.url`: the primary outlet's URL.
    public var url: String { "/" + (current(Router.primary) ?? []).joined(separator: "/") }

    public func canGoBack() -> Bool { history.contains { outlets[$0]?.frame?.canGoBack ?? false } }

    /// The routes of a named outlet, wherever in the configuration they are.
    private static func routes(in routes: [RouteConfig], outlet: String) -> [RouteConfig] {
        routes.filter { $0.outlet == outlet } + routes.flatMap { Router.routes(in: $0.children, outlet: outlet) }
    }

    /// The URL an outlet shows: its top page's.
    private func current(_ name: String) -> [String]? { outlets[name]?.frame?.topPage?.route?.url }

    @discardableResult
    private func show(_ name: String, _ url: [String], animated: Bool, into frame: Frame) -> Bool {
        let routes = outlets[name]?.routes ?? config
        let start = url.first == "/" ? [] : url
        guard let (chain, params, resolved) = match(routes, start, outlet: name == Router.primary ? Router.primary : nil),
              let make = chain.last?.make else { return false }
        if frame.topPage?.route?.url == resolved { return true }
        let route = ActivatedRoute(params: params, outlet: name, url: resolved)
        history.removeAll { $0 == name }
        history.append(name)
        frame.navigate(animated: animated && frame.topPage != nil) {
            ActivatedRoute.current = route
            let page = Page()
            page.route = route
            Page.building.append(page)
            defer { Page.building.removeLast() }
            return make()
        }
        return true
    }

    /// The routes a URL resolves through, its parameters and the URL once redirects applied.
    private func match(_ routes: [RouteConfig], _ url: [String], outlet: String?) -> ([RouteConfig], [String: String], [String])? {
        for route in routes where outlet == nil || route.outlet == outlet {
            if let redirect = route.redirectTo {
                let applies = route.full ? url == route.segments : Array(url.prefix(route.segments.count)) == route.segments
                guard applies else { continue }
                let target = redirect.split(separator: "/").map(String.init)
                if redirect.hasPrefix("/") { return match(config, target + url.dropFirst(route.segments.count), outlet: Router.primary) }
                return match(routes, target + url.dropFirst(route.segments.count), outlet: outlet)
            }
            guard url.count >= route.segments.count else { continue }
            var params: [String: String] = [:]
            var matched = true
            for (pattern, part) in zip(route.segments, url) {
                if pattern.hasPrefix(":") { params[String(pattern.dropFirst())] = part.removingPercentEncoding ?? part }
                else if pattern != part { matched = false; break }
            }
            guard matched else { continue }
            let rest = Array(url.dropFirst(route.segments.count))
            if route.make != nil && rest.isEmpty { return ([route], params, route.segments.isEmpty ? [] : url) }
            let children = route.children.filter { $0.outlet == Router.primary }
            if !children.isEmpty, let (chain, inner, resolved) = match(children, rest, outlet: Router.primary) {
                return ([route] + chain, params.merging(inner) { $1 }, Array(url.prefix(route.segments.count)) + resolved)
            }
        }
        return nil
    }

    func resolveFlat(_ path: String) -> View? {
        guard let (route, params) = resolveFlatRoute(path) else { return nil }
        ActivatedRoute.current = ActivatedRoute(params: params)
        return route.make()
    }

    private func resolveFlatRoute(_ path: String) -> (Route, [String: String])? {
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

/// A key of an options object script passes, nil when absent.
private func field(_ object: Any?, _ key: String) -> Any? { object == nil ? nil : (try? jsGet(object, key)) ?? nil }
