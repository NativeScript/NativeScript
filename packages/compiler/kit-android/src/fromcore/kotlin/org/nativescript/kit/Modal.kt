package org.nativescript.kit

/**
 * `$showModal(Component, options)` and `$closeModal(result)`, as nativescript-vue presents a component
 * through core: from the topmost modal, else the root view; the template's effects end when it closes.
 */
object Modal {
    private class Shown(val view: View, val owner: Owner) {
        var resolved = false
    }

    private val stack = mutableListOf<Shown>()

    fun show(fullscreen: Boolean = false, animated: Boolean = true, cancelable: Boolean = true, stretched: Boolean = false, closeCallback: ((Any?) -> Unit)? = null, create: () -> View) {
        show(listOf("fullscreen" to fullscreen, "animated" to animated, "cancelable" to cancelable, "stretched" to stretched), closeCallback, create)
    }

    /** A modal opened with `showModal` options given as script gives them (a dialog's `nativeOptions`), over the defaults core's own take. */
    fun show(options: Any?, closeCallback: ((Any?) -> Unit)? = null, create: () -> View) {
        val settings = mutableListOf<Pair<String, Any?>>("fullscreen" to false, "animated" to true, "cancelable" to true, "stretched" to false)
        for (key in jsKeysOf(options)) {
            if (key == "context" || key == "closeCallback") continue
            val value = jsGet(options, key)
            val at = settings.indexOfFirst { it.first == key }
            if (at >= 0) settings[at] = key to value else settings.add(key to value)
        }
        show(settings, closeCallback, create)
    }

    private fun show(settings: List<Pair<String, Any?>>, closeCallback: ((Any?) -> Unit)?, create: () -> View) {
        jsReport {
            val target = stack.lastOrNull()?.view ?: Core_application_application.Application!!.getRootView_() ?: return@jsReport
            val owner = Owner(null)
            val view = owner.run(create)
            val shown = Shown(view, owner)
            val close = jsFunction { args ->
                if (!shown.resolved) {
                    shown.resolved = true
                    stack.remove(shown)
                    owner.dispose()
                    closeCallback?.invoke(args.getOrNull(0))
                }
                null
            }
            val options = JSObject("context" to null, "closeCallback" to close)
            for ((key, value) in settings) options[key] = value
            target.showModal(view, options)
            // Core refuses to present (the target presents already, or is not attached) by tracing and returning.
            if (view._modalParent == null) {
                owner.dispose()
                throw JSException(JSError("Could not show modal: ${target.javaClass.simpleName} refused to present it."))
            }
            stack.add(shown)
        }
    }

    fun close(result: Any? = null) {
        val shown = stack.lastOrNull() ?: return
        jsReport { shown.view.closeModal(JSArray<Any?>(listOf(result))) }
    }
}
