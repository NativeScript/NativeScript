package org.nativescript.kit

import java.net.URLDecoder

/**
 * The route a component was created for (Angular `ActivatedRoute`): set by the
 * router before it constructs the routed component.
 */
class ActivatedRoute(
    params: Map<String, String>,
    val outlet: String = "primary",
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

class Route(path: String, internal val make: () -> View) {
    internal val segments = path.split("/").filter { it.isNotEmpty() }
}

/**
 * Path-based navigation (Angular `RouterExtensions`, `page-router-outlet`):
 * a path resolves to a route, its `:params` to the activated route, and the
 * routed page is pushed on the frame.
 */
class Router {
    var routes: List<Route> = emptyList()
    var initial = "/"
    val events = RxSubject<NavigationEnd>()
    private var navigationId = 0.0
    var url = "/"
        private set

    val router: Router get() = this
    val routerState: JSObject
        get() = JSObject(
            "snapshot" to JSObject("url" to url, "root" to ActivatedRoute.current.snapshot),
            "root" to ActivatedRoute.current,
        )

    /** A named outlet: this flat table has one. */
    fun outlet(@Suppress("UNUSED_PARAMETER") name: String): View = outlet()

    /** The outlet: a frame showing the initial route's page. */
    fun outlet(): View {
        val frame = Frame()
        resolve(initial)?.let { frame.addChild(it) }
        return frame
    }

    fun navigate(commands: JSArray<*>, extras: Any? = null): JSPromise<Boolean> = navigate(commands.elements, extras)

    fun navigate(commands: List<Any?>, @Suppress("UNUSED_PARAMETER") extras: Any? = null): JSPromise<Boolean> {
        val path = commands.joinToString("/") { jsToString(it) }
        if (resolveRoute(path) == null) return JSPromise.resolve(false)
        Frame.topmost()?.navigate { resolve(path)!! }
        url = "/" + path.split("/").filter { it.isNotEmpty() }.joinToString("/")
        navigationId += 1
        events.next(NavigationEnd(navigationId, url, url))
        return JSPromise.resolve(true)
    }

    fun navigateByUrl(urlTarget: Any?, extras: Any? = null): JSPromise<Boolean> {
        val str = (jsBox(urlTarget) as? UrlTree)?.toString() ?: jsToString(urlTarget)
        return navigate(listOf(if (str.startsWith("/")) str else "/$str"), extras)
    }

    fun createUrlTree(commands: Any?, extras: Any? = null): UrlTree {
        val items = (jsBox(commands) as? JSArray<*>)?.storage ?: emptyList<Any?>()
        val joined = items.joinToString("/") { jsToString(it) }.trim('/')
        val q = jsGetOptional(extras, "queryParams")
        val f = jsGetOptional(extras, "fragment") as? String
        return UrlTree("/$joined", q, f)
    }

    fun serializeUrl(tree: Any?): String = (jsBox(tree) as? UrlTree)?.toString() ?: jsToString(tree)

    fun parseUrl(raw: String): UrlTree = DefaultUrlSerializer().parse(raw)

    fun isActive(targetUrl: Any?, exact: Any? = false): Boolean {
        val target = (jsBox(targetUrl) as? UrlTree)?.toString() ?: jsToString(targetUrl)
        val isExact = (jsBox(exact) as? Boolean) ?: (jsGetOptional(exact, "paths") == "exact")
        return if (isExact) url == target else url.startsWith(target)
    }

    fun back(@Suppress("UNUSED_PARAMETER") options: Any? = null) {
        Frame.topmost()?.goBack()
    }

    fun backToPreviousPage() = back()

    fun canGoBack(@Suppress("UNUSED_PARAMETER") options: Any? = null): Boolean = false

    fun canGoBackToPreviousPage(): Boolean = canGoBack()

    internal fun resolve(path: String): View? {
        val (route, params) = resolveRoute(path) ?: return null
        ActivatedRoute.current = ActivatedRoute(params)
        return route.make()
    }

    private fun resolveRoute(path: String): Pair<Route, Map<String, String>>? {
        val parts = path.split("/").filter { it.isNotEmpty() }
        for (route in routes) {
            if (route.segments.size != parts.size) continue
            val params = HashMap<String, String>()
            var matched = true
            for ((pattern, part) in route.segments.zip(parts)) {
                if (pattern.startsWith(":")) params[pattern.substring(1)] = URLDecoder.decode(part, "UTF-8")
                else if (pattern != part) { matched = false; break }
            }
            if (matched) return Pair(route, params)
        }
        return null
    }

    companion object {
        val shared = Router()
    }
}

/** The page a routed component's template fills. */
fun routedPage(): Page = Page()

/** `inject(Page)`. */
fun injectedPage(): Page = routedPage()
