import UIKit

/// `CoreTypes.AnimationCurve`.
public enum AnimationCurve: Equatable {
    case ease, easeIn, easeOut, easeInOut, linear, spring
    case cubicBezier(Double, Double, Double, Double)

    /// `animationTimingFunctionConverter`: CSS names and `cubic-bezier()`, coordinates clamped to 0...1.
    init?(css value: String) {
        switch value {
        case "ease": self = .ease
        case "linear": self = .linear
        case "ease-in": self = .easeIn
        case "ease-out": self = .easeOut
        case "ease-in-out": self = .easeInOut
        case "spring": self = .spring
        default:
            guard value.hasPrefix("cubic-bezier"), let open = value.firstIndex(of: "("), let close = value[open...].firstIndex(of: ")") else { return nil }
            let coords = value[value.index(after: open)..<close].split(separator: ",").map { min(max(parseFloat(String($0)) ?? .nan, 0), 1) }
            guard coords.count == 4 else { return nil }
            self = .cubicBezier(coords[0], coords[1], coords[2], coords[3])
        }
    }

    /// `_resolveAnimationCurve`; a spring has no timing function.
    var timingFunction: CAMediaTimingFunction? {
        switch self {
        case .ease: return CAMediaTimingFunction(controlPoints: 0.25, 0.1, 0.25, 1.0)
        case .easeIn: return CAMediaTimingFunction(name: .easeIn)
        case .easeOut: return CAMediaTimingFunction(name: .easeOut)
        case .easeInOut: return CAMediaTimingFunction(name: .easeInEaseOut)
        case .linear: return CAMediaTimingFunction(name: .linear)
        case .spring: return nil
        case let .cubicBezier(x1, y1, x2, y2): return CAMediaTimingFunction(controlPoints: Float(x1), Float(y1), Float(x2), Float(y2))
        }
    }
}

/// `AnimationDefinition`; durations and delays in milliseconds.
public struct AnimationDefinition {
    public weak var target: View?
    public var opacity: Double?
    public var backgroundColor: UIColor?
    public var translate: (x: Double, y: Double)?
    public var scale: (x: Double, y: Double)?
    public var rotate: (x: Double, y: Double, z: Double)?
    public var width: Any?
    public var height: Any?
    public var duration: Double?
    public var delay: Double?
    public var iterations: Double?
    public var curve: AnimationCurve?
    /// Keyframe animations set `keyframe:` values; others set local ones.
    var fromKeyframe = false

    public init(target: View?) { self.target = target }
}

/// One animated property of an `Animation` (`PropertyAnimation`).
final class PropertyAnimation {
    enum Property: Equatable { case opacity, backgroundColor, translate, scale, rotate, width, height, transform }

    weak var target: View?
    let property: Property
    var opacity = 0.0
    var color: UIColor?
    var pair = (x: 0.0, y: 0.0)
    var point = (x: 0.0, y: 0.0, z: 0.0)
    var length: Any?
    /// For a merged `_transform`: its translate and scale parts.
    var transformTranslate: (x: Double, y: Double)?
    var transformScale: (x: Double, y: Double)?
    var duration: Double?, delay: Double?, iterations: Double?
    var curve: AnimationCurve?
    var skip = false
    var resetCallback: (() -> Void)?

    init(target: View?, property: Property, from definition: AnimationDefinition) {
        self.target = target
        self.property = property
        duration = definition.duration
        delay = definition.delay
        iterations = definition.iterations
        curve = definition.curve
    }

    var isAffineTransform: Bool { property == .transform || property == .translate || property == .scale }

    func canBeMerged(with other: PropertyAnimation) -> Bool {
        isAffineTransform && other.isAffineTransform && target === other.target && duration == other.duration
            && delay == other.delay && iterations == other.iterations && curve == other.curve
    }
}

/// `CAAnimationDelegate` of animation/index.ios: the start sets the final values, the stop reports.
private final class AnimationDelegate: NSObject, CAAnimationDelegate {
    let animation: PropertyAnimation
    let fromKeyframe: Bool
    let finished: ((Bool) -> Void)?
    var next: (() -> Void)?

    init(_ animation: PropertyAnimation, fromKeyframe: Bool, finished: ((Bool) -> Void)?) {
        self.animation = animation
        self.fromKeyframe = fromKeyframe
        self.finished = finished
    }

    func animationDidStart(_ anim: CAAnimation) {
        guard let target = animation.target else { return }
        let set = { (name: String, value: Any?) in Animation.setValue(target, name, value, fromKeyframe: self.fromKeyframe) }
        target.presentationLayerSuspensions += 1
        switch animation.property {
        case .backgroundColor: set("backgroundColor", animation.color)
        case .opacity: set("opacity", animation.opacity)
        case .rotate:
            set("rotateX", animation.point.x)
            set("rotateY", animation.point.y)
            set("rotate", animation.point.z)
        case .translate:
            set("translateX", animation.pair.x)
            set("translateY", animation.pair.y)
        case .height: set("height", animation.length)
        case .width: set("width", animation.length)
        case .scale:
            set("scaleX", animation.pair.x == 0 ? 0.001 : animation.pair.x)
            set("scaleY", animation.pair.y == 0 ? 0.001 : animation.pair.y)
        case .transform:
            if let t = animation.transformTranslate {
                set("translateX", t.x)
                set("translateY", t.y)
            }
            if let s = animation.transformScale {
                set("scaleX", s.x == 0 ? 0.001 : s.x)
                set("scaleY", s.y == 0 ? 0.001 : s.y)
            }
        }
        target.presentationLayerSuspensions -= 1
    }

    func animationDidStop(_ anim: CAAnimation, finished flag: Bool) {
        finished?(!flag)
        if flag { next?() }
    }
}

/// `Animation` from animation/index.ios: Core Animation for each property,
/// played together or in sequence. Its completion runs when every property
/// animation finishes; a cancelled animation never completes, as on iOS.
public final class Animation {
    private let propertyAnimations: [PropertyAnimation]
    private let playSequentially: Bool
    private let fromKeyframe: Bool
    private var finishedAnimations = 0
    private var cancelledAnimations = 0
    private var completion: (() -> Void)?
    public private(set) var isPlaying = false

    public init(_ definitions: [AnimationDefinition], playSequentially: Bool = false) {
        fromKeyframe = definitions.first?.fromKeyframe ?? false
        var animations: [PropertyAnimation] = []
        for definition in definitions { animations += Animation.createPropertyAnimations(definition) }
        self.playSequentially = playSequentially
        propertyAnimations = playSequentially ? animations : Animation.mergeAffineTransformAnimations(animations)
    }

    /// `play`; an animation already playing is not restarted.
    public func play(_ completion: (() -> Void)? = nil) {
        guard !isPlaying, !propertyAnimations.isEmpty else { return }
        isPlaying = true
        self.completion = completion
        finishedAnimations = 0
        cancelledAnimations = 0
        animationFunction(0)(false)
    }

    public func cancel() {
        guard isPlaying else { return }
        for animation in propertyAnimations {
            animation.target?.nativeView?.layer.mask?.removeAllAnimations()
            animation.target?.nativeView?.layer.removeAllAnimations()
            animation.resetCallback?()
        }
    }

    private func finished(_ cancelled: Bool) {
        if playSequentially {
            if !cancelled { resolve() }
            return
        }
        if cancelled { cancelledAnimations += 1 } else { finishedAnimations += 1 }
        if cancelledAnimations > 0 && cancelledAnimations + finishedAnimations == propertyAnimations.count { return }
        if finishedAnimations == propertyAnimations.count { resolve() }
    }

    private func resolve() {
        isPlaying = false
        let completion = self.completion
        self.completion = nil
        completion?()
    }

    private func animationFunction(_ index: Int) -> (Bool) -> Void {
        { [self] cancelled in
            if cancelled {
                finished(true)
                return
            }
            let animation = propertyAnimations[index]
            if animation.curve == .spring {
                createSpringAnimation(index, animation)
            } else {
                createNativeAnimation(index, animation)
            }
        }
    }

    // MARK: Native animations

    private struct Arguments {
        var keyPath: String
        var fromValue: Any?
        var toValue: Any?
        var subProperties: [String]?
        var duration = 0.3
        var repeatCount: Float?
        var delay: Double?
    }

    static func setValue(_ target: View, _ name: String, _ value: Any?, fromKeyframe: Bool) {
        if fromKeyframe { target.setKeyframe(name, value) } else { target.set(name, value) }
    }

    /// `_getNativeAnimationArguments`.
    private func arguments(_ animation: PropertyAnimation) -> Arguments {
        var args = Arguments(keyPath: "")
        let fromKeyframe = self.fromKeyframe
        if let view = animation.target, let nativeView = view.nativeView {
            let set = { (name: String, value: Any?) in Animation.setValue(view, name, value, fromKeyframe: fromKeyframe) }
            switch animation.property {
            case .backgroundColor:
                let original = view.applied["backgroundColor"]
                animation.resetCallback = { set("backgroundColor", original) }
                args.keyPath = "backgroundColor"
                args.fromValue = nativeView.layer.backgroundColor
                if nativeView is UILabel { nativeView.backgroundColor = .clear }
                args.toValue = animation.color?.cgColor
            case .opacity:
                let original = view.applied["opacity"]
                animation.resetCallback = { set("opacity", original) }
                args.keyPath = "opacity"
                args.fromValue = nativeView.layer.opacity
                args.toValue = animation.opacity
            case .rotate:
                let original = (view.applied["rotateX"], view.applied["rotateY"], view.applied["rotate"])
                animation.resetCallback = {
                    set("rotate", original.2)
                    set("rotateX", original.0)
                    set("rotateY", original.1)
                }
                args.keyPath = "transform.rotation"
                args.subProperties = ["x", "y", "z"]
                args.fromValue = [
                    "x": nativeView.layer.value(forKeyPath: "transform.rotation.x") as Any,
                    "y": nativeView.layer.value(forKeyPath: "transform.rotation.y") as Any,
                    "z": nativeView.layer.value(forKeyPath: "transform.rotation.z") as Any,
                ]
                args.toValue = ["x": animation.point.x * .pi / 180, "y": animation.point.y * .pi / 180, "z": animation.point.z * .pi / 180]
            case .translate:
                let original = (view.applied["translateX"], view.applied["translateY"])
                animation.resetCallback = {
                    set("translateX", original.0)
                    set("translateY", original.1)
                }
                args.keyPath = "transform"
                args.fromValue = NSValue(caTransform3D: nativeView.layer.transform)
                args.toValue = NSValue(caTransform3D: CATransform3DTranslate(nativeView.layer.transform, CGFloat(animation.pair.x), CGFloat(animation.pair.y), 0))
            case .scale:
                if animation.pair.x == 0 { animation.pair.x = 0.001 }
                if animation.pair.y == 0 { animation.pair.y = 0.001 }
                let original = (view.applied["scaleX"], view.applied["scaleY"])
                animation.resetCallback = {
                    set("scaleX", original.0)
                    set("scaleY", original.1)
                }
                args.keyPath = "transform"
                args.fromValue = NSValue(caTransform3D: nativeView.layer.transform)
                args.toValue = NSValue(caTransform3D: CATransform3DScale(nativeView.layer.transform, CGFloat(animation.pair.x), CGFloat(animation.pair.y), 1))
            case .transform:
                args.fromValue = NSValue(caTransform3D: nativeView.layer.transform)
                let names = ["scaleX", "scaleY", "translateX", "translateY", "rotateX", "rotateY", "rotate"]
                let original = names.map { view.applied[$0] }
                animation.resetCallback = {
                    for (name, value) in zip(["translateX", "translateY", "scaleX", "scaleY", "rotateX", "rotateY", "rotate"],
                                             [original[2], original[3], original[0], original[1], original[4], original[5], original[6]]) {
                        set(name, value)
                    }
                }
                args.keyPath = "transform"
                args.toValue = NSValue(caTransform3D: Animation.affineTransform(animation))
            case .width, .height:
                let isHeight = animation.property == .height
                args.keyPath = "bounds"
                let parentExtent = Double(isHeight ? (view.parent?.measuredHeight ?? 0) : (view.parent?.measuredWidth ?? 0))
                let extent = Length(animation.length, default: .auto).toDevicePixels(auto: 0, parentAvailable: parentExtent) / Double(UIScreen.main.scale)
                let bounds = nativeView.layer.bounds
                args.fromValue = NSValue(cgRect: bounds)
                args.toValue = NSValue(cgRect: CGRect(x: bounds.origin.x, y: bounds.origin.y,
                                                      width: isHeight ? bounds.size.width : CGFloat(extent),
                                                      height: isHeight ? CGFloat(extent) : bounds.size.height))
                let name = isHeight ? "height" : "width"
                let original = view.applied[name]
                animation.resetCallback = { set(name, original) }
            }
        }
        if let duration = animation.duration { args.duration = duration / 1000 }
        if let delay = animation.delay, delay != 0 { args.delay = delay / 1000 }
        if let iterations = animation.iterations { args.repeatCount = iterations.isInfinite ? Float.greatestFiniteMagnitude : Float(iterations) }
        return args
    }

    /// `_createNativeAnimation`.
    private func createNativeAnimation(_ index: Int, _ animation: PropertyAnimation) {
        let args = arguments(animation)
        let nativeAnimation: CAAnimation = args.subProperties != nil ? groupAnimation(args, animation) : basicAnimation(args, animation)
        let delegate = AnimationDelegate(animation, fromKeyframe: fromKeyframe) { cancelled in self.finished(cancelled) }
        nativeAnimation.delegate = delegate
        if let nativeView = animation.target?.nativeView {
            nativeView.layer.add(nativeAnimation, forKey: args.keyPath)
            if args.keyPath == "bounds", let rect = (args.toValue as? NSValue)?.cgRectValue, let view = animation.target {
                animateNestedLayerSize(view, nativeView, rect, args, animation)
            }
        }
        if index + 1 < propertyAnimations.count {
            let next = animationFunction(index + 1)
            if !playSequentially { next(false) } else { delegate.next = { next(false) } }
        }
    }

    private func groupAnimation(_ args: Arguments, _ animation: PropertyAnimation) -> CAAnimationGroup {
        let group = CAAnimationGroup()
        group.duration = args.duration
        if let repeatCount = args.repeatCount { group.repeatCount = repeatCount }
        if let delay = args.delay { group.beginTime = CACurrentMediaTime() + delay }
        if let timing = animation.curve?.timingFunction { group.timingFunction = timing }
        let from = args.fromValue as? [String: Any] ?? [:]
        let to = args.toValue as? [String: Double] ?? [:]
        group.animations = (args.subProperties ?? []).map { property in
            let basic = CABasicAnimation(keyPath: "\(args.keyPath).\(property)")
            basic.fromValue = from[property]
            basic.toValue = to[property]
            basic.duration = 0
            if let timing = animation.curve?.timingFunction { basic.timingFunction = timing }
            return basic
        }
        return group
    }

    private func basicAnimation(_ args: Arguments, _ animation: PropertyAnimation) -> CABasicAnimation {
        let basic = CABasicAnimation(keyPath: args.keyPath)
        basic.fromValue = args.fromValue
        basic.toValue = args.toValue
        basic.duration = args.duration
        if let repeatCount = args.repeatCount { basic.repeatCount = repeatCount }
        if let delay = args.delay { basic.beginTime = CACurrentMediaTime() + delay }
        if let timing = animation.curve?.timingFunction { basic.timingFunction = timing }
        return basic
    }

    /// `animateNestedLayerSizeUsingBasicAnimation`: a uniform corner radius follows the size.
    private func animateNestedLayerSize(_ view: View, _ nativeView: UIView, _ bounds: CGRect, _ args: Arguments, _ animation: PropertyAnimation) {
        guard nativeView.layer.cornerRadius != 0 else { return }
        let radius = CGFloat(LayoutHelper.toDeviceIndependentPixels(view.background.borderTopLeftRadius))
        var radiusArgs = args
        radiusArgs.keyPath = "cornerRadius"
        radiusArgs.fromValue = nativeView.layer.cornerRadius
        radiusArgs.toValue = min(min(bounds.width / 2, bounds.height / 2), radius)
        nativeView.layer.add(basicAnimation(radiusArgs, animation), forKey: "cornerRadius")
    }

    /// `_createNativeSpringAnimation`: UIView spring animation of opacity, size and merged transforms.
    private func createSpringAnimation(_ index: Int, _ animation: PropertyAnimation) {
        let args = arguments(animation)
        var next: ((Bool) -> Void)?
        if index + 1 < propertyAnimations.count {
            let callback = animationFunction(index + 1)
            if !playSequentially { callback(false) } else { next = callback }
        }
        guard let view = animation.target, let nativeView = view.nativeView else { return }
        UIView.animate(withDuration: args.duration, delay: args.delay ?? 0, usingSpringWithDamping: 0.2, initialSpringVelocity: 0, options: .curveLinear, animations: {
            if let repeatCount = args.repeatCount { UIView.setAnimationRepeatCount(repeatCount) }
            switch animation.property {
            case .backgroundColor: view.set("backgroundColor", args.toValue)
            case .opacity: view.set("opacity", args.toValue)
            case .height, .width:
                nativeView.layer.setValue(args.toValue, forKeyPath: args.keyPath)
                view.redrawNativeBackground()
            case .transform:
                let original = nativeView.layer.transform
                nativeView.layer.setValue(args.toValue, forKeyPath: args.keyPath)
                animation.resetCallback = { nativeView.layer.transform = original }
            default: break
            }
        }, completion: { didFinish in
            if didFinish {
                if animation.property == .transform {
                    if let t = animation.transformTranslate {
                        view.set("translateX", t.x)
                        view.set("translateY", t.y)
                    }
                    if let s = animation.transformScale {
                        view.set("scaleX", s.x)
                        view.set("scaleY", s.y)
                    }
                }
            } else {
                animation.resetCallback?()
            }
            self.finished(!didFinish)
            if didFinish { next?(false) }
        })
    }

    private static func affineTransform(_ animation: PropertyAnimation) -> CATransform3D {
        var result = CATransform3DIdentity
        if let t = animation.transformTranslate { result = CATransform3DTranslate(result, CGFloat(t.x), CGFloat(t.y), 0) }
        if let s = animation.transformScale { result = CATransform3DScale(result, CGFloat(s.x == 0 ? 0.001 : s.x), CGFloat(s.y == 0 ? 0.001 : s.y), 1) }
        return result
    }

    // MARK: Property animations (animation-common)

    /// `_createPropertyAnimations`: one per animated property, in this order.
    static func createPropertyAnimations(_ definition: AnimationDefinition) -> [PropertyAnimation] {
        let target = definition.target
        var result: [PropertyAnimation] = []
        func add(_ property: PropertyAnimation.Property, _ fill: (PropertyAnimation) -> Void) {
            let animation = PropertyAnimation(target: target, property: property, from: definition)
            fill(animation)
            result.append(animation)
        }
        if let opacity = definition.opacity { add(.opacity) { $0.opacity = opacity } }
        if let color = definition.backgroundColor { add(.backgroundColor) { $0.color = color } }
        if let translate = definition.translate { add(.translate) { $0.pair = translate } }
        if let scale = definition.scale { add(.scale) { $0.pair = scale } }
        if let rotate = definition.rotate { add(.rotate) { $0.point = rotate } }
        if let height = definition.height { add(.height) { $0.length = height } }
        if let width = definition.width { add(.width) { $0.length = width } }
        return result
    }

    /// `_mergeAffineTransformAnimations`: translate and scale animations that
    /// share target and timing become one transform animation.
    static func mergeAffineTransformAnimations(_ animations: [PropertyAnimation]) -> [PropertyAnimation] {
        var result: [PropertyAnimation] = []
        for (i, animation) in animations.enumerated() where !animation.skip {
            guard animation.isAffineTransform else {
                result.append(animation)
                continue
            }
            var definition = AnimationDefinition(target: animation.target)
            definition.duration = animation.duration
            definition.delay = animation.delay
            definition.iterations = animation.iterations
            definition.curve = animation.curve
            let merged = PropertyAnimation(target: animation.target, property: .transform, from: definition)
            merge(animation, into: merged)
            for other in animations[(i + 1)...] where animation.canBeMerged(with: other) {
                merge(other, into: merged)
                other.skip = true
            }
            result.append(merged)
        }
        return result
    }

    private static func merge(_ animation: PropertyAnimation, into merged: PropertyAnimation) {
        switch animation.property {
        case .translate: merged.transformTranslate = animation.pair
        case .scale: merged.transformScale = animation.pair
        case .transform:
            if let t = animation.transformTranslate { merged.transformTranslate = t }
            if let s = animation.transformScale { merged.transformScale = s }
        default: break
        }
    }
}

extension View {
    /// `view.animate(definition)`.
    @discardableResult
    public func animate(_ configure: (inout AnimationDefinition) -> Void, completion: (() -> Void)? = nil) -> Animation {
        var definition = AnimationDefinition(target: self)
        configure(&definition)
        let animation = Animation([definition])
        animation.play(completion)
        return animation
    }
}

// MARK: Keyframe animations (keyframe-animation, css-animation-parser)

/// `KeyframeAnimationInfo`: one animation a CSS rule declares; times in milliseconds.
struct KeyframeAnimationInfo {
    var name = ""
    var duration = 0.3
    var delay = 0.0
    var iterations = 1.0
    var curve = AnimationCurve.ease
    var isForwards = false
    var isReverse = false

    /// `CssAnimationParser.keyframeAnimationsFromCSSDeclarations`.
    static func fromDeclarations(_ declarations: [(name: String, value: String)]) -> [KeyframeAnimationInfo]? {
        var animations: [KeyframeAnimationInfo] = []
        var current: Int?
        for (property, value) in declarations {
            if property == "animation" {
                animations += fromShorthand(value)
            } else if property.hasPrefix("animation-"), handles(property) {
                if current == nil {
                    animations.append(KeyframeAnimationInfo())
                    current = animations.count - 1
                }
                animations[current!].apply(property, value)
            }
        }
        return animations.isEmpty ? nil : animations
    }

    private static func handles(_ property: String) -> Bool {
        ["animation-name", "animation-duration", "animation-delay", "animation-timing-function",
         "animation-iteration-count", "animation-direction", "animation-fill-mode"].contains(property)
    }

    /// `ANIMATION_PROPERTY_HANDLERS`.
    mutating func apply(_ property: String, _ value: String) {
        switch property {
        case "animation-name": name = value.replacingOccurrences(of: "'", with: "").replacingOccurrences(of: "\"", with: "")
        case "animation-duration": duration = KeyframeAnimationInfo.time(value)
        case "animation-delay": delay = KeyframeAnimationInfo.time(value)
        case "animation-timing-function": curve = AnimationCurve(css: value) ?? .ease
        case "animation-iteration-count": iterations = value == "infinite" ? .infinity : (parseFloat(value) ?? .nan)
        case "animation-direction": isReverse = value == "reverse"
        case "animation-fill-mode": isForwards = value == "forwards" || value == "both"
        default: break
        }
    }

    /// `timeConverter`: milliseconds, seconds unless the value says `ms`.
    static func time(_ value: String) -> Double {
        var result = parseFloat(value) ?? .nan
        if !value.contains("ms") { result *= 1000 }
        return result.isNaN ? .nan : max(0, result)
    }

    /// `keyframeAnimationsFromCSSProperty`: each comma-separated animation's parts recognized by shape.
    static func fromShorthand(_ value: String) -> [KeyframeAnimationInfo] {
        guard !value.trimmingCharacters(in: .whitespaces).isEmpty else { return [] }
        func matches(_ s: String, _ pattern: String) -> Bool { s.range(of: pattern, options: .regularExpression) != nil }
        var result: [KeyframeAnimationInfo] = []
        for parsed in splitOutsideParentheses(value, ",") {
            var info = KeyframeAnimationInfo()
            let parts = splitOutsideParentheses(parsed.trimmingCharacters(in: .whitespaces), " ")
            let times = parts.filter { matches($0, #"\dm?s$"#) }
            let duration = times.first, delay = times.count > 1 ? times[1] : nil
            let timing = parts.first { matches($0, "ease|linear|ease-in|ease-out|ease-in-out|spring|cubic-bezier") }
            let iterationCount = parts.first { matches($0, #"infinite|[\d.]+$"#) }
            let direction = parts.first { matches($0, "normal|reverse|alternate|alternate-reverse") }
            let fillMode = parts.first { matches($0, "none|forwards|backwards|both") }
            let playState = parts.first { matches($0, "running|paused") }
            let consumed = [duration, delay, timing, iterationCount, direction, fillMode, playState].compactMap { $0 }
            let name = parts.first { !consumed.contains($0) }
            if let duration { info.apply("animation-duration", duration) }
            if let delay { info.apply("animation-delay", delay) }
            if let timing { info.apply("animation-timing-function", timing) }
            if let iterationCount { info.apply("animation-iteration-count", iterationCount) }
            if let direction { info.apply("animation-direction", direction) }
            if let fillMode { info.apply("animation-fill-mode", fillMode) }
            if let name { info.apply("animation-name", name) }
            result.append(info)
        }
        return result
    }

    /// JavaScript's `split(/<sep>(?![^(]*\))/)`: separators inside parentheses do not split.
    private static func splitOutsideParentheses(_ s: String, _ separator: Character) -> [String] {
        var parts: [String] = []
        var current = ""
        let chars = Array(s)
        for (i, c) in chars.enumerated() {
            if c == separator {
                let rest = chars[(i + 1)...]
                let close = rest.firstIndex(of: ")")
                let open = rest.firstIndex(of: "(")
                let insideParentheses = close != nil && (open == nil || open! > close!)
                if !insideParentheses {
                    parts.append(current)
                    current = ""
                    continue
                }
            }
            current.append(c)
        }
        parts.append(current)
        return parts
    }
}

/// A `@keyframes` block as written: its selectors (`from`, `50%`) and declarations.
struct KeyframeRule {
    var values: [String]
    var declarations: [(name: String, value: String)]
}

/// A parsed keyframe: its time as a fraction, its animated values and curve.
struct KeyframeInfo {
    var duration: Double
    var declarations: [(property: String, value: Any)] = []
    var curve: AnimationCurve?

    /// `CssAnimationParser.keyframesArrayFromCSS`.
    static func parse(_ rules: [KeyframeRule]) -> [KeyframeInfo] {
        var byTime: [Double: KeyframeInfo] = [:]
        for rule in rules {
            let declarations = parseDeclarations(rule.declarations)
            for value in rule.values {
                var time: Double
                switch value {
                case "from": time = 0
                case "to": time = 1
                default:
                    time = (parseFloat(value) ?? .nan) / 100
                    if time < 0 { time = 0 }
                    if time > 100 { time = 100 }
                }
                var current = byTime[time] ?? KeyframeInfo(duration: time)
                for declaration in rule.declarations where declaration.name == "animation-timing-function" {
                    current.curve = AnimationCurve(css: declaration.value) ?? .ease
                }
                current.declarations += declarations
                byTime[time] = current
            }
        }
        return byTime.values.sorted { $0.duration < $1.duration }
    }

    /// `parseKeyframeDeclarations`: animatable properties converted, `transform` as translate, rotate and scale.
    static func parseDeclarations(_ declarations: [(name: String, value: String)]) -> [(property: String, value: Any)] {
        var result: [(property: String, value: Any)] = []
        func put(_ property: String, _ value: Any) {
            if let index = result.firstIndex(where: { $0.property == property }) { result[index].value = value } else { result.append((property, value)) }
        }
        for (name, raw) in declarations {
            let value = raw.replacingOccurrences(of: "!important", with: "").trimmingCharacters(in: .whitespaces)
            switch name {
            case "opacity": put("opacity", parseFloat(value) ?? Double.nan)
            case "background-color", "backgroundColor": if let color = toColor(value) { put("backgroundColor", color) }
            case "width": put("width", value)
            case "height": put("height", value)
            case "transform":
                let t = Transformation(css: value)
                put("translate", t.translate)
                put("rotate", t.rotate)
                put("scale", t.scale)
            default: break
            }
        }
        return result
    }
}

/// `KeyframeAnimation`: a CSS animation played as a sequence of `Animation`s.
final class KeyframeAnimation {
    private var animations: [AnimationDefinition] = []
    private var delay = 0.0
    private var iterations = 1.0
    private var isForwards = false
    private var nativeAnimations: [Animation] = []
    private weak var target: View?
    private(set) var isPlaying = false

    /// `keyframeAnimationFromInfo`.
    init?(_ info: KeyframeAnimationInfo, _ keyframes: [KeyframeInfo]?) {
        guard let keyframes, !keyframes.isEmpty else { return nil }
        var definitions: [AnimationDefinition] = []
        var start = 0.0
        let ordered = info.isReverse ? Array(keyframes.reversed()) : keyframes
        for keyframe in ordered {
            var definition = AnimationDefinition(target: nil)
            for (property, value) in keyframe.declarations {
                switch property {
                case "opacity": definition.opacity = value as? Double
                case "backgroundColor": definition.backgroundColor = value as? UIColor
                case "translate": definition.translate = value as? (x: Double, y: Double)
                case "scale": definition.scale = value as? (x: Double, y: Double)
                case "rotate": definition.rotate = value as? (x: Double, y: Double, z: Double)
                case "width": definition.width = value
                case "height": definition.height = value
                default: break
                }
            }
            var duration = keyframe.duration
            if duration == 0 {
                duration = 0.01
            } else {
                duration = info.duration * duration - start
                start += duration
            }
            definition.duration = info.isReverse ? info.duration - duration : duration
            definition.curve = keyframe.curve
            definition.fromKeyframe = true
            definitions.append(definition)
        }
        if !info.isReverse && definitions.count > 1 {
            for index in stride(from: definitions.count - 1, to: 0, by: -1) where definitions[index - 1].curve != nil {
                definitions[index].curve = definitions[index - 1].curve
                definitions[index - 1].curve = nil
            }
        }
        for index in definitions.indices where definitions[index].curve == nil { definitions[index].curve = info.curve }
        animations = definitions
        delay = info.delay
        iterations = info.iterations
        isForwards = info.isForwards
    }

    func play(_ view: View) {
        guard !isPlaying else { return }
        isPlaying = true
        nativeAnimations = []
        target = view
        if delay != 0 {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay / 1000) { [weak self, weak view] in
                guard let view else { return }
                self?.animate(view, 0, self?.iterations ?? 0)
            }
        } else {
            animate(view, 0, iterations)
        }
    }

    func cancel() {
        guard isPlaying else { return }
        isPlaying = false
        for animation in nativeAnimations.reversed() where animation.isPlaying { animation.cancel() }
        if let target, let first = animations.first, !nativeAnimations.isEmpty { resetValues(target, first) }
        nativeAnimations = []
        self.target = nil
    }

    private func animate(_ view: View, _ index: Int, _ iterations: Double) {
        guard isPlaying else { return }
        if index == 0 {
            let first = animations[0]
            if let color = first.backgroundColor { view.setKeyframe("backgroundColor", color) }
            if let scale = first.scale {
                view.setKeyframe("scaleX", scale.x)
                view.setKeyframe("scaleY", scale.y)
            }
            if let translate = first.translate {
                view.setKeyframe("translateX", translate.x)
                view.setKeyframe("translateY", translate.y)
            }
            if let rotate = first.rotate {
                view.setKeyframe("rotateX", rotate.x)
                view.setKeyframe("rotateY", rotate.y)
                view.setKeyframe("rotate", rotate.z)
            }
            if let opacity = first.opacity { view.setKeyframe("opacity", opacity) }
            if let height = first.height { view.setKeyframe("height", height) }
            if let width = first.width { view.setKeyframe("width", width) }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.001) { [weak self, weak view] in
                guard let view else { return }
                self?.animate(view, 1, iterations)
            }
        } else if index >= animations.count {
            let remaining = iterations - 1
            if remaining > 0 {
                animate(view, 0, remaining)
            } else {
                if !isForwards, let last = animations.last { resetValues(view, last) }
                nativeAnimations = []
                isPlaying = false
                target = nil
            }
        } else {
            let animation: Animation
            if index - 1 < nativeAnimations.count {
                animation = nativeAnimations[index - 1]
            } else {
                var definition = animations[index]
                definition.target = view
                animation = Animation([definition])
                nativeAnimations.append(animation)
            }
            animation.play { [weak self, weak view] in
                guard let view else { return }
                self?.animate(view, index + 1, iterations)
            }
        }
    }

    /// `_resetAnimationValues`: only the z rotation is reset.
    private func resetValues(_ view: View, _ animation: AnimationDefinition) {
        if animation.backgroundColor != nil { view.setKeyframe("backgroundColor", nil) }
        if animation.scale != nil {
            view.setKeyframe("scaleX", nil)
            view.setKeyframe("scaleY", nil)
        }
        if animation.translate != nil {
            view.setKeyframe("translateX", nil)
            view.setKeyframe("translateY", nil)
        }
        if animation.rotate != nil { view.setKeyframe("rotate", nil) }
        if animation.opacity != nil { view.setKeyframe("opacity", nil) }
        if animation.height != nil { view.setKeyframe("height", nil) }
        if animation.width != nil { view.setKeyframe("width", nil) }
    }
}
