package org.nativescript.kit

import android.content.Context
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import org.nativescript.widgets.CommonLayoutParams
import org.nativescript.widgets.Utils

/**
 * `com.tns.NativeScriptActivity` without the JavaScript runtime: the launch
 * theme swapped for `SET_THEME_ON_LAUNCH`, edge-to-edge system bars, the
 * app's CSS parsed once, and the root view as the content view.
 */
abstract class NativeScriptActivity : AppCompatActivity() {
    abstract val css: String

    abstract fun root(): View

    private var rootView: View? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        // A NativeScript app rebuilds its views on a fresh start rather than restoring fragments.
        super.onCreate(null)
        current = this
        setThemeOnLaunch()
        Utils.enableEdgeToEdge(this, 0, 0, LIGHT_SCRIM, DARK_SCRIM)
        installEventLoop()
        StyleSheet.app = StyleSheet.parse(css)
        val root = root()
        rootView = root
        setContentView(root.nativeView, CommonLayoutParams())
        Appearance.refresh(root)
        root.load()
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val frame = Frame.topmost()
                if (frame != null && frame.canGoBack) {
                    frame.goBack()
                    return
                }
                isEnabled = false
                onBackPressedDispatcher.onBackPressed()
                isEnabled = true
            }
        })
    }

    override fun onConfigurationChanged(newConfig: android.content.res.Configuration) {
        super.onConfigurationChanged(newConfig)
        rootView?.let { Appearance.refresh(it) }
        Modal.refreshRootClasses()
    }

    /**
     * Timers run from the main looper, and promise jobs run after each batch
     * of its work: when an event handler returns and whenever the queue idles.
     */
    private fun installEventLoop() {
        val handler = android.os.Handler(android.os.Looper.getMainLooper())
        val tick = Runnable {
            JSEventLoop.processTimers()
            Microtasks.checkpoint()
        }
        JSEventLoop.host = { delay ->
            handler.removeCallbacks(tick)
            if (delay != null) handler.postDelayed(tick, Math.ceil(delay).toLong())
        }
        android.os.Looper.myQueue().addIdleHandler {
            Microtasks.checkpoint()
            true
        }
    }

    private fun setThemeOnLaunch() {
        val info = packageManager.getActivityInfo(componentName, PackageManager.GET_META_DATA)
        val theme = info.metaData?.getInt("SET_THEME_ON_LAUNCH", -1) ?: -1
        if (theme != -1) setTheme(theme)
    }

    companion object {
        lateinit var current: NativeScriptActivity
            private set

        val context: Context get() = current

        // The navigation bar scrims core passes to EdgeToEdge, as the platform's own.
        private const val LIGHT_SCRIM = 0xe6ffffff.toInt()
        private const val DARK_SCRIM = 0x801b1b1b.toInt()
    }
}
