import UIKit

/// `CubicBezierAnimationCurve`, what `CoreTypes.AnimationCurve.cubicBezier()` returns.
public final class CubicBezierAnimationCurve {
    public var x1: Double, y1: Double, x2: Double, y2: Double

    public init(_ x1: Double, _ y1: Double, _ x2: Double, _ y2: Double) {
        (self.x1, self.y1, self.x2, self.y2) = (x1, y1, x2, y2)
    }
}

// Animations from script: definitions are script objects, read as
// animation-common's `_createPropertyAnimations` reads them, and `play()`
// returns the promise `AnimationBase.play` does.
extension Animation {
    /// `new Animation(definitions, playSequentially)`.
    public convenience init(_ definitions: JSArray<Any?>, _ playSequentially: Bool? = nil) {
        self.init(definitions.storage.compactMap { AnimationDefinition(script: $0) }, playSequentially: playSequentially ?? false)
    }

    /// `play()`: fulfilled when every property animation finishes. A cancelled
    /// animation's promise never settles and the animation stays playing, as on
    /// iOS, so playing it again is rejected.
    public func play(_ resetOnFinish: Bool? = nil) -> JSPromise<Void> {
        if isPlaying { return JSPromise { _, reject in reject("Animation is already playing.") } }
        return JSPromise { resolve, _ in self.start { resolve(()) } }
    }
}

extension View {
    /// `view.animate(definition)`: its promise's `cancel()` cancels the animation.
    public func animate(_ definition: Any?) -> JSPromise<Void> {
        let animation = createAnimation(definition)
        let promise = animation.play()
        promise.canceler = { animation.cancel() }
        return promise
    }

    /// `view.createAnimation(definition)`.
    public func createAnimation(_ definition: Any?) -> Animation {
        Animation(AnimationDefinition(script: definition, target: self).map { [$0] } ?? [])
    }
}

extension AnimationDefinition {
    /// A script object's animated properties; nil where core logs an invalid value and animates nothing.
    /// `target` stands for the object's own (`createAnimation` sets it).
    init?(script value: Any?, target: View? = nil) {
        func field(_ key: String) -> Any? {
            guard let value else { return nil }
            return (try? jsGet(value, key)) ?? nil
        }
        func number(_ key: String) -> Double?? {
            guard let raw = field(key) else { return .some(nil) }
            guard let n = raw as? Double else {
                jsError("Property \(key) must be valid number. Value: \(jsToString(raw))")
                return nil
            }
            return .some(n)
        }
        func pair(_ key: String) -> (x: Double, y: Double)?? {
            guard let raw = field(key) else { return .some(nil) }
            guard let x = (try? jsGet(raw, "x")) as? Double, let y = (try? jsGet(raw, "y")) as? Double else {
                jsError("Property \(key) must be valid Pair. Value: \(jsToString(raw))")
                return nil
            }
            return .some((x, y))
        }
        self.init(target: target ?? field("target") as? View)
        guard self.target != nil else {
            jsError("No animation target specified.")
            return nil
        }
        guard let opacity = number("opacity"), let duration = number("duration"), let delay = number("delay"),
              let iterations = number("iterations"), let translate = pair("translate"), let scale = pair("scale") else { return nil }
        (self.opacity, self.duration, self.delay, self.iterations, self.translate, self.scale) = (opacity, duration, delay, iterations, translate, scale)
        if let color = field("backgroundColor") {
            if let c = color as? Color { backgroundColor = c.ios }
            else if let s = color as? String, let c = Color(s) { backgroundColor = c.ios }
            else {
                jsError("Property backgroundColor must be valid color. Value: \(jsToString(color))")
                return nil
            }
        }
        if let rotate = field("rotate") {
            if let z = rotate as? Double {
                self.rotate = (0, 0, z)
            } else if let x = (try? jsGet(rotate, "x")) as? Double, let y = (try? jsGet(rotate, "y")) as? Double, let z = (try? jsGet(rotate, "z")) as? Double {
                self.rotate = (x, y, z)
            } else {
                jsError("Property \(jsToString(rotate)) must be valid number or Point3D. Value: \(jsToString(rotate))")
                return nil
            }
        }
        width = field("width")
        height = field("height")
        if let curve = field("curve") { self.curve = AnimationDefinition.resolveCurve(curve) }
    }

    /// `_resolveAnimationCurve`.
    static func resolveCurve(_ curve: Any?) -> AnimationCurve? {
        switch curve {
        case let name as String where ["easeIn", "easeOut", "easeInOut", "linear", "spring", "ease"].contains(name):
            return ["easeIn": .easeIn, "easeOut": .easeOut, "easeInOut": .easeInOut, "linear": .linear, "spring": .spring, "ease": .ease][name]
        case let bezier as CubicBezierAnimationCurve:
            return .cubicBezier(bezier.x1, bezier.y1, bezier.x2, bezier.y2)
        default:
            jsError("Invalid animation curve: \(jsToString(curve))")
            return nil
        }
    }
}
