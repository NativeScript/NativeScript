package org.nativescript.kit

import android.app.Dialog
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatDialog
import androidx.fragment.app.DialogFragment

/**
 * Modal views as view/index.android and view-common present them, in a
 * DialogFragment, opened the way nativescript-vue's `$showModal` does: from
 * the topmost open modal, else the application's root view.
 */
object Modal {
    internal class Record(
        val view: View,
        val owner: Owner,
        val fullscreen: Boolean,
        val animated: Boolean,
        val cancelable: Boolean,
        val closeCallback: ((Any?) -> Unit)?,
    ) {
        var fragment: ModalFragment? = null
        var closing = false
    }

    private val stack = mutableListOf<Record>()
    private var nextId = 0
    internal val records = HashMap<Int, Record>()

    /** `showModal(view, options)`. Effects created while building the view end when it closes. */
    fun show(fullscreen: Boolean = false, animated: Boolean = true, cancelable: Boolean = true, closeCallback: ((Any?) -> Unit)? = null, create: () -> View) {
        val activity = NativeScriptActivity.current
        val owner = Owner(null)
        val view = owner.run(create)
        view.rootClasses = modalClasses()
        val record = Record(view, owner, fullscreen, animated, cancelable, closeCallback)
        stack.add(record)
        val id = nextId++
        records[id] = record
        // `_showNativeModalView`: a sized dialog centers its content; a fullscreen one stretches it.
        if (!fullscreen) {
            view.set("horizontalAlignment", "center")
            view.set("verticalAlignment", "middle")
        } else {
            view.set("horizontalAlignment", "stretch")
            view.set("verticalAlignment", "stretch")
        }
        val fragment = ModalFragment()
        fragment.arguments = Bundle().apply { putInt(ID, id) }
        record.fragment = fragment
        fragment.show(activity.supportFragmentManager, id.toString())
    }

    /** `closeModal(result)` on the topmost modal: dismissed, then its close callback runs. */
    fun close(result: Any? = null) {
        val record = stack.lastOrNull() ?: return
        if (record.closing) return
        record.closing = true
        stack.remove(record)
        val fragment = record.fragment
        if (fragment?.parentFragmentManager != null) fragment.dismissAllowingStateLoss()
        closed(record, result)
    }

    internal fun dismissedByUser(record: Record) {
        if (record.closing) return
        record.closing = true
        stack.remove(record)
        closed(record, null)
    }

    private fun closed(record: Record, result: Any?) {
        record.closeCallback?.invoke(result)
        Frame.forget(record.view)
        record.view.unload()
        record.owner.dispose()
        Microtasks.checkpoint()
    }

    /** `ns-modal`, the system classes, and the window-scoped classes of the root it opens over. */
    private fun modalClasses(): Set<String> = Appearance.rootClasses(modal = true).filterNot { it.startsWith("a11y-") }.toSet()

    internal fun refreshRootClasses() {
        for (record in stack) {
            val next = modalClasses()
            if (record.view.rootClasses != next) record.view.rootClasses = next
        }
    }

    private const val ID = "_domId"
}

/** `view.showModal(modalView, options)` from script; options are a script object. */
fun View.showModal(modal: Any?, options: Any? = null): View? {
    val view = modal as? View ?: return null
    val callback = jsField(options, "closeCallback")
    Modal.show(
        fullscreen = jsTruthy(jsField(options, "fullscreen")),
        animated = jsField(options, "animated")?.let { jsTruthy(it) } ?: true,
        cancelable = jsField(options, "cancelable")?.let { jsTruthy(it) } ?: true,
        closeCallback = callback?.let { function -> { result: Any? -> jsCall(function, result); Unit } },
    ) { view }
    return view
}

/** `view.closeModal(result)`: closes the topmost modal. */
fun View.closeModal(result: Any? = null) = Modal.close(result)

/** `DialogFragmentImpl`: the modal's view as the dialog's content. */
class ModalFragment : DialogFragment() {
    private val record: Modal.Record? get() = arguments?.getInt("_domId")?.let { Modal.records[it] }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (savedInstanceState != null && record == null) dismissAllowingStateLoss()
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val record = record!!
        setStyle(STYLE_NO_TITLE, 0)
        val activity = requireActivity()
        val theme = if (record.fullscreen) activity.applicationInfo.theme else theme
        val dialog = AppCompatDialog(activity, theme)
        if (record.fullscreen) org.nativescript.widgets.Utils.enableEdgeToEdge(activity, dialog.window!!)
        if (record.animated) dialog.window?.setWindowAnimations(android.R.style.Animation_Dialog)
        dialog.setCanceledOnTouchOutside(record.cancelable)
        isCancelable = record.cancelable
        return dialog
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): NativeView? {
        val record = record ?: return null
        val window = dialog!!.window!!
        window.setSoftInputMode(requireActivity().window.attributes.softInputMode)
        val view = record.view.nativeView
        (view.parent as? ViewGroup)?.removeView(view)
        return view
    }

    override fun onStart() {
        super.onStart()
        val record = record ?: return
        if (record.fullscreen) {
            val window = dialog!!.window!!
            window.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            window.setBackgroundDrawable(ColorDrawable(android.graphics.Color.WHITE))
        }
        if (!record.view.isLoaded) record.view.load()
        record.view.emit("shownModally", null)
    }

    override fun onDismiss(dialog: android.content.DialogInterface) {
        super.onDismiss(dialog)
        val record = record ?: return
        if (!requireActivity().isChangingConfigurations) Modal.dismissedByUser(record)
    }
}
