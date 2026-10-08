import Foundation

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

/// `NavigationEnd`, the router event each completed navigation emits.
public final class NavigationEnd {
    public let id: Double
    public let url: String
    public let urlAfterRedirects: String
    init(id: Double, url: String, urlAfterRedirects: String) {
        self.id = id
        self.url = url
        self.urlAfterRedirects = urlAfterRedirects
    }
}

private let routeKey = JSSymbol("NativeScriptKit:route")

extension Page {
    /// The pages the router is building, innermost last: a routed component renders into its page, and `inject(Page)` reads it.
    static var building: [Page] = []

    /// The page a routed component's template fills.
    public static func routed() -> Page { building.last ?? (try! Page()) }

    /// `inject(Page)`: the routed page being built, else the page shown.
    public static func injected() -> Page {
        if let page = building.last { return page }
        if let page = (try? Frame.topmost()?.currentPage) ?? nil { return page }
        return try! Page()
    }

    /// The route the router created the page for.
    var route: ActivatedRoute? {
        get { self[jsKey: routeKey.key] as? ActivatedRoute }
        set { self[jsKey: routeKey.key] = newValue }
    }
}

/// Angular's router with @nativescript/angular's `page-router-outlet`s and `RouterExtensions`, over core's
/// `Frame`: each outlet is a frame, a URL within an outlet resolves through the configuration to a component,
/// and navigating to a URL the outlet does not show creates a `Page`, renders the component into it and
/// navigates the frame to it with the extras' `animated`, `clearHistory` and `transition`, as `PageRouterOutlet`
/// does. Going back is the frame's: when a page is navigated from going back, its component is destroyed and
/// the outlet shows the URL of the page under it, as `PageRouterOutlet` and `NSLocationStrategy` handle it.
public final class Router {
    public static let primary = "primary"
    public static let shared = Router()
    /// The flat table of apps configured without a route tree.
    public var routes: [Route] = []
    public var initial = "/"
    public var config: [RouteConfig] = []
    /// `router.events`: a `NavigationEnd` after each navigation, back navigations included.
    public let events = RxSubject<NavigationEnd>()
    private var navigationId = 0.0

    private final class Entry {
        let owner: Owner
        let route: ActivatedRoute
        init(owner: Owner, route: ActivatedRoute) { self.owner = owner; self.route = route }
    }

    private final class Outlet {
        weak var frame: Frame?
        /// The configuration the outlet's URLs resolve against.
        let routes: [RouteConfig]
        /// The pages navigated to in this outlet and not navigated back from, the shown one last.
        var entries: [Entry] = []
        init(frame: Frame, routes: [RouteConfig]) { self.frame = frame; self.routes = routes }
    }
    private var outlets: [String: Outlet] = [:]
    /// Navigations to outlets not created yet, applied when they are.
    private var pending: [String: [String]] = [:]
    /// The outlets in the order they were last navigated, for `back()`.
    private var history: [String] = []

    /// A `page-router-outlet`: a frame showing its outlet's URL.
    public func outlet(_ name: String = Router.primary) -> View {
        let frame = try! Frame()
        if config.isEmpty {
            if let (route, params) = resolveFlatRoute(initial) { push(route.make, ActivatedRoute(params: params), into: frame, extras: nil) }
            return frame
        }
        outlets[name] = Outlet(frame: frame, routes: name == Router.primary ? config : Router.routes(in: config, outlet: name))
        if name == Router.primary {
            if show(name, [], extras: nil) == true { ended(url: "/") }
        } else if let url = pending.removeValue(forKey: name) {
            show(name, url, extras: nil)
        }
        return frame
    }

    @discardableResult
    public func navigate(_ commands: [Any], _ extras: Any? = nil) -> JSPromise<Bool> {
        if config.isEmpty {
            let path = commands.map { jsToString($0) }.joined(separator: "/")
            guard let (route, params) = resolveFlatRoute(path), let frame = Frame.topmost() as? Frame else { return JSPromise.resolve(false) }
            push(route.make, ActivatedRoute(params: params), into: frame, extras: extras)
            ended(url: "/" + path.split(separator: "/").joined(separator: "/"))
            return JSPromise.resolve(true)
        }
        let relativeTo = field(extras, "relativeTo") as? ActivatedRoute
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
        var navigated = false
        for (name, url) in targets {
            // The primary URL `/home` with outlets names the route holding them, already shown.
            if name == Router.primary, !targets.dropFirst().isEmpty, current(Router.primary)?.first == url.first { continue }
            guard outlets[name]?.frame != nil else {
                pending[name] = url
                continue
            }
            let shown = show(name, url, extras: extras)
            ok = shown != nil && ok
            navigated = navigated || shown == true
        }
        if navigated { ended(url: absolute || relativeTo == nil ? "/" + segments.joined(separator: "/") : self.url) }
        return JSPromise.resolve(ok)
    }

    /// `navigate(['/recipe', id])` as translated code passes it.
    @discardableResult
    public func navigate(_ commands: JSArray<Any?>, _ extras: Any? = nil) -> JSPromise<Bool> {
        navigate(commands.storage.map { $0 ?? "" }, extras)
    }

    /// `navigateByUrl(url, extras)`.
    @discardableResult
    public func navigateByUrl(_ url: String, _ extras: Any? = nil) -> JSPromise<Bool> {
        navigate([url.hasPrefix("/") ? url : "/" + url], extras)
    }

    /// `back()`: the outlet of the given route, else the one navigated last that can go back, else the topmost frame.
    public func back(_ options: Any? = nil) {
        jsReport {
            if let route = field(options, "relativeTo") as? ActivatedRoute, let frame = outlets[route.outlet]?.frame, try frame.canGoBack() {
                try frame.goBack()
                return
            }
            for name in history.reversed() {
                if let frame = outlets[name]?.frame, try frame.canGoBack() { try frame.goBack(); return }
            }
            _ = try Frame.goBack()
        }
    }

    /// `RouterExtensions.router`: the router itself.
    public var router: Router { self }

    /// `router.url`: the primary outlet's URL.
    public var url: String { "/" + (current(Router.primary) ?? []).joined(separator: "/") }

    public func canGoBack() -> Bool {
        history.contains { name in (try? outlets[name]?.frame?.canGoBack()) ?? false }
    }

    /// The routes of a named outlet, wherever in the configuration they are.
    private static func routes(in routes: [RouteConfig], outlet: String) -> [RouteConfig] {
        routes.filter { $0.outlet == outlet } + routes.flatMap { Router.routes(in: $0.children, outlet: outlet) }
    }

    /// The URL an outlet shows: its last page's.
    private func current(_ name: String) -> [String]? { outlets[name]?.entries.last?.route.url }

    private func ended(url: String) {
        navigationId += 1
        events.next(NavigationEnd(id: navigationId, url: url, urlAfterRedirects: self.url))
    }

    /// Whether the outlet navigated: nil when the URL matches no route, false when the outlet shows it already.
    @discardableResult
    private func show(_ name: String, _ url: [String], extras: Any?) -> Bool? {
        guard let outlet = outlets[name], let frame = outlet.frame,
              let (chain, params, resolved) = match(outlet.routes, url, outlet: name == Router.primary ? Router.primary : nil),
              let make = chain.last?.make else { return nil }
        if outlet.entries.last?.route.url == resolved { return false }
        history.removeAll { $0 == name }
        history.append(name)
        push(make, ActivatedRoute(params: params, outlet: name, url: resolved), into: frame, extras: extras, outlet: outlet)
        return true
    }

    /// `PageRouterOutlet.activateOnGoForward` and `loadComponentInPage`: a new page, the component rendered into
    /// it in a scope of its own, and the frame navigated to it.
    private func push(_ make: () -> View, _ route: ActivatedRoute, into frame: Frame, extras: Any?, outlet: Outlet? = nil) {
        jsReport {
            let page = try Page()
            page.route = route
            let owner = Owner(parent: nil)
            ActivatedRoute.current = route
            Page.building.append(page)
            let view = owner.run(make)
            Page.building.removeLast()
            if view !== page { page.content = view }
            let entry = Entry(owner: owner, route: route)
            outlet?.entries.append(entry)
            try page.on(Page.navigatedFromEvent, { [weak self, weak outlet] (data: EventData?) in
                guard jsTruthy(data?[jsKey: "isBackNavigation"]) else { return }
                owner.dispose()
                guard let self, let outlet, let at = outlet.entries.firstIndex(where: { $0 === entry }) else { return }
                outlet.entries.remove(at: at)
                self.ended(url: self.url)
            })
            let clearHistory = jsTruthy(field(extras, "clearHistory"))
            if clearHistory, let outlet {
                try page.once(Page.navigatedToEvent, { [weak outlet] (_: EventData?) in
                    guard let outlet else { return }
                    let cleared = outlet.entries.filter { $0 !== entry }
                    outlet.entries.removeAll { $0 !== entry }
                    for old in cleared { old.owner.dispose() }
                })
            }
            var navigation: [(String, Any?)] = [
                ("create", { (_: [Any?]) throws -> Any? in page } as JSFunction),
                ("clearHistory", clearHistory),
                ("animated", field(extras, "animated").map { jsTruthy($0) } ?? true),
            ]
            if let transition = field(extras, "transition") { navigation.append(("transition", transition)) }
            try frame.navigate(JSObject(navigation))
        }
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

/// A loop's items from an untyped value: an iterable's elements, none for undefined or null.
private func jsItemsOf(_ value: Any?) throws -> [Any?] {
    if jsIsNullish(value) { return [] }
    let iterator = try jsIteratorOf(value)
    var items: [Any?] = []
    while try iterator.jsAdvance() { items.append(iterator.jsCurrent) }
    return items
}
