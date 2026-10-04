import UIKit
import UIKit.UIGestureRecognizerSubclass

// @nativescript/core's iOS gestures (ui/gestures/index.ios, gestures-common, gestures-types):
// one observer per subscribed gesture, its UIKit recognizers sharing one delegate.

public enum GestureTypes {
    public static let tap = 1.0, doubleTap = 2.0, pinch = 4.0, pan = 8.0, swipe = 16.0, rotation = 32.0, longPress = 64.0, touch = 128.0
}

public enum GestureStateTypes {
    public static let cancelled = 0.0, began = 1.0, changed = 2.0, ended = 3.0
}

public enum SwipeDirection {
    public static let right = 1.0, left = 2.0, up = 4.0, down = 8.0
}

public enum TouchAction {
    public static let down = "down", up = "up", move = "move", cancel = "cancel"
}

/// `fromString`: an event name is a gesture whatever its case.
func gestureType(_ name: String) -> Double? {
    switch name.trimmingCharacters(in: .whitespaces).lowercased() {
    case "tap": return GestureTypes.tap
    case "doubletap": return GestureTypes.doubleTap
    case "pinch": return GestureTypes.pinch
    case "pan": return GestureTypes.pan
    case "swipe": return GestureTypes.swipe
    case "rotation": return GestureTypes.rotation
    case "longpress": return GestureTypes.longPress
    case "touch": return GestureTypes.touch
    default: return nil
    }
}

/// A gesture event's data: `GestureEventData` and the fields its kind adds.
/// Absent fields read as JavaScript's `undefined` would as a number.
public final class GestureEventPayload: EventPayload {
    public let type: Double
    public let view: View
    var state: Double?
    var deltaX: Double?, deltaY: Double?, scale: Double?, rotation: Double?, direction: Double?
    var action: String?
    var x: (() -> Double)?, y: (() -> Double)?, focusX: (() -> Double)?, focusY: (() -> Double)?
    var pointerCount: (() -> Double)?
    var activePointers: (() -> [Pointer])?, allPointers: (() -> [Pointer])?

    init(type: Double, view: View) {
        self.type = type
        self.view = view
    }
}

/// One touch of a `touch` event; its location is read once, in the view.
public final class Pointer {
    private let touch: UITouch
    private let view: View
    private lazy var location: CGPoint = touch.location(in: view.nativeView)

    init(_ touch: UITouch, _ view: View) {
        self.touch = touch
        self.view = view
    }

    public func getX() -> Double { Double(location.x) }
    public func getY() -> Double { Double(location.y) }
}

extension EventData {
    private var gesture: GestureEventPayload? { value as? GestureEventPayload }
    public var type: Double { gesture?.type ?? .nan }
    public var state: Double { gesture?.state ?? .nan }
    public var deltaX: Double { gesture?.deltaX ?? .nan }
    public var deltaY: Double { gesture?.deltaY ?? .nan }
    public var scale: Double { gesture?.scale ?? .nan }
    public var rotation: Double { gesture?.rotation ?? .nan }
    public var direction: Double { gesture?.direction ?? .nan }
    public var action: String { gesture?.action ?? "undefined" }
    public func getX() -> Double { gesture?.x?() ?? .nan }
    public func getY() -> Double { gesture?.y?() ?? .nan }
    public func getFocusX() -> Double { gesture?.focusX?() ?? .nan }
    public func getFocusY() -> Double { gesture?.focusY?() ?? .nan }
    public func getPointerCount() -> Double { gesture?.pointerCount?() ?? .nan }
    public func getActivePointers() -> JSArray<Pointer> { JSArray(gesture?.activePointers?() ?? []) }
    public func getAllPointers() -> JSArray<Pointer> { JSArray(gesture?.allPointers?() ?? []) }
}

extension View {
    /// `ViewCommon._observe`: a gesture event's first subscription adds its observer.
    func observeGesture(_ event: String) {
        guard let type = gestureType(event), !gestureObservers.contains(where: { $0.eventName == event }) else { return }
        let observer = GesturesObserver(target: self, type: type, eventName: event)
        gestureObservers.append(observer)
        observer.attach()
    }
}

/// Every recognizer recognizes alongside the others; a tap waits for a double tap to fail.
private final class GestureRecognizerDelegate: NSObject, UIGestureRecognizerDelegate {
    static let shared = GestureRecognizerDelegate()

    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        true
    }

    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRequireFailureOf otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        gestureRecognizer is UITapGestureRecognizer && (otherGestureRecognizer as? UITapGestureRecognizer)?.numberOfTapsRequired == 2
    }
}

final class GesturesObserver: NSObject {
    private weak var target: View?
    let type: Double
    let eventName: String
    private(set) var recognizers: [UIGestureRecognizer] = []

    init(target: View, type: Double, eventName: String) {
        self.target = target
        self.type = type
        self.eventName = eventName
    }

    func attach() {
        guard let nativeView = target?.nativeView else { return }
        if type == GestureTypes.swipe {
            for direction: UISwipeGestureRecognizer.Direction in [.down, .left, .right, .up] {
                let recognizer = UISwipeGestureRecognizer(target: self, action: #selector(recognize))
                recognizer.direction = direction
                add(recognizer, to: nativeView)
            }
            return
        }
        let recognizer: UIGestureRecognizer
        switch type {
        case GestureTypes.tap: recognizer = UITapGestureRecognizer(target: self, action: #selector(recognize))
        case GestureTypes.doubleTap:
            let tap = UITapGestureRecognizer(target: self, action: #selector(recognize))
            tap.numberOfTapsRequired = 2
            recognizer = tap
        case GestureTypes.pinch: recognizer = UIPinchGestureRecognizer(target: self, action: #selector(recognize))
        case GestureTypes.pan: recognizer = UIPanGestureRecognizer(target: self, action: #selector(recognize))
        case GestureTypes.rotation: recognizer = UIRotationGestureRecognizer(target: self, action: #selector(recognize))
        case GestureTypes.longPress: recognizer = UILongPressGestureRecognizer(target: self, action: #selector(recognize))
        default:
            let touch = TouchGestureRecognizer(target: self, action: #selector(recognize))
            touch.observer = self
            recognizer = touch
        }
        add(recognizer, to: nativeView)
    }

    /// `_createRecognizer`: `gestureAttached` announces the recognizer before it is added.
    private func add(_ recognizer: UIGestureRecognizer, to nativeView: UIView) {
        recognizer.delegate = GestureRecognizerDelegate.shared
        recognizers.append(recognizer)
        if let target, target.hasListeners(GestureEvents.gestureAttached) {
            target.notify(JSObject([("eventName", GestureEvents.gestureAttached), ("object", target), ("type", type), ("view", target), ("ios", recognizer)]))
        }
        nativeView.addGestureRecognizer(recognizer)
    }

    @objc private func recognize(_ recognizer: UIGestureRecognizer) {
        guard let target else { return }
        let data = GestureEventPayload(type: type, view: target)
        let nativeView = target.nativeView
        switch type {
        case GestureTypes.tap, GestureTypes.doubleTap:
            let center = recognizer.location(in: nativeView)
            data.pointerCount = { Double(recognizer.numberOfTouches) }
            data.x = { Double(center.x) }
            data.y = { Double(center.y) }
        case GestureTypes.pinch:
            let pinch = recognizer as! UIPinchGestureRecognizer
            let center = recognizer.location(in: nativeView)
            data.scale = Double(pinch.scale)
            data.focusX = { Double(center.x) }
            data.focusY = { Double(center.y) }
            data.state = state(recognizer)
        case GestureTypes.pan:
            let translation = (recognizer as! UIPanGestureRecognizer).translation(in: nativeView)
            data.deltaX = Double(translation.x)
            data.deltaY = Double(translation.y)
            data.state = state(recognizer)
        case GestureTypes.swipe:
            data.direction = direction((recognizer as! UISwipeGestureRecognizer).direction)
        case GestureTypes.rotation:
            data.rotation = Double((recognizer as! UIRotationGestureRecognizer).rotation) * (180.0 / Double.pi)
            data.state = state(recognizer)
        case GestureTypes.longPress:
            data.state = state(recognizer)
        default:
            break
        }
        target.emit(eventName, data)
    }

    /// `TouchGestureRecognizer.executeCallback`: `TouchGestureEventData.prepare`.
    fileprivate func touched(_ action: String, _ touches: Set<UITouch>, _ event: UIEvent) {
        guard let target else { return }
        let data = GestureEventPayload(type: GestureTypes.touch, view: target)
        data.action = action
        let main = touches.first
        // A scroll view's location is in its content; core reports it in the visible bounds.
        let offset = { (target.nativeView as? UIScrollView)?.contentOffset ?? .zero }
        data.x = { Double((main?.location(in: target.nativeView).x ?? 0) - offset().x) }
        data.y = { Double((main?.location(in: target.nativeView).y ?? 0) - offset().y) }
        data.pointerCount = { Double(event.allTouches?.count ?? 0) }
        var active: [Pointer]?, all: [Pointer]?
        data.activePointers = {
            if active == nil { active = touches.map { Pointer($0, target) } }
            return active!
        }
        data.allPointers = {
            if all == nil { all = (event.allTouches ?? []).map { Pointer($0, target) } }
            return all!
        }
        target.emit(eventName, data)
    }

    private func state(_ recognizer: UIGestureRecognizer) -> Double? {
        switch recognizer.state {
        case .began: return GestureStateTypes.began
        case .cancelled, .failed: return GestureStateTypes.cancelled
        case .changed: return GestureStateTypes.changed
        case .ended: return GestureStateTypes.ended
        default: return nil
        }
    }

    private func direction(_ direction: UISwipeGestureRecognizer.Direction) -> Double? {
        switch direction {
        case .down: return SwipeDirection.down
        case .left: return SwipeDirection.left
        case .right: return SwipeDirection.right
        case .up: return SwipeDirection.up
        default: return nil
        }
    }
}

/// Reports every touch phase and passes the touches on to its view; it never
/// leaves the possible state, so it never blocks or fires its action.
private final class TouchGestureRecognizer: UIGestureRecognizer {
    weak var observer: GesturesObserver?

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent) {
        observer?.touched(TouchAction.down, touches, event)
        view?.touchesBegan(touches, with: event)
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent) {
        observer?.touched(TouchAction.move, touches, event)
        view?.touchesMoved(touches, with: event)
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent) {
        observer?.touched(TouchAction.up, touches, event)
        view?.touchesEnded(touches, with: event)
    }

    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent) {
        observer?.touched(TouchAction.cancel, touches, event)
        view?.touchesCancelled(touches, with: event)
    }
}

/// `GestureEvents` from gestures-types.
public enum GestureEvents {
    public static let gestureAttached: String = "gestureAttached"
    public static let touchDown: String = "touchDown"
    public static let touchUp: String = "touchUp"
}
