import UIKit

/// `GestureEvents` from gestures-types.
public enum GestureEvents {
    public static let gestureAttached: String = "gestureAttached"
    public static let touchDown: String = "touchDown"
    public static let touchUp: String = "touchUp"
}

/// `TouchAnimationTypes` from touch-manager.
public enum TouchAnimationTypes {
    public static let up: String = "up"
    public static let down: String = "down"
}

/// `TouchManager` from ui/gestures/touch-manager (iOS): down and up animations
/// for a view's touches, from its `touchAnimation` or `TouchManager.animations`.
public enum TouchManager {
    /// Views with a tap listener get the animations when they load.
    public static var enableGlobalTapAnimations = false
    /// `{ down, up }`, each an animation definition (without `target`) or a function of the view.
    public static var animations: Any?
    /// The target-action handlers of controls; UIControl does not retain its targets.
    public static var touchHandlers: [(view: View, handler: NSObject)]?
    /// One animation per view and type, played again on each touch.
    static var touchAnimationDefinitions: [(view: View, type: String, animation: Animation)]?

    /// view-common `onLoaded`, before `super.onLoaded()`.
    static func viewLoading(_ view: View) {
        let hasTap = view.hasListeners("tap") || view.hasListeners("tapChange") || view.gestureObservers.contains { $0.type == GestureTypes.tap }
        let enableTapAnimations = enableGlobalTapAnimations && hasTap
        if !booleanConverter(view.get("ignoreTouchAnimation")) && (jsTruthy(touchAnimation(view)) || enableTapAnimations) {
            addAnimations(view)
        }
    }

    /// `addAnimations`: a control animates on its touch events, any other view
    /// on a long press that begins as soon as it is touched (after `touchDelay`).
    public static func addAnimations(_ view: View) {
        let handleDown = jsTruthy(member(touchAnimation(view), TouchAnimationTypes.down)) || jsTruthy(member(animations, TouchAnimationTypes.down))
        let handleUp = jsTruthy(member(touchAnimation(view), TouchAnimationTypes.up)) || jsTruthy(member(animations, TouchAnimationTypes.up))
        installDisposeHook()
        if let control = view.nativeView as? UIControl {
            let handler = TouchControlHandler(view)
            if touchHandlers == nil { touchHandlers = [] }
            touchHandlers!.append((view, handler))
            if handleDown {
                control.addTarget(handler, action: #selector(TouchControlHandler.touchDown(_:)), for: [.touchDown, .touchDragEnter])
                view.on(GestureEvents.touchDown) { [weak view] _ in startAnimationForType(view, TouchAnimationTypes.down) }
            }
            if handleUp {
                control.addTarget(handler, action: #selector(TouchControlHandler.touchUp(_:)), for: [.touchDragExit, .touchCancel, .touchUpInside, .touchUpOutside])
                view.on(GestureEvents.touchUp) { [weak view] _ in startAnimationForType(view, TouchAnimationTypes.up) }
            }
        } else if handleDown || handleUp {
            view.on(GestureEvents.gestureAttached) { args in
                guard jsStrictEquals(args[jsKey: "type"], GestureTypes.longPress), let recognizer = args[jsKey: "ios"] as? UILongPressGestureRecognizer else { return }
                let delay = (args.object as? View).map { toDouble($0.get("touchDelay")) ?? .nan } ?? .nan
                recognizer.minimumPressDuration = delay.isNaN ? 0 : delay
            }
            view.on("longPress") { args in
                let target = (args.value as? GestureEventPayload)?.view
                switch args.state {
                case GestureStateTypes.began:
                    if handleDown { startAnimationForType(target, TouchAnimationTypes.down) }
                case GestureStateTypes.cancelled, GestureStateTypes.ended:
                    if handleUp { startAnimationForType(target, TouchAnimationTypes.up) }
                default:
                    break
                }
            }
        }
    }

    /// `startAnimationForType`: the view's own definition wins over the global
    /// one. Touch animations of the view are cancelled first; one already
    /// created for this type is played again.
    public static func startAnimationForType(_ view: View?, _ type: String) {
        guard let view else { return }
        func animate(_ definition: Any?) {
            guard jsTruthy(jsFlat(definition)) else { return }
            if let function = jsFlat(definition) as? JSFunction {
                jsReport { _ = try function([view]) }
                return
            }
            if touchAnimationDefinitions == nil { touchAnimationDefinitions = [] }
            var touchAnimation: Animation?
            for d in touchAnimationDefinitions! where d.view === view {
                d.animation.cancel()
                if d.type == type { touchAnimation = d.animation }
            }
            if touchAnimation == nil {
                let object = JSObject([("target", view)])
                if let source = jsFlat(definition) as? JSDynamic {
                    for key in source.jsKeys { object[key] = source[jsKey: key] }
                }
                let created = Animation(JSArray<Any?>([object]))
                touchAnimationDefinitions!.append((view, type, created))
                touchAnimation = created
            }
            touchAnimation!.play().catch { _ in }
        }
        let own = touchAnimation(view)
        if isObject(own), jsTruthy(jsFlat(member(own, type))) {
            animate(member(own, type))
        } else if jsTruthy(jsFlat(member(animations, type))) {
            animate(member(animations, type))
        }
    }

    /// `touchAnimation` as its converter leaves it: an object, or a string read as a boolean.
    private static func touchAnimation(_ view: View) -> Any? {
        let value = jsFlat(view.get("touchAnimation"))
        if let string = value as? String { return booleanConverter(string) }
        return value
    }

    /// `value[key]`, undefined on anything but an object.
    private static func member(_ value: Any?, _ key: String) -> Any? {
        (jsFlat(value) as? JSDynamic)?[jsKey: key]
    }

    /// utils/types `isObject`.
    private static func isObject(_ value: Any?) -> Bool {
        let v = jsFlat(value)
        return v != nil && !(v is JSNull) && jsTypeof(v) == "object"
    }

    private static var isDisposeHookInstalled = false

    /// The `disposeNativeView` listener: a disposed view's handlers and animations are dropped.
    private static func installDisposeHook() {
        guard !isDisposeHookInstalled else { return }
        isDisposeHookInstalled = true
        View.lifecycleHooks.append(View.LifecycleHook(disposeNativeView: { view in
            if let index = touchHandlers?.firstIndex(where: { $0.view === view }) { touchHandlers!.remove(at: index) }
            touchAnimationDefinitions = touchAnimationDefinitions?.filter { $0.view !== view }
        }))
    }
}

/// `TouchControlHandler`: a control's touch events as the view's `touchDown` and `touchUp`.
final class TouchControlHandler: NSObject {
    private weak var owner: View?

    init(_ owner: View) { self.owner = owner }

    @objc func touchDown(_ sender: Any?) { notify(GestureEvents.touchDown, sender) }
    @objc func touchUp(_ sender: Any?) { notify(GestureEvents.touchUp, sender) }

    private func notify(_ eventName: String, _ data: Any?) {
        guard let owner else { return }
        owner.notify(JSObject([("eventName", eventName), ("object", owner), ("data", data)]))
        Microtasks.checkpoint()
    }
}
