package org.nativescript.kit

import android.os.Handler as AndroidHandler
import android.os.Looper as AndroidLooper
import android.util.Log as AndroidLog

/**
 * The app's modules by the names its bundle registers them under (`global.registerBundlerModules`): what core's
 * Builder and module-name resolver load XML, stylesheets and code-behind modules through.
 */
object AppModules {
    private val loaders = HashMap<String, () -> Any?>()
    private val names = mutableListOf<String>()
    private val loaded = HashMap<String, Any?>()

    /** A module under each of its names; the first registration of a name wins, as the bundle's does. */
    fun register(moduleNames: List<String>, loader: () -> Any?) {
        for (name in moduleNames) if (name !in loaders) {
            loaders[name] = loader
            names.add(name)
        }
    }

    /** An app source file under the names the bundle gives it: `main-page.xml`, `./main-page.xml`; a script module also as `main-page`, `./main-page` and `main-page.js`. */
    fun register(file: String, loader: () -> Any?) {
        val dot = file.lastIndexOf('.')
        val moduleNames = if (dot >= 0 && file.substring(dot) in setOf(".ts", ".js")) {
            val base = file.substring(0, dot)
            listOf(base, "./$base", "$base.js", "./$base.js")
        } else listOf(file, "./$file")
        register(moduleNames, loader)
    }

    internal fun load(name: String): Any? {
        if (loaded.containsKey(name)) return loaded[name]
        val loader = loaders[name] ?: return null
        val value = loader()
        loaded[name] = value
        return value
    }

    internal fun install() {
        jsSet(jsGlobalThis, "loadModule", jsFunction { a -> load(jsToString(a.getOrNull(0))) })
        jsSet(jsGlobalThis, "moduleExists", jsFunction { a -> loaders.containsKey(jsToString(a.getOrNull(0))) })
        jsSet(jsGlobalThis, "getRegisteredModules", jsFunction { _ -> JSArray<Any?>(names.toList()) })
        jsSet(jsGlobalThis, "registerModule", jsFunction { a ->
            val name = jsToString(a.getOrNull(0))
            val loader = a.getOrNull(1)
            loaders[name] = { jsCall(loader, name) }
            loaded.remove(name)
            if (name !in names) names.add(name)
            null
        })
    }
}

/**
 * The app: its stylesheet, which core loads as `app.css`, then the root view the template makes, as
 * `Application.run({ create })` starts it. Run from the app's `android.app.Application`, before core's
 * activity (`com.tns.NativeScriptActivity`) is created, as NativeScript's runtime runs the app's bundle.
 */
object NativeScriptApplication {
    /** The app's stylesheet as its build parsed it (rework-css's AST, as `css2json-loader` ships it), which `app.css` loads as. */
    var cssAST: String? = null
        set(value) {
            field = value
            installModuleLoader()
        }

    private fun installModuleLoader() {
        AppModules.register("app.css") { cssAST?.let { jsJSONParse(it) } ?: "" }
        AppModules.install()
    }

    /**
     * The app folder's files the build packs as assets under `app/` (`app/assets/logo.png`), copied to the files
     * folder where core resolves `~/` paths, once per install or update, as NativeScript's runtime extracts them.
     */
    fun extractAppFiles(context: android.content.Context) {
        val stamp = java.io.File(context.filesDir, "app/.extracted")
        @Suppress("DEPRECATION")
        val version = context.packageManager.getPackageInfo(context.packageName, 0).lastUpdateTime.toString()
        if (stamp.exists() && stamp.readText() == version) return
        fun copy(path: String) {
            val children = context.assets.list(path) ?: emptyArray()
            if (children.isNotEmpty()) return children.forEach { copy("$path/$it") }
            val out = java.io.File(context.filesDir, path)
            out.parentFile?.mkdirs()
            try {
                context.assets.open(path).use { input -> out.outputStream().use { input.copyTo(it) } }
            } catch (_: java.io.FileNotFoundException) {
                // An empty folder lists no children either.
            }
        }
        copy("app")
        stamp.parentFile?.mkdirs()
        stamp.writeText(version)
    }

    /** What every app's entry sets up before its first module runs, whether the kit runs the app or the app's own `Application.run` does. */
    fun prepare(cssAST: String? = null) {
        jsTraceErrors = AndroidLog.isLoggable("NSNative", AndroidLog.DEBUG)
        installEventLoop()
        if (cssAST != null) this.cssAST = cssAST
    }

    fun run(cssAST: String, root: () -> View) {
        prepare(cssAST)
        CoreModules.initialize()
        start(root)
    }

    /** `Application.run({ create })`, once core's modules and the app's have run. */
    fun start(root: () -> View) {
        jsReport {
            Core_application_application.Application!!.run(JSObject("create" to jsFunction { root() }))
        }
    }

    private var eventLoop = false

    /** Timers run from the main looper, and promise jobs run after each batch of its work: when an event handler returns and whenever the queue idles. */
    private fun installEventLoop() {
        if (eventLoop) return
        eventLoop = true
        val handler = AndroidHandler(AndroidLooper.getMainLooper())
        val tick = Runnable {
            JSEventLoop.processTimers()
            Microtasks.checkpoint()
        }
        JSRealm.main.post = { job -> handler.post(job) }
        JSEventLoop.host = { delay ->
            handler.removeCallbacks(tick)
            if (delay != null) handler.postDelayed(tick, Math.ceil(delay).toLong())
        }
        AndroidLooper.getMainLooper().queue.addIdleHandler {
            Microtasks.checkpoint()
            true
        }
        // Jobs queued by a native callback (an animator's end, a listener) run once it returns, before the looper's
        // next message, as V8 runs them when script returns to native code: a looper kept busy by frames never idles.
        var checkpointPosted = false
        val checkpoint = Runnable {
            checkpointPosted = false
            Microtasks.checkpoint()
        }
        Microtasks.onEnqueue = {
            if (!checkpointPosted) {
                checkpointPosted = true
                handler.postAtFrontOfQueue(checkpoint)
            }
        }
    }
}
