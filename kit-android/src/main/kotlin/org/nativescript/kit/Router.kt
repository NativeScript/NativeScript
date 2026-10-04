package org.nativescript.kit

import java.net.URLDecoder

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

/**
 * The route a component was created for (Angular `ActivatedRoute`): set by the
 * router before it constructs the routed component.
 */
class ActivatedRoute(params: Map<String, String>) {
    class Snapshot(val params: Map<String, String>)

    val snapshot = Snapshot(params)

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

    /** The outlet: a frame showing the initial route's page. */
    fun outlet(): View {
        val frame = Frame()
        resolve(initial)?.let { frame.addChild(it) }
        return frame
    }

    fun navigate(commands: JSArray<*>, extras: Any? = null) = navigate(commands.elements, extras)

    fun navigate(commands: List<Any?>, extras: Any? = null) {
        val path = commands.joinToString("/") { jsToString(it) }
        if (resolveRoute(path) == null) return
        Frame.topmost()?.navigate { resolve(path)!! }
    }

    fun back() {
        Frame.topmost()?.goBack()
    }

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
