package org.nativescript.kit

import java.net.URLDecoder

// Angular's router with @nativescript/angular's page-router-outlets and RouterExtensions, over the
// Frame and Page compiled from core (kit-apple's Router.swift).

/** The route a component was created for (Angular `ActivatedRoute`): set by the router before it constructs the routed component. */
class ActivatedRoute(
    params: Map<String, String>,
    val outlet: String = Router.PRIMARY,
    internal val url: List<String> = emptyList(),
    queryParams: Map<String, String> = emptyMap(),
    data: Map<String, Any?> = emptyMap(),
) {
    val snapshot = ActivatedRouteSnapshot(
        params = JSRecord(params.toList()),
        queryParams = JSRecord(queryParams.toList()),
        data = JSRecord(data.toList()),
        url = JSArray(url.map { UrlSegment(it) }.toMutableList()),
        fragment = null,
        outlet = outlet,
    )

    /** `route.params`: the route's parameters, replayed to each subscriber. */
    val params = RxBehaviorSubject(snapshot.params)
    val queryParams = RxBehaviorSubject(snapshot.queryParams)
    val data = RxBehaviorSubject(snapshot.data)
    val paramMap = RxBehaviorSubject(ParamMap(snapshot.params))
    val queryParamMap = RxBehaviorSubject(ParamMap(snapshot.queryParams))
    val fragment = RxBehaviorSubject<String?>(null)
    val title = RxBehaviorSubject<String?>(null)
    var routeConfig: JSObject? = null

    val root: ActivatedRoute get() = this
    val parent: ActivatedRoute? get() = null
    val firstChild: ActivatedRoute? get() = null
    val children: JSArray<ActivatedRoute> get() = JSArray()
    val pathFromRoot: JSArray<ActivatedRoute> get() = JSArray(mutableListOf(this))

    companion object {
        var current = ActivatedRoute(emptyMap())
    }
}

/** A route of a flat table (an app configured without a route tree). */
class Route(path: String, internal val make: () -> View) {
    internal val segments = path.split("/").filter { it.isNotEmpty() }
}

/** A route of the app's configuration (Angular's `Route`), lazy children and components resolved at compile time. */
class RouteConfig(path: String, internal val outlet: String = Router.PRIMARY, internal val redirectTo: String? = null, internal val full: Boolean = false, internal val guards: Int? = null, internal val children: List<RouteConfig> = emptyList(), internal val make: (() -> View)? = null) {
    internal val segments = path.split("/").filter { it.isNotEmpty() }
}

/** Angular's `RouterStateSnapshot`, as guards receive it: a URL and the route it shows. */
class RouterStateSnapshot(val url: String, val root: ActivatedRouteSnapshot = ActivatedRouteSnapshot()) {
    override fun toString(): String = url
}

/** A route guard compiled from the app, called with Angular's arguments for its kind (two, or four for canDeactivate). */
typealias RouteGuard = (Any?, Any?, Any?, Any?) -> Any?

private val routeKey = jsSymbol("NativeScriptKit:route")

/** The pages the router is building, innermost last: a routed component renders into its page. */
private val building = ArrayList<Page>()

/** The page a routed component's template fills. */
fun routedPage(): Page = building.lastOrNull() ?: Page()

/** `inject(Page)`: the routed page being built, else the page shown. */
fun injectedPage(): Page = building.lastOrNull() ?: (FrameBase.topmost()?.currentPage as? Page) ?: Page()

private var Page.route: ActivatedRoute?
    get() = jsGet(this, routeKey.key) as? ActivatedRoute
    set(value) = jsSet(this, routeKey.key, value)

/**
 * Each outlet is a frame; a URL within an outlet resolves through the configuration to a component, and
 * navigating to a URL the outlet does not show creates a Page, renders the component into it and navigates
 * the frame to it with the extras' `animated`, `clearHistory` and `transition`, as PageRouterOutlet does.
 * Going back is the frame's: when a page is navigated from going back, its component is destroyed and the
 * outlet shows the URL of the page under it.
 */
class Router {
    /** The flat table of apps configured without a route tree. */
    var routes: List<Route> = emptyList()
    var initial = "/"
    var config: List<RouteConfig> = emptyList()
    /** `router.events`: a NavigationEnd after each navigation, back navigations included. */
    val events = RxSubject<NavigationEnd>()
    private var navigationId = 0.0

    /** [match]: the routes the page's URL resolved through; [component]: the routed component, kept for canDeactivate guards. */
    private class Entry(val owner: Owner, val route: ActivatedRoute, val match: Match?) {
        var component: Any? = null
    }

    /** A URL resolved through the configuration: the routes, root first, the segments each consumed, the parameters and the URL once redirects applied. */
    private class Match(val chain: List<RouteConfig>, val consumed: List<List<String>>, val params: Map<String, String>, val url: List<String>)

    /** How an outlet's navigation ended, or where its guards redirect it. */
    private sealed class Outcome {
        class Done(val shown: Shown) : Outcome()
        class Redirect(val tree: UrlTree) : Outcome()
    }

    /** How an outlet's navigation ended. */
    private enum class Shown { UNMATCHED, ALREADY, NAVIGATED, CANCELLED }

    private val guardTable = HashMap<Int, HashMap<String, MutableList<RouteGuard>>>()
    /** The latest navigation: one whose guards settle after a newer one started is cancelled. */
    private var navigations = 0
    /** The components of the pages being built, innermost last. */
    private val rendering = ArrayList<Any?>()

    /** [injector]: the injector of the view holding the outlet, which its routed components inject from. */
    private class Outlet(frame: Frame, val routes: List<RouteConfig>, val injector: Injector?) {
        private val frameRef = java.lang.ref.WeakReference(frame)
        val frame: Frame? get() = frameRef.get()
        /** The pages navigated to in this outlet and not navigated back from, the shown one last. */
        val entries = ArrayList<Entry>()
    }

    private val outlets = HashMap<String, Outlet>()
    /** Navigations to outlets not created yet, applied when they are. */
    private val pending = HashMap<String, List<String>>()
    /** The outlets in the order they were last navigated, for `back()`. */
    private val history = ArrayList<String>()
    /** A flat route table's outlet: the injector of the view holding it. */
    private var flatInjector: Injector? = null

    /** The app ended (core's exit event): every routed component is destroyed, newest first, and the outlets forgotten. */
    fun destroy() {
        for (outlet in outlets.values) for (entry in outlet.entries.asReversed()) entry.owner.dispose()
        outlets.clear()
        pending.clear()
        history.clear()
    }

    /** A route guard of the route registered under [route] (`RouteConfig.guards`). */
    fun addGuard(route: Double, kind: String, guard: RouteGuard) {
        guardTable.getOrPut(route.toInt()) { HashMap() }.getOrPut(kind) { ArrayList() }.add(guard)
    }

    /** A routed component whose route has canDeactivate guards, kept as the page's component. */
    fun <C> activating(component: C): C {
        if (rendering.isNotEmpty()) rendering[rendering.size - 1] = component
        return component
    }

    /** A `page-router-outlet`: a frame showing its outlet's URL. A route that fails to render is reported and the frame stays empty. */
    fun outlet(name: String = PRIMARY): View {
        val frame = Frame()
        if (config.isEmpty()) {
            flatInjector = Injector.current
            resolveFlatRoute(initial)?.let { (route, params) -> jsReport { push(route.make, ActivatedRoute(params), frame, null, injector = flatInjector) } }
            return frame
        }
        outlets[name] = Outlet(frame, if (name == PRIMARY) config else routesIn(config, name), Injector.current)
        val url = if (name == PRIMARY) emptyList() else pending.remove(name)
        if (url != null) {
            show(name, url, null, begin(), { outcome ->
                if (outcome is Outcome.Redirect) navigateByUrl(outcome.tree)
                else if (name == PRIMARY && (outcome as Outcome.Done).shown == Shown.NAVIGATED) ended("/")
            }, ::jsReportUncaught)
        }
        return frame
    }

    fun navigate(commands: JSArray<*>, extras: Any? = null): JSPromise<Boolean> = navigate(commands.storage.toList(), extras)

    /** A navigation whose component throws shows nothing new, and its promise rejects with the error, as Angular's router's does. */
    fun navigate(commands: List<Any?>, extras: Any? = null): JSPromise<Boolean> {
        val (promise, resolvers) = JSPromise.pending<Boolean>()
        try {
            navigation(commands, extras, { resolvers.resolve(it) }, { resolvers.reject(it) })
        } catch (e: Throwable) {
            resolvers.reject(jsCaught(e))
        }
        return promise
    }

    /** A navigation's token: navigations a component starts while its page is built belong to the one building it. */
    private fun begin(): Int {
        if (building.isEmpty()) navigations += 1
        return navigations
    }

    private fun navigation(commands: List<Any?>, extras: Any?, done: (Boolean) -> Unit, fail: (Any?) -> Unit) {
        if (config.isEmpty()) {
            val path = commands.joinToString("/") { jsToString(it) }
            val (route, params) = resolveFlatRoute(path) ?: return done(false)
            val frame = FrameBase.topmost() as? Frame ?: return done(false)
            push(route.make, ActivatedRoute(params), frame, extras, injector = flatInjector)
            ended("/" + path.split("/").filter { it.isNotEmpty() }.joinToString("/"))
            return done(true)
        }
        val relativeTo = field(extras, "relativeTo") as? ActivatedRoute
        val targets = ArrayList<Pair<String, List<String>>>()
        val segments = ArrayList<String>()
        var absolute = false
        for ((i, command) in commands.withIndex()) {
            val outletsOf = if (command is String) null else field(command, "outlets")
            when {
                command is String -> {
                    if (i == 0 && command.startsWith("/")) absolute = true
                    segments += command.split("/").filter { it.isNotEmpty() }
                }
                outletsOf != null -> for (key in (outletsOf as? JSDynamic)?.jsKeys ?: emptyList()) {
                    val items = (jsBox(field(outletsOf, key)) as? JSArray<*>)?.storage ?: emptyList<Any?>()
                    targets.add(key to items.flatMap { jsToString(it).split("/").filter { s -> s.isNotEmpty() } })
                }
                else -> segments.add(jsToString(command))
            }
        }
        if (segments.isNotEmpty()) {
            if (absolute || relativeTo == null) {
                targets.add(0, PRIMARY to segments)
            } else {
                val url = relativeTo.url.toMutableList()
                for (s in segments) {
                    if (s == "..") { if (url.isNotEmpty()) url.removeAt(url.size - 1) } else if (s != ".") url.add(s)
                }
                targets.add(0, relativeTo.outlet to url)
            }
        }
        val token = begin()
        var ok = true
        var navigated = false
        var index = 0
        // Outlet by outlet: one whose guards return a promise continues when it settles.
        fun next() {
            if (index == targets.size) {
                if (navigated) ended(if (absolute || relativeTo == null) "/" + segments.joinToString("/") else this.url)
                return done(ok)
            }
            val (name, url) = targets[index++]
            // The primary URL `/home` with outlets names the route holding them, already shown.
            if (name == PRIMARY && index == 1 && targets.size > 1 && current(PRIMARY)?.firstOrNull() == url.firstOrNull()) return next()
            if (outlets[name]?.frame == null) {
                pending[name] = url
                return next()
            }
            show(name, url, extras, token, { outcome ->
                when {
                    // The first navigation's promise takes the redirect's result, as Angular's does.
                    outcome is Outcome.Redirect -> {
                        val str = outcome.tree.toString()
                        try { navigation(listOf(if (str.startsWith("/")) str else "/$str"), extras, done, fail) } catch (e: Throwable) { fail(jsCaught(e)) }
                    }
                    (outcome as Outcome.Done).shown == Shown.CANCELLED -> done(false)
                    else -> {
                        ok = outcome.shown != Shown.UNMATCHED && ok
                        navigated = navigated || outcome.shown == Shown.NAVIGATED
                        next()
                    }
                }
            }, fail)
        }
        next()
    }

    fun navigateByUrl(urlTarget: Any?, extras: Any? = null): JSPromise<Boolean> {
        val str = (jsBox(urlTarget) as? UrlTree)?.toString() ?: jsToString(urlTarget)
        return navigate(listOf(if (str.startsWith("/")) str else "/$str"), extras)
    }

    /** `back()`: the outlet of the given route, else the one navigated last that can go back, else the topmost frame. */
    fun back(options: Any? = null) {
        jsReport {
            val route = field(options, "relativeTo") as? ActivatedRoute
            val own = route?.let { outlets[it.outlet]?.frame }
            if (own != null && own.canGoBack()) {
                own.goBack()
                return@jsReport
            }
            for (name in history.reversed()) {
                val frame = outlets[name]?.frame ?: continue
                if (frame.canGoBack()) { frame.goBack(); return@jsReport }
            }
            FrameBase.goBack()
        }
    }

    fun backToPreviousPage() = back()

    /** `RouterExtensions.router`: the router itself. */
    val router: Router get() = this

    /** `router.url`: the primary outlet's URL. */
    val url: String get() = "/" + (current(PRIMARY) ?: emptyList()).joinToString("/")

    val routerState: JSObject
        get() = JSObject(
            "snapshot" to JSObject("url" to url, "root" to ActivatedRoute.current.snapshot),
            "root" to ActivatedRoute.current,
        )

    fun createUrlTree(commands: Any?, extras: Any? = null): UrlTree {
        val items = (jsBox(commands) as? JSArray<*>)?.storage ?: emptyList<Any?>()
        val joined = items.joinToString("/") { jsToString(it) }.trim('/')
        val q = field(extras, "queryParams")
        val f = field(extras, "fragment") as? String
        return UrlTree("/$joined", q, f)
    }

    fun serializeUrl(tree: Any?): String = (jsBox(tree) as? UrlTree)?.toString() ?: jsToString(tree)

    fun parseUrl(raw: String): UrlTree = DefaultUrlSerializer().parse(raw)

    fun isActive(targetUrl: Any?, exact: Any? = false): Boolean {
        val target = (jsBox(targetUrl) as? UrlTree)?.toString() ?: jsToString(targetUrl)
        val isExact = (jsBox(exact) as? Boolean) ?: (field(exact, "paths") == "exact")
        return if (isExact) url == target else url.startsWith(target)
    }

    fun canGoBack(@Suppress("UNUSED_PARAMETER") options: Any? = null): Boolean = history.any { outlets[it]?.frame?.canGoBack() == true }

    fun canGoBackToPreviousPage(): Boolean = canGoBack()

    private fun routesIn(routes: List<RouteConfig>, outlet: String): List<RouteConfig> =
        routes.filter { it.outlet == outlet } + routes.flatMap { routesIn(it.children, outlet) }

    private fun current(name: String): List<String>? = outlets[name]?.entries?.lastOrNull()?.route?.url

    private fun ended(url: String) {
        navigationId += 1
        events.next(NavigationEnd(navigationId, url, this.url))
    }

    /**
     * An outlet's navigation to a URL, as Angular's router runs it: canMatch while the URL is matched (a route whose guards
     * return false is passed over), canDeactivate of the routes the outlet leaves, then canActivateChild and canActivate of
     * each route it activates, root first. Guards that all return synchronously keep the navigation synchronous. A
     * navigation is never guarded going back: the frame has gone back already, as with @nativescript/angular, which lets
     * the router catch up after the frame.
     */
    private fun show(name: String, url: List<String>, extras: Any?, token: Int, done: (Outcome) -> Unit, fail: (Any?) -> Unit) {
        val outlet = outlets[name] ?: return done(Outcome.Done(Shown.UNMATCHED))
        val candidates = matches(outlet.routes, url, if (name == PRIMARY) PRIMARY else null).filter { it.chain.lastOrNull()?.make != null }
        val current = outlet.entries.lastOrNull()
        val currentUrl = "/" + (current?.route?.url ?: emptyList()).joinToString("/")
        val matched = java.util.IdentityHashMap<RouteConfig, Boolean>()

        fun activate(found: Match) {
            if (token != navigations) return done(Outcome.Done(Shown.CANCELLED))
            if (current?.route?.url == found.url) return done(Outcome.Done(Shown.ALREADY))
            val route = ActivatedRoute(found.params, name, found.url)
            val nextUrl = "/" + found.url.joinToString("/")
            // Routes the outlet shows already, with the same segments, are reused: their guards don't run again.
            var reused = 0
            val old = current?.match
            if (old != null) {
                while (reused < minOf(old.chain.size, found.chain.size) && old.chain[reused] === found.chain[reused] && old.consumed[reused] == found.consumed[reused]) reused++
            }
            val groups = ArrayList<List<() -> Any?>>()
            if (current != null && old != null) {
                val currentState = RouterStateSnapshot(currentUrl, current.route.snapshot)
                val nextState = RouterStateSnapshot(nextUrl, route.snapshot)
                for (i in old.chain.indices.reversed()) {
                    if (i < reused) break
                    val component = if (i == old.chain.size - 1) current.component else null
                    val calls = guards(old.chain[i], "canDeactivate").map { g -> { g(component, current.route.snapshot, currentState, nextState) } }
                    if (calls.isNotEmpty()) groups.add(calls)
                }
            }
            val state = RouterStateSnapshot(nextUrl, route.snapshot)
            for (i in reused until found.chain.size) {
                val children = found.chain.subList(0, i).asReversed().flatMap { guards(it, "canActivateChild") }.map { g -> { g(route.snapshot, state, null, null) } }
                if (children.isNotEmpty()) groups.add(children)
                val calls = guards(found.chain[i], "canActivate").map { g -> { g(route.snapshot, state, null, null) } }
                if (calls.isNotEmpty()) groups.add(calls)
            }
            check(groups, outlet, { verdict ->
                if (token != navigations || verdict == false) return@check done(Outcome.Done(Shown.CANCELLED))
                if (verdict is UrlTree) return@check done(Outcome.Redirect(verdict))
                val frame = outlet.frame
                val make = found.chain.lastOrNull()?.make
                if (frame == null || make == null) return@check done(Outcome.Done(Shown.UNMATCHED))
                history.remove(name)
                history.add(name)
                try {
                    push(make, route, frame, extras, outlet, outlet.injector, found)
                } catch (e: Throwable) {
                    return@check fail(jsCaught(e))
                }
                done(Outcome.Done(Shown.NAVIGATED))
            }, fail)
        }

        var index = 0
        fun candidate() {
            if (token != navigations) return done(Outcome.Done(Shown.CANCELLED))
            if (index >= candidates.size) return done(Outcome.Done(Shown.UNMATCHED))
            val found = candidates[index++]
            if (found.chain.any { matched[it] == false }) return candidate()
            val segments = JSArray(url.map { UrlSegment(it) }.toMutableList())
            val unchecked = found.chain.filter { matched[it] == null && guards(it, "canMatch").isNotEmpty() }
            var at = 0
            fun canMatch() {
                if (at == unchecked.size) return activate(found)
                val route = unchecked[at++]
                val calls = guards(route, "canMatch").map { g -> { g(JSObject("path" to route.segments.joinToString("/")), segments, null, null) } }
                check(listOf(calls), outlet, { verdict ->
                    when (verdict) {
                        null -> { matched[route] = true; canMatch() }
                        is UrlTree -> done(Outcome.Redirect(verdict))
                        else -> { matched[route] = false; candidate() }
                    }
                }, fail)
            }
            canMatch()
        }
        candidate()
    }

    private fun guards(route: RouteConfig, kind: String): List<RouteGuard> = route.guards?.let { guardTable[it]?.get(kind) } ?: emptyList()

    /**
     * Guards group by group, in the outlet's injection context. Each group's guards are all called first, then the first
     * result that isn't true decides (Angular's prioritizedGuardValue): false cancels, a UrlTree redirects, and anything
     * else passes. A promise, or an Observable's first value, defers what follows until it settles. [next] takes null
     * (passed), false or the UrlTree.
     */
    private fun check(groups: List<List<() -> Any?>>, outlet: Outlet, next: (Any?) -> Unit, fail: (Any?) -> Unit) {
        var at = 0
        fun group() {
            if (at == groups.size) return next(null)
            val calls = groups[at++]
            val results = try {
                Injector.runInContext(outlet.injector) { calls.map { it() } }
            } catch (e: Throwable) {
                return fail(jsCaught(e))
            }
            fun result(i: Int) {
                if (i == results.size) return group()
                val decide = { value: Any? ->
                    val v = jsBox(value)
                    if (v is UrlTree || v == false) next(v) else result(i + 1)
                }
                when (val r = jsBox(results[i])) {
                    is JSThenable -> r.jsSubscribe(decide, fail)
                    is RxObservable<*> -> first(r, decide)
                    else -> decide(r)
                }
            }
            result(0)
        }
        group()
    }

    /** An Observable's first value (Angular's `first()`): the kit's Observables complete with no value only by never emitting. */
    @Suppress("UNCHECKED_CAST")
    private fun first(source: RxObservable<*>, next: (Any?) -> Unit) {
        var taken = false
        var subscription: RxSubscription? = null
        subscription = (source as RxObservable<Any?>).subscribe { value ->
            if (!taken) {
                taken = true
                subscription?.unsubscribe()
                next(value)
            }
        }
        if (taken) subscription.unsubscribe()
    }

    /**
     * PageRouterOutlet's `activateOnGoForward`: a new page, the component rendered into it in a scope of its own, and the frame navigated to it.
     * A component that throws leaves the outlet as it was.
     */
    private fun push(make: () -> View, route: ActivatedRoute, frame: Frame, extras: Any?, outlet: Outlet? = null, injector: Injector?, match: Match? = null) {
        val page = Page()
        page.route = route
        val owner = Owner(null)
        // Shown before the component renders, as Angular's URL is current by activation: a navigation the
        // component makes while rendering (a tab view filling its outlets) finds this route already there.
        val entry = Entry(owner, route, match)
        outlet?.entries?.add(entry)
        val previousRoute = ActivatedRoute.current
        ActivatedRoute.current = route
        building.add(page)
        rendering.add(null)
        val view = try {
            owner.run { Injector.runInContext(injector, make) }
        } catch (e: Throwable) {
            owner.dispose()
            outlet?.entries?.remove(entry)
            ActivatedRoute.current = previousRoute
            throw e
        } finally {
            building.removeAt(building.size - 1)
            entry.component = rendering.removeAt(rendering.size - 1)
        }
        if (view !== page) page.content = view
        val outletRef = outlet?.let { java.lang.ref.WeakReference(it) }
        page.on(PageBase.navigatedFromEvent, { data ->
            if (jsTruthy(jsGet(data, "isBackNavigation"))) {
                owner.dispose()
                val o = outletRef?.get()
                if (o != null && o.entries.remove(entry)) ended(url)
            }
        })
        val clearHistory = jsTruthy(field(extras, "clearHistory"))
        if (clearHistory && outletRef != null) {
            page.once(PageBase.navigatedToEvent, { _ ->
                val o = outletRef.get() ?: return@once
                val cleared = o.entries.filter { it !== entry }
                o.entries.retainAll { it === entry }
                for (old in cleared) old.owner.dispose()
            })
        }
        val animated = field(extras, "animated")
        val navigation = mutableListOf<Pair<String, Any?>>(
            "create" to jsFunction { page },
            "clearHistory" to clearHistory,
            "animated" to (if (animated == null) true else jsTruthy(animated)),
        )
        field(extras, "transition")?.let { navigation.add("transition" to it) }
        frame.navigate(JSObject(navigation))
    }

    /** Every way a URL resolves through the routes, in the order Angular's router tries them. A redirect that applies ends the search, as in Angular. */
    private fun matches(routes: List<RouteConfig>, url: List<String>, outlet: String?): List<Match> {
        val found = ArrayList<Match>()
        for (route in routes) {
            if (outlet != null && route.outlet != outlet) continue
            val redirect = route.redirectTo
            if (redirect != null) {
                val applies = if (route.full) url == route.segments else url.take(route.segments.size) == route.segments
                if (!applies) continue
                val target = redirect.split("/").filter { it.isNotEmpty() } + url.drop(route.segments.size)
                return found + if (redirect.startsWith("/")) matches(config, target, PRIMARY) else matches(routes, target, outlet)
            }
            if (url.size < route.segments.size) continue
            val params = HashMap<String, String>()
            var matched = true
            for ((pattern, part) in route.segments.zip(url)) {
                if (pattern.startsWith(":")) params[pattern.substring(1)] = URLDecoder.decode(part, "UTF-8")
                else if (pattern != part) { matched = false; break }
            }
            if (!matched) continue
            val own = url.take(route.segments.size)
            val rest = url.drop(route.segments.size)
            if (route.make != null && rest.isEmpty()) found.add(Match(listOf(route), listOf(own), params, if (route.segments.isEmpty()) emptyList() else url))
            val children = route.children.filter { it.outlet == PRIMARY }
            if (children.isNotEmpty()) {
                for (inner in matches(children, rest, PRIMARY)) found.add(Match(listOf(route) + inner.chain, listOf(own) + inner.consumed, params + inner.params, own + inner.url))
            }
        }
        return found
    }

    private fun resolveFlatRoute(path: String): Pair<Route, Map<String, String>>? {
        val parts = path.split("/").filter { it.isNotEmpty() }
        for (route in routes) {
            if (route.segments.size != parts.size) continue
            val params = HashMap<String, String>()
            var matched = true
            for ((pattern, part) in route.segments.zip(parts)) {
                if (pattern.startsWith(":")) params[pattern.substring(1)] = URLDecoder.decode(part, "UTF-8")
                else if (pattern != part) { matched = false; break }
            }
            if (matched) return route to params
        }
        return null
    }

    companion object {
        const val PRIMARY = "primary"
        val shared = Router()
    }
}

typealias KitRouter = Router

/** A key of an options object script passes, null when absent. */
private fun field(target: Any?, key: String): Any? = if (jsIsNullish(target)) null else jsBox(jsGet(target, key)).let { if (it === JSNull) null else it }

/** `registerElement(tag, () => Class)`: compiled templates name each view's class already. */
fun registerElement(@Suppress("UNUSED_PARAMETER") tag: String, @Suppress("UNUSED_PARAMETER") type: Any?) {}
