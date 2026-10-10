package org.nativescript.kit

import java.net.URLDecoder

// Angular's router with @nativescript/angular's page-router-outlets and RouterExtensions, over the
// Frame and Page compiled from core (kit-apple's Router.swift).

/** An event a component raises (Angular `output()`): the parent subscribes, the component emits. */
class Emitter<T> {
    private val handlers = mutableListOf<(T) -> Unit>()
    fun on(handler: (T) -> Unit) {
        handlers.add(handler)
    }
    fun emit(value: T) {
        for (h in handlers.toList()) h(value)
    }
}

fun Emitter<Unit>.emit() = emit(Unit)

/** The route a component was created for (Angular `ActivatedRoute`): set by the router before it constructs the routed component. */
class ActivatedRoute(params: Map<String, String>, internal val outlet: String = Router.PRIMARY, internal val url: List<String> = emptyList()) {
    class Snapshot(val params: JSObject)

    val snapshot = Snapshot(JSObject(params.map { it.key to (it.value as Any?) }))

    /** `route.params`: the route's parameters, replayed to each subscriber. */
    val params = RxBehaviorSubject(snapshot.params)

    companion object {
        var current = ActivatedRoute(emptyMap())
    }
}

/** A route of a flat table (an app configured without a route tree). */
class Route(path: String, internal val make: () -> View) {
    internal val segments = path.split("/").filter { it.isNotEmpty() }
}

/** A route of the app's configuration (Angular's `Route`), lazy children and components resolved at compile time. */
class RouteConfig(path: String, internal val outlet: String = Router.PRIMARY, internal val redirectTo: String? = null, internal val full: Boolean = false, internal val children: List<RouteConfig> = emptyList(), internal val make: (() -> View)? = null) {
    internal val segments = path.split("/").filter { it.isNotEmpty() }
}

/** `NavigationEnd`, the router event each completed navigation emits. */
class NavigationEnd(val id: Double, val url: String, val urlAfterRedirects: String)

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

    private class Entry(val owner: Owner, val route: ActivatedRoute)

    private class Outlet(frame: Frame, val routes: List<RouteConfig>) {
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

    /** A `page-router-outlet`: a frame showing its outlet's URL. */
    fun outlet(name: String = PRIMARY): View {
        val frame = Frame()
        if (config.isEmpty()) {
            resolveFlatRoute(initial)?.let { (route, params) -> push(route.make, ActivatedRoute(params), frame, null) }
            return frame
        }
        outlets[name] = Outlet(frame, if (name == PRIMARY) config else routesIn(config, name))
        if (name == PRIMARY) {
            if (show(name, emptyList(), null) == true) ended("/")
        } else {
            pending.remove(name)?.let { show(name, it, null) }
        }
        return frame
    }

    fun navigate(commands: JSArray<*>, extras: Any? = null): JSPromise<Boolean> = navigate(commands.storage.toList(), extras)

    fun navigate(commands: List<Any?>, extras: Any? = null): JSPromise<Boolean> {
        if (config.isEmpty()) {
            val path = commands.joinToString("/") { jsToString(it) }
            val (route, params) = resolveFlatRoute(path) ?: return JSPromise.resolve(false)
            val frame = FrameBase.topmost() as? Frame ?: return JSPromise.resolve(false)
            push(route.make, ActivatedRoute(params), frame, extras)
            ended("/" + path.split("/").filter { it.isNotEmpty() }.joinToString("/"))
            return JSPromise.resolve(true)
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
        var ok = true
        var navigated = false
        for ((index, target) in targets.withIndex()) {
            val (name, url) = target
            // The primary URL `/home` with outlets names the route holding them, already shown.
            if (name == PRIMARY && index == 0 && targets.size > 1 && current(PRIMARY)?.firstOrNull() == url.firstOrNull()) continue
            if (outlets[name]?.frame == null) {
                pending[name] = url
                continue
            }
            val shown = show(name, url, extras)
            ok = shown != null && ok
            navigated = navigated || shown == true
        }
        if (navigated) ended(if (absolute || relativeTo == null) "/" + segments.joinToString("/") else this.url)
        return JSPromise.resolve(ok)
    }

    fun navigateByUrl(url: String, extras: Any? = null): JSPromise<Boolean> = navigate(listOf(if (url.startsWith("/")) url else "/$url"), extras)

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

    /** `RouterExtensions.router`: the router itself. */
    val router: Router get() = this

    /** `router.url`: the primary outlet's URL. */
    val url: String get() = "/" + (current(PRIMARY) ?: emptyList()).joinToString("/")

    fun canGoBack(): Boolean = history.any { outlets[it]?.frame?.canGoBack() == true }

    private fun routesIn(routes: List<RouteConfig>, outlet: String): List<RouteConfig> =
        routes.filter { it.outlet == outlet } + routes.flatMap { routesIn(it.children, outlet) }

    private fun current(name: String): List<String>? = outlets[name]?.entries?.lastOrNull()?.route?.url

    private fun ended(url: String) {
        navigationId += 1
        events.next(NavigationEnd(navigationId, url, this.url))
    }

    /** Whether the outlet navigated: null when the URL matches no route, false when the outlet shows it already. */
    private fun show(name: String, url: List<String>, extras: Any?): Boolean? {
        val outlet = outlets[name] ?: return null
        val frame = outlet.frame ?: return null
        val (chain, params, resolved) = match(outlet.routes, url, if (name == PRIMARY) PRIMARY else null) ?: return null
        val make = chain.lastOrNull()?.make ?: return null
        if (outlet.entries.lastOrNull()?.route?.url == resolved) return false
        history.remove(name)
        history.add(name)
        push(make, ActivatedRoute(params, name, resolved), frame, extras, outlet)
        return true
    }

    /** PageRouterOutlet's `activateOnGoForward`: a new page, the component rendered into it in a scope of its own, and the frame navigated to it. */
    private fun push(make: () -> View, route: ActivatedRoute, frame: Frame, extras: Any?, outlet: Outlet? = null) {
        jsReport {
            val page = Page()
            page.route = route
            val owner = Owner(null)
            // Shown before the component renders, as Angular's URL is current by activation: a navigation the
            // component makes while rendering (a tab view filling its outlets) finds this route already there.
            val entry = Entry(owner, route)
            outlet?.entries?.add(entry)
            ActivatedRoute.current = route
            building.add(page)
            val view = try { owner.run(make) } finally { building.removeAt(building.size - 1) }
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
    }

    /** The routes a URL resolves through, its parameters and the URL once redirects applied. */
    private fun match(routes: List<RouteConfig>, url: List<String>, outlet: String?): Triple<List<RouteConfig>, Map<String, String>, List<String>>? {
        for (route in routes) {
            if (outlet != null && route.outlet != outlet) continue
            val redirect = route.redirectTo
            if (redirect != null) {
                val applies = if (route.full) url == route.segments else url.take(route.segments.size) == route.segments
                if (!applies) continue
                val target = redirect.split("/").filter { it.isNotEmpty() } + url.drop(route.segments.size)
                return if (redirect.startsWith("/")) match(config, target, PRIMARY) else match(routes, target, outlet)
            }
            if (url.size < route.segments.size) continue
            val params = HashMap<String, String>()
            var matched = true
            for ((pattern, part) in route.segments.zip(url)) {
                if (pattern.startsWith(":")) params[pattern.substring(1)] = URLDecoder.decode(part, "UTF-8")
                else if (pattern != part) { matched = false; break }
            }
            if (!matched) continue
            val rest = url.drop(route.segments.size)
            if (route.make != null && rest.isEmpty()) return Triple(listOf(route), params, if (route.segments.isEmpty()) emptyList() else url)
            val children = route.children.filter { it.outlet == PRIMARY }
            if (children.isNotEmpty()) {
                val inner = match(children, rest, PRIMARY)
                if (inner != null) return Triple(listOf(route) + inner.first, params + inner.second, url.take(route.segments.size) + inner.third)
            }
        }
        return null
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

/** A key of an options object script passes, null when absent. */
private fun field(target: Any?, key: String): Any? = if (jsIsNullish(target)) null else jsBox(jsGet(target, key)).let { if (it === JSNull) null else it }
