import Foundation

/// The route a component was created for (Angular `ActivatedRoute`): set by the
/// router before it constructs the routed component.
public final class ActivatedRoute {
    nonisolated deinit {}
    public typealias Snapshot = ActivatedRouteSnapshot
    public let snapshot: ActivatedRouteSnapshot
    /// `route.params`: the route's parameters, replayed to each subscriber.
    public let params: RxBehaviorSubject<JSRecord<String>>
    public let queryParams: RxBehaviorSubject<JSRecord<String>>
    public let data: RxBehaviorSubject<JSRecord<Any?>>
    public let paramMap: RxBehaviorSubject<ParamMap>
    public let queryParamMap: RxBehaviorSubject<ParamMap>
    public let fragment: RxBehaviorSubject<String?>
    public let title: RxBehaviorSubject<String?>
    /// The outlet the route renders in, and the URL segments within that outlet up to and including the route's own.
    public let outlet: String
    public var routeConfig: JSObject? = nil
    let url: [String]
    public static var current = ActivatedRoute(params: [:])

    public init(params: [String: String], outlet: String = Router.primary, url: [String] = [], queryParams: [String: String] = [:], data: [String: Any?] = [:]) {
        let record = JSRecord(params)
        let queryRecord = JSRecord(queryParams)
        let dataRecord = JSRecord(data)
        let segs = JSArray(url.map { UrlSegment($0) })
        snapshot = ActivatedRouteSnapshot(params: record, queryParams: queryRecord, data: dataRecord, url: segs, fragment: nil, outlet: outlet)
        self.params = RxBehaviorSubject(record)
        self.queryParams = RxBehaviorSubject(queryRecord)
        self.data = RxBehaviorSubject(dataRecord)
        self.paramMap = RxBehaviorSubject(ParamMap(record))
        self.queryParamMap = RxBehaviorSubject(ParamMap(queryRecord))
        self.fragment = RxBehaviorSubject(nil)
        self.title = RxBehaviorSubject(nil)
        self.outlet = outlet
        self.url = url
    }

    public var root: ActivatedRoute { self }
    public var parent: ActivatedRoute? { nil }
    public var firstChild: ActivatedRoute? { nil }
    public var children: JSArray<ActivatedRoute> { JSArray() }
    public var pathFromRoot: JSArray<ActivatedRoute> { JSArray([self]) }
}

public struct Route {
    let segments: [String]
    let make: () throws -> View
    public init(_ path: String, _ make: @escaping () throws -> View) {
        segments = path.split(separator: "/").map(String.init)
        self.make = make
    }
}

/// A route of the app's configuration (Angular's `Route`), lazy children and components resolved at compile time.
public final class RouteConfig {
    nonisolated deinit {}
    let segments: [String]
    let outlet: String
    let redirectTo: String?
    let full: Bool
    let children: [RouteConfig]
    let make: (() throws -> View)?
    /// `NSEmptyOutletComponent`: its children show in a frame of their own, on a page of the outlet's frame.
    let emptyOutlet: Bool
    /// The id the route's guards are registered under (`Router.addGuard`).
    let guards: Int?

    public init(_ path: String, outlet: String = Router.primary, redirectTo: String? = nil, full: Bool = false, emptyOutlet: Bool = false, guards: Int? = nil, children: [RouteConfig] = [], _ make: (() throws -> View)? = nil) {
        segments = path.split(separator: "/").map(String.init)
        self.outlet = outlet
        self.redirectTo = redirectTo
        self.full = full
        self.emptyOutlet = emptyOutlet
        self.guards = guards
        self.children = children
        self.make = make
    }
}

/// Angular's `RouterStateSnapshot`, as guards receive it: a URL and the route it shows.
public final class RouterStateSnapshot: CustomStringConvertible {
    nonisolated deinit {}
    public let url: String
    public let root: ActivatedRouteSnapshot
    public init(_ url: String, _ root: ActivatedRouteSnapshot = ActivatedRouteSnapshot()) {
        self.url = url
        self.root = root
    }
    public func toString() -> String { url }
    public var description: String { url }
}

/// A route guard compiled from the app, called with Angular's arguments for its kind (two, or four for canDeactivate).
public typealias RouteGuard = (Any?, Any?, Any?, Any?) throws -> Any?

private let routeKey = JSSymbol("NativeScriptKit:route")

extension Page {
    /// The pages the router is building, innermost last: a routed component renders into its page, and `inject(Page)` reads it.
    static var building: [Page] = []

    /// The page a routed component's template fills.
    public static func routed() throws -> Page {
        if let page = building.last { return page }
        return try Page()
    }

    /// `inject(Page)`: the routed page being built, else the page shown.
    public static func injected() throws -> Page {
        if let page = building.last { return page }
        if let page = (try? Frame.topmost()?.currentPage) ?? nil { return page }
        return try Page()
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
    nonisolated deinit {}
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
        nonisolated deinit {}
        let owner: Owner
        let route: ActivatedRoute
        /// The routes the page's URL resolved through, and the segments each consumed.
        let match: Match?
        /// The routed component, kept for canDeactivate guards.
        var component: AnyObject?
        init(owner: Owner, route: ActivatedRoute, match: Match?) { self.owner = owner; self.route = route; self.match = match }
    }

    /// A URL resolved through the configuration: the routes, root first, the segments each consumed, the parameters and
    /// the URL once redirects applied.
    private struct Match {
        var chain: [RouteConfig]
        var consumed: [[String]]
        var params: [String: String]
        var url: [String]
    }

    /// What a route's guards decided.
    private enum Verdict { case pass, cancel, redirect(UrlTree) }

    /// How an outlet's navigation ended.
    private enum Shown { case unmatched, already, navigated, cancelled }

    private var guardTable: [Int: [String: [RouteGuard]]] = [:]
    /// The latest navigation: one whose guards settle after a newer one started is cancelled.
    private var navigations = 0
    /// The components of the pages being built, innermost last.
    private var rendering: [AnyObject?] = []

    private final class Outlet {
        nonisolated deinit {}
        weak var frame: Frame?
        /// The frame of the `NSEmptyOutletComponent` page the outlet shows, where its routes' pages go.
        weak var inner: Frame?
        /// The frame the outlet's pages are in.
        var shown: Frame? { inner ?? frame }
        /// The configuration the outlet's URLs resolve against.
        let routes: [RouteConfig]
        /// The pages navigated to in this outlet and not navigated back from, the shown one last.
        var entries: [Entry] = []
        /// The injector of the view holding the outlet, which its routed components inject from.
        let injector: Injector?
        init(frame: Frame, routes: [RouteConfig], injector: Injector?) { self.frame = frame; self.routes = routes; self.injector = injector }
    }
    private var outlets: [String: Outlet] = [:]
    /// Navigations to outlets not created yet, applied when they are.
    private var pending: [String: [String]] = [:]
    /// The outlets in the order they were last navigated, for `back()`.
    private var history: [String] = []
    /// A flat route table's outlet: the injector of the view holding it.
    private var flatInjector: Injector?

    /// A route guard of the route registered under `route` (`RouteConfig.guards`).
    public func addGuard(_ route: Double, _ kind: String, _ run: @escaping RouteGuard) {
        guardTable[Int(route), default: [:]][kind, default: []].append(run)
    }

    /// A routed component whose route has canDeactivate guards, kept as the page's component.
    public func activating<C: AnyObject>(_ component: C) -> C {
        if !rendering.isEmpty { rendering[rendering.count - 1] = component }
        return component
    }

    /// A `page-router-outlet`: a frame showing its outlet's URL. A route that fails to render is reported and the frame stays empty.
    public func outlet(_ name: String = Router.primary) throws -> View {
        let frame = try Frame()
        if config.isEmpty {
            flatInjector = Injector.current
            if let (route, params) = resolveFlatRoute(initial) { jsReport { try push(route.make, ActivatedRoute(params: params), into: frame, extras: nil, injector: flatInjector) } }
            return frame
        }
        outlets[name] = Outlet(frame: frame, routes: name == Router.primary ? config : Router.routes(in: config, outlet: name), injector: Injector.current)
        let url = name == Router.primary ? [] : pending.removeValue(forKey: name)
        if let url {
            show(name, url, extras: nil, token: begin(), { [weak self] shown in
                if case .redirect(let tree) = shown { self?.navigateByUrl(tree); return }
                if name == Router.primary, case .done(.navigated) = shown { self?.ended(url: "/") }
            }, jsReportUncaught)
        }
        return frame
    }

    /// A navigation whose component throws shows nothing new, and its promise rejects with the error, as Angular's router's does.
    @discardableResult
    public func navigate(_ commands: [Any], _ extras: Any? = nil) -> JSPromise<Bool> {
        let (promise, resolvers) = JSPromise<Bool>.pending()
        do { try navigation(commands, extras, { resolvers.resolve($0) }, { resolvers.reject($0) }) } catch { resolvers.reject(jsCaught(error)) }
        return promise
    }

    /// A navigation's token: navigations a component starts while its page is built belong to the one building it.
    private func begin() -> Int {
        if Page.building.isEmpty { navigations += 1 }
        return navigations
    }

    private func navigation(_ commands: [Any], _ extras: Any?, _ done: @escaping (Bool) -> Void, _ fail: @escaping (Any?) -> Void) throws {
        if config.isEmpty {
            let path = commands.map { jsToString($0) }.joined(separator: "/")
            guard let (route, params) = resolveFlatRoute(path), let frame = (try? Frame.topmost()) as? Frame else { return done(false) }
            try push(route.make, ActivatedRoute(params: params), into: frame, extras: extras, injector: flatInjector)
            ended(url: "/" + path.split(separator: "/").joined(separator: "/"))
            return done(true)
        }
        let relativeTo = (field(extras, "relativeTo") as? ActivatedRoute) ?? (field(field(extras, "relativeTo"), "_kit") as? ActivatedRoute)
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
        let token = begin()
        let several = targets.count > 1
        var ok = true
        var navigated = false
        var rest = targets[...]
        // Outlet by outlet: one whose guards return a promise continues when it settles.
        func next() {
            guard let (name, url) = rest.popFirst() else {
                if navigated { ended(url: absolute || relativeTo == nil ? "/" + segments.joined(separator: "/") : self.url) }
                return done(ok)
            }
            // The primary URL `/home` with outlets names the route holding them, already shown.
            if name == Router.primary, several, current(Router.primary)?.first == url.first { return next() }
            guard outlets[name]?.frame != nil else {
                pending[name] = url
                return next()
            }
            show(name, url, extras: extras, token: token, { [weak self] outcome in
                switch outcome {
                case .redirect(let tree):
                    // The first navigation's promise takes the redirect's result, as Angular's does.
                    guard let self else { return done(false) }
                    let str = tree.toString()
                    do { try self.navigation([str.hasPrefix("/") ? str : "/" + str], extras, done, fail) } catch { fail(jsCaught(error)) }
                case .done(.cancelled):
                    done(false)
                case .done(let shown):
                    ok = shown != .unmatched && ok
                    navigated = navigated || shown == .navigated
                    next()
                }
            }, fail)
        }
        next()
    }

    /// `navigate(['/recipe', id])` as translated code passes it.
    @discardableResult
    public func navigate(_ commands: JSArray<Any?>, _ extras: Any? = nil) -> JSPromise<Bool> {
        navigate(commands.storage.map { $0 ?? "" }, extras)
    }

    /// `navigateByUrl(url, extras)`.
    @discardableResult
    public func navigateByUrl(_ url: Any?, _ extras: Any? = nil) -> JSPromise<Bool> {
        let str = (jsFlat(url) as? UrlTree)?.toString() ?? jsToString(url)
        return navigate([str.hasPrefix("/") ? str : "/" + str], extras)
    }

    /// `back()`: the outlet of the given route, else the one navigated last that can go back, else the topmost frame.
    public func back(_ options: Any? = nil) {
        jsReport {
            if let route = (field(options, "relativeTo") as? ActivatedRoute) ?? (field(field(options, "relativeTo"), "_kit") as? ActivatedRoute), let frame = outlets[route.outlet]?.shown, try frame.canGoBack() {
                try frame.goBack()
                return
            }
            for name in history.reversed() {
                if let frame = outlets[name]?.shown, try frame.canGoBack() { try frame.goBack(); return }
            }
            _ = try Frame.goBack()
        }
    }

    public func backToPreviousPage() {
        back()
    }

    /// `RouterExtensions.router`: the router itself.
    public var router: Router { self }

    /// `router.url`: the primary outlet's URL.
    public var url: String { "/" + (current(Router.primary) ?? []).joined(separator: "/") }

    public var routerState: JSObject {
        JSObject([
            ("snapshot", JSObject([("url", url), ("root", ActivatedRoute.current.snapshot)])),
            ("root", ActivatedRoute.current),
        ])
    }

    public func createUrlTree(_ commands: Any?, _ extras: Any? = nil) -> UrlTree {
        let items = (jsFlat(commands) as? JSArrayProtocol)?.jsAnyElements ?? []
        let joined = items.map { jsToString($0) }.joined(separator: "/").trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        let path = "/" + joined
        let q = field(extras, "queryParams")
        let f = field(extras, "fragment") as? String
        return UrlTree(path, q, f)
    }

    public func serializeUrl(_ tree: Any?) -> String {
        (jsFlat(tree) as? UrlTree)?.toString() ?? jsToString(tree)
    }

    public func parseUrl(_ url: String) -> UrlTree {
        DefaultUrlSerializer().parse(url)
    }

    public func isActive(_ url: Any?, _ exact: Any? = false) -> Bool {
        let target = (jsFlat(url) as? UrlTree)?.toString() ?? jsToString(url)
        let isExact: Bool = {
            if let b = jsFlat(exact) as? Bool { return b }
            return (field(exact, "paths") as? String) == "exact"
        }()
        return isExact ? self.url == target : self.url.hasPrefix(target)
    }

    public func canGoBack(_ options: Any? = nil) -> Bool {
        history.contains { name in (try? outlets[name]?.shown?.canGoBack()) ?? false }
    }

    public func canGoBackToPreviousPage() -> Bool {
        canGoBack()
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

    private enum Outcome { case done(Shown), redirect(UrlTree) }

    /// An outlet's navigation to a URL, as Angular's router runs it: canMatch while the URL is matched (a route whose
    /// guards return false is passed over), canDeactivate of the routes the outlet leaves, then canActivateChild and
    /// canActivate of each route it activates, root first. Guards that all return synchronously keep the navigation
    /// synchronous. A navigation is never guarded going back: the frame has gone back already, as with
    /// @nativescript/angular, which lets the router catch up after the frame.
    private func show(_ name: String, _ url: [String], extras: Any?, token: Int, _ done: @escaping (Outcome) -> Void, _ fail: @escaping (Any?) -> Void) {
        guard let outlet = outlets[name] else { return done(.done(.unmatched)) }
        let candidates = matches(outlet.routes, url, outlet: name == Router.primary ? Router.primary : nil).filter { $0.chain.last?.make != nil }
        let current = outlet.entries.last
        let currentUrl = "/" + (current?.route.url ?? []).joined(separator: "/")
        var matched: [ObjectIdentifier: Bool] = [:]
        var index = 0
        func candidate() {
            guard token == navigations else { return done(.done(.cancelled)) }
            guard index < candidates.count else { return done(.done(.unmatched)) }
            let found = candidates[index]
            index += 1
            if found.chain.contains(where: { matched[ObjectIdentifier($0)] == false }) { return candidate() }
            let segments = JSArray(url.map { UrlSegment($0) })
            let unchecked = found.chain.filter { matched[ObjectIdentifier($0)] == nil && !guards($0, "canMatch").isEmpty }
            var routes = unchecked[...]
            func canMatch() {
                guard let route = routes.popFirst() else { return activate(found) }
                check([guards(route, "canMatch").map { g in { try g(JSObject([("path", route.segments.joined(separator: "/"))]), segments, nil, nil) } }], outlet: outlet, { verdict in
                    switch verdict {
                    case .pass: matched[ObjectIdentifier(route)] = true; canMatch()
                    case .cancel: matched[ObjectIdentifier(route)] = false; candidate()
                    case .redirect(let tree): done(.redirect(tree))
                    }
                }, fail)
            }
            canMatch()
        }
        func activate(_ found: Match) {
            guard token == navigations else { return done(.done(.cancelled)) }
            if current?.route.url == found.url { return done(.done(.already)) }
            let route = ActivatedRoute(params: found.params, outlet: name, url: found.url)
            let nextUrl = "/" + found.url.joined(separator: "/")
            // Routes the outlet shows already, with the same segments, are reused: their guards don't run again.
            var reused = 0
            if let old = current?.match {
                while reused < min(old.chain.count, found.chain.count), old.chain[reused] === found.chain[reused], old.consumed[reused] == found.consumed[reused] { reused += 1 }
            }
            var groups: [[() throws -> Any?]] = []
            if let current, let old = current.match {
                let currentState = RouterStateSnapshot(currentUrl, current.route.snapshot)
                let nextState = RouterStateSnapshot(nextUrl, route.snapshot)
                for (i, left) in old.chain.enumerated().dropFirst(reused).reversed() {
                    let component = i == old.chain.count - 1 ? current.component : nil
                    let calls = guards(left, "canDeactivate").map { g in { try g(component, current.route.snapshot, currentState, nextState) } }
                    if !calls.isEmpty { groups.append(calls) }
                }
            }
            let state = RouterStateSnapshot(nextUrl, route.snapshot)
            for i in reused..<found.chain.count {
                let children = found.chain[..<i].reversed().flatMap { guards($0, "canActivateChild") }.map { g in { try g(route.snapshot, state, nil, nil) } }
                if !children.isEmpty { groups.append(children) }
                let calls = guards(found.chain[i], "canActivate").map { g in { try g(route.snapshot, state, nil, nil) } }
                if !calls.isEmpty { groups.append(calls) }
            }
            check(groups, outlet: outlet, { [weak self] verdict in
                guard let self, token == self.navigations else { return done(.done(.cancelled)) }
                switch verdict {
                case .cancel: return done(.done(.cancelled))
                case .redirect(let tree): return done(.redirect(tree))
                case .pass: break
                }
                guard var frame = outlet.frame, let make = found.chain.last?.make else { return done(.done(.unmatched)) }
                if found.chain.contains(where: { $0.emptyOutlet }) {
                    if outlet.inner == nil { outlet.inner = self.emptyOutlet(in: frame) }
                    if let inner = outlet.inner { frame = inner }
                }
                self.history.removeAll { $0 == name }
                self.history.append(name)
                do { try self.push(make, route, into: frame, extras: extras, outlet: outlet, injector: outlet.injector, match: found) } catch { return fail(jsCaught(error)) }
                done(.done(.navigated))
            }, fail)
        }
        candidate()
    }

    private func guards(_ route: RouteConfig, _ kind: String) -> [RouteGuard] {
        route.guards.flatMap { guardTable[$0]?[kind] } ?? []
    }

    /// Guards group by group, in the outlet's injection context. Each group's guards are all called first, then the first
    /// result that isn't true decides (Angular's prioritizedGuardValue): false cancels, a UrlTree redirects, and anything
    /// else passes. A promise defers what follows until it settles.
    private func check(_ groups: [[() throws -> Any?]], outlet: Outlet, _ next: @escaping (Verdict) -> Void, _ fail: @escaping (Any?) -> Void) {
        var rest = groups[...]
        func group() {
            guard let calls = rest.popFirst() else { return next(.pass) }
            let results: [Any?]
            do { results = try Injector.runInContext(outlet.injector) { try calls.map { try $0() } } } catch { return fail(jsCaught(error)) }
            func result(_ i: Int) {
                guard i < results.count else { return group() }
                let decide = { (value: Any?) in
                    if let tree = jsFlat(value) as? UrlTree { next(.redirect(tree)) } else if (jsFlat(value) as? Bool) == false { next(.cancel) } else { result(i + 1) }
                }
                if let promise = jsFlat(results[i]) as? JSThenable { promise.jsSubscribe(decide, fail) } else { decide(results[i]) }
            }
            result(0)
        }
        group()
    }

    /// `PageRouterOutlet.activateOnGoForward` and `loadComponentInPage`: a new page, the component rendered into
    /// it in a scope of its own, and the frame navigated to it. A component that throws leaves the outlet as it was.
    private func push(_ make: () throws -> View, _ route: ActivatedRoute, into frame: Frame, extras: Any?, outlet: Outlet? = nil, injector: Injector?, match: Match? = nil) throws {
        let page = try Page()
        page.route = route
        let owner = Owner(parent: nil)
        // Shown before the component renders, as Angular's URL is current by activation: a navigation the
        // component makes while rendering (a tab view filling its outlets) finds this route already there.
        let entry = Entry(owner: owner, route: route, match: match)
        outlet?.entries.append(entry)
        let previousRoute = ActivatedRoute.current
        ActivatedRoute.current = route
        Page.building.append(page)
        rendering.append(nil)
        let pending = Reactivity.pending()
        let view: View
        do {
            defer {
                Page.building.removeLast()
                entry.component = rendering.removeLast()
            }
            view = try owner.run { try Injector.runInContext(injector, make) }
        } catch {
            owner.dispose()
            outlet?.entries.removeAll { $0 === entry }
            ActivatedRoute.current = previousRoute
            throw error
        }
        if view !== page { page.content = view }
        if Reactivity.schedule == .task { Reactivity.detectChanges(after: pending) }
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

    /// `NSEmptyOutletComponent` in `frame`: a page without an action bar holding a `page-router-outlet` that takes the
    /// outer outlet's action bar visibility.
    private func emptyOutlet(in frame: Frame) -> Frame? {
        jsReported {
            let page = try Page()
            page.actionBarHidden = true
            let inner = try Frame()
            let visibility = frame.actionBarVisibility
            if ["auto", "always", "never"].contains(visibility) { inner.actionBarVisibility = visibility }
            page.content = inner
            try frame.navigate(JSObject([("create", { (_: [Any?]) throws -> Any? in page } as JSFunction), ("clearHistory", false), ("animated", true)]))
            return inner
        }
    }

    /// Every way a URL resolves through the routes, in the order Angular's router tries them. A redirect that applies
    /// ends the search, as in Angular.
    private func matches(_ routes: [RouteConfig], _ url: [String], outlet: String?) -> [Match] {
        var found: [Match] = []
        for route in routes where outlet == nil || route.outlet == outlet {
            if let redirect = route.redirectTo {
                let applies = route.full ? url == route.segments : Array(url.prefix(route.segments.count)) == route.segments
                guard applies else { continue }
                let target = redirect.split(separator: "/").map(String.init) + url.dropFirst(route.segments.count)
                return found + (redirect.hasPrefix("/") ? matches(config, target, outlet: Router.primary) : matches(routes, target, outlet: outlet))
            }
            guard url.count >= route.segments.count else { continue }
            var params: [String: String] = [:]
            var matched = true
            for (pattern, part) in zip(route.segments, url) {
                if pattern.hasPrefix(":") { params[String(pattern.dropFirst())] = part.removingPercentEncoding ?? part }
                else if pattern != part { matched = false; break }
            }
            guard matched else { continue }
            let own = Array(url.prefix(route.segments.count))
            let rest = Array(url.dropFirst(route.segments.count))
            if route.make != nil && rest.isEmpty { found.append(Match(chain: [route], consumed: [own], params: params, url: route.segments.isEmpty ? [] : url)) }
            let children = route.children.filter { $0.outlet == Router.primary }
            for inner in children.isEmpty ? [] : matches(children, rest, outlet: Router.primary) {
                found.append(Match(chain: [route] + inner.chain, consumed: [own] + inner.consumed, params: params.merging(inner.params) { $1 }, url: own + inner.url))
            }
        }
        return found
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

public typealias KitRouter = Router
public typealias KitActivatedRoute = ActivatedRoute
