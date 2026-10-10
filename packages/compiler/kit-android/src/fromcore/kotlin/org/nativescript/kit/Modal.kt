package org.nativescript.kit

/**
 * `$showModal(Component, options)` and `$closeModal(result)`, as nativescript-vue presents a component
 * through core: from the topmost modal, else the root view; the template's effects end when it closes.
 */
object Modal {
    private class Shown(val view: View, val owner: Owner)

    private val stack = mutableListOf<Shown>()

    fun show(fullscreen: Boolean = false, animated: Boolean = true, cancelable: Boolean = true, closeCallback: ((Any?) -> Unit)? = null, create: () -> View) {
        jsReport {
            val target = stack.lastOrNull()?.view ?: Core_application_application.Application!!.getRootView_() ?: return@jsReport
            val owner = Owner(null)
            val view = owner.run(create)
            val shown = Shown(view, owner)
            var resolved = false
            val options = JSObject(
                "fullscreen" to fullscreen,
                "animated" to animated,
                "cancelable" to cancelable,
                "closeCallback" to jsFunction { args ->
                    if (!resolved) {
                        resolved = true
                        stack.remove(shown)
                        owner.dispose()
                        closeCallback?.invoke(args.getOrNull(0))
                    }
                    null
                },
            )
            target.showModal(view, options)
            stack.add(shown)
        }
    }

    fun close(result: Any? = null) {
        val shown = stack.lastOrNull() ?: return
        jsReport { shown.view.closeModal(JSArray<Any?>(listOf(result))) }
    }
}
