import UIKit

/// `TouchManager` from ui/gestures/touch-manager: down and up animations on
/// views that are tapped. With `enableGlobalTapAnimations`, every view with a
/// tap listener gets them when it loads, unless it sets `ignoreTouchAnimation`;
/// a view's own `touchAnimation` comes before `animations`.
public enum TouchManager {
    public static var enableGlobalTapAnimations: Bool = false
    /// `{ down, up }`: animation definitions without a target, or functions given the view.
    public static var animations: Any?

    private static var definitions: [(view: Weak<View>, type: String, animation: Animation)] = []
    private static var controlHandlers: [ControlHandler] = []

    /// `ViewCommon.onLoaded`'s check, then `addAnimations`.
    static func viewLoading(_ view: View) {
        let hasTap = view.hasListeners("tap") || view.hasListeners("tapChange")
        let own = view.applied["touchAnimation"]
        guard toBool(view.applied["ignoreTouchAnimation"]) != true, isOn(own) || (enableGlobalTapAnimations && hasTap) else { return }
        addAnimations(view)
    }

    private static func isOn(_ value: Any?) -> Bool {
        guard let value else { return false }
        if value is JSDynamic { return true }
        return toBool(value) ?? false
    }

    private static func definition(_ view: View, _ type: String) -> Any? {
        if let own = view.applied["touchAnimation"], own is JSDynamic, let found = (try? jsGet(own, type)) ?? nil { return found }
        guard let animations else { return nil }
        return (try? jsGet(animations, type)) ?? nil
    }

    static func addAnimations(_ view: View) {
        let handleDown = definition(view, "down") != nil
        let handleUp = definition(view, "up") != nil
        if let control = view.nativeView as? UIControl {
            let handler = ControlHandler(view)
            controlHandlers.removeAll { $0.view == nil }
            controlHandlers.append(handler)
            if handleDown { control.addTarget(handler, action: #selector(ControlHandler.down), for: [.touchDown, .touchDragEnter]) }
            if handleUp { control.addTarget(handler, action: #selector(ControlHandler.up), for: [.touchDragExit, .touchCancel, .touchUpInside, .touchUpOutside]) }
        } else if handleDown || handleUp {
            view.on("longPress") { [weak view] event in
                guard let view, let state = (event.value as? GestureEventPayload)?.state else { return }
                switch state {
                case GestureStateTypes.began: if handleDown { startAnimation(view, "down") }
                case GestureStateTypes.cancelled, GestureStateTypes.ended: if handleUp { startAnimation(view, "up") }
                default: break
                }
            }
            let delay = toDouble(view.applied["touchDelay"]) ?? 0
            for observer in view.gestureObservers where observer.eventName == "longPress" {
                for case let press as UILongPressGestureRecognizer in observer.recognizers { press.minimumPressDuration = delay / 1000 }
            }
        }
    }

    /// `startAnimationForType`: cancels the view's touch animations in progress, then plays (or replays) this type's.
    static func startAnimation(_ view: View, _ type: String) {
        guard let definition = definition(view, type) else { return }
        if jsFlat(definition) is JSFunction {
            _ = try? jsCall(definition, view)
            return
        }
        definitions.removeAll { $0.view.value == nil }
        var touchAnimation: Animation?
        for d in definitions where d.view.value === view {
            d.animation.cancel()
            if d.type == type { touchAnimation = d.animation }
        }
        if touchAnimation == nil {
            let animation = Animation(AnimationDefinition(script: definition, target: view).map { [$0] } ?? [])
            definitions.append((Weak(view), type, animation))
            touchAnimation = animation
        }
        _ = touchAnimation!.play().catch { _ in }
    }

    private final class ControlHandler: NSObject {
        weak var view: View?
        init(_ view: View) { self.view = view }
        @objc func down() { if let view { startAnimation(view, "down") } }
        @objc func up() { if let view { startAnimation(view, "up") } }
    }
}
