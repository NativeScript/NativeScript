import UIKit

/// A parsed CSS `transform`: styling/css-transform's `transformConverter`.
struct Transformation {
    var translate = (x: 0.0, y: 0.0)
    var rotate = (x: 0.0, y: 0.0, z: 0.0)
    var scale = (x: 1.0, y: 1.0)

    private enum Kind { case translate, rotate, scale }

    init() {}

    init(css text: String) {
        var parts: [(kind: Kind, value: Transformation)] = []
        // TRANSFORM_SPLITTER: `\s*(.+?)\((.*?)\)`, applied repeatedly.
        let regex = try! NSRegularExpression(pattern: #"\s*(.+?)\((.*?)\)"#)
        let ns = text as NSString
        for match in regex.matches(in: text, range: NSRange(location: 0, length: ns.length)) {
            let name = ns.substring(with: match.range(at: 1))
            let raw = ns.substring(with: match.range(at: 2))
            if let part = Transformation.part(name, raw) { parts.append(part) }
        }
        if text == "none" || text.isEmpty || parts.isEmpty { return }
        let kinds = parts.map(\.kind)
        if Set(kinds.map { "\($0)" }).count == kinds.count {
            for part in parts {
                switch part.kind {
                case .translate: translate = part.value.translate
                case .rotate: rotate = part.value.rotate
                case .scale: scale = part.value.scale
                }
            }
            return
        }
        let matrices = parts.map { Transformation.matrix($0.kind, $0.value) }
        let matrix = matrices.dropFirst().reduce(matrices[0], Transformation.multiplyAffine2d)
        self = Transformation.decompose2D([matrix[0], matrix[3], matrix[1], matrix[4], matrix[2], matrix[5]])
    }

    private static func part(_ name: String, _ raw: String) -> (kind: Kind, value: Transformation)? {
        let values = raw.split(separator: ",", omittingEmptySubsequences: false).map { parseFloat(String($0)) ?? .nan }
        let x = values[0]
        var y = values.count > 1 ? values[1] : nil
        var z = values.count > 2 ? values[2] : nil
        if name == "translate" {
            y = y ?? 0
        } else {
            y = y ?? x
            z = z ?? y
        }
        let degrees = raw.hasSuffix("rad") ? x * 180 / .pi : x
        var t = Transformation()
        switch name {
        case "scale", "scale3d": t.scale = (x, y!); return (.scale, t)
        case "scaleX": t.scale = (x, 1); return (.scale, t)
        case "scaleY": t.scale = (1, y!); return (.scale, t)
        case "translate", "translate3d": t.translate = (x, y!); return (.translate, t)
        case "translateX": t.translate = (x, 0); return (.translate, t)
        case "translateY": t.translate = (0, y!); return (.translate, t)
        case "rotate3d": t.rotate = (x, y!, z!); return (.rotate, t)
        case "rotateX": t.rotate = (degrees, 0, 0); return (.rotate, t)
        case "rotateY": t.rotate = (0, degrees, 0); return (.rotate, t)
        case "rotate": t.rotate = (0, 0, degrees); return (.rotate, t)
        default: return nil
        }
    }

    /// matrix/index's TRANSFORM_MATRIXES: 3x3 row-major, rotation about z only.
    private static func matrix(_ kind: Kind, _ t: Transformation) -> [Double] {
        switch kind {
        case .scale: return [t.scale.x, 0, 0, 0, t.scale.y, 0, 0, 0, 1]
        case .translate: return [1, 0, t.translate.x, 0, 1, t.translate.y, 0, 0, 1]
        case .rotate:
            let rad = t.rotate.z * .pi / 180
            return [cos(rad), -sin(rad), 0, sin(rad), cos(rad), 0, 0, 0, 1]
        }
    }

    private static func multiplyAffine2d(_ m1: [Double], _ m2: [Double]) -> [Double] {
        [m1[0] * m2[0] + m1[1] * m2[3], m1[0] * m2[1] + m1[1] * m2[4], m1[0] * m2[2] + m1[1] * m2[5] + m1[2],
         m1[3] * m2[0] + m1[4] * m2[3], m1[3] * m2[1] + m1[4] * m2[4], m1[3] * m2[2] + m1[4] * m2[5] + m1[5]]
    }

    private static func decompose2D(_ m: [Double]) -> Transformation {
        let (a, b, c, d, e, f) = (m[0], m[1], m[2], m[3], m[4], m[5])
        let determinant = a * d - b * c
        var t = Transformation()
        t.translate = (e.isNaN ? 0 : e, f.isNaN ? 0 : f)
        var rotate = 0.0
        if a != 0 || b != 0 {
            let r = (a * a + b * b).squareRoot()
            rotate = b > 0 ? acos(a / r) : -acos(a / r)
            t.scale = (r, determinant / r)
        } else if c != 0 || d != 0 {
            let r = (c * c + d * d).squareRoot()
            rotate = .pi / 2 - (d > 0 ? acos(-c / r) : -acos(c / r))
            t.scale = (determinant / r, r)
        }
        t.rotate = (0, 0, rotate * 180 / .pi)
        return t
    }
}

/// `transform` as the longhands it sets (style-properties `convertToTransform`).
func expandTransform(_ value: Any?) -> [(String, Any?)] {
    let t = Transformation(css: toText(value) ?? "none")
    return [
        ("translateX", t.translate.x), ("translateY", t.translate.y),
        ("scaleX", t.scale.x), ("scaleY", t.scale.y),
        ("rotate", t.rotate.z), ("rotateX", t.rotate.x), ("rotateY", t.rotate.y),
    ]
}

extension View {
    var translateX: Double { toDouble(applied["translateX"]) ?? 0 }
    var translateY: Double { toDouble(applied["translateY"]) ?? 0 }
    var scaleX: Double { toDouble(applied["scaleX"]) ?? 1 }
    var scaleY: Double { toDouble(applied["scaleY"]) ?? 1 }
    var rotate: Double { toDouble(applied["rotate"]) ?? 0 }
    var rotateX: Double { toDouble(applied["rotateX"]) ?? 0 }
    var rotateY: Double { toDouble(applied["rotateY"]) ?? 0 }
    var originX: Double { toDouble(applied["originX"]) ?? 0.5 }
    var originY: Double { toDouble(applied["originY"]) ?? 0.5 }

    /// view/index.ios `updateNativeTransform`: translate, then rotate, then scale.
    func updateNativeTransform() {
        guard let nativeView else { return }
        let scaleX = self.scaleX == 0 ? 1e-6 : self.scaleX
        let scaleY = self.scaleY == 0 ? 1e-6 : self.scaleY
        // The style default is 1000; only an explicit 0 falls back to 300.
        let perspective = toDouble(applied["perspective"] ?? 1000.0).flatMap { $0 == 0 ? nil : $0 } ?? 300
        var transform = CATransform3DIdentity
        if rotateX != 0 || rotateY != 0 { transform.m34 = CGFloat(-1 / perspective) }
        transform = CATransform3DTranslate(transform, CGFloat(translateX), CGFloat(translateY), 0)
        transform = View.applyRotateTransform(transform, rotateX, rotateY, rotate)
        transform = CATransform3DScale(transform, CGFloat(scaleX), CGFloat(scaleY), 1)
        if CATransform3DEqualToTransform(nativeView.layer.transform, transform) { return }
        let suspended = isPresentationLayerUpdateSuspended
        if !suspended { CATransaction.begin() }
        CATransaction.setDisableActions(true)
        nativeView.layer.transform = transform
        isTransformed = !CATransform3DEqualToTransform(nativeView.transform3D, CATransform3DIdentity)
        CATransaction.setDisableActions(false)
        if !suspended { CATransaction.commit() }
    }

    /// utils `applyRotateTransform`, angles in degrees.
    static func applyRotateTransform(_ transform: CATransform3D, _ x: Double, _ y: Double, _ z: Double) -> CATransform3D {
        var t = transform
        if x != 0 { t = CATransform3DRotate(t, CGFloat(x * .pi / 180), 1, 0, 0) }
        if y != 0 { t = CATransform3DRotate(t, CGFloat(y * .pi / 180), 0, 1, 0) }
        if z != 0 { t = CATransform3DRotate(t, CGFloat(z * .pi / 180), 0, 0, 1) }
        return t
    }

    /// view/index.ios `updateOriginPoint`: a new anchor point moves the frame, so it is set again.
    func updateOriginPoint() {
        guard let nativeView else { return }
        CATransaction.setDisableActions(true)
        nativeView.layer.anchorPoint = CGPoint(x: originX, y: originY)
        if let frame = takeCachedFrame() { setNativeViewFrame(nativeView, frame) }
        CATransaction.setDisableActions(false)
    }
}
