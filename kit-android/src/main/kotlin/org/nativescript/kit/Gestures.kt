package org.nativescript.kit

import android.view.GestureDetector
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.view.ViewConfiguration
import androidx.core.view.GestureDetectorCompat

// @nativescript/core's Android gestures (ui/gestures/index.android, gestures-common,
// gestures-types): one observer per handler, each with its own detector, fed by the
// view's touch listener and then by every ancestor's.

object GestureTypes {
    const val tap = 1.0
    const val doubleTap = 2.0
    const val pinch = 4.0
    const val pan = 8.0
    const val swipe = 16.0
    const val rotation = 32.0
    const val longPress = 64.0
    const val touch = 128.0
}

object GestureStateTypes {
    const val cancelled = 0.0
    const val began = 1.0
    const val changed = 2.0
    const val ended = 3.0
}

object SwipeDirection {
    const val right = 1.0
    const val left = 2.0
    const val up = 4.0
    const val down = 8.0
}

object TouchAction {
    const val down = "down"
    const val up = "up"
    const val move = "move"
    const val cancel = "cancel"
}

/** `fromString`: an event name is a gesture whatever its case. */
internal fun gestureType(name: String): Double? = when (name.trim().lowercase()) {
    "tap" -> GestureTypes.tap
    "doubletap" -> GestureTypes.doubleTap
    "pinch" -> GestureTypes.pinch
    "pan" -> GestureTypes.pan
    "swipe" -> GestureTypes.swipe
    "rotation" -> GestureTypes.rotation
    "longpress" -> GestureTypes.longPress
    "touch" -> GestureTypes.touch
    else -> null
}

/** A gesture event's data: `GestureEventData` and the fields its kind adds. */
class GestureEventPayload(val type: Double, val view: View) {
    var state: Double? = null
    var deltaX: Double? = null
    var deltaY: Double? = null
    var scale: Double? = null
    var rotation: Double? = null
    var direction: Double? = null
    var action: String? = null
    var x: (() -> Double)? = null
    var y: (() -> Double)? = null
    var focusX: (() -> Double)? = null
    var focusY: (() -> Double)? = null
    var pointerCount: (() -> Double)? = null
    var activePointers: (() -> List<Pointer>)? = null
    var allPointers: (() -> List<Pointer>)? = null
}

/** One pointer of a `touch` event, in the view's coordinates. */
class Pointer internal constructor(private val index: Int, private val event: MotionEvent) {
    fun getX(): Double = event.getX(index) / Layout.density.toDouble()
    fun getY(): Double = event.getY(index) / Layout.density.toDouble()
}

private val EventData.gesture: GestureEventPayload? get() = value as? GestureEventPayload
val EventData.type: Double get() = gesture?.type ?: Double.NaN
val EventData.state: Double get() = gesture?.state ?: Double.NaN
val EventData.deltaX: Double get() = gesture?.deltaX ?: Double.NaN
val EventData.deltaY: Double get() = gesture?.deltaY ?: Double.NaN
val EventData.scale: Double get() = gesture?.scale ?: Double.NaN
val EventData.rotation: Double get() = gesture?.rotation ?: Double.NaN
val EventData.direction: Double get() = gesture?.direction ?: Double.NaN
val EventData.action: String get() = gesture?.action ?: "undefined"
fun EventData.getX(): Double = gesture?.x?.invoke() ?: Double.NaN
fun EventData.getY(): Double = gesture?.y?.invoke() ?: Double.NaN
fun EventData.getFocusX(): Double = gesture?.focusX?.invoke() ?: Double.NaN
fun EventData.getFocusY(): Double = gesture?.focusY?.invoke() ?: Double.NaN
fun EventData.getPointerCount(): Double = gesture?.pointerCount?.invoke() ?: Double.NaN
fun EventData.getActivePointers(): JSArray<Pointer> = JSArray(gesture?.activePointers?.invoke() ?: emptyList())
fun EventData.getAllPointers(): JSArray<Pointer> = JSArray(gesture?.allPointers?.invoke() ?: emptyList())

/** `GesturesObserver`: one handler's detector, attached while its view is loaded. */
internal class GesturesObserver(val target: View, val type: Double, val callback: (GestureEventPayload) -> Unit) {
    private var notifyTouch = false
    private var simple: GestureDetectorCompat? = null
    private var scale: ScaleGestureDetector? = null
    private var swipe: GestureDetectorCompat? = null
    private var pan: PanDetector? = null
    private var rotate: RotateDetector? = null

    fun attach() {
        detach()
        val context = target.context
        when (type) {
            GestureTypes.tap, GestureTypes.doubleTap, GestureTypes.longPress -> simple = GestureDetectorCompat(context, TapListener())
            GestureTypes.pinch -> scale = ScaleGestureDetector(context, PinchListener())
            GestureTypes.swipe -> swipe = GestureDetectorCompat(context, SwipeListener())
            GestureTypes.pan -> pan = PanDetector()
            GestureTypes.rotation -> rotate = RotateDetector()
            GestureTypes.touch -> notifyTouch = true
        }
    }

    fun detach() {
        notifyTouch = false
        simple = null
        scale = null
        swipe = null
        pan = null
        rotate = null
    }

    fun onTouchEvent(event: MotionEvent) {
        if (notifyTouch) callback(touchPayload(event))
        simple?.onTouchEvent(event)
        scale?.onTouchEvent(event)
        swipe?.onTouchEvent(event)
        pan?.onTouchEvent(event)
        rotate?.onTouchEvent(event)
    }

    private fun touchPayload(e: MotionEvent): GestureEventPayload = GestureEventPayload(GestureTypes.touch, target).also { p ->
        p.action = when (e.actionMasked) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> TouchAction.down
            MotionEvent.ACTION_MOVE -> TouchAction.move
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> TouchAction.up
            MotionEvent.ACTION_CANCEL -> TouchAction.cancel
            else -> ""
        }
        val active = listOf(Pointer(e.actionIndex, e))
        p.pointerCount = { e.pointerCount.toDouble() }
        p.activePointers = { active }
        p.allPointers = { (0 until e.pointerCount).map { Pointer(it, e) } }
        p.x = { active[0].getX() }
        p.y = { active[0].getY() }
    }

    private fun tapPayload(type: Double, e: MotionEvent) = GestureEventPayload(type, target).also { p ->
        p.pointerCount = { e.pointerCount.toDouble() }
        p.x = { e.x / Layout.density.toDouble() }
        p.y = { e.y / Layout.density.toDouble() }
    }

    /** `TapAndDoubleTapGestureListener`: a tap waits for a possible double tap only when the view also observes double taps. */
    private inner class TapListener : GestureDetector.SimpleOnGestureListener() {
        private var lastUpTime = 0L
        private var tapTimeout: Double? = null

        override fun onSingleTapUp(e: MotionEvent): Boolean {
            handleSingleTap(MotionEvent.obtain(e))
            lastUpTime = System.currentTimeMillis()
            return true
        }

        override fun onDown(e: MotionEvent): Boolean {
            if (System.currentTimeMillis() - lastUpTime <= doubleTapTimeout) handleDoubleTap(e)
            return true
        }

        override fun onLongPress(e: MotionEvent) {
            if (type == GestureTypes.longPress) callback(GestureEventPayload(GestureTypes.longPress, target).also { it.state = GestureStateTypes.began })
        }

        private fun handleSingleTap(e: MotionEvent) {
            if (target.hasGestureObservers(GestureTypes.doubleTap)) {
                tapTimeout = jsSetTimeout({
                    if (type == GestureTypes.tap) callback(tapPayload(GestureTypes.tap, e))
                    jsClearTimeout(tapTimeout)
                }, doubleTapTimeout.toDouble())
            } else if (type == GestureTypes.tap) callback(tapPayload(GestureTypes.tap, e))
        }

        private fun handleDoubleTap(e: MotionEvent) {
            tapTimeout?.let { jsClearTimeout(it) }
            if (type == GestureTypes.doubleTap) callback(tapPayload(GestureTypes.doubleTap, e))
        }
    }

    private inner class PinchListener : ScaleGestureDetector.SimpleOnScaleGestureListener() {
        private var scale = 1.0

        private fun payload(detector: ScaleGestureDetector, state: Double) = GestureEventPayload(GestureTypes.pinch, target).also { p ->
            p.scale = scale
            p.state = state
            val x = detector.focusX / Layout.density.toDouble()
            val y = detector.focusY / Layout.density.toDouble()
            p.focusX = { x }
            p.focusY = { y }
        }

        override fun onScaleBegin(detector: ScaleGestureDetector): Boolean {
            scale = detector.scaleFactor.toDouble()
            callback(payload(detector, GestureStateTypes.began))
            return true
        }

        override fun onScale(detector: ScaleGestureDetector): Boolean {
            scale *= detector.scaleFactor
            callback(payload(detector, GestureStateTypes.changed))
            return true
        }

        override fun onScaleEnd(detector: ScaleGestureDetector) {
            scale *= detector.scaleFactor
            callback(payload(detector, GestureStateTypes.ended))
        }
    }

    private inner class SwipeListener : GestureDetector.SimpleOnGestureListener() {
        override fun onDown(e: MotionEvent): Boolean = true

        override fun onFling(initial: MotionEvent?, current: MotionEvent, velocityX: Float, velocityY: Float): Boolean {
            initial ?: return false
            val deltaY = current.y - initial.y
            val deltaX = current.x - initial.x
            val direction = if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD) (if (deltaX > 0) SwipeDirection.right else SwipeDirection.left) else null
            } else {
                if (Math.abs(deltaY) > SWIPE_THRESHOLD && Math.abs(velocityY) > SWIPE_VELOCITY_THRESHOLD) (if (deltaY > 0) SwipeDirection.down else SwipeDirection.up) else null
            }
            direction ?: return false
            callback(GestureEventPayload(GestureTypes.swipe, target).also { it.direction = direction })
            return true
        }
    }

    /** `CustomPanGestureDetector`: deltas from where the touch went down, in dips of the screen. */
    private inner class PanDetector {
        private var isTracking = false
        private var lastEventCache: MotionEvent? = null
        private var initialX = 0.0
        private var initialY = 0.0
        private var deltaX: Double? = null
        private var deltaY: Double? = null
        private val density = Layout.density.toDouble()

        fun onTouchEvent(event: MotionEvent) {
            when (event.actionMasked) {
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> trackStop(event, false)
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN, MotionEvent.ACTION_POINTER_UP -> trackStop(event, true)
                MotionEvent.ACTION_MOVE -> {
                    if (!isTracking) trackStart(event)
                    trackChange(event)
                }
            }
        }

        private fun payload(dx: Double?, dy: Double?, state: Double) = GestureEventPayload(GestureTypes.pan, target).also {
            it.deltaX = dx
            it.deltaY = dy
            it.state = state
        }

        private fun trackStop(event: MotionEvent, cache: Boolean) {
            if (isTracking) {
                callback(payload(deltaX, deltaY, GestureStateTypes.ended))
                deltaX = null
                deltaY = null
                isTracking = false
            }
            lastEventCache = if (cache) MotionEvent.obtain(event) else null
        }

        private fun trackStart(event: MotionEvent) {
            val (x, y) = coordinates(lastEventCache ?: event)
            initialX = x
            initialY = y
            isTracking = true
            callback(payload(0.0, 0.0, GestureStateTypes.began))
        }

        private fun trackChange(event: MotionEvent) {
            val (x, y) = coordinates(event)
            deltaX = x - initialX
            deltaY = y - initialY
            callback(payload(deltaX, deltaY, GestureStateTypes.changed))
        }

        private fun coordinates(event: MotionEvent): Pair<Double, Double> {
            val count = event.pointerCount
            if (count == 1) return Pair(event.rawX / density, event.rawY / density)
            val offX = event.rawX - event.x
            val offY = event.rawY - event.y
            var x = 0.0
            var y = 0.0
            for (i in 0 until count) {
                x += event.getX(i) + offX
                y += event.getY(i) + offY
            }
            return Pair(x / (count * density), y / (count * density))
        }
    }

    /** `CustomRotateGestureDetector`: the angle between the first two pointers, in degrees from where it began. */
    private inner class RotateDetector {
        private var first = INVALID
        private var second = INVALID
        private var angle = 0.0
        private var initialAngle = 0.0
        private val isTracking get() = first != INVALID && second != INVALID

        fun onTouchEvent(event: MotionEvent) {
            val pointer = event.getPointerId(event.actionIndex)
            val wasTracking = isTracking
            when (event.actionMasked) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    var assigned = false
                    if (first == INVALID && pointer != second) { first = pointer; assigned = true }
                    else if (second == INVALID && pointer != first) { second = pointer; assigned = true }
                    if (assigned && isTracking) {
                        angle = 0.0
                        initialAngle = pointersAngle(event)
                        emit(GestureStateTypes.began)
                    }
                }
                MotionEvent.ACTION_MOVE -> if (isTracking) {
                    var result = ((pointersAngle(event) - initialAngle) * 180 / Math.PI) % 360
                    if (result < -180) result += 360
                    if (result > 180) result -= 360
                    angle = result
                    emit(GestureStateTypes.changed)
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    if (pointer == first) first = INVALID else if (pointer == second) second = INVALID
                    if (wasTracking && !isTracking) emit(GestureStateTypes.ended)
                }
                MotionEvent.ACTION_CANCEL -> {
                    first = INVALID
                    second = INVALID
                    if (wasTracking) emit(GestureStateTypes.cancelled)
                }
            }
        }

        private fun emit(state: Double) = callback(GestureEventPayload(GestureTypes.rotation, target).also {
            it.rotation = angle
            it.state = state
        })

        private fun pointersAngle(event: MotionEvent): Double {
            val a = event.findPointerIndex(first)
            val b = event.findPointerIndex(second)
            return Math.atan2((event.getY(b) - event.getY(a)).toDouble(), (event.getX(b) - event.getX(a)).toDouble())
        }
    }

    private companion object {
        const val SWIPE_THRESHOLD = 100
        const val SWIPE_VELOCITY_THRESHOLD = 100
        const val INVALID = -1
        val doubleTapTimeout: Long get() = ViewConfiguration.getDoubleTapTimeout().toLong()
    }
}
